# MacroCausal

An interactive web app that visualizes **macroeconomic causal loops** — how major economic themes (Fed Policy, Inflation, Labor, etc.) influence each other — and lets you simulate **scenario shocks** to see how impacts propagate through the system.

> **Note:** The published version of this application excludes FRED data due to third-party copyright restrictions on some of the underlying economic index data.

## Quick Start

1. Serve locally. Then visit the URL shown (typically `http://localhost:3000`).

```bash
npx -y serve .
```


2. Update current indicator data from government sources (requires a [FRED® API key](https://fred.stlouisfed.org/docs/api/api_key.html) in `.env`):

```bash
node update-indicators.js             # update all observations
node update-indicators.js --dry-run   # preview changes without writing
node update-indicators.js --fomc-only # only run FOMC classification
```

## Hybrid Architecture

MacroCausal uses a **4-layer hybrid model** where static, curated causal logic is the source of truth. 

```
L1: Indicators         24 economic variables with live observations
L2: Scenarios           9 headline shock templates (policy, inflation, labor, growth, credit)
L3: Impact Rules       177 deterministic causal rules with sign, strength, lag, mechanism
L4: Causal Engine      ScenarioRunContext → ComputedImpact[] with full audit trail
```

**Core principle:** Same scenario + same controls → same result, every time.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design doc.

## Features

- **5 theme groups**: Policy Instruments, Financial Conditions, Real Economy, Inflation, Market Pricing & Risk Sentiment
- **Real economic data** sourced from BLS, BEA, and Federal Reserve via the FRED® API
- **9 scenario presets** covering Fed policy, inflation, labor, growth, and credit shocks
- **11 reusable causal mechanisms** with templated descriptions
- **Scenario controls**: surprise size (S/M/L), macro regime, "already priced in" dampening
- **HEADLINE IMPACT column** appears on indicator cards when a scenario is active
- **Glassmorphism UI** with per-node color coding
- **Interactive**: hover effects on indicator cards and scenario controls

## Tech Stack

- Vanilla HTML / CSS / JS (zero dependencies, no build step)
- SVG for gauge visualizations and tab icons
- CSS custom properties for theming

## File Structure

```
├── index.html           # Shell + script loading
├── styles.css           # Full styling
├── indicators.js        # L1: Indicator definitions
├── scenarios.js         # L2: Scenario presets
├── mechanisms.js        # L3: Mechanism registry
├── impact-rules.js      # L3: Causal rules
├── tooltip-text.js      # Regime-aware tooltip text lookup
├── causal-engine.js     # L4: Deterministic engine
├── relationships.js     # Subitem causal edges
├── app.js               # Layout, rendering, view switching
├── view-heatmap.js      # View: Full Picture (heatmap grid)
├── view-timeline.js     # View: Story (timeline feed)
├── view-gauges.js       # View: Summary (gauge dials)
├── update-indicators.js # FRED® API data update script
├── verify-rules.js      # Rule integrity checker
├── data/
│   ├── observations.json  # Runtime indicator data
│   └── fomc-cache.json    # Cached FOMC classifications
├── ARCHITECTURE.md      # Full architecture doc
└── README.md            # This file
```
