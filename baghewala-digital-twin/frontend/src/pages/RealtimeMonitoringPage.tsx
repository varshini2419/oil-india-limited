import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  ShieldAlert,
  Flame,
  Droplet,
  Zap,
  Sliders,
  HelpCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { TelemetrySimulator } from '../simulation/realtimeMonitoring/telemetrySimulator';
import { evaluateAlerts } from '../simulation/realtimeMonitoring/alertEngine';
import { WhatIfSimulationPanel } from '../components/realtimeMonitoring/WhatIfSimulationPanel';
import type { DigitalTwinState, AlertItem, TimelineEvent } from '../simulation/realtimeMonitoring/types';
import type { ModelMode } from '../simulation/historicalCalibration';
import { REALTIME_DISCLAIMER } from '../simulation/realtimeMonitoring/defaults';

import { useScenarioStore } from '../simulation/scenario/scenarioStore';

export const RealtimeMonitoringPage: React.FC = () => {
  const { activeScenario } = useScenarioStore();
  const [modelMode, setModelMode] = useState<ModelMode>('CALIBRATED');
  const simulatorRef = useRef<TelemetrySimulator | null>(null);

  const [currentState, setCurrentState] = useState<DigitalTwinState>(() => {
    const sim = new TelemetrySimulator({ seed: 42, modelMode: 'CALIBRATED', baseInputs: activeScenario.inputs });
    simulatorRef.current = sim;
    return sim.getCurrentState();
  });

  const [simStatus, setSimStatus] = useState<'STOPPED' | 'RUNNING' | 'PAUSED'>('STOPPED');
  const [history, setHistory] = useState<DigitalTwinState[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);
  const [eventTimeline, setEventTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (simulatorRef.current) {
      simulatorRef.current.setBaseInputs(activeScenario.inputs);
    }
  }, [activeScenario.inputs]);

  useEffect(() => {
    const sim = simulatorRef.current;
    if (!sim) return;

    const unsubscribe = sim.subscribe((newState) => {
      setCurrentState(newState);
      setSimStatus(sim.getSimulatorState());

      // Evaluate Alerts & Timeline
      const alertEval = evaluateAlerts(newState);
      setActiveAlerts(alertEval.alerts);

      setHistory((prev) => [...prev, newState].slice(-30));
      setEventTimeline((prev) => [...alertEval.events, ...prev].slice(0, 25));
    });

    return () => {
      unsubscribe();
      sim.destroy();
    };
  }, []);

  const handleStart = () => {
    simulatorRef.current?.start(2000);
    setSimStatus('RUNNING');
  };

  const handlePause = () => {
    simulatorRef.current?.pause();
    setSimStatus('PAUSED');
  };

  const handleReset = () => {
    simulatorRef.current?.reset();
    setSimStatus('STOPPED');
    setHistory([]);
  };

  const handleStepForward = () => {
    simulatorRef.current?.stepForward();
  };

  const handleModelModeToggle = (mode: ModelMode) => {
    setModelMode(mode);
    simulatorRef.current?.setModelMode(mode);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                STEP 5.5 — REAL-TIME DIGITAL TWIN MONITORING & WHAT-IF SIMULATION
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulated Telemetry Streams, State Estimation & Interactive What-If Scenario Physics Engine
              </p>
            </div>
          </div>

          {/* Telemetry Simulator Playback Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1">
              {simStatus !== 'RUNNING' ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>START</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>PAUSE</span>
                </button>
              )}

              <button
                onClick={handleStepForward}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors border border-slate-700 cursor-pointer"
                title="Step forward single tick"
              >
                <StepForward className="w-3.5 h-3.5" />
                <span>STEP</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-emerald-400">SIMULATED TELEMETRY: {simStatus}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-4 p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-lg flex items-start gap-3 text-xs text-cyan-300 font-mono">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>{REALTIME_DISCLAIMER}</p>
        </div>
      </div>

      {/* Model Mode Toggle & Quick Metrics Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-bold uppercase tracking-wider">ACTIVE SIMULATION MODEL MODE:</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleModelModeToggle('BASELINE')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              modelMode === 'BASELINE'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BASELINE MODEL
          </button>
          <button
            onClick={() => handleModelModeToggle('CALIBRATED')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              modelMode === 'CALIBRATED'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CALIBRATED MODEL (STEP 5.2)
          </button>
        </div>
      </div>

      {/* Primary Real-Time Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 font-mono text-xs">
        {/* Metric 1: Temp */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>RESERVOIR TEMP</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">
            {currentState.reservoir.reservoirTemperatureC.toFixed(1)} <span className="text-xs text-slate-400">°C</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            Thermal Gain: +{currentState.css.thermalGainC.toFixed(1)}°C
          </div>
        </div>

        {/* Metric 2: Viscosity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>HEAVY-OIL VISCOSITY</span>
            <Droplet className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">
            {currentState.reservoir.estimatedViscosityCp.toFixed(0)} <span className="text-xs text-slate-400">cP</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Mobility: {currentState.reservoir.oilMobilityDcP.toFixed(5)} D/cP
          </div>
        </div>

        {/* Metric 3: Production */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>MODELED RATE</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {currentState.production.estimatedProductionBopd.toFixed(1)} <span className="text-xs text-slate-400">BOPD</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Trend: {currentState.production.productionTrend} ({currentState.production.productionDeviationPercent > 0 ? '+' : ''}{currentState.production.productionDeviationPercent}%)
          </div>
        </div>

        {/* Metric 4: SRP Load */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>SRP LOAD INDEX</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">
            {currentState.srp.srpLoadIndex.toFixed(1)} <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {currentState.srp.vfdFrequencyHz} Hz | {currentState.srp.spm} SPM
          </div>
        </div>

        {/* Metric 5: Risk Level */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>OPERATIONAL RISK</span>
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-slate-100 mt-1">
            {currentState.risk.riskLevel}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Score: {currentState.risk.riskScore}/100
          </div>
        </div>
      </div>

      {/* Live Trend Charts Section (Simulated) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>REAL-TIME TELEMETRY TREND SPARK LINES (SIMULATED)</span>
          </div>
          <span className="text-[10px] text-slate-400">HISTORY BUFFERS: {history.length} TICKS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chart 1: Reservoir Temp */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">
              RESERVOIR TEMP VS TIME (°C)
            </div>
            <div className="h-20 flex items-end gap-1 pt-2">
              {history.map((h, i) => {
                const heightPct = Math.min(100, Math.max(10, ((h.reservoir.reservoirTemperatureC - 30) / 70) * 100));
                return (
                  <div
                    key={i}
                    className="flex-1 bg-amber-500/60 rounded-t hover:bg-amber-400 transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`${h.reservoir.reservoirTemperatureC}°C`}
                  />
                );
              })}
            </div>
          </div>

          {/* Chart 2: Production */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">
              MODELED PRODUCTION RATE (BOPD)
            </div>
            <div className="h-20 flex items-end gap-1 pt-2">
              {history.map((h, i) => {
                const heightPct = Math.min(100, Math.max(10, (h.production.estimatedProductionBopd / 30.0) * 100));
                return (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500/60 rounded-t hover:bg-emerald-400 transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`${h.production.estimatedProductionBopd.toFixed(1)} BOPD`}
                  />
                );
              })}
            </div>
          </div>

          {/* Chart 3: SRP Load */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">
              SRP MECHANICAL LOAD INDEX (/100)
            </div>
            <div className="h-20 flex items-end gap-1 pt-2">
              {history.map((h, i) => {
                const heightPct = Math.min(100, Math.max(10, h.srp.srpLoadIndex));
                return (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-500/60 rounded-t hover:bg-cyan-400 transition-all"
                    style={{ height: `${heightPct}%` }}
                    title={`Load: ${h.srp.srpLoadIndex.toFixed(1)}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Alerts & Timeline Event Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Active Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>REAL-TIME ACTIVE ALERTS ({activeAlerts.length})</span>
            </h3>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-4 bg-slate-950 rounded-lg text-slate-400 text-center font-sans">
              No active warnings or alerts. Operating state is nominal.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activeAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-3 rounded-lg border font-mono ${
                    alt.severity === 'CRITICAL'
                      ? 'bg-red-950/40 border-red-500/40 text-red-300'
                      : alt.severity === 'HIGH'
                      ? 'bg-orange-950/40 border-orange-500/40 text-orange-300'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                    <span>{alt.condition}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px]">{alt.severity}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{alt.explanation}</p>
                  <div className="mt-1 text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-slate-300">Action:</span> {alt.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline Event Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>SIMULATED EVENT TIMELINE ({eventTimeline.length})</span>
            </h3>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 font-mono text-[11px]">
            {eventTimeline.map((evt, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[10px]">{evt.timestamp}</span>
                  <span className="text-slate-200">{evt.event}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{evt.value}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[9px]">{evt.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrated Interactive What-If Simulation Engine */}
      <WhatIfSimulationPanel currentState={currentState} modelMode={modelMode} />
    </div>
  );
};
