// ===== VIEW: TIMELINE FEED ("Story") =====
// Chronological card feed: impacts sorted by time horizon → magnitude.
// Cards cascade in with a stagger animation on scenario activation.

const TIMELINE_THEME_LABELS = {
    'policy-instruments': '🏛️ Policy',
    'financial': '📊 Financial',
    'real-economy': '📈 Real Economy',
    'inflation': '💲 Inflation',
    'exogenous': '⚡ Markets',
};

const TIMELINE_SECTION_LABELS = {
    immediate: { title: 'Immediate', sublabel: 'Minutes to Days' },
    short: { title: 'Short-Term', sublabel: 'Days to Weeks' },
    medium: { title: 'Medium-Term', sublabel: 'Weeks to Months' },
    long: { title: 'Longer-Term', sublabel: 'Months+' },
};

let timelineActiveThemeFilter = null;

/**
 * Render the timeline feed view into the container.
 */
function renderTimelineView(container) {
    const hasScenario = !!activeScenarioResult;

    if (!hasScenario) {
        container.innerHTML = `<div class="timeline-view">
            <div class="timeline-empty">
                <div class="timeline-empty-icon">📋</div>
                <div class="timeline-empty-text">No scenario selected</div>
                <div class="timeline-empty-subtext">The feed will populate once you run a scenario, showing impacts in chronological order</div>
            </div>
        </div>`;
        return;
    }

    const impacts = activeScenarioResult.impacts;

    // Filter by theme if active
    const filteredImpacts = timelineActiveThemeFilter
        ? impacts.filter(imp => {
            const ind = INDICATORS[imp.targetIndicatorId];
            return ind && ind.category === timelineActiveThemeFilter;
        })
        : impacts;

    // Group by lag
    const lagOrder = ['immediate', 'short', 'medium', 'long'];
    const groups = {};
    lagOrder.forEach(lag => { groups[lag] = []; });

    filteredImpacts.forEach(imp => {
        if (groups[imp.lag]) groups[imp.lag].push(imp);
    });

    // Sort within each group by strength descending
    lagOrder.forEach(lag => {
        groups[lag].sort((a, b) => b.strength - a.strength);
    });

    // Build filter bar
    const filterHtml = `<div class="timeline-filters">
        <button class="timeline-filter-btn ${!timelineActiveThemeFilter ? 'active' : ''}" data-theme="all">Show All</button>
        ${Object.entries(TIMELINE_THEME_LABELS).map(([id, label]) =>
        `<button class="timeline-filter-btn ${timelineActiveThemeFilter === id ? 'active' : ''}" data-theme="${id}">${label}</button>`
    ).join('')}
    </div>`;

    // Build sections
    let sectionsHtml = '';
    let cardIndex = 0;

    lagOrder.forEach(lag => {
        const sectionImpacts = groups[lag];
        if (sectionImpacts.length === 0) return;

        const sectionInfo = TIMELINE_SECTION_LABELS[lag];

        sectionsHtml += `<div class="timeline-section">
            <div class="timeline-section-divider" data-lag="${lag}">
                <span class="tsd-title">${sectionInfo.title}</span>
                <span class="tsd-sublabel">— ${sectionInfo.sublabel}</span>
            </div>`;

        sectionImpacts.forEach(imp => {
            const ind = INDICATORS[imp.targetIndicatorId];
            if (!ind) return;

            const arrow = imp.sign === 'up' ? '↑' : imp.sign === 'down' ? '↓' : '↕';
            const dirClass = `timeline-dir-${imp.sign}`;
            const themeLabel = TIMELINE_THEME_LABELS[ind.category] || ind.category;
            const bgTint = imp.sign === 'up'
                ? 'rgba(10, 82, 38, 0.15)'
                : imp.sign === 'down'
                    ? 'rgba(92, 10, 10, 0.15)'
                    : 'rgba(107, 114, 128, 0.10)';

            sectionsHtml += `<div class="timeline-card" data-index="${cardIndex}" data-indicator="${ind.id}" style="background:${bgTint}; animation-delay: ${Math.min(cardIndex * 150, 800)}ms">
                <div class="tc-main">
                    <span class="tc-arrow ${dirClass}">${arrow}</span>
                    <span class="tc-name">${ind.name}</span>
                    <span class="tc-strength">${getStrengthBar(imp.strength)}</span>
                    <span class="tc-theme">${themeLabel}</span>
                </div>
                <div class="tc-explanation">${imp.explanationShort}</div>
                <div class="tc-detail" id="tcDetail-${ind.id}-${lag}" style="display:none;">
                    <div class="tc-detail-row">
                        <span class="tc-detail-label">Current value</span>
                        <span class="tc-detail-value">${ind.observation.value}</span>
                    </div>
                    <div class="tc-detail-row">
                        <span class="tc-detail-label">Period</span>
                        <span class="tc-detail-value">${ind.observation.period}</span>
                    </div>
                    <button class="tc-crosslink" data-target-view="heatmap" data-indicator="${ind.id}">See in Full Picture →</button>
                </div>
            </div>`;

            cardIndex++;
        });

        sectionsHtml += `</div>`;
    });

    container.innerHTML = `<div class="timeline-view">${filterHtml}<div class="timeline-feed">${sectionsHtml}</div></div>`;

    // Wire filter buttons
    container.querySelectorAll('.timeline-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            timelineActiveThemeFilter = theme === 'all' ? null : theme;
            renderTimelineView(container);
        });
    });

    // Wire card expand/collapse
    container.querySelectorAll('.timeline-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.tc-crosslink')) return;
            const detail = card.querySelector('.tc-detail');
            if (detail) {
                const isOpen = detail.style.display !== 'none';
                detail.style.display = isOpen ? 'none' : 'block';
                card.classList.toggle('expanded', !isOpen);
            }
        });
    });

    // Wire cross-links
    container.querySelectorAll('.tc-crosslink').forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            switchView('heatmap');
        });
    });
}

/**
 * Trigger the cascade-in animation for timeline cards.
 */
function animateTimelineCascade() {
    const cards = document.querySelectorAll('.timeline-card');
    cards.forEach((card, i) => {
        card.classList.remove('timeline-card-enter');
        // Force reflow
        void card.offsetWidth;
        card.classList.add('timeline-card-enter');
    });
}
