# MacroCausal

An interactive web app that visualizes **macroeconomic causal loops** — how major economic themes (Fed Policy, Inflation, Labor, etc.) influence each other — and lets you simulate **scenario shocks** to see how impacts propagate through the system.

## Quick Start

Serve locally:

```bash
npx -y serve .
```

Then visit the URL shown (typically `http://localhost:3000`).

## Hybrid Architecture

MacroCausal uses a **4-layer hybrid model** where static, curated causal logic is the source of truth. An LLM (Phase 2+) will sit on top as a narrative layer — it will never decide *what* happens, only *how to explain* what happened.

```
L1: Indicators         24 economic variables with live observations
L2: Scenarios           9 headline shock templates (policy, inflation, labor, growth, credit)
L3: Impact Rules       60+ deterministic causal edges with sign, strength, lag, mechanism
L4: Causal Engine      ScenarioRunContext → ComputedImpact[] with full audit trail
```

**Core principle:** Same scenario + same controls → same result, every time.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design doc.

## Features

- **5 theme nodes** in a circular layout: Policy Instruments, Financial Conditions, Real Economy, Inflation, Market Pricing & Risk Sentiment
- **Real economic data** sourced from BLS, BEA, and Federal Reserve (as of Feb 2026)
- **9 scenario presets** covering Fed policy, inflation, labor, growth, and credit shocks
- **11 reusable causal mechanisms** with templated descriptions
- **Scenario controls**: surprise size (S/M/L), macro regime, "already priced in" dampening
- **HEADLINE IMPACT column** appears on indicator cards when a scenario is active
- **Propagation arrows** from originating node to downstream nodes, color-coded by lag timing
- **Glassmorphism UI** with per-node color coding and animated flow particles
- **Interactive**: hover to brighten, click to highlight connected edges

## Tech Stack

- Vanilla HTML / CSS / JS (zero dependencies, no build step)
- SVG for curved arrow paths and propagation arrows
- CSS custom properties for theming

## File Structure

```
├── index.html           # Shell + script loading
├── styles.css           # Full styling
├── indicators.js        # L1: Indicator definitions
├── scenarios.js         # L2: Scenario presets
├── mechanisms.js        # L3: Mechanism registry
├── impact-rules.js      # L3: Causal rules
├── causal-engine.js     # L4: Deterministic engine
├── relationships.js     # Subitem causal edges
├── app.js               # Layout, rendering, view switching
├── view-heatmap.js      # View: Full Picture (heatmap grid)
├── view-timeline.js     # View: Story (timeline feed)
├── view-gauges.js       # View: Summary (gauge dials)
├── view-causal-chain.js # View: Causal Chain (deferred — stub)
├── ARCHITECTURE.md      # Full architecture doc
└── README.md            # This file
```

## Legacy Canvas (Hidden Utility)

The original circular ring-of-cards view is preserved behind a feature flag. It is **not** accessible through the UI — it exists for debugging and reference purposes only.

To enable it, open the browser console and run:

```js
SHOW_LEGACY_CANVAS = true;
switchView('legacy');
```

To disable it again:

```js
SHOW_LEGACY_CANVAS = false;
switchView('heatmap');
```

All legacy canvas code is isolated in `app.js` (rendering, arrows, interactions). When ready to permanently remove it, delete the functions and styles gated by `SHOW_LEGACY_CANVAS`.

## Roadmap

- **Phase 1** ✅ — 4-layer architecture, 9 scenarios, causal engine, scenario picker UI
- **Phase 2** — LLM narrative layer (polished tooltips, chain-reaction walkthroughs)
- **Phase 3+** — Beginner/advanced toggle, scenario composition, real-time data integration
