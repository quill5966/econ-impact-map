// ===== MACROCAUSAL APP =====
// Uses the 4-layer hybrid architecture:
//   L1: indicators.js  — indicator definitions + observations
//   L2: scenarios.js   — scenario presets
//   L3: impact-rules.js + mechanisms.js — causal graph
//   L4: causal-engine.js — deterministic engine

// ===== STATE =====

let NODES = [];
const EDGES = [];
let selectedNodeId = null;
let activeScenarioResult = null;

// ===== LAYOUT =====

function getCanvasCenter() {
    return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 10,
    };
}

function getRingRadius() {
    const rootStyles = getComputedStyle(document.documentElement);
    return parseInt(rootStyles.getPropertyValue('--ring-radius')) || 280;
}

function getNodePositions() {
    const center = getCanvasCenter();
    const radius = getRingRadius();
    const count = NODES.length;
    const startAngle = -90;

    return NODES.map((node, i) => {
        const angleDeg = startAngle + (360 / count) * i;
        const angleRad = (angleDeg * Math.PI) / 180;
        return {
            id: node.id,
            x: center.x + radius * Math.cos(angleRad),
            y: center.y + radius * Math.sin(angleRad),
            angle: angleDeg,
        };
    });
}

// ===== NODE RENDERING =====

function getImpactForIndicator(indicatorId) {
    if (!activeScenarioResult) return null;
    return activeScenarioResult.impacts.find((imp) => imp.targetIndicatorId === indicatorId) || null;
}

function createNodeElement(node) {
    const el = document.createElement('div');
    el.className = 'node';
    el.id = `node-${node.id}`;
    el.dataset.theme = node.theme;
    el.dataset.nodeId = node.id;

    el.innerHTML = `
    <div class="selection-ring"></div>
    <div class="node-content">
      <div class="node-header">
        <span class="node-icon">${node.icon}</span>
        <span class="node-title">${node.title}</span>
      </div>
      <div class="sub-items">
        <span class="sub-header-name"></span>
        <span class="sub-header-col">Value</span>
        <span class="sub-header-col">Period</span>
        ${node.subItems
            .map((si) => {
                const impact = getImpactForIndicator(si.id);
                const impactClass = impact ? `impact-${impact.sign}` : '';
                const impactBadge = impact
                    ? `<span class="impact-badge ${impact.sign}" title="${impact.explanationShort}">${getSignSymbol(impact.sign)} ${getStrengthBar(impact.strength)}</span>`
                    : '';
                return `
          <span class="sub-item-name ${impactClass}" title="Source: ${si.source || '—'}">${si.name}${impactBadge}</span>
          <span class="sub-item-value ${si.sentiment || 'neutral'}">${si.value}</span>
          <span class="sub-item-period">${si.period || '—'}</span>
        `;
            })
            .join('')}
      </div>
    </div>
  `;

    return el;
}

function renderNodes() {
    const layer = document.getElementById('nodesLayer');
    layer.innerHTML = '';
    const positions = getNodePositions();

    NODES.forEach((node, i) => {
        const el = createNodeElement(node);
        const pos = positions[i];
        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
        layer.appendChild(el);
    });
}

// ===== SVG ARROW RENDERING =====

function getNodeCenter(nodeId) {
    const positions = getNodePositions();
    const pos = positions.find((p) => p.id === nodeId);
    return pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 };
}

function getNodeRadius() {
    const rootStyles = getComputedStyle(document.documentElement);
    const cardWidth = parseInt(rootStyles.getPropertyValue('--card-width')) || 280;
    return cardWidth / 2 + 10;
}

