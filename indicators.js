// ===== LAYER 1: INDICATORS =====
// Static definitions for each economic variable.
// Observation data (value + period) is loaded from data/observations.json at runtime.

const INDICATORS = {
    // ── Policy Instruments ─────────────────────────────────────
    'fed-funds-target': {
        id: 'fed-funds-target',
        name: 'Fed Funds Target',
        category: 'policy-instruments',
        goodDirection: 'down',
        updateMode: 'manual',
        unit: 'percent-range',
        source: 'FOMC decision (federalreserve.gov)',
        schedule: { frequency: 'monthly', fredSeriesId: ['DFEDTARU', 'DFEDTARL'], fredUnits: 'lin' },
    },
    'qe-qt-pace': {
        id: 'qe-qt-pace',
        name: 'QE/QT Pace',
        category: 'policy-instruments',
        goodDirection: null,
        updateMode: 'fomc',
        unit: 'label',
        source: 'FOMC statement (federalreserve.gov)',
        schedule: { frequency: 'fomc', source: 'fomc-statement' },
    },
    'forward-guidance': {
        id: 'forward-guidance',
        name: 'Forward Guidance',
        category: 'policy-instruments',
        goodDirection: null,
        updateMode: 'fomc',
        unit: 'label',
        source: 'FOMC statement (federalreserve.gov)',
        schedule: { frequency: 'fomc', source: 'fomc-statement' },
    },

    // ── Financial Conditions ───────────────────────────────────
    'front-end-yields-2y': {
        id: 'front-end-yields-2y',
        name: 'Front-end Yields (2Y)',
        category: 'financial',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent',
        source: 'U.S. Treasury 2Y yield',
        schedule: { frequency: 'daily', fredSeriesId: 'DGS2', fredUnits: 'lin' },
    },
    'long-end-yields-10y': {
        id: 'long-end-yields-10y',
        name: 'Long-end Yields (10Y)',
        category: 'financial',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent',
        source: 'U.S. Treasury 10Y yield',
        schedule: { frequency: 'daily', fredSeriesId: 'DGS10', fredUnits: 'lin' },
    },
    'mortgage-rates': {
        id: 'mortgage-rates',
        name: 'Mortgage Rates',
        category: 'financial',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent',
        source: 'Freddie Mac PMMS 30-yr fixed',
        schedule: { frequency: 'weekly', fredSeriesId: 'MORTGAGE30US', fredUnits: 'lin' },
    },

    // ── Real Economy ───────────────────────────────────────────
    'housing-starts': {
        id: 'housing-starts',
        name: 'Housing Starts',
        category: 'real-economy',
        goodDirection: 'up',
        updateMode: 'derived',
        unit: 'millions-saar',
        source: 'U.S. Census Bureau',
        schedule: { frequency: 'monthly', fredSeriesId: 'HOUST', fredUnits: 'lin' },
    },
    'consumer-spending': {
        id: 'consumer-spending',
        name: 'Consumer Spending',
        category: 'real-economy',
        goodDirection: 'up',
        updateMode: 'derived',
        unit: 'percent-mom',
        source: 'BEA Personal Income & Outlays',
        schedule: { frequency: 'monthly', fredSeriesId: 'PCE', fredUnits: 'pch' },
    },
    'corporate-borrowing': {
        id: 'corporate-borrowing',
        name: 'Corporate Borrowing',
        category: 'real-economy',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'basis-points',
        source: 'ICE BofA IG OAS',
        schedule: { frequency: 'daily', fredSeriesId: 'BAMLC0A0CM', fredUnits: 'lin' },
    },
    'gdp-growth': {
        id: 'gdp-growth',
        name: 'GDP Growth',
        category: 'real-economy',
        goodDirection: 'up',
        updateMode: 'derived',
        unit: 'percent-qoq',
        source: 'BEA advance estimate',
        schedule: { frequency: 'quarterly', fredSeriesId: 'A191RL1Q225SBEA', fredUnits: 'lin' },
    },
    'unemployment': {
        id: 'unemployment',
        name: 'Unemployment',
        category: 'real-economy',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent',
        source: 'BLS Employment Situation',
        schedule: { frequency: 'monthly', fredSeriesId: 'UNRATE', fredUnits: 'lin' },
    },
    'job-openings': {
        id: 'job-openings',
        name: 'Job Openings',
        category: 'real-economy',
        goodDirection: 'up',
        updateMode: 'derived',
        unit: 'millions',
        source: 'BLS JOLTS',
        schedule: { frequency: 'monthly', fredSeriesId: 'JTSJOL', fredUnits: 'lin' },
    },
    'wage-growth': {
        id: 'wage-growth',
        name: 'Wage Growth',
        category: 'real-economy',
        goodDirection: 'up',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS Avg Hourly Earnings',
        schedule: { frequency: 'monthly', fredSeriesId: 'CES0500000003', fredUnits: 'pch' },
    },

    // ── Inflation ──────────────────────────────────────────────
    'core-cpi': {
        id: 'core-cpi',
        name: 'Core CPI',
        category: 'inflation',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS CPI less food & energy',
        schedule: { frequency: 'monthly', fredSeriesId: 'CPILFESL', fredUnits: 'pc1' },
    },
    'core-ppi': {
        id: 'core-ppi',
        name: 'Core PPI',
        category: 'inflation',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS PPI less food & energy',
        schedule: { frequency: 'monthly', fredSeriesId: 'PPIFES', fredUnits: 'pc1' },
    },
    'headline-cpi': {
        id: 'headline-cpi',
        name: 'Headline CPI',
        category: 'inflation',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS CPI (bls.gov)',
        schedule: { frequency: 'monthly', fredSeriesId: 'CPIAUCSL', fredUnits: 'pc1' },
    },
    'headline-ppi': {
        id: 'headline-ppi',
        name: 'Headline PPI',
        category: 'inflation',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BLS PPI Final Demand',
        schedule: { frequency: 'monthly', fredSeriesId: 'PPIFIS', fredUnits: 'pc1' },
    },
    'pce': {
        id: 'pce',
        name: 'PCE',
        category: 'inflation',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BEA PCE Price Index',
        schedule: { frequency: 'monthly', fredSeriesId: 'PCEPI', fredUnits: 'pc1' },
    },
    'core-pce': {
        id: 'core-pce',
        name: 'Core PCE',
        category: 'inflation',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'percent-yoy',
        source: 'BEA Core PCE Price Index',
        schedule: { frequency: 'monthly', fredSeriesId: 'PCEPILFE', fredUnits: 'pc1' },
    },

    // ── Market Pricing & Risk Sentiment ────────────────────────
    'oil-barrel-price': {
        id: 'oil-barrel-price',
        name: 'Oil Barrel Price',
        category: 'exogenous',
        goodDirection: 'down',
        updateMode: 'manual',
        unit: 'usd',
        source: 'WTI crude spot (tradingeconomics.com)',
        schedule: { frequency: 'daily', fredSeriesId: 'DCOILWTICO', fredUnits: 'lin' },
    },
    'dow': {
        id: 'dow',
        name: 'Dow',
        category: 'exogenous',
        goodDirection: 'up',
        updateMode: 'derived',
        unit: 'index',
        source: 'DJIA closing price',
        schedule: { frequency: 'daily', fredSeriesId: 'DJIA', fredUnits: 'lin' },
    },
    'nasdaq': {
        id: 'nasdaq',
        name: 'Nasdaq',
        category: 'exogenous',
        goodDirection: 'up',
        updateMode: 'derived',
        unit: 'index',
        source: 'Nasdaq Composite close',
        schedule: { frequency: 'daily', fredSeriesId: 'NASDAQCOM', fredUnits: 'lin' },
    },
    'sp-500': {
        id: 'sp-500',
        name: 'S&P 500',
        category: 'exogenous',
        goodDirection: 'up',
        updateMode: 'derived',
        unit: 'index',
        source: 'S&P 500 closing price',
        schedule: { frequency: 'daily', fredSeriesId: 'SP500', fredUnits: 'lin' },
    },
    'vix': {
        id: 'vix',
        name: 'VIX',
        category: 'exogenous',
        goodDirection: 'down',
        updateMode: 'derived',
        unit: 'index',
        source: 'CBOE VIX close',
        schedule: { frequency: 'daily', fredSeriesId: 'VIXCLS', fredUnits: 'lin' },
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

// ── Load observation data from JSON ─────────────────────────────
let observationsLastUpdated = null;

async function loadObservations() {
    try {
        const resp = await fetch('data/observations.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        observationsLastUpdated = data.lastUpdated || null;
        for (const [id, obs] of Object.entries(data.observations)) {
            if (INDICATORS[id]) {
                INDICATORS[id].observation = obs;
            }
        }
        console.log(`📊 Loaded observations (last updated: ${data.lastUpdated})`);
    } catch (e) {
        console.warn('⚠️ Could not load observations:', e.message);
    }
}

// Helper: build NODES array from INDICATORS + NODE_THEMES (backwards compat with app.js rendering)
function buildNodes() {
    return NODE_THEMES.map((theme) => {
        const subItems = Object.values(INDICATORS)
            .filter((ind) => ind.category === theme.id)
            .map((ind) => ({
                id: ind.id,
                name: ind.name,
                value: ind.observation ? ind.observation.value : '—',
                period: ind.observation ? ind.observation.period : '',
                source: ind.source,
                updateMode: ind.updateMode,
            }));
        return { ...theme, theme: theme.id, subItems };
    });
}

// Node.js module export (ignored in browser, used by update-indicators.js)
if (typeof module !== 'undefined') module.exports = { INDICATORS, NODE_THEMES };
