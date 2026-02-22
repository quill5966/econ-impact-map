# MacroCausal

An interactive web app that visualizes **macroeconomic causal loops** — how major economic themes (Fed Policy, Inflation, Labor, etc.) influence each other in a reinforcing cycle.

## Quick Start

Open `index.html` in a browser, or serve locally:

```bash
npx http-server . -p 8765
```

Then visit `http://localhost:8765`.

## Features (Phase 1)

- **5 theme nodes** in a circular causal loop: Fed Policy → Financial Conditions → Demand/Growth → Labor → Inflation → (back)
- **Real economic data** sourced from BLS, BEA, and Federal Reserve (as of Feb 2026)
- **Glassmorphism UI** with per-node color coding and embedded sub-item indicators
- **Animated gradient arrows** with flow particles showing causal direction
- **Interactive**: hover to brighten, click to highlight connected edges

## Tech Stack

- Vanilla HTML / CSS / JS (zero dependencies)
- SVG for curved arrow paths
- CSS custom properties for theming

## Roadmap

- **Phase 2**: Simulation scenarios (e.g. "Fed raises rates 50bps") with animated causal chain propagation
- **Phase 3**: Real-time data integration from official sources
- **Future**: Migration to React + Vite + Zustand when complexity warrants it
