import React from 'react';
import { useTelemetryFluctuation } from './useTelemetryFluctuation';
import { TrendingUp, Flame, Droplet, Activity, ArrowRight } from 'lucide-react';

export const ProductionPerformanceSection: React.FC = () => {
  const tel = useTelemetryFluctuation();

  const points = tel.oilProdHistory;
  const minP = Math.min(...points);
  const maxP = Math.max(...points);

  const svgW = 500;
  const svgH = 120;
  const pad = 30;
  const scaleX = (i: number) => pad + (i / (points.length - 1)) * (svgW - 2 * pad);
  const scaleY = (v: number) => svgH - pad - ((v - (minP - 0.05)) / (maxP - minP + 0.1 || 1)) * (svgH - 2 * pad);

  const pathD = points.reduce((acc, v, i) => {
    const px = scaleX(i).toFixed(1);
    const py = scaleY(v).toFixed(1);
    return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
  }, '');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>PRODUCTION PERFORMANCE & THERMAL YIELD WORKSTATION</span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800 font-bold">
          VOGEL HEAVY OIL INFLOW
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: 5 Production KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-3">
            <span className="text-[9.5px] text-slate-400 block font-bold">OIL PRODUCTION</span>
            <strong className="text-xl text-emerald-400 block mt-0.5">{tel.oilProd.toFixed(2)} BOPD</strong>
            <span className="text-[9px] text-emerald-300 font-semibold block mt-0.5">{tel.oilProdDelta}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[9.5px] text-slate-400 block font-bold">TOTAL FLUID</span>
            <strong className="text-xl text-sky-400 block mt-0.5">{tel.totalFluid.toFixed(2)} BFPD</strong>
            <span className="text-[9px] text-slate-500 block mt-0.5">Gross Liquids</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[9.5px] text-slate-400 block font-bold">WATER CUT</span>
            <strong className="text-xl text-indigo-400 block mt-0.5">{tel.waterCut.toFixed(0)}%</strong>
            <span className="text-[9px] text-slate-500 block mt-0.5">Water Fraction</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <span className="text-[9.5px] text-slate-400 block font-bold">PROD EFFICIENCY</span>
            <strong className="text-xl text-purple-400 block mt-0.5">{tel.prodEfficiency.toFixed(1)}%</strong>
            <span className="text-[9px] text-slate-500 block mt-0.5">Inflow Drawdown Ratio</span>
          </div>

          <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-3 col-span-2 sm:col-span-2">
            <span className="text-[9.5px] text-slate-400 block font-bold">PRODUCTION CHANGE</span>
            <strong className="text-xl text-emerald-400 block mt-0.5">{tel.oilProdDelta}</strong>
            <span className="text-[9px] text-emerald-300 font-semibold block mt-0.5">Viscosity Reduction Yield</span>
          </div>
        </div>

        {/* Center: Live Line Chart */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>OIL PRODUCTION — LIVE TIMESTEP TRAJECTORY</span>
            </div>
            <div className="flex items-center gap-3 text-[10.5px]">
              <span>Current: <strong className="text-emerald-400">{tel.oilProd.toFixed(2)} BOPD</strong></span>
              <span>Min: <strong className="text-slate-300">{minP.toFixed(2)} BOPD</strong></span>
              <span>Max: <strong className="text-slate-300">{maxP.toFixed(2)} BOPD</strong></span>
            </div>
          </div>

          <div className="relative h-[95px] w-full flex items-center justify-center">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
              <line x1={pad} y1={svgH - pad} x2={svgW - pad} y2={svgH - pad} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
              <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              {points.map((v, idx) => (
                <circle
                  key={idx}
                  cx={scaleX(idx)}
                  cy={scaleY(v)}
                  r="3.5"
                  fill={idx === points.length - 1 ? '#10b981' : '#a7f3d0'}
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          </div>

          {/* Steam Input vs Oil Output Comparison Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">STEAM INPUT → OIL OUTPUT:</span>
            <div className="flex items-center gap-2 flex-1 justify-center text-[11px] font-bold">
              <span className="text-rose-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> {tel.steamRate.toFixed(0)} TPD STEAM
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="text-emerald-400 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5" /> {tel.oilProd.toFixed(2)} BOPD OIL
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 font-mono">SOR: {(tel.steamRate / (tel.oilProd || 1)).toFixed(1)} TPD/BOPD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
