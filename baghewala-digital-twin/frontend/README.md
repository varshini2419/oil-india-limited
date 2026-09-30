# Baghewala Heavy-Oil Digital Twin

React 19, TypeScript and Vite frontend for an advisory well-to-surface digital twin. The app models CSS heating and cooling, viscosity, mobility, production, SRP operation, rod-floating risk and engineering trade-offs. It does not actuate field equipment.

## Run

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run build
npm run lint
```

The frontend currently has no browser unit-test runner configured. Deterministic engine checks remain in the existing TypeScript simulation test modules and should be wired to a runner before production deployment.

## Environment

Set `VITE_API_BASE_URL` for the FastAPI base URL, defaulting to `http://localhost:8000`. Set `VITE_BAGHEWALA_RAG_URL` for an optional remote RAG endpoint; without it, the documented offline registry is used.

## Six-page tour

- **Dashboard**: field identity, live engineering metrics, provenance and data coverage.
- **Digital Twin**: animated well view, physics state, rod-floating risk and CSS cooling setpoints.
- **Simulation**: Twin & Controls, ML Advisory, Results & Comparison, Validation & Confidence, and AI Copilot & Evidence.
- **Optimization**: Scenarios A-E, Pareto trade-offs, CSS cycle controls and advisory SRP/VFD recommendations.
- **Live Monitoring**: telemetry, predicted-versus-observed behavior, deviation alerts, imports and documented failure history.
- **Reports**: Live Simulation, Scenario Comparison, Validation & Readiness, and Production Pilot Audit with Markdown and JSON export.

Legacy bookmarks redirect to the matching workflow. Unknown paths render a 404 page.

## Three-minute demo

1. Sign in with the local demo account, open **Dashboard**, and review source coverage and the baseline metrics.
2. Open **Digital Twin**, select a cooling or high-viscosity phenomenon, then inspect viscosity, pump fill and rod-floating risk.
3. Open **Optimization**, compare Scenarios A-E and inspect the CSS cooling timeline and recommended SPM, stroke and VFD values.
4. Open **Live Monitoring** to review telemetry provenance, alerts and documented incident history.
5. Open **Simulation** to show the causal physics chain and validation evidence.
6. Open **Reports** and export the live simulation report as Markdown and JSON.