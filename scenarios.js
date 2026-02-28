// ===== LAYER 2: SCENARIO PRESETS =====
// Static scenario templates. Direction and surprise size are user-configurable at runtime.
// Static, versioned — changes require an app update.

const SCENARIO_PRESETS = [
    // ── Policy scenarios ─────────────────────────────────────
    {
        id: 'fed_hike_hawkish_surprise',
        title: 'Fed Hawkish Surprise',
        descriptionShort: 'Fed hikes fed funds target (hawkish surprise)',
        shockType: 'policy',
        defaultShockDirection: 'hawkish',
        defaultSurpriseSize: 2,
        primaryShockNode: 'fed-funds-target',
        appliesToRegimes: ['soft_landing', 'late_cycle'],
    },
    {
        id: 'fed_higher_for_longer',
        title: 'Fed Signals Higher-for-Longer',
        descriptionShort: 'Fed signals rates will stay elevated longer than expected',
        shockType: 'policy',
        defaultShockDirection: 'hawkish',
        defaultSurpriseSize: 2,
        primaryShockNode: 'forward-guidance',
        appliesToRegimes: null,
    },
    {
        id: 'fed_cut_dovish_surprise',
        title: 'Fed Dovish Surprise',
        descriptionShort: 'Fed cuts rates (dovish surprise)',
        shockType: 'policy',
        defaultShockDirection: 'dovish',
        defaultSurpriseSize: 2,
        primaryShockNode: 'fed-funds-target',
        appliesToRegimes: ['soft_landing', 'recession_risk'],
    },

    // ── Inflation scenarios ──────────────────────────────────
    {
        id: 'core_pce_hotter_than_expected',
        title: 'Core PCE Hotter Than Expected',
        descriptionShort: 'Core PCE comes in above consensus',
        shockType: 'inflation',
        defaultShockDirection: 'inflationary',
        defaultSurpriseSize: 2,
        primaryShockNode: 'core-pce',
        appliesToRegimes: null,
    },
    {
        id: 'core_pce_cooler_than_expected',
        title: 'Core PCE Cooler Than Expected',
        descriptionShort: 'Core PCE comes in below consensus',
        shockType: 'inflation',
        defaultShockDirection: 'disinflationary',
        defaultSurpriseSize: 2,
        primaryShockNode: 'core-pce',
        appliesToRegimes: null,
    },

    // ── Labor scenarios ──────────────────────────────────────
    {
        id: 'payrolls_wages_hot',
        title: 'Payrolls + Wages Stronger Than Expected',
        descriptionShort: 'Jobs and wage data surprise to the upside',
        shockType: 'labor',
        defaultShockDirection: 'inflationary',
        defaultSurpriseSize: 2,
        primaryShockNode: 'wage-growth',
        appliesToRegimes: null,
    },
    {
        id: 'unemployment_higher_than_expected',
        title: 'Unemployment Rises More Than Expected',
        descriptionShort: 'Unemployment rate climbs above consensus',
        shockType: 'labor',
        defaultShockDirection: 'growth_down',
        defaultSurpriseSize: 2,
        primaryShockNode: 'unemployment',
        appliesToRegimes: null,
    },

    // ── Growth scenarios ─────────────────────────────────────
    {
        id: 'consumer_spending_weaker',
        title: 'Consumer Spending / Retail Sales Weaker',
        descriptionShort: 'Consumer spending or retail sales miss expectations',
        shockType: 'growth',
        defaultShockDirection: 'growth_down',
        defaultSurpriseSize: 2,
        primaryShockNode: 'consumer-spending',
        appliesToRegimes: null,
    },

    // ── Credit / financial stress ────────────────────────────
    {
        id: 'credit_spreads_widen_sharply',
        title: 'Credit Spreads Widen Sharply',
        descriptionShort: 'Credit spreads blow out, signaling financial stress',
        shockType: 'credit',
        defaultShockDirection: 'risk_off',
        defaultSurpriseSize: 2,
        primaryShockNode: 'corporate-borrowing',
        appliesToRegimes: ['late_cycle', 'financial_stress'],
    },
];

// Helper: look up a scenario preset by id
function getScenarioPreset(scenarioId) {
    return SCENARIO_PRESETS.find((s) => s.id === scenarioId) || null;
}

// Shock type display labels
const SHOCK_TYPE_LABELS = {
    policy: '🏛️ Policy',
    inflation: '💲 Inflation',
    labor: '👷 Labor',
    growth: '📈 Growth',
    credit: '💳 Credit',
};
