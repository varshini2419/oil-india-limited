import React from 'react';
import { useTelemetryFluctuation } from './useTelemetryFluctuation';
import { Droplet, Activity, Flame, Thermometer, Cpu, TrendingUp, ArrowRight } from 'lucide-react';

export const ViscosityMobilitySection: React.FC = () => {
  const tel = useTelemetryFluctuation();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-purple-400 text-sm">
          <Droplet className="w-5 h-5 text-purple-400" />
          <span>CRUDE FLOW CONDITION & ENGINEERING CAUSAL FLOW</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 font-bold">
          HEAVY OIL VISCOSITY & MOBILITY MODEL
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Section 7 Crude Flow Condition */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200">CRUDE FLOW PARAMETERS</span>
            <span className="text-[10px] text-purple-400 font-bold">THERMAL DYNAMICS</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-purple-900/60 rounded-xl p-3">
              <span className="text-[9.5px] text-slate-400 block font-bold">CRUDE VISCOSITY</span>
              <strong className="text-lg text-purple-400 block mt-0.5">
                {tel.viscosity.toLocaleString(undefined, { maximumFractionDigits: 1 })} cP
              </strong>
              <span className="text-[9.5px] text-purple-300 font-semibold block mt-1">Viscosity Delta: {tel.viscosityDelta}</span>
            </div>

            <div className="bg-slate-900 border border-amber-900/60 rounded-xl p-3">
              <span className="text-[9.5px] text-slate-400 block font-bold">FLUID MOBILITY</span>
              <strong className="text-lg text-amber-400 block mt-0.5">
                {tel.mobility.toFixed(5)} D/cP
              </strong>
              <span className="text-[9.5px] text-amber-300 font-semibold block mt-1">Mobility Delta: {tel.mobilityDelta}</span>
            </div>
          </div>

          {/* Visual Relationship Chain */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">PHYSICAL COUPLING RELATIONSHIP</span>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
              <span className="text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">TEMP ↑ ({tel.resTemp.toFixed(1)}°C)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">VISCOSITY ↓ ({tel.viscosity.toFixed(0)}cP)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">MOBILITY ↑</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">PRODUCTION ↑ ({tel.oilProd.toFixed(2)}BOPD)</span>
            </div>
          </div>
        </div>

        {/* Right: Section 19 Engineering Causal Flow Node Chain */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>ENGINEERING CAUSAL FLOW PIPELINE</span>
            </div>
            <span className="text-[10px] text-sky-400 font-bold">8-STAGE CAUSAL CHAIN</span>
          </div>

          {/* 8 Node Visual Chain with Live Values */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
            <div className="bg-slate-900 border border-rose-800 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[9px] text-rose-400 block font-bold">1. STEAM</span>
              <Flame className="w-3.5 h-3.5 text-rose-500 mx-auto my-0.5" />
              <strong className="text-xs text-white block">{tel.steamRate.toFixed(0)} TPD</strong>
            </div>

            <div className="bg-slate-900 border border-amber-800 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[9px] text-amber-400 block font-bold">2. HEAT</span>
              <Activity className="w-3.5 h-3.5 text-amber-500 mx-auto my-0.5" />
              <strong className="text-xs text-white block">{tel.heatInputMw} MW</strong>
            </div>

            <div className="bg-slate-900 border border-rose-800 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[9px] text-rose-300 block font-bold">3. TEMP</span>
              <Thermometer className="w-3.5 h-3.5 text-rose-400 mx-auto my-0.5" />
              <strong className="text-xs text-white block">{tel.resTemp.toFixed(1)} °C</strong>
            </div>

            <div className="bg-slate-900 border border-purple-800 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[9px] text-purple-400 block font-bold">4. VISCOSITY</span>
              <Droplet className="w-3.5 h-3.5 text-purple-400 mx-auto my-0.5" />
              <strong className="text-xs text-white block">{tel.viscosity.toFixed(0)} cP</strong>
            </div>

            <div className="bg-slate-900 border border-amber-800 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[9px] text-amber-400 block font-bold">5. MOBILITY</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 mx-auto my-0.5" />
              <strong className="text-xs text-white block">{tel.mobility.toFixed(4)}</strong>
            </div>

            <div className="bg-slate-900 border border-indigo-800 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[9px] text-indigo-400 block font-bold">6. SRP LIFT</span>
              <Cpu className="w-3.5 h-3.5 text-indigo-400 mx-auto my-0.5" />
              <strong className="text-xs text-white block">{tel.srpLoad.toFixed(0)}%</strong>
            </div>

            <div className="bg-slate-900 border border-emerald-800 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[9px] text-emerald-400 block font-bold">7. OIL PROD</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mx-auto my-0.5" />
              <strong className="text-xs text-white block">{tel.oilProd.toFixed(2)} BOPD</strong>
            </div>

            <div className="bg-slate-900 border border-emerald-700 bg-emerald-950/30 rounded-xl p-2.5 space-y-0.5">
              <span className="text-[9px] text-emerald-300 block font-bold">8. HEALTH</span>
              <Activity className="w-3.5 h-3.5 text-emerald-300 mx-auto my-0.5" />
              <strong className="text-xs text-emerald-300 block">{tel.healthPct.toFixed(0)}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
