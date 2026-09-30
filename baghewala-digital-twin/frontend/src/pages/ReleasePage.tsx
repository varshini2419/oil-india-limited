import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Lock,
  Sliders,
  Radio,
  Award,
} from 'lucide-react';
import type { ProductionAppMode } from '../release/types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  executeReleaseVerification,
  generateDemonstrationScenarios,
  getEnvironmentConfig,
  evaluateReleaseChecklist,
} from '../release';

export const ReleasePage: React.FC = () => {
  useDocumentTitle({
    title: 'Release Verification',
    description:
      'Release manifest, deterministic demonstration scenarios and advisory-only governance verification for the Baghewala digital twin.',
  });
  const [appMode, setAppMode] = useState<ProductionAppMode>('DEMONSTRATION');
  const [selectedDemoId, setSelectedDemoId] = useState<string>('SCENARIO_A_NORMAL');
  const [showFreezeModal, setShowFreezeModal] = useState<boolean>(false);

  const verification = executeReleaseVerification(appMode);
  const demoScenarios = generateDemonstrationScenarios();
  const envConfig = getEnvironmentConfig(appMode);
  const checklistItems = evaluateReleaseChecklist();

  const activeDemoScenario = demoScenarios.find((s) => s.id === selectedDemoId) || demoScenarios[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                  PRODUCTION DEPLOYMENT & RELEASE VERIFICATION
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Baghewala Heavy-Oil Digital Twin • Productionization, Demonstration & Release Verification
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border flex items-center gap-2 ${
              verification.isReleaseReady
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {verification.isReleaseReady ? <Lock className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {verification.isReleaseReady ? 'SYSTEM FROZEN & VERIFIED' : 'RELEASE BLOCKED — NOT FROZEN'}
            </span>
            <button
              onClick={() => setShowFreezeModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <FileText className="w-4 h-4" /> {verification.isReleaseReady ? 'View Freeze Record' : 'View Release Blockers'}
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 1: RELEASE MANIFEST SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Release Version</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold font-mono text-emerald-400">
              {verification.manifest.version}
            </span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-300">
              {verification.manifest.releaseId}
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-2">
            Generated from the live release verification run
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Release Checklist</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {verification.checklistPassedCount} / {verification.checklistTotalCount}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
              verification.isReleaseReady
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {verification.isReleaseReady ? 'ALL GATES PASS' : `${verification.checklistTotalCount - verification.checklistPassedCount} BLOCKERS`}
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-2">
            Deterministic checks evaluated live on this page
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Governance</span>
          <div className="mt-2 space-y-1 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Advisory Mode:</span>
                <span className="text-emerald-400 font-bold">{verification.manifest.safetyGovernanceStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Real Field:</span>
                <span className="text-rose-300 font-bold">{verification.manifest.realFieldConnectivityStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Routes:</span>
                <span className="text-slate-200 font-bold">{verification.manifest.registeredRoutesCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">SCADA Connectivity</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-rose-400">
              DISCONNECTED
            </span>
            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded text-[10px] font-mono border border-rose-500/30">
              UNCONFIGURED
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-2">
            Real physical SCADA stream unconfigured; SIMULATED & REPLAY active.
          </p>
        </div>
      </div>

      {/* SECTION 2: PRODUCTION ENVIRONMENT SELECTOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              2. Production Environment Strategy
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Current Environment: <strong className="text-blue-400">{appMode}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs">
          {(['DEVELOPMENT', 'DEMONSTRATION', 'REPLAY', 'PILOT', 'PRODUCTION'] as ProductionAppMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setAppMode(mode)}
              className={`p-3 rounded-lg border text-center transition-all ${
                appMode === mode
                  ? 'bg-blue-600/20 border-blue-500 text-blue-200 ring-1 ring-blue-500/50 font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl font-mono text-xs space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-300">
            <div>
              <span className="text-slate-400">API Gateway:</span>
              <p className="font-bold text-blue-400 mt-0.5">{envConfig.apiBaseUrl}</p>
            </div>
            <div>
              <span className="text-slate-400">SCADA Endpoint:</span>
              <p className="font-bold text-indigo-400 mt-0.5">{envConfig.scadaEndpointUrl}</p>
            </div>
            <div>
              <span className="text-slate-400">Stale Telemetry Limit:</span>
              <p className="font-bold text-amber-400 mt-0.5">{envConfig.featureFlags.telemetryStaleThresholdSeconds}s</p>
            </div>
            <div>
              <span className="text-slate-400">Governance Mode:</span>
              <p className="font-bold text-emerald-400 mt-0.5">Strict Advisory Only</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DETERMINISTIC DEMONSTRATION SCENARIOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              3. Deterministic Demonstration Scenarios
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            SIMULATED DEMONSTRATION SCENARIOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
          {demoScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedDemoId(scenario.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedDemoId === scenario.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50 font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] text-indigo-400 uppercase font-bold block mb-1">
                {scenario.category}
              </span>
              <h4 className="text-xs font-bold text-slate-200">{scenario.title}</h4>
            </button>
          ))}
        </div>

        {/* Selected Scenario Inspector */}
        <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">{activeDemoScenario.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{activeDemoScenario.description}</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-xs font-bold">
              {activeDemoScenario.category}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-slate-400">Modeled Reservoir Temp:</span>
              <p className="text-sm font-bold text-amber-400 mt-1">
                {activeDemoScenario.expectedResults.modeledTemperatureC} °C
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-slate-400">Estimated Crude Viscosity:</span>
              <p className="text-sm font-bold text-purple-400 mt-1">
                {activeDemoScenario.expectedResults.estimatedViscosityCp.toLocaleString()} cP
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-slate-400">Oil Mobility:</span>
              <p className="text-sm font-bold text-cyan-400 mt-1">
                {activeDemoScenario.expectedResults.oilMobilityDcP} D/cP
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-slate-400">Estimated Production:</span>
              <p className="text-sm font-bold text-emerald-400 mt-1">
                {activeDemoScenario.expectedResults.estimatedProductionBopd} BOPD
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
            <span className="text-slate-400 font-bold">Decision Support Summary:</span>
            <p className="text-slate-200 mt-1">{activeDemoScenario.decisionSupportSummary}</p>
          </div>
        </div>
      </div>

      {/* SECTION 4: 20-ITEM RELEASE CHECKLIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              4. Production Release Readiness Checklist
            </h2>
          </div>
          <span className={`text-xs font-mono font-bold ${verification.isReleaseReady ? 'text-emerald-400' : 'text-rose-300'}`}>
            {verification.checklistPassedCount} / {verification.checklistTotalCount} CHECKS PASSED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {checklistItems.map((item) => (
            <div key={item.checkId} className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-lg flex items-start gap-3">
              {item.passed
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                : <AlertTriangle className="w-4 h-4 text-rose-300 flex-shrink-0 mt-0.5" />}
              <div>
                <span className="font-bold text-slate-200">{item.checkId} — {item.category}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">{item.description}</p>
                <span className={`text-[10px] italic block mt-1 ${item.passed ? 'text-emerald-400/90' : 'text-rose-300/90'}`}>Evidence: {item.evidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: FINAL FREEZE CERTIFICATE MODAL */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase">
                  {verification.isReleaseReady ? 'OFFICIAL FINAL SOFTWARE FREEZE CERTIFICATE' : 'RELEASE GATE REVIEW — NOT FROZEN'}
                </h3>
              </div>
              <button
                onClick={() => setShowFreezeModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-slate-400">Freeze ID: <span className="text-slate-200 font-bold">{verification.freezeRecord.freezeId}</span></p>
              <p className="text-slate-400">Timestamp: <span className="text-slate-200 font-bold">{new Date(verification.freezeRecord.timestamp).toUTCString()}</span></p>
              <p className="text-slate-400">Authorized Role: <span className="text-emerald-400 font-bold">{verification.freezeRecord.authorizedRole}</span></p>

              <div className={`p-4 bg-slate-950 rounded-lg ${verification.isReleaseReady ? 'border border-emerald-500/30 text-emerald-300' : 'border border-rose-500/30 text-rose-300'}`}>
                <strong>{verification.isReleaseReady ? 'Formal Freeze Statement:' : 'Release Status:'}</strong>
                <p className="mt-1">{verification.freezeRecord.freezeStatement}</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-slate-400">
                <p>• Release Checklist: <strong className={verification.isReleaseReady ? 'text-emerald-400' : 'text-rose-300'}>{verification.checklistPassedCount} / {verification.checklistTotalCount} passed</strong></p>
                <p>• Real-Field Connectivity: <strong className="text-rose-300">{verification.manifest.realFieldConnectivityStatus}</strong></p>
              </div>

              {verification.blockers.length > 0 && (
                <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg space-y-1 text-rose-200">
                  <strong>Blocking checks</strong>
                  {verification.blockers.map((blocker) => <p key={blocker}>{blocker}</p>)}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowFreezeModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
