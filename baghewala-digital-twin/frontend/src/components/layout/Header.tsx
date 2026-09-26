import React from 'react';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Menu, Cpu, Activity } from 'lucide-react';
import { useScenarioStore } from '../../simulation/scenario';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const scenarioStore = useScenarioStore();
  const activeScenario = scenarioStore?.activeScenario;
  const inputs = activeScenario?.inputs;

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-sky-950 border border-sky-800/80 rounded-md text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              BAGHEWALA DIGITAL TWIN
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block font-sans">
              Heavy-Oil Field Simulation & Decision Support
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {activeScenario && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-indigo-950/80 border border-indigo-700/70 rounded text-[11px] font-mono text-indigo-200">
            <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="font-bold text-indigo-300">ACTIVE SCENARIO:</span>
            <span className="text-white font-medium">{activeScenario.name}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">{inputs?.reservoirTemperatureC}°C</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">{inputs?.steamInjectionRateTpd} t/d</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">{inputs?.spm} SPM</span>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-sky-950/80 border border-sky-800 rounded text-[11px] font-mono font-bold text-sky-300">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>DEMO MODE</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-amber-950/80 border border-amber-800 rounded text-[10px] font-mono font-bold text-amber-300">
          <span>REAL FIELD DATA: NOT CONNECTED</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 hidden md:inline">System Status:</span>
          <StatusIndicator status="ready" label="System Ready" />
        </div>
      </div>
    </header>
  );
};
