// ===== VIEW: GAUGE / DIAL SUMMARY ("Summary") =====
// Semicircular gauge dials showing net directional impact per theme.
// Needle sweeps from center on scenario activation.

const GAUGE_THEMES = [
    { id: 'markets', label: 'Markets', icon: '⚡', indicatorIds: ['sp-500', 'nasdaq', 'dow', 'vix', 'oil-barrel-price'] },
    { id: 'credit', label: 'Credit', icon: '📊', indicatorIds: ['front-end-yields-2y', 'long-end-yields-10y', 'mortgage-rates', 'corporate-borrowing'] },
    { id: 'real-economy', label: 'Real Economy', icon: '📈', indicatorIds: ['housing-starts', 'consumer-spending', 'gdp-growth', 'unemployment', 'job-openings', 'wage-growth'] },
    { id: 'inflation', label: 'Inflation', icon: '💲', indicatorIds: ['core-cpi', 'core-ppi', 'headline-cpi', 'headline-ppi', 'pce', 'core-pce'] },
    { id: 'policy', label: 'Policy', icon: '🏛️', indicatorIds: ['fed-funds-target', 'qe-qt-pace', 'forward-guidance'] },
];

/**
 * Aggregate a single directional score for a theme.
 * Returns a value from -5 (strong negative) to +5 (strong positive).
 */
function aggregateThemeScore(impacts, themeIndicatorIds) {
    const themeImpacts = impacts.filter(imp => themeIndicatorIds.includes(imp.targetIndicatorId));
    if (themeImpacts.length === 0) return 0;

    let totalWeighted = 0;
    themeImpacts.forEach(imp => {
        const sign = imp.sign === 'up' ? 1 : imp.sign === 'down' ? -1 : 0;
        totalWeighted += sign * imp.strength;
    });

    // Normalize to -5..+5 range
    const avg = totalWeighted / themeImpacts.length;
    return Math.max(-5, Math.min(5, avg));
}

/**
 * Get a human-readable descriptor for a gauge score.
 */
function getGaugeDescriptor(score) {
    if (score <= -3.5) return 'Strong Headwinds';
    if (score <= -2) return 'Hawkish Pressure';
    if (score <= -0.8) return 'Mild Headwinds';
    if (score < 0.8) return 'Broadly Neutral';
    if (score < 2) return 'Modest Tailwinds';
    if (score < 3.5) return 'Favorable';
    return 'Strong Tailwinds';
}

/**
 * Get the descriptor color class.
 */
function getGaugeDescriptorColor(score) {
    if (score <= -2) return '#F87171';
    if (score <= -0.8) return '#F87171';
    if (score < 0.8) return '#6B7280';
    if (score < 2) return '#4ADE80';
    return '#4ADE80';
}

/**
 * Generate SVG markup for a semicircular gauge.
 * @param {number} score - The score from -5 to +5
 * @param {boolean} animate - Whether to animate the needle sweep
 */
function buildGaugeSVG(score, animate) {
    const size = 200;
    const cx = size / 2;
    const cy = size / 2 + 20;
    const r = 75;

    // Semicircle arc from 180° (left) to 0° (right)
    // Score -5 = 180°, Score 0 = 90°, Score +5 = 0°
    const normalizedScore = (score + 5) / 10; // 0..1
    const needleAngle = 180 - normalizedScore * 180; // 180..0 degrees
    const needleRad = (needleAngle * Math.PI) / 180;
    const needleLength = r - 8;
    const needleX = cx + needleLength * Math.cos(needleRad);
    const needleY = cy - needleLength * Math.sin(needleRad);

    // Build the gradient arc segments
    const arcSegments = 20;
    let arcPath = '';
    for (let i = 0; i < arcSegments; i++) {
        const startAngle = Math.PI - (i / arcSegments) * Math.PI;
        const endAngle = Math.PI - ((i + 1) / arcSegments) * Math.PI;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy - r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy - r * Math.sin(endAngle);

        // Color interpolation: red → grey → green
        const t = i / arcSegments;
        let color;
        if (t < 0.5) {
            // Red → neutral grey
            const p = t * 2;
            const rr = Math.round(229 + (42 - 229) * p);
            const gg = Math.round(56 + (44 - 56) * p);
            const bb = Math.round(59 + (66 - 59) * p);
            color = `rgb(${rr},${gg},${bb})`;
        } else {
            // Neutral grey → green
            const p = (t - 0.5) * 2;
            const rr = Math.round(42 + (29 - 42) * p);
            const gg = Math.round(44 + (185 - 44) * p);
            const bb = Math.round(66 + (84 - 66) * p);
            color = `rgb(${rr},${gg},${bb})`;
        }

        arcPath += `<path d="M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}" 
            stroke="${color}" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.6"/>`;
    }

    // Needle
    const animateAttr = animate
        ? `style="transform-origin: ${cx}px ${cy}px; animation: needle-sweep 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;"`
        : '';

    // Tick marks at key positions
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => {
        const angle = Math.PI - t * Math.PI;
        const outerR = r + 6;
        const innerR = r - 6;
        return `<line 
            x1="${cx + innerR * Math.cos(angle)}" y1="${cy - innerR * Math.sin(angle)}"
            x2="${cx + outerR * Math.cos(angle)}" y2="${cy - outerR * Math.sin(angle)}"
            stroke="#2A2F42" stroke-width="1.5"/>`;
    }).join('');

    return `<svg viewBox="0 0 ${size} ${size / 2 + 50}" class="gauge-svg">
        ${arcPath}
        ${ticks}
        <circle cx="${cx}" cy="${cy}" r="6" fill="#1F2330"/>
        <line x1="${cx}" y1="${cy}" x2="${needleX}" y2="${needleY}" 
            stroke="#F0F2F8" stroke-width="2.5" stroke-linecap="round"
            class="gauge-needle" ${animateAttr}/>
        <circle cx="${cx}" cy="${cy}" r="4" fill="#6C63FF"/>
    </svg>`;
}

