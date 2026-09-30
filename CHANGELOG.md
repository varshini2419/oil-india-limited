# Changelog

## Refactor

- Hoisted the shared ScenarioProvider into App so every page reads one simulation store; fixed a StrictMode hydration race where the first render overwrote the persisted scenario with baseline.
- Wired the Dashboard, Well Dynamics and Optimization pages to the live physics models (thermal, viscosity, mobility, production, SRP, risk) while keeping the reference-design layout; condition cards and preset loading now drive the same models used by Digital Twin and Simulation.
- Restored the animated 2.5D well dynamics canvas on Well Dynamics in place of the static well schematic; Digital Twin and Simulation keep their existing workbench UI.
- Ported the exact page implementations from github.com/aharon-kumar-kosetti/pixel-perfect-pages (Dashboard, Well Dynamics, Optimization, Live Monitoring, Reports, Data Explorer), including their inline sidebar and topbar, Tailwind v4 design tokens, shadcn primitives (button, switch, checkbox, select) and hero/geology assets.
- Routed the ported pages standalone under the existing login/protected-route wrapper, while Digital Twin and Simulation keep the shared local app shell; legacy bookmark redirects preserved.
- Removed the previously recreated page implementations and their CSS in favor of the verbatim repo versions.
- Removed the orphan Command Center, historical calibration, historical uncertainty and scenario optimization page files.
- Reduced primary navigation to Dashboard, Digital Twin, Simulation, Optimization, Live Monitoring and Reports.
- Added bookmark redirects for legacy routes and retained a visible 404 page.
- Consolidated Simulation into five tabs and Reports into four exportable report types.
- Added modeled rod-floating and impact-loading risk, pump-fill efficiency, SOR, energy per barrel, operating cost, CSS cooling timeline and advisory setpoints.
- Added documented failure-history and data-coverage panels, plus rod-load, pump-fill and SPM deviation thresholds.
- Removed duplicate login background asset and wired the status bar backend state to the health endpoint.

## Deferred

- A browser unit-test runner is not configured in the frontend package, so deterministic engine checks remain in the existing source test modules.
- Live field telemetry import remains unavailable until a real source is configured; simulated and documented sources remain explicitly labelled.