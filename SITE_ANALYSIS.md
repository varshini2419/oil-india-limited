# SITE_ANALYSIS.md — Baghewala Heavy-Oil Digital Twin

> Exhaustive single-file analysis of the Baghewala Heavy-Oil Digital Twin web application
> (frontend React SPA + FastAPI backend). All headings, labels and button text quoted exactly as
> they appear in code / rendered DOM. Where something could not be determined it is marked **Unknown**.

---

## 1. Overview

**What the site is (simple words):** an engineering *decision-support simulator* for a hypothetical
heavy-oil field called **Baghewala** (Bikaner-Nagaur Basin, Rajasthan, India; operator context
**Oil India Limited (OIL)**). It lets a petroleum engineer model Cyclic Steam Stimulation (CSS)
plus Sucker Rod Pump (SRP) lift: choose operating parameters (temperature, steam rate, pump speed,
VFD frequency), watch a physics pipeline compute viscosity / mobility / production / risk, compare
"What-If" scenarios, validate against historical SPE/SHARP D4.1 field records, and export audit
reports. The system repeatedly and explicitly labels itself **advisory-only** — "0 ACTUATION",
"DECISION SUPPORT ONLY", "ADVISORY ONLY — NO PHYSICAL ACTUATION".

- **Product name:** "BAGHEWALA DIGITAL TWIN" (header brand), tagline "Heavy-Oil Field Simulation & Decision Support"
- **Ribbon:** "AN OIL HIGH-VISCOSITY ENTERPRISE"
- **Document `<title>` (all routes):** `Baghewala Heavy-Oil Digital Twin | Oil India Limited`
- **Meta description:** none (no `meta[name=description]` in index.html) — **Unknown/absent**
- **Audience:** petroleum/reservoir engineers, hackathon judges ("SIH prototype" per README),
  evaluators walking a scripted demo flow.
- **Auth:** none. All routes public. No login page, no role gating, no 401/403 handling. The
  header shows a decorative "Administrator / admin@gmail.com / Logout" cluster with **no real
  auth wiring** (Logout button has no onClick).

---

## 2. Tech Stack

| Layer | Technology | Evidence |
|---|---|---|
| Framework | React 19 (`react@^19.2.8`) + TypeScript (~6.0.2) | `frontend/package.json` |
| Build | Vite 8 (`vite@^8.3.0`), Rolldown-based reporter output | package.json, build output |
| Routing | `react-router-dom@^7.18.4` (BrowserRouter, nested `AppLayout`) | `src/App.tsx` |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite@^4.3.3`) + plain CSS (`Sidebar.css`, `DigitalTwinPage.css`) + global CSS variable theme remap | `src/index.css` |
| Icons | `lucide-react@^1.48.0` (dynamic icon map for sidebar) | `NavigationItem.tsx` |
| State | React Context + hooks (`ScenarioProvider`), **localStorage** persistence; no Redux/Zustand | `simulation/scenario/scenarioStore.ts` |
| Charts | None — charts are hand-rolled CSS bar divs (spark lines, tornado bars, residual bars) | RealtimeMonitoring/Uncertainty pages |
| Fonts | Inter, Outfit, JetBrains Mono (Google Fonts) | `index.html` |
| Lint | oxlint | package.json |
| Backend | Python FastAPI + Uvicorn (README says Python 3.14+, requirements `fastapi>=0.110`), Pydantic v2 | `backend/main.py`, `requirements.txt` |
| Backend data | CSV artifact-backed ML service (`backend/app/services/simulation_service.py`, `backend/model_artifacts/`, `well_static.csv` — 30 wells), RAG service | `backend/app/api/simulation.py` docstrings |
| Env | `VITE_API_BASE_URL` (default `http://localhost:8000`), `VITE_BAGHEWALA_RAG_URL` (frontend `.env.example`) | `src/config/index.ts` |
| Offline RAG fallback | A complete in-browser "RAG" knowledge engine with hardcoded incident records (`baghewalaRagEngine.ts`) used when `VITE_BAGHEWALA_RAG_URL` unset | `services/baghewalaRagService.ts` |

**Folder structure (key parts):**

```
baghewala-digital-twin/
├── frontend/               # React SPA
│   └── src/
│       ├── components/     # layout, navigation, ui, simulation, digital-twin, wellDynamics, realtimeMonitoring
│       ├── pages/          # 25 page files (19 routed + 6 unrouted, see §3)
│       ├── simulation/     # ALL physics engines (thermal, viscosity, mobility, production, srpOptimization, cssOptimization, riskEngine, validation, copilot, realtimeMonitoring, fieldDataIntegration, historicalCalibration, uncertaintyAnalysis, scenarioOptimization, finalValidation, finalEngineeringAssessment, productionPilot, deploymentReadiness, integratedValidation, operationalReadiness, fieldIntegration, commandCenter, scenarios, reports…)
│       ├── data/baghewala/ # hardcoded documented field/reservoir/crude/well/historical datasets
│       ├── services/       # api.ts, simulationApi.ts, baghewalaRagService.ts, baghewalaRagEngine.ts, imageIngestionService.ts
│       ├── release/        # releaseVerification, releaseChecklist, releaseManifest
│       ├── types/, utils/, hooks/, config/, assets/
├── backend/                # FastAPI: main.py + app/{api,core,models,schemas,services,utils}, model_artifacts/
├── simulation/ data/ docs/ rag-data/   # workspace-level folders (project scaffolding)
└── README.md, .env.example, sharp-d4.1-report-final.pdf
```

---

## 3. Sitemap Tree

All routes are defined in `frontend/src/App.tsx` inside one `AppLayout` route (header + sidebar +
status bar + `<Outlet/>`). **No dynamic/parametrized routes. No auth-protected routes. No admin
section. No 404 page** — `path="*"` silently redirects to `/`.

```
/ (AppLayout — Header, Sidebar, StatusBar wrap every page)
├── /                            → DashboardPage ................ "Field Dashboard"
├── /well-dynamics               → WellDynamicsPage ............. "WELL DYNAMICS"
├── /command-center              → REDIRECT to /well-dynamics (no page; legacy path)
├── /digital-twin                → DigitalTwinPage .............. "2D Digital Twin Workspace"
├── /simulation                  → SimulationPage ............... "BAGHEWALA DIGITAL TWIN WORKSTATION"
├── /scenarios                   → ScenariosPage ................ "Interactive What-If Scenario Optimization & Trade-Off Engine"
├── /results                     → ResultsPage .................. "Simulation Results — Thermal, Viscosity, Mobility & Production Analytics"
├── /realtime-monitoring         → RealtimeMonitoringPage ....... "STEP 5.5 — REAL-TIME DIGITAL TWIN MONITORING & WHAT-IF SIMULATION"
├── /field-data                  → FieldDataIntegrationPage ..... "Field Data Integration & Telemetry Ingestion"
├── /historical-validation       → HistoricalValidationPage ..... "Field Data Calibration & Historical Validation Workspace"
├── /engineering-copilot         → AiEngineeringCopilotPage ..... "BAGHEWALA AI ENGINEERING COPILOT"
├── /integrated-validation       → IntegratedValidationPage ..... "Integrated Digital Twin Validation & Decision Support"
├── /operational-readiness       → OperationalReadinessPage ..... "STEP 5.8 — OPERATIONAL READINESS & DEMONSTRATION WORKSPACE"
├── /deployment-readiness        → DeploymentReadinessPage ...... "DEPLOYMENT READINESS & PILOT VALIDATION"
├── /production-pilot            → ProductionPilotPage .......... "BAGHEWALA PRODUCTION PILOT WORKFLOW"
├── /final-engineering-assessment→ FinalEngineeringAssessmentPage "FINAL ENGINEERING ASSESSMENT & PERFORMANCE VALIDATION"
├── /final-validation            → FinalValidationPage .......... "FINAL DIGITAL TWIN VALIDATION & DEMONSTRATION WORKSPACE"
├── /field-integration           → FieldIntegrationPage ......... "STEP 6.1 — REAL-WORLD FIELD INTEGRATION & CONTROLLED PILOT READINESS"
├── /release                     → ReleasePage .................. "STEP 6.2 — PRODUCTION DEPLOYMENT & FINAL RELEASE FREEZE"
├── /reports                     → ReportsPage .................. "Simulation Reports & Engineering Documentation"
└── *                            → <Navigate to="/" replace/> (silent redirect; NO 404 page)
```

**Verification (rendered DOM probes of the running dev build):** `<title>` = `Baghewala Heavy-Oil Digital Twin | Oil India Limited` on every route (SPA, no per-page titles); `/release` H1 confirmed = `STEP 6.2 — PRODUCTION DEPLOYMENT & FINAL RELEASE FREEZE`; `/reports` H1 confirmed = `Simulation Reports & Engineering Documentation` with tab buttons `Live Simulation Report`, `Scenario Comparison Report`, `Historical Validation Report`, `Final Validation Package`, `Final Engineering Assessment`, `Production Pilot Audit`, `Release & Freeze Manifest` and download buttons `Markdown (.md)`, `JSON (.json)`; navigating to `/nonexistent-page` landed on `/` (confirmed catch-all redirect).

**Page files that exist but are NOT routed anywhere (dead code / orphan pages):**

| File | Content (from code) |
|---|---|
| `pages/CommandCenterPage.tsx` | Full "BAGHEWALA COMMAND CENTER" dashboard (7 rows: disclaimer banner, control toolbar, 6 KPI cards, physics chain + 2D viewport, uncertainty/SRP/CSS panels, risk & alerts, scenario trade-offs, 9-stage decision pipeline, data quality/readiness/system health). Route `/command-center` now redirects to `/well-dynamics`, so this page is unreachable except by import (none). |
| `pages/HistoricalCalibrationPage.tsx` | "STEP 5.2 — HISTORICAL CALIBRATION & PARAMETER TUNING" |
| `pages/HistoricalUncertaintyPage.tsx` | "STEP 5.3 — UNCERTAINTY & SENSITIVITY ANALYSIS" (Monte Carlo, tornado, OAT ranking, correlations) |
| `pages/ScenarioOptimizationPage.tsx` | "STEP 5.4 — SCENARIO OPTIMIZATION & DECISION SUPPORT ENGINE" |

Total: **19 routed pages** + 1 redirect + 1 catch-all redirect + **4 orphan page components**.

---

