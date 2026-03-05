#!/usr/bin/env node

/**
 * update-indicators.js
 *
 * Fetches latest values from FRED® API and writes data/observations.json.
 * Also classifies FOMC statements via Claude API for QE/QT Pace and
 * Forward Guidance indicators.
 * Never modifies any .js source files.
 *
 * Usage:
 *   node update-indicators.js             # update all observations
 *   node update-indicators.js --dry-run   # show changes without writing
 *   node update-indicators.js --fomc-only # only run FOMC classification
 *
 * Requires: FRED_API_KEY in .env file
 * Optional: ANTHROPIC_API_KEY in .env file (for FOMC classification)
 *
 * This product uses the FRED® API but is not endorsed or certified
 * by the Federal Reserve Bank of St. Louis.
 */

const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────
const OBSERVATIONS_FILE = path.join(__dirname, 'data', 'observations.json');
const FOMC_CACHE_FILE = path.join(__dirname, 'data', 'fomc-cache.json');
const ENV_FILE = path.join(__dirname, '.env');
const FRED_BASE = 'https://api.stlouisfed.org/fred';
const DRY_RUN = process.argv.includes('--dry-run');
const FOMC_ONLY = process.argv.includes('--fomc-only');

// Import indicator definitions directly (no regex parsing needed)
const { INDICATORS } = require('./indicators.js');

// Rate limiting: max 1 request per 200ms to be respectful
const REQUEST_DELAY_MS = 200;

// ── FOMC Config ─────────────────────────────────────────────────
const FED_RSS_URL = 'https://www.federalreserve.gov/feeds/press_all.xml';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-haiku-4-5-20241022';

// FOMC statement must contain ALL of these (case-insensitive)
const FOMC_STATEMENT_KEYWORDS = ['fomc', 'statement'];
// FOMC statement must NOT contain ANY of these (case-insensitive)
const FOMC_EXCLUDE_KEYWORDS = ['minutes', 'longer-run goals'];

const FOMC_CLASSIFICATION_PROMPT = `
You are a Federal Reserve analyst. Analyze the FOMC statement below and return ONLY a JSON object with no preamble, no markdown, no explanation.

Classify the following fields:

1. "qt_pace": The Fed's balance sheet / quantitative tightening/easing stance.
   Must be exactly one of:
   - "QE Active"         // Fed is actively expanding balance sheet
   - "QT Active"         // Fed is actively reducing balance sheet
   - "QT Slowing"        // Fed announced a reduced pace of runoff
   - "QT Ended"          // Fed has stopped balance sheet reduction
   - "Neutral / Pause"   // No active QE or QT

2. "forward_guidance": The Fed's implied bias for future rate decisions.
   Must be exactly one of:
   - "Hiking Bias"        // Language suggests further rate increases likely
   - "Hold / Data-dep."   // No clear directional commitment; watching data
   - "Cutting Bias"       // Language suggests rate cuts are being considered
   - "Easing Actively"    // Fed is in an active cutting cycle

3. "confidence": Your confidence in these classifications.
   Must be exactly one of: "High" | "Medium" | "Low"

4. "rationale": A single sentence (max 25 words) explaining the key phrase(s) that drove your classification.

5. "statement_date": The date of this FOMC statement in YYYY-MM-DD format.

Return ONLY this JSON structure:
{
  "qt_pace": "...",
  "forward_guidance": "...",
  "confidence": "...",
  "rationale": "...",
  "statement_date": "..."
}

FOMC STATEMENT:
{{STATEMENT_TEXT}}
`;

// ── Load API keys from .env ─────────────────────────────────────
function loadApiKey() {
    if (!fs.existsSync(ENV_FILE)) {
        console.error('❌ .env file not found. Create it with: FRED_API_KEY=your_key_here');
        process.exit(1);
    }
    const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
    const match = envContent.match(/FRED_API_KEY=(.+)/);
    if (!match || match[1].trim() === 'your_key_here') {
        console.error('❌ Set your FRED API key in .env: FRED_API_KEY=<your_key>');
        console.error('   Register at: https://fred.stlouisfed.org/docs/api/api_key.html');
        process.exit(1);
    }
    return match[1].trim();
}

