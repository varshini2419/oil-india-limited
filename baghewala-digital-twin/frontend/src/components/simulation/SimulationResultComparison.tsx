import React from 'react';
import { Panel } from '../ui/Panel';
import { useScenarioStore, BASELINE_INPUT_VALUES } from '../../simulation/scenario';
import { analyzeWhyStateChanged } from '../../simulation/copilot/decisionTraceEngine';
import { HelpCircle } from 'lucide-react';

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
    <Panel
      title="SIMULATION RESULT — REFERENCE vs MODELED SCENARIO"
      subtitle="Comprehensive 14-parameter side-by-side comparison between Reference Baseline vs Active Simulated Scenario"
      action={
        <span className="px-2.5 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono text-[10px] font-bold">
          [MODELED SCENARIO DELTA EVALUATION]
        </span>
      }
    >
      <div className="space-y-6 font-mono text-xs simulation-comparison">

        {/* MODELED SCENARIO RESULT SUMMARY BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-slate-950 rounded-lg border border-sky-900/60 shadow-lg simulation-reveal simulation-live">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block font-bold">THERMAL STATE</span>
            <span className="text-rose-400 font-bold text-sm">
              {thermalResult.predictedReservoirTemperatureC.toFixed(1)} °C
            </span>
            <span className="text-[9px] text-slate-400 block font-mono">[MODEL-CALCULATED]</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block font-bold">OIL VISCOSITY</span>
            <span className="text-purple-400 font-bold text-sm">
              {viscosityResult.estimatedViscosityCp.toLocaleString()} cP
            </span>
            <span className="text-[9px] text-slate-400 block font-mono">[MODEL-CALCULATED]</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block font-bold">PRODUCTION YIELD</span>
            <span className="text-sky-300 font-bold text-sm">
              {productionResult.estimatedProductionBopd.toFixed(2)} BOPD
            </span>
            <span className="text-[9px] text-slate-400 block font-mono">[MODEL-CALCULATED]</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block font-bold">SRP ROD LOAD</span>
            <span className="text-amber-400 font-bold text-sm">
              {srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)} %
            </span>
            <span className="text-[9px] text-slate-400 block font-mono">[MODEL-CALCULATED]</span>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 block font-bold">RISK STATE</span>
            <span className={`font-bold text-sm ${
              aiRiskResult.riskLevel === 'HIGH' ? 'text-rose-400' : (aiRiskResult.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400')
            }`}>
              {aiRiskResult.riskLevel} ({aiRiskResult.riskScore}/100)
            </span>
            <span className="text-[9px] text-slate-400 block font-mono">[MODEL-PREDICTED]</span>
          </div>
        </div>

        {/* PHYSICS CAUSAL CHAIN FLOW BANNER */}
        <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 text-[10px] font-mono text-slate-300 simulation-reveal">
          <div className="text-[9px] uppercase font-bold text-sky-400 mb-1">
            PHYSICS DEPENDENCY PROPAGATION CHAIN
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1 text-center font-bold text-[10px]">
            <span className="simulation-chain-step px-2 py-1 bg-slate-950 rounded border border-slate-800 text-sky-300">SCENARIO CHANGE</span>
            <span className="text-slate-500">→</span>
            <span className="simulation-chain-step px-2 py-1 bg-slate-950 rounded border border-rose-900/60 text-rose-300">THERMAL</span>
            <span className="text-slate-500">→</span>
            <span className="simulation-chain-step px-2 py-1 bg-slate-950 rounded border border-purple-900/60 text-purple-300">VISCOSITY</span>
            <span className="text-slate-500">→</span>
            <span className="simulation-chain-step px-2 py-1 bg-slate-950 rounded border border-emerald-900/60 text-emerald-300">MOBILITY</span>
            <span className="text-slate-500">→</span>
            <span className="simulation-chain-step px-2 py-1 bg-slate-950 rounded border border-sky-900/60 text-sky-300">PRODUCTION</span>
            <span className="text-slate-500">→</span>
            <span className="simulation-chain-step px-2 py-1 bg-slate-950 rounded border border-amber-900/60 text-amber-300">SRP LIFT</span>
            <span className="text-slate-500">→</span>
            <span className="simulation-chain-step px-2 py-1 bg-slate-950 rounded border border-rose-800 text-rose-300">RISK</span>
          </div>
        </div>
        
        {/* Two-Column Side-by-Side Comparison Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg shadow-xl simulation-reveal">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Parameter Metric</th>
                <th className="p-3 text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>REFERENCE CONDITION</span>
                  </div>
                </th>
                <th className="p-3 text-sky-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>SIMULATED CONDITION</span>
                  </div>
                </th>
                <th className="p-3 text-amber-400">Delta (Δ) Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono">
              {comparisonItems.map((item, idx) => (
                <tr key={idx} className="simulation-table-row hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 font-bold text-slate-200">
                    <div>{item.name}</div>
                    <span className="text-[9px] text-slate-500 font-sans">{item.category}</span>
                  </td>
                  <td className="p-3 text-emerald-300 font-semibold">{item.refValue}</td>
                  <td className="p-3 text-sky-300 font-bold">{item.simValue}</td>
                  <td className="p-3 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      item.delta.includes('+')
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                        : (item.delta.includes('-') ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-slate-900 text-slate-400 border border-slate-800')
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
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 simulation-reveal">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <h4 className="font-bold text-sky-300 text-xs tracking-wide uppercase">
              WHY DID THIS CHANGE? — CAUSAL DECISION TRACE
            </h4>
            <span className="text-[9px] text-slate-500 font-sans ml-auto">
              Sourced directly from decisionTraceEngine
            </span>
          </div>

          <div className="text-[10px] text-slate-400 italic">
            Each downstream change is calculated from the preceding modeled physical state.
          </div>

          {whyChangedDeltas.length === 0 ? (
            <div className="text-slate-400 italic text-[11px] p-2">
              No parameter variations detected against baseline reference. Active scenario matches normal operating condition.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {whyChangedDeltas.map((delta, i) => (
                <div key={i} className="simulation-card p-3 bg-slate-900/80 rounded border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5 text-xs">
                    <strong className="text-slate-200">{delta.parameterName}</strong>
                    <span className="text-amber-400 font-bold text-[10px]">{delta.delta}</span>
                  </div>

                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-sky-400 font-semibold">
                      <span>Affected: {delta.affectedModel}</span>
                    </div>
                    <div className="text-slate-400 font-sans text-xs">
                      {delta.causalExplanation}
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-900 text-[10px] text-emerald-300 font-mono">
                      <strong>Physics Shift:</strong> {delta.intermediatePhysicsChange}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODELED INTERPRETATION PANEL */}
        <div className="p-4 bg-slate-900/80 rounded-lg border border-sky-900/60 font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5 font-bold text-sky-300 text-xs">
            <span>MODELED INTERPRETATION</span>
            <span className="text-[9px] text-slate-500 font-sans ml-auto">[NON-ACTUATING DECISION ADVISORY]</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-slate-300">
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <strong className="text-rose-400 block text-[10px]">THERMAL INTERPRETATION</strong>
              Modeled heating reduces heavy-oil resistance in the matrix near-wellbore zone.
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <strong className="text-purple-400 block text-[10px]">FLUID RHEOLOGY</strong>
              Lower viscosity increases modeled effective Darcy mobility ($k/\mu$).
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <strong className="text-sky-300 block text-[10px]">PRODUCTION INFLOW</strong>
              Improved mobility changes modeled Vogel IPR heavy-oil inflow potential.
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <strong className="text-amber-400 block text-[10px]">SRP MECHANICS & RISK</strong>
              Higher lift demand alters rod-load envelope and multi-physics risk evaluation.
            </div>
          </div>
        </div>

      </div>
    </Panel>
  );
};
