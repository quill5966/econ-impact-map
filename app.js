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
    // Offset for top-bar (56px) + scenario banner (48px)
    const topOffset = 104;
    return {
        x: window.innerWidth / 2,
        y: (window.innerHeight + topOffset) / 2,
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

    const hasActiveScenario = !!activeScenarioResult;

    el.innerHTML = `
    <div class="selection-ring"></div>
    <div class="node-content">
      <div class="node-header">
        <span class="node-icon">${node.icon}</span>
        <span class="node-title">${node.title}</span>
      </div>
      <div class="sub-items ${hasActiveScenario ? 'has-impact-col' : ''}">
        <span class="sub-header-name"></span>
        <span class="sub-header-col">Value</span>
        <span class="sub-header-col">Period</span>
        ${hasActiveScenario ? '<span class="sub-header-col impact-col-header">Impact</span>' : ''}
        ${node.subItems
            .map((si) => {
                const impact = getImpactForIndicator(si.id);
                const impactClass = impact ? `impact-${impact.sign}` : '';
                const impactCell = hasActiveScenario
                    ? (impact
                        ? `<span class="sub-item-impact impact-${impact.sign}" title="${impact.explanationShort}">${getSignSymbol(impact.sign)} ${getStrengthBar(impact.strength)}</span>`
                        : '<span class="sub-item-impact">—</span>')
                    : '';
                return `
          <span class="sub-item-name ${impactClass}" title="Source: ${si.source || '—'}">${si.name}</span>
          <span class="sub-item-value ${si.sentiment || 'neutral'}">${si.value}</span>
          <span class="sub-item-period">${si.period || '—'}</span>
          ${impactCell}
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

// ===== IMPACT PROPAGATION ARROWS =====

// Dash patterns per lag bucket (visually differentiates timing)
const LAG_DASH_PATTERNS = {
    immediate: '',               // solid
    short: '10,5',           // dashed
    medium: '4,6',            // dotted
    long: '2,8',            // sparse dots
};

const LAG_COLORS = {
    immediate: '#4ade80',        // green
    short: '#60a5fa',        // blue
    medium: '#eab308',        // gold
    long: '#f87171',        // red
};

function getCategoryForIndicator(indicatorId) {
    const ind = INDICATORS[indicatorId];
    return ind ? ind.category : null;
}

function renderImpactArrows() {
    const svg = document.getElementById('arrowsSvg');

    // Remove previous impact arrows and labels
    svg.querySelectorAll('.impact-arrow').forEach((el) => el.remove());
    document.querySelectorAll('.impact-lag-label').forEach((el) => el.remove());

    if (!activeScenarioResult || activeScenarioResult.impacts.length === 0) return;

    const preset = getScenarioPreset(activeScenarioResult.context.scenarioId);
    if (!preset) return;

    const sourceCategory = getCategoryForIndicator(preset.primaryShockNode);
    const sourceNodeId = sourceCategory;
    const nodeRadius = getNodeRadius();
    const defs = svg.querySelector('defs');
    const center = getCanvasCenter();

    // Collect unique target theme nodes (skip self)
    const targetCategories = new Map();
    activeScenarioResult.impacts.forEach((impact) => {
        const cat = getCategoryForIndicator(impact.targetIndicatorId);
        if (!cat || cat === sourceCategory) return;
        const lagOrder = { immediate: 0, short: 1, medium: 2, long: 3 };
        const existing = targetCategories.get(cat);
        if (!existing || lagOrder[impact.lag] < lagOrder[existing.lag]) {
            targetCategories.set(cat, { lag: impact.lag, sign: impact.sign });
        }
    });

    // Display labels for lag buckets (no icons)
    const lagDisplayLabels = {
        immediate: 'minutes to days',
        short: 'days to weeks',
        medium: 'months',
        long: 'months',
    };

    // Draw a unique arrow for each target node with per-arrow curvature offset
    let arrowIndex = 0;
    const totalArrows = targetCategories.size;

    targetCategories.forEach(({ lag, sign }, targetNodeId) => {
        const fromPos = getNodeCenter(sourceNodeId);
        const toPos = getNodeCenter(targetNodeId);

        if (fromPos.x === 0 && fromPos.y === 0) return;
        if (toPos.x === 0 && toPos.y === 0) return;

        // Unique curvature per arrow so they don't overlap
        const baseCurvature = -0.35;
        const curvatureOffset = totalArrows > 1
            ? (arrowIndex / (totalArrows - 1) - 0.5) * 0.3
            : 0;
        const curvature = baseCurvature + curvatureOffset;

        // Custom path calculation with tight endpoint
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        const toCenterX = center.x - midX;
        const toCenterY = center.y - midY;
        const toCenterDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY) || 1;

        const cpX = midX + (toCenterX / toCenterDist) * dist * curvature;
        const cpY = midY + (toCenterY / toCenterDist) * dist * curvature;

        // Start: offset from source node center
        const fromToCpX = cpX - fromPos.x;
        const fromToCpY = cpY - fromPos.y;
        const fromToCpDist = Math.sqrt(fromToCpX * fromToCpX + fromToCpY * fromToCpY) || 1;
        const startX = fromPos.x + (fromToCpX / fromToCpDist) * (nodeRadius + 2);
        const startY = fromPos.y + (fromToCpY / fromToCpDist) * (nodeRadius + 2);

        // End: very close to target node border
        const cpToToX = toPos.x - cpX;
        const cpToToY = toPos.y - cpY;
        const cpToToDist = Math.sqrt(cpToToX * cpToToX + cpToToY * cpToToY) || 1;
        const endX = toPos.x - (cpToToX / cpToToDist) * (nodeRadius + 2);
        const endY = toPos.y - (cpToToY / cpToToDist) * (nodeRadius + 2);

        // Label at midpoint of curve
        const labelX = 0.25 * startX + 0.5 * cpX + 0.25 * endX;
        const labelY = 0.25 * startY + 0.5 * cpY + 0.25 * endY;

        const pathD = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;
        const color = LAG_COLORS[lag] || '#9b5fff';
        const dashPattern = LAG_DASH_PATTERNS[lag] || '';

        // Arrowhead marker
        const markerId = `impact-marker-${sourceNodeId}-${targetNodeId}`;
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.id = markerId;
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '8');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '4');
        marker.setAttribute('orient', 'auto');
        const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        markerPath.setAttribute('d', 'M 0 0 L 10 4 L 0 8 L 3 4 Z');
        markerPath.setAttribute('fill', color);
        markerPath.setAttribute('fill-opacity', '0.85');
        marker.appendChild(markerPath);
        defs.appendChild(marker);

        // Arrow path
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.classList.add('impact-arrow');
        pathEl.setAttribute('d', pathD);
        pathEl.setAttribute('stroke', color);
        pathEl.setAttribute('stroke-width', '2.5');
        pathEl.setAttribute('fill', 'none');
        pathEl.setAttribute('stroke-linecap', 'round');
        pathEl.setAttribute('marker-end', `url(#${markerId})`);
        pathEl.setAttribute('opacity', '0.8');
        if (dashPattern) {
            pathEl.setAttribute('stroke-dasharray', dashPattern);
        }
        pathEl.dataset.lag = lag;
        svg.appendChild(pathEl);

        // Lag label on the arrow (no icons)
        const labelEl = document.createElement('div');
        labelEl.className = 'impact-lag-label';
        labelEl.dataset.lag = lag;
        labelEl.style.left = `${labelX}px`;
        labelEl.style.top = `${labelY}px`;
        labelEl.innerHTML = `<span class="impact-lag-text" style="color:${color}">${lagDisplayLabels[lag] || lag}</span>`;
        document.getElementById('canvas').appendChild(labelEl);

        arrowIndex++;
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
        if (!e.target.closest('.node') && !e.target.closest('.edge-label') && !e.target.closest('.scenario-banner') && !e.target.closest('.scenario-dropdown')) {
            selectNode(null);
        }
    });
}

