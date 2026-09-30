import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import {
  GitBranch,
  Play,
  CheckCircle2,
  Copy,
  RotateCcw,
  BarChart2,
  ShieldCheck,
} from 'lucide-react';
import { useScenarioStore, type Scenario } from '../simulation/scenario';
import { buildScenarioComparisonMatrix, createScenarioSnapshot } from '../simulation/scenarios/scenarioComparisonEngine';
import { DEFAULT_ENGINEERING_CONSTRAINTS, type EngineeringConstraintConfig } from '../simulation/scenarios/engineeringConstraintEngine';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const ScenariosPage: React.FC = () => {
  useDocumentTitle({
    title: "Scenarios & Optimization",
    description:
      "Scenario A-E management with multi-objective decision support and Pareto trade-offs.",
  });
  const {
    presets,
    savedScenarios,
    activeScenario,
    loadPreset,
    loadScenario,
    updateInput,
    resetCurrentToBaseline,
    duplicateCurrentScenario,
    saveCurrentScenario,
  } = useScenarioStore();

  const navigate = useNavigate();

  // Configurable User-Defined Constraints State
  const [constraints, setConstraints] = useState<EngineeringConstraintConfig>(DEFAULT_ENGINEERING_CONSTRAINTS);
  const [activeTab, setActiveTab] = useState<'BUILDER' | 'TRADE_OFF' | 'CONSTRAINTS'>('BUILDER');

  // Combine Presets and Saved User Scenarios
  const allScenarios = useMemo(() => {
    const map = new Map<string, Scenario>();
    presets.forEach((p) => map.set(p.id, p));
    savedScenarios.forEach((s) => map.set(s.id, s));
    if (!map.has(activeScenario.id)) {
      map.set(activeScenario.id, activeScenario);
    }
    return Array.from(map.values());
  }, [presets, savedScenarios, activeScenario]);

  // Build Scenario Comparison Matrix
  const matrix = useMemo(() => {
    return buildScenarioComparisonMatrix(allScenarios, constraints);
  }, [allScenarios, constraints]);

  const activeSnapshot = useMemo(() => {
    return createScenarioSnapshot(activeScenario, presets[0], constraints);
  }, [activeScenario, presets, constraints]);

  const handleSelectScenario = (scenarioId: string) => {
    if (presets.some((p) => p.id === scenarioId)) {
      loadPreset(scenarioId);
    } else {
      loadScenario(scenarioId);
    }
  };

  const handleRunAndNavigate = (scenarioId: string) => {
    handleSelectScenario(scenarioId);
    navigate('/simulation');
  };

  const handleConstraintChange = (key: keyof EngineeringConstraintConfig, val: string) => {
    const num = parseFloat(val);
    setConstraints((prev) => ({
      ...prev,
      [key]: Number.isNaN(num) ? undefined : num
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive What-If Scenario Optimization & Trade-Off Engine"
        subtitle="Independent scenario creation, side-by-side comparative matrices, user-defined constraint evaluation, and trade-off visualization"
        badgeText="Decision Support"
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('BUILDER')}
            className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'BUILDER'
                ? 'bg-sky-900 text-sky-200 border border-sky-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-sky-400" />
            <span>Scenario Builder & Presets ({allScenarios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRADE_OFF')}
            className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'TRADE_OFF'
                ? 'bg-sky-900 text-sky-200 border border-sky-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pareto Trade-Off Plot & Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('CONSTRAINTS')}
            className={`px-3 py-1.5 rounded font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'CONSTRAINTS'
                ? 'bg-sky-900 text-sky-200 border border-sky-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Engineering Constraints Configurator</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetCurrentToBaseline}
            className="px-2.5 py-1 rounded bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700 font-bold transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            RESET TO BASELINE
          </button>
        </div>
      </div>

      {/* VIEW 1: SCENARIO BUILDER & PRESETS */}
      {activeTab === 'BUILDER' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Active Scenario Control Bar */}
          <Panel
            title={`Active Scenario: ${activeScenario.name}`}
            subtitle="Modify parameters below to update live simulation, physics calculations, RAG evidence, and trade-offs"
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={saveCurrentScenario}
                  className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  SAVE SCENARIO
                </button>
                <button
                  onClick={duplicateCurrentScenario}
                  className="px-2.5 py-1 rounded bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-800 font-bold flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  DUPLICATE
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <p className="text-slate-300 font-sans text-xs">{activeScenario.description}</p>

              {/* Slider Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-950 rounded border border-slate-800">
                {/* Temp */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">Reservoir Temp:</span>
                    <span className="text-rose-400">{activeScenario.inputs.reservoirTemperatureC} °C</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="1"
                    value={activeScenario.inputs.reservoirTemperatureC}
                    onChange={(e) => updateInput('reservoirTemperatureC', parseFloat(e.target.value))}
                    className="w-full accent-rose-500 bg-slate-900"
                  />
                  <span className="text-[9px] text-slate-500">Baseline: 48.0 °C</span>
                </div>

                {/* Steam Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">Steam Injection Rate:</span>
                    <span className="text-sky-300">{activeScenario.inputs.steamInjectionRateTpd} TPD</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={activeScenario.inputs.steamInjectionRateTpd}
                    onChange={(e) => updateInput('steamInjectionRateTpd', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-slate-900"
                  />
                  <span className="text-[9px] text-slate-500">Baseline: 50 TPD</span>
                </div>

                {/* SPM */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">Pumping Speed (SPM):</span>
                    <span className="text-emerald-400">{activeScenario.inputs.spm} SPM</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="0.5"
                    value={activeScenario.inputs.spm}
                    onChange={(e) => updateInput('spm', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-900"
                  />
                  <span className="text-[9px] text-slate-500">Baseline: 8.0 SPM</span>
                </div>

                {/* VFD Frequency */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-300">VFD Frequency:</span>
                    <span className="text-amber-400">{activeScenario.inputs.vfdFrequencyHz} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="75"
                    step="1"
                    value={activeScenario.inputs.vfdFrequencyHz}
                    onChange={(e) => updateInput('vfdFrequencyHz', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-900"
                  />
                  <span className="text-[9px] text-slate-500">Baseline: 50.0 Hz</span>
                </div>
              </div>

              {/* Instant Output Summary Bar */}
              <div className="p-3 bg-slate-900/90 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Modeled Temp:</span>
                    <strong className="text-rose-400 text-sm">{activeSnapshot.thermalOutputs.predictedReservoirTemperatureC.toFixed(1)} °C</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Viscosity:</span>
                    <strong className="text-purple-300 text-sm">{activeSnapshot.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Est Production:</span>
                    <strong className="text-emerald-400 text-sm">{activeSnapshot.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">SRP Load Index:</span>
                    <strong className="text-amber-400 text-sm">{activeSnapshot.srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded font-bold uppercase text-[10px] ${
                    activeSnapshot.constraintResult.status === 'FEASIBLE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {activeSnapshot.constraintResult.status}
                  </span>
                  <button
                    onClick={() => handleRunAndNavigate(activeScenario.id)}
                    className="px-3 py-1.5 rounded bg-sky-900 hover:bg-sky-800 text-sky-100 font-bold border border-sky-700 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-sky-400" />
                    RUN SIMULATOR
                  </button>
                </div>
              </div>
            </div>
          </Panel>

          {/* Scenario Catalog Grid */}
          <Panel title="Scenario Library & Presets (Scenarios A through E)">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matrix.snapshots.map((snap) => {
                const isSelected = snap.scenarioId === activeScenario.id;
                const isFeasible = snap.constraintResult.status === 'FEASIBLE';

                return (
                  <div
                    key={snap.scenarioId}
                    className={`p-4 rounded-lg border transition-all space-y-3 ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-600 ring-1 ring-sky-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{snap.scenarioName}</div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block ${
                          isFeasible
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {snap.constraintResult.status} ({snap.constraintResult.violationCount} Violations)
                        </span>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded bg-sky-900 text-sky-200 text-[9px] font-bold border border-sky-700">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="text-slate-300 font-sans text-xs line-clamp-2 leading-relaxed">{snap.description}</p>

                    {/* Metrics Overview */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900 p-2 rounded border border-slate-800">
                      <div>
                        <span className="text-slate-400 block">Modeled Temp:</span>
                        <span className="text-slate-200 font-bold">{snap.thermalOutputs.predictedReservoirTemperatureC.toFixed(1)} °C</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Viscosity:</span>
                        <span className="text-purple-300 font-bold">{snap.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Est. Production:</span>
                        <span className="text-emerald-400 font-bold">{snap.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">SRP Load Index:</span>
                        <span className="text-amber-400 font-bold">{snap.srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100</span>
                      </div>
                    </div>

                    {/* Constraint Violations Callout if present */}
                    {snap.constraintResult.violations.length > 0 && (
                      <div className="p-2 rounded bg-rose-950/30 border border-rose-900/60 text-[10px] text-rose-300 font-mono space-y-0.5">
                        <strong className="text-rose-400">Constraint Violations:</strong>
                        <ul className="list-disc list-inside">
                          {snap.constraintResult.violations.map((v, idx) => (
                            <li key={idx} className="truncate">{v}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleSelectScenario(snap.scenarioId)}
                        className={`px-3 py-1.5 rounded font-bold text-xs transition-colors ${
                          isSelected
                            ? 'bg-sky-900 text-sky-200 border border-sky-700'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isSelected ? 'SELECTED' : 'SELECT SCENARIO'}
                      </button>

                      <button
                        onClick={() => handleRunAndNavigate(snap.scenarioId)}
                        className="px-3 py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-800 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 text-emerald-400" />
                        RUN & VIEW
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}

      {/* VIEW 2: PARETO TRADE-OFF PLOT & COMPARISON MATRIX */}
      {activeTab === 'TRADE_OFF' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Engineering Trade-off Pareto Scatter Matrix Representation */}
          <Panel
            title="Pareto Engineering Trade-Off Matrix (Production BOPD vs SRP Load Index)"
            subtitle="Plots scenario performance: Production Rate (Y-axis) vs Mechanical Load Index (X-axis) with feasibility boundaries"
          >
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 font-sans text-xs leading-relaxed">
                <strong>Engineering Guidance:</strong> Higher production rate generally demands elevated pumping SPM or thermal steam rate, increasing mechanical rod load or casing expansion stress. Feasible scenarios operate within constraint limits without violating user-defined boundaries.
              </div>

              {/* Visual Scatter Grid */}
              <div className="bg-slate-950 p-6 rounded border border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>PRODUCTION (Y-AXIS) ↑</span>
                  <span>SRP MECHANICAL LOAD INDEX (X-AXIS) →</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matrix.snapshots.map((snap) => {
                    const isFeasible = snap.constraintResult.status === 'FEASIBLE';
                    return (
                      <div
                        key={snap.scenarioId}
                        className={`p-3.5 rounded border space-y-2 font-mono ${
                          isFeasible
                            ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-200'
                            : 'bg-rose-950/20 border-rose-800/80 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="truncate">{snap.scenarioName}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                            isFeasible ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {snap.constraintResult.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60">
                          <div>
                            <span className="text-slate-400 text-[10px] block">Production:</span>
                            <strong className="text-emerald-400 text-sm">{snap.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">SRP Load:</span>
                            <strong className="text-amber-400 text-sm">{snap.srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100</strong>
                          </div>
                        </div>

                        {/* Explicit Trade-off Callout */}
                        <div className="text-[10px] font-sans text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-850">
                          {snap.constraintResult.tradeoffs.length > 0
                            ? snap.constraintResult.tradeoffs[0]
                            : `Operates at ${snap.thermalOutputs.predictedReservoirTemperatureC.toFixed(1)}°C and ${snap.inputs.spm} SPM.`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>

          {/* Side-by-Side Comparison Matrix Table */}
          <Panel
            title="Side-by-Side Scenario Comparison Matrix"
            subtitle="Full comparative analytics: Baseline vs Scenario A through E"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                    <th className="p-3">METRIC / PARAMETER</th>
                    {matrix.snapshots.map((snap) => (
                      <th key={snap.scenarioId} className="p-3 min-w-[140px]">
                        <div className="font-bold text-slate-200">{snap.scenarioName}</div>
                        <div className="text-[9px] text-slate-400 font-normal">{snap.scenarioId}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {/* INPUTS ROW SECTION */}
                  <tr className="bg-slate-900/60 font-bold text-sky-400">
                    <td colSpan={matrix.snapshots.length + 1} className="p-2 uppercase text-[10px]">
                      1. SCENARIO INPUT PARAMETERS
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Reservoir Temperature (°C)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-slate-200">{s.inputs.reservoirTemperatureC} °C</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Steam Injection Rate (TPD)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-slate-200">{s.inputs.steamInjectionRateTpd} TPD</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Pumping Speed (SPM)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-slate-200">{s.inputs.spm} SPM</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">VFD Frequency (Hz)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-slate-200">{s.inputs.vfdFrequencyHz} Hz</td>
                    ))}
                  </tr>

                  {/* PHYSICS OUTPUTS ROW SECTION */}
                  <tr className="bg-slate-900/60 font-bold text-purple-400">
                    <td colSpan={matrix.snapshots.length + 1} className="p-2 uppercase text-[10px]">
                      2. CALCULATED PHYSICS OUTPUTS
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Modeled Reservoir Temp (°C)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-rose-300 font-bold">{s.thermalOutputs.predictedReservoirTemperatureC.toFixed(1)} °C</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Estimated Crude Viscosity (cP)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-purple-300 font-bold">{s.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Darcy Mobility (D/cP)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-emerald-400 font-bold">{s.mobilityOutputs.mobilityDcP.toFixed(4)} D/cP</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Estimated Production (BOPD)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-sky-300 font-bold text-sm">{s.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">SRP Mechanical Load Index</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-amber-400 font-bold">{s.srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100</td>
                    ))}
                  </tr>

                  {/* CONSTRAINTS & RISK ROW SECTION */}
                  <tr className="bg-slate-900/60 font-bold text-amber-400">
                    <td colSpan={matrix.snapshots.length + 1} className="p-2 uppercase text-[10px]">
                      3. CONSTRAINTS & SYSTEM RISK
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Constraint Feasibility Status</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${
                          s.constraintResult.status === 'FEASIBLE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {s.constraintResult.status}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Overall AI Risk Level</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 font-bold text-slate-200">
                        {s.riskOutputs.riskLevel} ({s.riskOutputs.riskScore}/100)
                      </td>
                    ))}
                  </tr>

                  {/* DELTA FROM BASELINE SECTION */}
                  <tr className="bg-slate-900/60 font-bold text-emerald-400">
                    <td colSpan={matrix.snapshots.length + 1} className="p-2 uppercase text-[10px]">
                      4. DELTA FROM BASELINE (SCENARIO A)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Production Delta (BOPD)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-emerald-400 font-bold">
                        {s.deltas.productionBopd >= 0 ? `+${s.deltas.productionBopd}` : s.deltas.productionBopd} BOPD ({s.deltas.productionChangePercent}%)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">Viscosity Delta (%)</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-purple-300 font-bold">
                        {s.deltas.viscosityChangePercent}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2.5 text-slate-400">SRP Load Index Delta</td>
                    {matrix.snapshots.map((s) => (
                      <td key={s.scenarioId} className="p-2.5 text-amber-400 font-bold">
                        {s.deltas.loadIndex >= 0 ? `+${s.deltas.loadIndex}` : s.deltas.loadIndex}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* VIEW 3: ENGINEERING CONSTRAINTS CONFIGURATOR */}
      {activeTab === 'CONSTRAINTS' && (
        <div className="space-y-6 font-mono text-xs">
          <Panel
            title="User-Defined Engineering Constraints Configurator"
            subtitle="Configure operational threshold boundaries evaluated across all scenarios"
          >
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-900/60 rounded text-amber-200 font-sans text-xs leading-relaxed">
                <strong>Configurable User Constraints Notice:</strong> Limits configured below represent user-selected operational thresholds. Scenarios exceeding any threshold will be flagged as <code className="text-rose-300 font-mono">CONSTRAINT_VIOLATED</code> with detailed trade-off notes.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-950 rounded border border-slate-800">
                {/* Max Viscosity */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Maximum Viscosity Threshold (cP):</label>
                  <input
                    type="number"
                    value={constraints.maxViscosityCp ?? ''}
                    onChange={(e) => handleConstraintChange('maxViscosityCp', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    placeholder="10000"
                  />
                  <span className="text-[9px] text-slate-500 block">Default: 10,000 cP</span>
                </div>

                {/* Min Production */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Minimum Production Target (BOPD):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={constraints.minProductionBopd ?? ''}
                    onChange={(e) => handleConstraintChange('minProductionBopd', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    placeholder="8.0"
                  />
                  <span className="text-[9px] text-slate-500 block">Default: 8.0 BOPD</span>
                </div>

                {/* Max SPM */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Maximum SPM Speed Limit:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={constraints.maxSpm ?? ''}
                    onChange={(e) => handleConstraintChange('maxSpm', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    placeholder="12.0"
                  />
                  <span className="text-[9px] text-slate-500 block">Default: 12.0 SPM</span>
                </div>

                {/* Max SRP Load Index */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Maximum SRP Mechanical Load Index:</label>
                  <input
                    type="number"
                    value={constraints.maxSrpLoadIndex ?? ''}
                    onChange={(e) => handleConstraintChange('maxSrpLoadIndex', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    placeholder="80.0"
                  />
                  <span className="text-[9px] text-slate-500 block">Default: 80.0 / 100</span>
                </div>

                {/* Max Steam Temp */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Maximum Steam Temp (°C) [TWCCEP]:</label>
                  <input
                    type="number"
                    value={constraints.maxSteamTempC ?? ''}
                    onChange={(e) => handleConstraintChange('maxSteamTempC', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    placeholder="320"
                  />
                  <span className="text-[9px] text-slate-500 block">Default: 320 °C (ISO/PAS 12835 limit)</span>
                </div>

                {/* Max Risk Score */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Maximum Allowable System Risk Score:</label>
                  <input
                    type="number"
                    value={constraints.maxRiskScore ?? ''}
                    onChange={(e) => handleConstraintChange('maxRiskScore', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    placeholder="60"
                  />
                  <span className="text-[9px] text-slate-500 block">Default: 60 / 100</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* Decision-Support Engineering Trade-Off Summary Panel */}
      <Panel
        title="Engineering Decision-Support Summary Panel"
        subtitle="Transparent scenario evaluation: Production, Viscosity, Mechanical Load & Feasibility determinations"
      >
        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matrix.snapshots.map((snap) => {
              const isFeasible = snap.constraintResult.status === 'FEASIBLE';
              return (
                <div
                  key={snap.scenarioId}
                  className={`p-3.5 rounded border space-y-2 ${
                    isFeasible
                      ? 'bg-slate-950 border-emerald-800/80 text-emerald-200'
                      : 'bg-slate-950 border-rose-800/80 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span className="text-slate-100">{snap.scenarioName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      isFeasible ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {snap.constraintResult.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {isFeasible
                      ? `Scenario satisfies all currently selected engineering constraints and yields estimated production of ${snap.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD.`
                      : `Scenario achieves estimated production of ${snap.productionOutputs.estimatedProductionBopd.toFixed(2)} BOPD but violates ${snap.constraintResult.violationCount} user-defined constraints.`}
                  </p>

                  <div className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 space-y-0.5">
                    <div>Viscosity: <strong className="text-purple-300">{snap.viscosityOutputs.estimatedViscosityCp.toLocaleString()} cP</strong></div>
                    <div>SRP Load Index: <strong className="text-amber-400">{snap.srpOutputs.currentCandidate.loadIndex.toFixed(1)} / 100</strong></div>
                    <div>Risk Score: <strong className="text-sky-300">{snap.riskOutputs.riskLevel} ({snap.riskOutputs.riskScore}/100)</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 font-sans italic border-t border-slate-900 pt-2 text-center">
            DECISION SUPPORT ONLY — ENGINEERING REVIEW REQUIRED BEFORE FIELD IMPLEMENTATION
          </div>
        </div>
      </Panel>
    </div>
  );
};
