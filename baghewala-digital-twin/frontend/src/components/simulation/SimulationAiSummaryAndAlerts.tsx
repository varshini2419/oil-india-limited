import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import {
  Sparkles,
  Info,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Wand2,
  RotateCcw,
  Zap,
  Activity,
  Flame,
  Droplet,
} from 'lucide-react';

export const SimulationAiSummaryAndAlerts: React.FC = () => {
  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpOptimizationResult,
    aiRiskResult,
    updateInput,
    resetCurrentToBaseline,
    commitSimulationRun,
  } = useScenarioStore();

  const inputs = activeScenario.inputs;
  const riskLevel = aiRiskResult.riskLevel;
  const isHighRisk = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
  const isModerateRisk = riskLevel === 'MODERATE';
  const issues = aiRiskResult.detectedIssues;
  const actions = aiRiskResult.recommendedActions;

  // Real-time calculated state
  const currentTemp = thermalResult.predictedReservoirTemperatureC;
  const currentViscosity = viscosityResult.estimatedViscosityCp;
  const currentMobility = mobilityResult.mobilityDcP;
  const currentBopd = productionResult.estimatedProductionBopd;
  const rodLoad = srpOptimizationResult.currentCandidate.loadIndex;

  // Actions to optimize
  const applyOptimalSRPLift = () => {
    updateInput('spm', srpOptimizationResult.optimalCandidate.spm);
    updateInput('vfdFrequencyHz', srpOptimizationResult.optimalCandidate.vfdFrequencyHz);
    updateInput('strokeLengthMeters', srpOptimizationResult.optimalCandidate.strokeLengthM);
    commitSimulationRun();
  };

  const applyThermalBoost = () => {
    updateInput('steamInjectionRateTpd', 140);
    updateInput('steamQualityPercent', 85);
    updateInput('reservoirTemperatureC', 68);
    commitSimulationRun();
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 1. AI OPERATING SUMMARY CARD */}
      <div
        className={`rounded-2xl border p-5 shadow-sm transition-all ${
          isHighRisk
            ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
            : isModerateRisk
            ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
            : 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/60'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              AI SIMULATION OPERATING SUMMARY
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-mono font-bold bg-white dark:bg-slate-900 shadow-sm">
              CANONICAL MULTI-PHYSICS GROUNDED
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                isHighRisk
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : isModerateRisk
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              }`}
            >
              {riskLevel} RISK ({aiRiskResult.riskScore}/100)
            </span>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          <p>
            <strong>This is happening: </strong>
            The simulation models downhole reservoir matrix at{' '}
            <strong className="text-rose-600 dark:text-rose-400 font-mono">
              {currentTemp.toFixed(1)}°C
            </strong>
            , reducing crude oil viscosity to{' '}
            <strong className="text-purple-600 dark:text-purple-300 font-mono">
              {currentViscosity.toLocaleString()} cP
            </strong>{' '}
            (<strong className="text-purple-600 dark:text-purple-300">{viscosityResult.viscosityChangePercent}%</strong> vs cold baseline). Inflow Darcy mobility is{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
              {currentMobility.toFixed(4)} D/cP
            </strong>
            , generating an estimated heavy-oil production of{' '}
            <strong className="text-sky-600 dark:text-sky-400 font-mono">
              {currentBopd.toFixed(2)} BOPD
            </strong>{' '}
            under {inputs.spm} SPM and {inputs.vfdFrequencyHz} Hz VFD with SRP rod load index at{' '}
            <strong className={`font-mono ${rodLoad > 80 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {rodLoad.toFixed(0)}%
            </strong>
            .
            <br className="my-1.5" />
            <strong>This needs to be done: </strong>
            {actions.length > 0 ? (
              <span>
                {actions[0].actionText} ({actions[0].expectedImpact}) Utilize the recommended setpoints below to adjust VFD speed and thermal heating back into safe operating envelopes.
              </span>
            ) : (
              <span>
                Maintain current operating setpoints. All 7 multi-physics engines confirm stable operation within the Jodhpur Sandstone thermal, hydraulic, and mechanical bounds.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 2. REAL-TIME SIMULATION METRICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Matrix Temp</span>
          </div>
          <strong className="block text-2xl mt-1 font-mono text-rose-600 dark:text-rose-400">
            {currentTemp.toFixed(1)}
            <small className="text-xs text-slate-500 ml-1 font-sans">°C</small>
          </strong>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Droplet className="w-3.5 h-3.5 text-purple-500" />
            <span>Oil Viscosity</span>
          </div>
          <strong className="block text-2xl mt-1 font-mono text-purple-600 dark:text-purple-400 truncate">
            {currentViscosity.toLocaleString()}
            <small className="text-xs text-slate-500 ml-1 font-sans">cP</small>
          </strong>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Darcy Mobility</span>
          </div>
          <strong className="block text-2xl mt-1 font-mono text-emerald-600 dark:text-emerald-400">
            {currentMobility.toFixed(4)}
            <small className="text-xs text-slate-500 ml-1 font-sans">D/cP</small>
          </strong>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-sky-500" />
            <span>Estimated Production</span>
          </div>
          <strong className="block text-2xl mt-1 font-mono text-sky-600 dark:text-sky-400">
            {currentBopd.toFixed(2)}
            <small className="text-xs text-slate-500 ml-1 font-sans">BOPD</small>
          </strong>
        </div>
      </div>

      {/* 3. SIMULATION OPERATOR ALERTS & ACTION CARDS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              OPERATIONAL ALERTS & ADVISORY ACTIONS
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={applyOptimalSRPLift}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Apply SRP candidate from optimization grid search"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>APPLY OPTIMAL SRP</span>
            </button>
            <button
              onClick={applyThermalBoost}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Boost steam injection to 140 TPD"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>BOOST STEAM</span>
            </button>
            <button
              onClick={resetCurrentToBaseline}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs transition-all shadow-sm cursor-pointer"
              title="Reset to Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Issues List or All-Clear */}
        {issues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{issue.title}</span>
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase border ${
                      issue.severity === 'HIGH' || issue.severity === 'CRITICAL'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                    }`}
                  >
                    {issue.severity}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {issue.description}
                </p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-sky-700 dark:text-sky-300 font-mono space-y-1">
                  <div><strong>Threshold:</strong> {issue.threshold} (Actual: {issue.actualValue})</div>
                  {actions.find((a) => a.targetModule === (issue.category === 'SRP_LOAD' ? 'SRP' : 'CSS'))?.actionText && (
                    <div className="text-amber-700 dark:text-amber-300">
                      <strong>Recommended:</strong> {actions.find((a) => a.targetModule === (issue.category === 'SRP_LOAD' ? 'SRP' : 'CSS'))?.actionText}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>
              All operating conditions are within nominal ranges. Thermal dissipation, rod load ({rodLoad.toFixed(0)}%), and in-situ mobility adhere to Baghewala reservoir physics.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