## 4. Global Layout (navbar, footer, design system)

### 4.1 Shell (applies to every route)

**Header** (`components/layout/Header.tsx`, class `oil-header-wrapper`):
- Left: drilling-derrick SVG emblem → `BAGHEWALA DIGITAL TWIN` + ribbon `AN OIL HIGH-VISCOSITY ENTERPRISE` + sub-line `Heavy-Oil Field Simulation & Decision Support`
- Center (xl+): amber pill `ACTIVE SCENARIO: {name}`; telemetry pills `{temp}°C | {steam} t/d | {spm} SPM`; emerald `DEMO NODE` pill; `System Status:` + StatusIndicator "System Ready"
- Right: `Administrator` / `admin@gmail.com` + amber `Logout` button (decorative, no handler)
- Center pills are driven by the shared `useScenarioStore()`, so they change live on every page.

**Sidebar** (`components/layout/Sidebar.tsx`, class `oil-sidebar-wrapper`, 236px):
- Category header: `NAVIGATION MODULES`
- Flat nav list (NavLink, exact labels in order): `Well Dynamics`, `Dashboard`, `Digital Twin`, `Simulation`, `Scenarios`, `Results`, `Final Assessment`, `Final Validation`, `Field Integration`, `Release & Freeze`, `Reports`
- Active item = amber pill (`#d99a00` background). `Reports` item has a trailing chevron.
- Footer card: `Baghewala Heavy-Oil` + `Simulation Profile 1` + green pulse dot.

**StatusBar** (`components/layout/StatusBar.tsx`, class `oil-statusbar-wrapper`, h-9 white bar):
- Left: amber `Live` chip → `Backend: Ready` → `Simulation Engine: Active ({scenarioName})` → `Viscosity: {n} cP` → `Oil Rate: {n} bpd` → `Risk: {LOW|MODERATE|HIGH|CRITICAL}` (colored badge) → `Data Source: Prototype / Reference Data`
- Right: `Baghewala Heavy-Oil Digital Twin` • `Advisory Support Only`
- Note: "Backend: Ready" is **hardcoded text**, not the result of `checkHealth()` (the service exists but is never wired to the StatusBar).

**Mobile:** sidebar becomes an off-canvas drawer (`-translate-x-full` → `translate-x-0`) with black backdrop; header hamburger toggles it.

### 4.2 Design system ("Black Chrome & Amber")

| Token | Value |
|---|---|
| Chrome (sidebar/header) | `#050608` background, `#16181d` borders |
| Active accent | Amber `#d99a00` (active nav pill, scenario capsule, logout, LIVE chip) with dark text `#1a1204` |
| Content canvas | `#f8f9fb` (light gray) |
| Cards | white `#ffffff`, border `#e5e7eb`, radius 8–12px, subtle shadow |
| Status colors | emerald `#34d399`/`#0c8a5f`, sky `#0b63c4`, amber `#9a6a00`, rose/maroon `#7f1d1d`, purple `#6d28d9`, cyan `#0e7490` |
| Fonts | Inter (UI sans), JetBrains Mono (all numeric/metric/mono text — heavily used, `font-mono` on nearly every page), Outfit (legacy) |
| Dark/light | Single light content theme on black chrome; many page components still carry `dark:` Tailwind variants (vestigial) |
| Pills/badges | Ubiquitous rounded mono uppercase status chips (`bg-emerald-950 text-emerald-300 border border-emerald-800` pattern) |
| Density | Very dense 10–13px mono type; information-dashboards style |
| Responsiveness | Mobile-first breakpoints throughout (`sm/md/lg/xl/2xl`): sidebar collapses to drawer below `lg`, header center pills hide progressively (`md`→`xl`→`2xl`), metric grids reflow 2→3→5/6/8 cols, tables scroll horizontally (`overflow-x-auto`) |

**Reusable components** (`components/ui/`): `PageHeader` (title + subtitle + gray badge), `Panel`
(white card w/ header strip), `PlaceholderCard` (accent-rail KPI card w/ tones: dark/amber/maroon/green/blue),
`StatusIndicator` (dot+label pill: ready/simulating/warning/error/not_initialized), `FieldDataPanel`.
Others: `SimulationReportModal`, `DigitalTwinViewport` (+ animations, legend), wellDynamics
component set (`PhenomenaSelector`, `WellVisualizationCanvas`, `PhenomenaExplanationPanel`),
`WhatIfSimulationPanel`.

---

## 5. Page-by-Page Breakdown

> Common to ALL pages: light content canvas on `bg-slate-950`-class main, wrapped by the global
> chrome; data almost entirely derived from the shared client-side `ScenarioProvider` physics
> pipeline (hardcoded math, no DB); mono type; dense metric cards. Loading/empty/error states noted
> per page. Every page is **public** (no auth) unless noted.

---

### 5.1 `/` — DashboardPage
- **File:** `src/pages/DashboardPage.tsx`
- **Purpose:** Landing overview of the asset (field/reservoir/well identity cards) + system health; audience: evaluators/executives.
- **H1:** `Field Dashboard`; badge `v1.0.0 Release Freeze`; subtitle `Baghewala Heavy-Oil Digital Twin overview & operational status`; right side: OIL INDIA LIMITED wordmark + red/black SVG emblem.
- **Sections (top→bottom):**
  1. Page header (above).
  2. **7 overview cards** (`PlaceholderCard`, 3-col grid): titles/values/status pills exactly:
     `Field` → `Baghewala Field` / desc `High Data Support` / pill `Documented` (dark tone, MapPin icon)
     `Reservoir` → `Jodhpur Sandstone` / `High Viscosity (~15,000 cP) Matrix` / `Documented`
     `Well` → `BGW-REP-01 (CSS Well)` / `Dual Recovery: CSS + SRP Systems` / `Representative`
     `Current Simulation` → `Interactive Engine Active` / `7-Stage Physics Pipeline Synced` / `Step 6.2 Certified` (maroon tone)
     `Production` → `Calculated Forecast` / `Dynamic Inflow & SRP Lift Model` / `Modeled Output`
     `System Status` → `Operational Ready` / `141/141 verified unit tests PASS` / `Operational`
     `AI Engineering Status` → `Explainable Trace Active` / `High Data Support | 4 Open Gaps` / `Advisory Active` (maroon tone)
  3. **Panel `System Architecture & State`** (subtitle `Foundation status indicator`): 4 rows each with StatusIndicator `Active`, `Connected (/api/health)`, `Step 3.4 Animated`, `Step 4.1 Active`.
  4. **Panel `Engineering Scope Notice`** (subtitle `SIH Digital Twin Roadmap`): sky info block describing `Baghewala Data Foundation (Step 4.1)` and future physics modules.
  5. **FieldDataPanel**: `Baghewala Field & Reservoir Provenance` (8 ParameterRows: Field Name, Basin, Operator Context, Reservoir Formation, Reservoir Depth Range, Native Reservoir Temp, Matrix Permeability, Crude API Gravity — each with source badge DOCUMENTED etc.); `Fluid Viscosity & Well Model` (Documented Viscosity vs Temperature grid, Representative Well ID, Artificial Lift System, CSS Completion Status); `Documented Baghewala Historical Timeline` (event cards with year + sourceType).
- **Data source:** hardcoded dataset `src/data/baghewala/*` (field.ts values quoted above: `Baghewala Field`, `Bikaner-Nagaur Basin`, `Oil India Limited (OIL)`, `Jodhpur Sandstone Formation`, etc.).
- **Interactive:** sidebar links only. No buttons/forms.
- **States:** static; no loading/empty/error branches.
- **Components:** PlaceholderCard, Panel, StatusIndicator, FieldDataPanel.

### 5.2 `/well-dynamics` — WellDynamicsPage
- **File:** `src/pages/WellDynamicsPage.tsx`
- **Purpose:** Interactive 2.5D well-schematic teaching tool: pick a reservoir phenomenon, see animated equipment response. Default landing route of the shell nav.
- **H1:** `WELL DYNAMICS`; badge `PHYSICS DRIVEN`; subtitle `Interactive 2.5D simulation of oil-well equipment, fluid behavior and reservoir phenomena.`; right badges: `DEMO MODE`, `0 PHYSICAL ACTUATION PERMITTED`.
- **Sections:**
  1. Header banner (above).
  2. **`RECOMMENDED EVALUATOR DEMO FLOW:`** bar with 5 step buttons — `STEP 1: Normal`, `STEP 2: Thermal EOR`, `STEP 3: High Viscosity`, `STEP 4: Rod Overload`, `STEP 5: Motor Overload` — plus `NEXT STEP` and `RESET` buttons; live quick-view `State:` / `Temp/Visc:` / BOPD.
  3. 12-col grid: left `PhenomenaSelector` (list of phenomena cards), right `WellVisualizationCanvas` (2.5D SVG well with clickable components; selection highlights and feeds explanation panel).
  4. `PhenomenaExplanationPanel` (full width; explains selected phenomenon/component; includes preset application).
- **Data source:** `config/wellDynamicsPhenomena` (hardcoded phenomena registry w/ `inputPreset`s that call `updateInput`); live results from ScenarioProvider.
- **Interactive:** phenomenon buttons, component click-select, NEXT STEP / RESET (RESET calls `resetCurrentToBaseline()`).
- **States:** no loading; canvas always rendered.

### 5.3 `/digital-twin` — DigitalTwinPage
- **File:** `src/pages/DigitalTwinPage.tsx`
- **Purpose:** Standalone animated 2D schematic viewport + live telemetry strip.
- **Banner:** `DEMO MODE — SIMULATED DEMONSTRATION DATA`
- **H1:** `2D Digital Twin Workspace`; badge `Step 3.4 Animated Twin`; subtitle `Interactive 2D schematic with synchronized stroke motion, flow paths & thermal animation`; right pills `MODEL MODE: {CALIBRATED|BASELINE}`, `UNCERTAINTY: ACTIVE`, `DECISION ENGINE: OPTIMIZED`.
- **Sections:** `DigitalTwinViewport` (SVG: derrick, rods, pump, steam/oil flow, thermal pulses) → **`REAL-TIME DIGITAL TWIN MONITORING (SHARED SIMULATION STATE: {scenario})`** 8 metric tiles: `RESERVOIR TEMP`, `VISCOSITY`, `MOBILITY`, `PRODUCTION`, `VFD FREQ`, `PUMP SPEED`, `SRP LOAD`, `RISK PROFILE`; link `Open Real-Time Monitor & What-If Engine →` → `/realtime-monitoring`; then dev note describing Step 3.4 animations.
- **Data:** ScenarioProvider live physics. **Interactive:** viewport hover; the link above.

