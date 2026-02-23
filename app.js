// ===== DATA MODEL =====

const NODES = [
    {
        id: 'policy-instruments',
        title: 'Policy Instruments',
        icon: '🏛️',
        theme: 'policy-instruments',
        color: [155, 95, 255],
        subItems: [
            { id: 'fed-funds-target', name: 'Fed Funds Target', value: '4.25–4.50%', period: 'Jan 28, 2026', source: 'FOMC decision (federalreserve.gov)', updateMode: 'manual' },
            { id: 'qe-qt-pace', name: 'QE/QT Pace', value: 'QT Ended', period: 'Dec 1, 2025', source: 'Fed balance sheet (federalreserve.gov)', updateMode: 'manual' },
            { id: 'forward-guidance', name: 'Forward Guidance', value: 'Hold / Data-dep.', period: 'Jan 28, 2026', source: 'FOMC statement + minutes', updateMode: 'manual' },
        ],
    },
    {
        id: 'financial',
        title: 'Financial Conditions',
        icon: '📊',
        theme: 'financial',
        color: [45, 212, 191],
        subItems: [
            { id: 'front-end-yields-2y', name: 'Front-end Yields (2Y)', value: '3.48%', period: 'Feb 20, 2026', source: 'U.S. Treasury 2Y yield', updateMode: 'derived' },
            { id: 'long-end-yields-10y', name: 'Long-end Yields (10Y)', value: '4.08%', period: 'Feb 20, 2026', source: 'U.S. Treasury 10Y yield', updateMode: 'derived' },
            { id: 'mortgage-rates', name: 'Mortgage Rates', value: '6.01%', period: 'Feb 19, 2026', source: 'Freddie Mac PMMS 30-yr fixed', updateMode: 'derived' },
        ],
    },
    {
        id: 'real-economy',
        title: 'Real Economy',
        icon: '📈',
        theme: 'real-economy',
        color: [96, 165, 250],
        subItems: [
            { id: 'housing-starts', name: 'Housing Starts', value: '1.48M SAAR', period: 'Jan 2026', source: 'U.S. Census Bureau', updateMode: 'derived' },
            { id: 'consumer-spending', name: 'Consumer Spending', value: '+0.4% MoM', period: 'Dec 2025', source: 'BEA Personal Income & Outlays', updateMode: 'derived' },
            { id: 'corporate-borrowing', name: 'Corporate Borrowing', value: 'IG Spread 79bp', period: 'Feb 19, 2026', source: 'ICE BofA IG OAS', updateMode: 'derived' },
            { id: 'gdp-growth', name: 'GDP Growth', value: '+1.4% (Q4)', period: 'Q4 2025', source: 'BEA advance estimate', updateMode: 'derived' },
            { id: 'unemployment', name: 'Unemployment', value: '4.3%', period: 'Jan 2026', source: 'BLS Employment Situation', updateMode: 'derived' },
            { id: 'job-openings', name: 'Job Openings', value: '6.5M', period: 'Dec 2025', source: 'BLS JOLTS', updateMode: 'derived' },
            { id: 'wage-growth', name: 'Wage Growth', value: '+3.7% YoY', period: 'Jan 2026', source: 'BLS Avg Hourly Earnings', updateMode: 'derived' },
        ],
    },
    {
        id: 'inflation',
        title: 'Inflation',
        icon: '💲',
        theme: 'inflation',
        color: [248, 96, 96],
        subItems: [
            { id: 'core-cpi', name: 'Core CPI', value: '+2.5% YoY', period: 'Jan 2026', source: 'BLS CPI less food & energy', updateMode: 'derived' },
            { id: 'core-ppi', name: 'Core PPI', value: '+3.3% YoY', period: 'Dec 2025', source: 'BLS PPI less food & energy', updateMode: 'derived' },
            { id: 'headline-cpi', name: 'Headline CPI', value: '+2.4% YoY', period: 'Jan 2026', source: 'BLS CPI (bls.gov)', updateMode: 'derived' },
            { id: 'headline-ppi', name: 'Headline PPI', value: '+3.0% YoY', period: 'Dec 2025', source: 'BLS PPI Final Demand', updateMode: 'derived' },
            { id: 'pce', name: 'PCE', value: '+2.9% YoY', period: 'Dec 2025', source: 'BEA PCE Price Index', updateMode: 'derived' },
            { id: 'core-pce', name: 'Core PCE', value: '+3.0% YoY', period: 'Dec 2025', source: 'BEA Core PCE Price Index', updateMode: 'derived' },
        ],
    },
    {
        id: 'exogenous',
        title: 'Exogenous Shocks',
        icon: '⚡',
        theme: 'exogenous',
        color: [234, 179, 8],
        subItems: [
            { id: 'oil-barrel-price', name: 'Oil Barrel Price', value: '$66.35', period: 'Feb 20, 2026', source: 'WTI crude spot (tradingeconomics.com)', updateMode: 'manual' },
            { id: 'dow', name: 'Dow', value: '48,804', period: 'Feb 21, 2026', source: 'DJIA closing price', updateMode: 'derived' },
            { id: 'nasdaq', name: 'Nasdaq', value: '22,627', period: 'Feb 21, 2026', source: 'Nasdaq Composite close', updateMode: 'derived' },
            { id: 'sp-500', name: 'S&P 500', value: '6,838', period: 'Feb 21, 2026', source: 'S&P 500 closing price', updateMode: 'derived' },
            { id: 'vix', name: 'VIX', value: '19.09', period: 'Feb 20, 2026', source: 'CBOE VIX close', updateMode: 'derived' },
        ],
    },
];