function calcArrowPath(fromPos, toPos, nodeRadius) {
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const center = getCanvasCenter();
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;

    const toCenterX = center.x - midX;
    const toCenterY = center.y - midY;
    const toCenterDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);

    const curvature = -0.5;
    const cpX = midX + (toCenterX / toCenterDist) * dist * curvature;
    const cpY = midY + (toCenterY / toCenterDist) * dist * curvature;

    const fromToCpX = cpX - fromPos.x;
    const fromToCpY = cpY - fromPos.y;
    const fromToCpDist = Math.sqrt(fromToCpX * fromToCpX + fromToCpY * fromToCpY);
    const startX = fromPos.x + (fromToCpX / fromToCpDist) * (nodeRadius + 4);
    const startY = fromPos.y + (fromToCpY / fromToCpDist) * (nodeRadius + 4);

    const cpToToX = toPos.x - cpX;
    const cpToToY = toPos.y - cpY;
    const cpToToDist = Math.sqrt(cpToToX * cpToToX + cpToToY * cpToToY);
    const endX = toPos.x - (cpToToX / cpToToDist) * (nodeRadius + 14);
    const endY = toPos.y - (cpToToY / cpToToDist) * (nodeRadius + 14);

    const labelX = 0.25 * startX + 0.5 * cpX + 0.25 * endX;
    const labelY = 0.25 * startY + 0.5 * cpY + 0.25 * endY;

    return {
        path: `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`,
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        cp: { x: cpX, y: cpY },
        labelPos: { x: labelX, y: labelY },
    };
}

function renderArrows() {
    const svg = document.getElementById('arrowsSvg');
    const defs = svg.querySelector('defs');
    defs.innerHTML = '';

    svg.querySelectorAll('.arrow-path, .flow-particle').forEach((el) => el.remove());
    document.querySelectorAll('.edge-label').forEach((el) => el.remove());

    const nodeRadius = getNodeRadius();

    EDGES.forEach((edge) => {
        const fromNode = NODES.find((n) => n.id === edge.from);
        const toNode = NODES.find((n) => n.id === edge.to);
        const fromPos = getNodeCenter(edge.from);
        const toPos = getNodeCenter(edge.to);

        const { path, labelPos } = calcArrowPath(fromPos, toPos, nodeRadius);

        const gradientId = `grad-${edge.id}`;
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.id = gradientId;
        gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
        gradient.setAttribute('x1', fromPos.x);
        gradient.setAttribute('y1', fromPos.y);
        gradient.setAttribute('x2', toPos.x);
        gradient.setAttribute('y2', toPos.y);

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', `rgb(${fromNode.color.join(',')})`);
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', `rgb(${toNode.color.join(',')})`);
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);

        const markerId = `marker-${edge.id}`;
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.id = markerId;
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '8');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '4');
        marker.setAttribute('orient', 'auto');
        marker.classList.add('arrow-marker');
        const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        markerPath.setAttribute('d', 'M 0 0 L 10 4 L 0 8 L 3 4 Z');
        markerPath.setAttribute('fill', `rgb(${toNode.color.join(',')})`);
        markerPath.setAttribute('fill-opacity', '0.7');
        marker.appendChild(markerPath);
        defs.appendChild(marker);

        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.classList.add('arrow-path');
        pathEl.id = `edge-${edge.id}`;
        pathEl.setAttribute('d', path);
        pathEl.setAttribute('stroke', `url(#${gradientId})`);
        pathEl.setAttribute('marker-end', `url(#${markerId})`);
        pathEl.dataset.from = edge.from;
        pathEl.dataset.to = edge.to;
        svg.appendChild(pathEl);

        const flowEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        flowEl.classList.add('flow-particle');
        flowEl.id = `flow-${edge.id}`;
        flowEl.setAttribute('d', path);
        flowEl.setAttribute('stroke', `url(#${gradientId})`);
        flowEl.dataset.from = edge.from;
        flowEl.dataset.to = edge.to;

        const pathLength = pathEl.getTotalLength ? pathEl.getTotalLength() : 300;
        flowEl.setAttribute('stroke-dasharray', `${pathLength * 0.15} ${pathLength * 0.85}`);
        flowEl.setAttribute('stroke-dashoffset', pathLength);
        svg.appendChild(flowEl);

        animateFlow(flowEl, pathLength);

        const labelEl = document.createElement('div');
        labelEl.className = 'edge-label';
        labelEl.style.left = `${labelPos.x}px`;
        labelEl.style.top = `${labelPos.y}px`;
        labelEl.innerHTML = `<span class="edge-label-text">${edge.label}</span>`;
        document.getElementById('canvas').appendChild(labelEl);
    });
}