### 5.4 `/simulation` — SimulationPage (the app's core workstation)
- **File:** `src/pages/SimulationPage.tsx`
- **Purpose:** 10-tab engineering workstation combining twin, ML advisory, NOC, results, optimization, validation, confidence, pilot, AI copilot, report export.
- **H1:** `BAGHEWALA DIGITAL TWIN WORKSTATION`; eyebrow line `Jodhpur Sandstone • Baghewala Heavy Oil Field, Rajasthan • OIL India Limited`; subtitle `Physics-grounded reactive simulator & ML operating advisory across 6 engineering phases.`
- **Tab bar (sticky, GitHub-style, exact labels + badges):**
  `Digital Twin & Simulation` (Live) · `ML Advisory` (30 Wells) · `Baseline NOC` (Reference) · `Results & Comparison` (14 Metrics) · `Phase 4: Optimization` (Pareto) · `Phase 5: Validation` (Field Match) · `Phase 5: Confidence` (SPE 100642) · `Phase 6: Pilot` (SCADA Replay) · `AI Explanation & RAG` (5 Steps) · `Decision Report` (20 Sections)
- **Tab contents:**
  - **TWIN:** `DigitalTwinViewport` + `SimulationAiSummaryAndAlerts` (left 70%) + `SimulationControlsAndComparison` sidebar (sliders for inputs) + **`Simulation Dependency Pipeline`** — 8 stage cards: `1. Inputs`, `2. Thermal`, `3. Viscosity`, `4. Mobility`, `5. Production`, `6. SRP Lift`, `7. Risk`, `8. Decision` (last shows `ADVISORY`, `0 ACTUATION`).
  - **ML_ADVISORY:** `MLViscosityControlPanel` (calls backend `/api/simulation/*` via `services/simulationApi.ts`; 30-well registry; 18-rule constraint check).
  - **NOC:** `NormalOperatingConditionPanel` — 6 white category cards: `THERMAL STATE`, `FLUID RHEOLOGY`, `PRODUCTION CAPACITY`, `PUMP & LIFT MECHANICS`, `RESERVOIR CONTEXT`, `MULTI-PHYSICS RISK` (each with flaticon image + fallback icon, MODEL-CALCULATED/FIELD DATA chips).
  - **RESULTS:** `SimulationResultComparison` (14-metric baseline vs current tables).
  - **OPTIMIZATION:** lazy `ScenarioOptimizationPanel` (Pareto engine UI).
  - **HISTORICAL:** lazy `HistoricalValidationPanel` + `UncertaintyAnalysisPanel`.
  - **CONFIDENCE:** lazy `EngineeringConfidencePanel` (SPE 100642 framing).
  - **PILOT:** lazy `ProductionPilotPanel` (SCADA replay framing).
  - **AI_COPILOT:** `AiEngineeringExplanationPanel` + `SimulationHistoricalIncidents` (RAG evidence; uses remote RAG if configured else offline engine).
  - **REPORT:** hero card `Comprehensive Baghewala Engineering Decision Report` + button **`GENERATE FULL REPORT`** → opens `SimulationReportModal` (20-section markdown/JSON export); 3 explainer cards: `Full Causal Decision Trace`, `Multimodal RAG Evidence`, `Multi-Format Export`.
- **Loading states:** lazy tabs show fallback `Loading {label}...` with pulsing dot.

### 5.5 `/scenarios` — ScenariosPage
- **File:** `src/pages/ScenariosPage.tsx`
- **Purpose:** What-If scenario builder + comparison matrix + constraint configurator.
- **Banner:** `PROMPT 5 SCENARIO OPTIMIZATION & TRADE-OFF WORKSTATION` + `DECISION SUPPORT ONLY — NO SCADA / AUTOMATIC ACTUATION`
- **H1:** `Interactive What-If Scenario Optimization & Trade-Off Engine`; badge `Prompt 5 Decision Support`; subtitle `Independent scenario creation, side-by-side comparative matrices, user-defined constraint evaluation, and trade-off visualization`.
- **Sub-tabs:** `Scenario Builder & Presets ({n})` · `Pareto Trade-Off Plot & Matrix` · `Engineering Constraints Configurator`; right button `RESET TO BASELINE`.
- **Builder view:** Panel `Active Scenario: {name}` with 4 range sliders — `Reservoir Temp:` 20–120 °C (Baseline: 48.0 °C), `Steam Injection Rate:` 0–200 TPD (Baseline: 50 TPD), `Pumping Speed (SPM):` 2–20 step 0.5 (Baseline: 8.0 SPM), `VFD Frequency:` 30–75 Hz (Baseline: 50.0 Hz); buttons `SAVE SCENARIO`, `DUPLICATE`; instant outputs row (Modeled Temp / Viscosity / Est Production / SRP Load Index) + feasibility badge (`FEASIBLE`/`CONSTRAINT_VIOLATED`) + `RUN SIMULATOR` (navigates to /simulation). Then Panel `Scenario Library & Presets (Scenarios A through E)` — grid of scenario cards (A. Reference Baseline, B. Thermal Improvement, C. Cooling / High Viscosity, D. High SRP Mechanical Load, E. Combined Thermal & High Lift) each with metrics grid, violation list, `SELECT SCENARIO` / `RUN & VIEW`.
- **Trade-off view:** Panel `Pareto Engineering Trade-Off Matrix (Production BOPD vs SRP Load Index)` with guidance text + per-scenario feasibility cards; Panel `Side-by-Side Scenario Comparison Matrix` — big table with sections `1. SCENARIO INPUT PARAMETERS`, `2. CALCULATED PHYSICS OUTPUTS`, `3. CONSTRAINTS & SYSTEM RISK`, `4. DELTA FROM BASELINE (SCENARIO A)`.
- **Constraints view:** Panel `User-Defined Engineering Constraints Configurator` — 6 numeric inputs: `Maximum Viscosity Threshold (cP)` (Default: 10,000 cP), `Minimum Production Target (BOPD)` (8.0), `Maximum SPM Speed Limit` (12.0), `Maximum SRP Mechanical Load Index` (80.0 / 100), `Maximum Steam Temp (°C) [TWCCEP]` (320, "ISO/PAS 12835 limit"), `Maximum Allowable System Risk Score` (60 / 100).
- **Always-on bottom Panel:** `Engineering Decision-Support Summary Panel` + footer line `DECISION SUPPORT ONLY — ENGINEERING REVIEW REQUIRED BEFORE FIELD IMPLEMENTATION`.
- **State:** scenarios persist to localStorage (`baghewala_digital_twin_scenarios_v1`); corrupted storage falls back to baseline with console warning.

### 5.6 `/results` — ResultsPage
- **File:** `src/pages/ResultsPage.tsx` (1036 lines)
- **Purpose:** Full physics results analytics: every Step-4.x model output + baseline deltas + transparency.
- **H1:** `Simulation Results — Thermal, Viscosity, Mobility & Production Analytics`; badge `Step 4.9 AI Risk Advisory Active`; subtitle `Modeled temperature distribution, heavy-oil viscosity reduction, mobility transmissibility, production, CSS cycle optimization, and AI risk advisory`.
- **Sections:** conditional `Simulation Engine Warnings` list →
  `Thermal Model Results Overview (Step 4.3)` (4 stat cards: `Baseline Reservoir Temp` w/ `Source: Documented`, `Modeled Reservoir Temp`, `Steam Thermal Influence` w/ soak %, `Model Confidence`) →
  two half panels `Heavy-Oil Viscosity Profile (Step 4.4)` & `Heavy-Oil Transmissibility Mobility (Step 4.5)` (each 4 metrics: Baseline/Modeled/Delta/Shift%) →
  `Heavy-Oil Production Analysis (Step 4.6)` (4 cards + `6-Stage Engineering Physical Causality Pipeline Flow`: `1. Reservoir Temp`, `2. Viscosity`, `3. Oil Mobility`, `4. Drawdown / J_o`, `5. Est Production`, `6. Modeled Optimum`) →
  `SRP + VFD Production Optimization Analysis (Step 4.7)` (badge `288 Candidates Evaluated`; operating-window card: `ALLOWABLE VFD FREQUENCY`, `ALLOWABLE SPM RANGE`, `ALLOWABLE STROKE LENGTH`, `SAFE CANDIDATES`; current-vs-optimum; table w/ columns `Optimization Parameter | Current Value | Optimized Value | Δ Difference | Data Provenance`) →
  `Baghewala CSS Optimization Analysis (Step 4.8)` (badge `CSS Cycle 1 Optimization`; `7-Stage Physical Causality Chain`: `1. STEAM INJ` … `7. CSS CYCLE RESULT`; `DOCUMENTED HISTORICAL DATA vs MODELED SCENARIO` block citing `[DOCUMENTED - SPE 100642]`; table `Parameter | Baseline | Current CSS | Optimized CSS | Unit`) →
  `Baghewala AI Risk & Operations Advisory (Step 4.9)` (risk pill `Risk Level: {level} ({score}/100)`; `RISK ASSESSMENT SUMMARY`; `ACTIVE DETECTED ISSUES ({n})` with empty-state `✓ Zero critical or high severity risk issues detected.`; risk metric table `Risk Metric | Baseline Value | Current Scenario Value | Risk Threshold Boundary | Metric Status`) →
  `Thermal, Viscosity, Mobility & Production Parameter Comparison — Baseline vs Scenario` (unified delta table w/ source badges documented/scenario/modeled) →
  collapsible `Model Transparency & Calculation Breakdown` (button **`HOW WAS THIS CALCULATED?`**; 5-step ordered equation walkthrough of Steps 4.3–4.6) →
  `Historical Calibration & Parameter Tuning Summary (Step 5.2)` (hardcoded: Baseline MAE 2022.9, Calibrated MAE 2015.2, `-34.6%`, `4 Cases`; link `Open Simulation Page →` → `/simulation`) →
  `Uncertainty & Sensitivity Analysis Summary (Step 5.3)` (hardcoded `6.90 BOPD` P50, `98.2%`, `28.5 / 100`, "500 Monte Carlo Samples"; link `View Output Results →` → `/results` (self-link, a quirk)) →
  `Scenario Optimization & Decision Support (Step 5.4)` (hardcoded `Combined Optimization`, `34.8 BOPD`, `7 / 7`, `NON_DOMINATED`, `LOW (28/100)`; link `Open Scenarios Page →`) →
  `Historical Validation & Model Residuals (Step 6.1)` (hardcoded `VALIDATED (PASS)`, `1.42 BOPD`, `5.8 – 8.1 BOPD`, `Reservoir Temp`; link `OPEN VALIDATION WORKSPACE →` → `/historical-validation`) →
  `AI Engineering Decision Trace & Copilot (Step 7.1)` (badge `HIGH DATA SUPPORT`; link `OPEN ENGINEERING COPILOT →`) →
  `Digital Twin Pipeline Status` notice.