function loadAnthropicKey() {
    if (!fs.existsSync(ENV_FILE)) return null;
    const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
    const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
    if (!match || match[1].trim() === 'your_key_here') return null;
    return match[1].trim();
}

// ── HTTP helpers ────────────────────────────────────────────────
async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
    }
    return response.json();
}

async function fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
    }
    return response.text();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── FOMC Statement Classification ───────────────────────────────

/**
 * Poll the Fed RSS feed and return the most recent FOMC statement entry.
 * Returns { url, pubDate } or null if none found.
 */
async function fetchFomcStatementFromFeed() {
    const xml = await fetchText(FED_RSS_URL);

    // Simple XML parsing — extract <item> blocks
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        const title = (block.match(/<title>(.*?)<\/title>/) || [])[1] || '';
        const link = (block.match(/<link>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*<\/link>/) || [])[1] || '';
        const pubDate = (block.match(/<pubDate>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*<\/pubDate>/) || [])[1] || '';
        items.push({ title, link: link.trim(), pubDate: pubDate.trim() });
    }

    // Filter for FOMC statements (not minutes or other monetary policy releases)
    for (const item of items) {
        const titleLower = item.title.toLowerCase();
        const hasAllKeywords = FOMC_STATEMENT_KEYWORDS.every(kw => titleLower.includes(kw));
        const hasExcluded = FOMC_EXCLUDE_KEYWORDS.some(kw => titleLower.includes(kw));

        if (hasAllKeywords && !hasExcluded) {
            return { url: item.link, pubDate: item.pubDate };
        }
    }

    return null;
}

/**
 * Fetch the full FOMC statement HTML page and extract the statement body text.
 */
