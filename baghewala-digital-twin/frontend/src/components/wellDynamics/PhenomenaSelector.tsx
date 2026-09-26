import React from 'react';
import type { WellPhenomenon, PhenomenonId } from '../../types/wellDynamics';
import { WELL_PHENOMENA } from '../../config/wellDynamicsPhenomena';
import { Activity, Flame, ShieldAlert, Wind, Zap, Cpu, Wrench } from 'lucide-react';

interface PhenomenaSelectorProps {
  selectedId: PhenomenonId;
  onSelect: (id: PhenomenonId) => void;
}

const getPhenomenonIcon = (id: PhenomenonId) => {
  switch (id) {
    case 'normal_operation':
      return <Activity className="w-4 h-4 text-emerald-400" />;
    case 'temperature_thermal':
      return <Flame className="w-4 h-4 text-orange-400" />;
    case 'high_viscosity':
      return <ShieldAlert className="w-4 h-4 text-purple-400" />;
    case 'gas_interference':
      return <Wind className="w-4 h-4 text-cyan-400" />;
    case 'rod_overload':
      return <Zap className="w-4 h-4 text-red-400" />;
    case 'motor_pump_overload':
      return <Cpu className="w-4 h-4 text-amber-400" />;
    case 'scale_corrosion':
      return <Wrench className="w-4 h-4 text-orange-300" />;
    default:
      return <Activity className="w-4 h-4 text-sky-400" />;
  }
};

const getStatusBadgeClass = (color: string) => {
  switch (color) {
    case 'emerald':
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
    case 'orange':
      return 'bg-orange-950/80 text-orange-400 border-orange-800/60';
    case 'purple':
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
    case 'cyan':
      return 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60';
    case 'red':
      return 'bg-red-950/80 text-red-400 border-red-800/60';
    case 'amber':
      return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
};

export const PhenomenaSelector: React.FC<PhenomenaSelectorProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div>
          <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            WELL PHENOMENA (7)
          </h2>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Select physical condition to inspect well dynamics
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
          7 CONFIGS
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
        {WELL_PHENOMENA.map((item: WellPhenomenon) => {
          const isSelected = item.id === selectedId;
          const badgeStyle = getStatusBadgeClass(item.visualizationState.statusColor);

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-150 flex flex-col gap-1.5 ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-500/80 shadow-md ring-1 ring-sky-500/30'
                  : 'bg-slate-955/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2 font-bold text-xs font-mono text-slate-200">
                  {getPhenomenonIcon(item.id)}
                  {item.title}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${badgeStyle}`}>
                  {item.category.split(' ')[0]}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-mono">
                {item.shortDescription}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60 mt-0.5">
                <div className="flex items-center gap-2">
                  <span>{item.affectedComponents.length} Components</span>
                  {['gas_interference', 'scale_corrosion'].includes(item.id) ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold">
                      CONCEPTUAL
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold">
                      CALCULATED
                    </span>
                  )}
                </div>
                <span className="text-slate-400 hover:text-sky-300 transition-colors font-bold">
                  {isSelected ? '● ACTIVE' : 'Inspect →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