- **Data:** mostly live from store; the four Step-5.x summary panels are **hardcoded literals** in JSX.

### 5.7 `/realtime-monitoring` — RealtimeMonitoringPage
- **File:** `src/pages/RealtimeMonitoringPage.tsx`
- **Purpose:** Simulated live telemetry stream w/ playback, alerts, event timeline, and What-If engine.
- **H1:** `STEP 5.5 — REAL-TIME DIGITAL TWIN MONITORING & WHAT-IF SIMULATION`; subtitle `Simulated Telemetry Streams, State Estimation & Interactive What-If Scenario Physics Engine`.
- **Controls:** `START`/`PAUSE`, `STEP`, `RESET` buttons; status `SIMULATED TELEMETRY: {STOPPED|RUNNING|PAUSED}`; cyan disclaimer box (REALTIME_DISCLAIMER constant).
- **Model-mode toggle:** `BASELINE MODEL` / `CALIBRATED MODEL (STEP 5.2)`.
- **5 KPI cards:** `RESERVOIR TEMP` (+`Thermal Gain: +{n}°C`), `HEAVY-OIL VISCOSITY` (+`Mobility:`), `MODELED RATE` (+`Trend:`), `SRP LOAD INDEX` (Hz | SPM), `OPERATIONAL RISK` (Score).
- **`REAL-TIME TELEMETRY TREND SPARK LINES (SIMULATED)`** — 3 CSS bar charts: `RESERVOIR TEMP VS TIME (°C)`, `MODELED PRODUCTION RATE (BOPD)`, `SRP MECHANICAL LOAD INDEX (/100)`; `HISTORY BUFFERS: {n} TICKS` (max 30).
- **`REAL-TIME ACTIVE ALERTS ({n})`** (severity cards CRITICAL/HIGH/other w/ `Action:` line; empty state `No active warnings or alerts. Operating state is nominal.`) and **`SIMULATED EVENT TIMELINE ({n})`** (max 25 events).
- **`WhatIfSimulationPanel`** (interactive what-if overrides).
- **Data:** `TelemetrySimulator` (seeded RNG, tick 2000ms) + `alertEngine`.

### 5.8 `/field-data` — FieldDataIntegrationPage
- **File:** `src/pages/FieldDataIntegrationPage.tsx`
- **Purpose:** Paste JSON/CSV telemetry → normalize/validate/quality-score → preview mapped twin state.
- **H1:** `Field Data Integration & Telemetry Ingestion`; badge `Step 5.6 Data Layer`; right chips `SOURCE: {label}` and `SCORE: {n}/100`.
- **Amber policy banner:** `Baghewala Field Ingestion & Provenance Policy` + FIELD_DATA_DISCLAIMER.
- **Form (left Panel `Ingestion Parameters`):** selects `Data Source Type` (`HISTORICAL APPRAISAL DATA`, `REAL FIELD DATA`, `USER IMPORTED DATASET`, `SIMULATED TELEMETRY`), `Missing Value Policy` (`LINEAR INTERPOLATION (IMPUTED)`, `FORWARD FILL (IMPUTED)`, `KEEP MISSING`, `REJECT RECORD ON MISSING`), checkbox `Reject Extreme Outliers Automatically`, buttons `Ingest Payload` (Upload icon) + `Reset Sample`.
- **Editor (right):** `Raw Dataset Payload (JSON / CSV Format)` textarea, `Max limit: 5,000 records`, prefilled with a 5-record sample payload for well `BG-01` (timestamps 08:00–09:00, temps 58→80 °C, prod 100→146 BOPD).
- **`Data Quality Audit Report`:** status badge `STATUS: {VALID|PARTIALLY_VALID|INVALID}`; 7 stat tiles `QUALITY SCORE`, `TOTAL RECORDS`, `VALID RECORDS`, `INVALID RECORDS`, `COMPLETENESS`, `OUTLIERS DETECTED`, `IMPUTED VALUES`; conditional `Quality Audit Warnings:` list.
- **`Synchronized Twin Pipeline Preview (Record #{i} / {n})`:** `Reset` / `Step Next` buttons; 6 tiles (TIMESTAMP, RESERVOIR TEMP, OIL VISCOSITY, ESTIMATED PROD, SRP LOAD INDEX, AI RISK LEVEL). Hidden when no records.
- **`Normalized Ingested Records ({n})`** table — columns: `Idx, Timestamp, Well, Source, Status, Temp (°C), VFD (Hz), SPM, Stroke (m), Steam (TPD), Prod (BOPD), Provenance` (row click selects preview; provenance chips MEASURED/IMPUTED).
- **States:** empty preview when 0 records; invalid JSON → INVALID status + warnings.

### 5.9 `/historical-validation` — HistoricalValidationPage
- **File:** `src/pages/HistoricalValidationPage.tsx`
- **Purpose:** Compare twin physics vs documented field observations; tune calibration multipliers; residuals; uncertainty; sensitivity.
- **H1:** `Field Data Calibration & Historical Validation Workspace`; badge `PROMPT 6 HISTORICAL VALIDATION`; long subtitle.
- **Twin banners:** amber `FIELD DATA / HISTORICAL VALIDATION — PROTOTYPE`; sky `DEMONSTRATION DATA — NOT VERIFIED FIELD MEASUREMENTS` ("All reference records are explicitly derived from published SPE/SHARP D4.1 reports or synthetic demonstration logs. Not live SCADA telemetry.")
- **Data-quality banner:** `DATA QUALITY: {PASS|…}`, `Dataset Quality Score: {n} / 100`, `Verified Records: {v} / {t} Records`, right note (`✓ All reference observations passed automated unit & range verification checks.` or warnings count).
- **Panel `Historical Validation Workflow Trace (Step 6.1)`:** 8 clickable stage cards — `REFERENCE DATA`, `DATA QUALITY CHECK`, `MODEL REPLAY`, `RESIDUAL CALCULATION`, `CALIBRATION`, `VALIDATION`, `UNCERTAINTY`, `ENGINEERING REVIEW` (statuses PASS/ACTIVE/COMPLETE/PROTOTYPE/REQUIRED).
- **Panel `Historical Validation Comparison Matrix (Step 6.2)`:** observation selector dropdown (`{wellName} ({sourceType})` over `DEMO_FIELD_OBSERVATIONS`); details card (`Source Document:`, `Source Category:`, `Observation Notes:`); table columns `Parameter | Observed / Reference | Twin Model (Modeled) | Absolute Error | Relative Error (%) | Status | Source Type` with status chips `LOW RESIDUAL` / `HIGH RESIDUAL` (15% cut).
- **`Calibration Multiplier Configurator (Step 6.3)`:** 4 range sliders 0.5–2.0 step 0.05 — `Thermal Gain Multiplier`, `Viscosity Multiplier`, `Production Rate Multiplier`, `SRP Rod Load Multiplier`; `RESET MULTIPLIERS`; prototype-only notice.
- **`Before vs After Calibration Metrics (Step 6.4)`:** per-parameter card w/ `BEFORE (UNCALIBRATED)` and `AFTER (CALIBRATED)` blocks (MAE/RMSE/MAPE/Bias) + error-reduction badge.
- **`Model Residual Analysis (Step 6.5)`:** parameter select (`Reservoir Temperature (°C)`, `Crude Viscosity (cP)`, `Production Rate (BOPD)`, `SRP Load Index (/100)`); per-observation diverging residual bars (`Underpredicts`/`Overpredicts`).
- **`Uncertainty Range Envelopes (LOW / CENTRAL / HIGH)`** (3-col LOW BOUND / CENTRAL CASE / HIGH BOUND cards per parameter) & **`Input Sensitivity Ranking (Step 6.7)`** (`Perturbation impact evaluation (+5°C, +20 TPD, +2 SPM)`; ranked cards with `ΔProd:`/`ΔVisc:` and `Score: {n}/100`).
- **`Documented Field Data Knowledge Gaps (SHARP D4.1 Table 6)`:** `Validation Boundaries & Unavailable Measurements` paragraph.

### 5.10 `/engineering-copilot` — AiEngineeringCopilotPage
- **File:** `src/pages/AiEngineeringCopilotPage.tsx`
- **Purpose:** Explainable-AI command center: NL query box (rule-based, no LLM), causal chain, decision trace, scenario advisor, RAG evidence, data gaps, advisories.
- **H1:** `BAGHEWALA AI ENGINEERING COPILOT`; badge `Step 7.1 AI Engineering Command Center`.
- **Live summary card:** `Active Scenario: {name}`; 6 metric tiles (`Reservoir Temp`, `Viscosity`, `Mobility (k/μ)`, `Production`, `SRP Load Index`, `System Risk Score`); `Status: {FEASIBLE|…}` badge; button **`WHY DID THIS CHANGE?`** toggles Panel `WHY DID THIS CHANGE? — Scenario Parameter Delta Analyzer` (per-parameter: `{param} Changed`, `previous → current (Delta:)`, `Affected Physics Model:`, `Intermediate Physics Effect:`, `Final Output Delta:`, `Causal Explanation:`; empty state when unchanged).
- **Panel `Natural Language Engineering Query Input`:** text input (placeholder `e.g. What happens if reservoir temperature increases to 70°C?`), `SUBMIT` button, Enter-to-run; 5 preset query chips exactly: `What happens if reservoir temperature increases to 70°C?`, `What happens if SPM is increased to 15?`, `Compare thermal improvement with high SPM.`, `What is causing the current risk?`, `Which constraint is currently active?`. Queries run through `processCopilotEngineeringQuery` (regex rule engine); `SET_TEMP`/`SET_SPM` matches **mutate scenario inputs** as a side effect.
- **`Copilot Response: "{question}"` panel:** sections each tagged `[SOURCE_TAG]`.
- **`Explainable Causal Chain (WHY THIS STATE?)`** (6 stage cards) · **`Structured 9-Step Engineering Decision Trace`** (status chips COMPLETE/VIOLATED) · **`Scenario Advisor (Multi-Scenario Classification & Trade-Offs)`** · **`Grounded Historical RAG Evidence`** (banner `HISTORICAL EVIDENCE — NOT A PREDICTION`; entries `[category] title`, `Page {n}`, `Document:`/`Source:`) · **`Prioritized Field Data Knowledge Gaps`** (HIGH/MEDIUM priority chips) · **`Non-Actuating Engineering Decision-Support Advisories`** · **`Recent Engineering Queries History`** (last 10, `RE-RUN` buttons).

