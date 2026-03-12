// ===== VIEW: HEATMAP GRID ("Full Picture") =====
// Renders a 2D grid: rows = indicators grouped by theme, columns = time horizons.
// Each cell is color-coded by impact direction and magnitude.

// ── Theme-to-label mapping for display ──
const HEATMAP_THEMES = [
    { id: 'policy-instruments', label: 'Policy Instruments', icon: '🏛️' },
    { id: 'financial', label: 'Financial Conditions', icon: '📊' },
    { id: 'real-economy', label: 'Real Economy', icon: '📈' },
    { id: 'inflation', label: 'Inflation', icon: '💲' },
    { id: 'exogenous', label: 'Market Pricing & Risk', icon: '⚡' },
];

const HEATMAP_TIME_HORIZONS = [
    { id: 'immediate', label: 'Immediate', sublabel: 'Minutes – Days' },
    { id: 'short', label: 'Short-term', sublabel: 'Days – Weeks' },
    { id: 'medium', label: 'Medium-term', sublabel: 'Weeks – Months' },
    { id: 'long', label: 'Longer-term', sublabel: 'Months+' },
];

let heatmapActiveThemeFilter = null;
let heatmapHiddenColumns = new Set();

/**
 * Get the impact color for a cell based on semantic sentiment and magnitude.
 * Returns a CSS color string.
 */
function getHeatmapCellColor(sentiment, strength) {
    if (!sentiment || sentiment === 'neutral') return '#1F2330';

    // Clamp strength to 1–5 (darker = higher severity)
    const s = Math.min(Math.max(Math.round(strength), 1), 5);

    if (sentiment === 'positive') {
        // Green fills — darker = stronger
        const fills = ['#1DB954', '#17A349', '#0F7A35', '#0A5226', '#073D1C'];
        return fills[s - 1];
    } else if (sentiment === 'negative') {
        // Red fills — darker = stronger
        const fills = ['#E5383B', '#C1121F', '#8B0000', '#5C0A0A', '#3A0505'];
        return fills[s - 1];
    } else {
        // Mixed — muted gold, darker = stronger
        const fills = ['#9B8528', '#7A6920', '#5C4F18', '#3D3510', '#2A2309'];
        return fills[s - 1];
    }
}

/**
 * Get the text color for a direction badge inside a cell.
 */
function getHeatmapDirectionColor(sentiment) {
    if (sentiment === 'positive') return '#4ADE80';
    if (sentiment === 'negative') return '#F87171';
    if (sentiment === 'neutral') return '#EAB308';
    return '#6B7280';
}

/**
 * Render the full heatmap view into the container.
 */
