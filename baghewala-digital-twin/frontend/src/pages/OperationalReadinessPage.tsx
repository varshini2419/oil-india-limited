import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import {
  ShieldCheck,
  Database,
  AlertTriangle,
  GitBranch,
  Play,
  Clock,
  Info,
  Server,
} from 'lucide-react';
import {
  evaluateOperationalReadiness,
  runEndToEndDemonstration,
  READINESS_LEVEL_DESCRIPTIONS,
  type OperationalReadinessState,
  type DemonstrationResult,
  type ReadinessLevel,
} from '../simulation/operationalReadiness';
import { type FieldDataSource } from '../simulation/fieldDataIntegration';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const OperationalReadinessPage: React.FC = () => {
  useDocumentTitle({
    title: "Operational Readiness",
    description:
      "Pipeline health and operational readiness evaluation across all twin engines.",
  });
  const [sourceType, setSourceType] = useState<FieldDataSource>('HISTORICAL');
  const [isExecutingDemo, setIsExecutingDemo] = useState(false);
  const [demoOutput, setDemoOutput] = useState<DemonstrationResult | null>(null);

  const readinessState: OperationalReadinessState = useMemo(() => {
    return evaluateOperationalReadiness({ sourceType });
  }, [sourceType]);

  const activeDemo = demoOutput || readinessState.lastDemoResult;

  const handleRunDemonstration = () => {
    setIsExecutingDemo(true);
    setTimeout(() => {
      const res = runEndToEndDemonstration({ sourceType });
      setDemoOutput(res);
      setIsExecutingDemo(false);
    }, 600);
  };

  const getReadinessBadgeClass = (level: ReadinessLevel) => {
    switch (level) {
      case 'PILOT_VALIDATION_READY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'ENGINEERING_REVIEW_READY':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'DEMO_READY':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'NOT_READY':
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'READY':
      case 'CALIBRATED':
      case 'COMPLETED':
      case 'SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PASS</span>;
      case 'WARNING':
      case 'LIMITED':
      case 'UNCERTAIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">WARNING</span>;
      case 'FAIL':
      case 'INVALID':
      case 'FAILED':
      case 'NOT_READY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">FAIL</span>;
      case 'NOT_AVAILABLE':
      case 'INSUFFICIENT_DATA':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">NOT AVAILABLE</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="STEP 5.8 — OPERATIONAL READINESS & DEMONSTRATION WORKSPACE"
        subtitle="End-to-End Twin System Validation, Pipeline Audit & Controlled Demonstration Mode"
      />

      {/* TOP BANNER & DEMO CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase text-slate-400">System Readiness Status:</span>
              <span className={`px-3 py-1 rounded-md border font-mono font-bold text-xs ${getReadinessBadgeClass(readinessState.readinessLevel)}`}>
                {readinessState.readinessLevel.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              {READINESS_LEVEL_DESCRIPTIONS[readinessState.readinessLevel]}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as FieldDataSource)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="HISTORICAL">Historical Appraisal Data</option>
              <option value="USER_IMPORTED">Simulated Telemetry Feed</option>
              <option value="REAL_FIELD">Real Field Data (If Online)</option>
            </select>

            <button
              onClick={handleRunDemonstration}
              disabled={isExecutingDemo}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold px-4 py-2 rounded shadow transition disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isExecutingDemo ? 'animate-spin' : ''}`} />
              {isExecutingDemo ? 'Executing Demo...' : 'Run End-to-End Demonstration'}
            </button>
          </div>
        </div>
      </div>

      {/* GRID PANEL 1: SYSTEM HEALTH & DATA READINESS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1A: PIPELINE HEALTH */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h3 className="font-mono text-sm font-semibold text-slate-200">PIPELINE HEALTH EVALUATION (12 MODULES)</h3>
            </div>
            {getStatusBadge(readinessState.pipelineHealth.overallStatus)}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">PASSING</span>
              <p className="text-lg font-mono font-bold text-emerald-400">{readinessState.pipelineHealth.passCount}</p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">WARNINGS</span>
              <p className="text-lg font-mono font-bold text-amber-400">{readinessState.pipelineHealth.warningCount}</p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">FAILURES</span>
              <p className="text-lg font-mono font-bold text-rose-400">{readinessState.pipelineHealth.failCount}</p>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {readinessState.pipelineHealth.items.map((item) => (
              <div key={item.componentId} className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-200">{item.componentName}</span>
                    <span className="text-[10px] font-mono text-slate-500">[{item.stepReference}]</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.evidence}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 1B: DATA READINESS */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h3 className="font-mono text-sm font-semibold text-slate-200">DATA READINESS EVALUATION</h3>
            </div>
            {getStatusBadge(readinessState.dataReadiness.status)}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">QUALITY SCORE</span>
              <p className="text-lg font-mono font-bold text-cyan-400">{readinessState.dataReadiness.qualityScore} / 100</p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">COMPLETENESS</span>
              <p className="text-lg font-mono font-bold text-emerald-400">{readinessState.dataReadiness.completenessPercent}%</p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">MISSING METRICS</span>
              <p className="text-lg font-mono font-bold text-amber-400">{readinessState.dataReadiness.missingMetricsCount}</p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">OUTLIERS</span>
              <p className="text-lg font-mono font-bold text-rose-400">{readinessState.dataReadiness.outlierCount}</p>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-slate-400 font-semibold uppercase">PROVENANCE BREAKDOWN:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(readinessState.dataReadiness.provenanceSummary).map(([prov, count]) => (
                <div key={prov} className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-400">{prov}:</span>
                  <span className="font-semibold text-slate-200">{count} metric(s)</span>
                </div>
              ))}
            </div>
          </div>

          {readinessState.dataReadiness.warnings.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-800/50 rounded p-3 space-y-1">
              <span className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> DATA READINESS WARNINGS:
              </span>
              <ul className="list-disc list-inside text-xs text-amber-300/90 space-y-0.5">
                {readinessState.dataReadiness.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* PANEL 2: VISUAL DECISION PIPELINE FLOW */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono text-sm font-semibold text-slate-200">END-TO-END DECISION PIPELINE ARCHITECTURE</h3>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold">100% CONNECTED & DETERMINISTIC</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center font-mono text-xs">
          {[
            { step: 'FIELD DATA', detail: 'Ingestion & Normalization' },
            { step: 'QUALITY', detail: 'Schema & Outlier Check' },
            { step: 'PHYSICS', detail: 'Steps 4.3–4.8 Pipeline' },
            { step: 'CALIBRATION', detail: 'Parameter Calibration' },
            { step: 'UNCERTAINTY', detail: 'Monte Carlo Uncertainty' },
            { step: 'OPTIMIZATION', detail: 'Pareto Optimization' },
            { step: 'RISK', detail: 'AI Risk Advisory' },
            { step: 'DECISION', detail: 'Decision Audit Trace' },
          ].map((s, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded p-2.5 flex flex-col items-center justify-between h-20">
              <span className="text-[10px] font-bold text-cyan-400">0{idx + 1}. {s.step}</span>
              <p className="text-[9px] text-slate-400 mt-1">{s.detail}</p>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* PANEL 3: AUDIT TIMELINE LOG */}
      {activeDemo && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="font-mono text-sm font-semibold text-slate-200">DEMONSTRATION AUDIT TIMELINE (RUN: {activeDemo.auditTrail.auditId})</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">TELEMETRY TAG: <strong className="text-cyan-400">{activeDemo.telemetrySourceLabel}</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Stage</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Source & Provenance</th>
                  <th className="p-2.5">Model / Engine</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeDemo.auditTrail.events.map((e) => (
                  <tr key={e.eventId} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-cyan-400 font-bold">Stage {e.stageNumber}</td>
                    <td className="p-2.5 font-semibold text-slate-200">{e.stageName}</td>
                    <td className="p-2.5 text-slate-400">{e.inputSource} ({e.inputProvenance})</td>
                    <td className="p-2.5 text-slate-300 text-[11px]">{e.modelUsed}</td>
                    <td className="p-2.5">{getStatusBadge(e.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PANEL 4: SYSTEM LIMITATIONS & LEGAL DISCLAIMER */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Info className="w-5 h-5 text-amber-400" />
          <h3 className="font-mono text-sm font-semibold text-slate-200">OPERATIONAL LIMITATIONS & GOVERNANCE CAVEATS</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 font-semibold uppercase">EXPLICIT ENGINEERING LIMITATIONS:</span>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-mono">
              {readinessState.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-950/20 border border-amber-800/60 p-3 rounded space-y-2">
            <span className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> MANDATORY SAFETY & ADVISORY NOTICE:
            </span>
            <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
              {readinessState.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
