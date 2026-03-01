// ===== LAYER 2: SCENARIO PRESETS =====
// Static scenario templates. Direction and surprise size are user-configurable at runtime.
// Static, versioned — changes require an app update.

const SCENARIO_PRESETS = [
    // ── Policy scenarios ─────────────────────────────────────
    {
        id: 'fed_hike_hawkish_surprise',
        title: 'Fed Hawkish Surprise',
        descriptionShort: 'Fed hikes fed funds target (hawkish surprise)',
        plainEnglishSummary: 'Expect upward pressure on short-term yields, a stronger dollar, and modest equity headwinds as markets reprice tighter policy.',
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
        plainEnglishSummary: 'Expect upward pressure on yields and modest equity headwinds over the next few days to weeks as markets digest a longer restrictive stance.',
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
        plainEnglishSummary: 'Expect falling yields, a weaker dollar, and a boost to equities and risk appetite as easier financial conditions flow through.',
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
        plainEnglishSummary: 'Sticky inflation raises the odds of delayed rate cuts. Yields may rise, equities may pull back on hawkish repricing.',
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
        plainEnglishSummary: 'Cooling inflation supports rate-cut expectations. Yields likely drift lower and equities may rally on easing optimism.',
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
        plainEnglishSummary: 'Strong labor data keeps the Fed cautious. Wage-driven inflation pressure may delay easing and push yields higher.',
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
        plainEnglishSummary: 'A softening labor market raises recession concerns. Expect falling yields but also pressure on consumer spending and corporate earnings.',
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
        plainEnglishSummary: 'Weak consumer data signals slowing demand. Growth concerns may weigh on equities while boosting rate-cut expectations.',
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
        plainEnglishSummary: 'Rising credit stress tightens financial conditions and signals risk-off. Corporate borrowing costs jump, equities sell off, and safe havens rally.',
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

// Direction → accent color + background tint mapping for the scenario banner
// Negative-pressure directions get red accent + dark red tint
// Positive/easing directions get green accent + dark green tint
const DIRECTION_COLORS = {
    hawkish: { accent: '#E5383B', bgTint: '#1A0F0F', sentiment: 'negative' },
    inflationary: { accent: '#E5383B', bgTint: '#1A0F0F', sentiment: 'negative' },
    growth_down: { accent: '#E5383B', bgTint: '#1A0F0F', sentiment: 'negative' },
    risk_off: { accent: '#E5383B', bgTint: '#1A0F0F', sentiment: 'negative' },
    dovish: { accent: '#1DB954', bgTint: '#0A150F', sentiment: 'positive' },
    disinflationary: { accent: '#1DB954', bgTint: '#0A150F', sentiment: 'positive' },
    growth_up: { accent: '#1DB954', bgTint: '#0A150F', sentiment: 'positive' },
};
