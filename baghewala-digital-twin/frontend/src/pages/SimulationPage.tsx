import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Panel } from '../components/ui/Panel';
import { AiEngineeringExplanationPanel } from '../components/simulation/AiEngineeringExplanationPanel';
import { SimulationHistoricalIncidents } from '../components/simulation/SimulationHistoricalIncidents';
import { DigitalTwinViewport } from '../components/digital-twin/DigitalTwinViewport';
import { NormalOperatingConditionPanel } from '../components/simulation/NormalOperatingConditionPanel';
import { MLViscosityControlPanel } from '../components/simulation/MLViscosityControlPanel';
import { SimulationControlsAndComparison } from '../components/simulation/SimulationControlsAndComparison';
import { SimulationResultComparison } from '../components/simulation/SimulationResultComparison';
import { SimulationReportModal } from '../components/simulation/SimulationReportModal';
import {
  useScenarioStore,
  type ScenarioInputValues,
} from '../simulation/scenario';
import {
  Thermometer,
  Layers,
  Sliders,
  Zap,
  Play,
  Save,
  RotateCcw,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  FileText,
} from 'lucide-react';

const ScenarioOptimizationPanel = lazy(() =>
  import('../components/simulation/ScenarioOptimizationPanel').then((m) => ({
    default: m.ScenarioOptimizationPanel,
  }))
);

const HistoricalValidationPanel = lazy(() =>
  import('../components/simulation/HistoricalValidationPanel').then((m) => ({
    default: m.HistoricalValidationPanel,
  }))
);

const UncertaintyAnalysisPanel = lazy(() =>
  import('../components/simulation/UncertaintyAnalysisPanel').then((m) => ({
    default: m.UncertaintyAnalysisPanel,
  }))
);

const EngineeringConfidencePanel = lazy(() =>
  import('../components/simulation/EngineeringConfidencePanel').then((m) => ({
    default: m.EngineeringConfidencePanel,
  }))
);

const ProductionPilotPanel = lazy(() =>
  import('../components/simulation/ProductionPilotPanel').then((m) => ({
    default: m.ProductionPilotPanel,
  }))
);

const AnalysisPanelFallback: React.FC<{ label: string }> = ({ label }) => (
  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-between">
    <span>Loading {label}...</span>
    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
  </div>
);