// ===== SCENARIO BANNER =====

let previousScenarioState = null; // cached for undo
let dropdownOpen = false;

// Get the formatted date string for the default banner state
function getFormattedDate() {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Build the scenario dropdown HTML (scenario list + controls)
function buildScenarioDropdown() {
    // Create dropdown container (appended to body)
    let dropdown = document.getElementById('scenarioDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'scenario-dropdown';
        dropdown.id = 'scenarioDropdown';
        document.body.appendChild(dropdown);
    }

    // Create backdrop
    let backdrop = document.getElementById('scenarioDropdownBackdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'scenario-dropdown-backdrop';
        backdrop.id = 'scenarioDropdownBackdrop';
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', () => toggleScenarioDropdown(false));
    }

    // Group scenarios by shockType
    const groups = {};
    SCENARIO_PRESETS.forEach((s) => {
        if (!groups[s.shockType]) groups[s.shockType] = [];
        groups[s.shockType].push(s);
    });

    let scenariosHtml = '';
    for (const [type, scenarios] of Object.entries(groups)) {
        const typeLabel = SHOCK_TYPE_LABELS[type] || type;
        scenariosHtml += `<div class="dropdown-group-label">${typeLabel}</div>`;
        scenarios.forEach((s) => {
            scenariosHtml += `
                <button class="dropdown-scenario-btn" data-scenario-id="${s.id}" title="${s.descriptionShort}">
                    ${s.title}
                </button>
            `;
        });
    }

    dropdown.innerHTML = `
        <div class="dropdown-inner">
            <div class="dropdown-scenarios">
                ${scenariosHtml}
            </div>
            <div class="dropdown-controls">
                <div class="dropdown-control-group">
                    <label>Surprise Size</label>
                    <div class="scenario-toggle" id="surpriseSizeToggle">
                        <button data-value="1" class="toggle-btn">S</button>
                        <button data-value="2" class="toggle-btn active">M</button>
                        <button data-value="3" class="toggle-btn">L</button>
                    </div>
                </div>
                <div class="dropdown-control-group">
                    <label>Regime</label>
                    <select id="regimeSelect" class="scenario-select">
                        <option value="soft_landing" selected>Soft Landing</option>
                        <option value="late_cycle">Late Cycle</option>
                        <option value="recession_risk">Recession Risk</option>
                        <option value="inflation_scare">Inflation Scare</option>
                        <option value="financial_stress">Financial Stress</option>
                    </select>
                </div>
                <div class="dropdown-control-group">
                    <label class="scenario-checkbox-label">
                        <input type="checkbox" id="pricedInCheck"> Already priced in
                    </label>
                </div>
            </div>
        </div>
    `;

    // Wire up scenario buttons
    dropdown.querySelectorAll('.dropdown-scenario-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            dropdown.querySelectorAll('.dropdown-scenario-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            executeScenario(btn.dataset.scenarioId);
            toggleScenarioDropdown(false);
        });
    });

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