async function fetchStatementText(url) {
    const html = await fetchText(url);

    // The statement text sits inside <div id="article"> ... </div>
    // Extract the article div content
    const articleMatch = html.match(/<div[^>]*id=["']article["'][^>]*>([\s\S]*?)<\/div>/i);
    let text = articleMatch ? articleMatch[1] : html;

    // Strip HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    // Decode common HTML entities
    text = text.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&ndash;/g, '–')
        .replace(/&mdash;/g, '—')
        .replace(/&#8209;/g, '‑')
        .replace(/&#8211;/g, '–')
        .replace(/&#8212;/g, '—');
    // Collapse whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Trim to the statement body (before "For media inquiries" or "Implementation Note")
    const cutoff = text.search(/For media inquiries|Implementation Note issued/i);
    if (cutoff > 0) text = text.substring(0, cutoff).trim();

    // Remove the leading "For release at ..." line if present
    text = text.replace(/^For release at[^.]*\.?\s*/i, '').trim();

    return text;
}

/**
 * Classify an FOMC statement via the Anthropic Claude API.
 * Returns the parsed JSON classification object.
 */
async function classifyFomcStatement(statementText, anthropicKey) {
    const prompt = FOMC_CLASSIFICATION_PROMPT.replace('{{STATEMENT_TEXT}}', statementText);

    const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: ANTHROPIC_MODEL,
            max_tokens: 256,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    // Parse JSON from response (handle possible markdown wrapping)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const classification = JSON.parse(jsonStr);

    // Validate enum values
    const validQtPace = ['QE Active', 'QT Active', 'QT Slowing', 'QT Ended', 'Neutral / Pause'];
    const validGuidance = ['Hiking Bias', 'Hold / Data-dep.', 'Cutting Bias', 'Easing Actively'];

    if (!validQtPace.includes(classification.qt_pace)) {
        console.warn(`   ⚠️  Unexpected qt_pace value: "${classification.qt_pace}"`);
    }
    if (!validGuidance.includes(classification.forward_guidance)) {
        console.warn(`   ⚠️  Unexpected forward_guidance value: "${classification.forward_guidance}"`);
    }

    return classification;
}

/**
 * Run the FOMC classification pipeline.
 * Returns { classification, isNew } or null if skipped.
 */
async function runFomcClassification(anthropicKey) {
    // Load existing cache
    let cache = null;
    if (fs.existsSync(FOMC_CACHE_FILE)) {
        try {
            cache = JSON.parse(fs.readFileSync(FOMC_CACHE_FILE, 'utf-8'));
        } catch (e) {
            console.warn('   ⚠️  Could not parse fomc-cache.json, will re-classify');
        }
    }

    // Check RSS feed for latest FOMC statement
    console.log('   🏛️  FOMC: Checking RSS feed for new statements...');
    const latest = await fetchFomcStatementFromFeed();

    if (!latest) {
        console.log('   🏛️  FOMC: No FOMC statement found in RSS feed');
        return cache ? { classification: cache.classification, isNew: false } : null;
    }

    // Check if this is a new statement
    if (cache && cache.lastStatementUrl === latest.url) {
        console.log(`   🏛️  FOMC: No new statement (cached: ${cache.lastStatementDate})`);
        return { classification: cache.classification, isNew: false };
    }

    // New statement detected — classify it
    console.log(`   🏛️  FOMC: New statement found! ${latest.url}`);
    console.log('   🏛️  FOMC: Fetching statement text...');
    const statementText = await fetchStatementText(latest.url);

    if (!statementText || statementText.length < 100) {
        console.error('   ❌ FOMC: Could not extract statement text (too short or empty)');
        return cache ? { classification: cache.classification, isNew: false } : null;
    }

    console.log(`   🏛️  FOMC: Extracted ${statementText.length} chars. Classifying via Claude...`);
    const classification = await classifyFomcStatement(statementText, anthropicKey);

    console.log(`   🏛️  FOMC: Classification result:`);
    console.log(`     QT Pace:          ${classification.qt_pace}`);
    console.log(`     Forward Guidance: ${classification.forward_guidance}`);
    console.log(`     Confidence:       ${classification.confidence}`);
    console.log(`     Rationale:        ${classification.rationale}`);

    // Update cache
    if (!DRY_RUN) {
        const newCache = {
            lastStatementDate: classification.statement_date,
            lastStatementUrl: latest.url,
            classification,
        };
        fs.writeFileSync(FOMC_CACHE_FILE, JSON.stringify(newCache, null, 2) + '\n', 'utf-8');
        console.log('   🏛️  FOMC: Cache updated');
    }

    return { classification, isNew: true };
}

// ── FRED API calls ──────────────────────────────────────────────

/**
 * Get latest observation for a single FRED series.
 */
async function getLatestObservation(seriesId, apiKey, units = 'lin') {
    const url = `${FRED_BASE}/series/observations?series_id=${seriesId}&sort_order=desc&limit=1&units=${units}&api_key=${apiKey}&file_type=json`;
    const data = await fetchJSON(url);
    if (!data.observations || data.observations.length === 0) return null;
    const obs = data.observations[0];
    return {
        value: obs.value,
        date: obs.date,
    };
}

/**
 * Get series metadata (to check for copyright in notes).
 */
async function getSeriesMetadata(seriesId, apiKey) {
    const url = `${FRED_BASE}/series?series_id=${seriesId}&api_key=${apiKey}&file_type=json`;
    const data = await fetchJSON(url);
    if (!data.seriess || data.seriess.length === 0) return null;
    return data.seriess[0];
}

// ── Value formatting ────────────────────────────────────────────

/**
 * Format a raw FRED value according to the indicator's unit type.
 */
function formatValue(rawValue, indicator) {
    const val = parseFloat(rawValue);
    if (isNaN(val)) return rawValue;

    const unit = indicator.unit;

    switch (unit) {
        case 'percent-range':
            // Fed Funds Target — handled specially (needs both upper and lower)
            return null; // Signal that caller should handle

        case 'percent':
            return `${val.toFixed(2)}%`;

        case 'percent-yoy':
            return `${val >= 0 ? '+' : ''}${val.toFixed(1)}% YoY`;

        case 'percent-mom':
            return `${val >= 0 ? '+' : ''}${val.toFixed(1)}% MoM`;

        case 'percent-qoq': {
            return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
        }

        case 'millions-saar':
            // Housing starts in thousands SAAR from FRED
            return `${(val / 1000).toFixed(2)}M SAAR`;

        case 'basis-points':
            // ICE BofA spread comes as percentage points
            return `IG Spread ${Math.round(val * 100)}bp`;

        case 'millions':
            // JOLTS in thousands from FRED
            return `${(val / 1000).toFixed(1)}M`;

        case 'usd':
            return `$${val.toFixed(2)}`;

        case 'index':
            return val >= 1000
                ? Math.round(val).toLocaleString('en-US')
                : val.toFixed(2);

        default:
            return val.toString();
    }
}

/**
 * Format FRED date (YYYY-MM-DD) to display format.
 */
function formatPeriod(dateStr, frequency) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (frequency === 'quarterly') {
        const quarter = Math.ceil(month / 3);
        return `Q${quarter} ${year}`;
    }

    if (frequency === 'monthly') {
        return `${months[month - 1]} ${year}`;
    }

    // Daily/weekly — full date
    return `${months[month - 1]} ${day}, ${year}`;
}

// ── Main update logic ───────────────────────────────────────────

async function main() {
    const apiKey = FOMC_ONLY ? null : loadApiKey();
    const anthropicKey = loadAnthropicKey();
    console.log(`\n📊 Indicator Update ${DRY_RUN ? '(DRY RUN) ' : ''}${FOMC_ONLY ? '(FOMC ONLY) ' : ''}`);
    console.log(`   ${new Date().toISOString()}\n`);

    // Step 1: Load existing observations (if any)
    let existingData = { lastUpdated: null, observations: {} };
    if (fs.existsSync(OBSERVATIONS_FILE)) {
        try {
            existingData = JSON.parse(fs.readFileSync(OBSERVATIONS_FILE, 'utf-8'));
        } catch (e) {
            console.warn('⚠️  Could not parse existing observations.json, starting fresh');
        }
    }

    const newObservations = { ...existingData.observations };
    const changes = [];
    const copyrightWarnings = [];

    // Step 2: Identify FRED-linked indicators from imported definitions
    const fredIndicators = [];
    if (!FOMC_ONLY) {
        for (const [id, ind] of Object.entries(INDICATORS)) {
            const seriesId = ind.schedule?.fredSeriesId;
            if (seriesId) {
                fredIndicators.push({ id, seriesId, indicator: ind });
            }
        }
        console.log(`   Found ${fredIndicators.length} FRED-linked indicators\n`);
    }

    // Step 3: Fetch and update each FRED indicator
    if (!FOMC_ONLY) {
        for (const { id, seriesId, indicator } of fredIndicators) {
            const frequency = indicator.schedule?.frequency || 'daily';

            try {
                let newValue, newPeriod;

                if (Array.isArray(seriesId)) {
                    // Fed Funds Target — fetch both upper and lower
                    const upper = await getLatestObservation(seriesId[0], apiKey);
                    await sleep(REQUEST_DELAY_MS);
                    const lower = await getLatestObservation(seriesId[1], apiKey);
                    await sleep(REQUEST_DELAY_MS);

                    if (upper && lower) {
                        const upperVal = parseFloat(upper.value).toFixed(2);
                        const lowerVal = parseFloat(lower.value).toFixed(2);
                        newValue = `${lowerVal}\u2013${upperVal}%`;
                        newPeriod = formatPeriod(upper.date, frequency);
                    }
                } else {
                    // Single series
                    const units = indicator.schedule?.fredUnits || 'lin';
                    const obs = await getLatestObservation(seriesId, apiKey, units);
                    await sleep(REQUEST_DELAY_MS);

                    if (obs && obs.value !== '.') {
                        newValue = formatValue(obs.value, indicator);
                        newPeriod = formatPeriod(obs.date, frequency);

                        if (newValue === null) continue; // Skip if special handling needed
                    }

                    // Check for copyright (just log warnings)
                    const meta = await getSeriesMetadata(seriesId, apiKey);
                    await sleep(REQUEST_DELAY_MS);
                    if (meta && meta.notes && meta.notes.toLowerCase().includes('copyright')) {
                        copyrightWarnings.push({ id, seriesId, source: meta.title });
                    }
                }

                if (newValue && newPeriod) {
                    const oldObs = existingData.observations[id];
                    const oldValue = oldObs?.value;
                    const oldPeriod = oldObs?.period;

                    if (oldValue !== newValue || oldPeriod !== newPeriod) {
                        changes.push({
                            id,
                            oldValue: oldValue || '(none)',
                            newValue,
                            oldPeriod: oldPeriod || '(none)',
                            newPeriod,
                        });
                    }

                    newObservations[id] = { value: newValue, period: newPeriod };
                }
            } catch (err) {
                console.error(`   ❌ ${id}: ${err.message}`);
            }
        }
    } // end FRED indicators

    // Step 3b: FOMC Statement Classification
    if (anthropicKey) {
        try {
            const fomcResult = await runFomcClassification(anthropicKey);
            if (fomcResult) {
                const { classification, isNew } = fomcResult;
                const dateParts = classification.statement_date.split('-');
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const fomcPeriod = `${months[parseInt(dateParts[1]) - 1]} ${parseInt(dateParts[2])}, ${dateParts[0]}`;

                const fomcUpdates = {
                    'qe-qt-pace': { value: classification.qt_pace, period: fomcPeriod },
                    'forward-guidance': { value: classification.forward_guidance, period: fomcPeriod },
                };

                for (const [id, obs] of Object.entries(fomcUpdates)) {
                    const oldObs = existingData.observations[id];
                    if (oldObs?.value !== obs.value || oldObs?.period !== obs.period) {
                        changes.push({
                            id,
                            oldValue: oldObs?.value || '(none)',
                            newValue: obs.value,
                            oldPeriod: oldObs?.period || '(none)',
                            newPeriod: obs.period,
                        });
                    }
                    newObservations[id] = obs;
                }
            }
        } catch (err) {
            console.error(`   ❌ FOMC classification error: ${err.message}`);
        }
    } else {
        console.log('   🏛️  FOMC: No ANTHROPIC_API_KEY set, skipping FOMC classification');
    }

    // Step 4: Report
    console.log('\n' + '─'.repeat(60));

    if (changes.length > 0) {
        console.log(`\n✅ ${changes.length} indicator(s) updated:\n`);
        for (const c of changes) {
            console.log(`   ${c.id}`);
            console.log(`     Value:  ${c.oldValue} → ${c.newValue}`);
            console.log(`     Period: ${c.oldPeriod} → ${c.newPeriod}`);
        }
    } else {
        console.log('\n✅ All indicators are up to date.');
    }

    if (copyrightWarnings.length > 0) {
        console.log('\n⚠️  Copyright notices detected:');
        for (const w of copyrightWarnings) {
            console.log(`   ${w.id} (${w.seriesId}): ${w.source}`);
        }
    }

    // Step 5: Write if not dry run
    if (changes.length > 0 && !DRY_RUN) {
        const outputData = {
            lastUpdated: new Date().toISOString(),
            observations: newObservations,
        };

        // Ensure data directory exists
        const dataDir = path.dirname(OBSERVATIONS_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(OBSERVATIONS_FILE, JSON.stringify(outputData, null, 2) + '\n', 'utf-8');
        console.log(`\n💾 Written to ${path.relative(__dirname, OBSERVATIONS_FILE)}`);
    } else if (DRY_RUN && changes.length > 0) {
        console.log('\n🔒 Dry run — no files modified.');
    }

    console.log('');
}

// ── Run ─────────────────────────────────────────────────────────
main().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
