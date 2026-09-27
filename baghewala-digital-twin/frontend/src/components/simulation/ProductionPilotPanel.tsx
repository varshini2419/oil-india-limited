import React, { useState, useEffect, useRef } from 'react';
import { useScenarioStore } from '../../simulation/scenario/scenarioStore';
import type { PilotState, PilotSimulatorProfile } from '../../simulation/productionPilot/types';
import { createInitialPilotState } from '../../simulation/productionPilot/pilotStateEngine';
import { executeSimulatorStep } from '../../simulation/productionPilot/pilotWorkflowEngine';
import { LiveWellStatusPanel } from './LiveWellStatusPanel';
import { ActualVsPredictedPanel } from './ActualVsPredictedPanel';
import { DeviationAlertsPanel } from './DeviationAlertsPanel';
import { Play, Pause, SkipForward, RotateCcw, Radio, Shield, AlertTriangle, Info, Cpu } from 'lucide-react';

export const ProductionPilotPanel: React.FC = () => {
  const { committedSimulationResult, activeScenario } = useScenarioStore();
  const committedScenarioInputs = (committedSimulationResult as any)?.scenarioInputs ?? (committedSimulationResult as any)?.inputs;
  const activeScenarioInputs = activeScenario?.inputs;

  const [pilotState, setPilotState] = useState<PilotState>(() =>
    createInitialPilotState('BGW-PILOT-01', 'NORMAL')
  );
  const [selectedProfile, setSelectedProfile] = useState<PilotSimulatorProfile>('NORMAL');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const intervalRef = useRef<number | null>(null);

  // Ingest step helper
  const handleNextStep = (profile: PilotSimulatorProfile = selectedProfile) => {
    const committedInputs = committedScenarioInputs ?? activeScenarioInputs;
    setPilotState((prevState) => {
      const result = executeSimulatorStep(prevState, profile, committedInputs);
      return result.updatedState;
    });
  };

  // Profile change handler
  const handleProfileChange = (newProfile: PilotSimulatorProfile) => {
    setSelectedProfile(newProfile);
    setPilotState((prev) => ({
      ...prev,
      currentProfile: newProfile,
    }));
    handleNextStep(newProfile);
  };

  // Play / Pause toggle
  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      setPilotState((ps) => ({
        ...ps,
        status: next ? 'LIVE' : 'PAUSED',
      }));
      return next;
    });
  };

  // Reset helper
  const handleReset = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const initial = createInitialPilotState('BGW-PILOT-01', selectedProfile);
    setPilotState(initial);
  };

  // Timer loop for PLAY mode
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        handleNextStep(selectedProfile);
      }, 3000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, selectedProfile, committedSimulationResult]);

  const riskLevel = pilotState.riskLevel;
  const confidence = pilotState.confidence;
  const lastComparison = pilotState.lastComparison;
  const lastDeviations = pilotState.activeDeviations;

  return (
    <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded">
              PHASE 6 — PRODUCTION PILOT
            </span>
            <span className="px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded">
              NON-ACTUATING DECISION SUPPORT
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            Production Pilot & Real-Time Digital Twin Validation
          </h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry ingestion, physics prediction comparison, and deterministic deviation detection.
          </p>
        </div>

        {/* Play / Pause / Step Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1.5">
            <button
              onClick={togglePlay}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'PAUSE TELEMETRY' : 'PLAY TELEMETRY'}</span>
            </button>

            <button
              onClick={() => handleNextStep(selectedProfile)}
              disabled={isPlaying}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition-all"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>STEP</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all"
              title="Reset Pilot State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Profile Selector & State Isolation Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Demo Telemetry Profile
          </label>
          <select
            value={selectedProfile}
            onChange={(e) => handleProfileChange(e.target.value as PilotSimulatorProfile)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="NORMAL">NORMAL — Nominal Telemetry</option>
            <option value="PRODUCTION_DECLINE">PRODUCTION DECLINE — Decreasing Output</option>
            <option value="PRESSURE_DROP">PRESSURE DROP — Accelerated Drawdown</option>
            <option value="THERMAL_RESPONSE_FAILURE">THERMAL FAILURE — Insufficient Heat Gain</option>
            <option value="HIGH_WATER_CUT">HIGH WATER CUT — Water Breakthrough</option>
            <option value="STEAM_RESPONSE">STEAM RESPONSE — Peak Cyclic Response</option>
            <option value="SENSOR_ANOMALY">SENSOR ANOMALY — Invalid Telemetry (NaN)</option>
          </select>
        </div>

        <div className="md:col-span-2 p-3 bg-blue-950/20 border border-blue-800/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-blue-300">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-200">State Isolation Architecture: </span>
              PLAY/PAUSE animates pilot telemetry into an isolated state. RUN SIMULATION remains the sole mechanism that commits new physics scenarios to ScenarioStore.
            </div>
          </div>
        </div>
      </div>

      {/* 1. Live Well Telemetry Panel */}
      <LiveWellStatusPanel pilotState={pilotState} />

      {/* 2. Actual vs Predicted Panel */}
      <ActualVsPredictedPanel pilotState={pilotState} />

      {/* 3. Deviation Alerts Panel */}
      <DeviationAlertsPanel alerts={lastDeviations} />

      {/* 4. Risk & Confidence Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Operational Risk */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Real-Time Pilot Risk Level
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono uppercase ${
                riskLevel === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : riskLevel === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : riskLevel === 'WATCH'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              RISK: {riskLevel}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {riskLevel === 'CRITICAL'
              ? 'Critical physical deviation or telemetry failure active. Immediate engineering review recommended.'
              : riskLevel === 'WARNING'
              ? 'Multiple warning deviations active. Monitoring trajectory prior to scenario re-evaluation.'
              : riskLevel === 'WATCH'
              ? 'Single physical deviation active. Operating under observation.'
              : 'All real-time parameters operating within safe physical envelope.'}
          </p>
        </div>

        {/* Engineering Confidence */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" /> Engineering Confidence
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono uppercase ${
                confidence.level === 'HIGH'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : confidence.level === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              CONFIDENCE: {confidence.level} ({confidence.score}%)
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            {confidence.supportingFactors.slice(0, 2).map((sf, idx) => (
              <div key={idx} className="flex items-center gap-1 text-emerald-400">
                <span>✓</span> <span>{sf}</span>
              </div>
            ))}
            {confidence.riskWarnings.slice(0, 2).map((rw, idx) => (
              <div key={idx} className="flex items-center gap-1 text-amber-400">
                <span>⚠</span> <span>{rw}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Non-Actuating Engineering Insight Callout */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" /> NON-ACTUATING ENGINEERING INSIGHT
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          {lastComparison
            ? `Observed production is ${lastComparison.productionErrorPct}% (${lastComparison.actualProductionBOPD} BOPD) compared to current physics prediction (${lastComparison.predictedProductionBOPD} BOPD). ${
                lastDeviations.length > 0
                  ? `Active deviations classified as ${riskLevel}. Further observation recommended before scenario reassessment.`
                  : 'Operating state remains within validated physics envelope.'
              }`
            : 'Awaiting valid telemetry stream for engineering evaluation.'}
        </p>
        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
          DISCLAIMER: Non-actuating engineering decision support. All values represent demonstration telemetry. No automated field or pump control.
        </div>
      </div>
    </section>
  );
};
