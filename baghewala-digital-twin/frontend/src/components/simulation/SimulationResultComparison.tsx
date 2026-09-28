import React from 'react';
import { useScenarioStore, BASELINE_INPUT_VALUES } from '../../simulation/scenario';
import { analyzeWhyStateChanged } from '../../simulation/copilot/decisionTraceEngine';
import {
  HelpCircle,
  Activity,
  Flame,
  Droplet,
  TrendingUp,
  Gauge,
  ShieldAlert,
  ArrowRight,
  Layers,
} from 'lucide-react';

export const SimulationResultComparison: React.FC = () => {
  const {
    activeScenario,
    presets,
    thermalResult,
    baselineThermalResult,
    viscosityResult,
    baselineViscosityResult,
    mobilityResult,
    baselineMobilityResult,
    productionResult,
    baselineProductionResult,
    srpOptimizationResult,
    baselineSRPOptimizationResult,
    aiRiskResult,
    baselineAIRiskResult,
  } = useScenarioStore();

  const baselineScenario = presets[0] || activeScenario;
  const inputs = activeScenario.inputs;

  // Utilize existing decision trace engine causal delta analyzer
  const whyChangedDeltas = analyzeWhyStateChanged(baselineScenario, activeScenario);

  // 14 Detailed Metric Rows (Reference vs Simulated + Delta)
  const comparisonItems = [
    {
      name: 'Ambient Temperature',
      category: 'SURFACE ENVIRONMENT',
      refValue: `${BASELINE_INPUT_VALUES.ambientTemperatureC.toFixed(1)} °C`,
      simValue: `${inputs.ambientTemperatureC.toFixed(1)} °C`,
      delta: `${(inputs.ambientTemperatureC - BASELINE_INPUT_VALUES.ambientTemperatureC) >= 0 ? '+' : ''}${(inputs.ambientTemperatureC - BASELINE_INPUT_VALUES.ambientTemperatureC).toFixed(1)} °C`,
      unit: '°C',
    },
    {
      name: 'Wellhead / Well Temperature',
      category: 'THERMAL STATE',
      refValue: `${(baselineThermalResult.predictedReservoirTemperatureC * 0.72).toFixed(1)} °C`,
      simValue: `${(thermalResult.predictedReservoirTemperatureC * 0.72).toFixed(1)} °C`,
      delta: `${(thermalResult.predictedReservoirTemperatureC * 0.72 - baselineThermalResult.predictedReservoirTemperatureC * 0.72) >= 0 ? '+' : ''}${(thermalResult.predictedReservoirTemperatureC * 0.72 - baselineThermalResult.predictedReservoirTemperatureC * 0.72).toFixed(1)} °C`,
      unit: '°C',
    },
    {
      name: 'Reservoir Matrix Temperature',
      category: 'THERMAL STATE',
      refValue: `${baselineThermalResult.predictedReservoirTemperatureC.toFixed(1)} °C`,
      simValue: `${thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C`,
      delta: `${thermalResult.temperatureChangeC >= 0 ? '+' : ''}${thermalResult.temperatureChangeC.toFixed(1)} °C`,
      unit: '°C',
    },
    {
      name: 'Reservoir Initial Pressure',
      category: 'RESERVOIR PRESSURE',
      refValue: `48.0 bar (696 psi)`,
      simValue: `48.0 bar (696 psi)`,
      delta: `0.0 bar`,
      unit: 'bar',
    },
    {
      name: 'Crude Oil Viscosity',
      category: 'FLUID RHEOLOGY',
      refValue: `${baselineViscosityResult.estimatedViscosityCp.toLocaleString()} cP`,
      simValue: `${viscosityResult.estimatedViscosityCp.toLocaleString()} cP`,
      delta: `${viscosityResult.viscosityChangePercent}%`,
      unit: 'cP',
    },
    {
      name: 'Darcy Oil Mobility',
      category: 'FLUID MOBILITY',
      refValue: `${baselineMobilityResult.mobilityDcP.toFixed(4)} D/cP`,
      simValue: `${mobilityResult.mobilityDcP.toFixed(4)} D/cP`,
      delta: `+${mobilityResult.mobilityChangePercent}%`,
      unit: 'D/cP',
    },
    {
      name: 'Heavy Oil Production',
      category: 'INFLOW CAPACITY',
      refValue: `${baselineProductionResult.estimatedProductionBopd.toFixed(2)} BOPD`,
      simValue: `${productionResult.estimatedProductionBopd.toFixed(2)} BOPD`,
      delta: `+${productionResult.productionChangePercent}% (+${(productionResult.estimatedProductionBopd - baselineProductionResult.estimatedProductionBopd).toFixed(2)} BOPD)`,
      unit: 'BOPD',
    },
    {
      name: 'Water Cut',
      category: 'FLUID COMPOSITION',
      refValue: `20.0 %`,
      simValue: `20.0 %`,
      delta: `0.0 %`,
      unit: '%',
    },
    {
      name: 'Steam Injection Temperature',
      category: 'THERMAL INJECTION',
      refValue: `250.0 °C`,
      simValue: `250.0 °C`,
      delta: `0.0 °C`,
      unit: '°C',
    },
    {
      name: 'Steam Injection Rate',
      category: 'THERMAL INJECTION',
      refValue: `${BASELINE_INPUT_VALUES.steamInjectionRateTpd.toFixed(1)} TPD`,
      simValue: `${inputs.steamInjectionRateTpd.toFixed(1)} TPD`,
      delta: `${(inputs.steamInjectionRateTpd - BASELINE_INPUT_VALUES.steamInjectionRateTpd) >= 0 ? '+' : ''}${(inputs.steamInjectionRateTpd - BASELINE_INPUT_VALUES.steamInjectionRateTpd).toFixed(1)} TPD`,
      unit: 'TPD',
    },
    {
      name: 'Pumping Speed (SPM)',
      category: 'ARTIFICIAL LIFT',
      refValue: `${BASELINE_INPUT_VALUES.spm.toFixed(1)} SPM`,
      simValue: `${inputs.spm.toFixed(1)} SPM`,
      delta: `${(inputs.spm - BASELINE_INPUT_VALUES.spm) >= 0 ? '+' : ''}${(inputs.spm - BASELINE_INPUT_VALUES.spm).toFixed(1)} SPM`,
      unit: 'SPM',
    },
    {
      name: 'Stroke Length',
      category: 'ARTIFICIAL LIFT',
      refValue: `${BASELINE_INPUT_VALUES.strokeLengthMeters.toFixed(1)} m`,
      simValue: `${inputs.strokeLengthMeters.toFixed(1)} m`,
      delta: `${(inputs.strokeLengthMeters - BASELINE_INPUT_VALUES.strokeLengthMeters) >= 0 ? '+' : ''}${(inputs.strokeLengthMeters - BASELINE_INPUT_VALUES.strokeLengthMeters).toFixed(1)} m`,
      unit: 'm',
    },
    {
      name: 'SRP Rod Load Index',
      category: 'MECHANICAL LOAD',
      refValue: `${baselineSRPOptimizationResult.currentCandidate.loadIndex.toFixed(0)} %`,
      simValue: `${srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)} %`,
      delta: `${(srpOptimizationResult.currentCandidate.loadIndex - baselineSRPOptimizationResult.currentCandidate.loadIndex) >= 0 ? '+' : ''}${(srpOptimizationResult.currentCandidate.loadIndex - baselineSRPOptimizationResult.currentCandidate.loadIndex).toFixed(0)} %`,
      unit: '%',
    },
    {
      name: 'Multi-Physics Risk Score',
      category: 'RISK EVALUATION',
      refValue: `${baselineAIRiskResult.riskScore} / 100 (${baselineAIRiskResult.riskLevel})`,
      simValue: `${aiRiskResult.riskScore} / 100 (${aiRiskResult.riskLevel})`,
      delta: `${(aiRiskResult.riskScore - baselineAIRiskResult.riskScore) >= 0 ? '+' : ''}${aiRiskResult.riskScore - baselineAIRiskResult.riskScore} pts`,
      unit: 'score',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Comparative Physics Engine</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Simulation Results — Reference vs Modeled Scenario
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive 14-parameter side-by-side analysis between baseline reference state and active simulated candidate.
          </p>
        </div>

        <span className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0 self-start sm:self-auto shadow-sm">
          SINGLE SOURCE OF TRUTH
        </span>
      </div>

      {/* 5 KEY METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* Thermal */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 hover:border-rose-300 dark:hover:border-rose-800 transition-colors shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Thermal State</span>
          </div>
          <span className="text-rose-600 dark:text-rose-400 font-bold text-xl font-mono block">
            {thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">MODEL-CALCULATED</span>
        </div>

        {/* Viscosity */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 hover:border-purple-300 dark:hover:border-purple-800 transition-colors shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            <Droplet className="w-3.5 h-3.5" />
            <span>Oil Viscosity</span>
          </div>
          <span className="text-purple-600 dark:text-purple-400 font-bold text-xl font-mono block truncate">
            {viscosityResult.estimatedViscosityCp.toLocaleString()} cP
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">MODEL-CALCULATED</span>
        </div>

        {/* Production */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 hover:border-sky-300 dark:hover:border-sky-800 transition-colors shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Production Yield</span>
          </div>
          <span className="text-sky-600 dark:text-sky-400 font-bold text-xl font-mono block">
            {productionResult.estimatedProductionBopd.toFixed(2)} <span className="text-xs">BOPD</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">MODEL-CALCULATED</span>
        </div>

        {/* SRP Load */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 hover:border-amber-300 dark:hover:border-amber-800 transition-colors shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <Gauge className="w-3.5 h-3.5" />
            <span>SRP Rod Load</span>
          </div>
          <span className="text-amber-600 dark:text-amber-400 font-bold text-xl font-mono block">
            {srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)} %
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">MODEL-CALCULATED</span>
        </div>

        {/* Risk State */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Risk State</span>
          </div>
          <span className={`font-bold text-xl font-mono block ${
            aiRiskResult.riskLevel === 'HIGH'
              ? 'text-rose-600 dark:text-rose-400'
              : aiRiskResult.riskLevel === 'MODERATE'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {aiRiskResult.riskLevel}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">SCORE: {aiRiskResult.riskScore}/100</span>
        </div>
      </div>

      {/* PROPAGATION PIPELINE STRIP */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Physics Dependency Propagation Chain</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-center text-xs font-bold">
          <span className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 shadow-sm">
            SCENARIO CHANGE
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 shadow-sm">
            THERMAL
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-900/60 text-purple-700 dark:text-purple-300 shadow-sm">
            VISCOSITY
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 shadow-sm">
            MOBILITY
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-900/60 text-sky-700 dark:text-sky-300 shadow-sm">
            PRODUCTION
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 shadow-sm">
            SRP LIFT
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 shadow-sm">
            RISK
          </span>
        </div>
      </div>
      
      {/* TWO-COLUMN SIDE-BY-SIDE COMPARISON TABLE */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <table className="w-full text-left text-sm font-medium">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">Parameter Metric</th>
              <th className="p-4 text-emerald-700 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>REFERENCE CONDITION</span>
                </div>
              </th>
              <th className="p-4 text-sky-700 dark:text-sky-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>SIMULATED CONDITION</span>
                </div>
              </th>
              <th className="p-4 text-amber-700 dark:text-amber-400">Delta (Δ) Shift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
            {comparisonItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                  <div>{item.name}</div>
                  <span className="text-[10px] text-slate-400 font-sans font-semibold uppercase tracking-wider">{item.category}</span>
                </td>
                <td className="p-4 text-emerald-700 dark:text-emerald-400 font-mono font-bold">{item.refValue}</td>
                <td className="p-4 text-sky-700 dark:text-sky-400 font-mono font-bold">{item.simValue}</td>
                <td className="p-4 font-bold font-mono">
                  <span className={`px-2.5 py-1 rounded-lg text-xs shadow-sm ${
                    item.delta.includes('+')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/60'
                      : (item.delta.includes('-')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/60'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700')
                  }`}>
                    {item.delta}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WHY DID THIS CHANGE? SECTION */}
      <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide uppercase">
              WHY DID THIS CHANGE? — CAUSAL DECISION TRACE
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-bold bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
            decisionTraceEngine
          </span>
        </div>

        {whyChangedDeltas.length === 0 ? (
          <div className="text-slate-500 dark:text-slate-400 font-medium text-xs p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            No parameter variations detected against baseline reference. Active scenario matches normal operating condition.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whyChangedDeltas.map((delta, i) => (
              <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 text-sm">
                  <strong className="text-slate-800 dark:text-slate-100 font-bold">{delta.parameterName}</strong>
                  <span className="text-amber-600 dark:text-amber-400 font-bold font-mono text-xs px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60">
                    {delta.delta}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <div className="text-[11px] text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider">
                    Affected Model: {delta.affectedModel}
                  </div>
                  <div className="font-medium leading-relaxed">
                    {delta.causalExplanation}
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-xs text-emerald-700 dark:text-emerald-400 shadow-inner">
                    <strong className="text-slate-500 font-bold">Physics Shift:</strong> <br/>{delta.intermediatePhysicsChange}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
