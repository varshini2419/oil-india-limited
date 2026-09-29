import React from 'react';
import { Activity, Database } from 'lucide-react';
import { useScenarioStore } from '../../simulation/scenario';
import './Sidebar.css';

export const StatusBar: React.FC = () => {
  const scenarioStore = useScenarioStore();
  const activeScenario = scenarioStore?.activeScenario;
  const viscosity = scenarioStore?.viscosityResult?.estimatedViscosityCp;
  const oilRate = scenarioStore?.productionResult?.estimatedProductionBopd;
  const risk = scenarioStore?.aiRiskResult?.riskLevel ?? (scenarioStore?.aiRiskResult as any)?.overallRiskLevel;

  return (
    <footer className="oil-statusbar-wrapper h-9 px-4 flex items-center justify-between text-[11px] shrink-0 overflow-x-auto select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="oil-statusbar-live-chip">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 oil-live-pulse" />
            Live
          </span>
          <span>Backend:</span>
          <span className="text-emerald-600 font-medium">Ready</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>Simulation Engine:</span>
          <span className="text-emerald-600 font-medium">
            Active ({activeScenario?.name ?? 'Baseline'})
          </span>
        </div>

        {viscosity !== undefined && oilRate !== undefined && (
          <div className="hidden sm:flex items-center gap-3 border-l border-gray-200 pl-4 text-gray-600">
            <span>Viscosity: <strong className="text-sky-700">{viscosity.toFixed(0)} cP</strong></span>
            <span>Oil Rate: <strong className="text-emerald-700">{oilRate.toFixed(0)} bpd</strong></span>
            <span className="flex items-center gap-1">
              Risk:
              <strong className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                risk === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-300' :
                risk === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                risk === 'MODERATE' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                'bg-emerald-100 text-emerald-700 border border-emerald-300'
              }`}>
                {risk ?? 'LOW'}
              </strong>
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-sky-600" />
          <span>Data Source:</span>
          <span className="text-gray-600">Prototype / Reference Data</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-gray-500 text-[10px]">
        <span>Baghewala Heavy-Oil Digital Twin</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span>Advisory Support Only</span>
      </div>
    </footer>
  );
};
