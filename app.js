// ===== MACROCAUSAL APP =====
// Uses the 4-layer hybrid architecture:
//   L1: indicators.js  — indicator definitions (observations loaded from data/observations.json)
//   L2: scenarios.js   — scenario presets
//   L3: impact-rules.js + mechanisms.js — causal graph
//   L4: causal-engine.js — deterministic engine

// ===== STATE =====

let NODES = [];
let activeScenarioResult = null;

// ── View switcher state ──
let activeView = 'heatmap';         // 'heatmap' | 'timeline' | 'gauges' | 'causal'
let scenarioViewHistory = {};       // { scenarioId: lastTabUsed }
let lastScenarioId = null;



// ===== VIEW SWITCHER =====

const VIEW_TABS = [
    { id: 'heatmap', label: 'Full Picture', icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>` },
    { id: 'timeline', label: 'Story', icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="4" y1="3" x2="14" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="4" y1="13" x2="14" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="1.5" cy="3" r="1" fill="currentColor"/><circle cx="1.5" cy="8" r="1" fill="currentColor"/><circle cx="1.5" cy="13" r="1" fill="currentColor"/></svg>` },
    { id: 'gauges', label: 'Summary', icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 12 A5 5 0 0 1 13 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><line x1="8" y1="12" x2="5.5" y2="7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="12" r="1.2" fill="currentColor"/></svg>` },
    { id: 'causal', label: 'Causal Chain', icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="3" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="13" cy="4" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="13" cy="12" r="2" stroke="currentColor" stroke-width="1.5"/><line x1="5" y1="7.2" x2="11" y2="4.8" stroke="currentColor" stroke-width="1.2"/><line x1="5" y1="8.8" x2="11" y2="11.2" stroke="currentColor" stroke-width="1.2"/></svg>`, badge: 'soon' },
];

/**
 * Render the view switcher segmented control.
 */
function renderViewSwitcher() {
    const switcher = document.getElementById('viewSwitcher');

    switcher.innerHTML = VIEW_TABS.map(tab => {
        const isActive = activeView === tab.id;
        const badgeHtml = tab.badge ? `<span class="vs-badge">${tab.badge}</span>` : '';
        return `<button class="vs-tab ${isActive ? 'active' : ''}" data-view="${tab.id}" id="vsTab-${tab.id}">
            <span class="vs-icon">${tab.icon}</span>
            <span class="vs-label">${tab.label}</span>
            ${badgeHtml}
        </button>`;
    }).join('');

    // Wire tab clicks
    switcher.querySelectorAll('.vs-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchView(tab.dataset.view);
        });
    });
}

/**
 * Switch to a specific view, hide all others, render the active view.
 */
function switchView(viewId) {
    activeView = viewId;

    const viewContent = document.getElementById('viewContent');
    viewContent.style.display = 'block';

    // Store tab in scenario view history
    if (activeScenarioResult) {
        const scenarioId = activeScenarioResult.context.scenarioId;
        scenarioViewHistory[scenarioId] = viewId;
    }

    // Update tab highlight
    updateTabHighlight();

    // Render the active view
    switch (viewId) {
        case 'heatmap':
            renderHeatmapView(viewContent);
            break;
        case 'timeline':
            renderTimelineView(viewContent);
            if (activeScenarioResult) {
                requestAnimationFrame(animateTimelineCascade);
            }
            break;
        case 'gauges':
            renderGaugesView(viewContent);
            break;
        case 'causal':
            renderCausalChainView(viewContent);
            break;
        default:
            renderHeatmapView(viewContent);
    }

    // Append FRED® API footer inside the scrollable area
    const footer = document.querySelector('.api-footer');
    if (footer) viewContent.appendChild(footer);
}

/**
 * Update the active tab highlight in the view switcher.
 */
function updateTabHighlight() {
    document.querySelectorAll('.vs-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === activeView);
    });
}

/**
 * Determine the default view based on context.
 * - No scenario → 'heatmap' (Full Picture)
 * - Scenario just activated → 'gauges' (Summary)
 * - Switching between scenarios (no reset) → preserve current tab
 */
function getDefaultView(isScenarioActivation, isReset, newScenarioId) {
    if (isReset || !activeScenarioResult) {
        return 'heatmap';
    }

    // Always preserve the current tab when activating or switching scenarios
    return activeView;
}



// ===== SCENARIO BANNER =====

let previousScenarioState = null; // cached for undo
let dropdownOpen = false;
let modifyMode = false;             // true while user is editing scenario/regime in dropdown

// Get the formatted date string for the default banner state (uses observation data timestamp)
function getFormattedDate() {
    const date = observationsLastUpdated ? new Date(observationsLastUpdated) : new Date();
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                    <label>Regime</label>
                    <select id="regimeSelect" class="custom-select">
                        <option value="soft_landing">Soft Landing</option>
                        <option value="late_cycle">Late Cycle</option>
                        <option value="recession_risk" selected>Recession Risk</option>
                        <option value="inflation_scare">Inflation Scare</option>
                        <option value="financial_stress">Financial Stress</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    // Wire up scenario buttons
    dropdown.querySelectorAll('.dropdown-scenario-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            dropdown.querySelectorAll('.dropdown-scenario-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            if (!modifyMode) {
                executeScenario(btn.dataset.scenarioId);
                toggleScenarioDropdown(false);
            }
        });
    });

    // Regime select — skip auto-rerun in modify mode
    document.getElementById('regimeSelect').addEventListener('change', () => {
        if (!modifyMode) rerunActiveScenario();
    });
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
        // Exit modify mode when dropdown closes (e.g. backdrop click)
        if (modifyMode) {
            modifyMode = false;
            renderBanner();
        }
    }
}

function openModifyDropdown() {
    if (!activeScenarioResult) return;
    const ctx = activeScenarioResult.context;

    modifyMode = true;

    // Sync dropdown to current state: highlight active scenario button
    document.querySelectorAll('.dropdown-scenario-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.scenarioId === ctx.scenarioId);
    });

    // Sync regime select
    const regimeSelect = document.getElementById('regimeSelect');
    if (regimeSelect) regimeSelect.value = ctx.regime;

    // Re-render banner to swap Modify → Confirm
    renderBanner();
    toggleScenarioDropdown(true);
}

function confirmModification() {
    // Read the selected scenario from the dropdown
    const activeBtn = document.querySelector('.dropdown-scenario-btn.active');
    if (!activeBtn) return;

    const selectedScenarioId = activeBtn.dataset.scenarioId;

    // Exit modify mode first
    modifyMode = false;

    // Execute the scenario (regime select already has the chosen value)
    executeScenario(selectedScenarioId);
    toggleScenarioDropdown(false);
}

// Render the scenario banner based on current state
function renderBanner() {
    const banner = document.getElementById('scenarioBanner');

    if (activeScenarioResult) {
        // ── State 2: Active scenario ──
        const preset = getScenarioPreset(activeScenarioResult.context.scenarioId);
        const ctx = activeScenarioResult.context;
        const dirColor = DIRECTION_COLORS[preset.defaultShockDirection] || { accent: '#6C63FF', bgTint: '#111320' };
        const regimeLabel = ctx.regime.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const summary = preset.plainEnglishSummary || preset.descriptionShort;

        banner.className = 'scenario-banner active expandable';
        banner.style.setProperty('--banner-accent', dirColor.accent);
        banner.style.background = dirColor.bgTint;

        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-left">
                    <div class="banner-main-row">
                        <span class="banner-dot"></span>
                        <span class="banner-title">${preset.title}</span>
                        <span class="banner-meta">
                            Regime: ${regimeLabel}
                        </span>
                    </div>
                    <div class="banner-summary">${summary}</div>
                </div>
                <div class="banner-actions">
                    ${modifyMode
                        ? '<button class="banner-btn banner-btn-confirm" id="confirmScenarioBtn">✓ Confirm</button>'
                        : '<button class="banner-btn banner-btn-primary" id="modifyScenarioBtn">✎ Modify</button>'
                    }
                    <button class="banner-btn banner-btn-secondary" id="resetScenarioBtn">✕ Reset</button>
                </div>
            </div>
        `;

        if (modifyMode) {
            document.getElementById('confirmScenarioBtn').addEventListener('click', confirmModification);
        } else {
            document.getElementById('modifyScenarioBtn').addEventListener('click', openModifyDropdown);
        }
        document.getElementById('resetScenarioBtn').addEventListener('click', resetScenario);

    } else if (previousScenarioState) {
        // ── State 3: Reset / cleared with undo available ──
        banner.className = 'scenario-banner';
        banner.style.removeProperty('--banner-accent');
        banner.style.background = '';
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
        banner.style.background = '';
        banner.innerHTML = `
            <div class="banner-default">
                <span class="banner-default-icon">📊</span>
                <span class="banner-default-text">Showing current economic conditions as of ${getFormattedDate()}</span>
                ${modifyMode
                    ? '<button class="banner-btn banner-btn-confirm" id="confirmInitialBtn">✓ Confirm</button>'
                    : '<button class="banner-btn banner-btn-primary" id="runScenarioBtn">+ Run a Scenario</button>'
                }
            </div>
        `;

        if (modifyMode) {
            document.getElementById('confirmInitialBtn').addEventListener('click', () => {
                const activeBtn = document.querySelector('.dropdown-scenario-btn.active');
                if (!activeBtn) return;
                modifyMode = false;
                executeScenario(activeBtn.dataset.scenarioId);
                toggleScenarioDropdown(false);
            });
        } else {
            document.getElementById('runScenarioBtn').addEventListener('click', () => {
                modifyMode = true;
                renderBanner();
                toggleScenarioDropdown(true);
            });
        }
    }
}

function getScenarioContext(scenarioId) {
    const regime = document.getElementById('regimeSelect')?.value || 'recession_risk';

    return {
        scenarioId,
        surpriseSize: 2,
        regime,
        persistence: 'one_off',
    };
}

function executeScenario(scenarioId) {
    // Clear undo state when selecting a new scenario
    previousScenarioState = null;

    const context = getScenarioContext(scenarioId);
    activeScenarioResult = runScenario(context);

    // Determine the right tab to switch to
    const isNewScenario = lastScenarioId !== scenarioId;
    const targetView = getDefaultView(true, false, scenarioId);
    lastScenarioId = scenarioId;

    renderBanner();
    switchView(targetView);
}

function rerunActiveScenario() {
    if (!activeScenarioResult) return;
    const scenarioId = activeScenarioResult.context.scenarioId;
    const context = getScenarioContext(scenarioId);
    activeScenarioResult = runScenario(context);

    renderBanner();
    switchView(activeView); // re-render current view with new data
}

function resetScenario() {
    // Stash full result for undo (preserves future LLM-generated explanations)
    previousScenarioState = activeScenarioResult;
    const previousView = activeView;
    activeScenarioResult = null;

    // Deselect scenario button in dropdown
    document.querySelectorAll('.dropdown-scenario-btn').forEach((b) => b.classList.remove('active'));

    renderBanner();
    switchView('heatmap');
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

    // Restore the view the scenario was on, or default to gauges
    const restoredView = scenarioViewHistory[scenarioId] || 'gauges';

    renderBanner();

    switchView(restoredView);
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

async function init() {
    // Load observation data from JSON, then build NODES
    await loadObservations();
    NODES = buildNodes();

    updateTimestamp();
    buildScenarioDropdown();
    renderBanner();
    renderViewSwitcher();
    switchView('heatmap');
}

// Re-render on resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        switchView(activeView);
    }, 200);
});

// Boot
document.addEventListener('DOMContentLoaded', init);
