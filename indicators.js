// ===== LAYER 1: INDICATORS =====
// Static definitions + semi-static observations for each economic variable.
// Extracted from app.js NODES — this is the single source of truth for indicator metadata.

const INDICATORS = {
    // ── Policy Instruments ─────────────────────────────────────
    'fed-funds-target': {
        id: 'fed-funds-target',
        name: 'Fed Funds Target',
        category: 'policy-instruments',
        updateMode: 'manual',
        unit: 'percent-range',
        source: 'FOMC decision (federalreserve.gov)',
        observation: { value: '4.25–4.50%', period: 'Jan 28, 2026', sentiment: 'neutral' },
    },
    'qe-qt-pace': {
        id: 'qe-qt-pace',
        name: 'QE/QT Pace',
        category: 'policy-instruments',
        updateMode: 'manual',
        unit: 'label',
        source: 'Fed balance sheet (federalreserve.gov)',
        observation: { value: 'QT Ended', period: 'Dec 1, 2025', sentiment: 'neutral' },
    },
    'forward-guidance': {
        id: 'forward-guidance',
        name: 'Forward Guidance',
        category: 'policy-instruments',
        updateMode: 'manual',
        unit: 'label',
        source: 'FOMC statement + minutes',
        observation: { value: 'Hold / Data-dep.', period: 'Jan 28, 2026', sentiment: 'neutral' },
    },

    // ── Financial Conditions ───────────────────────────────────
    'front-end-yields-2y': {
        id: 'front-end-yields-2y',
        name: 'Front-end Yields (2Y)',
        category: 'financial',
        updateMode: 'derived',
        unit: 'percent',
        source: 'U.S. Treasury 2Y yield',
        observation: { value: '3.48%', period: 'Feb 20, 2026', sentiment: 'neutral' },
    },
    'long-end-yields-10y': {
        id: 'long-end-yields-10y',
        name: 'Long-end Yields (10Y)',
        category: 'financial',
        updateMode: 'derived',
        unit: 'percent',
        source: 'U.S. Treasury 10Y yield',
        observation: { value: '4.08%', period: 'Feb 20, 2026', sentiment: 'neutral' },
    },
    'mortgage-rates': {
        id: 'mortgage-rates',
        name: 'Mortgage Rates',
        category: 'financial',
        updateMode: 'derived',
        unit: 'percent',
        source: 'Freddie Mac PMMS 30-yr fixed',
        observation: { value: '6.01%', period: 'Feb 19, 2026', sentiment: 'neutral' },
    },

    // ── Real Economy ───────────────────────────────────────────
    'housing-starts': {
        id: 'housing-starts',
        name: 'Housing Starts',
        category: 'real-economy',
        updateMode: 'derived',
        unit: 'millions-saar',
        source: 'U.S. Census Bureau',
        observation: { value: '1.48M SAAR', period: 'Jan 2026', sentiment: 'positive' },
    },
    'consumer-spending': {
        id: 'consumer-spending',
        name: 'Consumer Spending',
        category: 'real-economy',
        updateMode: 'derived',
        unit: 'percent-mom',
        source: 'BEA Personal Income & Outlays',
        observation: { value: '+0.4% MoM', period: 'Dec 2025', sentiment: 'positive' },
    },
    'corporate-borrowing': {
        id: 'corporate-borrowing',
        name: 'Corporate Borrowing',
        category: 'real-economy',
        updateMode: 'derived',
        unit: 'basis-points',
        source: 'ICE BofA IG OAS',
        observation: { value: 'IG Spread 79bp', period: 'Feb 19, 2026', sentiment: 'neutral' },
    },
    'gdp-growth': {
        id: 'gdp-growth',
        name: 'GDP Growth',
        category: 'real-economy',
        updateMode: 'derived',
        unit: 'percent-qoq',
        source: 'BEA advance estimate',
        observation: { value: '+1.4% (Q4)', period: 'Q4 2025', sentiment: 'positive' },
    },
    'unemployment': {
        id: 'unemployment',
        name: 'Unemployment',
        category: 'real-economy',
        updateMode: 'derived',
        unit: 'percent',
        source: 'BLS Employment Situation',
        observation: { value: '4.3%', period: 'Jan 2026', sentiment: 'negative' },
    },
    'job-openings': {
        id: 'job-openings',
        name: 'Job Openings',
        category: 'real-economy',
        updateMode: 'derived',
        unit: 'millions',
        source: 'BLS JOLTS',
        observation: { value: '6.5M', period: 'Dec 2025', sentiment: 'negative' },
    },
    'wage-growth': {
        id: 'wage-growth',
        name: 'Wage Growth',
        category: 'real-economy',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS Avg Hourly Earnings',
        observation: { value: '+3.7% YoY', period: 'Jan 2026', sentiment: 'positive' },
    },

    // ── Inflation ──────────────────────────────────────────────
    'core-cpi': {
        id: 'core-cpi',
        name: 'Core CPI',
        category: 'inflation',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS CPI less food & energy',
        observation: { value: '+2.5% YoY', period: 'Jan 2026', sentiment: 'negative' },
    },
    'core-ppi': {
        id: 'core-ppi',
        name: 'Core PPI',
        category: 'inflation',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS PPI less food & energy',
        observation: { value: '+3.3% YoY', period: 'Dec 2025', sentiment: 'negative' },
    },
    'headline-cpi': {
        id: 'headline-cpi',
        name: 'Headline CPI',
        category: 'inflation',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS CPI (bls.gov)',
        observation: { value: '+2.4% YoY', period: 'Jan 2026', sentiment: 'negative' },
    },
    'headline-ppi': {
        id: 'headline-ppi',
        name: 'Headline PPI',
        category: 'inflation',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS PPI Final Demand',
        observation: { value: '+3.0% YoY', period: 'Dec 2025', sentiment: 'negative' },
    },
    'pce': {
        id: 'pce',
        name: 'PCE',
        category: 'inflation',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BEA PCE Price Index',
        observation: { value: '+2.9% YoY', period: 'Dec 2025', sentiment: 'negative' },
    },
    'core-pce': {
        id: 'core-pce',
        name: 'Core PCE',
        category: 'inflation',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BEA Core PCE Price Index',
        observation: { value: '+3.0% YoY', period: 'Dec 2025', sentiment: 'negative' },
    },

    // ── Market Pricing & Risk Sentiment ────────────────────────
    'oil-barrel-price': {
        id: 'oil-barrel-price',
        name: 'Oil Barrel Price',
        category: 'exogenous',
        updateMode: 'manual',
        unit: 'usd',
        source: 'WTI crude spot (tradingeconomics.com)',
        observation: { value: '$66.35', period: 'Feb 20, 2026', sentiment: 'neutral' },
    },
    'dow': {
        id: 'dow',
        name: 'Dow',
        category: 'exogenous',
        updateMode: 'derived',
        unit: 'index',
        source: 'DJIA closing price',
        observation: { value: '48,804', period: 'Feb 21, 2026', sentiment: 'positive' },
    },
    'nasdaq': {
        id: 'nasdaq',
        name: 'Nasdaq',
        category: 'exogenous',
        updateMode: 'derived',
        unit: 'index',
        source: 'Nasdaq Composite close',
        observation: { value: '22,627', period: 'Feb 21, 2026', sentiment: 'positive' },
    },
    'sp-500': {
        id: 'sp-500',
        name: 'S&P 500',
        category: 'exogenous',
        updateMode: 'derived',
        unit: 'index',
        source: 'S&P 500 closing price',
        observation: { value: '6,838', period: 'Feb 21, 2026', sentiment: 'positive' },
    },
    'vix': {
        id: 'vix',
        name: 'VIX',
        category: 'exogenous',
        updateMode: 'derived',
        unit: 'index',
        source: 'CBOE VIX close',
        observation: { value: '19.09', period: 'Feb 20, 2026', sentiment: 'neutral' },
    },
};

// Theme node definitions (visual grouping for the circular layout)
const NODE_THEMES = [
    { id: 'policy-instruments', title: 'Policy Instruments', icon: '🏛️', color: [155, 95, 255] },
    { id: 'financial', title: 'Financial Conditions', icon: '📊', color: [45, 212, 191] },
    { id: 'real-economy', title: 'Real Economy', icon: '📈', color: [96, 165, 250] },
    { id: 'inflation', title: 'Inflation', icon: '💲', color: [248, 96, 96] },
    { id: 'exogenous', title: 'Market Pricing & Risk Sentiment', icon: '⚡', color: [234, 179, 8] },
];

// Helper: build NODES array from INDICATORS + NODE_THEMES (backwards compat with app.js rendering)
function buildNodes() {
    return NODE_THEMES.map((theme) => {
        const subItems = Object.values(INDICATORS)
            .filter((ind) => ind.category === theme.id)
            .map((ind) => ({
                id: ind.id,
                name: ind.name,
                value: ind.observation.value,
                period: ind.observation.period,
                source: ind.source,
                updateMode: ind.updateMode,
                sentiment: ind.observation.sentiment,
            }));
        return { ...theme, theme: theme.id, subItems };
    });
}
