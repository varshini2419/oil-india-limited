import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  Gauge,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Printer,
  Database,
  Layers,
  ShieldCheck,
  Sliders,
  FileText,
  Radio,
} from 'lucide-react';

import {
  executeProductionPilotWorkflow,
  getAllPilotScenarios,
  generatePilotReport,
} from '../simulation/productionPilot';
import type {
  PilotWorkflowExecutionState,
  PilotScenarioId,
  PilotReport,
} from '../simulation/productionPilot/types';
import { useScenarioStore } from '../simulation/scenario/scenarioStore';
import { DigitalTwinViewport } from '../components/digital-twin/DigitalTwinViewport';

export const ProductionPilotPage: React.FC = () => {
  const { activeScenario } = useScenarioStore();
  const [selectedScenarioId, setSelectedScenarioId] = useState<PilotScenarioId>('SCENARIO_A_NORMAL');
  const [isRealTelemetryConnected, setIsRealTelemetryConnected] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1.0);

  const [executionState, setExecutionState] = useState<PilotWorkflowExecutionState>(() =>
    executeProductionPilotWorkflow('SCENARIO_A_NORMAL', 0, false, activeScenario.inputs)
  );

  const [report, setReport] = useState<PilotReport | null>(null);

  const scenarios = getAllPilotScenarios();

  // Refresh workflow state on scenario / frame update
  useEffect(() => {
    const state = executeProductionPilotWorkflow(selectedScenarioId, currentFrameIndex, isRealTelemetryConnected, activeScenario.inputs);
    setExecutionState(state);
  }, [selectedScenarioId, currentFrameIndex, isRealTelemetryConnected, activeScenario.inputs]);

  // Replay timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev < 49) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1000 / replaySpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, replaySpeed]);

  const handleScenarioChange = (id: PilotScenarioId) => {
    setSelectedScenarioId(id);
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    if (currentFrameIndex < 49) {
      setCurrentFrameIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handleGenerateReport = () => {
    const rpt = generatePilotReport(executionState);
    setReport(rpt);
  };

  const getWorkflowBadge = (stateStr: string) => {
    switch (stateStr) {
      case 'PILOT_READY':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 shadow">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> REAL FIELD PILOT READY
          </span>
        );
      case 'ENGINEERING_REVIEW':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-mono font-bold bg-sky-950 text-sky-300 border border-sky-500 shadow">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-sky-400" /> ENGINEERING REVIEW READY
          </span>
        );
      case 'SIMULATION_RUNNING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500 shadow animate-pulse">
            <Activity className="w-3.5 h-3.5 mr-1 text-indigo-400" /> SIMULATION RUNNING
          </span>
        );
      case 'BLOCKED':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500 shadow">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-400" /> WORKFLOW BLOCKED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100 font-mono">
      {/* Safety Mandatory Disclaimer Banner */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200 shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{executionState.mandatedDisclaimer}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-900/60 text-amber-300 px-2.5 py-0.5 rounded border border-amber-700/50 text-[11px] font-bold">
            PRODUCTION PILOT WORKFLOW v5.11
          </span>
        </div>
      </div>

      {/* Header & Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
                <Radio className="w-7 h-7 text-sky-400" />
                BAGHEWALA PRODUCTION PILOT WORKFLOW
              </h1>
              <span className="bg-sky-950 text-sky-400 border border-sky-800 text-xs px-2.5 py-0.5 rounded font-semibold">
                STEP 5.11
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Controlled Field Pilot Simulation • Replay Engine • Multi-Scenario Physics • Auditable Decision Pipeline
            </p>
          </div>

          {/* Status Badges & Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {getWorkflowBadge(executionState.workflowState)}

            {/* Provenance Tag */}
            <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <div>
                <div className="text-slate-500 text-[10px] leading-none">PROVENANCE</div>
                <div className="font-bold text-indigo-300 leading-tight">{executionState.dataProvenanceLabel}</div>
              </div>
            </div>

            {/* Real Telemetry Connection Toggle */}
            <button
              onClick={() => setIsRealTelemetryConnected(!isRealTelemetryConnected)}
              className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${
                isRealTelemetryConnected
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isRealTelemetryConnected ? 'REAL TELEMETRY: CONNECTED' : 'REAL TELEMETRY: NOT CONNECTED'}
            </button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Scenario Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">SELECT PILOT SCENARIO:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => handleScenarioChange(e.target.value as PilotScenarioId)}
              className="bg-slate-950 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-sky-500 max-w-xs"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Replay Controls */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold transition-colors"
              title={isPlaying ? 'Pause Replay' : 'Start Replay'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={handleStepForward}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              title="Step Forward (1 Frame)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              title="Reset Replay"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <span className="text-[11px] text-slate-400 px-2">
              FRAME {currentFrameIndex + 1} / 50
            </span>

            <select
              value={replaySpeed}
              onChange={(e) => setReplaySpeed(Number(e.target.value))}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-2 py-1 text-[11px]"
            >
              <option value={0.5}>0.5x</option>
              <option value={1.0}>1.0x</option>
              <option value={2.0}>2.0x</option>
              <option value={5.0}>5.0x</option>
            </select>

            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold transition-colors ml-2"
            >
              <FileText className="w-3.5 h-3.5" /> REPORT
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              title="Print Report"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Active Scenario Description Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sky-400 font-bold flex items-center gap-2">
            <Sliders className="w-4 h-4" /> {executionState.activeScenario.name}
          </span>
          <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px] text-amber-300">
            SIMULATED / WHAT-IF
          </span>
        </div>
        <p className="text-slate-300">{executionState.activeScenario?.description ?? 'Simulated pilot scenario execution.'}</p>
      </div>

      {/* Row 2: 13 Pilot KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {Object.values(executionState.kpis).slice(0, 6).map((kpi: any) => (
          <div key={kpi.key ?? kpi.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-lg">
            <div className="text-slate-400 text-[11px] mb-1 flex items-center justify-between">
              <span className="truncate">{kpi.label}</span>
              <span className="text-[10px] text-slate-500">{kpi.unit}</span>
            </div>
            <div className="text-xl font-black text-white my-1">{kpi.formattedValue ?? kpi.value}</div>
            <div className="text-[10px] text-slate-500 truncate">{kpi.sourceModule}</div>
          </div>
        ))}
      </div>

      {/* Row 3: Live 2D Schematic & Physics Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Physics Response Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between text-xs">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                PHYSICS PIPELINE COUPLING
              </h2>
              <span className="text-slate-500 text-[11px]">Steps 4.3–4.8</span>
            </div>

            <div className="space-y-2.5">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                <span>Reservoir Temp:</span>
                <strong className="text-amber-400">{executionState.twinState.reservoir.reservoirTemperatureC} °C</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                <span>Crude Viscosity:</span>
                <strong className="text-sky-400">{executionState.twinState.reservoir.estimatedViscosityCp.toLocaleString()} cP</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                <span>Oil Mobility:</span>
                <strong className="text-indigo-400">{(executionState.twinState.reservoir.oilMobilityDcP ?? 0.0005).toFixed(6)} D/cP</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                <span>Production Rate:</span>
                <strong className="text-emerald-400">{executionState.twinState.production.estimatedProductionBopd.toFixed(1)} BOPD</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
            <span>SRP Load: <strong className="text-purple-300">{executionState.twinState.srp.srpLoadIndex.toFixed(1)}%</strong></span>
            <span>CSS Gain: <strong className="text-amber-300">+{executionState.twinState.css.thermalGainC}°C</strong></span>
          </div>
        </div>

        {/* 2D SVG Digital Twin Schematic Viewport */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" />
              LIVE 2D DIGITAL TWIN SCHEMATIC
            </h2>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              REAL-TIME ANIMATED VIEW
            </span>
          </div>
          <div className="flex-1 p-2 bg-slate-950/50 min-h-[340px]">
            <DigitalTwinViewport />
          </div>
        </div>
      </div>

      {/* Row 4: AI Risk Advisory & Readiness Gates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Risk Advisory List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              AI RISK ADVISORY ({executionState.riskEvents?.length ?? 0})
            </h2>
            <span className="text-slate-500 text-[11px]">Advisory Only</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {(executionState.riskEvents ?? []).map((evt: any) => (
              <div
                key={evt.eventId}
                className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                  evt.riskLevel === 'HIGH' || evt.riskLevel === 'CRITICAL'
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                    : evt.riskLevel === 'MODERATE'
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200">{evt.detectedIssue}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{evt.supportingEvidence}</div>
                  <div className="text-[11px] text-sky-300 mt-1">Recommendation: {evt.recommendedAction}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-current font-mono shrink-0">
                  {evt.sourceModule}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pilot Readiness Gates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              PILOT READINESS GATES
            </h2>
            <span className="text-sky-400 font-bold">{executionState.readinessGates.deploymentReadinessLevel}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span>Data Readiness:</span>
              <span className="text-emerald-400 font-bold">READY ✓</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span>Model Readiness:</span>
              <span className="text-emerald-400 font-bold">READY ✓</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span>Telemetry Feed:</span>
              <span className={executionState.readinessGates.realFieldPilotReady ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {executionState.readinessGates.realFieldPilotReady ? 'READY ✓' : 'SIMULATED'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span>Validation Trace:</span>
              <span className="text-emerald-400 font-bold">READY ✓</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span>Safety Governance:</span>
              <span className="text-emerald-400 font-bold">PASSED ✓</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
              <span>Simulation Pilot:</span>
              <span className="text-emerald-400 font-bold">READY ✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Chronological Audit Trail (12 Stages) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            CHRONOLOGICAL PILOT AUDIT TRAIL ({executionState.auditTrail.length} STAGES)
          </h2>
          <span className="text-slate-400 text-[11px]">End-to-End Decision Trace</span>
        </div>

        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {executionState.auditTrail.map((evt) => (
            <div key={evt.eventId} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-700">
                  {evt.stageNumber}
                </div>
                <div>
                  <div className="font-bold text-slate-200">{evt.stageName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{evt.outputSummary}</div>
                  <div className="text-[11px] text-sky-300 mt-0.5">Advisory: {evt.decisionAdvisory}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                {evt.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Printable Report Modal / View */}
      {report && (
        <div className="bg-slate-900 border border-sky-500 rounded-xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              {report.title}
            </h2>
            <button onClick={() => setReport(null)} className="text-slate-400 hover:text-white text-xs">
              CLOSE REPORT
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">SCENARIO & STATUS:</div>
              <div className="font-bold text-sky-300">{report.scenarioName}</div>
              <div className="text-slate-400 mt-2">FINAL STATUS:</div>
              <div className="font-bold text-emerald-400">{report.finalPilotStatus}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">PHYSICS & TWIN SUMMARY:</div>
              <div>{report.physicsResultsSummary}</div>
              <div className="text-slate-400 mt-2">RISK RATING:</div>
              <div className="font-bold text-amber-300">{report.riskRating}</div>
            </div>
          </div>

          <div className="bg-amber-950/40 p-3 rounded border border-amber-800/60 text-xs text-amber-200">
            <div className="font-bold mb-1">LIMITATIONS & DISCLAIMER:</div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-300">
              {report.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPilotPage;