function renderHeatmapView(container) {
    const hasScenario = !!activeScenarioResult;

    // Build the filter bar
    let filterHtml = `<div class="heatmap-filters">
        <div class="heatmap-theme-filters">
            <button class="filter-chip ${!heatmapActiveThemeFilter ? 'active' : ''}" data-theme="all">All</button>
            ${HEATMAP_THEMES.map(t =>
        `<button class="filter-chip ${heatmapActiveThemeFilter === t.id ? 'active' : ''}" data-theme="${t.id}">${t.icon} ${t.label}</button>`
    ).join('')}
        </div>
        <div class="heatmap-col-toggles">
            ${HEATMAP_TIME_HORIZONS.map(h =>
        `<label class="heatmap-col-toggle">
                    <input type="checkbox" ${!heatmapHiddenColumns.has(h.id) ? 'checked' : ''} data-horizon="${h.id}">
                    <span>${h.label}</span>
                </label>`
    ).join('')}
        </div>
    </div>`;

    // Build the grid table
    let tableHtml = `<div class="heatmap-table-wrapper"><table class="heatmap-table">
        <thead>
            <tr>
                <th class="heatmap-indicator-header">Indicator</th>
                <th class="heatmap-baseline-header"><span class="hth-label">Baseline</span><span class="hth-sublabel">Current</span></th>
                ${HEATMAP_TIME_HORIZONS.filter(h => !heatmapHiddenColumns.has(h.id)).map(h =>
        `<th class="heatmap-time-header"><span class="hth-label">${h.label}</span><span class="hth-sublabel">${h.sublabel}</span></th>`
    ).join('')}
            </tr>
        </thead>
        <tbody>`;

    // Group indicators by theme
    HEATMAP_THEMES.forEach(theme => {
        if (heatmapActiveThemeFilter && heatmapActiveThemeFilter !== theme.id) return;

        const indicators = Object.values(INDICATORS).filter(ind => ind.category === theme.id);
        if (indicators.length === 0) return;

        // Theme group header row
        tableHtml += `<tr class="heatmap-theme-row">
            <td class="heatmap-theme-cell" colspan="${2 + HEATMAP_TIME_HORIZONS.filter(h => !heatmapHiddenColumns.has(h.id)).length}">
                <span class="heatmap-theme-icon">${theme.icon}</span> ${theme.label}
            </td>
        </tr>`;

        // Indicator rows
        indicators.forEach(ind => {
            tableHtml += `<tr class="heatmap-indicator-row" data-indicator="${ind.id}">
                <td class="heatmap-indicator-name">${ind.name}</td>
                <td class="heatmap-baseline-cell" title="Source: ${ind.source}&#10;Effective date: ${ind.observation ? ind.observation.period : ''}">${ind.observation ? ind.observation.value : '—'}</td>`;

            HEATMAP_TIME_HORIZONS.forEach(horizon => {
                if (heatmapHiddenColumns.has(horizon.id)) return;

                // Find this indicator's impact at this lag
                let impact = null;
                if (hasScenario) {
                    impact = activeScenarioResult.impacts.find(
                        imp => imp.targetIndicatorId === ind.id && imp.lag === horizon.id
                    );
                }

                if (impact) {
                    const sentiment = getSemanticSentiment(ind.id, impact.sign);
                    const bgColor = getHeatmapCellColor(sentiment, impact.strength);
                    const dirColor = getHeatmapDirectionColor(sentiment);
                    const arrow = impact.sign === 'up' ? '↑' : impact.sign === 'down' ? '↓' : '↕';
                    tableHtml += `<td class="heatmap-cell heatmap-cell-active" style="background:${bgColor}" 
                        data-indicator="${ind.id}" data-lag="${horizon.id}"
                        title="${ind.name} — ${impact.explanationShort}">
                        <span class="heatmap-cell-arrow" style="color:${dirColor}">${arrow}</span>
                    </td>`;
                } else {
                    tableHtml += `<td class="heatmap-cell heatmap-cell-empty"></td>`;
                }
            });

            tableHtml += `</tr>`;
        });
    });

    tableHtml += `</tbody></table></div>`;

    // Empty state overlay
    let emptyOverlay = '';
    if (!hasScenario) {
        emptyOverlay = `<div class="empty-state empty-state--overlay">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-title">Select a scenario to see impacts</div>
            <div class="empty-state-text">The grid shows how each indicator is affected across time horizons</div>
        </div>`;
    }

    container.innerHTML = `<div class="heatmap-view">${filterHtml}${tableHtml}${emptyOverlay}</div>`;

    // Wire filter chips
    container.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const theme = chip.dataset.theme;
            heatmapActiveThemeFilter = theme === 'all' ? null : theme;
            renderHeatmapView(container);
        });
    });

    // Wire column toggles
    container.querySelectorAll('.heatmap-col-toggle input').forEach(cb => {
        cb.addEventListener('change', () => {
            const horizon = cb.dataset.horizon;
            if (cb.checked) {
                heatmapHiddenColumns.delete(horizon);
            } else {
                heatmapHiddenColumns.add(horizon);
            }
            renderHeatmapView(container);
        });
    });

    // Wire cell hover tooltips
    container.querySelectorAll('.heatmap-cell-active').forEach(cell => {
        cell.addEventListener('mouseenter', (e) => {
            showHeatmapTooltip(e, cell.dataset.indicator, cell.dataset.lag);
        });
        cell.addEventListener('mouseleave', hideHeatmapTooltip);
    });
}

/**
 * Show a tooltip for a heatmap cell.
 */
function showHeatmapTooltip(event, indicatorId, lag) {
    hideHeatmapTooltip();

    const ind = INDICATORS[indicatorId];
    const impact = activeScenarioResult?.impacts.find(
        imp => imp.targetIndicatorId === indicatorId && imp.lag === lag
    );
    if (!ind || !impact) return;

    const arrow = impact.sign === 'up' ? '↑' : impact.sign === 'down' ? '↓' : '↕';
    const sentiment = getSemanticSentiment(indicatorId, impact.sign);
    const dirColor = getHeatmapDirectionColor(sentiment);
    const lagLabel = getLagLabel(impact.lag);

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.id = 'heatmapTooltip';
    tooltip.innerHTML = `
        <div class="htt-header">
            <span class="htt-arrow" style="color:${dirColor}">${arrow}</span>
            <span class="htt-name">${ind.name}</span>
            <span class="htt-strength">${getStrengthBar(impact.strength)}</span>
        </div>
        <div class="htt-explanation">${impact.explanationShort}</div>
        <div class="htt-meta">
            <span>${lagLabel}</span>
            <span class="htt-sep">·</span>
            <span>Current: ${ind.observation ? ind.observation.value : '—'}</span>
        </div>
    `;

    document.body.appendChild(tooltip);

    // Position near the cell, clamped to viewport
    const rect = event.target.getBoundingClientRect();
    const ttRect = tooltip.getBoundingClientRect();
    const margin = 12;

    // Vertical: prefer below, flip above if it would overflow
    let top = rect.bottom + 8;
    if (top + ttRect.height > window.innerHeight - margin) {
        top = rect.top - ttRect.height - 8;
    }

    // Horizontal: center on cell, clamp to viewport edges
    let left = rect.left + rect.width / 2;
    const halfW = ttRect.width / 2;
    if (left - halfW < margin) left = halfW + margin;
    if (left + halfW > window.innerWidth - margin) left = window.innerWidth - halfW - margin;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function hideHeatmapTooltip() {
    const existing = document.getElementById('heatmapTooltip');
    if (existing) existing.remove();
}
