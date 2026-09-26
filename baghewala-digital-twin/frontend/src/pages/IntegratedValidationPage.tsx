import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import {
  Activity,
  Database,
  Sliders,
  AlertTriangle,
  GitBranch,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  BarChart3,
  Scale,
} from 'lucide-react';
import {
  executeIntegratedValidation,
  INTEGRATED_VALIDATION_DISCLAIMER,
  type IntegratedValidationState,
} from '../simulation/integratedValidation';
import {
  DATA_SOURCE_LABELS,
  type FieldDataSource,
} from '../simulation/fieldDataIntegration';
import { getActiveModelMode } from '../simulation/historicalCalibration/parameterRegistry';

export const IntegratedValidationPage: React.FC = () => {
  const [sourceType, setSourceType] = useState<FieldDataSource>('HISTORICAL');
  const [modelMode, setModelMode] = useState(getActiveModelMode());
  const [expandedTraceStage, setExpandedTraceStage] = useState<number | null>(1);

  const state: IntegratedValidationState = useMemo(() => {
    return executeIntegratedValidation({
      sourceType,
      modelMode,
    });
  }, [sourceType, modelMode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          title="Integrated Digital Twin Validation & Decision Support"
          subtitle="Traceable end-to-end operational workflow connecting Steps 4.3–5.6 into auditable validation and advisory guidance"
          badgeText="Step 5.7 Workflow"
        />

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">DATA:</span>
            <span className="font-bold text-white">{DATA_SOURCE_LABELS[sourceType]}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">MODEL:</span>
            <span className={`font-bold ${modelMode === 'CALIBRATED' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {modelMode}
            </span>
          </div>
        </div>
      </div>

      {/* Advisory & Non-Actuation Disclaimer */}
      <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed font-mono">
          <span className="font-bold text-amber-400 block mb-1 uppercase tracking-wider">
            Operational Decision Support Policy
          </span>
          {INTEGRATED_VALIDATION_DISCLAIMER}
        </div>
      </div>

      {/* Panel 1: System Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            System Integration & Validation Status
          </h3>
          <div className="flex items-center gap-2 font-mono text-xs">
            <label className="text-slate-400">Select Mode:</label>
            <select
              value={modelMode}
              onChange={(e) => setModelMode(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-bold focus:outline-none"
            >
              <option value="CALIBRATED">CALIBRATED</option>
              <option value="BASELINE">BASELINE</option>
            </select>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 font-bold focus:outline-none"
            >
              <option value="HISTORICAL">HISTORICAL DATA</option>
              <option value="REAL_FIELD">REAL FIELD DATA</option>
              <option value="SIMULATED">SIMULATED TELEMETRY</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs text-center">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px]">TWIN STATUS</div>
            <div className="text-emerald-400 font-bold mt-1 text-sm flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px]">DATA SOURCE</div>
            <div className="text-white font-bold mt-1 text-xs truncate">{sourceType}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px]">QUALITY SCORE</div>
            <div className="text-cyan-400 font-bold mt-1 text-sm">
              {state.qualityReport.qualityScore}/100
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px]">VALIDATION STATUS</div>
            <div
              className={`font-bold mt-1 text-xs ${
                state.validationResult.overallStatus === 'VALIDATED'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {state.validationResult.overallStatus}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px]">SYSTEM CONFIDENCE</div>
            <div
              className={`font-bold mt-1 text-sm ${
                state.confidenceResult.confidence === 'HIGH'
                  ? 'text-emerald-400'
                  : state.confidenceResult.confidence === 'MEDIUM'
                  ? 'text-cyan-400'
                  : 'text-amber-400'
              }`}
            >
              {state.confidenceResult.confidence}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px]">TRACE ID</div>
            <div className="text-slate-300 font-bold mt-1 text-[10px] truncate">
              {state.decisionTrace.traceId.slice(0, 14)}
            </div>
          </div>
        </div>
      </div>

      {/* Panel 2: Digital Twin State Readout */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Current Digital Twin Physics State
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Steps 4.3–4.9 Synchronized State
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs text-center">
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">TEMP</div>
            <div className="text-emerald-400 font-bold mt-1">{state.currentTwinState.reservoir.reservoirTemperatureC} °C</div>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">PRESSURE</div>
            <div className="text-blue-400 font-bold mt-1">{state.currentTwinState.reservoir.reservoirPressureBar} bar</div>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">VISCOSITY</div>
            <div className="text-purple-400 font-bold mt-1">{state.currentTwinState.reservoir.estimatedViscosityCp} cP</div>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">MOBILITY</div>
            <div className="text-amber-400 font-bold mt-1">{state.currentTwinState.reservoir.oilMobilityDcP} D/cP</div>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">PROD</div>
            <div className="text-cyan-400 font-bold mt-1">{state.currentTwinState.production.estimatedProductionBopd} BOPD</div>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">VFD / SPM</div>
            <div className="text-slate-200 font-bold mt-1">{state.currentTwinState.srp.vfdFrequencyHz} Hz / {state.currentTwinState.srp.spm} SPM</div>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">STEAM</div>
            <div className="text-indigo-400 font-bold mt-1">{state.currentTwinState.css.steamInjectionRateTpd} TPD</div>
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">AI RISK</div>
            <div className="text-rose-400 font-bold mt-1">{state.currentTwinState.risk.riskLevel}</div>
          </div>
        </div>
      </div>

      {/* Panel 3 & 4: Model Validation Table & Error Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Validation Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Observed vs Predicted Model Validation
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="p-2">Metric</th>
                  <th className="p-2">Observed</th>
                  <th className="p-2">Baseline</th>
                  <th className="p-2">Calibrated</th>
                  <th className="p-2">Abs Error</th>
                  <th className="p-2">% Error</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {state.validationResult.metricComparisons.map((c) => (
                  <tr key={c.metricKey} className="hover:bg-slate-800/50">
                    <td className="p-2 font-bold text-white">{c.metricLabel}</td>
                    <td className="p-2 text-cyan-300">
                      {c.observedValue !== undefined ? `${c.observedValue} ${c.unit}` : 'NOT_AVAILABLE'}
                    </td>
                    <td className="p-2 text-slate-400">{c.predictedBaselineValue ?? '-'} {c.unit}</td>
                    <td className="p-2 text-emerald-300 font-bold">{c.predictedCalibratedValue ?? '-'} {c.unit}</td>
                    <td className="p-2 text-slate-300">{c.absoluteError !== undefined ? `${c.absoluteError}` : '-'}</td>
                    <td className="p-2 text-purple-300">{c.percentageError !== undefined ? `${c.percentageError}%` : '-'}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'MATCH'
                            ? 'bg-emerald-950 text-emerald-400'
                            : c.status === 'DEVIATION'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Performance Comparison Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Baseline vs Calibrated Fit
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {state.validationResult.performanceSummary.map((s) => (
              <div key={s.metricKey} className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
                <div className="text-slate-300 font-bold border-b border-slate-800 pb-1">
                  {s.metricLabel}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Baseline MAE:</span>
                    <span className="text-slate-300 ml-1 font-bold">{s.maeBaseline}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Calibrated MAE:</span>
                    <span className="text-emerald-400 ml-1 font-bold">{s.maeCalibrated}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Error Reduction:</span>
                    <span className="text-cyan-400 ml-1 font-bold">+{s.errorReductionPercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Valid Samples:</span>
                    <span className="text-slate-300 ml-1">{s.sampleCount}</span>
                  </div>
                </div>
                {s.notes.length > 0 && (
                  <div className="text-[10px] text-amber-400/90 pt-1">
                    {s.notes.join(' ')}
                  </div>
                )}
              </div>
            ))}

            {state.validationResult.performanceSummary.length === 0 && (
              <div className="text-slate-400 text-center py-6 text-xs">
                No observed field data available to compute statistical MAE/RMSE metrics.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel 5 & 6: Uncertainty & Scenario Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Uncertainty Range */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Model Uncertainty Range (Step 5.3 Monte Carlo)
            </h3>
            <span className="text-xs font-mono text-cyan-300 font-bold">
              INTERVAL: {state.integratedDecision.uncertaintySummary.uncertaintyRating}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">P10 (OPTIMISTIC)</div>
              <div className="text-emerald-400 font-bold text-base mt-1">
                {state.uncertaintyStats.p10Bopd} BOPD
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">P50 (MEDIAN)</div>
              <div className="text-cyan-400 font-bold text-base mt-1">
                {state.uncertaintyStats.p50Bopd} BOPD
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">P90 (CONSERVATIVE)</div>
              <div className="text-amber-400 font-bold text-base mt-1">
                {state.uncertaintyStats.p90Bopd} BOPD
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center font-mono text-xs">
            <span className="text-slate-400">Mean Production: <strong className="text-white">{state.uncertaintyStats.meanBopd} BOPD</strong></span>
            <span className="text-slate-400">Std Dev: <strong className="text-white">{state.uncertaintyStats.stdDevBopd} BOPD</strong></span>
            <span className="text-slate-400">Width: <strong className="text-cyan-300">{state.integratedDecision.uncertaintySummary.uncertaintyWidthBopd} BOPD</strong></span>
          </div>
        </div>

        {/* Advisory Decision Support */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              Advisory Operational Recommendation
            </h3>
          </div>

          {state.integratedDecision.selectedScenario ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded-lg">
                <div className="text-emerald-300 font-bold text-sm">
                  {state.integratedDecision.selectedScenario.name}
                </div>
                <div className="text-slate-300 text-xs mt-1">
                  {state.integratedDecision.selectedScenario.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">OPTIMIZED PROD</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">
                    {state.integratedDecision.scenarioMetrics.optimizedProductionBopd} BOPD
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">SRP LOAD INDEX</div>
                  <div className="text-amber-400 font-bold text-sm mt-0.5">
                    {state.integratedDecision.scenarioMetrics.srpLoadIndexPercent}%
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                {state.integratedDecision.decisionReasons.map((r, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-amber-400 font-mono text-xs text-center py-6">
              No feasible scenario candidate satisfied all operational constraints without violating safety bounds.
            </div>
          )}
        </div>
      </div>

      {/* Panel 7: Auditable 8-Stage Decision Trace Vertical Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Auditable Causal Decision Trace (8 Stages)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Click any stage to expand full inputs/outputs
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {state.decisionTrace.stages.map((stage) => {
            const isExpanded = expandedTraceStage === stage.stageNumber;
            return (
              <div
                key={stage.stageNumber}
                className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedTraceStage(isExpanded ? null : stage.stageNumber)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-900/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                      {stage.stageNumber}
                    </span>
                    <div>
                      <span className="font-bold text-white text-xs block">{stage.stageName}</span>
                      <span className="text-[11px] text-slate-400">{stage.description}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        stage.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400'
                          : stage.status === 'WARNING'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {stage.status}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                    <div>
                      <div className="text-slate-400 font-bold mb-1 uppercase tracking-wider">Inputs Summary:</div>
                      <pre className="bg-slate-950 p-2 rounded border border-slate-800/60 text-slate-300 overflow-x-auto">
                        {JSON.stringify(stage.inputsSummary, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-slate-400 font-bold mb-1 uppercase tracking-wider">Outputs Summary:</div>
                      <pre className="bg-slate-950 p-2 rounded border border-slate-800/60 text-emerald-300 overflow-x-auto">
                        {JSON.stringify(stage.outputsSummary, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
