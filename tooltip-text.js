// ===== TOOLTIP TEXT =====
// Single source of truth for all indicator tooltip wording.
// Keyed by rule ID → { _default, ...regime-specific overrides }.
// The causal engine resolves: regime-specific text → _default → fallback.
//
// Only rules where the regime changes the meaning (e.g. sign flip)
// need regime-specific entries. Most rules just have _default.

const TOOLTIP_TEXT = {

    // ═══════════════════════════════════════════════════════════
    // SCENARIO: Fed Hawkish Surprise
    // ═══════════════════════════════════════════════════════════

    'hike-to-fed-funds': {
        _default: 'The Fed directly sets the fed funds rate — a hike raises it mechanically.',
    },
    'hike-to-2y': {
        _default: 'A hawkish surprise reprices the expected fed funds path upward, lifting 2Y yields.',
    },
    'hike-to-10y': {
        _default: 'Hawkish surprise pushes 10Y up via term premium, but growing recession fears can push it down (curve flattening).',
        recession_risk: 'Recession pricing dominates — flight-to-quality pushes 10Y yields down even as the Fed tightens.',
        financial_stress: 'Flight-to-quality overwhelms term premium — safe-haven demand pushes 10Y yields down.',
    },
    'hike-to-mortgage': {
        _default: 'Higher yields pass through to mortgage rates with a short lag.',
    },
    'hike-to-sp500': {
        _default: 'Higher rates raise discount rates, pressuring equity valuations.',
    },
    'hike-to-nasdaq': {
        _default: 'Growth/tech stocks are especially rate-sensitive due to long-duration cash flows.',
    },
    'hike-to-dow': {
        _default: 'Dow falls but less than Nasdaq — its value-heavy composition is less rate-sensitive.',
    },
    'hike-to-vix': {
        _default: 'Hawkish surprises increase uncertainty, lifting volatility.',
    },
    'hike-to-corporate': {
        _default: 'Higher benchmark yields widen credit spreads and raise corporate borrowing costs.',
    },
    'hike-to-housing': {
        _default: 'Higher mortgage rates make housing less affordable, reducing new construction.',
    },
    'hike-to-spending': {
        _default: 'Tighter financial conditions reduce disposable income and credit access.',
    },
    'hike-to-gdp': {
        _default: 'Tighter conditions slow investment and consumption, dragging on GDP over time.',
    },
    'hike-to-core-cpi': {
        _default: 'Tighter conditions slow demand and reduce pricing power, easing core inflation over time.',
    },
    'hike-to-core-ppi': {
        _default: 'Demand slowdown reduces producer-side price pressure with a long lag.',
    },
    'hike-to-headline-cpi': {
        _default: 'Broad price level eases as tighter financial conditions cool demand.',
    },
    'hike-to-headline-ppi': {
        _default: 'Reduced demand pressure lowers wholesale prices over time.',
    },
    'hike-to-pce': {
        _default: 'PCE inflation eases as tighter policy cools consumer demand.',
    },
    'hike-to-core-pce': {
        _default: 'The Fed\'s preferred inflation gauge eases as tightening suppresses demand.',
    },
    'hike-to-unemployment': {
        _default: 'Tighter conditions slow growth and hiring, pushing unemployment higher over time.',
    },
    'hike-to-job-openings': {
        _default: 'Firms pull back on job postings as financial conditions tighten and demand slows.',
    },
    'hike-to-wages': {
        _default: 'Labor market slack from tighter policy reduces wage pressure.',
    },
    'hike-to-oil': {
        _default: 'Hawkish surprise strengthens USD and signals growth slowdown, reducing oil demand.',
    },

    // ═══════════════════════════════════════════════════════════
    // SCENARIO: Fed Signals Higher-for-Longer
    // ═══════════════════════════════════════════════════════════

    'hfl-to-forward-guidance': {
        _default: 'The Fed explicitly signals rates will remain elevated for longer.',
    },
    'hfl-to-2y': {
        _default: 'Markets push out the expected timeline for rate cuts, lifting short-end yields.',
    },
    'hfl-to-10y': {
        _default: 'Higher-for-longer signals lift term premium, pushing 10Y yields up.',
        recession_risk: 'Competing forces: term premium pushes 10Y up but recession pricing pulls it down — direction is uncertain.',
        financial_stress: 'Flight-to-quality dominates — safe-haven demand pushes 10Y yields down despite restrictive Fed stance.',
    },
    'hfl-to-sp500': {
        _default: 'Extended high rates pressure equity valuations through higher discount rates.',
    },
    'hfl-to-nasdaq': {
        _default: 'Growth stocks suffer most from sustained high rates due to duration sensitivity.',
    },
    'hfl-to-mortgage': {
        _default: 'Sustained high yields keep mortgage rates elevated.',
    },
    'hfl-to-housing': {
        _default: 'Persistently high mortgage rates dampen housing demand and construction.',
    },
    'hfl-to-spending': {
        _default: 'Sustained tight financial conditions erode disposable income and credit access.',
    },
    'hfl-to-gdp': {
        _default: 'Persistently tight conditions drag on investment and consumption, slowing GDP.',
    },
    'hfl-to-corporate': {
        _default: 'Sustained high benchmark yields keep corporate borrowing costs elevated.',
    },
    'hfl-to-unemployment': {
        _default: 'Extended tight conditions slow hiring and gradually push unemployment higher.',
    },
    'hfl-to-core-cpi': {
        _default: 'Sustained restrictive policy cools demand and eases core inflation over time.',
    },
    'hfl-to-core-ppi': {
        _default: 'Extended demand slowdown reduces producer-side price pressure.',
    },
    'hfl-to-headline-cpi': {
        _default: 'Persistent restrictive stance gradually weighs on the broad price level.',
    },
    'hfl-to-headline-ppi': {
        _default: 'Sustained demand pressure reduction lowers wholesale prices over time.',
    },
    'hfl-to-pce': {
        _default: 'PCE inflation eases as sustained tight policy cools consumer demand.',
    },
    'hfl-to-core-pce': {
        _default: 'The Fed\'s preferred inflation gauge eases under persistent restrictive conditions.',
    },
    'hfl-to-oil': {
        _default: 'Higher-for-longer signals growth slowdown, reducing oil demand expectations.',
        inflation_scare: 'Persistent inflation signals supply-side pressure, pushing oil prices higher even as policy stays tight.',
    },
    'hfl-to-dow': {
        _default: 'Sustained high rates weigh on Dow valuations, though less than growth stocks.',
    },
    'hfl-to-vix': {
        _default: 'Higher-for-longer signals increase policy uncertainty, lifting volatility.',
    },
    'hfl-to-job-openings': {
        _default: 'Sustained tight conditions cool hiring plans and reduce job postings.',
    },
    'hfl-to-wages': {
        _default: 'Extended restrictive policy builds labor market slack, easing wage pressure.',
    },

    // ═══════════════════════════════════════════════════════════
    // SCENARIO: Fed Dovish Surprise
    // ═══════════════════════════════════════════════════════════

    'cut-to-fed-funds': {
        _default: 'The Fed directly lowers the fed funds rate.',
    },
    'cut-to-2y': {
        _default: 'A dovish surprise reprices the fed funds path lower, pulling 2Y yields down.',
    },
    'cut-to-10y': {
        _default: 'Dovish surprise lowers 10Y yields, though growth optimism can partially offset.',
        inflation_scare: 'Long-end yields rise as inflation expectations de-anchor — markets fear the Fed is losing the inflation fight.',
    },
    'cut-to-sp500': {
        _default: 'Lower rates reduce discount rates, boosting equity valuations.',
        inflation_scare: 'Markets read the rate cut as the Fed capitulating on inflation — equities sell off on credibility fears.',
    },
    'cut-to-nasdaq': {
        _default: 'Growth stocks benefit most from lower rates due to duration sensitivity.',
        inflation_scare: 'Growth stocks sell off as markets fear inflation de-anchoring — the cut is seen as a policy mistake.',
    },
    'cut-to-mortgage': {
        _default: 'Lower yields pass through to mortgage rates, improving affordability.',
        inflation_scare: 'Rising long-end yields from inflation fears push mortgage rates higher despite the Fed cutting.',
    },
    'cut-to-housing': {
        _default: 'Lower mortgage rates stimulate housing demand and new construction.',
    },
    'cut-to-vix': {
        _default: 'Dovish surprises reduce uncertainty, compressing volatility.',
        inflation_scare: 'Volatility surges as markets fear the Fed is losing credibility on inflation by cutting prematurely.',
    },
    'cut-to-spending': {
        _default: 'Easier financial conditions boost disposable income and credit access.',
    },
    'cut-to-gdp': {
        _default: 'Easier conditions stimulate investment and consumption, supporting GDP.',
    },
    'cut-to-corporate': {
        _default: 'Lower benchmark yields reduce corporate borrowing costs.',
    },
    'cut-to-dow': {
        _default: 'Lower rates support Dow valuations via reduced discount rates.',
        inflation_scare: 'Dow sells off as markets interpret the cut as a capitulation on inflation — credibility concerns dominate.',
    },
    'cut-to-unemployment': {
        _default: 'Easier conditions support hiring and gradually lower unemployment.',
    },
    'cut-to-core-cpi': {
        _default: 'Easier conditions eventually support demand and push core inflation higher.',
    },
    'cut-to-core-ppi': {
        _default: 'Demand recovery from easier conditions adds producer-side price pressure.',
    },
    'cut-to-headline-cpi': {
        _default: 'Easier monetary conditions gradually push the broad price level higher.',
    },
    'cut-to-headline-ppi': {
        _default: 'Demand recovery from easier conditions lifts wholesale prices over time.',
    },
    'cut-to-pce': {
        _default: 'PCE inflation rises as easier policy lifts consumer demand.',
    },
    'cut-to-core-pce': {
        _default: 'The Fed\'s preferred inflation gauge drifts higher as easing supports demand.',
    },
    'cut-to-oil': {
        _default: 'Dovish surprise weakens USD and signals growth support, lifting oil demand.',
    },
    'cut-to-wages': {
        _default: 'Easier conditions tighten the labor market over time, lifting wage pressure.',
    },
    'cut-to-job-openings': {
        _default: 'Easier financial conditions encourage firms to expand hiring and post openings.',
    },

    // ═══════════════════════════════════════════════════════════
    // SCENARIO: Core PCE Hotter Than Expected
    // ═══════════════════════════════════════════════════════════

    'hot-pce-to-core-pce': {
        _default: 'Core PCE prints higher than expected — this is the direct data release.',
    },
    'hot-pce-to-2y': {
        _default: 'Hotter inflation pushes markets to price in fewer rate cuts or more hikes.',
    },
    'hot-pce-to-10y': {
        _default: 'Hot inflation lifts 10Y via inflation expectations, but growth fears can offset.',
        recession_risk: 'Growth fears dominate — recession pricing pushes 10Y yields down despite hot inflation data.',
        financial_stress: 'Mixed forces on 10Y — inflation pressure pushes yields up but flight-to-quality pulls them down.',
    },
    'hot-pce-to-sp500': {
        _default: 'Hot inflation means tighter policy ahead, pressuring equities.',
    },
    'hot-pce-to-nasdaq': {
        _default: 'Growth stocks are hit hardest by hawkish repricing after hot inflation.',
    },
    'hot-pce-to-core-cpi': {
        _default: 'Persistent inflation pressure tends to show up in both PCE and CPI measures.',
    },
    'hot-pce-to-mortgage': {
        _default: 'Hot inflation pushes yields up, passing through to mortgage rates.',
    },
    'hot-pce-to-housing': {
        _default: 'Higher expected rates from hot inflation weigh on housing affordability.',
    },
    'hot-pce-to-spending': {
        _default: 'Higher expected rates from sticky inflation tighten conditions and reduce spending.',
    },
    'hot-pce-to-corporate': {
        _default: 'Hot inflation raises rate expectations, pushing corporate borrowing costs higher.',
    },
    'hot-pce-to-gdp': {
        _default: 'Sticky inflation prolongs tight financial conditions, weighing on growth.',
    },
    'hot-pce-to-unemployment': {
        _default: 'Prolonged tight conditions from sticky inflation eventually raise unemployment.',
    },
    'hot-pce-to-job-openings': {
        _default: 'Tighter expected policy from hot inflation gradually reduces hiring plans.',
    },
    'hot-pce-to-core-ppi': {
        _default: 'Broad inflation pressure shows up in producer prices as well.',
    },
    'hot-pce-to-headline-cpi': {
        _default: 'Persistent core inflation pulls headline CPI higher.',
    },
    'hot-pce-to-headline-ppi': {
        _default: 'Core PCE heat signals broad inflation pressure across producer prices.',
    },
    'hot-pce-to-pce': {
        _default: 'Hot core PCE directly lifts headline PCE.',
    },
    'hot-pce-to-dow': {
        _default: 'Hot inflation signals tighter policy, weighing on Dow valuations.',
    },
    'hot-pce-to-vix': {
        _default: 'Hot inflation raises policy uncertainty and lifts volatility.',
    },
    'hot-pce-to-oil': {
        _default: 'Hot inflation implies tighter policy ahead, which reduces growth and oil demand over time.',
        inflation_scare: 'Oil direction is uncertain — supply-side inflation can push energy higher, but tighter policy dampens demand.',
    },
    'hot-pce-to-wages': {
        _default: 'Hot inflation raises wage demands as workers seek to keep up with prices.',
        recession_risk: 'Despite hot prices, rising job losses erode wage bargaining power — wages fall as the labor market weakens.',
        financial_stress: 'Financial stress overwhelms price-driven wage demands — layoffs and hiring freezes push wages lower.',
    },

    // ═══════════════════════════════════════════════════════════
    // SCENARIO: Core PCE Cooler Than Expected
    // ═══════════════════════════════════════════════════════════

    'cool-pce-to-core-pce': {
        _default: 'Core PCE prints lower than expected — this is the direct data release.',
    },
    'cool-pce-to-2y': {
        _default: 'Cooler inflation data brings forward rate-cut expectations.',
    },
    'cool-pce-to-sp500': {
        _default: 'Disinflation supports equities via lower expected discount rates.',
    },
    'cool-pce-to-nasdaq': {
        _default: 'Growth stocks rally on dovish repricing after cool inflation.',
    },
    'cool-pce-to-10y': {
        _default: 'Cooler inflation lowers 10Y via reduced inflation expectations.',
    },
    'cool-pce-to-mortgage': {
        _default: 'Cooler inflation pulls yields down, easing mortgage rates.',
    },
    'cool-pce-to-housing': {
        _default: 'Lower expected rates from cool inflation improve housing affordability.',
    },
    'cool-pce-to-spending': {
        _default: 'Easing inflation expectations loosen conditions and support spending.',
    },
    'cool-pce-to-corporate': {
        _default: 'Cool inflation lowers rate expectations, easing corporate borrowing costs.',
    },
    'cool-pce-to-gdp': {
        _default: 'Cooling inflation may ease conditions, supporting growth over time.',
        recession_risk: 'Cooling inflation may reflect demand collapse rather than genuine disinflation — growth outlook remains uncertain.',
        financial_stress: 'In a stress environment, falling inflation likely signals demand destruction — the growth benefit is uncertain.',
    },
    'cool-pce-to-unemployment': {
        _default: 'Easing conditions from falling inflation support hiring over time.',
    },
    'cool-pce-to-job-openings': {
        _default: 'Easing rate expectations from cool inflation encourage hiring.',
    },
    'cool-pce-to-core-cpi': {
        _default: 'Cooling PCE signals broad disinflation that appears in CPI too.',
    },
    'cool-pce-to-core-ppi': {
        _default: 'Broad disinflation eases producer-side price pressure.',
    },
    'cool-pce-to-headline-cpi': {
        _default: 'Cooling core inflation pulls headline CPI lower.',
    },
    'cool-pce-to-headline-ppi': {
        _default: 'Cooling PCE signals narrowing price pressure across wholesale prices.',
    },
    'cool-pce-to-pce': {
        _default: 'Cool core PCE directly pulls headline PCE lower.',
    },
    'cool-pce-to-dow': {
        _default: 'Cool inflation supports Dow via lower expected discount rates.',
    },
    'cool-pce-to-vix': {
        _default: 'Cool inflation reduces policy uncertainty, compressing volatility.',
    },
    'cool-pce-to-oil': {
        _default: 'Cool PCE has an ambiguous effect on oil — easing expectations support demand, but disinflation may signal weaker growth.',
        recession_risk: 'Falling oil prices reflect demand destruction in a weakening economy, not benign disinflation.',
        financial_stress: 'Oil falls as financial stress signals a deepening demand downturn — this is a negative growth signal.',
    },
    'cool-pce-to-wages': {
        _default: 'Falling inflation reduces wage demands as cost-of-living pressure eases.',
    },

    // ═══════════════════════════════════════════════════════════
    // SCENARIO: Payrolls + Wages Stronger Than Expected
    // ═══════════════════════════════════════════════════════════

    'hot-labor-to-wages': {
        _default: 'Strong payrolls and wage data directly show labor market heat.',
    },
    'hot-labor-to-unemployment': {
        _default: 'Strong hiring typically pushes unemployment lower.',
    },
    'hot-labor-to-2y': {
        _default: 'Hot labor data signals the Fed may need to keep rates higher, lifting 2Y yields.',
    },
    'hot-labor-to-core-cpi': {
        _default: 'Strong wage growth can feed into services inflation over time.',
    },
    'hot-labor-to-spending': {
        _default: 'More jobs and higher wages boost consumer spending power.',
        financial_stress: 'Credit contraction overwhelms wage gains — consumers can\'t spend even with jobs, as lending tightens sharply.',
    },
    'hot-labor-to-sp500': {
        _default: 'Strong labor data signals economic resilience, supporting equities modestly.',
        late_cycle: 'Hot labor data at cycle peak signals more tightening ahead — equities sell off on overtightening fears.',
        inflation_scare: 'Strong wages fuel inflation fears — equities sell off as markets price in a more hawkish Fed.',
    },
    'hot-labor-to-nasdaq': {
        _default: 'Strong labor data supports growth stocks via positive growth outlook.',
        late_cycle: 'Hot labor late in the cycle means higher-for-longer rates — growth stocks are especially vulnerable.',
        inflation_scare: 'Wage-driven inflation fears hammer rate-sensitive growth stocks the hardest.',
    },
    'hot-labor-to-dow': {
        _default: 'Strong employment data supports Dow via economic resilience.',
        late_cycle: 'Hot labor data raises overtightening risk — Dow gives back early gains on growth concerns.',
        inflation_scare: 'Wage pressure reinforces inflation fears — Dow sells off on hawkish repricing.',
    },
    'hot-labor-to-vix': {
        _default: 'Strong labor data reduces recession concerns, compressing volatility.',
        late_cycle: 'Hot labor data at cycle peak raises stagflation and overtightening uncertainty, lifting volatility.',
        inflation_scare: 'Strong wages pour fuel on inflation fears — volatility surges as policy uncertainty spikes.',
        financial_stress: 'Anomalous labor strength in a stress environment raises confusion and uncertainty, lifting volatility.',
    },
    'hot-labor-to-10y': {
        _default: 'Hot labor data lifts 10Y via growth/inflation expectations.',
        recession_risk: 'Labor data is likely lagged — recession pricing dominates, pulling 10Y yields down on flight-to-quality.',
        financial_stress: 'Flight-to-quality dominates — safe-haven demand pushes 10Y down despite seemingly strong labor data.',
    },
    'hot-labor-to-mortgage': {
        _default: 'Higher yields from strong labor data pass through to mortgage rates.',
    },
    'hot-labor-to-housing': {
        _default: 'Higher mortgage rates from labor heat may dampen housing demand.',
    },
    'hot-labor-to-gdp': {
        _default: 'Strong employment supports consumption and eventually GDP growth.',
        late_cycle: 'Strong labor is a lagging indicator — the tightening it reinforces ultimately drags GDP lower.',
        recession_risk: 'Labor data lags the real economy — hot payrolls won\'t prevent the growth slowdown already underway.',
        inflation_scare: 'Wage-driven inflation forces the Fed tighter — the resulting demand destruction weighs on GDP.',
        financial_stress: 'Financial stress is already crushing investment — hot labor data doesn\'t offset the credit contraction drag on GDP.',
    },
    'hot-labor-to-oil': {
        _default: 'Strong labor data signals robust demand, supporting oil prices.',
        recession_risk: 'Labor data is likely lagged — weakening growth expectations keep oil direction uncertain.',
        financial_stress: 'Broad demand destruction from financial stress dominates — oil falls despite seemingly strong labor data.',
    },
    'hot-labor-to-core-pce': {
        _default: 'Strong wages feed into services prices, lifting core PCE over time.',
    },
    'hot-labor-to-job-openings': {
        _default: 'Hot labor market confirms strong demand for workers and elevated openings.',
    },

    // ── Multi-timeline reversal rules (equities + VIX) ──────────
    'hot-labor-to-sp500-reversal': {
        _default: 'Initial relief rally fades as labor data proves lagged — downward revisions and deteriorating fundamentals reassert.',
    },
    'hot-labor-to-nasdaq-reversal': {
        _default: 'Initial relief fades — growth stocks reprice lower as lagged labor data is revised and fundamentals deteriorate.',
    },
    'hot-labor-to-dow-reversal': {
        _default: 'Initial support fades — Dow gives back gains as lagged labor data is revised downward.',
    },
    'hot-labor-to-vix-reversal': {
        _default: 'Initial VIX compression reverses as markets realize labor data is lagged — recession fears reassert and volatility climbs.',
    },

    // ═══════════════════════════════════════════════════════════
    // SCENARIO: Unemployment Rises More Than Expected
    // ═══════════════════════════════════════════════════════════

    'high-ue-to-unemployment': {
        _default: 'Unemployment rate rises directly from the data release.',
    },
    'high-ue-to-2y': {
        _default: 'Rising unemployment brings forward rate-cut expectations.',
        inflation_scare: 'Rising unemployment normally pulls rate cuts forward, but sticky inflation keeps the Fed pinned — effect is uncertain.',
    },
    'high-ue-to-10y': {
        _default: 'Weakening labor market triggers flight-to-quality into Treasuries.',
    },
    'high-ue-to-spending': {
        _default: 'Rising unemployment reduces income and consumer confidence.',
    },
    'high-ue-to-gdp': {
        _default: 'Cooling labor market drags on consumption and GDP growth.',
    },
    'high-ue-to-wages': {
        _default: 'Slack in the labor market reduces wage pressure.',
    },
    'high-ue-to-sp500': {
        _default: 'Rising unemployment raises recession fears, pressuring equities.',
    },
    'high-ue-to-nasdaq': {
        _default: 'Labor weakness weighs on growth stock sentiment.',
    },
    'high-ue-to-dow': {
        _default: 'Rising unemployment signals economic weakness, pressuring Dow.',
    },
    'high-ue-to-vix': {
        _default: 'Rising unemployment increases economic uncertainty, lifting volatility.',
    },
    'high-ue-to-mortgage': {
        _default: 'Falling yields from labor weakness pass through to lower mortgage rates.',
    },
    'high-ue-to-housing': {
        _default: 'The demand hit from rising unemployment outweighs lower mortgage rate benefits.',
        soft_landing: 'Competing forces: lower mortgage rates help affordability, but rising unemployment dampens housing demand.',
    },
    'high-ue-to-corporate': {
        _default: 'Rising unemployment raises credit risk, widening corporate spreads.',
    },
    'high-ue-to-oil': {
        _default: 'Labor weakness signals softening demand, pressuring oil prices.',
    },
    'high-ue-to-core-cpi': {
        _default: 'Rising unemployment builds slack, gradually easing core inflation.',
    },
    'high-ue-to-job-openings': {
        _default: 'Weakening labor demand is confirmed by falling job openings.',
    },

    // ═══════════════════════════════════════════════════════════
    // SCENARIO: Consumer Spending / Retail Sales Weaker
    // ═══════════════════════════════════════════════════════════

    'weak-spend-to-spending': {
        _default: 'Consumer spending or retail sales print below expectations.',
    },
    'weak-spend-to-gdp': {
        _default: 'Consumer spending is ~70% of GDP — weakness drags growth.',
    },
    'weak-spend-to-2y': {
        _default: 'Weak demand data brings forward rate-cut expectations.',
    },
    'weak-spend-to-sp500': {
        _default: 'Weak consumer data weighs on earnings expectations and equities.',
    },
    'weak-spend-to-core-cpi': {
        _default: 'Weaker demand reduces pricing power, easing inflation over time.',
    },
    'weak-spend-to-nasdaq': {
        _default: 'Weak consumer data weighs on growth stock earnings expectations.',
    },
    'weak-spend-to-dow': {
        _default: 'Weak consumer data drags Dow via reduced revenue expectations.',
    },
    'weak-spend-to-vix': {
        _default: 'Weak spending data increases growth uncertainty and lifts volatility.',
    },
    'weak-spend-to-10y': {
        _default: 'Weak demand triggers modest flight-to-quality into Treasuries.',
    },
    'weak-spend-to-mortgage': {
        _default: 'Falling yields from weak demand data ease mortgage rates.',
    },
    'weak-spend-to-housing': {
        _default: 'Weaker consumer activity signals reduced housing demand.',
        soft_landing: 'Mixed forces on housing — weaker demand is offset by falling mortgage rates in a still-healthy economy.',
    },
    'weak-spend-to-corporate': {
        _default: 'Weak consumer demand raises credit risk, widening corporate spreads.',
    },
    'weak-spend-to-unemployment': {
        _default: 'Weak consumer spending leads firms to cut costs and slow hiring.',
    },
    'weak-spend-to-wages': {
        _default: 'Weak demand slows hiring and reduces wage bargaining power.',
    },
    'weak-spend-to-oil': {
        _default: 'Weak consumer activity signals lower energy demand.',
    },
    'weak-spend-to-core-pce': {
        _default: 'Weak spending reduces demand-pull inflation pressure on core PCE.',
    },
    'weak-spend-to-job-openings': {
        _default: 'Weaker consumer demand leads firms to reduce hiring plans.',
    },

    // ═══════════════════════════════════════════════════════════
    // SCENARIO: Credit Spreads Widen Sharply
    // ═══════════════════════════════════════════════════════════

    'credit-to-corporate': {
        _default: 'Credit spreads blow out, sharply raising corporate borrowing costs.',
    },
    'credit-to-sp500': {
        _default: 'Credit stress signals risk-off, pressuring equities broadly.',
    },
    'credit-to-vix': {
        _default: 'Financial stress lifts volatility as uncertainty spikes.',
    },
    'credit-to-10y': {
        _default: 'Credit stress triggers flight-to-quality into Treasuries, pushing yields down.',
    },
    'credit-to-gdp': {
        _default: 'Tighter credit conditions reduce investment and slow economic growth.',
    },
    'credit-to-dow': {
        _default: 'Broad risk-off sentiment drags equities including the Dow.',
    },
    'credit-to-nasdaq': {
        _default: 'Risk-off hits growth stocks especially hard during credit stress.',
    },
    'credit-to-2y': {
        _default: 'Credit stress signals growth slowdown, pulling rate-cut expectations forward.',
        inflation_scare: 'Credit stress normally pulls rate cuts forward, but sticky inflation keeps the Fed constrained — direction is uncertain.',
    },
    'credit-to-mortgage': {
        _default: 'Wider credit spreads pass through to higher mortgage rates despite falling Treasuries.',
    },
    'credit-to-housing': {
        _default: 'Higher mortgage rates and tighter lending standards reduce housing activity.',
    },
    'credit-to-spending': {
        _default: 'Tighter credit conditions reduce consumer access to credit and spending.',
    },
    'credit-to-unemployment': {
        _default: 'Tighter credit slows growth and hiring, eventually lifting unemployment.',
    },
    'credit-to-wages': {
        _default: 'Financial stress slows hiring and reduces wage bargaining power.',
    },
    'credit-to-oil': {
        _default: 'Credit stress signals growth weakness, reducing oil demand.',
    },
    'credit-to-core-cpi': {
        _default: 'Tighter credit slows demand and gradually eases core inflation.',
    },
    'credit-to-job-openings': {
        _default: 'Financial stress leads firms to freeze or reduce hiring plans.',
    },
};
