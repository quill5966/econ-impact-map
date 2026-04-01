// verify-rules.js — Validate impact rule coverage and data integrity
// Run: node verify-rules.js

const { INDICATORS } = require('./indicators.js');
const fs = require('fs');

// Eval the files to get their globals
const mechCode = fs.readFileSync('./mechanisms.js', 'utf8');
const scenCode = fs.readFileSync('./scenarios.js', 'utf8');
const rulesCode = fs.readFileSync('./impact-rules.js', 'utf8');
const tooltipCode = fs.readFileSync('./tooltip-text.js', 'utf8');

// Use Function constructor to execute in a shared scope
const combined = mechCode + '\n' + scenCode + '\n' + rulesCode + '\n' + tooltipCode +
    '\nmodule.exports = { IMPACT_RULES, SCENARIO_PRESETS, MECHANISMS, TOOLTIP_TEXT };';
const tmpFile = require('path').join(__dirname, '_verify_tmp.js');
fs.writeFileSync(tmpFile, combined);
const { IMPACT_RULES, SCENARIO_PRESETS, MECHANISMS, TOOLTIP_TEXT } = require(tmpFile);
fs.unlinkSync(tmpFile);

const VALID_REGIMES = ['soft_landing', 'late_cycle', 'recession_risk', 'inflation_scare', 'financial_stress'];
const indicatorIds = Object.keys(INDICATORS);
const scenarioIds = SCENARIO_PRESETS.map(s => s.id);
const mechanismIds = MECHANISMS.map(m => m.id);

let errors = 0;

// 1. Check for duplicate rule IDs
const idCounts = {};
for (const rule of IMPACT_RULES) {
    idCounts[rule.id] = (idCounts[rule.id] || 0) + 1;
}
for (const [id, count] of Object.entries(idCounts)) {
    if (count > 1) {
        console.error(`❌ Duplicate rule ID: ${id} (appears ${count} times)`);
        errors++;
    }
}

// 2. Validate references
for (const rule of IMPACT_RULES) {
    if (!scenarioIds.includes(rule.scenarioId)) {
        console.error(`❌ Rule ${rule.id}: invalid scenarioId "${rule.scenarioId}"`);
        errors++;
    }
    if (!indicatorIds.includes(rule.targetIndicatorId)) {
        console.error(`❌ Rule ${rule.id}: invalid targetIndicatorId "${rule.targetIndicatorId}"`);
        errors++;
    }
    if (!mechanismIds.includes(rule.mechanism)) {
        console.error(`❌ Rule ${rule.id}: invalid mechanism "${rule.mechanism}"`);
        errors++;
    }
    if (rule.regimeOverrides) {
        for (const regime of Object.keys(rule.regimeOverrides)) {
            if (!VALID_REGIMES.includes(regime)) {
                console.error(`❌ Rule ${rule.id}: invalid regime override key "${regime}"`);
                errors++;
            }
        }
    }
}

// 3. Count rules per scenario
console.log('\n📊 RULES PER SCENARIO:');
console.log('─'.repeat(50));
for (const scenario of SCENARIO_PRESETS) {
    const rules = IMPACT_RULES.filter(r => r.scenarioId === scenario.id);
    const overrideCount = rules.filter(r => r.regimeOverrides && Object.keys(r.regimeOverrides).length > 0).length;
    const status = rules.length >= 15 ? '✅' : '⚠️';
    console.log(`${status} ${scenario.title}: ${rules.length} rules (${overrideCount} with regime overrides)`);
}

// 4. Coverage matrix
console.log('\n📋 COVERAGE MATRIX (scenario → missing indicators):');
console.log('─'.repeat(50));
const coverableIndicators = indicatorIds.filter(id => !['qe-qt-pace'].includes(id));

for (const scenario of SCENARIO_PRESETS) {
    const rules = IMPACT_RULES.filter(r => r.scenarioId === scenario.id);
    const coveredIndicators = rules.map(r => r.targetIndicatorId);
    const missing = coverableIndicators.filter(id => !coveredIndicators.includes(id));
    if (missing.length === 0) {
        console.log(`✅ ${scenario.title}: full coverage`);
    } else if (missing.length <= 3) {
        console.log(`⚠️  ${scenario.title}: missing ${missing.join(', ')}`);
    } else {
        console.log(`❌ ${scenario.title}: missing ${missing.length} indicators`);
        errors++;
    }
}

// 5. Total counts
const totalRules = IMPACT_RULES.length;
const totalOverrides = IMPACT_RULES.filter(r => r.regimeOverrides && Object.keys(r.regimeOverrides).length > 0).length;
const totalOverrideEntries = IMPACT_RULES.reduce((sum, r) => {
    return sum + (r.regimeOverrides ? Object.keys(r.regimeOverrides).length : 0);
}, 0);

console.log('\n📈 TOTALS:');
console.log('─'.repeat(50));
console.log(`Total rules: ${totalRules}`);
console.log(`Rules with regime overrides: ${totalOverrides}`);
console.log(`Total regime override entries: ${totalOverrideEntries}`);
// 6. Tooltip coverage
console.log('\n📝 TOOLTIP COVERAGE:');
console.log('─'.repeat(50));
let tooltipMissing = 0;
let tooltipTotal = 0;
for (const rule of IMPACT_RULES) {
    tooltipTotal++;
    const entry = TOOLTIP_TEXT[rule.id];
    if (!entry || !entry._default) {
        console.error(`❌ Rule ${rule.id}: missing tooltip text (no _default in TOOLTIP_TEXT)`);
        tooltipMissing++;
        errors++;
    }
}
console.log(`${tooltipMissing === 0 ? '✅' : '❌'} ${tooltipTotal} rules checked, ${tooltipMissing} missing tooltip text`);

// Check for orphaned tooltip entries (tooltip keys with no matching rule)
const ruleIds = new Set(IMPACT_RULES.map(r => r.id));
let orphaned = 0;
for (const tooltipId of Object.keys(TOOLTIP_TEXT)) {
    if (!ruleIds.has(tooltipId)) {
        console.error(`⚠️  Orphaned tooltip entry: "${tooltipId}" has no matching rule ID`);
        orphaned++;
    }
}
if (orphaned > 0) console.log(`⚠️  ${orphaned} orphaned tooltip entries found`);
else console.log('✅ No orphaned tooltip entries');

console.log(`\n${errors === 0 ? '✅ All checks passed!' : `❌ ${errors} error(s) found`}`);

process.exit(errors > 0 ? 1 : 0);
