#!/usr/bin/env node

/**
 * update-indicators.js
 *
 * Fetches latest values from FRED® API and updates indicators.js.
 * Uses fred/series/updates as a pre-filter to skip unchanged series.
 *
 * Usage:
 *   node update-indicators.js             # update indicators.js
 *   node update-indicators.js --dry-run   # show changes without writing
 *
 * Requires: FRED_API_KEY in .env file
 *
 * This product uses the FRED® API but is not endorsed or certified
 * by the Federal Reserve Bank of St. Louis.
 */

const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────────
const INDICATORS_FILE = path.join(__dirname, 'indicators.js');
const ENV_FILE = path.join(__dirname, '.env');
const FRED_BASE = 'https://api.stlouisfed.org/fred';
const DRY_RUN = process.argv.includes('--dry-run');

// Rate limiting: max 1 request per 200ms to be respectful
const REQUEST_DELAY_MS = 200;

// ── Load API key from .env ──────────────────────────────────────
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

// ── HTTP fetch (Node.js built-in) ───────────────────────────────
async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`);
    }
    return response.json();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── FRED API calls ──────────────────────────────────────────────

/**
 * Get recently updated series from FRED (last 2 weeks).
 * Returns a Set of series IDs that had updates.
 */
async function getRecentlyUpdatedSeries(apiKey) {
    const url = `${FRED_BASE}/series/updates?api_key=${apiKey}&file_type=json&filter_value=macro&limit=1000`;
    try {
        const data = await fetchJSON(url);
        const ids = new Set(data.seriess.map(s => s.id));
        return ids;
    } catch (err) {
        console.warn('⚠️  Could not fetch series/updates, will check all series:', err.message);
        return null; // null means "check everything"
    }
}

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
function formatValue(rawValue, indicatorId, indicator) {
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
    const apiKey = loadApiKey();
    console.log(`\n📊 FRED Indicator Update ${DRY_RUN ? '(DRY RUN)' : ''}`);
    console.log(`   ${new Date().toISOString()}\n`);

    // Step 1: Read current indicators.js
    const indicatorsSource = fs.readFileSync(INDICATORS_FILE, 'utf-8');

    // Parse INDICATORS object — we'll use regex replacement on the source text
    // to preserve formatting. First, extract all indicators with fredSeriesId.
    const indicatorPattern = /['"]([^'"]+)['"]:\s*\{[\s\S]*?fredSeriesId:\s*(?:'([^']*)'|"([^"]*)"|\[([^\]]*)\]|null)/g;
    const fredIndicators = [];
    let match;

    while ((match = indicatorPattern.exec(indicatorsSource)) !== null) {
        const id = match[1];
        let seriesId = match[2] || match[3] || null;
        const arrayStr = match[4];

        if (arrayStr) {
            // Array of series IDs (e.g., fed funds target)
            seriesId = arrayStr.match(/['"]([^'"]+)['"]/g)?.map(s => s.replace(/['"]/g, '')) || [];
        }

        if (seriesId === null || seriesId === 'null') continue;
        fredIndicators.push({ id, seriesId });
    }

    console.log(`   Found ${fredIndicators.length} FRED-linked indicators\n`);

    // Step 2: Fetch and update each indicator
    // Note: We intentionally fetch ALL series every run (~20 calls).
    // The fred/series/updates endpoint only returns the top 1000 most recently
    // updated series across all of FRED, so our series can be missed.

    // Step 3: Fetch and update each indicator
    let updatedSource = indicatorsSource;
    const changes = [];
    const copyrightWarnings = [];

    for (const { id, seriesId } of fredIndicators) {
        // Extract indicator info from source for formatting
        const unitMatch = indicatorsSource.match(new RegExp(`'${id}':[\\s\\S]*?unit:\\s*'([^']*)'`));
        const unit = unitMatch ? unitMatch[1] : 'unknown';

        const freqMatch = indicatorsSource.match(new RegExp(`'${id}':[\\s\\S]*?frequency:\\s*'([^']*)'`));
        const frequency = freqMatch ? freqMatch[1] : 'daily';

        const indicator = { unit };

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
                const obs = await getLatestObservation(seriesId, apiKey, getUnitsParam(id, indicatorsSource));
                await sleep(REQUEST_DELAY_MS);

                if (obs && obs.value !== '.') {
                    newValue = formatValue(obs.value, id, indicator);
                    newPeriod = formatPeriod(obs.date, frequency);

                    if (newValue === null) continue; // Skip if special handling needed
                }

                // Check for copyright (first run only — just log warnings)
                const meta = await getSeriesMetadata(seriesId, apiKey);
                await sleep(REQUEST_DELAY_MS);
                if (meta && meta.notes && meta.notes.toLowerCase().includes('copyright')) {
                    copyrightWarnings.push({ id, seriesId, source: meta.title });
                }
            }

            if (newValue && newPeriod) {
                // Find and replace the observation in the source
                const obsPattern = new RegExp(
                    `('${id}':[\\s\\S]*?observation:\\s*\\{\\s*value:\\s*)('[^']*')(\\s*,\\s*period:\\s*)('[^']*')`,
                );

                const obsMatch = updatedSource.match(obsPattern);
                if (obsMatch) {
                    const oldValue = obsMatch[2].replace(/'/g, '');
                    const oldPeriod = obsMatch[4].replace(/'/g, '');

                    if (oldValue !== newValue || oldPeriod !== newPeriod) {
                        updatedSource = updatedSource.replace(
                            obsPattern,
                            `$1'${newValue}'$3'${newPeriod}'`
                        );
                        changes.push({
                            id,
                            oldValue,
                            newValue,
                            oldPeriod,
                            newPeriod,
                        });
                    }
                }
            }
        } catch (err) {
            console.error(`   ❌ ${id}: ${err.message}`);
        }
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
        fs.writeFileSync(INDICATORS_FILE, updatedSource, 'utf-8');
        console.log(`\n💾 Written to ${path.basename(INDICATORS_FILE)}`);
    } else if (DRY_RUN && changes.length > 0) {
        console.log('\n🔒 Dry run — no files modified.');
    }

    console.log('');
}

/**
 * Extract the fredUnits param for a given indicator from source.
 */
function getUnitsParam(indicatorId, source) {
    const match = source.match(new RegExp(`'${indicatorId}':[\\s\\S]*?fredUnits:\\s*'([^']*)'`));
    return match ? match[1] : 'lin';
}

// ── Run ─────────────────────────────────────────────────────────
main().catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
});
