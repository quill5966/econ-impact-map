// ===== SUBITEM METADATA =====
// Defines updateMode for each subitem.
// "manual"  — value set by policy or exogenous factors; not derived from upstream propagation
// "derived" — value computed from upstream causal effects during simulation

const SUBITEM_METADATA = {
    // Policy Instruments
    'fed-funds-target': { updateMode: 'manual' },
    'qe-qt-pace': { updateMode: 'manual' },
    'forward-guidance': { updateMode: 'manual' },

    // Financial Conditions
    'front-end-yields-2y': { updateMode: 'derived' },
    'long-end-yields-10y': { updateMode: 'derived' },
    'mortgage-rates': { updateMode: 'derived' },

    // Real Economy
    'housing-starts': { updateMode: 'derived' },
    'consumer-spending': { updateMode: 'derived' },
    'corporate-borrowing': { updateMode: 'derived' },
    'gdp-growth': { updateMode: 'derived' },
    'unemployment': { updateMode: 'derived' },
    'job-openings': { updateMode: 'derived' },
    'wage-growth': { updateMode: 'derived' },

    // Inflation
    'core-cpi': { updateMode: 'derived' },
    'core-ppi': { updateMode: 'derived' },
    'headline-cpi': { updateMode: 'derived' },
    'headline-ppi': { updateMode: 'derived' },
    'pce': { updateMode: 'derived' },
    'core-pce': { updateMode: 'derived' },

    // Exogenous Shocks
    'oil-barrel-price': { updateMode: 'manual' },
    'dow': { updateMode: 'derived' },
    'nasdaq': { updateMode: 'derived' },
    'sp-500': { updateMode: 'derived' },
    'vix': { updateMode: 'derived' },
};


// ===== SUBITEM RELATIONSHIPS =====
// Static causal edges between subitems.
// relationship: "positive"     — source ↑ → target ↑  (source ↓ → target ↓)
//               "negative"     — source ↑ → target ↓  (source ↓ → target ↑)
//               "conditional"  — direction depends on economic context
//
// This data is read-only. Updates are shipped as app releases.

