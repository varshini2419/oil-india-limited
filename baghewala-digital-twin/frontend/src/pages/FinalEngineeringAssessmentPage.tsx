import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  Gauge,
  CheckCircle2,
  Printer,
  FileText,
  Radio,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

import {
  executeFinalEngineeringAssessment,
  generateAssessmentReport,
} from '../simulation/finalEngineeringAssessment';
import type {
  FinalEngineeringAssessment,
  AssessmentReport,
} from '../simulation/finalEngineeringAssessment/types';
import { executeProductionPilotWorkflow } from '../simulation/productionPilot';

export const FinalEngineeringAssessmentPage: React.FC = () => {
  const [isRealTelemetryConnected, setIsRealTelemetryConnected] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [assessment, setAssessment] = useState<FinalEngineeringAssessment>(() => {
    const pilotState = executeProductionPilotWorkflow('SCENARIO_A_NORMAL', 0, false);
    return executeFinalEngineeringAssessment({
      pilotExecutionState: pilotState,
      isRealTelemetryConnected: false,
    });
  });

  const [report, setReport] = useState<AssessmentReport | null>(null);

  useEffect(() => {
    const pilotState = executeProductionPilotWorkflow('SCENARIO_A_NORMAL', 0, isRealTelemetryConnected);
    const updatedAssessment = executeFinalEngineeringAssessment({
      pilotExecutionState: pilotState,
      isRealTelemetryConnected,
    });
    setAssessment(updatedAssessment);
  }, [isRealTelemetryConnected]);

  const handleGenerateReport = () => {
    const rpt = generateAssessmentReport(assessment);
    setReport(rpt);
    setShowReportModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'DEMONSTRATION_SUPPORTED':
        return 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300';
      case 'CONTROLLED_PILOT_REQUIRED':
        return 'bg-sky-950/80 border-sky-700/80 text-sky-300';
      case 'FIELD_VALIDATION_REQUIRED':
      case 'ENGINEERING_REVIEW_REQUIRED':
      case 'PARTIAL':
      case 'WARNING':
        return 'bg-amber-950/80 border-amber-700/80 text-amber-300';
      case 'NOT_SUPPORTED_FOR_DEPLOYMENT':
      case 'FAIL':
      case 'CRITICAL':
        return 'bg-rose-950/80 border-rose-700/80 text-rose-300';
      default:
        return 'bg-slate-950 border-slate-800 text-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
              STEP 5.12 MODULE
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border font-mono ${
                isRealTelemetryConnected
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950/90 text-amber-300 border-amber-700'
              }`}
            >
              {assessment.dataProvenanceLabel}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-sky-400" />
            FINAL ENGINEERING ASSESSMENT & PERFORMANCE VALIDATION
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Integrated evaluation of Step 5.11 pilot results, physics model calibration, Monte Carlo uncertainty bounds, field readiness gates, and deployment evidence gaps.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsRealTelemetryConnected(!isRealTelemetryConnected)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-2 transition ${
              isRealTelemetryConnected
                ? 'bg-emerald-950 text-emerald-200 border-emerald-700 hover:bg-emerald-900'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isRealTelemetryConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            {isRealTelemetryConnected ? 'REAL TELEMETRY: CONNECTED' : 'REAL TELEMETRY: NOT CONNECTED'}
          </button>

          <button
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold border border-indigo-500 flex items-center gap-2 shadow-lg transition"
          >
            <Printer className="w-4 h-4" />
            Print Assessment Report
          </button>
        </div>
      </div>

      {/* Mandated Disclaimer & Executive Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            EXECUTIVE SUMMARY & MANDATED DISCLAIMER
          </h2>
          <span className="text-[11px] text-slate-500">ID: {assessment.assessmentId}</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-3 rounded-lg border border-slate-800">
          {assessment.executiveSummary}
        </p>

        <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200 leading-snug">
            <strong>MANDATED DISCLAIMER:</strong> {assessment.mandatedDisclaimer}
          </p>
        </div>
      </div>

      {/* Row 1: Deployment Status & Operational Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Panel 1: Deployment Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-400" />
                DEPLOYMENT STATUS
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Stage 5.12</span>
            </div>

            <div className="space-y-3">
              <div className={`p-3 rounded-lg border text-center font-bold text-sm tracking-wide ${getStatusBadge(assessment.deployment.status)}`}>
                {assessment.deployment.status.replace(/_/g, ' ')}
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">RATIONALE</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{assessment.deployment.statusReason}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">NEXT REQUIRED STAGE</span>
                <p className="text-sky-300 text-[11px] font-semibold">{assessment.deployment.requiredNextValidationStage}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
            <span>Supporting Evidence: <strong>{assessment.deployment.supportingEvidenceIds.length}</strong> items</span>
            <span>Missing Evidence: <strong>{assessment.deployment.missingEvidenceIds.length}</strong> items</span>
          </div>
        </div>

        {/* Panel 2: Model Validation & Calibration summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              MODEL ACCURACY & CALIBRATION
            </h2>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusBadge(assessment.modelValidation.status)}`}>
              {assessment.modelValidation.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500">Baseline MAE</span>
              <div className="text-sm font-bold text-amber-400">{assessment.modelValidation.baselineMae.toFixed(1)} cP</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500">Calibrated MAE</span>
              <div className="text-sm font-bold text-emerald-400">{assessment.modelValidation.calibratedMae.toFixed(1)} cP</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500">Error Reduction</span>
              <div className="text-sm font-bold text-sky-400">+{assessment.modelValidation.errorReductionPercent.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500">Appraisal Samples</span>
              <div className="text-sm font-bold text-slate-200">{assessment.modelValidation.sampleCount} tests</div>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Validation Coverage</span>
            <p className="text-[11px] text-slate-400">
              Heavy-oil log-linear thermal correlation calibrated using core measurements from Appraisal Well BW-01 across 40°C–180°C boundary.
            </p>
          </div>
        </div>

        {/* Panel 3: Monte Carlo Uncertainty Envelope */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              MONTE CARLO UNCERTAINTY (P10–P90)
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
              50 SAMPLES
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500">P10 Low</span>
              <div className="text-sm font-bold text-slate-300">{assessment.uncertainty.p10Bopd.toFixed(1)} BOPD</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500">P50 Mean</span>
              <div className="text-sm font-bold text-emerald-400">{assessment.uncertainty.p50Bopd.toFixed(1)} BOPD</div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500">P90 High</span>
              <div className="text-sm font-bold text-sky-400">{assessment.uncertainty.p90Bopd.toFixed(1)} BOPD</div>
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">80% Confidence Interval:</span>
              <strong className="text-amber-300">{assessment.uncertainty.intervalWidthBopd.toFixed(1)} BOPD</strong>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Support Level:</span>
              <strong className="text-emerald-300">{assessment.uncertainty.supportLevel}</strong>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 italic">
            * Probabilistic model spread derived from Latin Hypercube sampling across 12 reservoir parameters.
          </p>
        </div>
      </div>

      {/* Row 2: Pilot KPI Summary Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            STEP 5.11 PILOT KPI & PHYSICS PERFORMANCE
          </h2>
          <span className="text-xs text-slate-400">
            KPI Achievement: <strong className="text-emerald-400">{assessment.pilotPerformance.kpiAchievementCount}</strong> / {assessment.pilotPerformance.totalKPICount} Normal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {assessment.pilotPerformance.metrics.map((metric) => (
            <div key={metric.key} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{metric.label}</span>
                <div className="text-lg font-black text-white mt-1">
                  {metric.predicted !== undefined ? metric.predicted.toLocaleString() : 'N/A'} <span className="text-xs font-normal text-slate-400">{metric.unit}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between">
                <span className="text-slate-500 font-mono">{metric.provenance}</span>
                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${getStatusBadge(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Traceable Findings Registry */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            ENGINEERING TRACEABILITY FINDINGS REGISTRY ({assessment.findings.length})
          </h2>
          <span className="text-xs text-slate-400">Fully Traceable to Steps 4.3–5.11</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <th className="py-2.5 px-3">Finding ID</th>
                <th className="py-2.5 px-3">Traceable Finding Statement</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Source Steps</th>
                <th className="py-2.5 px-3">Evidence IDs</th>
                <th className="py-2.5 px-3">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {assessment.findings.map((f) => (
                <tr key={f.findingId} className="hover:bg-slate-850/50 transition">
                  <td className="py-2.5 px-3 font-mono text-sky-400 font-semibold">{f.findingId}</td>
                  <td className="py-2.5 px-3 text-slate-200">{f.statement}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(f.status)}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{f.sourceSteps.join(', ')}</td>
                  <td className="py-2.5 px-3 font-mono text-indigo-300">{f.evidenceIds.join(', ')}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">{f.provenance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Evidence Gaps & Required Field Validations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Evidence Gaps */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              IDENTIFIED EVIDENCE GAPS ({assessment.gaps.length})
            </h2>
            <span className="text-slate-500 text-[11px]">Required for Real Field Progression</span>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {assessment.gaps.map((gap) => (
              <div key={gap.gapId} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{gap.gapId}: {gap.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${gap.severity === 'HIGH' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800'}`}>
                    {gap.severity}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{gap.description}</p>
                <div className="text-sky-300 text-[11px] pt-1 border-t border-slate-900 mt-1">
                  <strong>Required Action:</strong> {gap.requiredAction}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Required Field Validations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              REQUIRED PHYSICAL FIELD VALIDATIONS ({assessment.requiredFieldValidations.length})
            </h2>
            <span className="text-slate-500 text-[11px]">Before Real Field Deployment</span>
          </div>

          <div className="space-y-2.5">
            {assessment.requiredFieldValidations.map((val, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && report && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">{report.title}</h2>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700"
              >
                Close Report
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 font-mono leading-relaxed">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div>Report ID: <strong className="text-sky-400">{report.reportId}</strong></div>
                <div>Generated At: <strong className="text-slate-200">{report.generatedAt}</strong></div>
                <div>Final Status: <strong className="text-emerald-400">{report.finalStatus}</strong></div>
              </div>

              {report.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2 border-b border-slate-800/80 pb-4">
                  <h3 className="text-sm font-bold text-white font-sans">{sec.title}</h3>
                  <pre className="whitespace-pre-wrap font-mono text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
                    {sec.content}
                  </pre>
                </div>
              ))}

              <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl text-[11px] text-amber-200">
                <strong>REPORT DISCLAIMER:</strong> {report.disclaimer}
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
