import React from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { Sliders } from 'lucide-react';

interface DigitalTwinLegendProps {
  gridVisible: boolean;
}

export const DigitalTwinLegend: React.FC<DigitalTwinLegendProps> = ({ gridVisible }) => {
  const { committedSimulationResult } = useScenarioStore();
  const inputs = committedSimulationResult.inputs;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-md p-3 font-mono text-[11px] text-slate-400 space-y-2.5">
      {/* Active Scenario Connection Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950/80 rounded border border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">COMMITTED SCENARIO:</span>
          <span className="text-sky-300 font-bold">{committedSimulationResult.trace.scenarioName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-300">
          <span>
            VFD: <strong className="text-amber-400">{inputs.vfdFrequencyHz} Hz</strong>
          </span>
          <span>
            Steam: <strong className="text-rose-400">{inputs.steamInjectionRateTpd} t/day</strong>
          </span>
          <span>
            Res Temp: <strong className="text-emerald-400">{inputs.reservoirTemperatureC}°C</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
          Digital Twin Schematic & Phenomena Legend
        </div>
        <div className="text-[10px] text-slate-500">
          Grid: <span className="text-slate-300">{gridVisible ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[10px]">
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 border border-sky-300 shrink-0" />
          <span className="text-slate-200">Wellhead / VIT</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 border border-slate-300 shrink-0" />
          <span className="text-slate-200">Casing / Rod</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 border border-amber-400 shrink-0" />
          <span className="text-slate-200">Jodhpur Sandstone</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-900 border border-amber-600 shrink-0" />
          <span className="text-slate-200">Heavy-Oil Zone</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 border border-amber-300 shrink-0" />
          <span className="text-amber-300">Oil Flow (Static)</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 border border-cyan-300 shrink-0" />
          <span className="text-cyan-300">Production Upflow</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 border border-rose-400 shrink-0" />
          <span className="text-rose-300">Steam Input</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-sm bg-orange-500/60 border border-orange-400 shrink-0" />
          <span className="text-orange-300">Thermal Zone</span>
        </div>
      </div>
    </div>
  );
};
