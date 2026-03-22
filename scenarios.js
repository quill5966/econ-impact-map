// ===== LAYER 2: SCENARIO PRESETS =====
// Static scenario templates. Direction and surprise size are user-configurable at runtime.
// Static, versioned — changes require an app update.

const SCENARIO_PRESETS = [
    // ── Policy scenarios ─────────────────────────────────────
    {
        id: 'fed_hike_hawkish_surprise',
        title: 'Fed Hawkish Surprise',
        descriptionShort: 'Fed hikes fed funds target (hawkish surprise)',
        plainEnglishSummary: {
            soft_landing: 'The economy can absorb the shock. Short-end yields reprice higher, equities dip modestly but don\u2019t crater \u2014 tighter policy into a resilient backdrop is manageable.',
            late_cycle: 'A hawkish surprise into a fragile cycle risks accelerating the slowdown. Credit spreads widen and growth expectations get marked down as overtightening fears build.',
            recession_risk: 'Markets read the hike as a policy mistake. Long-end yields may actually fall as recession pricing dominates, even as the Fed tightens. Rate cuts get pulled forward.',
            inflation_scare: 'The hike is necessary and expected, but may not be enough. If inflation doesn\u2019t respond, the Fed will need to go further \u2014 stagflation risk remains elevated.',
            financial_stress: 'Hiking into market dysfunction risks a disorderly reaction. Credit conditions tighten sharply and the Fed may be forced to reverse course before the hike even works through.',
        },
        shockType: 'policy',
        defaultShockDirection: 'hawkish',
        defaultSurpriseSize: 2,
        primaryShockNode: 'fed-funds-target',
    },
    {
        id: 'fed_higher_for_longer',
        title: 'Fed Signals Higher-for-Longer',
        descriptionShort: 'Fed signals rates will stay elevated longer than expected',
        plainEnglishSummary: {
            soft_landing: 'Expect upward pressure on yields and modest equity headwinds over the next few days to weeks as markets digest a longer restrictive stance.',
            late_cycle: 'Yield pressure and early cracks in growth indicators signal the cycle is turning. HFL at this stage raises the odds the Fed stays tight too long \u2014 watch credit spreads and labor data closely.',
            recession_risk: 'HFL risks tipping a fragile economy into contraction. Markets are pricing rate cuts ahead even as the Fed holds firm \u2014 policy credibility versus growth reality tension is high.',
            inflation_scare: 'Yields surge as inflation re-acceleration fears dominate. The Fed doubling down on restrictive policy may not be enough if supply-side pressures persist \u2014 stagflation risk elevated.',
            financial_stress: 'Policy credibility collides with market dysfunction. The long end rallies on safe-haven demand while credit and equities sell off \u2014 HFL in a stress environment risks becoming self-defeating.',
        },
        shockType: 'policy',
        defaultShockDirection: 'hawkish',
        defaultSurpriseSize: 2,
        primaryShockNode: 'forward-guidance',
    },
    {
        id: 'fed_cut_dovish_surprise',
        title: 'Fed Dovish Surprise',
        descriptionShort: 'Fed cuts rates (dovish surprise)',
        plainEnglishSummary: {
            soft_landing: 'A well-received easing signal into a healthy economy. Equities broadly rally, yields fall, and financial conditions ease \u2014 risk assets bid across the board.',
            late_cycle: 'Relief rally likely but may prove short-lived if growth is already deteriorating. The key question is whether cuts arrive fast enough to extend the cycle or just cushion the landing.',
            recession_risk: 'The pivot the market has been waiting for. An aggressive relief rally is expected, but the ultimate effectiveness depends on how deep the slowdown has already become.',
            inflation_scare: 'A dangerous signal \u2014 markets may interpret this as the Fed blinking on inflation. Short-end yields fall but long-end yields could rise as inflation expectations de-anchor.',
            financial_stress: 'Emergency easing provides critical liquidity relief. Spreads tighten and safe havens unwind, but the Fed\u2019s credibility is on the line if inflation remains sticky.',
        },
        shockType: 'policy',
        defaultShockDirection: 'dovish',
        defaultSurpriseSize: 2,
        primaryShockNode: 'fed-funds-target',
    },

    // ── Inflation scenarios ──────────────────────────────────
    {
        id: 'core_pce_hotter_than_expected',
        title: 'Core PCE Hotter Than Expected',
        descriptionShort: 'Core PCE comes in above consensus',
        plainEnglishSummary: {
            soft_landing: 'Delays the easing timeline but doesn\u2019t derail the expansion. Rate cut expectations get pushed out, yields tick up, and equities face modest multiple compression.',
            late_cycle: 'Hot inflation at a fragile cycle peak complicates the Fed\u2019s path. The risk of overtightening rises, putting GDP and credit under increasing pressure.',
            recession_risk: 'Stagflation scenario firms up \u2014 the Fed can\u2019t cut even as growth stalls. Risk assets face pressure from both sides: no policy relief and deteriorating fundamentals.',
            inflation_scare: 'Confirms the fear and puts the Fed firmly back in tightening mode. Rate cut expectations collapse, long-end yields surge, and equity multiples compress further.',
            financial_stress: 'Persistent inflation forces tight policy into stressed markets \u2014 a dangerous combination. The Fed\u2019s inability to ease amplifies the credit crunch and raises systemic risk.',
        },
        shockType: 'inflation',
        defaultShockDirection: 'inflationary',
        defaultSurpriseSize: 2,
        primaryShockNode: 'core-pce',
    },
    {
        id: 'core_pce_cooler_than_expected',
        title: 'Core PCE Cooler Than Expected',
        descriptionShort: 'Core PCE comes in below consensus',
        plainEnglishSummary: {
            soft_landing: 'The ideal outcome \u2014 disinflation without growth damage. Rate cut expectations build, yields drift lower, and equities rally on a benign policy path.',
            late_cycle: 'Cooling inflation opens the door for cuts that could extend the cycle. Whether they arrive in time to prevent a recession depends on the pace of labor market softening.',
            recession_risk: 'Welcome relief but potentially too late. The path to cuts is clearer, but growth damage may already be running ahead of any policy response.',
            inflation_scare: 'Shifts the narrative meaningfully. If sustained, the inflation scare dissolves \u2014 yields retreat and risk assets rally sharply as the policy outlook brightens.',
            financial_stress: 'Be cautious interpreting this as good news. In a stress environment, falling inflation may signal demand collapse, not genuine disinflation \u2014 the recession signal matters more here.',
        },
        shockType: 'inflation',
        defaultShockDirection: 'disinflationary',
        defaultSurpriseSize: 2,
        primaryShockNode: 'core-pce',
    },

    // ── Labor scenarios ──────────────────────────────────────
    {
        id: 'payrolls_wages_hot',
        title: 'Payrolls + Wages Stronger Than Expected',
        descriptionShort: 'Jobs and wage data surprise to the upside',
        plainEnglishSummary: {
            soft_landing: 'A goldilocks signal \u2014 strong labor without signs of overheating. Yields rise modestly, equities hold steady, and the Fed stays patient. No urgency to cut or hike.',
            late_cycle: 'Hot labor data late in the cycle raises the stagflation tradeoff. Wage pressure into slowing GDP creates a difficult bind for the Fed \u2014 neither hiking nor cutting is clean.',
            recession_risk: 'A confusing signal \u2014 labor is a lagging indicator and often looks fine as growth turns. Markets may get a brief relief rally, but watch for downward revisions in coming months.',
            inflation_scare: 'Pours fuel on the fire. Wage-driven inflation fears intensify, rate cut expectations collapse, and the Fed faces pressure to tighten further into an already stressed environment.',
            financial_stress: 'Anomalous in a stress scenario. If genuine, it suggests stress may be more contained than feared. More likely this is a lagged read \u2014 deterioration typically follows in subsequent reports.',
        },
        shockType: 'labor',
        defaultShockDirection: 'inflationary',
        defaultSurpriseSize: 2,
        primaryShockNode: 'wage-growth',
    },
    {
        id: 'unemployment_higher_than_expected',
        title: 'Unemployment Rises More Than Expected',
        descriptionShort: 'Unemployment rate climbs above consensus',
        plainEnglishSummary: {
            soft_landing: 'Cracks in the labor market challenge the soft landing narrative. Recession odds climb, rate cut expectations get pulled forward, and growth forecasts get trimmed.',
            late_cycle: 'Confirms the cycle is turning. GDP forecasts get marked down, credit spreads widen, and the Fed pivot debate intensifies \u2014 the window for a soft landing is narrowing.',
            recession_risk: 'Validates the recessionary outlook. Expect aggressive rate cut pricing, equity earnings downgrades, and further yield curve steepening as the labor market unravels.',
            inflation_scare: 'Complicates the inflation fight. Weakening labor reduces wage pressure, but the Fed may feel forced to ease before inflation is fully contained \u2014 stagflation risk persists.',
            financial_stress: 'Labor deterioration in a stress environment risks a damaging feedback loop \u2014 job losses hit consumer credit, which amplifies financial stress and extends the downturn.',
        },
        shockType: 'labor',
        defaultShockDirection: 'growth_down',
        defaultSurpriseSize: 2,
        primaryShockNode: 'unemployment',
    },

    // ── Growth scenarios ─────────────────────────────────────
    {
        id: 'consumer_spending_weaker',
        title: 'Consumer Spending / Retail Sales Weaker',
        descriptionShort: 'Consumer spending or retail sales miss expectations',
        plainEnglishSummary: {
            soft_landing: 'Questions the resilience narrative. Demand slowing brings rate cuts closer but also raises concerns about corporate earnings \u2014 the soft landing path gets narrower.',
            late_cycle: 'Demand rolling over at cycle peak is a classic recession precursor. Expect growth forecasts to be cut, safe-haven buying to pick up, and risk appetite to fade.',
            recession_risk: 'Confirms the contraction is broadening beyond financials. Consumer-driven GDP contributions collapse and earnings estimates come down hard \u2014 the recession call firms up.',
            inflation_scare: 'Demand destruction may actually help cool inflation \u2014 a grim silver lining. But if supply-side pressures stay elevated, stagflation becomes the dominant risk.',
            financial_stress: 'Weak spending in a stress environment risks a self-reinforcing spiral \u2014 less consumer activity leads to lower revenue, which feeds back into credit stress and tighter conditions.',
        },
        shockType: 'growth',
        defaultShockDirection: 'growth_down',
        defaultSurpriseSize: 2,
        primaryShockNode: 'consumer-spending',
    },

    // ── Credit / financial stress ────────────────────────────
    {
        id: 'credit_spreads_widen_sharply',
        title: 'Credit Spreads Widen Sharply',
        descriptionShort: 'Credit spreads blow out, signaling financial stress',
        plainEnglishSummary: {
            soft_landing: 'An unexpected shock that disrupts the benign baseline. Financial conditions tighten rapidly \u2014 if spreads don\u2019t stabilize quickly, the soft landing narrative comes under serious pressure.',
            late_cycle: 'Classic late-cycle warning signal. Spread widening of this magnitude has historically preceded recession by 6\u201312 months \u2014 risk-off positioning accelerates and the Fed watches closely.',
            recession_risk: 'Spread blowout validates and amplifies the recession call. Corporate funding stress deepens, equities sell off hard, and the timeline for a Fed pivot compresses rapidly.',
            inflation_scare: 'Spread widening in an inflationary environment is doubly damaging \u2014 financial conditions tighten without any prospect of Fed relief. Corporate funding costs surge on both rate and spread dimensions.',
            financial_stress: 'The core stress mechanism playing out in full. Liquidity deteriorates, systemic risk rises sharply, and a coordinated policy response \u2014 rate cuts, QE, or lending facilities \u2014 may become necessary.',
        },
        shockType: 'credit',
        defaultShockDirection: 'risk_off',
        defaultSurpriseSize: 2,
        primaryShockNode: 'corporate-borrowing',
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
    hawkish: { accent: '#E5383B', bgTint: '#1A0F0F' },
    inflationary: { accent: '#E5383B', bgTint: '#1A0F0F' },
    growth_down: { accent: '#E5383B', bgTint: '#1A0F0F' },
    risk_off: { accent: '#E5383B', bgTint: '#1A0F0F' },
    dovish: { accent: '#1DB954', bgTint: '#0A150F' },
    disinflationary: { accent: '#1DB954', bgTint: '#0A150F' },
    growth_up: { accent: '#1DB954', bgTint: '#0A150F' },
};
