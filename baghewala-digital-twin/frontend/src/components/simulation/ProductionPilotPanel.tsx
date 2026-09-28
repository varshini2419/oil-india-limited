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
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-[10px] uppercase font-mono font-bold text-sky-700 bg-sky-100 border border-sky-200 dark:text-sky-300 dark:bg-sky-950/40 dark:border-sky-800 rounded-md shadow-sm tracking-wide">
              PHASE 6 — PRODUCTION PILOT
            </span>
            <span className="px-3 py-1 text-[10px] uppercase font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700 rounded-md shadow-sm tracking-wide">
              NON-ACTUATING DECISION SUPPORT
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-6 h-6 text-sky-500 animate-pulse" />
            Production Pilot & Real-Time Digital Twin Validation
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time telemetry ingestion, physics prediction comparison, and deterministic deviation detection.
          </p>
        </div>

        {/* Play / Pause / Step Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-sm">
            <button
              onClick={togglePlay}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isPlaying
                  ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/80 dark:hover:bg-amber-900/60'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/80 dark:hover:bg-emerald-900/60'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'PAUSE TELEMETRY' : 'PLAY TELEMETRY'}</span>
            </button>

            <button
              onClick={() => handleNextStep(selectedProfile)}
              disabled={isPlaying}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 disabled:opacity-50 transition-all shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
            >
              <SkipForward className="w-4 h-4" />
              <span>STEP</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-all dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              title="Reset Pilot State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Profile Selector & State Isolation Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-sm">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-500" /> Demo Telemetry Profile
          </label>
          <select
            value={selectedProfile}
            onChange={(e) => handleProfileChange(e.target.value as PilotSimulatorProfile)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-sm transition-all cursor-pointer"
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

        <div className="md:col-span-2 p-4 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
            <Info className="w-6 h-6 text-sky-500 flex-shrink-0" />
            <div className="leading-relaxed">
              <span className="font-bold text-slate-800 dark:text-slate-200">State Isolation Architecture: </span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operational Risk */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Real-Time Pilot Risk Level
            </div>
            <span
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider shadow-sm ${
                riskLevel === 'CRITICAL'
                  ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80'
                  : riskLevel === 'WARNING'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/80'
                  : riskLevel === 'WATCH'
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-400 dark:border-yellow-800/80'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/80'
              }`}
            >
              RISK: {riskLevel}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
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
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-500" /> Engineering Confidence
            </div>
            <span
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider shadow-sm ${
                confidence.level === 'HIGH'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/80'
                  : confidence.level === 'MODERATE'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/80'
                  : 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80'
              }`}
            >
              CONFIDENCE: {confidence.level} ({confidence.score}%)
            </span>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {confidence.supportingFactors.slice(0, 2).map((sf, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> <span className="leading-relaxed">{sf}</span>
              </div>
            ))}
            {confidence.riskWarnings.slice(0, 2).map((rw, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">⚠</span> <span className="leading-relaxed">{rw}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Non-Actuating Engineering Insight Callout */}
      <div className="p-5 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60 rounded-2xl space-y-3 shadow-sm">
        <div className="text-sm font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-2">
          <Info className="w-5 h-5" /> NON-ACTUATING ENGINEERING INSIGHT
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
          {lastComparison
            ? `Observed production is ${lastComparison.productionErrorPct}% (${lastComparison.actualProductionBOPD} BOPD) compared to current physics prediction (${lastComparison.predictedProductionBOPD} BOPD). ${
                lastDeviations.length > 0
                  ? `Active deviations classified as ${riskLevel}. Further observation recommended before scenario reassessment.`
                  : 'Operating state remains within validated physics envelope.'
              }`
            : 'Awaiting valid telemetry stream for engineering evaluation.'}
        </p>
        <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 font-mono italic">
          DISCLAIMER: Non-actuating engineering decision support. All values represent demonstration telemetry. No automated field or pump control.
        </div>
      </div>
    </section>
  );
};