const EDGES = [];

// ===== LAYOUT =====

function getCanvasCenter() {
    return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 10, // slight offset for top bar
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
    // Start from top (−90°), go clockwise
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

function createNodeElement(node) {
    const el = document.createElement('div');
    el.className = 'node';
    el.id = `node-${node.id}`;
    el.dataset.theme = node.theme;
    el.dataset.nodeId = node.id;

    el.innerHTML = `
    <div class="selection-ring"></div>
    <div class="node-content">
      <span class="node-icon">${node.icon}</span>
      <span class="node-title">${node.title}</span>
      <div class="sub-items-header">
        <span class="sub-header-name"></span>
        <span class="sub-header-col">Value</span>
        <span class="sub-header-col">Period</span>
      </div>
      <div class="sub-items">
        ${node.subItems
            .map(
                (si) => `
          <div class="sub-item" title="Source: ${si.source || '—'}">
            <span class="sub-item-name">${si.name}</span>
            <span class="sub-item-value">${si.value}</span>
            <span class="sub-item-period">${si.period || '—'}</span>
          </div>
        `
            )
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
    return parseInt(rootStyles.getPropertyValue('--node-size')) / 2 || 100;
}

/**
 * Calculate a curved arrow path between two nodes.
 * Arrows depart/arrive tangent to the curve for smooth connections.
 */
function calcArrowPath(fromPos, toPos, nodeRadius) {
    // 1. First, compute the control point (same logic as before)
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const center = getCanvasCenter();
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;

    const toCenterX = center.x - midX;
    const toCenterY = center.y - midY;
    const toCenterDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);

    // Curve outward (away from ring center)
    const curvature = -0.5;
    const cpX = midX + (toCenterX / toCenterDist) * dist * curvature;
    const cpY = midY + (toCenterY / toCenterDist) * dist * curvature;

    // 2. Start point: on fromNode edge, in direction toward control point
    const fromToCpX = cpX - fromPos.x;
    const fromToCpY = cpY - fromPos.y;
    const fromToCpDist = Math.sqrt(fromToCpX * fromToCpX + fromToCpY * fromToCpY);
    const startX = fromPos.x + (fromToCpX / fromToCpDist) * (nodeRadius + 4);
    const startY = fromPos.y + (fromToCpY / fromToCpDist) * (nodeRadius + 4);

    // 3. End point: on toNode edge, in direction FROM control point toward toNode
    const cpToToX = toPos.x - cpX;
    const cpToToY = toPos.y - cpY;
    const cpToToDist = Math.sqrt(cpToToX * cpToToX + cpToToY * cpToToY);
    const endX = toPos.x - (cpToToX / cpToToDist) * (nodeRadius + 14);
    const endY = toPos.y - (cpToToY / cpToToDist) * (nodeRadius + 14);

    // 4. Label at the true quadratic bezier midpoint (t=0.5)
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

    // Remove old paths and labels
    svg.querySelectorAll('.arrow-path, .flow-particle').forEach((el) => el.remove());
    document.querySelectorAll('.edge-label').forEach((el) => el.remove());

    const nodeRadius = getNodeRadius();

    EDGES.forEach((edge) => {
        const fromNode = NODES.find((n) => n.id === edge.from);
        const toNode = NODES.find((n) => n.id === edge.to);
        const fromPos = getNodeCenter(edge.from);
        const toPos = getNodeCenter(edge.to);

        const { path, labelPos } = calcArrowPath(fromPos, toPos, nodeRadius);

        // Gradient
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

        // Arrowhead marker
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

        // Main path
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.classList.add('arrow-path');
        pathEl.id = `edge-${edge.id}`;
        pathEl.setAttribute('d', path);
        pathEl.setAttribute('stroke', `url(#${gradientId})`);
        pathEl.setAttribute('marker-end', `url(#${markerId})`);
        pathEl.dataset.from = edge.from;
        pathEl.dataset.to = edge.to;
        svg.appendChild(pathEl);

        // Flow particle (animated dash)
        const flowEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        flowEl.classList.add('flow-particle');
        flowEl.id = `flow-${edge.id}`;
        flowEl.setAttribute('d', path);
        flowEl.setAttribute('stroke', `url(#${gradientId})`);
        flowEl.dataset.from = edge.from;
        flowEl.dataset.to = edge.to;

        // Set up dash for animation
        const pathLength = pathEl.getTotalLength ? pathEl.getTotalLength() : 300;
        flowEl.setAttribute('stroke-dasharray', `${pathLength * 0.15} ${pathLength * 0.85}`);
        flowEl.setAttribute('stroke-dashoffset', pathLength);
        svg.appendChild(flowEl);

        // Animate dash
        animateFlow(flowEl, pathLength);

        // Edge label (HTML overlay)
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

let selectedNodeId = null;

function selectNode(nodeId) {
    // Deselect previous
    document.querySelectorAll('.node.selected').forEach((el) => el.classList.remove('selected'));
    document.querySelectorAll('.arrow-path.highlighted').forEach((el) => el.classList.remove('highlighted'));
    document.querySelectorAll('.flow-particle.active').forEach((el) => el.classList.remove('active'));

    if (selectedNodeId === nodeId) {
        selectedNodeId = null;
        return;
    }

    selectedNodeId = nodeId;

    // Select node
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (nodeEl) nodeEl.classList.add('selected');

    // Highlight connected edges
    document.querySelectorAll('.arrow-path').forEach((pathEl) => {
        if (pathEl.dataset.from === nodeId || pathEl.dataset.to === nodeId) {
            pathEl.classList.add('highlighted');
        }
    });

    // Activate flow particles on connected edges
    document.querySelectorAll('.flow-particle').forEach((flowEl) => {
        if (flowEl.dataset.from === nodeId || flowEl.dataset.to === nodeId) {
            flowEl.classList.add('active');
        }
    });
}

function initInteractions() {
    // Node clicks
    document.getElementById('nodesLayer').addEventListener('click', (e) => {
        const node = e.target.closest('.node');
        if (node) {
            e.stopPropagation();
            selectNode(node.dataset.nodeId);
        }
    });

    // Background click to deselect
    document.getElementById('canvas').addEventListener('click', (e) => {
        if (!e.target.closest('.node') && !e.target.closest('.edge-label')) {
            selectNode(null);
        }
    });
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
    updateTimestamp();
    renderNodes();
    renderArrows();
    initInteractions();
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