function toggleScenarioDropdown(forceState) {
    const dropdown = document.getElementById('scenarioDropdown');
    const backdrop = document.getElementById('scenarioDropdownBackdrop');
    if (!dropdown) return;

    dropdownOpen = forceState !== undefined ? forceState : !dropdownOpen;

    if (dropdownOpen) {
        dropdown.classList.add('open');
        backdrop.classList.add('visible');
    } else {
        dropdown.classList.remove('open');
        backdrop.classList.remove('visible');
    }
}

// Render the scenario banner based on current state
function renderBanner() {
    const banner = document.getElementById('scenarioBanner');

    if (activeScenarioResult) {
        // ── State 2: Active scenario ──
        const preset = getScenarioPreset(activeScenarioResult.context.scenarioId);
        const ctx = activeScenarioResult.context;
        const dirColor = DIRECTION_COLORS[preset.defaultShockDirection] || { accent: '#9b5fff', sentiment: 'neutral' };
        const sizeLabel = ['S', 'M', 'L'][ctx.surpriseSize - 1] || 'M';
        const regimeLabel = ctx.regime.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const summary = preset.plainEnglishSummary || preset.descriptionShort;

        banner.className = 'scenario-banner active expandable';
        banner.style.setProperty('--banner-accent', dirColor.accent);

        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-left">
                    <div class="banner-main-row">
                        <span class="banner-dot"></span>
                        <span class="banner-title">${preset.title}</span>
                        <span class="banner-meta">
                            Size: ${sizeLabel}
                            <span class="banner-meta-sep">·</span>
                            Regime: ${regimeLabel}
                            ${ctx.marketAlreadyPricedIn ? '<span class="banner-meta-sep">·</span> Already Priced In' : ''}
                        </span>
                    </div>
                    <div class="banner-summary">${summary}</div>
                </div>
                <button class="banner-btn banner-btn-secondary" id="resetScenarioBtn">✕ Reset</button>
            </div>
        `;

        document.getElementById('resetScenarioBtn').addEventListener('click', resetScenario);

    } else if (previousScenarioState) {
        // ── State 3: Reset / cleared with undo available ──
        banner.className = 'scenario-banner';
        banner.style.removeProperty('--banner-accent');

        banner.innerHTML = `
            <div class="banner-reset">
                <span class="banner-reset-text">Scenario cleared.</span>
                <button class="banner-btn banner-btn-primary" id="runAnotherBtn">+ Run another scenario</button>
                <button class="banner-btn banner-btn-undo" id="undoResetBtn">↩ Undo</button>
            </div>
        `;

        document.getElementById('runAnotherBtn').addEventListener('click', () => {
            previousScenarioState = null;
            renderBanner();
            toggleScenarioDropdown(true);
        });

        document.getElementById('undoResetBtn').addEventListener('click', undoReset);

    } else {
        // ── State 1: Default / no scenario ──
        banner.className = 'scenario-banner';
        banner.style.removeProperty('--banner-accent');

        banner.innerHTML = `
            <div class="banner-default">
                <span class="banner-default-icon">📊</span>
                <span class="banner-default-text">Showing current economic conditions as of ${getFormattedDate()}</span>
                <button class="banner-btn banner-btn-primary" id="runScenarioBtn">+ Run a Scenario</button>
            </div>
        `;

        document.getElementById('runScenarioBtn').addEventListener('click', () => toggleScenarioDropdown(true));
    }
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
    // Clear undo state when selecting a new scenario
    previousScenarioState = null;

    const context = getScenarioContext(scenarioId);
    activeScenarioResult = runScenario(context);
    renderNodes();
    renderArrows();
    renderImpactArrows();
    renderBanner();
}

function rerunActiveScenario() {
    if (!activeScenarioResult) return;
    const scenarioId = activeScenarioResult.context.scenarioId;
    const context = getScenarioContext(scenarioId);
    activeScenarioResult = runScenario(context);
    renderNodes();
    renderArrows();
    renderImpactArrows();
    renderBanner();
}

function resetScenario() {
    // Stash full result for undo (preserves future LLM-generated explanations)
    previousScenarioState = activeScenarioResult;
    activeScenarioResult = null;

    // Deselect scenario button in dropdown
    document.querySelectorAll('.dropdown-scenario-btn').forEach((b) => b.classList.remove('active'));

    renderNodes();
    renderArrows();
    renderImpactArrows();
    renderBanner();
}

function undoReset() {
    if (!previousScenarioState) return;
    activeScenarioResult = previousScenarioState;
    previousScenarioState = null;

    // Re-select the matching dropdown button
    const scenarioId = activeScenarioResult.context.scenarioId;
    document.querySelectorAll('.dropdown-scenario-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.scenarioId === scenarioId);
    });

    renderNodes();
    renderArrows();
    renderImpactArrows();
    renderBanner();
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
    buildScenarioDropdown();
    renderBanner();
}

// Re-render on resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        renderNodes();
        renderArrows();
        if (activeScenarioResult) {
            renderImpactArrows();
        }
    }, 200);
});

// Boot
document.addEventListener('DOMContentLoaded', init);

