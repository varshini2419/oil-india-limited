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
      <Panel title="Phase 4 — Scenario Optimization, Prediction & Decision Support">
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                Scenario Optimization Engine (On-Demand Analysis)
              </h3>
              <p className="text-slate-400 text-[11px]">
                Evaluates feasible operational setpoints across Pareto frontiers, trade-off candidates, and engineering constraints.
              </p>
            </div>

            <button
              onClick={() => setHasExecuted(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg cursor-pointer flex-shrink-0"
            >
              <Target className="w-4 h-4" />
              <span>RUN SCENARIO OPTIMIZATION</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400 text-[11px]">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">1. Multi-Objective Trade-Off</span>
              Balance production rate against pump load, thermal efficiency, and rod stress.
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">2. Constraint Boundary Checks</span>
              Enforce maximum steam rate, VFD frequency, stroke limits, and load index ceilings.
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="font-bold text-slate-200 block mb-1">3. Non-Actuating Decision Support</span>
              Recommends optimal setpoints without direct field equipment actuation.
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Phase 4 — Scenario Optimization, Prediction & Decision Support">
      <div className="space-y-6 font-mono text-xs">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('OPTIMIZATION')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'OPTIMIZATION'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Scenario Optimization</span>
          </button>

          <button
            onClick={() => setActiveTab('PARETO')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'PARETO'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pareto Trade-Off</span>
          </button>

          <button
            onClick={() => setActiveTab('PREDICTION')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'PREDICTION'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Prediction & Forecast</span>
          </button>

          <button
            onClick={() => setActiveTab('TRACE')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'TRACE'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Decision Trace</span>
          </button>
        </div>

        {/* TAB 1: SCENARIO OPTIMIZATION */}
        {activeTab === 'OPTIMIZATION' && (
          <div className="space-y-6">
            {/* Objective Selector & Constraint Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {/* Decision Objective */}
              <div className="space-y-2">
                <label className="font-bold text-sky-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-sky-400" />
                  <span>DECISION OBJECTIVE</span>
                </label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as DecisionObjective)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-bold focus:border-sky-500 outline-none"
                >
                  <option value="BALANCED_OPERATION">BALANCED OPERATION (Production vs Risk)</option>
                  <option value="MAXIMIZE_PRODUCTION">MAXIMIZE PRODUCTION (Peak BOPD)</option>
                  <option value="MINIMIZE_STEAM">MINIMIZE STEAM CONSUMPTION (Energy Efficiency)</option>
                  <option value="MINIMIZE_WATER_CUT">MINIMIZE WATER CUT (Fluid Quality)</option>
                  <option value="MINIMIZE_OPERATING_RISK">MINIMIZE OPERATING RISK (Safe Envelope)</option>
                  <option value="MAXIMIZE_EFFICIENCY">MAXIMIZE THERMAL & SRP EFFICIENCY</option>
                  <option value="TARGET_PRODUCTION">TARGET PRODUCTION RATE (~1.5 BOPD)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Evaluates all 14 canonical inputs against Baghewala physics solvers without modifying committed state.
                </p>
              </div>

              {/* Operating Limits & Constraints */}
              <div className="space-y-2">
                <label className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>CONSTRAINT BOUNDARIES (SCENARIO_LIMITS Enforced)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Max Steam (TPD):</span>
                    <input
                      type="number"
                      value={maxSteamRateTpd}
                      onChange={(e) => setMaxSteamRateTpd(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400">Max SPM:</span>
                    <input
                      type="number"
                      value={maxSpm}
                      onChange={(e) => setMaxSpm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400">Max Stroke (m):</span>
                    <input
                      type="number"
                      step="0.1"
                      value={maxStrokeM}
                      onChange={(e) => setMaxStrokeM(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400">Max Load Index:</span>
                    <input
                      type="number"
                      value={maxLoadIndex}
                      onChange={(e) => setMaxLoadIndex(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Summary */}
            <div className="bg-sky-950/40 border border-sky-800/80 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-200">OPTIMIZATION RECOMMENDATION</span>
                <span className="px-2 py-0.5 rounded bg-sky-900 text-sky-300 text-[10px] font-bold">
                  CONFIDENCE: {optimizationResult.recommendation.confidence}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                Selected Scenario: {optimizationResult.recommendation.selectedScenarioName}
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {optimizationResult.recommendation.reasons.map((reason, idx) => (
                  <li key={`reason-${idx}`} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Side-by-Side Multi-Scenario Comparison Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200">MULTI-SCENARIO SIDE-BY-SIDE EVALUATION TABLE</h3>
                <span className="text-[11px] text-slate-400">
                  Evaluated: {optimizationResult.evaluatedCandidatesCount} | Feasible: {optimizationResult.feasibleScenariosCount}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Scenario Name</th>
                      <th className="p-2.5">Steam (TPD)</th>
                      <th className="p-2.5">Temp (°C)</th>
                      <th className="p-2.5">Water Cut</th>
                      <th className="p-2.5">BOPD</th>
                      <th className="p-2.5">Viscosity</th>
                      <th className="p-2.5">Mobility</th>
                      <th className="p-2.5">Risk Level</th>
                      <th className="p-2.5">Feasibility</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {optimizationResult.evaluations.map((ev) => {
                      const isRec = ev.candidate.id === optimizationResult.recommendation.selectedScenarioId;
                      return (
                        <tr
                          key={ev.candidate.id}
                          className={`hover:bg-slate-900/60 ${
                            isRec ? 'bg-sky-950/50 border-l-4 border-sky-400 font-bold' : ''
                          }`}
                        >
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5">
                              {isRec && <span className="text-xs text-sky-400">★</span>}
                              <span>{ev.candidate.name}</span>
                            </div>
                          </td>
                          <td className="p-2.5">{ev.candidate.inputs.steamInjectionRateTpd} TPD</td>
                          <td className="p-2.5">{ev.temperatureC.toFixed(1)} °C</td>
                          <td className="p-2.5">{ev.candidate.inputs.waterCutPercent} %</td>
                          <td className="p-2.5 text-emerald-400 font-bold">{ev.estimatedProductionBopd.toFixed(2)} BOPD</td>
                          <td className="p-2.5">{ev.viscosityCp.toFixed(0)} cP</td>
                          <td className="p-2.5">{ev.mobilityDcP.toFixed(4)} D/cP</td>
                          <td className="p-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                ev.riskLevel === 'LOW'
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : ev.riskLevel === 'MODERATE'
                                  ? 'bg-amber-950 text-amber-300'
                                  : 'bg-red-950 text-red-300'
                              }`}
                            >
                              {ev.riskLevel}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {ev.isFeasible ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> FEASIBLE
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold flex items-center gap-1" title={ev.feasibilityReasons.join(', ')}>
                                <XCircle className="w-3 h-3" /> INVALID
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleApplyScenario(ev.candidate.inputs)}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-[10px] transition-colors"
                            >
                              Apply Scenario
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400">
                Clicking "Apply Scenario" updates ScenarioStore active inputs and sets <code className="text-amber-300">isStale = true</code>. Only clicking <code className="text-sky-300">RUN SIMULATION</code> commits to the 2D Digital Twin.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PARETO TRADE-OFF VIEW */}
        {activeTab === 'PARETO' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-sky-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>PARETO MULTI-OBJECTIVE TRADE-OFF ANALYSIS</span>
              </h3>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {optimizationResult.recommendation.tradeOffAnalysisText}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200">Production ↑ vs Steam Consumption ↑</h4>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    {optimizationResult.evaluations.map((ev) => (
                      <div key={`trade-steam-${ev.candidate.id}`} className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span>{ev.candidate.name}</span>
                        <span className="font-bold">
                          {ev.estimatedProductionBopd.toFixed(2)} BOPD / {ev.candidate.inputs.steamInjectionRateTpd} TPD
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200">Production ↑ vs Operational Risk ↑</h4>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    {optimizationResult.evaluations.map((ev) => (
                      <div key={`trade-risk-${ev.candidate.id}`} className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span>{ev.candidate.name}</span>
                        <span className="font-bold">
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="space-y-3">
                <h3 className="font-bold text-sky-300">FUTURE OPERATING CONDITIONS</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Future Steam Rate (TPD):</label>
                    <input
                      type="number"
                      value={futureSteam}
                      onChange={(e) => setFutureSteam(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Future Reservoir Temp (°C):</label>
                    <input
                      type="number"
                      value={futureTemp}
                      onChange={(e) => setFutureTemp(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Future Reservoir Pressure (bar):</label>
                    <input
                      type="number"
                      value={futurePressure}
                      onChange={(e) => setFuturePressure(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Future Water Cut (%):</label>
                    <input
                      type="number"
                      value={futureWaterCut}
                      onChange={(e) => setFutureWaterCut(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Future SPM (strokes/min):</label>
                    <input
                      type="number"
                      value={futureSpm}
                      onChange={(e) => setFutureSpm(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Future Stroke Length (m):</label>
                    <input
                      type="number"
                      value={futureStroke}
                      onChange={(e) => setFutureStroke(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900 p-4 rounded-lg border border-slate-800">
                <h3 className="font-bold text-emerald-300">PREDICTED SIMULATION FORECAST</h3>
                <div className="space-y-2 text-slate-200">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span>Oil Production Rate:</span>
                    <span className="font-bold">
                      {predictionResult.currentProductionBopd.toFixed(2)} BOPD →{' '}
                      <span className="text-emerald-400">{predictionResult.predictedProductionBopd.toFixed(2)} BOPD</span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span>Absolute Production Delta:</span>
                    <span className="font-bold text-sky-400">
                      {predictionResult.bopdDelta >= 0 ? `+${predictionResult.bopdDelta}` : predictionResult.bopdDelta} BOPD
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span>Percentage Production Change:</span>
                    <span className="font-bold text-emerald-400">
                      {predictionResult.bopdPercentChange >= 0 ? `+${predictionResult.bopdPercentChange}` : predictionResult.bopdPercentChange}%
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span>Modeled Crude Viscosity:</span>
                    <span>
                      {predictionResult.currentViscosityCp.toFixed(0)} cP →{' '}
                      <span className="text-amber-300">{predictionResult.predictedViscosityCp.toFixed(0)} cP</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-2 italic">
                    {predictionResult.uncertaintyNotice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ENGINEERING DECISION TRACE */}
        {activeTab === 'TRACE' && optimizationResult.trace && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sky-300 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-sky-400" />
                  <span>ENGINEERING DECISION TRACE</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-900 text-sky-300 font-bold text-[10px]">
                  {optimizationResult.trace.traceId}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400">Trace Timestamp:</span> {optimizationResult.trace.timestamp}
                </div>
                <div>
                  <span className="text-slate-400">Objective:</span> {optimizationResult.trace.objective}
                </div>
                <div>
                  <span className="text-slate-400">Candidate Scenarios:</span> {optimizationResult.trace.candidateScenariosCount}
                </div>
                <div>
                  <span className="text-slate-400">Feasible Scenarios:</span> {optimizationResult.trace.feasibleScenariosCount}
                </div>
                <div>
                  <span className="text-slate-400">Selected Scenario:</span> {optimizationResult.trace.selectedScenarioName}
                </div>
                <div>
                  <span className="text-slate-400">Baseline Production:</span> {optimizationResult.trace.baselineProductionBopd.toFixed(2)} BOPD
                </div>
                <div>
                  <span className="text-slate-400">Selected Production:</span> {optimizationResult.trace.selectedProductionBopd.toFixed(2)} BOPD
                </div>
                <div>
                  <span className="text-slate-400">Production Delta:</span> +{optimizationResult.trace.productionDeltaBopd.toFixed(2)} BOPD (+{optimizationResult.trace.productionPercentChange}%)
                </div>
                <div>
                  <span className="text-slate-400">Steam Rate Change:</span> +{optimizationResult.trace.steamDeltaTpd} TPD
                </div>
                <div>
                  <span className="text-slate-400">Historical Validation Error:</span> {optimizationResult.trace.historicalValidationErrorPercent}%
                </div>
              </div>

              <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 italic">
                {optimizationResult.trace.disclaimer}
              </p>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};
