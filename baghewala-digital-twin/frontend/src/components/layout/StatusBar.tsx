import React from 'react';
import { Server, Activity, Database } from 'lucide-react';
import { useScenarioStore } from '../../simulation/scenario';

export const StatusBar: React.FC = () => {
  const scenarioStore = useScenarioStore();
  const activeScenario = scenarioStore?.activeScenario;
  const viscosity = scenarioStore?.viscosityResult?.estimatedViscosityCp;
  const oilRate = scenarioStore?.productionResult?.estimatedProductionBopd;
  const risk = scenarioStore?.aiRiskResult?.riskLevel ?? (scenarioStore?.aiRiskResult as any)?.overallRiskLevel;

  return (
    <footer className="h-9 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 overflow-x-auto">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span>Backend:</span>
          <span className="text-emerald-400 font-medium">Ready</span>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Simulation Engine:</span>
          <span className="text-emerald-400 font-medium">
            Active ({activeScenario?.name ?? 'Baseline'})
          </span>
        </div>

        {viscosity !== undefined && oilRate !== undefined && (
          <div className="hidden sm:flex items-center gap-3 border-l border-slate-800 pl-4 text-slate-300">
            <span>Viscosity: <strong className="text-sky-300">{viscosity.toFixed(0)} cP</strong></span>
            <span>Oil Rate: <strong className="text-emerald-300">{oilRate.toFixed(0)} bpd</strong></span>
            <span className="flex items-center gap-1">
              Risk:
              <strong className={`px-1.5 py-0.5 rounded text-[10px] ${
                risk === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                risk === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                risk === 'MODERATE' ? 'bg-yellow-950 text-yellow-400 border border-yellow-800' :
                'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {risk ?? 'LOW'}
              </strong>
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span>Data Source:</span>
          <span className="text-slate-300">Prototype / Reference Data</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-slate-400 text-[10px]">
        <span>Baghewala Heavy-Oil Digital Twin</span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        <span>Advisory Support Only</span>
      </div>
    </footer>
  );
};