function animateFlow(el, pathLength) {
    const duration = 3000 + Math.random() * 1500;
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = ((timestamp - start) % duration) / duration;
        const offset = pathLength - progress * pathLength * 2;
        el.setAttribute('stroke-dashoffset', offset);
        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

// ===== INTERACTION =====

function selectNode(nodeId) {
    document.querySelectorAll('.node.selected').forEach((el) => el.classList.remove('selected'));
    document.querySelectorAll('.arrow-path.highlighted').forEach((el) => el.classList.remove('highlighted'));
    document.querySelectorAll('.flow-particle.active').forEach((el) => el.classList.remove('active'));

    if (selectedNodeId === nodeId) {
        selectedNodeId = null;
        return;
    }

    selectedNodeId = nodeId;

    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (nodeEl) nodeEl.classList.add('selected');

    document.querySelectorAll('.arrow-path').forEach((pathEl) => {
        if (pathEl.dataset.from === nodeId || pathEl.dataset.to === nodeId) {
            pathEl.classList.add('highlighted');
        }
    });

    document.querySelectorAll('.flow-particle').forEach((flowEl) => {
        if (flowEl.dataset.from === nodeId || flowEl.dataset.to === nodeId) {
            flowEl.classList.add('active');
        }
    });
}

function initInteractions() {
    document.getElementById('nodesLayer').addEventListener('click', (e) => {
        const node = e.target.closest('.node');
        if (node) {
            e.stopPropagation();
            selectNode(node.dataset.nodeId);
        }
    });

    document.getElementById('canvas').addEventListener('click', (e) => {
        if (!e.target.closest('.node') && !e.target.closest('.edge-label') && !e.target.closest('.scenario-panel')) {
            selectNode(null);
        }
    });
}

// ===== SCENARIO PANEL =====

function buildScenarioPanel() {
    const panel = document.getElementById('scenarioPanel');

    // Group scenarios by shockType
    const groups = {};
    SCENARIO_PRESETS.forEach((s) => {
        if (!groups[s.shockType]) groups[s.shockType] = [];
        groups[s.shockType].push(s);
    });

    let html = `
        <div class="scenario-panel-header">
            <span class="scenario-panel-title">📋 Scenarios</span>
            <button class="scenario-clear-btn" id="clearScenario" title="Clear scenario">✕</button>
        </div>
        <div class="scenario-controls">
            <div class="scenario-control-group">
                <label>Surprise Size</label>
                <div class="scenario-toggle" id="surpriseSizeToggle">
                    <button data-value="1" class="toggle-btn">S</button>
                    <button data-value="2" class="toggle-btn active">M</button>
                    <button data-value="3" class="toggle-btn">L</button>
                </div>
            </div>
            <div class="scenario-control-group">
                <label>Regime</label>
                <select id="regimeSelect" class="scenario-select">
                    <option value="soft_landing" selected>Soft Landing</option>
                    <option value="late_cycle">Late Cycle</option>
                    <option value="recession_risk">Recession Risk</option>
                    <option value="inflation_scare">Inflation Scare</option>
                    <option value="financial_stress">Financial Stress</option>
                </select>
            </div>
            <div class="scenario-control-group">
                <label class="scenario-checkbox-label">
                    <input type="checkbox" id="pricedInCheck"> Already priced in
                </label>
            </div>
        </div>
        <div class="scenario-list">
    `;

    for (const [type, scenarios] of Object.entries(groups)) {
        const typeLabel = SHOCK_TYPE_LABELS[type] || type;
        html += `<div class="scenario-group-label">${typeLabel}</div>`;
        scenarios.forEach((s) => {
            html += `
                <button class="scenario-btn" data-scenario-id="${s.id}" title="${s.descriptionShort}">
                    ${s.title}
                </button>
            `;
        });
    }

    html += '</div>';

    // Impact results area
    html += '<div class="scenario-results" id="scenarioResults"></div>';

    panel.innerHTML = html;

    // Wire up events
    panel.querySelectorAll('.scenario-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            panel.querySelectorAll('.scenario-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            executeScenario(btn.dataset.scenarioId);
        });
    });

    document.getElementById('clearScenario').addEventListener('click', clearScenario);

    // Surprise size toggle
    document.getElementById('surpriseSizeToggle').addEventListener('click', (e) => {
        const btn = e.target.closest('.toggle-btn');
        if (!btn) return;
        document.querySelectorAll('#surpriseSizeToggle .toggle-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        rerunActiveScenario();
    });

    // Regime select
    document.getElementById('regimeSelect').addEventListener('change', rerunActiveScenario);

    // Priced-in checkbox
    document.getElementById('pricedInCheck').addEventListener('change', rerunActiveScenario);
}

