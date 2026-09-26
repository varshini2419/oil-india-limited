import React, { useState } from 'react';
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  Sliders,
  FileText,
  Clock,
  Radio,
  Lock,
  Zap,
} from 'lucide-react';
import type { TelemetryMode } from '../simulation/fieldIntegration/types';
import { executeFieldIntegration } from '../simulation/fieldIntegration/fieldIntegrationEngine';
import { generateIntegrationReport } from '../simulation/fieldIntegration/integrationReportEngine';

export const FieldIntegrationPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<TelemetryMode>('SIMULATED');
  const [realFieldConnected, setRealFieldConnected] = useState<boolean>(false);
  const [operatorApproved, setOperatorApproved] = useState<boolean>(false);
  const [forcePause, setForcePause] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Execute Field Integration Pipeline
  const integrationState = executeFieldIntegration({
    mode: selectedMode,
    realFieldConnected,
    operatorApproved,
    forcePilotPause: forcePause,
  });

  const report = generateIntegrationReport(integrationState);

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'LIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'STALE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'OFFLINE':
      default:
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  const getQualityColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ACCEPTED_WITH_WARNING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'REJECTED':
      default:
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  const getPilotGateColor = (status: string) => {
    switch (status) {
      case 'PILOT_READY':
      case 'PILOT_ACTIVE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ENGINEERING_REVIEW_REQUIRED':
      case 'PILOT_PAUSED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'NOT_CONNECTED':
      case 'DATA_NOT_READY':
      default:
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                  STEP 6.1 — REAL-WORLD FIELD INTEGRATION & CONTROLLED PILOT READINESS
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Baghewala Heavy-Oil Digital Twin • Real-Time Telemetry & Advisory Control Gate
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <FileText className="w-4 h-4" /> Export Pilot Report
            </button>
          </div>
        </div>

        {/* Mandatory Advisory-Only Safety Banner */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3 text-xs text-amber-300 font-mono">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>
            <strong>SAFETY GOVERNANCE MANDATE:</strong> {integrationState.mandatedDisclaimer}
          </span>
        </div>
      </div>

      {/* SECTION 1: CONNECTION STATUS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              1. Telemetry Connection Status
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Provenance:</span>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {integrationState.provenanceLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedMode('SIMULATED')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedMode === 'SIMULATED'
                ? 'bg-blue-600/15 border-blue-500 text-blue-200 ring-1 ring-blue-500/50'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">SIMULATED MODE</span>
              {selectedMode === 'SIMULATED' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-xs text-slate-400">
              Generates simulated physics stream from Step 4 baseline reservoir model.
            </p>
          </button>

          <button
            onClick={() => setSelectedMode('REPLAY')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedMode === 'REPLAY'
                ? 'bg-purple-600/15 border-purple-500 text-purple-200 ring-1 ring-purple-500/50'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">REPLAY MODE</span>
              {selectedMode === 'REPLAY' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-xs text-slate-400">
              Replays historical Baghewala appraisal well dataset records for validation.
            </p>
          </button>

          <button
            onClick={() => setSelectedMode('REAL_FIELD')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedMode === 'REAL_FIELD'
                ? 'bg-emerald-600/15 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">REAL FIELD MODE</span>
              {selectedMode === 'REAL_FIELD' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-xs text-slate-400">
              Connects to live physical SCADA field telemetry feed (requires authentication).
            </p>
          </button>
        </div>

        {/* Real Field Connection Toggle */}
        {selectedMode === 'REAL_FIELD' && (
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-slate-300">
                Physical SCADA Gateway Simulation Override:
              </span>
              <button
                onClick={() => setRealFieldConnected(!realFieldConnected)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                  realFieldConnected
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {realFieldConnected ? 'DISCONNECT PHYSICAL FEED' : 'CONNECT PHYSICAL FEED'}
              </button>
            </div>
            {!realFieldConnected && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 font-mono flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>STATUS: NOT_CONNECTED</strong> — No authenticated physical SCADA endpoint configured. System explicitly refuses to fabricate fake live connection data.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: TELEMETRY HEALTH & DATA QUALITY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Stream Freshness</span>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getFreshnessColor(
                integrationState.telemetryHealth.freshness
              )}`}
            >
              {integrationState.telemetryHealth.freshness}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Age: {integrationState.telemetryHealth.ageSeconds}s
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-2">
            Stale limit: 300s (Configured software threshold)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Quality Score</span>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {integrationState.qualityResult.qualityScore} / 100
            </span>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getQualityColor(
                integrationState.qualityResult.status
              )}`}
            >
              {integrationState.qualityResult.status}
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-2">
            Completeness: {integrationState.telemetryHealth.completenessPercent}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Missing Metrics</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {integrationState.telemetryHealth.missingMetrics.length === 0 ? (
              <span className="text-xs font-mono text-emerald-400">None (Full Sensor Coverage)</span>
            ) : (
              integrationState.telemetryHealth.missingMetrics.map((m) => (
                <span key={m} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-amber-300">
                  {m}: NOT_AVAILABLE
                </span>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Telemetry Stream Counters</span>
          <div className="mt-2 grid grid-cols-3 text-center font-mono">
            <div>
              <span className="text-xs text-emerald-400 font-bold">{integrationState.telemetryHealth.acceptedCount}</span>
              <p className="text-[10px] text-slate-400">Accepted</p>
            </div>
            <div>
              <span className="text-xs text-amber-400 font-bold">{integrationState.telemetryHealth.warningCount}</span>
              <p className="text-[10px] text-slate-400">Warnings</p>
            </div>
            <div>
              <span className="text-xs text-rose-400 font-bold">{integrationState.telemetryHealth.rejectedCount}</span>
              <p className="text-[10px] text-slate-400">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 & 4: FIELD DATA TABLE & DIGITAL TWIN STATE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Telemetry Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              3. Normalized Field Telemetry Record
            </h2>
          </div>

          {integrationState.latestTelemetry ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400">Well ID:</span> <strong className="text-slate-200">{integrationState.latestTelemetry.wellId}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Timestamp:</span> <span className="text-slate-300">{new Date(integrationState.latestTelemetry.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <span className="text-slate-400">Reservoir Temp:</span>
                  <p className="text-sm font-bold text-amber-400">
                    {integrationState.latestTelemetry.temperatureC !== null ? `${integrationState.latestTelemetry.temperatureC} °C` : 'NOT_AVAILABLE'}
                  </p>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <span className="text-slate-400">Reservoir Pressure:</span>
                  <p className="text-sm font-bold text-blue-400">
                    {integrationState.latestTelemetry.pressureBar !== null ? `${integrationState.latestTelemetry.pressureBar} bar` : 'NOT_AVAILABLE'}
                  </p>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <span className="text-slate-400">VFD Frequency:</span>
                  <p className="text-sm font-bold text-indigo-400">
                    {integrationState.latestTelemetry.vfdFrequencyHz !== null ? `${integrationState.latestTelemetry.vfdFrequencyHz} Hz` : 'NOT_AVAILABLE'}
                  </p>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <span className="text-slate-400">SRP SPM:</span>
                  <p className="text-sm font-bold text-purple-400">
                    {integrationState.latestTelemetry.spm !== null ? `${integrationState.latestTelemetry.spm} SPM` : 'NOT_AVAILABLE'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80 text-slate-500 font-mono text-xs">
              No field telemetry record available (Connection Status: NOT_CONNECTED)
            </div>
          )}
        </div>

        {/* Digital Twin State Estimation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              4. Digital Twin State (Existing Physics Pipeline)
            </h2>
          </div>

          {integrationState.twinState ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <span className="text-slate-400">Modeled Temp:</span>
                  <p className="text-sm font-bold text-emerald-400">
                    {integrationState.twinState.reservoir.reservoirTemperatureC.toFixed(1)} °C
                  </p>
                  <span className="text-[10px] text-slate-400">Provenance: {integrationState.twinState.metadata.provenance.source}</span>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <span className="text-slate-400">Oil Viscosity:</span>
                  <p className="text-sm font-bold text-purple-400">
                    {integrationState.twinState.reservoir.estimatedViscosityCp.toFixed(1)} cP
                  </p>
                  <span className="text-[10px] text-slate-400">Status: Calibrated</span>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <span className="text-slate-400">Oil Mobility:</span>
                  <p className="text-sm font-bold text-cyan-400">
                    {integrationState.twinState.reservoir.oilMobilityDcP.toFixed(5)} D/cP
                  </p>
                  <span className="text-[10px] text-slate-400">Step 4.5 Mobility Engine</span>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                  <span className="text-slate-400">Est Production:</span>
                  <p className="text-sm font-bold text-amber-400">
                    {integrationState.twinState.production.estimatedProductionBopd.toFixed(2)} BOPD
                  </p>
                  <span className="text-[10px] text-slate-400">Step 4.6 Production Engine</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/80 text-slate-500 font-mono text-xs">
              Physics state estimation blocked due to telemetry quality / connection status.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5 & 6: MODEL STATUS & CONTROLLED PILOT GATE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              5. Integrated Physics Model Status
            </h2>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
              <span className="text-slate-300">Baseline Physics Models (Steps 4.3–4.6)</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">AVAILABLE</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
              <span className="text-slate-300">Calibrated Parameter Model (Step 5.2)</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
              <span className="text-slate-300">Monte Carlo Uncertainty Engine (Step 5.3)</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">AVAILABLE</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
              <span className="text-slate-300">AI Risk & Advisory Engine (Step 4.9)</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">AVAILABLE</span>
            </div>
          </div>
        </div>

        {/* Controlled Pilot Gate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
                6. Controlled Pilot Gate
              </h2>
            </div>
            <span
              className={`px-3 py-1 rounded text-xs font-mono font-bold border ${getPilotGateColor(
                integrationState.pilotGate.status
              )}`}
            >
              {integrationState.pilotGate.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              {integrationState.pilotGate.conditions.telemetryConnected ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              Telemetry Connected
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {integrationState.pilotGate.conditions.acceptableQuality ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              Acceptable Data Quality
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {integrationState.pilotGate.conditions.modelReady ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              Model Pipeline Ready
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {integrationState.pilotGate.conditions.riskEngineAvailable ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              Risk Advisory Active
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {integrationState.pilotGate.conditions.advisoryOnlyConfirmed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              Advisory-Only Confirmed
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              {integrationState.pilotGate.conditions.operatorApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-amber-400" />}
              Operator Approval
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setOperatorApproved(!operatorApproved)}
              disabled={integrationState.pilotGate.status === 'NOT_CONNECTED'}
              className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all ${
                operatorApproved
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {operatorApproved ? 'REVOKE OPERATOR APPROVAL' : 'GRANT OPERATOR APPROVAL'}
            </button>

            <button
              onClick={() => setForcePause(!forcePause)}
              className={`px-3 py-2 rounded text-xs font-mono font-bold transition-all ${
                forcePause
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {forcePause ? 'RESUME PILOT' : 'PAUSE PILOT'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 7: ADVISORY PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              7. Real-Time Advisory Panel (Non-Actuating)
            </h2>
          </div>
          <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            ADVISORY ONLY — NO PHYSICAL ACTUATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-slate-400">Evaluated Risk Level:</span>
            <p className="text-lg font-bold text-amber-400 mt-1">
              {integrationState.advisorySummary.riskLevel}
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-slate-400">Risk Severity Score:</span>
            <p className="text-lg font-bold text-slate-200 mt-1">
              {integrationState.advisorySummary.riskScore} / 100
            </p>
          </div>

          <div className="md:col-span-2 p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <span className="text-slate-400 font-bold">AI Decision Support Recommendations:</span>
            <ul className="space-y-1 text-slate-300">
              {integrationState.advisorySummary.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 8: AUDIT TRAIL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
              8. Chronological Integration Audit Trail
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Event Count: {integrationState.auditTrail.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="p-2">Event ID</th>
                <th className="p-2">Timestamp</th>
                <th className="p-2">Source</th>
                <th className="p-2">Well ID</th>
                <th className="p-2">Quality</th>
                <th className="p-2">Model Mode</th>
                <th className="p-2">Pilot State</th>
                <th className="p-2">Advisory Status</th>
              </tr>
            </thead>
            <tbody>
              {integrationState.auditTrail.map((ev) => (
                <tr key={ev.eventId} className="border-b border-slate-800/50 hover:bg-slate-800/30 text-slate-300">
                  <td className="p-2 font-bold text-blue-400">{ev.eventId}</td>
                  <td className="p-2 text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</td>
                  <td className="p-2">{ev.source}</td>
                  <td className="p-2">{ev.wellId}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${getQualityColor(ev.inputQuality)}`}>
                      {ev.inputQuality}
                    </span>
                  </td>
                  <td className="p-2 text-slate-400">{ev.modelMode}</td>
                  <td className="p-2">{ev.pilotState}</td>
                  <td className="p-2 text-amber-400 font-bold">ADVISORY_ONLY</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 9: ENGINEERING LIMITATIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">
            9. Explicit Engineering Limitations & Provenance Boundaries
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
          {integrationState.limitations.map((lim, idx) => (
            <div key={idx} className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-lg flex items-start gap-2 text-slate-300">
              <span className="text-amber-400 font-bold">{idx + 1}.</span>
              <span>{lim}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase">{report.title}</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <p className="text-slate-400">Report ID: <span className="text-slate-200 font-bold">{report.reportId}</span></p>
              <p className="text-slate-400">Mode: <span className="text-slate-200 font-bold">{report.mode} ({report.provenanceLabel})</span></p>
              <p className="text-slate-400">Quality Score: <span className="text-emerald-400 font-bold">{report.dataQualityScore}/100 ({report.freshness})</span></p>
              <p className="text-slate-400">Controlled Pilot Status: <span className="text-amber-400 font-bold">{report.pilotStatus}</span></p>
              
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400 font-bold">Digital Twin State Summary:</span>
                <p className="text-slate-200 mt-1">{report.twinStateSummary}</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-slate-400 font-bold">Advisory Summary:</span>
                <p className="text-slate-200 mt-1">{report.advisorySummary}</p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300">
                <strong>Mandatory Governance Disclaimer:</strong> {report.disclaimer}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