const SUBITEM_RELATIONSHIPS = [
    // ── Policy Instruments → Financial Conditions ──────────────────────
    {
        id: 'fed-funds-to-2y',
        source: 'fed-funds-target',
        target: 'front-end-yields-2y',
        relationship: 'positive',
        reason: 'Short-term rates track the policy rate closely',
    },
    {
        id: 'fed-funds-to-10y',
        source: 'fed-funds-target',
        target: 'long-end-yields-10y',
        relationship: 'conditional',
        reason: 'Hikes raise expected future short rates / term premium → 10Y ↑; Hikes signal recession risk / term premium falls → 10Y ↓',
    },
    {
        id: 'qe-qt-to-2y',
        source: 'qe-qt-pace',
        target: 'front-end-yields-2y',
        relationship: 'conditional',
        reason: 'QT (tightening) → yields ↑; QE (easing) → yields ↓',
    },
    {
        id: 'qe-qt-to-10y',
        source: 'qe-qt-pace',
        target: 'long-end-yields-10y',
        relationship: 'conditional',
        reason: 'QT → yields ↑; QE → yields ↓',
    },

    // ── Financial Conditions → Financial Conditions ────────────────────
    {
        id: '10y-to-mortgage',
        source: 'long-end-yields-10y',
        target: 'mortgage-rates',
        relationship: 'positive',
        reason: 'Mortgages priced off the 10Y Treasury yield',
    },

    // ── Financial Conditions → Real Economy ────────────────────────────
    {
        id: 'mortgage-to-housing',
        source: 'mortgage-rates',
        target: 'housing-starts',
        relationship: 'negative',
        reason: 'Higher rates → less affordable → fewer starts',
    },
    {
        id: 'mortgage-to-spending',
        source: 'mortgage-rates',
        target: 'consumer-spending',
        relationship: 'negative',
        reason: 'Higher mortgage costs reduce disposable income',
    },
    {
        id: '2y-to-corporate-borrowing',
        source: 'front-end-yields-2y',
        target: 'corporate-borrowing',
        relationship: 'negative',
        reason: 'Higher short-term rates → costlier borrowing',
    },
    {
        id: '10y-to-corporate-borrowing',
        source: 'long-end-yields-10y',
        target: 'corporate-borrowing',
        relationship: 'negative',
        reason: 'Higher long-term rates → costlier debt issuance',
    },

    // ── Financial Conditions → Exogenous Shocks (Equities) ────────────
    {
        id: '10y-to-dow',
        source: 'long-end-yields-10y',
        target: 'dow',
        relationship: 'negative',
        reason: 'Higher yields → equities less attractive (discount rate ↑)',
    },
    {
        id: '10y-to-nasdaq',
        source: 'long-end-yields-10y',
        target: 'nasdaq',
        relationship: 'negative',
        reason: 'Higher yields → equities less attractive (discount rate ↑); growth/tech stocks especially sensitive',
    },
    {
        id: '10y-to-sp500',
        source: 'long-end-yields-10y',
        target: 'sp-500',
        relationship: 'negative',
        reason: 'Higher yields → equities less attractive (discount rate ↑)',
    },

    // ── Exogenous Shocks → Inflation ───────────────────────────────────
    {
        id: 'oil-to-headline-cpi',
        source: 'oil-barrel-price',
        target: 'headline-cpi',
        relationship: 'positive',
        reason: 'Energy costs directly feed into headline consumer prices',
    },
    {
        id: 'oil-to-headline-ppi',
        source: 'oil-barrel-price',
        target: 'headline-ppi',
        relationship: 'positive',
        reason: 'Energy costs directly feed into headline producer prices',
    },

    // ── Exogenous Shocks → Real Economy ────────────────────────────────
    {
        id: 'oil-to-spending',
        source: 'oil-barrel-price',
        target: 'consumer-spending',
        relationship: 'negative',
        reason: 'Higher energy costs reduce discretionary spending',
    },

    // ── Inflation internal ─────────────────────────────────────────────
    {
        id: 'core-ppi-to-core-cpi',
        source: 'core-ppi',
        target: 'core-cpi',
        relationship: 'positive',
        reason: 'Producer cost increases pass through to consumers',
    },

    // ── Real Economy → Inflation ───────────────────────────────────────
    {
        id: 'wages-to-core-cpi',
        source: 'wage-growth',
        target: 'core-cpi',
        relationship: 'conditional',
        reason: 'Wages ↑ with low productivity → core services inflation ↑; Wages ↑ with productivity ↑ → inflation impact muted',
    },

    // ── Real Economy internal ──────────────────────────────────────────
    {
        id: 'unemployment-to-wages',
        source: 'unemployment',
        target: 'wage-growth',
        relationship: 'negative',
        reason: 'Lower unemployment (tight labor market) → wage pressure ↑',
    },
    {
        id: 'unemployment-to-spending',
        source: 'unemployment',
        target: 'consumer-spending',
        relationship: 'negative',
        reason: 'Lower unemployment → more income → more spending',
    },
    {
        id: 'housing-to-gdp',
        source: 'housing-starts',
        target: 'gdp-growth',
        relationship: 'positive',
        reason: 'Construction activity contributes to GDP',
    },
    {
        id: 'spending-to-gdp',
        source: 'consumer-spending',
        target: 'gdp-growth',
        relationship: 'positive',
        reason: 'Consumer spending comprises ~70% of US GDP',
    },
    {
        id: 'corporate-borrowing-to-gdp',
        source: 'corporate-borrowing',
        target: 'gdp-growth',
        relationship: 'conditional',
        reason: 'Borrowing for capex/expansion → GDP ↑; Borrowing due to distress / higher spreads → GDP ↓ or neutral',
    },
    {
        id: 'gdp-to-unemployment',
        source: 'gdp-growth',
        target: 'unemployment',
        relationship: 'negative',
        reason: 'GDP growth → hiring → unemployment ↓',
    },

    // ── Inflation → Policy Instruments (feedback loop) ─────────────────
    {
        id: 'core-cpi-to-fed-funds',
        source: 'core-cpi',
        target: 'fed-funds-target',
        relationship: 'positive',
        reason: 'Inflation ↑ → Fed tightens (feedback loop)',
    },
];