/**
 * Render the gauges view into the container.
 */
function renderGaugesView(container) {
    const hasScenario = !!activeScenarioResult;

    if (!hasScenario) {
        // Empty state — all needles at center
        let gaugesHtml = GAUGE_THEMES.map(theme => {
            const svg = buildGaugeSVG(0, false);
            return `<div class="gauge-card gauge-empty">
                ${svg}
                <div class="gauge-label">${theme.icon} ${theme.label}</div>
                <div class="gauge-descriptor" style="color: rgba(255,255,255,0.3)">Neutral</div>
            </div>`;
        }).join('');

        container.innerHTML = `<div class="gauges-view">
            <div class="gauges-row">${gaugesHtml}</div>
            <div class="gauges-empty-prompt">
                <div class="gauges-empty-text">Gauges show net impact once a scenario is selected</div>
            </div>
        </div>`;
        return;
    }

    // Active scenario — compute scores and render
    const impacts = activeScenarioResult.impacts;
    const preset = getScenarioPreset(activeScenarioResult.context.scenarioId);
    const summaryText = preset ? preset.plainEnglishSummary : '';

    let gaugesHtml = GAUGE_THEMES.map(theme => {
        const score = aggregateThemeScore(impacts, theme.indicatorIds);
        const descriptor = getGaugeDescriptor(score);
        const descriptorColor = getGaugeDescriptorColor(score);
        const svg = buildGaugeSVG(score, true);

        // Find top impacted indicators for this theme
        const themeImpacts = impacts
            .filter(imp => theme.indicatorIds.includes(imp.targetIndicatorId))
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 4);

        let detailCardsHtml = themeImpacts.map(imp => {
            const ind = INDICATORS[imp.targetIndicatorId];
            if (!ind) return '';
            const arrow = imp.sign === 'up' ? '↑' : imp.sign === 'down' ? '↓' : '↕';
            const dirClass = imp.sign === 'up' ? 'positive' : imp.sign === 'down' ? 'negative' : 'mixed';
            return `<div class="gauge-detail-card">
                <span class="gdc-arrow ${dirClass}">${arrow}</span>
                <span class="gdc-name">${ind.name}</span>
                <span class="gdc-strength">${getStrengthBar(imp.strength)}</span>
            </div>`;
        }).join('');

        return `<div class="gauge-card" data-theme="${theme.id}">
            ${svg}
            <div class="gauge-label">${theme.icon} ${theme.label}</div>
            <div class="gauge-descriptor" style="color:${descriptorColor}">${descriptor}</div>
            <div class="gauge-detail" style="display:none;">${detailCardsHtml}</div>
        </div>`;
    }).join('');

    container.innerHTML = `<div class="gauges-view">
        <div class="gauges-row">${gaugesHtml}</div>
        ${summaryText ? `<div class="gauges-summary">${summaryText}</div>` : ''}
    </div>`;

    // Wire gauge click to expand detail
    container.querySelectorAll('.gauge-card[data-theme]').forEach(card => {
        card.addEventListener('click', () => {
            const detail = card.querySelector('.gauge-detail');
            if (detail) {
                const isOpen = detail.style.display !== 'none';
                // Close all others first
                container.querySelectorAll('.gauge-detail').forEach(d => d.style.display = 'none');
                container.querySelectorAll('.gauge-card').forEach(c => c.classList.remove('expanded'));
                if (!isOpen) {
                    detail.style.display = 'block';
                    card.classList.add('expanded');
                }
            }
        });
    });
}
