// ===== LAYER 4: CAUSAL ENGINE =====
// Processes a ScenarioRunContext through IMPACT_RULES to produce ComputedImpact[].
// Deterministic: same context + same rules = same results every time.

/**
 * Run a scenario and produce computed impacts.
 * @param {Object} context - ScenarioRunContext
 * @param {string} context.scenarioId - ID of the scenario preset
 * @param {number} context.surpriseSize - 1 (small), 2 (medium), 3 (large)
 * @param {string} context.regime - RegimeId ('soft_landing', 'late_cycle', etc.)
 * @param {string} context.persistence - 'one_off' | 'trend_confirming'
 * @returns {Object} { context, impacts: ComputedImpact[] }
 */
function runScenario(context) {
    const rules = getRulesForScenario(context.scenarioId)
        .filter(rule => !rule.appliesToRegimes || rule.appliesToRegimes.includes(context.regime));
    const preset = getScenarioPreset(context.scenarioId);

    if (!preset || rules.length === 0) {
        return { context, impacts: [] };
    }

    const impacts = rules.map((rule) => {
        const reasons = [];

        // 1. Start with base values
        let sign = rule.sign;
        let strength = rule.strength;
        let lag = rule.lag;
        let confidence = rule.confidence;
        reasons.push(`base: sign=${sign}, strength=${strength}, lag=${lag}, confidence=${confidence}`);

        // 2. Apply regime overrides if applicable
        if (rule.regimeOverrides && rule.regimeOverrides[context.regime]) {
            const overrides = rule.regimeOverrides[context.regime];
            if (overrides.sign !== undefined) sign = overrides.sign;
            if (overrides.strength !== undefined) strength = overrides.strength;
            if (overrides.lag !== undefined) lag = overrides.lag;
            if (overrides.confidence !== undefined) confidence = overrides.confidence;
            reasons.push(`regime override applied: ${context.regime}`);
        }

        // 2b. Resolve sentiment override (regime can flip semantic color)
        let sentimentOverride = null;
        if (rule.regimeOverrides && rule.regimeOverrides[context.regime] && rule.regimeOverrides[context.regime].sentiment) {
            sentimentOverride = rule.regimeOverrides[context.regime].sentiment;
        }

        // 3. Apply surprise scaling
        const sizeKey = ['small', 'medium', 'large'][context.surpriseSize - 1] || 'medium';
        if (rule.surpriseScaling && rule.surpriseScaling[sizeKey] !== undefined) {
            const scaling = rule.surpriseScaling[sizeKey];
            strength = strength * scaling;
            reasons.push(`surprise scaling: ${sizeKey} (×${scaling})`);
        }

        // 4. Persistence boost (trend-confirming gets a small bump)
        if (context.persistence === 'trend_confirming') {
            strength = strength * 1.15;
            reasons.push('persistence boost: trend_confirming (×1.15)');
        }

        // 6. Resolve explanation (regime-aware from tooltip-text.js)
        const tooltipEntry = TOOLTIP_TEXT[rule.id];
        const explanationShort = tooltipEntry?.[context.regime] || tooltipEntry?._default || '(no description)';

        return {
            targetIndicatorId: rule.targetIndicatorId,
            sign,
            strength: Math.round(strength * 100) / 100, // round to 2 decimals
            lag,
            confidence,
            mechanism: rule.mechanism,
            explanationShort,
            explanationSource: 'static_template',
            reasonsApplied: reasons,
            sentimentOverride,
        };
    });

    // Sort: immediate first, then by strength descending
    const lagOrder = { immediate: 0, short: 1, medium: 2, long: 3 };
    impacts.sort((a, b) => {
        const lagDiff = (lagOrder[a.lag] || 0) - (lagOrder[b.lag] || 0);
        if (lagDiff !== 0) return lagDiff;
        return b.strength - a.strength;
    });

    return { context, impacts };
}

/**
 * Get a human-friendly label for a lag bucket
 */
function getLagLabel(lag) {
    const labels = {
        immediate: 'Immediate (0–2 days)',
        short: 'Short (1–4 weeks)',
        medium: 'Medium (1–6 months)',
        long: 'Long (6+ months)',
    };
    return labels[lag] || lag;
}

/**
 * Get a visual strength bar (for UI rendering)
 */
function getStrengthBar(strength) {
    const maxDots = 5;
    const filled = Math.min(Math.round(strength), maxDots);
    return '●'.repeat(filled) + '○'.repeat(maxDots - filled);
}

/**
 * Get the sign arrow symbol
 */
function getSignSymbol(sign) {
    if (sign === 'up') return '↑';
    if (sign === 'down') return '↓';
    return '↕';
}

/**
 * Determine semantic sentiment: is this impact a good or bad outcome?
 * Uses the indicator's goodDirection to decide.
 * @param {string} indicatorId - the indicator being impacted
 * @param {string} impactSign - 'up', 'down', or 'mixed'
 * @returns {'positive'|'negative'|'neutral'}
 */
function getSemanticSentiment(indicatorId, impactSign, sentimentOverride) {
    if (sentimentOverride) return sentimentOverride;
    const ind = INDICATORS[indicatorId];
    if (!ind || !ind.goodDirection || impactSign === 'mixed') return 'neutral';
    return (impactSign === ind.goodDirection) ? 'positive' : 'negative';
}
