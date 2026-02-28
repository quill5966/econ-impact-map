// ===== MECHANISM REGISTRY =====
// Reusable causal mechanisms shared across impact rules.
// Each mechanism has templated descriptions using {scenarioLabel} and {targetLabel} placeholders.
// Static, versioned — changes require an app update.

const MECHANISMS = [
    {
        id: 'direct_policy_action',
        name: 'Direct policy action',
        tooltipTemplate: '{scenarioLabel} directly changes {targetLabel}.',
        longTemplate:
            'This is a direct policy lever, so the change is mechanical and immediate. The Fed sets this rate by fiat.',
    },
    {
        id: 'policy_path_repricing',
        name: 'Policy path repricing',
        tooltipTemplate: "{scenarioLabel} shifts expectations for the Fed's future rate path.",
        longTemplate:
            'Markets react to the surprise by repricing the expected path of short-term rates. Forward rates, swap curves, and Treasury yields adjust to reflect the new expected trajectory.',
    },
    {
        id: 'long_end_growth_inflation_mix',
        name: 'Long-end yield mix (growth vs inflation)',
        tooltipTemplate: '{scenarioLabel} changes growth and inflation expectations, moving {targetLabel}.',
        longTemplate:
            'The 10Y yield reflects both inflation expectations and growth/risk premium. Hawkish surprises can pull it in different directions depending on which force dominates.',
    },
    {
        id: 'discount_rate_duration_assets',
        name: 'Discount-rate effect (duration assets)',
        tooltipTemplate: 'By changing rate expectations, {scenarioLabel} tends to move {targetLabel}.',
        longTemplate:
            'Higher discount rates typically pressure long-duration equities and growth stocks, whose future cash flows are worth less in present-value terms.',
    },
    {
        id: 'risk_sentiment_volatility',
        name: 'Risk sentiment and volatility',
        tooltipTemplate: '{scenarioLabel} shifts risk appetite, often moving {targetLabel}.',
        longTemplate:
            'Risk-off shocks tend to lift volatility and pressure equities. Risk-on shocks compress vol and support risk assets.',
    },
    {
        id: 'pass_through_to_borrowing_rates',
        name: 'Pass-through to borrowing costs',
        tooltipTemplate: 'Changes in yields and spreads from {scenarioLabel} often pass through to {targetLabel}.',
        longTemplate:
            'Borrowing rates reflect a benchmark yield plus a spread; when either moves, consumer and corporate borrowing costs follow with a short lag.',
    },
    {
        id: 'financial_conditions_transmission',
        name: 'Financial conditions transmission',
        tooltipTemplate: 'If {scenarioLabel} tightens financial conditions, {targetLabel} tends to respond.',
        longTemplate:
            'Higher borrowing costs and tighter credit availability typically slow real economic activity — housing, spending, and investment all pull back.',
    },
    {
        id: 'credit_risk_repricing',
        name: 'Credit risk repricing',
        tooltipTemplate: '{scenarioLabel} reprices credit risk, often moving {targetLabel}.',
        longTemplate:
            'When stress rises, investors demand more compensation for credit risk. Spreads widen, making borrowing more expensive and reducing loan availability.',
    },
    {
        id: 'labor_market_signal',
        name: 'Labor market signal',
        tooltipTemplate: '{scenarioLabel} signals labor-market heat/cooling, often moving {targetLabel}.',
        longTemplate:
            'Labor data can affect inflation pressure, consumption, and Fed expectations. Hot labor markets push wages and spending up; cooling markets do the reverse.',
    },
    {
        id: 'demand_growth_signal',
        name: 'Demand and growth signal',
        tooltipTemplate: '{scenarioLabel} changes demand expectations, often moving {targetLabel}.',
        longTemplate:
            'Weaker demand tends to slow growth and reduce inflation pressure. Stronger demand tends to boost growth but can raise inflation concerns.',
    },
    {
        id: 'flight_to_quality',
        name: 'Flight to quality',
        tooltipTemplate: 'In risk-off conditions triggered by {scenarioLabel}, safe-haven flows tend to move {targetLabel}.',
        longTemplate:
            'Stress often drives flows into Treasuries and away from risk assets. This can push yields down even as equities fall.',
    },
];

// Helper: look up a mechanism by id
function getMechanism(mechanismId) {
    return MECHANISMS.find((m) => m.id === mechanismId) || null;
}

// Helper: render a mechanism tooltip with scenario/target labels
function renderMechanismTooltip(mechanismId, scenarioLabel, targetLabel) {
    const mech = getMechanism(mechanismId);
    if (!mech) return '';
    return mech.tooltipTemplate
        .replace(/\{scenarioLabel\}/g, scenarioLabel)
        .replace(/\{targetLabel\}/g, targetLabel);
}