function getScenarioContext(scenarioId) {
    const surpriseSize = parseInt(
        document.querySelector('#surpriseSizeToggle .toggle-btn.active')?.dataset.value || '2'
    );
    const regime = document.getElementById('regimeSelect')?.value || 'soft_landing';
    const marketAlreadyPricedIn = document.getElementById('pricedInCheck')?.checked || false;

    return {
        scenarioId,
        surpriseSize,
        regime,
        marketAlreadyPricedIn,
        persistence: 'one_off',
    };
}

function executeScenario(scenarioId) {
    const context = getScenarioContext(scenarioId);
    activeScenarioResult = runScenario(context);
    renderNodes();
    renderArrows();
    renderScenarioResults();
}

function rerunActiveScenario() {
    const activeBtn = document.querySelector('.scenario-btn.active');
    if (activeBtn) {
        executeScenario(activeBtn.dataset.scenarioId);
    }
}

function clearScenario() {
    activeScenarioResult = null;
    document.querySelectorAll('.scenario-btn').forEach((b) => b.classList.remove('active'));
    document.getElementById('scenarioResults').innerHTML = '';
    renderNodes();
    renderArrows();
}

function renderScenarioResults() {
    const container = document.getElementById('scenarioResults');
    if (!activeScenarioResult || activeScenarioResult.impacts.length === 0) {
        container.innerHTML = '';
        return;
    }

    const preset = getScenarioPreset(activeScenarioResult.context.scenarioId);
    const ctx = activeScenarioResult.context;

    let html = `
        <div class="results-header">
            <div class="results-title">${preset.title}</div>
            <div class="results-meta">
                Size: ${'●'.repeat(ctx.surpriseSize)}${'○'.repeat(3 - ctx.surpriseSize)} · 
                Regime: ${ctx.regime.replace(/_/g, ' ')}
                ${ctx.marketAlreadyPricedIn ? ' · Priced in' : ''}
            </div>
        </div>
        <div class="results-list">
    `;

    activeScenarioResult.impacts.forEach((impact) => {
        const indicator = INDICATORS[impact.targetIndicatorId];
        const name = indicator ? indicator.name : impact.targetIndicatorId;
        const mech = getMechanism(impact.mechanism);
        const mechName = mech ? mech.name : impact.mechanism;

        html += `
            <div class="result-row impact-${impact.sign}">
                <span class="result-sign">${getSignSymbol(impact.sign)}</span>
                <span class="result-name">${name}</span>
                <span class="result-strength">${getStrengthBar(impact.strength)}</span>
                <span class="result-lag">${impact.lag}</span>
                <span class="result-tooltip" title="${impact.explanationShort}\n\nMechanism: ${mechName}\nConfidence: ${impact.confidence}/5">ⓘ</span>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ===== TIMESTAMP =====

function updateTimestamp() {
    const el = document.getElementById('timestamp');
    const now = new Date();
    const opts = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    };
    el.textContent = now.toLocaleDateString('en-US', opts);
}

// ===== INIT =====

function init() {
    // Build NODES from indicators.js data
    NODES = buildNodes();

    updateTimestamp();
    renderNodes();
    renderArrows();
    initInteractions();
    buildScenarioPanel();
}

// Re-render on resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        renderNodes();
        renderArrows();
    }, 200);
});

// Boot
document.addEventListener('DOMContentLoaded', init);