### 5.11 `/integrated-validation` — IntegratedValidationPage
- **File:** `src/pages/IntegratedValidationPage.tsx`
- **Purpose:** End-to-end auditable workflow tying Steps 4.3–5.6 into one validation + decision view.
- **H1:** `Integrated Digital Twin Validation & Decision Support`; badge `Step 5.7 Workflow`; chips `DATA: {label}`, `MODEL: {mode}`.
- **Amber banner:** `Operational Decision Support Policy` + INTEGRATED_VALIDATION_DISCLAIMER.
- **`System Integration & Validation Status`:** selects `Select Mode:` (`CALIBRATED`/`BASELINE`, `HISTORICAL DATA`/`REAL FIELD DATA`/`SIMULATED TELEMETRY`); 6 tiles `TWIN STATUS` (ONLINE), `DATA SOURCE`, `QUALITY SCORE`, `VALIDATION STATUS`, `SYSTEM CONFIDENCE`, `TRACE ID`.
- **`Current Digital Twin Physics State`:** 8 tiles `TEMP, PRESSURE, VISCOSITY, MOBILITY, PROD, VFD / SPM, STEAM, AI RISK`.
- **`Observed vs Predicted Model Validation`** table: `Metric | Observed | Baseline | Calibrated | Abs Error | % Error | Status` (MATCH/DEVIATION chips; observed `NOT_AVAILABLE` when missing) + side panel **`Baseline vs Calibrated Fit`** (Baseline MAE, Calibrated MAE, Error Reduction, Valid Samples; empty state `No observed field data available to compute statistical MAE/RMSE metrics.`).
- **`Model Uncertainty Range (Step 5.3 Monte Carlo)`** (`P10 (OPTIMISTIC)`, `P50 (MEDIAN)`, `P90 (CONSERVATIVE)`, Mean/Std Dev/Width) & **`Advisory Operational Recommendation`** (selected scenario card, `OPTIMIZED PROD`, `SRP LOAD INDEX`, bullet `decisionReasons`; empty state `No feasible scenario candidate satisfied all operational constraints without violating safety bounds.`).
- **`Auditable Causal Decision Trace (8 Stages)`:** expandable accordion stages (`Click any stage to expand full inputs/outputs`) rendering `Inputs Summary:` / `Outputs Summary:` JSON `<pre>` blocks.

### 5.12 `/operational-readiness` — OperationalReadinessPage
- **File:** `src/pages/OperationalReadinessPage.tsx`
- **Purpose:** Aggregate readiness verdict (12 pipeline modules + data readiness) + one-click end-to-end demo.
- **H1:** `STEP 5.8 — OPERATIONAL READINESS & DEMONSTRATION WORKSPACE`; subtitle `End-to-End Twin System Validation, Pipeline Audit & Controlled Demonstration Mode`.
- **Top banner:** `System Readiness Status:` badge (`PILOT VALIDATION READY` / `ENGINEERING REVIEW READY` / `DEMO READY` / `NOT READY` + description text); select (`Historical Appraisal Data`, `Simulated Telemetry Feed`, `Real Field Data (If Online)`); button **`Run End-to-End Demonstration`** (600 ms fake latency, spinner `Executing Demo...`).
- **`PIPELINE HEALTH EVALUATION (12 MODULES)`:** PASSING/WARNINGS/FAILURES counters + scrollable module list (name, `[stepReference]`, evidence, PASS/WARNING/FAIL badge).
- **`DATA READINESS EVALUATION`:** `QUALITY SCORE`, `COMPLETENESS`, `MISSING METRICS`, `OUTLIERS` tiles; `PROVENANCE BREAKDOWN:` key-count list; `DATA READINESS WARNINGS:` list.
- **`END-TO-END DECISION PIPELINE ARCHITECTURE`:** 8 nodes `01. FIELD DATA` … `08. DECISION` (details: `Ingestion & Normalization`, `Schema & Outlier Check`, `Steps 4.3–4.8 Pipeline`, `Step 5.2 Parameters`, `Step 5.3 Monte Carlo`, `Step 5.4 Pareto Engine`, `Step 4.9 AI Risk Advisory`, `Step 5.7 Audit Trace`); caption `100% CONNECTED & DETERMINISTIC`.
- **`DEMONSTRATION AUDIT TIMELINE (RUN: {auditId})`:** after demo runs — table `Stage | Name | Source & Provenance | Model / Engine | Status`; `TELEMETRY TAG:` label.
- **`OPERATIONAL LIMITATIONS & GOVERNANCE CAVEATS`:** limitations list + `MANDATORY SAFETY & ADVISORY NOTICE:` box.

### 5.13 `/deployment-readiness` — DeploymentReadinessPage
- **File:** `src/pages/DeploymentReadinessPage.tsx`
- **Purpose:** Final deployment audit: 15 gates, pilot checklist, telemetry readiness, model acceptance, safety governance, audit trail.
- **Safety banner:** disclaimer + rose chip `FIELD DEPLOYMENT NOT YET CERTIFIED`.
- **H1:** `DEPLOYMENT READINESS & PILOT VALIDATION`; badge `STEP 5.10`; subtitle `Final System Audit • Deployment Gates • Field Pilot Checklist • Safety Decoupling Verification`; readiness badge variants: `PILOT VALIDATION READY` / `ENGINEERING REVIEW READY` / `DEMONSTRATION READY ONLY` / `NOT READY (BLOCKERS ACTIVE)`.
- **Controls:** selects (`Historical Data`/`Simulated Telemetry`/`Real Field Data`; `Default Feed`/`Real SCADA Feed`/`Test Bed Feed`/`Disconnected`; `Calibrated Mode`/`Baseline Mode`); button `RUN VALIDATION`; printer button (title `Print Audit Report`, calls `window.print()`).
- **Status row:** `DATA SOURCE:`, `PROVENANCE:`, `VERIFIED SIMULATION TESTS: 304 / 304 PASSING` (**hardcoded**).
- **`15 MANDATORY DEPLOYMENT GATES`:** `Passed: {n} / 15`; gate cards (id • category, name, evidence, `Limitation: {text}`; PASS/WARNING/BLOCKED icons).
- **`FIELD PILOT CHECKLIST ({pct}%)`:** progress bar + boolean key grid w/ ✓/✗ icons; `{passed} / {total} PASSED`.
- **`TELEMETRY CONNECTION READINESS`:** rows `Connection Feed Label:`, `Record Count:`, `Schema & Unit Status:`, `Is Simulated Telemetry:` (`YES (SIMULATED)`/`NO (FIELD DATA)`).
- **`MODEL ACCEPTANCE EVALUATION`:** `Historical Sample Count:`, `Model Mode:`, `Uncertainty Width:`, `SUMMARY:` block.
- **`SAFETY & GOVERNANCE SAFEGUARDS`:** `SCORE: {n} / 100`; rows `Advisory-Only Architecture: ENFORCED ✓`, `Automatic Equipment Actuation: BLOCKED (0 AUTO SIGNAL) ✓`, `Human Operator Approval: REQUIRED ✓`; `GOVERNANCE STATEMENT:` block.
- **`FINAL DEPLOYMENT AUDIT TRAIL ({n} STAGES)`:** caption `12 Chronological Audit Events`; numbered event cards with stage, summary, status chip, component.

### 5.14 `/production-pilot` — ProductionPilotPage
- **File:** `src/pages/ProductionPilotPage.tsx`
- **Purpose:** Frame-by-frame pilot replay (50 frames) across pilot scenarios with KPIs, risk advisory, readiness gates, audit trail, printable report.
- **Safety banner:** mandated disclaimer + chip `PRODUCTION PILOT WORKFLOW v5.11`.
- **H1:** `BAGHEWALA PRODUCTION PILOT WORKFLOW`; badge `STEP 5.11`; subtitle `Controlled Field Pilot Simulation • Replay Engine • Multi-Scenario Physics • Auditable Decision Pipeline`; workflow badge variants: `REAL FIELD PILOT READY` / `ENGINEERING REVIEW READY` / `SIMULATION RUNNING` / `WORKFLOW BLOCKED`; `PROVENANCE` chip; toggle `REAL TELEMETRY: CONNECTED` / `REAL TELEMETRY: NOT CONNECTED`.
- **Toolbar:** `SELECT PILOT SCENARIO:` dropdown (from `getAllPilotScenarios()`); replay controls ▶/⏸, `STEP`, `RESET`, `FRAME {n} / 50`, speed select `0.5x/1.0x/2.0x/5.0x`, `REPORT` button (renders inline report panel), printer (`Print Report`).
- **Scenario card:** name + description + chip `SIMULATED / WHAT-IF`.
- **6 KPI cards** (first 6 of 13 pilot KPIs: label, unit, big value, `sourceModule`).
- **`PHYSICS PIPELINE COUPLING`** (Reservoir Temp, Crude Viscosity, Oil Mobility, Production Rate, footer `SRP Load:` / `CSS Gain:`) + **`LIVE 2D DIGITAL TWIN SCHEMATIC`** (chip `REAL-TIME ANIMATED VIEW`) w/ `DigitalTwinViewport`.
- **`AI RISK ADVISORY ({n})`** (per-event: `detectedIssue`, `supportingEvidence`, `Recommendation:`, `sourceModule` chip; caption `Advisory Only`) & **`PILOT READINESS GATES`** (6 rows all `READY ✓`-style: Data Readiness, Model Readiness, Telemetry Feed (`READY ✓`/`SIMULATED`), Validation Trace, Safety Governance `PASSED ✓`, Simulation Pilot; header `deploymentReadinessLevel`).
- **`CHRONOLOGICAL PILOT AUDIT TRAIL ({n} STAGES)`:** numbered stage cards (`outputSummary`, `Advisory:`, status chip).
- **Inline report panel** (after `REPORT`): `{report.title}` + `CLOSE REPORT`; blocks `SCENARIO & STATUS:`, `FINAL STATUS:`, `PHYSICS & TWIN SUMMARY:`, `RISK RATING:`, `LIMITATIONS & DISCLAIMER:` numbered list.

