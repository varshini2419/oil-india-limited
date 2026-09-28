import React, { useMemo } from 'react';
import { Panel } from '../ui/Panel';
import { useScenarioStore } from '../../simulation/scenario';
import { generateAiExplanation } from '../../simulation/aiExplanationEngine';
import { getLatestHistoricalIncidentState } from './SimulationHistoricalIncidents';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Zap,
  FileText,
  Flame,
  Droplet,
} from 'lucide-react';

export const AiEngineeringExplanationPanel: React.FC = () => {
  const {
    activeScenario,
    thermalResult,
    baselineThermalResult,
    viscosityResult,
    baselineViscosityResult,
    mobilityResult,
    baselineMobilityResult,
    productionResult,
    baselineProductionResult,
    srpOptimizationResult,
    cssOptimizationResult,
    aiRiskResult,
  } = useScenarioStore();

  const explanation = useMemo(() => {
    return generateAiExplanation({
      activeScenario,
      thermalResult,
      baselineThermalResult,
      viscosityResult,
      baselineViscosityResult,
      mobilityResult,
      baselineMobilityResult,
      productionResult,
      baselineProductionResult,
      srpOptimizationResult,
      cssOptimizationResult,
      aiRiskResult,
    });
  }, [
    activeScenario,
    thermalResult,
    baselineThermalResult,
    viscosityResult,
    baselineViscosityResult,
    mobilityResult,
    baselineMobilityResult,
    productionResult,
    baselineProductionResult,
    srpOptimizationResult,
    cssOptimizationResult,
    aiRiskResult,
  ]);

  const transitions = explanation.whatChanged;
  const constraints = explanation.riskAndConstraints.activeConstraints;
  const riskLevel = explanation.riskAndConstraints.overallRiskLevel;

  // Retrieve grounded historical evidence state
  const historicalState = getLatestHistoricalIncidentState();
  const groundedEvidence = historicalState.evidence.length > 0 ? historicalState.evidence : historicalState.incidents;

  return (
    <Panel
      title="AI Engineering Explanation & Advisory Workstation"
      subtitle="Dynamic 5-step physical causal chain, parameter transitions, grounded historical evidence & advisory recommendations"
      action={
        <div className="flex items-center gap-2 font-mono text-[10px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
          <span className="font-bold">MODELED SIMULATION DRIVEN</span>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        
        {/* STEP 1: WHY THIS HAPPENED (CAUSAL CHAIN) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-sky-500/25">
                01
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Causal Physics Chain
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Why This Happened
                </h3>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80">
              REACTIVE MULTI-PHYSICS
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
            {explanation.whyThisHappened}
          </div>
        </div>

        {/* STEP 2 & 3: GRID (WHAT CHANGED & GROUNDED RAG EVIDENCE) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* STEP 2: WHAT CHANGED (NUMERICAL TRANSITIONS) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/25">
                  02
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Physical State Delta
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    What Changed (Baseline vs Active)
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                DELTA TABLE
              </span>
            </div>

            <div className="space-y-3">
              {/* Reservoir Temp */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-500 border border-rose-200 dark:border-rose-900/50">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Reservoir Temperature</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold font-mono text-sm mt-0.5 block">
                      {transitions.reservoirTemperature.formattedTransition}
                    </span>
                  </div>
                </div>
                <span className="text-rose-600 dark:text-rose-400 font-bold text-xs font-mono bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60">
                  {transitions.reservoirTemperature.deltaText}
                </span>
              </div>

              {/* Viscosity */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-500 border border-purple-200 dark:border-purple-900/50">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Crude Oil Viscosity</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold font-mono text-sm mt-0.5 block">
                      {transitions.viscosity.formattedTransition}
                    </span>
                  </div>
                </div>
                <span className="text-purple-600 dark:text-purple-400 font-bold text-xs font-mono bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-900/60">
                  {transitions.viscosity.deltaText}
                </span>
              </div>

              {/* Mobility */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 border border-emerald-200 dark:border-emerald-900/50">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Darcy Fluid Mobility (k/μ)</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold font-mono text-sm mt-0.5 block">
                      {transitions.mobility.formattedTransition}
                    </span>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs font-mono bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                  {transitions.mobility.deltaText}
                </span>
              </div>

              {/* Estimated Production */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-500 border border-sky-200 dark:border-sky-900/50">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Estimated Production</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold font-mono text-sm mt-0.5 block">
                      {transitions.production.formattedTransition}
                    </span>
                  </div>
                </div>
                <span className="text-sky-600 dark:text-sky-400 font-bold text-xs font-mono bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-900/60">
                  {transitions.production.deltaText}
                </span>
              </div>

              {/* SRP Load Index */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-500 border border-amber-200 dark:border-amber-900/50">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">SRP Operating Load Index</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold font-mono text-sm mt-0.5 block">
                      {transitions.srpLoadIndex.formattedTransition}
                    </span>
                  </div>
                </div>
                <span className={`font-bold text-xs font-mono px-2.5 py-1 rounded-lg border ${
                  transitions.srpLoadIndex.isFavorable
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60'
                    : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/60'
                }`}>
                  {transitions.srpLoadIndex.deltaText}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: GROUNDED HISTORICAL EVIDENCE (RAG INTEGRATION) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/25">
                  03
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Field Knowledge Retrieval
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Grounded Historical Evidence (RAG)
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                OIL INDIA ARCHIVES
              </span>
            </div>

            {groundedEvidence.length > 0 ? (
              <div className="space-y-3">
                {groundedEvidence.slice(0, 3).map((item) => {
                  const title = item.title;
                  const desc = 'documentedEvidence' in item ? item.documentedEvidence.description : (item as { description: string }).description;
                  const sourceStr = 'provenance' in item ? item.provenance.document : ((item as { source?: string }).source || 'Baghewala Knowledge Base');
                  const matchExplanation = 'currentMatch' in item ? item.currentMatch.explanation : null;

                  return (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="truncate max-w-[240px] text-sm font-semibold">{title}</span>
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0 font-mono font-bold">
                          EVIDENCE
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-3">
                        {desc}
                      </p>
                      {matchExplanation && (
                        <div className="text-[11px] text-sky-700 dark:text-sky-300 font-mono bg-sky-50 dark:bg-sky-950/40 p-2.5 rounded-lg border border-sky-100 dark:border-sky-900/40 mt-2">
                          <strong className="text-sky-800 dark:text-sky-400 font-bold">Why Relevant:</strong> {matchExplanation}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-200/60 dark:border-slate-800/60 mt-2 flex items-center justify-between">
                        <span>Source: {sourceStr}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">NOT A PREDICTION</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-3">
                <FileText className="w-6 h-6 text-sky-500 shrink-0" />
                <span className="font-medium">Historical evidence initialized from embedded Baghewala field database.</span>
              </div>
            )}
          </div>
        </div>

        {/* STEP 4: MULTI-PHYSICS RISK & OPERATING CONSTRAINTS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-rose-500/25">
                04
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Operational Safety Envelope
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Multi-Physics Risk & Operating Constraints
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Safety Envelope:</span>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold font-mono tracking-wide shadow-sm border ${
                riskLevel === 'CRITICAL' ? 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' :
                riskLevel === 'HIGH' ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                riskLevel === 'MODERATE' ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}>
                {riskLevel} RISK ({explanation.riskAndConstraints.riskScore}/100)
              </span>
            </div>
          </div>

          {constraints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {constraints.map((c) => (
                <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-amber-200/80 dark:border-amber-900/60 space-y-2.5 text-xs shadow-sm">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 font-bold text-sm">
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{c.title}</span>
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 tracking-wider uppercase font-bold font-mono">
                      {c.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {c.explanation}
                  </p>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300/90 font-mono bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/40">
                    <strong className="text-amber-900 dark:text-amber-200 font-bold">Constraint:</strong> {c.constraintDescription}
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono bg-amber-100/50 dark:bg-amber-950/70 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/80 font-bold">
                    {c.advisoryWarning}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm font-medium shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>All operational parameters operate safely within thermal, hydraulic, and mechanical boundaries.</span>
            </div>
          )}
        </div>

        {/* STEP 5: ENGINEERING ADVISORY RECOMMENDATIONS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/25">
                05
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Decision Support
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Recommended Advisory Actions
                </h3>
              </div>
            </div>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono font-bold bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 shadow-sm">
              0 AUTOMATIC ACTUATION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {explanation.recommendedAdvisoryActions.map((rec) => (
              <div key={rec.id} className="p-5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 font-sans text-xs shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-100">
                  <span className="flex items-center gap-2">
                    {rec.targetModule === 'SRP' ? (
                      <Zap className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Sliders className="w-4 h-4 text-rose-500" />
                    )}
                    <span>{rec.title}</span>
                  </span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider font-mono border ${
                    rec.priority === 'HIGH'
                      ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {rec.priority} PRIORITY
                  </span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">Action:</strong> {rec.actionText}
                </div>
                <div className="text-xs text-sky-800 dark:text-sky-300 font-mono bg-sky-50 dark:bg-sky-950/60 p-2.5 rounded-lg border border-sky-100 dark:border-sky-900/60">
                  <strong className="text-sky-900 dark:text-sky-200">Expected Impact:</strong> {rec.expectedImpact}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans font-medium italic border-t border-slate-100 dark:border-slate-800 pt-3 text-center">
            {explanation.disclaimer}
          </div>
        </div>

      </div>
    </Panel>
  );
};
