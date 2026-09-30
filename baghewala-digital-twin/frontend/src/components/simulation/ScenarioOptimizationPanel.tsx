import React, { useState, useMemo } from 'react';
import { Panel } from '../ui/Panel';
import {
  useScenarioStore,
  type ScenarioInputValues,
} from '../../simulation/scenario';
import {
  runScenarioOptimization,
  runPredictionForecast,
  type DecisionObjective,
  type DecisionConstraint,
  type ScenarioOptimizationResult,
  type PredictionResult,
  DEFAULT_DECISION_CONSTRAINTS,
} from '../../simulation/scenarioOptimization';
import {
  Sliders,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileCode,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export const ScenarioOptimizationPanel: React.FC = () => {
  const { activeScenario, updateInput } = useScenarioStore();

  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [objective, setObjective] = useState<DecisionObjective>('BALANCED_OPERATION');
  const [maxSteamRateTpd, setMaxSteamRateTpd] = useState<number>(180);
  const [maxSpm, setMaxSpm] = useState<number>(12);
  const [maxStrokeM, setMaxStrokeM] = useState<number>(3.5);
  const [maxLoadIndex, setMaxLoadIndex] = useState<number>(85);
  const [activeTab, setActiveTab] = useState<'OPTIMIZATION' | 'PARETO' | 'PREDICTION' | 'TRACE'>('OPTIMIZATION');

  // Prediction State
  const [futureSteam, setFutureSteam] = useState<number>(120);
  const [futureTemp, setFutureTemp] = useState<number>(65);
  const [futurePressure, setFuturePressure] = useState<number>(45);
  const [futureWaterCut, setFutureWaterCut] = useState<number>(20);
  const [futureSpm, setFutureSpm] = useState<number>(10);
  const [futureStroke, setFutureStroke] = useState<number>(2.8);

  const constraints: DecisionConstraint = useMemo(
    () => ({
      ...DEFAULT_DECISION_CONSTRAINTS,
      maxSteamRateTpd,
      maxSpm,
      maxStrokeM: maxStrokeM,
      maxLoadIndex,
    }),
    [maxSteamRateTpd, maxSpm, maxStrokeM, maxLoadIndex]
  );

  const optimizationResult: ScenarioOptimizationResult | null = useMemo(() => {
    if (!hasExecuted) {
      return null;
    }
    const t0 = performance.now();
    const result = runScenarioOptimization({ objective, constraints });
    console.log(`[SIM-PERF] Phase 4 Scenario optimization executed in ${(performance.now() - t0).toFixed(2)} ms`);
    return result;
  }, [hasExecuted, objective, constraints]);

  const futureInputs: ScenarioInputValues = useMemo(
    () => ({
      ...activeScenario.inputs,
      steamInjectionRateTpd: futureSteam,
      reservoirTemperatureC: futureTemp,
      reservoirPressureBar: futurePressure,
      waterCutPercent: futureWaterCut,
      spm: futureSpm,
      strokeLengthMeters: futureStroke,
    }),
    [
      activeScenario.inputs,
      futureSteam,
      futureTemp,
      futurePressure,
      futureWaterCut,
      futureSpm,
      futureStroke,
    ]
  );

  const predictionResult: PredictionResult | null = useMemo(() => {
    if (!hasExecuted) {
      return null;
    }
    const t0 = performance.now();
    const result = runPredictionForecast(activeScenario.inputs, futureInputs);
    console.log(`[SIM-PERF] Phase 4 Prediction forecast executed in ${(performance.now() - t0).toFixed(2)} ms`);
    return result;
  }, [hasExecuted, activeScenario.inputs, futureInputs]);

  const handleApplyScenario = (inputs: ScenarioInputValues) => {
    Object.entries(inputs).forEach(([key, val]) => {
      if (typeof val === 'number') {
        updateInput(key as keyof ScenarioInputValues, val);
      }
    });
  };

  if (!hasExecuted || !optimizationResult || !predictionResult) {
    return (
      <Panel className="bg-sky-50/40 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/40" title="Scenario Optimization, Prediction & Decision Support">
        <div className="p-6 bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-800/60 rounded-2xl shadow-sm space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-sky-100 dark:border-sky-800/60 pb-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-500" />
                Scenario Optimization Engine
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Evaluates feasible operational setpoints across Pareto frontiers, trade-off candidates, and engineering constraints.
              </p>
            </div>

            <button
              onClick={() => setHasExecuted(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
            >
              <Target className="w-4 h-4" />
              <span>RUN SCENARIO OPTIMIZATION</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 dark:text-slate-400 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">1. Multi-Objective Trade-Off</span>
              Balance production rate against pump load, thermal efficiency, and rod stress.
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">2. Constraint Boundary Checks</span>
              Enforce maximum steam rate, VFD frequency, stroke limits, and load index ceilings.
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">3. Non-Actuating Decision Support</span>
              Recommends optimal setpoints without direct field equipment actuation.
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="space-y-6 font-sans" title="Scenario Optimization, Prediction & Decision Support">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('OPTIMIZATION')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'OPTIMIZATION'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Scenario Optimization</span>
          </button>

          <button
            onClick={() => setActiveTab('PARETO')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'PARETO'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Pareto Trade-Off</span>
          </button>

          <button
            onClick={() => setActiveTab('PREDICTION')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'PREDICTION'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Prediction & Forecast</span>
          </button>

          <button
            onClick={() => setActiveTab('TRACE')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              activeTab === 'TRACE'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Decision Trace</span>
          </button>
        </div>

        {/* TAB 1: SCENARIO OPTIMIZATION */}
        {activeTab === 'OPTIMIZATION' && (
          <div className="space-y-6">
            {/* Objective Selector & Constraint Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {/* Decision Objective */}
              <div className="space-y-3">
                <label className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
                  <Target className="w-5 h-5 text-sky-500" />
                  <span>DECISION OBJECTIVE</span>
                </label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as DecisionObjective)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 font-bold focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none shadow-sm transition-all"
                >
                  <option value="BALANCED_OPERATION">BALANCED OPERATION (Production vs Risk)</option>
                  <option value="MAXIMIZE_PRODUCTION">MAXIMIZE PRODUCTION (Peak BOPD)</option>
                  <option value="MINIMIZE_STEAM">MINIMIZE STEAM CONSUMPTION (Energy Efficiency)</option>
                  <option value="MINIMIZE_WATER_CUT">MINIMIZE WATER CUT (Fluid Quality)</option>
                  <option value="MINIMIZE_OPERATING_RISK">MINIMIZE OPERATING RISK (Safe Envelope)</option>
                  <option value="MAXIMIZE_EFFICIENCY">MAXIMIZE THERMAL & SRP EFFICIENCY</option>
                  <option value="TARGET_PRODUCTION">TARGET PRODUCTION RATE (~1.5 BOPD)</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evaluates all 14 canonical inputs against Baghewala physics solvers without modifying committed state.
                </p>
              </div>

              {/* Operating Limits & Constraints */}
              <div className="space-y-3">
                <label className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>CONSTRAINT BOUNDARIES (SCENARIO_LIMITS Enforced)</span>
                </label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">Max Steam (TPD):</span>
                    <input
                      type="number"
                      value={maxSteamRateTpd}
                      onChange={(e) => setMaxSteamRateTpd(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm"
                    />
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">Max SPM:</span>
                    <input
                      type="number"
                      value={maxSpm}
                      onChange={(e) => setMaxSpm(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm"
                    />
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">Max Stroke (m):</span>
                    <input
                      type="number"
                      step="0.1"
                      value={maxStrokeM}
                      onChange={(e) => setMaxStrokeM(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm"
                    />
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block mb-1 font-bold">Max Load Index:</span>
                    <input
                      type="number"
                      value={maxLoadIndex}
                      onChange={(e) => setMaxLoadIndex(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Summary */}
            <div className="bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 p-5 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-700 dark:text-sky-300">OPTIMIZATION RECOMMENDATION</span>
                <span className="px-3 py-1 rounded-md bg-white dark:bg-sky-900 text-sky-600 dark:text-sky-300 text-xs font-bold shadow-sm border border-sky-100 dark:border-sky-800">
                  CONFIDENCE: {optimizationResult.recommendation.confidence}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Selected Scenario: {optimizationResult.recommendation.selectedScenarioName}
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {optimizationResult.recommendation.reasons.map((reason, idx) => (
                  <li key={`reason-${idx}`} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Side-by-Side Multi-Scenario Comparison Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">MULTI-SCENARIO SIDE-BY-SIDE EVALUATION TABLE</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md shadow-sm">
                  Evaluated: {optimizationResult.evaluatedCandidatesCount} | Feasible: {optimizationResult.feasibleScenariosCount}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-left text-sm font-sans">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Scenario Name</th>
                      <th className="p-4">Steam (TPD)</th>
                      <th className="p-4">Temp (°C)</th>
                      <th className="p-4">Water Cut</th>
                      <th className="p-4">BOPD</th>
                      <th className="p-4">Viscosity</th>
                      <th className="p-4">Mobility</th>
                      <th className="p-4">Risk Level</th>
                      <th className="p-4">Feasibility</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {optimizationResult.evaluations.map((ev) => {
                      const isRec = ev.candidate.id === optimizationResult.recommendation.selectedScenarioId;
                      return (
                        <tr
                          key={ev.candidate.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                            isRec ? 'bg-sky-50/50 dark:bg-sky-950/20 font-bold' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {isRec && <span className="text-sm text-sky-500">★</span>}
                              <span className={isRec ? 'text-sky-700 dark:text-sky-400' : ''}>{ev.candidate.name}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs">{ev.candidate.inputs.steamInjectionRateTpd}</td>
                          <td className="p-4 font-mono text-xs">{ev.temperatureC.toFixed(1)}</td>
                          <td className="p-4 font-mono text-xs">{ev.candidate.inputs.waterCutPercent}%</td>
                          <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">{ev.estimatedProductionBopd.toFixed(2)}</td>
                          <td className="p-4 font-mono text-xs">{ev.viscosityCp.toFixed(0)}</td>
                          <td className="p-4 font-mono text-xs">{ev.mobilityDcP.toFixed(4)}</td>
                          <td className="p-4 font-mono">
                            <span
                              className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider shadow-sm ${
                                ev.riskLevel === 'LOW'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : ev.riskLevel === 'MODERATE'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}
                            >
                              {ev.riskLevel}
                            </span>
                          </td>
                          <td className="p-4">
                            {ev.isFeasible ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                                <CheckCircle2 className="w-4 h-4" /> FEASIBLE
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 text-xs" title={ev.feasibilityReasons.join(', ')}>
                                <XCircle className="w-4 h-4" /> INVALID
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleApplyScenario(ev.candidate.inputs)}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-xs transition-colors shadow-sm cursor-pointer"
                            >
                              Apply
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Clicking "Apply Scenario" updates ScenarioStore active inputs and sets <code className="text-amber-600 dark:text-amber-400 font-mono px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40">isStale = true</code>. Only clicking <strong className="text-sky-600 dark:text-sky-400">RUN SIMULATION</strong> commits to the 2D Digital Twin.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PARETO TRADE-OFF VIEW */}
        {activeTab === 'PARETO' && (
          <div className="space-y-6 font-sans">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h3 className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                <span>PARETO MULTI-OBJECTIVE TRADE-OFF ANALYSIS</span>
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {optimizationResult.recommendation.tradeOffAnalysisText}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    Production <span className="text-emerald-500">↑</span> vs Steam Consumption <span className="text-amber-500">↑</span>
                  </h4>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {optimizationResult.evaluations.map((ev) => (
                      <div key={`trade-steam-${ev.candidate.id}`} className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span>{ev.candidate.name}</span>
                        <span className="font-bold font-mono">
                          {ev.estimatedProductionBopd.toFixed(2)} BOPD / {ev.candidate.inputs.steamInjectionRateTpd} TPD
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    Production <span className="text-emerald-500">↑</span> vs Operational Risk <span className="text-rose-500">↑</span>
                  </h4>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {optimizationResult.evaluations.map((ev) => (
                      <div key={`trade-risk-${ev.candidate.id}`} className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span>{ev.candidate.name}</span>
                        <span className="font-bold font-mono">
                          {ev.estimatedProductionBopd.toFixed(2)} BOPD / {ev.riskLevel} ({ev.riskScore})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PREDICTION & FORECAST MODE */}
        {activeTab === 'PREDICTION' && (
          <div className="space-y-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-4">
                <h3 className="font-bold text-sky-600 dark:text-sky-400 text-lg">FUTURE OPERATING CONDITIONS</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1">Future Steam Rate (TPD):</label>
                    <input
                      type="number"
                      value={futureSteam}
                      onChange={(e) => setFutureSteam(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1">Future Reservoir Temp (°C):</label>
                    <input
                      type="number"
                      value={futureTemp}
                      onChange={(e) => setFutureTemp(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1">Future Reservoir Pressure (bar):</label>
                    <input
                      type="number"
                      value={futurePressure}
                      onChange={(e) => setFuturePressure(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1">Future Water Cut (%):</label>
                    <input
                      type="number"
                      value={futureWaterCut}
                      onChange={(e) => setFutureWaterCut(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1">Future SPM (strokes/min):</label>
                    <input
                      type="number"
                      value={futureSpm}
                      onChange={(e) => setFutureSpm(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400 block mb-1">Future Stroke Length (m):</label>
                    <input
                      type="number"
                      value={futureStroke}
                      onChange={(e) => setFutureStroke(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 font-bold shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
                <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">PREDICTED SIMULATION FORECAST</h3>
                <div className="space-y-4 text-slate-700 dark:text-slate-200 text-sm">
                  <div className="flex justify-between border-b border-emerald-200/50 dark:border-emerald-800/50 pb-2">
                    <span className="font-medium">Oil Production Rate:</span>
                    <span className="font-bold font-mono">
                      {predictionResult.currentProductionBopd.toFixed(2)} BOPD →{' '}
                      <span className="text-emerald-600 dark:text-emerald-400 text-base">{predictionResult.predictedProductionBopd.toFixed(2)} BOPD</span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/50 dark:border-emerald-800/50 pb-2">
                    <span className="font-medium">Absolute Production Delta:</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400 font-mono">
                      {predictionResult.bopdDelta >= 0 ? `+${predictionResult.bopdDelta}` : predictionResult.bopdDelta} BOPD
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/50 dark:border-emerald-800/50 pb-2">
                    <span className="font-medium">Percentage Production Change:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {predictionResult.bopdPercentChange >= 0 ? `+${predictionResult.bopdPercentChange}` : predictionResult.bopdPercentChange}%
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/50 dark:border-emerald-800/50 pb-2">
                    <span className="font-medium">Modeled Crude Viscosity:</span>
                    <span className="font-mono font-bold">
                      {predictionResult.currentViscosityCp.toFixed(0)} cP →{' '}
                      <span className="text-amber-600 dark:text-amber-400">{predictionResult.predictedViscosityCp.toFixed(0)} cP</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 italic">
                    {predictionResult.uncertaintyNotice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ENGINEERING DECISION TRACE */}
        {activeTab === 'TRACE' && optimizationResult.trace && (
          <div className="space-y-6 font-sans">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2 text-lg">
                  <FileCode className="w-5 h-5 text-sky-500" />
                  <span>ENGINEERING DECISION TRACE</span>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs shadow-sm">
                  {optimizationResult.trace.traceId}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-inner">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Trace Timestamp</span>
                  <span className="font-mono font-bold">{optimizationResult.trace.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Objective</span>
                  <span className="font-bold">{optimizationResult.trace.objective}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Candidate Scenarios</span>
                  <span className="font-bold">{optimizationResult.trace.candidateScenariosCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Feasible Scenarios</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{optimizationResult.trace.feasibleScenariosCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Selected Scenario</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">{optimizationResult.trace.selectedScenarioName}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Baseline Production</span>
                  <span className="font-mono font-bold">{optimizationResult.trace.baselineProductionBopd.toFixed(2)} BOPD</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Selected Production</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{optimizationResult.trace.selectedProductionBopd.toFixed(2)} BOPD</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Production Delta</span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">+{optimizationResult.trace.productionDeltaBopd.toFixed(2)} BOPD (+{optimizationResult.trace.productionPercentChange}%)</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Steam Rate Change</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">+{optimizationResult.trace.steamDeltaTpd} TPD</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-0.5 text-xs uppercase tracking-wider">Historical Validation Error</span>
                  <span className="font-mono font-bold">{optimizationResult.trace.historicalValidationErrorPercent}%</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 italic flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {optimizationResult.trace.disclaimer}
              </p>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};
