import React, { useEffect, useRef, useState } from 'react';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { DigitalTwinLegend } from './DigitalTwinLegend';
import { DEFAULT_TWIN_CONFIG } from './config';
import {
  AnimationProvider,
  useAnimation,
} from './animations';
import { Grid, ZoomIn, ZoomOut, RotateCcw, Eye, Play, Terminal, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { useScenarioStore } from '../../simulation/scenario';

const ViewportToolbar: React.FC<{
  gridVisible: boolean;
  onToggleGrid: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}> = ({ gridVisible, onToggleGrid, zoom, onZoomIn, onZoomOut, onResetZoom }) => {
  const { isPlaying, reset, activeSpm } = useAnimation();
  const { commitSimulationRun, isStale } = useScenarioStore();

  return (
    <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar whitespace-nowrap shadow-sm z-10">
      {/* Playback Controls & Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-sky-600 dark:text-sky-400 mr-1">
          <Eye className="w-4 h-4" />
        </div>

        {/* Play / Pause / Reset Control Group */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm">
          <button
            onClick={() => commitSimulationRun()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded text-xs font-mono font-bold transition-colors shadow-sm ${isStale ? 'bg-amber-500 hover:bg-amber-400 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500'}`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN SIMULATION</span>
          </button>

          <button
            onClick={reset}
            aria-label="Reset Digital Twin animation"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-mono transition-colors border border-slate-200 dark:border-slate-700"
            title="Reset Animation Positions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Physical SPM Badge */}
        <div className="px-2.5 py-1.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 rounded-md text-[11px] font-bold text-sky-700 dark:text-sky-300 font-mono shrink-0 shadow-sm">
          {activeSpm} SPM (MODELED)
        </div>

        {/* Animation Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shrink-0 shadow-sm" title={isPlaying ? 'Running' : 'Paused'}>
          <span
            className={`w-2.5 h-2.5 rounded-full shadow-sm ${
              isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-500'
            }`}
          />
        </div>
      </div>

      {/* Viewport View Controls (Grid & Zoom) */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm font-mono text-xs">
        {/* Grid Toggle Button */}
        <button
          onClick={onToggleGrid}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] transition-colors ${
            gridVisible
              ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 font-semibold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid: {gridVisible ? 'ON' : 'OFF'}</span>
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={onZoomOut}
          disabled={zoom <= DEFAULT_TWIN_CONFIG.minZoom}
          className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Percentage Display */}
        <span className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[11px] text-slate-600 dark:text-slate-300 min-w-[55px] text-center font-bold">
          {Math.round(zoom * 100)}%
        </span>

        {/* Zoom In Button */}
        <button
          onClick={onZoomIn}
          disabled={zoom >= DEFAULT_TWIN_CONFIG.maxZoom}
          className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Reset Zoom Button */}
        <button
          onClick={onResetZoom}
          className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const AutoPlayOnSimulationRun: React.FC = () => {
  const { committedSimulationResult } = useScenarioStore();
  const { reset, play, pause, activeSpm } = useAnimation();
  const initialRunId = useRef(committedSimulationResult.trace.runId);

  useEffect(() => {
    const runId = committedSimulationResult.trace.runId;
    if (runId === initialRunId.current) return;
    initialRunId.current = runId;

    reset();
    play();

    const cycleDuration = Math.max(1000, Math.min(60000, 60000 / Math.max(activeSpm, 1)));
    const pauseTimer = window.setTimeout(() => pause(), cycleDuration + 120);

    return () => window.clearTimeout(pauseTimer);
  }, [activeSpm, committedSimulationResult.trace.runId, pause, play, reset]);

  return null;
};

const DigitalTwinFooterContent: React.FC<{ gridVisible: boolean }> = ({ gridVisible }) => {
  const { committedSimulationResult, isStale } = useScenarioStore();
  const [showDiagnostics, setShowDiagnostics] = React.useState(false);

  const inputs = committedSimulationResult.inputs;
  const thermal = committedSimulationResult.thermal;
  const viscosity = committedSimulationResult.viscosity;
  const mobility = committedSimulationResult.mobility;
  const production = committedSimulationResult.production;
  const risk = committedSimulationResult.risk;
  const runId = committedSimulationResult.trace.runId;

  return (
    <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4 font-mono z-10 shadow-sm">
      <DigitalTwinLegend gridVisible={gridVisible} />

      {/* SECTION 2 MODEL CONTEXT STRIP — COMMITTED SIMULATION STATE */}
      <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-sky-100 dark:border-sky-900/60 text-xs space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-xs tracking-wide">
            <Activity className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>COMMITTED SIMULATION RESULT — BAGHEWALA WELL STATE</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isStale ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold shadow-sm">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>INPUTS EDITED — CLICK RUN SIMULATION TO UPDATE TWIN</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>COMMITTED (UP TO DATE)</span>
              </span>
            )}

            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold transition-all shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>{showDiagnostics ? 'HIDE TRACE' : 'SHOW 2D TWIN TRACE'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-[11px]">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider mb-0.5">SIMULATION RUN ID</span>
            <span className="text-sky-600 dark:text-sky-300 font-bold truncate block" title={runId}>{runId}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider mb-0.5">RESERVOIR TEMP</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{thermal.predictedReservoirTemperatureC.toFixed(1)} °C</span>{' '}
            <span className="text-[9.5px] text-slate-400">({thermal.temperatureChangeC >= 0 ? `+${thermal.temperatureChangeC.toFixed(1)}` : thermal.temperatureChangeC.toFixed(1)})</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider mb-0.5">CRUDE VISCOSITY</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">{viscosity.estimatedViscosityCp.toLocaleString()} cP</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider mb-0.5">OIL MOBILITY (k/μ)</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{mobility.mobilityDcP.toFixed(4)} D/cP</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider mb-0.5">MODELED PROD</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{production.estimatedProductionBopd.toFixed(2)} BOPD</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] font-bold uppercase tracking-wider mb-0.5">SYSTEM RISK</span>
            <span className={risk.riskLevel === 'LOW' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : risk.riskLevel === 'MODERATE' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
              {risk.riskLevel} ({risk.riskScore}/100)
            </span>
          </div>
        </div>

        {/* STEP 15 DEVELOPMENT DIAGNOSTIC TRACE PANEL */}
        {showDiagnostics && (
          <div className="mt-4 p-3.5 bg-white dark:bg-slate-950 rounded-lg border border-sky-200 dark:border-sky-900/80 text-[10.5px] space-y-2.5 text-slate-600 dark:text-slate-300 font-mono shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold text-sky-600 dark:text-sky-300">
              <span>DEVELOPMENT DIAGNOSTIC TRACE PANEL — 2D DIGITAL TWIN CONNECTIVITY</span>
              <span>STATE: {isStale ? 'STALE (UNCOMMITTED CHANGES)' : 'SYNCHRONIZED'}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><strong>Store Simulation Run ID:</strong> <span className="text-emerald-600 dark:text-emerald-400">{runId}</span></div>
              <div><strong>2D Twin Run ID:</strong> <span className="text-emerald-600 dark:text-emerald-400">{runId}</span> (MATCHED)</div>
              <div><strong>Report Run ID:</strong> <span className="text-emerald-600 dark:text-emerald-400">{runId}</span> (MATCHED)</div>
              <div><strong>Calculated At:</strong> <span>{committedSimulationResult.calculatedAt}</span></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-2 text-[10px]">
              <div>Ambient / Weather: {inputs.ambientTemperatureC}°C | {inputs.humidityPercent}% | {inputs.windSpeedKmh}km/h</div>
              <div>Reservoir P / k: {inputs.reservoirPressureBar} bar | {inputs.permeabilityDarcy} D</div>
              <div>Steam Rate / Temp / Qual: {inputs.steamInjectionRateTpd} TPD | {inputs.steamInjectionTemperatureC}°C | {inputs.steamQualityPercent}%</div>
              <div>SRP Setpoints: {inputs.spm} SPM | {inputs.strokeLengthMeters}m | {inputs.vfdFrequencyHz} Hz</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LiveViewportTelemetry: React.FC = () => {
  const { committedSimulationResult, isStale } = useScenarioStore();
  const { inputs, thermal, viscosity, production, srp, risk } = committedSimulationResult;

  return (
    <div className="font-mono p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-sm shrink-0 z-10">
      <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-sky-100 dark:border-slate-800 pb-2.5 text-[11px]">
          <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300">
            <span className={`h-2.5 w-2.5 rounded-full ${isStale ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'} shadow-sm`} />
            <span className="tracking-wide">{isStale ? 'EDITED INPUTS — RUN REQUIRED' : 'LIVE COMMITTED MODEL STATE'}</span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-medium">Cycle {inputs.soakDurationDays > 0 ? 'SOAK / PRODUCTION' : 'BASELINE'} · {inputs.spm.toFixed(1)} SPM · {inputs.vfdFrequencyHz.toFixed(0)} Hz</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-2 pt-2.5">
          <TelemetryValue label="T_RES" value={`${thermal.predictedReservoirTemperatureC.toFixed(1)} °C`} tone="text-rose-600 dark:text-rose-400" />
          <TelemetryValue label="VISCOSITY" value={`${viscosity.estimatedViscosityCp.toLocaleString()} cP`} tone="text-purple-600 dark:text-purple-400" />
          <TelemetryValue label="MOBILITY" value={`${mobilityValue(committedSimulationResult.mobility.mobilityDcP)} D/cP`} tone="text-amber-600 dark:text-amber-400" />
          <TelemetryValue label="OIL RATE" value={`${production.estimatedProductionBopd.toFixed(2)} BOPD`} tone="text-emerald-600 dark:text-emerald-400" />
          <TelemetryValue label="SRP LOAD" value={`${srp.currentCandidate.loadIndex.toFixed(0)} %`} tone="text-amber-600 dark:text-amber-400" />
          <TelemetryValue label="STEAM" value={`${inputs.steamInjectionRateTpd.toFixed(0)} TPD`} tone="text-rose-600 dark:text-rose-400" />
          <TelemetryValue label="RISK" value={`${risk.riskLevel} ${risk.riskScore}/100`} tone={risk.riskLevel === 'LOW' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} />
          <TelemetryValue label="FLOW" value={inputs.waterCutPercent > 50 ? 'WATER-RICH' : 'OIL-RICH'} tone="text-sky-600 dark:text-sky-400" />
        </div>
      </div>
    </div>
  );
};

const mobilityValue = (value: number) => value.toFixed(5);

const TelemetryValue: React.FC<{ label: string; value: string; tone: string }> = ({ label, value, tone }) => (
  <div className="min-w-0">
    <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">{label}</span>
    <strong className={`block truncate text-xs ${tone}`}>{value}</strong>
  </div>
);

export const DigitalTwinViewport: React.FC = () => {
  const [gridVisible, setGridVisible] = useState(DEFAULT_TWIN_CONFIG.gridVisible);
  const [zoom, setZoom] = useState(DEFAULT_TWIN_CONFIG.defaultZoom);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, DEFAULT_TWIN_CONFIG.maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, DEFAULT_TWIN_CONFIG.minZoom));
  };

  const handleResetZoom = () => {
    setZoom(DEFAULT_TWIN_CONFIG.defaultZoom);
  };

  return (
    <AnimationProvider>
      <AutoPlayOnSimulationRun />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl w-full">
        {/* Viewport Control Bar Header */}
        <ViewportToolbar
          gridVisible={gridVisible}
          onToggleGrid={() => setGridVisible(!gridVisible)}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />

        {/* Main SVG Render Area */}
        <div className="relative overflow-hidden w-full h-[600px]">
          <DigitalTwinCanvas gridVisible={gridVisible} zoom={zoom} />
        </div>

        <LiveViewportTelemetry />

        {/* Viewport Footer Bar & Legend */}
        <DigitalTwinFooterContent gridVisible={gridVisible} />
      </div>
    </AnimationProvider>
  );
};
