import React from 'react';
import { useTelemetryFluctuation } from './useTelemetryFluctuation';
import { useAnimation } from '../digital-twin/animations';
import { SRP2DVisualization } from '../srp/SRP2DVisualization';
import { Flame, Cpu } from 'lucide-react';

export const CssSrpPerformanceSection: React.FC = () => {
  const tel = useTelemetryFluctuation();
  const { progress } = useAnimation();

  const isUpstroke = progress < 0.5;
  const dynoStatus = tel.srpLoad > 75 ? 'CAUTION' : 'NORMAL';

  // SRP Load Line Chart points from history
  const points = tel.srpLoadHistory;

  const svgW = 450;
  const svgH = 130;
  const pad = 25;
  const scaleX = (i: number) => pad + (i / (points.length - 1)) * (svgW - 2 * pad);
  const scaleY = (v: number) => svgH - pad - (v / 100) * (svgH - 2 * pad);

  const pathD = points.reduce((acc, v, i) => {
    const px = scaleX(i).toFixed(1);
    const py = scaleY(v).toFixed(1);
    return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
  }, '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono text-xs">
      {/* 1. Section 8: CSS Performance Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
            <Flame className="w-5 h-5 text-rose-500" />
            <span>CSS THERMAL PERFORMANCE WORKSTATION</span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-bold">
            CYCLE 3 INJECTION
          </span>
        </div>

        {/* 6 Parameter Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-950 border border-rose-900/60 rounded-xl p-3">
            <span className="text-[9px] text-slate-400 block font-bold">STEAM RATE</span>
            <strong className="text-base text-rose-400 block mt-0.5">{tel.steamRate.toFixed(0)} TPD</strong>
            <span className="text-[8.5px] text-rose-300 font-semibold">{tel.steamRateDelta}</span>
          </div>
          <div className="bg-slate-950 border border-sky-900/60 rounded-xl p-3">
            <span className="text-[9px] text-slate-400 block font-bold">STEAM QUALITY</span>
            <strong className="text-base text-sky-400 block mt-0.5">{tel.steamQuality.toFixed(1)}%</strong>
            <span className="text-[8.5px] text-sky-300 font-semibold">{tel.steamQualityDelta}</span>
          </div>
          <div className="bg-slate-950 border border-amber-900/60 rounded-xl p-3">
            <span className="text-[9px] text-slate-400 block font-bold">INJ TEMP</span>
            <strong className="text-base text-amber-400 block mt-0.5">{tel.steamTemp.toFixed(0)} °C</strong>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[9px] text-slate-400 block font-bold">INJ PRESS</span>
            <strong className="text-base text-indigo-400 block mt-0.5">{tel.resPressure.toFixed(0)} bar</strong>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[9px] text-slate-400 block font-bold">SOAK DURATION</span>
            <strong className="text-base text-purple-400 block mt-0.5">7 days</strong>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[9px] text-slate-400 block font-bold">HEAT INPUT</span>
            <strong className="text-base text-emerald-400 block mt-0.5">{tel.heatInputMw} MW</strong>
          </div>
        </div>

        {/* Comparison Visuals */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <span className="text-[9.5px] font-bold text-slate-300 block">Steam Rate vs Oil Production</span>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-rose-400">{tel.steamRate.toFixed(0)} TPD</span>
              <span className="text-slate-500">→</span>
              <span className="text-emerald-400">{tel.oilProd.toFixed(2)} BOPD</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-emerald-500 h-full rounded-full" style={{ width: '75%' }} />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <span className="text-[9.5px] font-bold text-slate-300 block">Quality vs Thermal Response</span>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-sky-400">{tel.steamQuality.toFixed(1)}% Qual</span>
              <span className="text-slate-500">→</span>
              <span className="text-rose-400">{tel.resTemp.toFixed(1)} °C</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-rose-500 h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Section 9 & 10: SRP Performance Dashboard & Animated 2D Unit & Line Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-sky-400 text-sm">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span>SRP MECHANICAL & LIFT PERFORMANCE</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 font-bold">
            ● DYNAMOMETER: {dynoStatus}
          </span>
        </div>

        {/* Dual Grid: Animated 2D Unit Left + SRP Metrics Right */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Animated 2D SRP Mechanical Visual */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden shadow-inner flex flex-col items-center">
            <SRP2DVisualization />
          </div>

          {/* 10 SRP Parameters */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">SPM</span>
              <strong className="text-sky-400 text-xs block">{tel.spm.toFixed(1)} SPM</strong>
              <span className="text-[8px] text-sky-300 font-semibold">{tel.spmDelta}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">STROKE</span>
              <strong className="text-indigo-400 text-xs block">{tel.strokeM.toFixed(2)} m</strong>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">VFD FREQ</span>
              <strong className="text-purple-400 text-xs block">{tel.vfdHz.toFixed(1)} Hz</strong>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">DIRECTION</span>
              <strong className={`text-xs block ${isUpstroke ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isUpstroke ? 'UPSTROKE' : 'DOWNSTROKE'}
              </strong>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">CYCLE TIME</span>
              <strong className="text-slate-300 text-xs block">{tel.cycleTimeSec} sec</strong>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">PEAK LOAD</span>
              <strong className="text-rose-400 text-xs block">{tel.peakRodLoad} kN</strong>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">LOAD UTIL</span>
              <strong className="text-amber-400 text-xs block">{tel.srpLoad.toFixed(1)}%</strong>
              <span className="text-[8px] text-amber-300 font-semibold">{tel.srpLoadDelta}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">FILLAGE</span>
              <strong className="text-emerald-400 text-xs block">{tel.fillagePct.toFixed(1)}%</strong>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">ROD STRESS INDEX</span>
              <strong className="text-sky-300 text-xs block">{tel.stressIndex}%</strong>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-[8.5px] text-slate-400 block font-bold">ROD FATIGUE INDEX</span>
              <strong className="text-amber-300 text-xs block">{tel.fatigueIndex}%</strong>
            </div>
          </div>
        </div>

        {/* Section 10: SRP Live Load Line Chart */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-200">SRP LOAD — LIVE TIMESTEP TRAJECTORY</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-emerald-400 font-bold">Safe: &lt;65%</span>
              <span className="text-amber-400 font-bold">Caution: 80%</span>
              <span className="text-rose-400 font-bold">Current: {tel.srpLoad.toFixed(1)}%</span>
            </div>
          </div>

          <div className="relative h-[90px] w-full flex items-center justify-center">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
              {/* Boundaries */}
              <line x1={pad} y1={scaleY(65)} x2={svgW - pad} y2={scaleY(65)} stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={pad} y1={scaleY(80)} x2={svgW - pad} y2={scaleY(80)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />

              <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              {points.map((v, idx) => (
                <circle
                  key={idx}
                  cx={scaleX(idx)}
                  cy={scaleY(v)}
                  r="3.5"
                  fill={idx === points.length - 1 ? '#f59e0b' : '#fde68a'}
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
