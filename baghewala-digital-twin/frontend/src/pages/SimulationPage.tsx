import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { AiEngineeringExplanationPanel } from '../components/simulation/AiEngineeringExplanationPanel';
import {
  useScenarioStore,
  compareScenarios,
  BASELINE_INPUT_VALUES,
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
} from 'lucide-react';

export const SimulationPage: React.FC = () => {
  const {
    activeScenario,
    savedScenarios,
    presets,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpOptimizationResult,
    cssOptimizationResult,
    aiRiskResult,
    updateInput,
    updateDetails,
    saveCurrentScenario,
    loadScenario,
    resetCurrentToBaseline,
    duplicateCurrentScenario,
    deleteScenario,
    loadPreset,
  } = useScenarioStore();

  const [simNoticeOpen, setSimNoticeOpen] = useState(false);
  const inputs = activeScenario.inputs;
  const validation = activeScenario.validation;
  const comparisons = compareScenarios(BASELINE_INPUT_VALUES, inputs);

  const handleInputChange = (key: keyof ScenarioInputValues, rawVal: string) => {
    const num = parseFloat(rawVal);
    updateInput(key, Number.isNaN(num) ? (rawVal as any) : num);
  };

  const handleSimulateClick = () => {
    if (!validation.isValid) {
      return;
    }
    setSimNoticeOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="bg-sky-950/60 border border-sky-800/80 rounded-lg p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-sky-200">
        <div className="flex items-center gap-2 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span>DEMO MODE — SIMULATED DEMONSTRATION DATA</span>
        </div>
        <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>REAL FIELD DATA: NOT CONNECTED (Advisory Support Only)</span>
        </div>
      </div>

      <PageHeader
        title="Baghewala Digital Twin — Scenario Simulator"
        subtitle="Operational parameter setup, scenario validation, Thermal, Viscosity, Mobility & Production Model execution"
        badgeText="Step 4.9 AI Risk Advisory Active"
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

      {/* STRUCTURED AI ENGINEERING EXPLANATION & ADVISORY RECOMMENDATION PANEL */}
      <AiEngineeringExplanationPanel />

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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
              title="Reset to Baghewala Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>

            <button
              onClick={duplicateCurrentScenario}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
              title="Duplicate Current Scenario"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>DUPLICATE</span>
            </button>

            <button
              onClick={saveCurrentScenario}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold border border-sky-400 transition-colors shadow"
              title="Save Scenario to Local Store"
            >
              <Save className="w-3.5 h-3.5" />
              <span>SAVE</span>
            </button>

            {!activeScenario.isPreset && activeScenario.id !== 'BAGHEWALA_BASELINE' && (
              <button
                onClick={() => deleteScenario(activeScenario.id)}
                className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/80 transition-colors"
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
                THERMAL MODEL EXECUTION COMPLETE
              </span>
              <button
                onClick={() => setSimNoticeOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">BASELINE TEMP:</span>
                <span className="text-slate-200 font-bold">{thermalResult.baselineReservoirTemperatureC}°C</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MODELED TEMP:</span>
                <span className="text-rose-400 font-bold">{thermalResult.predictedReservoirTemperatureC}°C</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">TEMP CHANGE:</span>
                <span className="text-emerald-400 font-bold">
                  {thermalResult.temperatureChangeC >= 0 ? `+${thermalResult.temperatureChangeC}` : thermalResult.temperatureChangeC}°C
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">THERMAL STATE:</span>
                <span className="text-amber-400 font-bold">{thermalResult.thermalState.replace('_', ' ')}</span>
              </div>
            </div>

            <p className="font-sans text-slate-400 text-[11px]">
              The Thermal Model and Viscosity Model executed for scenario <strong>"{activeScenario.name}"</strong>. Downstream physics models (Darcy mobility, SRP lift, oil production forecast) remain unexecuted until future steps.
            </p>
          </div>
        )}
      </Panel>

      {/* VISCOSITY RESPONSE PANEL */}
      <Panel
        title="Heavy-Oil Viscosity Response (Step 4.4)"
        subtitle="Temperature-dependent crude oil viscosity reduction calculated from Step 4.3 thermal output"
        action={
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-mono text-[11px] font-bold">
            Status: {viscosityResult.modelStatus}
          </span>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Reservoir Temp</span>
            <span className="text-sm font-bold text-rose-400 mt-0.5 block">
              {thermalResult.predictedReservoirTemperatureC} °C
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Estimated Viscosity</span>
            <span className="text-sm font-bold text-sky-400 mt-0.5 block">
              {viscosityResult.estimatedViscosityCp} cP
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Baseline Viscosity</span>
            <span className="text-sm font-bold text-slate-300 mt-0.5 block">
              {viscosityResult.baselineViscosityCp} cP
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Viscosity Change</span>
            <span className={`text-sm font-bold mt-0.5 block ${viscosityResult.viscosityChangeCp <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {viscosityResult.viscosityChangeCp} cP
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Viscosity Change %</span>
            <span className={`text-sm font-bold mt-0.5 block ${viscosityResult.viscosityChangePercent <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {viscosityResult.viscosityChangePercent >= 0 ? `+${viscosityResult.viscosityChangePercent}` : viscosityResult.viscosityChangePercent} %
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Model Confidence</span>
            <span className="text-sm font-bold text-purple-400 mt-0.5 block">
              {viscosityResult.confidence}
            </span>
          </div>
        </div>

        {viscosityResult.warnings.length > 0 && (
          <div className="mt-3 p-2.5 bg-amber-950/30 border border-amber-800/50 rounded font-mono text-[11px] text-amber-200">
            <strong>Warning:</strong> {viscosityResult.warnings.join(' | ')}
          </div>
        )}
      </Panel>

      {/* HEAVY-OIL MOBILITY RESPONSE PANEL (STEP 4.5) */}
      <Panel
        title="Heavy-Oil Mobility Response (Step 4.5)"
        subtitle="Fluid flow mobility (λ_o = k_eff / μ_o) in D/cP calculated for Jodhpur Sandstone porous matrix"
        action={
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-[11px] font-bold">
            Status: {mobilityResult.status}
          </span>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Reservoir Temp</span>
            <span className="text-sm font-bold text-rose-400 mt-0.5 block">
              {mobilityResult.temperatureC} °C
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Oil Viscosity</span>
            <span className="text-sm font-bold text-purple-400 mt-0.5 block">
              {mobilityResult.viscosityCp} cP
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Permeability (k)</span>
            <span className="text-sm font-bold text-amber-300 mt-0.5 block">
              {mobilityResult.permeabilityD} D
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Relative Perm (k_ro)</span>
            <span className="text-sm font-bold text-slate-300 mt-0.5 block">
              {mobilityResult.relativePermeability} (Conceptual)
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Effective Perm (k_eff)</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">
              {mobilityResult.effectivePermeabilityD} D
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block uppercase">Oil Mobility (λ_o)</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
              {mobilityResult.mobilityDcP} {mobilityResult.mobilityUnit}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Baseline Mobility</span>
            <span className="text-sm font-bold text-slate-300 mt-0.5 block">
              {mobilityResult.baselineMobilityDcP} {mobilityResult.mobilityUnit}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Mobility Change</span>
            <span className={`text-sm font-bold mt-0.5 block ${mobilityResult.mobilityDeltaDcP >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {mobilityResult.mobilityDeltaDcP >= 0 ? `+${mobilityResult.mobilityDeltaDcP}` : mobilityResult.mobilityDeltaDcP} D/cP
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block uppercase">Mobility Shift %</span>
            <span className={`text-sm font-bold mt-0.5 block ${mobilityResult.mobilityChangePercent >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {mobilityResult.mobilityChangePercent >= 0 ? `+${mobilityResult.mobilityChangePercent}` : mobilityResult.mobilityChangePercent} %
            </span>
          </div>
        </div>

        {mobilityResult.warnings.length > 0 && (
          <div className="mt-3 p-2.5 bg-amber-950/30 border border-amber-800/50 rounded font-mono text-[11px] text-amber-200">
            <strong>Warning:</strong> {mobilityResult.warnings.join(' | ')}
          </div>
        )}
      </Panel>

      {/* ESTIMATED OIL PRODUCTION PANEL (STEP 4.6) */}
      <Panel
        title="Estimated Oil Production Response (Step 4.6)"
        subtitle="Deterministic heavy-oil production screening estimate (q_bopd = J_o * ΔP * F_pump)"
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-sky-300 font-mono text-[11px] font-bold uppercase">
            MODELED / ESTIMATED
          </span>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Reservoir Temp</span>
            <span className="text-sm font-bold text-rose-400 mt-0.5 block">
              {productionResult.temperatureC} °C
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Oil Viscosity</span>
            <span className="text-sm font-bold text-purple-400 mt-0.5 block">
              {productionResult.viscosityCp} cP
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Oil Mobility (λ_o)</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
              {productionResult.oilMobilityDcp} D/cP
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Effective Drawdown (ΔP)</span>
            <span className="text-sm font-bold text-amber-300 mt-0.5 block">
              {productionResult.effectiveDrawdownBar} bar
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Productivity Index (J_o)</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5 block">
              {productionResult.productivityIndexBopdBar} BOPD/bar
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Pump Operation Factor</span>
            <span className="text-sm font-bold text-sky-400 mt-0.5 block">
              {productionResult.pumpOperationFactor} x
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block uppercase">Estimated Oil Production</span>
            <span className="text-base font-bold text-sky-300 mt-0.5 block">
              {productionResult.estimatedProductionBopd} {productionResult.productionUnit}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Baseline Production</span>
            <span className="text-sm font-bold text-slate-300 mt-0.5 block">
              {productionResult.baselineProductionBopd} {productionResult.productionUnit}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Production Change</span>
            <span className={`text-sm font-bold mt-0.5 block ${productionResult.productionChangeBopd >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {productionResult.productionChangeBopd >= 0 ? `+${productionResult.productionChangeBopd}` : productionResult.productionChangeBopd} BOPD
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Production Shift %</span>
            <span className={`text-sm font-bold mt-0.5 block ${productionResult.productionChangePercent >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {productionResult.productionChangePercent >= 0 ? `+${productionResult.productionChangePercent}` : productionResult.productionChangePercent} %
            </span>
          </div>
        </div>

        <div className="mt-3 p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-400 italic">
          <strong>Disclaimer:</strong> This is an engineering screening estimate, not a measured live production value or calibrated numerical reservoir simulation.
        </div>
      </Panel>

      {/* SRP + VFD PRODUCTION OPTIMIZATION PANEL (STEP 4.7) */}
      <Panel
        title="SRP + VFD Production Optimization (Step 4.7)"
        subtitle="Modeled operating window and candidate selection balancing production rate against operating load severity"
        action={
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold uppercase border ${
            srpOptimizationResult.status === 'NORMAL'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : srpOptimizationResult.status === 'CAUTION'
              ? 'bg-amber-950/80 border-amber-800 text-amber-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            Operating Status: {srpOptimizationResult.status}
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Current Operating Point */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded space-y-2">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400 uppercase font-bold text-[11px]">Current Scenario Point</span>
              <span className="text-slate-400 font-mono text-[10px]">
                {srpOptimizationResult.currentCandidate.vfdFrequencyHz} Hz | {srpOptimizationResult.currentCandidate.spm} SPM | {srpOptimizationResult.currentCandidate.strokeLengthM} m
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">PUMP CAPACITY FACTOR</span>
                <span className="text-slate-200 font-bold">{srpOptimizationResult.currentCandidate.pumpCapacityFactor} x</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">OPERATING LOAD INDEX</span>
                <span className={`font-bold ${srpOptimizationResult.currentCandidate.loadIndex > 85 ? 'text-rose-400' : srpOptimizationResult.currentCandidate.loadIndex > 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {srpOptimizationResult.currentCandidate.loadIndex} / 100
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">EFFICIENCY INDEX</span>
                <span className="text-sky-400 font-bold">{srpOptimizationResult.currentCandidate.efficiencyIndex}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ESTIMATED PRODUCTION</span>
                <span className="text-slate-100 font-bold">{srpOptimizationResult.currentCandidate.estimatedProductionBopd} BOPD</span>
              </div>
            </div>
          </div>

          {/* Modeled Optimum Point */}
          <div className="bg-slate-950/80 border border-sky-900/60 p-4 rounded space-y-2">
            <div className="flex justify-between items-center border-b border-sky-900/40 pb-2">
              <span className="text-sky-400 uppercase font-bold text-[11px]">Modeled Optimum Point</span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">
                {srpOptimizationResult.optimalCandidate.vfdFrequencyHz} Hz | {srpOptimizationResult.optimalCandidate.spm} SPM | {srpOptimizationResult.optimalCandidate.strokeLengthM} m
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">MODELED OPTIMAL PUMP FACTOR</span>
                <span className="text-slate-200 font-bold">{srpOptimizationResult.optimalCandidate.pumpCapacityFactor} x</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">OPTIMAL LOAD INDEX</span>
                <span className="text-emerald-400 font-bold">{srpOptimizationResult.optimalCandidate.loadIndex} / 100</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">OPTIMAL EFFICIENCY INDEX</span>
                <span className="text-sky-300 font-bold">{srpOptimizationResult.optimalCandidate.efficiencyIndex}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">OPTIMIZED PRODUCTION</span>
                <span className="text-emerald-400 font-bold">{srpOptimizationResult.optimalCandidate.estimatedProductionBopd} BOPD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delta Summary Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Production Delta</span>
            <span className={`text-sm font-bold mt-0.5 block ${srpOptimizationResult.productionDeltaBopd >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {srpOptimizationResult.productionDeltaBopd >= 0 ? `+${srpOptimizationResult.productionDeltaBopd}` : srpOptimizationResult.productionDeltaBopd} BOPD
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Production Shift %</span>
            <span className={`text-sm font-bold mt-0.5 block ${srpOptimizationResult.productionDeltaPercent >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {srpOptimizationResult.productionDeltaPercent >= 0 ? `+${srpOptimizationResult.productionDeltaPercent}` : srpOptimizationResult.productionDeltaPercent} %
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Load Index Delta</span>
            <span className={`text-sm font-bold mt-0.5 block ${srpOptimizationResult.loadDeltaIndex <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {srpOptimizationResult.loadDeltaIndex >= 0 ? `+${srpOptimizationResult.loadDeltaIndex}` : srpOptimizationResult.loadDeltaIndex}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded">
            <span className="text-[10px] text-slate-400 block uppercase">Efficiency Shift</span>
            <span className={`text-sm font-bold mt-0.5 block ${srpOptimizationResult.efficiencyDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {srpOptimizationResult.efficiencyDelta >= 0 ? `+${srpOptimizationResult.efficiencyDelta}` : srpOptimizationResult.efficiencyDelta}
            </span>
          </div>
        </div>

        {srpOptimizationResult.warnings.length > 0 && (
          <div className="mt-3 p-2.5 bg-amber-950/30 border border-amber-800/50 rounded font-mono text-[11px] text-amber-200">
            <strong>Warning:</strong> {srpOptimizationResult.warnings.join(' | ')}
          </div>
        )}

        <div className="mt-3 p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-400 italic">
          <strong>Mandatory Safety Disclaimer:</strong> Modeled operating window and optimum setpoints are derived from normalized engineering load-efficiency models. Not real-time SCADA commands or dynamometer readings. Physical rod fatigue analysis required prior to setpoint changes.
        </div>
      </Panel>

      {/* CSS OPTIMIZATION PANEL (STEP 4.8) */}
      <Panel
        title="Cyclic Steam Stimulation (CSS) Optimization (Step 4.8)"
        subtitle="3-phase thermal soak cycle evaluation: Injection → Soak → Production"
        action={
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold uppercase border ${
            cssOptimizationResult.status === 'NORMAL'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : cssOptimizationResult.status === 'CAUTION'
              ? 'bg-amber-950/80 border-amber-800 text-amber-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            CSS Status: {cssOptimizationResult.status}
          </span>
        }
      >
        {/* Phase Indicators */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs mb-4">
          <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded text-center">
            <span className="text-[10px] text-rose-300 uppercase block font-bold">PHASE 1 — INJECTION</span>
            <span className="text-xs text-slate-200 mt-1 block">
              {cssOptimizationResult.currentCandidate.steamInjectionRateTpd} TPD @ {activeScenario.inputs.steamQualityPercent}% Quality
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Duration: {cssOptimizationResult.currentCandidate.injectionDurationDays} days</span>
          </div>

          <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded text-center">
            <span className="text-[10px] text-amber-300 uppercase block font-bold">PHASE 2 — SOAK</span>
            <span className="text-xs text-slate-200 mt-1 block">
              Thermal Retention: {(cssOptimizationResult.thermalBreakdown.heatRetention * 100).toFixed(0)}%
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Duration: {cssOptimizationResult.currentCandidate.soakDurationDays} days</span>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded text-center">
            <span className="text-[10px] text-emerald-300 uppercase block font-bold">PHASE 3 — PRODUCTION</span>
            <span className="text-xs text-emerald-400 font-bold mt-1 block">
              {cssOptimizationResult.currentCandidate.cssProductionBopd} BOPD (+{cssOptimizationResult.currentCandidate.productionIncreasePercent}%)
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Duration: {cssOptimizationResult.currentCandidate.productionDurationDays} days</span>
          </div>
        </div>

        {/* Current vs Optimized CSS Cycle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Current CSS Cycle */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400 uppercase font-bold text-[11px]">Current CSS Cycle</span>
              <span className="text-slate-400 font-mono text-[10px]">
                {cssOptimizationResult.currentCandidate.steamVolumeTons} Tons Steam Injected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">CSS RESERVOIR TEMP</span>
                <span className="text-rose-400 font-bold">{cssOptimizationResult.currentCandidate.predictedCssTemperatureC} °C</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">CSS VISCOSITY</span>
                <span className="text-purple-400 font-bold">{cssOptimizationResult.currentCandidate.cssViscosityCp} cP</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">CSS MOBILITY</span>
                <span className="text-emerald-400 font-bold">{cssOptimizationResult.currentCandidate.cssMobilityDPerCp} D/cP</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ESTIMATED PRODUCTION</span>
                <span className="text-sky-300 font-bold">{cssOptimizationResult.currentCandidate.cssProductionBopd} BOPD</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">TOTAL CYCLE DURATION</span>
                <span className="text-slate-200 font-bold">{cssOptimizationResult.currentCandidate.cycleDurationDays} Days</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">EFFICIENCY SCORE</span>
                <span className="text-sky-400 font-bold">{cssOptimizationResult.currentCandidate.efficiencyScore}</span>
              </div>
            </div>
          </div>

          {/* Optimized CSS Cycle */}
          <div className="bg-slate-950/80 border border-sky-900/60 p-4 rounded space-y-3">
            <div className="flex justify-between items-center border-b border-sky-900/40 pb-2">
              <span className="text-sky-400 uppercase font-bold text-[11px]">Modeled Optimal CSS Cycle</span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">
                {cssOptimizationResult.optimalCandidate.steamVolumeTons} Tons Steam Injected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">OPTIMAL STEAM RATE</span>
                <span className="text-slate-200 font-bold">{cssOptimizationResult.optimalCandidate.steamInjectionRateTpd} TPD @ {(cssOptimizationResult.optimalCandidate.steamQualityFraction * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">OPTIMAL INJ / SOAK</span>
                <span className="text-slate-200 font-bold">{cssOptimizationResult.optimalCandidate.injectionDurationDays}d Inj | {cssOptimizationResult.optimalCandidate.soakDurationDays}d Soak</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">OPTIMAL PREDICTED TEMP</span>
                <span className="text-rose-400 font-bold">{cssOptimizationResult.optimalCandidate.predictedCssTemperatureC} °C</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">OPTIMIZED PRODUCTION</span>
                <span className="text-emerald-400 font-bold">{cssOptimizationResult.optimalCandidate.cssProductionBopd} BOPD</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">CYCLE TURN-AROUND</span>
                <span className="text-slate-200 font-bold">{cssOptimizationResult.optimalCandidate.cycleDurationDays} Days</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">OPTIMAL EFFICIENCY</span>
                <span className="text-emerald-400 font-bold">{cssOptimizationResult.optimalCandidate.efficiencyScore}</span>
              </div>
            </div>
          </div>
        </div>

        {cssOptimizationResult.warnings.length > 0 && (
          <div className="mt-3 p-2.5 bg-amber-950/30 border border-amber-800/50 rounded font-mono text-[11px] text-amber-200">
            <strong>Warning:</strong> {cssOptimizationResult.warnings.join(' | ')}
          </div>
        )}

        <div className="mt-3 p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-400 italic">
          <strong>Screening Disclaimer:</strong> Engineering screening model — not a field-calibrated reservoir simulator. All modeled CSS production and thermal outputs represent screening estimates based on Baghewala Jodhpur Sandstone parameters.
        </div>
      </Panel>

      {/* AI RISK ADVISORY PANEL (STEP 4.9) */}
      <Panel
        title="AI Risk & Advisory Engine (Step 4.9)"
        subtitle="Automated issue detection, risk scoring, evidence synthesis, and recommended engineering actions"
        action={
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-bold uppercase border ${
            aiRiskResult.riskLevel === 'LOW'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : aiRiskResult.riskLevel === 'MODERATE'
              ? 'bg-amber-950/80 border-amber-800 text-amber-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            RISK LEVEL: {aiRiskResult.riskLevel}
          </span>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          {/* Summary Banner */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">DIGITAL TWIN AI ADVISORY SUMMARY</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{aiRiskResult.summary}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Confidence:</span>
              <span className="px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 rounded text-[11px] font-bold">
                {aiRiskResult.confidence}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detected Issues */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded space-y-3">
              <div className="text-slate-200 font-bold uppercase border-b border-slate-800 pb-2 text-[11px]">
                Detected Operational Issues ({aiRiskResult.detectedIssues.length})
              </div>
              {aiRiskResult.detectedIssues.length === 0 ? (
                <div className="text-emerald-400 text-xs py-2">✓ No operational risk issues detected. Parameters operating within safe thresholds.</div>
              ) : (
                <div className="space-y-2">
                  {aiRiskResult.detectedIssues.map((issue) => (
                    <div key={issue.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200">{issue.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          issue.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          issue.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{issue.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evidence Synthesis */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded space-y-3">
              <div className="text-slate-200 font-bold uppercase border-b border-slate-800 pb-2 text-[11px]">
                Evidence Breakdown
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">RESERVOIR TEMP</span>
                  <span className="text-rose-400 font-bold">{aiRiskResult.evidence.temperatureC} °C</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">HEAVY-OIL VISCOSITY</span>
                  <span className="text-purple-400 font-bold">{aiRiskResult.evidence.viscosityCp.toLocaleString()} cP</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">OIL MOBILITY</span>
                  <span className="text-emerald-400 font-bold">{aiRiskResult.evidence.mobilityDPerCp} D/cP</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ESTIMATED PRODUCTION</span>
                  <span className="text-sky-300 font-bold">{aiRiskResult.evidence.productionBopd} BOPD</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">VFD FREQUENCY / SPM</span>
                  <span className="text-slate-200 font-bold">{aiRiskResult.evidence.vfdFrequencyHz} Hz / {aiRiskResult.evidence.spm} SPM</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">STEAM INJECTION</span>
                  <span className="text-amber-400 font-bold">{aiRiskResult.evidence.steamInjectionRateTpd} TPD (+{aiRiskResult.evidence.cssThermalGainC}°C)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-slate-950/80 border border-sky-900/60 p-4 rounded space-y-3">
            <div className="text-sky-300 font-bold uppercase border-b border-sky-900/40 pb-2 text-[11px]">
              Recommended Action Plan
            </div>
            <div className="space-y-2">
              {aiRiskResult.recommendedActions.map((action) => (
                <div key={action.id} className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-sky-400">{action.title}</span>
                    <span className="text-[9px] px-2 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 rounded font-bold uppercase">
                      Target: {action.targetModule} | Priority: {action.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-200">{action.actionText}</div>
                  <div className="text-[10px] text-emerald-400 font-bold">Expected Impact: {action.expectedImpact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* INPUT COMPARISON TABLE */}
      <Panel
        title="Input Parameter Comparison vs Baseline"
        subtitle="Side-by-side delta changes between Baghewala Baseline and Current Scenario"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Parameter</th>
                <th className="pb-2.5 font-bold">Baghewala Baseline</th>
                <th className="pb-2.5 font-bold">Current Scenario</th>
                <th className="pb-2.5 font-bold text-right">Δ Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisons.map((c) => (
                <tr key={c.parameter} className={c.hasChanged ? 'bg-sky-950/20' : ''}>
                  <td className="py-2.5 text-slate-300 font-medium">
                    {c.label}
                    {c.hasChanged && (
                      <span className="ml-2 text-[9px] px-1.5 py-0.2 bg-purple-950 text-purple-400 border border-purple-800 rounded">
                        MODIFIED
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {c.baselineValue} {c.unit}
                  </td>
                  <td className="py-2.5 text-slate-100 font-bold">
                    {c.scenarioValue} {c.unit}
                  </td>
                  <td className="py-2.5 text-right font-bold">
                    {c.hasChanged ? (
                      <span className={c.delta > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                        {c.delta > 0 ? `+${c.delta}` : c.delta} {c.unit}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
