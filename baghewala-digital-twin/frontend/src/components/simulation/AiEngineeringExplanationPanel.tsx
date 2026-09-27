import React, { useMemo } from 'react';
import { Panel } from '../ui/Panel';
import { useScenarioStore } from '../../simulation/scenario';
import { generateAiExplanation } from '../../simulation/aiExplanationEngine';
import { getLatestHistoricalIncidentState } from './SimulationHistoricalIncidents';
import {
  HelpCircle,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Zap,
  BookOpen,
  FileText
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
      title="AI Engineering Explanation & Advisory Recommendations"
      subtitle="Dynamic 5-section physical causal chain, parameter transitions, grounded historical evidence & advisory recommendations"
      action={
        <div className="flex items-center gap-2 font-mono text-[10px] text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded border border-sky-800">
          <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>MODELED SIMULATION DRIVEN</span>
        </div>
      }
    >
      <div className="space-y-5 font-mono text-xs">
        {/* SECTION 1: WHY THIS HAPPENED */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>1. WHY THIS HAPPENED (PHYSICAL CAUSAL CHAIN)</span>
          </div>
          <p className="text-slate-200 font-sans text-xs leading-relaxed">
            {explanation.whyThisHappened}
          </p>
        </div>

        {/* SECTION 2 & 3 GRID: WHAT CHANGED & GROUNDED HISTORICAL EVIDENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SECTION 2: WHAT CHANGED (NUMERICAL TRANSITIONS) */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>2. WHAT CHANGED (BASELINE vs CURRENT)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">TRANSITION TABLE</span>
            </div>

            <div className="space-y-2">
              {/* Reservoir Temp */}
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-850 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Reservoir Temperature:</span>
                  <span className="text-slate-100 font-bold font-mono">
                    {transitions.reservoirTemperature.formattedTransition}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-rose-400 font-bold block">
                    {transitions.reservoirTemperature.deltaText}
                  </span>
                </div>
              </div>

              {/* Viscosity */}
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-850 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Crude Viscosity:</span>
                  <span className="text-slate-100 font-bold font-mono">
                    {transitions.viscosity.formattedTransition}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-purple-400 font-bold block">
                    {transitions.viscosity.deltaText}
                  </span>
                </div>
              </div>

              {/* Mobility */}
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-850 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Fluid Mobility (k/μ):</span>
                  <span className="text-slate-100 font-bold font-mono">
                    {transitions.mobility.formattedTransition}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold block">
                    {transitions.mobility.deltaText}
                  </span>
                </div>
              </div>

              {/* Estimated Production */}
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-850 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Production:</span>
                  <span className="text-slate-100 font-bold font-mono">
                    {transitions.production.formattedTransition}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sky-300 font-bold block">
                    {transitions.production.deltaText}
                  </span>
                </div>
              </div>

              {/* SRP Load Index */}
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-850 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">SRP Operating Load Index:</span>
                  <span className="text-slate-100 font-bold font-mono">
                    {transitions.srpLoadIndex.formattedTransition}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className={`font-bold block ${transitions.srpLoadIndex.isFavorable ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {transitions.srpLoadIndex.deltaText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: GROUNDED HISTORICAL EVIDENCE (RAG INTEGRATION) */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>3. GROUNDED HISTORICAL EVIDENCE (RAG INTEGRATION)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">FIELD BENCHMARKS</span>
            </div>

            {groundedEvidence.length > 0 ? (
              <div className="space-y-2">
                {groundedEvidence.slice(0, 3).map((item) => {
                  const title = item.title;
                  const desc = 'documentedEvidence' in item ? item.documentedEvidence.description : (item as { description: string }).description;
                  const sourceStr = 'provenance' in item ? item.provenance.document : ((item as { source?: string }).source || 'Baghewala Knowledge Base');
                  const matchExplanation = 'currentMatch' in item ? item.currentMatch.explanation : null;

                  return (
                    <div key={item.id} className="p-2.5 bg-slate-900/90 rounded border border-slate-800 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span className="truncate max-w-[280px]">{title}</span>
                        <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800 shrink-0 font-mono">
                          HISTORICAL EVIDENCE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2">
                        {desc}
                      </p>
                      {matchExplanation && (
                        <div className="text-[10px] text-sky-300 font-mono bg-sky-950/40 p-1.5 rounded border border-sky-900/40">
                          <strong>Why Relevant:</strong> {matchExplanation}
                        </div>
                      )}
                      <div className="text-[9px] text-slate-500 font-mono pt-0.5 flex items-center justify-between">
                        <span>Source: {sourceStr}</span>
                        <span className="text-amber-400/90 font-bold">HISTORICAL EVIDENCE — NOT A PREDICTION</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Historical evidence initialized from embedded Baghewala knowledge base.</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: RISK / CONSTRAINT */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>4. RISK / OPERATIONAL CONSTRAINTS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">System Risk Status:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                riskLevel === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                riskLevel === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                riskLevel === 'MODERATE' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {riskLevel} RISK ({explanation.riskAndConstraints.riskScore}/100)
              </span>
            </div>
          </div>

          {constraints.length > 0 ? (
            <div className="space-y-2">
              {constraints.map((c) => (
                <div key={c.id} className="p-3 bg-slate-900 rounded border border-amber-900/60 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{c.title}</span>
                    </span>
                    <span className="text-[10px] text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                      {c.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {c.explanation}
                  </p>
                  <div className="text-[10px] text-amber-300/90 font-mono bg-amber-950/40 p-2 rounded border border-amber-900/40">
                    <strong>Constraint:</strong> {c.constraintDescription}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono bg-amber-950/70 p-2 rounded border border-amber-800/80 font-bold">
                    {c.advisoryWarning}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded flex items-center gap-2 text-emerald-300 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>✓ All operational parameters operate safely within documented thermal, hydraulic, and mechanical bounds.</span>
            </div>
          )}
        </div>

        {/* SECTION 5: RECOMMENDED ADVISORY ACTION */}
        <div className="bg-slate-950 p-4 rounded-lg border border-sky-900/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>5. RECOMMENDED ADVISORY ACTION (DECISION SUPPORT ONLY)</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              0 AUTOMATIC ACTUATION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {explanation.recommendedAdvisoryActions.map((rec) => (
              <div key={rec.id} className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                  <span className="flex items-center gap-1.5">
                    {rec.targetModule === 'SRP' ? <Zap className="w-3.5 h-3.5 text-emerald-400" /> : <Sliders className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{rec.title}</span>
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    rec.priority === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {rec.priority} PRIORITY
                  </span>
                </div>
                <div className="text-[11px] text-slate-200 font-sans">
                  <strong>Action:</strong> {rec.actionText}
                </div>
                <div className="text-[10px] text-sky-300 font-mono bg-sky-950/60 p-2 rounded border border-sky-900/60">
                  <strong>Expected Impact:</strong> {rec.expectedImpact}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 font-sans italic border-t border-slate-900 pt-2 text-center">
            {explanation.disclaimer}
          </div>
        </div>
      </div>
    </Panel>
  );
};