export const SimulationPage: React.FC = () => {
  useEffect(() => {
    const startTime = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      console.log(`[SIMULATION PERF] SimulationPage mounted & rendered in ${renderTime.toFixed(2)} ms`);
    });
  }, []);

  const {
    activeScenario,
    savedScenarios,
    presets,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpOptimizationResult,
    aiRiskResult,
    updateInput,
    updateDetails,
    saveCurrentScenario,
    loadScenario,
    resetCurrentToBaseline,
    duplicateCurrentScenario,
    deleteScenario,
    loadPreset,
    commitSimulationRun,
  } = useScenarioStore();

  const [simNoticeOpen, setSimNoticeOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [localInputs, setLocalInputs] = useState<ScenarioInputValues>(activeScenario.inputs);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalInputs(activeScenario.inputs);
  }, [activeScenario.inputs]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const inputs = localInputs;
  const validation = activeScenario.validation;

  type WorkstationTab = 'RESULTS' | 'OPTIMIZATION' | 'HISTORICAL' | 'CONFIDENCE' | 'PILOT' | 'AI_COPILOT';
  const [activeWorkstationTab, setActiveWorkstationTab] = useState<WorkstationTab>('RESULTS');

  const handleInputChange = (key: keyof ScenarioInputValues, rawVal: string) => {
    const num = parseFloat(rawVal);
    const val = Number.isNaN(num) ? 0 : num;
    setLocalInputs((prev) => ({ ...prev, [key]: val }));

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updateInput(key, val);
    }, 150);
  };

  const handleSimulateClick = () => {
    if (!validation.isValid) {
      return;
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    (Object.keys(localInputs) as Array<keyof ScenarioInputValues>).forEach((key) => {
      updateInput(key, localInputs[key]);
    });
    commitSimulationRun();
    setSimNoticeOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1 — SIMULATION HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Jodhpur Sandstone • Baghewala, Rajasthan</span>
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              BAGHEWALA DIGITAL TWIN
            </h1>
            <h2 className="text-sm font-mono text-slate-400 mt-0.5">
              Heavy-Oil Well Demonstration Simulation
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800/80 font-bold">
              [ DEMONSTRATION MODE ]
            </span>
            <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-bold">
              [ MODELED RESPONSE ]
            </span>
          </div>
        </div>

        <p className="text-xs font-mono text-slate-300 leading-relaxed max-w-4xl">
          This prototype demonstrates how environmental, thermal, reservoir and artificial-lift conditions can influence a modeled Baghewala heavy-oil well. Real-time telemetry, SCADA streams, and DCS field feeds are intentionally not connected.
        </p>
      </div>

      {/* SECTION 2: 2D CINEMATIC DIGITAL TWIN VIEWPORT */}
      <DigitalTwinViewport />

      {/* SECTION 3: SIMULATION CONTROLS & BOUNDARY PARAMETERS */}
      <SimulationControlsAndComparison />

      {/* WORKSTATION STAGE SELECTION NAVIGATION BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-wrap items-center gap-1.5 font-mono text-xs shadow-lg">
        <button
          onClick={() => setActiveWorkstationTab('RESULTS')}
          className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeWorkstationTab === 'RESULTS'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Results & Comparison</span>
        </button>

        <button
          onClick={() => setActiveWorkstationTab('OPTIMIZATION')}
          className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeWorkstationTab === 'OPTIMIZATION'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Phase 4: Optimization</span>
        </button>

        <button
          onClick={() => setActiveWorkstationTab('HISTORICAL')}
          className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeWorkstationTab === 'HISTORICAL'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Phase 5: Validation & Sensitivity</span>
        </button>

        <button
          onClick={() => setActiveWorkstationTab('CONFIDENCE')}
          className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeWorkstationTab === 'CONFIDENCE'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Phase 5: Engineering Confidence</span>
        </button>

        <button
          onClick={() => setActiveWorkstationTab('PILOT')}
          className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeWorkstationTab === 'PILOT'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Phase 6: Production Pilot</span>
        </button>

        <button
          onClick={() => setActiveWorkstationTab('AI_COPILOT')}
          className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeWorkstationTab === 'AI_COPILOT'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>AI Explanation & RAG</span>
        </button>
      </div>

      {/* ACTIVE WORKSTATION TAB CONTENT */}
      {activeWorkstationTab === 'RESULTS' && (
        <div className="space-y-6">
          <MLViscosityControlPanel />
          <NormalOperatingConditionPanel />
          <SimulationResultComparison />
        </div>
      )}

      {activeWorkstationTab === 'OPTIMIZATION' && (
        <Suspense fallback={<AnalysisPanelFallback label="Phase 4 Optimization Panel" />}>
          <ScenarioOptimizationPanel />
        </Suspense>
      )}

      {activeWorkstationTab === 'HISTORICAL' && (
        <div className="space-y-6">
          <Suspense fallback={<AnalysisPanelFallback label="Phase 5 Historical Validation" />}>
            <HistoricalValidationPanel />
          </Suspense>
          <Suspense fallback={<AnalysisPanelFallback label="Phase 5 Uncertainty Analysis" />}>
            <UncertaintyAnalysisPanel />
          </Suspense>
        </div>
      )}

      {activeWorkstationTab === 'CONFIDENCE' && (
        <Suspense fallback={<AnalysisPanelFallback label="Phase 5 Engineering Confidence" />}>
          <EngineeringConfidencePanel />
        </Suspense>
      )}

      {activeWorkstationTab === 'PILOT' && (
        <Suspense fallback={<AnalysisPanelFallback label="Phase 6 Production Pilot" />}>
          <ProductionPilotPanel />
        </Suspense>
      )}

      {activeWorkstationTab === 'AI_COPILOT' && (
        <div className="space-y-6">
          <AiEngineeringExplanationPanel />
          <SimulationHistoricalIncidents />
        </div>
      )}

      {/* SECTION 7 (PROMPT 8): GENERATE SIMULATION REPORT ACTION */}
      <div className="p-4 bg-sky-950/40 border border-sky-800/80 rounded-lg font-mono text-xs flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-900/60 rounded-lg border border-sky-700">
            <FileText className="w-6 h-6 text-sky-300" />
          </div>
          <div>
            <h3 className="font-bold text-sky-200 text-sm">GENERATE FULL SIMULATION DECISION REPORT</h3>
            <p className="text-[11px] text-slate-400">
              Export 20-section engineering report with full decision trace, causal explanations, RAG evidence, and Markdown/JSON export.
            </p>
          </div>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs shadow-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>GENERATE SIMULATION REPORT</span>
        </button>
      </div>

      {/* PROMPT 8 MODAL */}
      <SimulationReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      {/* 8-Stage Visual Dependency Chain Pipeline */}
      <Panel title="Simulation Dependency Pipeline & Execution Chain">
        <div className="space-y-3 font-mono text-xs">
          <div className="text-[11px] text-slate-400">
            Causal Model Chain: Parameter inputs propagate reactively through thermal heating, viscosity reduction, mobility, inflow, SRP lift, and risk evaluation.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[10px]">
            {/* STAGE 1: INPUTS */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-slate-500 block font-bold">1. INPUTS</span>
              <span className="text-sky-400 font-bold mt-1 block">
                {inputs.reservoirTemperatureC}°C / {inputs.vfdFrequencyHz}Hz
              </span>
              <span className="text-[9px] text-emerald-400 mt-0.5 block font-mono">VALIDATED</span>
            </div>

            {/* STAGE 2: THERMAL */}
            <div className="bg-slate-950 p-2.5 rounded border border-rose-900/60">
              <span className="text-slate-500 block font-bold">2. THERMAL</span>
              <span className="text-rose-400 font-bold mt-1 block">
                {thermalResult.predictedReservoirTemperatureC.toFixed(1)}°C
              </span>
              <span className="text-[9px] text-rose-300 mt-0.5 block font-mono">
                {thermalResult.temperatureChangeC >= 0 ? `+${thermalResult.temperatureChangeC.toFixed(1)}°C` : `${thermalResult.temperatureChangeC.toFixed(1)}°C`}
              </span>
            </div>

            {/* STAGE 3: VISCOSITY */}
            <div className="bg-slate-950 p-2.5 rounded border border-purple-900/60">
              <span className="text-slate-500 block font-bold">3. VISCOSITY</span>
              <span className="text-purple-400 font-bold mt-1 block">
                {viscosityResult.estimatedViscosityCp.toLocaleString()} cP
              </span>
              <span className="text-[9px] text-purple-300 mt-0.5 block font-mono">
                {viscosityResult.viscosityChangePercent}%
              </span>
            </div>

            {/* STAGE 4: MOBILITY */}
            <div className="bg-slate-950 p-2.5 rounded border border-emerald-900/60">
              <span className="text-slate-500 block font-bold">4. MOBILITY</span>
              <span className="text-emerald-400 font-bold mt-1 block">
                {mobilityResult.mobilityDcP.toFixed(4)} D/cP
              </span>
              <span className="text-[9px] text-emerald-300 mt-0.5 block font-mono">
                +{mobilityResult.mobilityChangePercent}%
              </span>
            </div>

            {/* STAGE 5: PRODUCTION */}
            <div className="bg-slate-950 p-2.5 rounded border border-sky-900/60">
              <span className="text-slate-500 block font-bold">5. PRODUCTION</span>
              <span className="text-sky-300 font-bold mt-1 block">
                {productionResult.estimatedProductionBopd.toFixed(2)} BOPD
              </span>
              <span className="text-[9px] text-sky-400 mt-0.5 block font-mono">
                +{productionResult.productionChangePercent}%
              </span>
            </div>

            {/* STAGE 6: SRP/CSS */}
            <div className="bg-slate-950 p-2.5 rounded border border-amber-900/60">
              <span className="text-slate-500 block font-bold">6. SRP / CSS</span>
              <span className="text-amber-400 font-bold mt-1 block">
                Load: {srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)}%
              </span>
              <span className="text-[9px] text-amber-300 mt-0.5 block font-mono">
                Opt: {srpOptimizationResult.optimalCandidate.vfdFrequencyHz}Hz
              </span>
            </div>

            {/* STAGE 7: RISK */}
            <div className="bg-slate-950 p-2.5 rounded border border-rose-800">
              <span className="text-slate-500 block font-bold">7. RISK</span>
              <span className={`font-bold mt-1 block ${
                aiRiskResult.riskLevel === 'HIGH'
                  ? 'text-rose-400'
                  : aiRiskResult.riskLevel === 'MODERATE'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {aiRiskResult.riskLevel}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 block font-mono">
                Score: {aiRiskResult.riskScore}/100
              </span>
            </div>

            {/* STAGE 8: DECISION */}
            <div className="bg-slate-950 p-2.5 rounded border border-emerald-500">
              <span className="text-slate-500 block font-bold">8. DECISION</span>
              <span className="text-emerald-400 font-bold mt-1 block text-[9px] uppercase">
                ADVISORY READY
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 block font-mono">
                0 ACTUATION
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Active Baseline Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Active Baseline Context
          </div>
          <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
            Baghewala Field | Jodhpur Sandstone Reservoir | Well BGW-REP-01
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono text-slate-400">Presets:</span>
          <select
            value={activeScenario.id}
            onChange={(e) => {
              const val = e.target.value;
              const isP = presets.some((p) => p.id === val);
              if (isP) loadPreset(val);
              else loadScenario(val);
            }}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-sky-400 focus:outline-none focus:border-sky-500"
          >
            <optgroup label="Default Test Presets">
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
            {savedScenarios.length > 0 && (
              <optgroup label="Saved Engineer Scenarios">
                {savedScenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Scenario Name & Controls Header */}
      <Panel title="Scenario Management & Controls">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-mono">
          <div className="flex-1 space-y-1">
            <label className="block text-xs text-slate-400">Scenario Name</label>
            <input
              type="text"
              value={activeScenario.name}
              onChange={(e) => updateDetails(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-sky-500"
              placeholder="e.g. High VFD Test"
            />
          </div>

          <div className="flex items-center gap-2 pt-4 md:pt-0">
            <button
              onClick={resetCurrentToBaseline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
              title="Reset to Baghewala Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            <button
              onClick={duplicateCurrentScenario}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
              title="Duplicate Current Scenario"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>DUPLICATE</span>
            </button>

            <button
              onClick={saveCurrentScenario}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold border border-sky-400 transition-colors shadow cursor-pointer"
              title="Save Scenario to Local Store"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE</span>
            </button>

            {!activeScenario.isPreset && activeScenario.id !== 'BAGHEWALA_BASELINE' && (
              <button
                onClick={() => deleteScenario(activeScenario.id)}
                className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/80 transition-colors cursor-pointer"
                title="Delete Scenario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Panel>

      {/* Input Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION A — ENVIRONMENT */}
        <Panel
          title="Section A — Environment Parameters"
          subtitle="Surface ambient boundary conditions"
          action={<Thermometer className="w-4 h-4 text-sky-400" />}
        >
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">Ambient Surface Temperature</label>
                <span className="text-[10px] text-slate-500">[0 - 60 °C]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={inputs.ambientTemperatureC}
                  onChange={(e) => handleInputChange('ambientTemperatureC', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs font-bold w-12 font-mono">°C</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* SECTION B — RESERVOIR */}
        <Panel
          title="Section B — Reservoir Properties"
          subtitle="Jodhpur Sandstone matrix temperature"
          action={<Layers className="w-4 h-4 text-amber-400" />}
        >
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">Reservoir Temperature</label>
                <span className="text-[10px] text-slate-500">[30 - 100 °C]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  value={inputs.reservoirTemperatureC}
                  onChange={(e) => handleInputChange('reservoirTemperatureC', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs font-bold w-12 font-mono">°C</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* SECTION C — STEAM / CSS */}
        <Panel
          title="Section C — Steam / CSS Parameters"
          subtitle="Cyclic Steam Stimulation injection parameters"
          action={<Sliders className="w-4 h-4 text-rose-400" />}
        >
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">Steam Injection Temperature</label>
                <span className="text-[10px] text-slate-500">[100 - 350 °C]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="5"
                  value={inputs.steamInjectionTemperatureC}
                  onChange={(e) => handleInputChange('steamInjectionTemperatureC', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs font-bold w-16 font-mono">°C</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">Steam Injection Rate</label>
                <span className="text-[10px] text-slate-500">[0 - 300 t/day]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="5"
                  value={inputs.steamInjectionRateTpd}
                  onChange={(e) => handleInputChange('steamInjectionRateTpd', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs font-bold w-16 font-mono">t/day</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">Steam Quality</label>
                <span className="text-[10px] text-slate-500">[0 - 100 %]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  value={inputs.steamQualityPercent}
                  onChange={(e) => handleInputChange('steamQualityPercent', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs font-bold w-16 font-mono">%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">Soak Phase Duration</label>
                <span className="text-[10px] text-slate-500">[0 - 30 days]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  value={inputs.soakDurationDays}
                  onChange={(e) => handleInputChange('soakDurationDays', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs font-bold w-16 font-mono">days</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* SECTION D — SRP / VFD */}
        <Panel
          title="Section D — SRP / VFD Lift Controls"
          subtitle="Sucker Rod Pump artificial lift operational parameters"
          action={<Zap className="w-4 h-4 text-emerald-400" />}
        >
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">VFD Operating Frequency</label>
                <span className="text-[10px] text-slate-500">[10 - 70 Hz]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  value={inputs.vfdFrequencyHz}
                  onChange={(e) => handleInputChange('vfdFrequencyHz', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs font-bold w-16 font-mono">Hz</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">Strokes Per Minute (SPM)</label>
                <span className="text-[10px] text-slate-500">[1 - 20 SPM]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={inputs.spm}
                  onChange={(e) => handleInputChange('spm', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs font-bold w-16 font-mono">SPM</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400">Stroke Length</label>
                <span className="text-[10px] text-slate-500">[0.5 - 5.0 m]</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={inputs.strokeLengthMeters}
                  onChange={(e) => handleInputChange('strokeLengthMeters', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-400 text-xs font-bold w-16 font-mono">m</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Validation Feedback Banner */}
      {!validation.isValid ? (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-4 font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>INVALID SCENARIO INPUTS DETECTED</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-rose-200/90 font-sans">
            {validation.errors.map((err, idx) => (
              <li key={idx}>
                <strong className="font-mono text-rose-300">{err.field}:</strong> {err.message}
                <span className="ml-2 text-[10px] font-mono opacity-60">[{err.limitType}]</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-lg p-3.5 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <span>SCENARIO INPUTS VALIDATED & READY FOR SIMULATION</span>
          </div>
          <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/60">
            Validation Passed
          </span>
        </div>
      )}

      {/* Simulation Execution Panel */}
      <Panel title="Scenario Simulation Trigger">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div>
            <div className="text-xs text-slate-400">Simulation Status:</div>
            <div className="text-sm font-bold text-slate-200">
              {validation.isValid ? 'READY FOR SIMULATION' : 'INVALID INPUTS — Action Required'}
            </div>
          </div>

          <button
            onClick={handleSimulateClick}
            disabled={!validation.isValid}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              validation.isValid
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer border border-emerald-400'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>SIMULATE SCENARIO</span>
          </button>
        </div>

        {/* Modal / Notice when Simulate clicked */}
        {simNoticeOpen && (
          <div className="mt-4 p-4 bg-slate-950 border border-emerald-800/80 rounded-lg text-xs font-mono space-y-3 text-slate-200">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                END-TO-END SIMULATION PIPELINE EXECUTED & SYNCED TO SHARED STATE
              </span>
              <button
                onClick={() => setSimNoticeOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">SCENARIO:</span>
                <span className="text-slate-100 font-bold">{activeScenario.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MODELED TEMP:</span>
                <span className="text-rose-400 font-bold">{thermalResult.predictedReservoirTemperatureC.toFixed(1)}°C</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MODELED VISCOSITY:</span>
                <span className="text-purple-400 font-bold">{viscosityResult.estimatedViscosityCp.toLocaleString()} cP</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">EST PRODUCTION:</span>
                <span className="text-emerald-400 font-bold">{productionResult.estimatedProductionBopd.toFixed(2)} BOPD</span>
              </div>
            </div>

            <p className="font-sans text-slate-400 text-[11px]">
              All 7 physics and risk engines executed cleanly. Shared simulation state is updated across 2D Digital Twin, Results Analytics, AI Explanation, and Reports Workstations.
            </p>
          </div>
        )}
      </Panel>

    </div>
  );
};