### 5.15 `/final-engineering-assessment` — FinalEngineeringAssessmentPage
- **File:** `src/pages/FinalEngineeringAssessmentPage.tsx`
- **Purpose:** Step 5.12 roll-up of pilot results: deployment status, model accuracy, Monte Carlo envelope, KPI table, findings registry, gaps, required field validations, printable report modal.
- **Badges:** `STEP 5.12 MODULE` + provenance badge (telemetry toggle-driven).
- **H1:** `FINAL ENGINEERING ASSESSMENT & PERFORMANCE VALIDATION`; subtitle `Integrated evaluation of Step 5.11 pilot results, physics model calibration, Monte Carlo uncertainty bounds, field readiness gates, and deployment evidence gaps.`; buttons `REAL TELEMETRY: CONNECTED/NOT CONNECTED` toggle, **`Print Assessment Report`**.
- **`EXECUTIVE SUMMARY & MANDATED DISCLAIMER`:** `ID: {assessmentId}`; executive summary paragraph; amber `MANDATED DISCLAIMER:` box.
- **Row 1 (3 panels):** `DEPLOYMENT STATUS` (big status chip e.g. `CONTROLLED PILOT REQUIRED`; `RATIONALE`; `NEXT REQUIRED STAGE`; footer `Supporting Evidence: {n} items` / `Missing Evidence: {n} items`) · `MODEL ACCURACY & CALIBRATION` (`Baseline MAE` cP, `Calibrated MAE` cP, `Error Reduction`, `Appraisal Samples`; `Validation Coverage` note citing Appraisal Well BW-01, 40°C–180°C) · `MONTE CARLO UNCERTAINTY (P10–P90)` (chip `50 SAMPLES`; `P10 Low`, `P50 Mean`, `P90 High`, `80% Confidence Interval:`, `Support Level:`; footnote "* Probabilistic model spread derived from Latin Hypercube sampling across 12 reservoir parameters.").
- **`STEP 5.11 PILOT KPI & PHYSICS PERFORMANCE`:** `KPI Achievement: {n} / {m} Normal`; 6-up metric cards (label, value+unit, provenance, status chip).
- **`ENGINEERING TRACEABILITY FINDINGS REGISTRY ({n})`:** table `Finding ID | Traceable Finding Statement | Status | Source Steps | Evidence IDs | Provenance` (caption `Fully Traceable to Steps 4.3–5.11`).
- **`IDENTIFIED EVIDENCE GAPS ({n})`** (gap cards: id+title, severity chip HIGH/other, description, `Required Action:`; caption `Required for Real Field Progression`) & **`REQUIRED PHYSICAL FIELD VALIDATIONS ({n})`** (numbered list; caption `Before Real Field Deployment`).
- **Report modal:** `{report.title}` + `Close Report`; `Report ID / Generated At / Final Status`; section `<pre>`s; `REPORT DISCLAIMER:`; footer `Print / Save PDF`.

### 5.16 `/final-validation` — FinalValidationPage
- **File:** `src/pages/FinalValidationPage.tsx`
- **Purpose:** Step 5.13 consolidated validation: verification summary, 12-node flowchart, 6 demo scenario inspector, evidence registry, limitations, readiness categories, export modal.
- **Badges:** `STEP 5.13 CONSOLIDATED MODULE` + provenance.
- **H1:** `FINAL DIGITAL TWIN VALIDATION & DEMONSTRATION WORKSPACE`; subtitle `Traceable consolidation of 19 simulation modules (Steps 4.3–5.13). Verified 394 unit tests passed cleanly across physics, calibration, uncertainty, optimization, readiness, and pilot execution.`; buttons telemetry toggle + **`Export Final Engineering Report`**.
- **`FINAL EXECUTIVE DETERMINATION & SAFETY GOVERNANCE`:** `ID: {validationId}`; summary; `MANDATED SAFETY DISCLAIMER:` box.
- **`SYSTEM VERIFICATION SUMMARY`** (chip `100% VERIFIED`; tiles `Modules Verified` = `19 / 19 Modules`, `Unit Tests Passed` = `{passed}/{total}`, `Unit Tests Failed`, `Bundler Build Status`; row `Verification Status` + `(Zero test regressions)`) & **`DIGITAL TWIN PIPELINE FLOWCHART`** (caption `12 Sequential Decision Nodes`; stage chips `Field Data, Data Quality, Physics, Calibration, Uncertainty, Optimization, Risk, Monitoring, Validation, Readiness, Pilot, Final Assessment`; footer `Pipeline Architecture: Decoupled & Advisory-Only`, `Traceability: Full Evidence Mapping`, `Actuation: 0 Physical Control`).
- **`6 DETERMINISTIC DEMONSTRATION SCENARIOS ({n})`:** 6 selector buttons (`{scenarioId}`, title after colon, `Risk: {level}` chip); inspector shows title/description, `Risk Score: {n}/100 ({level})`, 6 metric tiles (`Reservoir Temp`, `Crude Viscosity`, `Oil Mobility`, `Production Rate`, `SRP Rod Load`, `P10–P90 Range`), `Decision Support Advisory:` note.
- **`EVIDENCE TRACEABILITY REGISTRY ({n} ITEMS)`:** table `Evidence ID | Step & Module | Description | Observed / Modeled Value | Provenance | Status` (caption `Strict Data Provenance Tracking`).
- **`KEY ENGINEERING LIMITATIONS ({n})`** (`!` bullet cards; caption `Assumptions & Boundaries`) & **`SYSTEM READINESS CATEGORY EVALUATION`** (rows `Software Operational Readiness:`, `Deployment Readiness Status:`, `Final Engineering Determination:`; `READINESS SUMMARY` block; caption `Explicit Status Distinctions`).
- **Modal:** same pattern as 5.15 with `Print / Export PDF Package`.

### 5.17 `/field-integration` — FieldIntegrationPage
- **File:** `src/pages/FieldIntegrationPage.tsx`
- **Purpose:** Step 6.1 telemetry-source gate: pick SIMULATED/REPLAY/REAL_FIELD, evaluate quality/freshness, control a simulated pilot gate, advisory panel, audit trail, export.
- **H1:** `STEP 6.1 — REAL-WORLD FIELD INTEGRATION & CONTROLLED PILOT READINESS`; sub-line `Baghewala Heavy-Oil Digital Twin • Real-Time Telemetry & Advisory Control Gate`; button `Export Pilot Report` (modal); `SAFETY GOVERNANCE MANDATE:` amber banner.
- **Section `1. Telemetry Connection Status`:** `Provenance:` chip; three mode cards — `SIMULATED MODE` ("Generates simulated physics stream from Step 4 baseline reservoir model."), `REPLAY MODE` ("Replays historical Baghewala appraisal well dataset records for validation."), `REAL FIELD MODE` ("Connects to live physical SCADA field telemetry feed (requires authentication)."); when REAL_FIELD: `Physical SCADA Gateway Simulation Override:` + button `CONNECT PHYSICAL FEED`/`DISCONNECT PHYSICAL FEED`; when disconnected, rose box `STATUS: NOT_CONNECTED — No authenticated physical SCADA endpoint configured. System explicitly refuses to fabricate fake live connection data.`
- **4 health tiles:** `Stream Freshness` (`LIVE|STALE|OFFLINE`, `Age: {n}s`, note `Stale limit: 300s (Configured software threshold)`), `Quality Score` (`{n} / 100` + status chip; `Completeness:`), `Missing Metrics` (chips `{m}: NOT_AVAILABLE` or `None (Full Sensor Coverage)`), `Telemetry Stream Counters` (Accepted/Warnings/Rejected).
- **`3. Normalized Field Telemetry Record`:** `Well ID:`, `Timestamp:`; tiles `Reservoir Temp:`, `Reservoir Pressure:`, `VFD Frequency:`, `SRP SPM:` (each `NOT_AVAILABLE` when null); empty state `No field telemetry record available (Connection Status: NOT_CONNECTED)`.
- **`4. Digital Twin State (Existing Physics Pipeline)`:** `Modeled Temp:` (+`Provenance:`), `Oil Viscosity:` (+`Status: Calibrated`), `Oil Mobility:` (+`Step 4.5 Mobility Engine`), `Est Production:` (+`Step 4.6 Production Engine`); empty state `Physics state estimation blocked due to telemetry quality / connection status.`
- **`5. Integrated Physics Model Status`:** rows w/ AVAILABLE/ACTIVE chips — `Baseline Physics Models (Steps 4.3–4.6)`, `Calibrated Parameter Model (Step 5.2)`, `Monte Carlo Uncertainty Engine (Step 5.3)`, `AI Risk & Advisory Engine (Step 4.9)`.
- **`6. Controlled Pilot Gate`:** status chip (`PILOT_READY`/`ENGINEERING_REVIEW_REQUIRED`/`PILOT_PAUSED`/`NOT_CONNECTED`/`DATA_NOT_READY`); 6 condition rows (`Telemetry Connected`, `Acceptable Data Quality`, `Model Pipeline Ready`, `Risk Advisory Active`, `Advisory-Only Confirmed`, `Operator Approval`); buttons **`GRANT OPERATOR APPROVAL`**/`REVOKE OPERATOR APPROVAL` and **`PAUSE PILOT`**/`RESUME PILOT` (approval disabled while NOT_CONNECTED).
- **`7. Real-Time Advisory Panel (Non-Actuating)`:** chip `ADVISORY ONLY — NO PHYSICAL ACTUATION`; `Evaluated Risk Level:`, `Risk Severity Score:`, `AI Decision Support Recommendations:` bullet list.
- **`8. Chronological Integration Audit Trail`:** table `Event ID | Timestamp | Source | Well ID | Quality | Model Mode | Pilot State | Advisory Status` (advisory column hardcoded `ADVISORY_ONLY`).
- **`9. Explicit Engineering Limitations & Provenance Boundaries`:** numbered limitation cards.
- **Export modal:** report id/mode/quality/pilot status + `Digital Twin State Summary:`, `Advisory Summary:`, `Mandatory Governance Disclaimer:` + `Close Report`.

