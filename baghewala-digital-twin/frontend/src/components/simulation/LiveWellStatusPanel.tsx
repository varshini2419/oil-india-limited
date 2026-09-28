import React from 'react';
import type { PilotState } from '../../simulation/productionPilot/types';
import { Activity, ShieldCheck, Thermometer, Gauge, Flame, Droplets, GaugeCircle } from 'lucide-react';

interface Props {
  pilotState: PilotState;
}

export const LiveWellStatusPanel: React.FC<Props> = ({ pilotState }) => {
  const telemetry = pilotState.lastTelemetry;
  const prediction = pilotState.lastPrediction;
  const isLive = pilotState.status === 'LIVE';

  if (!telemetry) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-500 dark:text-slate-400 text-sm shadow-sm font-sans">
        No active well telemetry ingested yet. Click PLAY or STEP to stream live demonstration telemetry.
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-100 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/80 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              LIVE WELL TELEMETRY: <span className="font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded border border-sky-100 dark:border-sky-800">{pilotState.wellId}</span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Real-Time Ingestion & Physical State Monitoring</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm uppercase tracking-wider ${
              isLive 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/80' 
                : 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/80'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 dark:bg-emerald-400 animate-ping' : 'bg-amber-500 dark:bg-amber-400'}`} />
            {isLive ? 'STATUS: LIVE' : 'STATUS: PAUSED'}
          </span>
          <span className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono font-bold text-slate-600 bg-white border border-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:border-slate-700 rounded-lg shadow-sm">
            {telemetry.source ?? 'DEMONSTRATION_TELEMETRY'}
          </span>
        </div>
      </div>

      {/* Grid of Real-Time Parameters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm transition-all">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Thermometer className="w-4 h-4 text-red-500" /> Res Temp
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
            {Number.isNaN(telemetry.reservoirTemperatureC) ? 'NaN' : `${telemetry.reservoirTemperatureC}°C`}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 font-medium">Pred: {prediction?.predictedTemperatureC ?? 58}°C</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm transition-all">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Gauge className="w-4 h-4 text-sky-500" /> Res Press
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
            {Number.isNaN(telemetry.reservoirPressureBar) ? 'NaN' : `${telemetry.reservoirPressureBar} bar`}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 font-medium">Pred: {prediction?.predictedPressureBar ?? 48} bar</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm transition-all">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Flame className="w-4 h-4 text-amber-500" /> Steam Rate
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
            {telemetry.steamInjectionRateTPD} TPD
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 font-medium">Qual: {telemetry.steamQualityPct}%</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm transition-all">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Droplets className="w-4 h-4 text-blue-500" /> Water Cut
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
            {telemetry.waterCutPct}%
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 font-medium">Pred: {prediction?.predictedWaterCutPct ?? 20}%</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm transition-all">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <GaugeCircle className="w-4 h-4 text-purple-500" /> SPM
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">
            {telemetry.pumpingSpeedSPM}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 font-medium">Stroke: {telemetry.strokeLengthM}m</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm transition-all">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Actual
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {telemetry.observedProductionBOPD < 0 ? `${telemetry.observedProductionBOPD} (INV)` : `${telemetry.observedProductionBOPD}`} BOPD
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 font-medium">Telemetry Input</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm transition-all">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Activity className="w-4 h-4 text-sky-500" /> Predicted
          </div>
          <div className="text-lg font-bold text-sky-600 dark:text-sky-400 font-mono">
            {prediction?.predictedProductionBOPD ?? 0.75} BOPD
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 font-medium">Physics Model</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm transition-all">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-4 h-4 text-cyan-500" /> Quality
          </div>
          <div className={`text-sm font-bold uppercase font-mono mt-1 ${
            pilotState.lastValidation?.status === 'VALID' ? 'text-emerald-600 dark:text-emerald-400' : pilotState.lastValidation?.status === 'WARNING' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {pilotState.lastValidation?.status ?? 'VALID'}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 font-medium">{telemetry.latencyMs ?? 120}ms latency</div>
        </div>
      </div>
    </div>
  );
};