### 5.18 `/release` — ReleasePage
- **File:** `src/pages/ReleasePage.tsx`
- **Purpose:** Step 6.2 productionization/freeze: environment strategy, demo scenarios, 20-item release checklist, freeze-certificate modal.
- **H1:** `STEP 6.2 — PRODUCTION DEPLOYMENT & FINAL RELEASE FREEZE`; sub-line `Baghewala Heavy-Oil Digital Twin • Productionization, Demonstration & Final Freeze Package`; status chip `SYSTEM FROZEN & VERIFIED` or `RELEASE BLOCKED — NOT FROZEN`; button `View Freeze Record` / `View Release Blockers` (modal); `SAFETY GOVERNANCE MANDATE:` banner.
- **4 summary cards:** `Release Version` (+releaseId chip, `Build: {status}`), `Verified Test Suites` (`{n} Suites` + `ALL GATES PASS`/`{k} BLOCKERS`; note `Tests recorded in verification run: {n}`), `Freeze Statuses` (`Step 5:` emerald, `Step 6.1:` rose, `Step 6.2:` rose values), `SCADA Connectivity` (`DISCONNECTED` + `UNCONFIGURED`; note "Real physical SCADA stream unconfigured; SIMULATED & REPLAY active.").
- **`2. Production Environment Strategy`:** `Current Environment: {mode}`; 5 mode buttons `DEVELOPMENT, DEMONSTRATION, REPLAY, PILOT, PRODUCTION`; config strip `API Gateway:` / `SCADA Endpoint:` / `Stale Telemetry Limit:` (`{n}s`) / `Governance Mode:` = `Strict Advisory Only`.
- **`3. Deterministic Demonstration Scenarios`:** chip `SIMULATED DEMONSTRATION SCENARIOS`; 4 scenario buttons (category + title); inspector with `Modeled Reservoir Temp:`, `Estimated Crude Viscosity:`, `Oil Mobility:`, `Estimated Production:`, `Decision Support Summary:`.
- **`4. Production Release Readiness Checklist`:** `{passed} / {total} CHECKS PASSED`; item cards `{checkId} — {category}`, description, `Evidence: {text}` line.
- **Freeze modal:** `OFFICIAL FINAL SOFTWARE FREEZE CERTIFICATE` or `RELEASE GATE REVIEW — NOT FROZEN`; `Freeze ID:`, `Timestamp:`, `Authorized Role:`, freeze statement box, bullet stats (Verified Test Suites / Individual Tests / Release Checklist / Frontend Production Build / Real-Field Connectivity), `Blocking checks` list; `Close`.

### 5.19 `/reports` — ReportsPage
- **File:** `src/pages/ReportsPage.tsx`
- **Purpose:** Report hub: 7 switchable report types rendered as sections, downloadable as .md/.json via Blob.
- **H1:** `Simulation Reports & Engineering Documentation`; badge `Step 6.2 Certified Workstation`; subtitle `Dynamic live scenario report, exportable engineering summaries, audit traces, and release certificates`.
- **Report tabs (exact labels):** `Live Simulation Report`, `Scenario Comparison Report`, `Historical Validation Report`, `Final Validation Package`, `Final Engineering Assessment`, `Production Pilot Audit`, `Release & Freeze Manifest`.
- **Main Panel:** title = active report title; subtitle `ID: {id} | Generated: {ts}`; buttons `Markdown (.md)` and `JSON (.json)` (Blob download `{id}.md` / `{id}.json`).
- **Content:** `Report Status Determination:` badge (OPTIMAL*/READY*/PASSED* → green else amber); numbered section cards (titles like `1. Active Scenario Inputs Summary`, `2. Calculated Physics Results`, `3. Parameter Transition Matrix (Baseline vs Current)`, `4. Active Risks & System Constraints`, `5. Grounded Historical RAG Evidence`, `6. Documented Knowledge Gaps (SHARP D4.1 Table 6)`, `7. AI Engineering Explanation & Advisory Actions` for the live report; each report type has its own section set); amber `Mandated Safety Disclaimer` box with per-report disclaimer text.
- **Data:** all reports generated client-side (`generateLiveSimulationReport`, `generateScenarioComparisonReport`, `generateHistoricalValidationReport`, final validation/assessment/pilot engines, `releaseVerification/Checklist/Manifest`) from the shared store — no network.

---

### Orphan (unrouted) pages — summarized for completeness
- **CommandCenterPage** (`/command-center` legacy): H1 `BAGHEWALA COMMAND CENTER` + badge `EXECUTIVE OPERATIONS`; subtitle `Unified Heavy-Oil Digital Twin Control Room • Integrated Physics, Optimization, Risk & Telemetry`; provenance chips `DATA SOURCE` / `MODEL MODE` / `READINESS`; selects + `DEMO MODE` toggle button (`LIVE DEMO` when active, 3 s refresh interval); row `LAST SYNC:` + `VERIFIED SIMULATION TESTS: 274 / 274 PASSING` (hardcoded); 6 metric cards (`RESERVOIR TEMP`, `VISCOSITY`, `OIL MOBILITY`, `PRODUCTION`, `SRP LOAD`, `AI RISK LEVEL`); `PHYSICS COUPLING CHAIN` (4 steps, `Steps 4.3 – 4.6`) + `LIVE 2D DIGITAL TWIN SCHEMATIC`; `PRODUCTION & UNCERTAINTY (STEP 5.3)` (P50 bar visualization), `SRP & VFD OPTIMIZATION (STEP 4.7)`, `CSS THERMAL OPTIMIZATION (STEP 4.8)`; `AI RISK ADVISORY (STEP 4.9)` + `ACTIVE OPERATIONAL ALERTS ({n})` (empty state `No active operational alerts. All parameters nominal.`); `SCENARIO OPTIMIZATION & OPERATIONAL TRADE-OFFS (STEP 5.4)`; `INTEGRATED DIGITAL TWIN DECISION PIPELINE (STEPS 4.3 – 5.9)` (9 clickable stage cards → routes); `DATA QUALITY & PROVENANCE (STEP 5.6)`, `OPERATIONAL READINESS (STEP 5.8)`, `SYSTEM HEALTH & INTEGRITY` (chip `VERIFIED`).
- **HistoricalCalibrationPage:** H1 `STEP 5.2 — HISTORICAL CALIBRATION & PARAMETER TUNING`; mode toggle `BASELINE (Uncalibrated)` / `CALIBRATED (Data-Fitted)` (writes to global `parameterRegistry`); 4 summary cards (`HISTORICAL OBSERVATIONS`, `BASELINE ERROR (MAE)`, `CALIBRATED ERROR (MAE)`, `OVERALL ERROR REDUCTION`); `Baghewala Candidate Parameter Calibration Registry` table (`PARAMETER | CATEGORY | BASELINE | CALIBRATED | STATUS | PROVENANCE | DESCRIPTION / REASON`, chips `CALIBRATED`/`INSUFFICIENT DATA`/`DOCUMENTED`); `Parameter Sensitivity Analysis (-20% to +20% Perturbations)` cards; `Historical Observations vs Baseline & Calibrated Model Predictions` table (`YEAR / PERIOD | PARAMETER | HISTORICAL OBSERVED | BASELINE PRED | CALIBRATED PRED | BASELINE ERR | CALIBRATED ERR`, `N/A (Unmeasured)` cells).
- **HistoricalUncertaintyPage:** H1 `STEP 5.3 — UNCERTAINTY & SENSITIVITY ANALYSIS`; chip `500 SAMPLES ACTIVE`; controls `SAMPLE COUNT (N)` (10–5000), `PRNG SEED` (Mulberry32), button `RUN MONTE CARLO ANALYSIS`; 4 distribution cards (`PRODUCTION DISTRIBUTION`, `VISCOSITY DISTRIBUTION`, `MOBILITY DISTRIBUTION`, `RISK SCORE DISTRIBUTION` w/ P90/P50/P10); tabs `DISTRIBUTION & PROVENANCE`, `TORNADO SENSITIVITY CHART` (paired left/right bars), `OAT SENSITIVITY RANKING` (table `RANK | PARAMETER | MAX PRODUCTION Δ | SENSITIVITY INDEX | PROVENANCE`), `MODEL-SAMPLE CORRELATIONS` (table `INPUT PARAMETER | AFFECTED OUTPUT METRIC | PEARSON (r) | INTERPRETATION`); `Engineering Synthesis & Physical Interpretation` footer.
- **ScenarioOptimizationPage:** H1 `STEP 5.4 — SCENARIO OPTIMIZATION & DECISION SUPPORT ENGINE`; feasibility chip; model toggle `BASELINE MODEL`/`CALIBRATED MODEL (STEP 5.2)`; objective cards `Balanced Operation`, `Maximize Production`, `Minimize Risk`, `Thermal Efficiency`; 5 constraint inputs (`MAX VFD FREQ (Hz)`, `MAX SRP SPEED (SPM)`, `MAX STEAM RATE (TPD)`, `MAX LOAD INDEX (/100)`, `MIN PROD RATE (BOPD)`), `RESET DEFAULTS`; `RECOMMENDED SCENARIO` hero (award icon, `CONFIDENCE:` chip, `KEY DECISION RATIONALE` list, `PARETO TRADE-OFF ANALYSIS`, `OPERATIONAL WARNINGS`); scenario cards w/ `PARETO OPTIMAL`/`DOMINATED` chips; `FULL SCENARIO COMPARISON MATRIX` table (`SCENARIO NAME | OPERATING POINT | MODELED BOPD (P50) | RISK LEVEL | LOAD INDEX | CSS SCORE | STATUS | PARETO`).

---

## 6. Data Models & API Endpoints

### 6.1 Frontend data architecture (primary source of truth)

**Everything visible on pages is computed client-side.** There is no database and no CMS. Layers:

1. **Documented dataset** — `src/data/baghewala/*` (field, reservoir, crude, wells, cssCycles, production, historicalEvents, sources, validation). Core entity is `ParameterMetadata<T>`: `{ parameter, value, unit?, sourceType: 'documented'|'modeled'|'representative'|…, sourceId, confidence: 'high'|'medium'|'low', notes, lastVerified }` plus `getSourceBadgeClass()` helper. Example values: Field Name `Baghewala Field`, Operator `Oil India Limited (OIL)`, Basin `Bikaner-Nagaur Basin`, Reservoir `Jodhpur Sandstone Formation`.
2. **Scenario state (Context + localStorage)** — `Scenario { id, name, description, isPreset, inputs: ScenarioInputValues, … }`. Inputs include `reservoirTemperatureC, steamInjectionRateTpd, steamQualityPercent, soakDurationDays, vfdFrequencyHz, spm, strokeLengthMeters, reservoirPressureBar, waterCutPercent, permeabilityDarcy, steamInjectionTemperatureC`. Five presets seeded in code: `BAGHEWALA_BASELINE` ("A. Reference Baseline"), `BAGHEWALA_THERMAL_IMPROVEMENT` ("B. Thermal Improvement"), `BAGHEWALA_COOLING_HIGH_VISCOSITY` ("C. Cooling / High Viscosity"), `BAGHEWALA_HIGH_SRP_LOAD` ("D. High SRP Mechanical Load"), `BAGHEWALA_COMBINED_OPTIMIZATION` ("E. Combined Thermal & High Lift"). localStorage keys: `baghewala_digital_twin_scenarios_v1`, `baghewala_digital_twin_active_scenario_id_v1`, `baghewala_digital_twin_active_scenario_inputs_v1`.
3. **Physics pipeline (pure functions, memoized in provider)** — chain:
   `calculateThermalModel` → `calculateViscosityModel` → `calculateMobilityModel` (λ=k/μ) → `calculateProductionModel` (q = J_o·ΔP·F_pump) → `optimizeSRP` (288-candidate grid) → `optimizeCSS` (cycle economics vs SPE 100642) → `analyzeAIRisk` (rule-based score/level + detected issues). Each returns a typed result object consumed by pages; baseline twins of every result are also computed for deltas.
4. **Derived engines** — validation/calibration/uncertainty (Monte Carlo w/ seeded Mulberry32), scenario comparison + constraints, copilot (rule-based NL), readiness/deployment/pilot/final/field-integration/release engines — all deterministic TS modules in `src/simulation/**`.

### 6.2 Backend API (FastAPI, `http://localhost:8000`, prefix `/api`)

| Method | Path | Purpose | Request | Response |
|---|---|---|---|---|
| GET | `/api/health` | Health check | — | `{ "status": "ok", "service": "baghewala-digital-twin" }` |
| GET | `/api/rag/health` (alias `/api/v1/rag/health`, also mounted at root `/rag/health`) | RAG availability | — | `{ available: true, message: "Hosted Baghewala Historical RAG service is online and active.", service: "baghewala-rag-fastapi" }` |
| POST | `/api/rag/query` (alias `/api/v1/rag/query`, also root `/rag/query`) | Historical evidence retrieval | `{ query?: string, context?: object }` | RAG search result from `search_baghewala_rag` (grounded evidence records) |
| GET | `/api/simulation/wells` | List 30 calibrated wells (well_static.csv) | — | array of well records |
| GET | `/api/simulation/wells/{well_id}` | Single well properties | path param | well record; **404** `Well {id} not found` |
| GET | `/api/simulation/constraints` | 18-rule constraint registry (I01–I04, P01–P10, K01–K04) | — | registry |
| POST | `/api/simulation/predict` | ML inference: nowcast viscosity (w/ & w/o temp), 7-day forecast, alarm probability (F2-calibrated) | `SimulationInput` | PredictionResponse |
| POST | `/api/simulation/check-constraints` | Evaluate 18 constraints for an operating point | `SimulationInput` | ConstraintCheckResponse (margin + compliance per rule) |
| POST | `/api/simulation/simulate` | predict + check-constraints combined | `SimulationInput` | SimulateResponse |
| GET | `/api/simulation/model-info` | Model metadata/performance (feature lists stripped) | — | metadata |

Also auto-provided by FastAPI: `/docs`, `/redoc`, `/openapi.json`. CORS currently `allow_origins=["*"]`.

**Frontend consumers:** `services/api.ts` (health), `services/simulationApi.ts` (wells/simulate for the ML Advisory tab), `services/baghewalaRagService.ts` (RAG health/query; only if `VITE_BAGHEWALA_RAG_URL` set — otherwise a fully offline `baghewalaRagEngine` with hardcoded incidents/gaps is used and the UI shows "Historical evidence unavailable — configure VITE_BAGHEWALA_RAG_URL in .env." states).

### 6.3 Entity relationships (informal)

```
Scenario (1) ──inputs──▶ ThermalResult ──▶ ViscosityResult ──▶ MobilityResult ──▶ ProductionResult
                                   │                                             │
                                   └──────────────▶ CSSOptimizationResult ◀──────┘
ProductionResult + inputs ──▶ SRPOptimizationResult (current + optimal candidates)
(all of the above) ──▶ AIRiskResult (score, level, detectedIssues[])
Scenario[] ──▶ ScenarioComparisonMatrix (snapshots, deltas, constraintResult{status, violations, tradeoffs})
TelemetryRecord[] ──▶ IngestionResult (records + qualityReport) ──▶ DigitalTwinState
DigitalTwinState + config ──▶ OperationalReadiness / FinalValidation / Pilot / Assessment / Release artifacts
```

---

## 7. Auth & User Flows

- **Auth:** none. No signup/login/forgot flows, no tokens, no route guards. Header "Administrator / admin@gmail.com / Logout" is static decoration. API CORS is open (`*`). If a real deployment is intended, this is the single biggest gap.
- **Primary evaluator flow (scripted on Well Dynamics):**
  1. Land on `/well-dynamics` → click `STEP 1: Normal` … `STEP 5: Motor Overload` (or `NEXT STEP`) — each applies an input preset that instantly recomputes physics everywhere.
  2. Open `/simulation` → walk tabs `Digital Twin & Simulation` → `Results & Comparison` → `Decision Report` → `GENERATE FULL REPORT`.
  3. `/scenarios` → tweak sliders → `SAVE SCENARIO` → compare in `Pareto Trade-Off Plot & Matrix` → `RUN SIMULATOR`.
  4. `/reports` → pick report → `Markdown (.md)` / `JSON (.json)` download.
- **Data-ingest flow:** `/field-data` → configure source/policy → paste payload → `Ingest Payload` → review quality audit → click rows to step through twin preview.
- **Governance flow:** `/operational-readiness` (`Run End-to-End Demonstration`) → `/deployment-readiness` (`RUN VALIDATION`, print) → `/field-integration` (mode + `GRANT OPERATOR APPROVAL`/`PAUSE PILOT`) → `/release` (env strategy, checklist, freeze certificate modal).
- **State flow:** every page reads/writes the same `ScenarioProvider`; changing scenario inputs on any page instantly updates header pills, status bar, and all physics-derived panels app-wide.

---

## 8. Insights & Issues

**Repeated content/components (dedup opportunities):**
- The same physics metric tiles (Temp / Viscosity / Mobility / Production / SRP Load / Risk) are re-implemented on at least 8 pages (DigitalTwinPage, RealtimeMonitoring, IntegratedValidation, Copilot, Pilot, CommandCenter, Dashboard cards, FieldData preview).
- "MANDATORY/MANDATED SAFETY DISCLAIMER" amber banners appear on nearly every page — good governance, but copy is duplicated in ~6 constant + inline variants.
- Baseline-vs-scenario comparison tables appear in 4 different forms (Results, Scenarios matrix, Simulation RESULTS tab, ScenarioOptimization orphan).
- Status-badge color switchers (`getStatusBadge`) are copy-pasted with slight variations across ≥7 page files.

**Inconsistencies / issues:**
1. **No 404 page** — unknown URLs silently redirect to `/`. Users get no feedback for typos.
2. **Hardcoded "passing tests" numbers differ by page** — Dashboard says `141/141`, Simulation context implies larger suites, DeploymentReadiness says `304 / 304 PASSING`, FinalValidation says `394 unit tests`, CommandCenter (orphan) says `274 / 274 PASSING`. These are static strings and contradict each other.
3. **ResultsPage Step-5.x summary panels are hardcoded literals** (MAE 2022.9 → 2015.2, `6.90 BOPD`, `98.2%`, `Combined Optimization`, `34.8 BOPD`…) that don't react to scenario changes and duplicate values computed elsewhere — high risk of drift.
4. **Orphan pages:** `CommandCenterPage`, `HistoricalCalibrationPage`, `HistoricalUncertaintyPage`, `ScenarioOptimizationPage` are fully built but unrouted (the sidebar has no path to Steps 5.2/5.3/5.4 standalone workspaces; their content lives only inside Simulation tabs). `HistoricalCalibrationPage`'s mode toggle mutates a *global* registry — dead but side-effectful if ever imported.
5. **Self-link quirk:** on `/results`, the Step 5.3 panel's "View Output Results →" link points back to `/results` itself.
6. **Fake auth surface:** Administrator/Logout in header does nothing; risky in demos (implies session that doesn't exist).
7. **StatusBar "Backend: Ready" is hardcoded**; `checkHealth()` exists but is never surfaced. If backend is down, UI still claims Ready.
8. **RAG duality:** remote RAG service + offline hardcoded engine — good fallback, but two sources of truth for "grounded evidence".
9. **Theme transition debt:** pages built before the current "Black Chrome & Amber" theme still carry `dark:` Tailwind classes and inline `bg-slate-900` patterns; global CSS remaps them, which works but is fragile (attribute-substring selectors with `!important`).
10. **Accessibility/UX:** extremely dense 9–11px mono text throughout; color-only status encoding (green/amber/rose) with no icons in several tables; no keyboard management in the report modals.
11. **README is stale** — describes "Step 1 — Project Foundation ONLY" while the app implements Steps 4.3–6.2.
12. **`/command-center` redirect** means the sidebar's first item (`Well Dynamics`) and the legacy bookmark behave differently than the built CommandCenterPage suggests.

**Strengths worth preserving:** strict "advisory-only / 0 actuation" governance framing everywhere; explicit provenance chips (DOCUMENTED/MODELED/SIMULATED) on nearly every number; deterministic seeded Monte Carlo (reproducible); localStorage-corruption fallback; lazy-loading heavy panels on `/simulation`.
