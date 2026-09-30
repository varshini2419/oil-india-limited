import React, { useEffect, useState } from 'react';
import { Activity, Database } from 'lucide-react';
import { useScenarioStore } from '../../simulation/scenario';
import { checkHealth, type HealthCheckResponse } from '../../services/api';
import { StatusBadge } from '../ui/StatusBadge';
import './Sidebar.css';

const HEALTH_POLL_INTERVAL_MS = 30_000;

export const StatusBar: React.FC = () => {
  const scenarioStore = useScenarioStore();
  const activeScenario = scenarioStore?.activeScenario;
  const viscosity = scenarioStore?.viscosityResult?.estimatedViscosityCp;
  const oilRate = scenarioStore?.productionResult?.estimatedProductionBopd;
  const risk = scenarioStore?.aiRiskResult?.riskLevel ?? (scenarioStore?.aiRiskResult as any)?.overallRiskLevel;

  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const result = await checkHealth();
      if (!cancelled) {
        setHealth(result);
      }
    };

    void poll();
    const interval = setInterval(poll, HEALTH_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const backendOnline = health !== null;

  return (
    <footer className="oil-statusbar-wrapper h-9 px-4 flex items-center justify-between text-xs shrink-0 overflow-x-auto select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="oil-statusbar-live-chip">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendOnline ? 'bg-emerald-500 oil-live-pulse' : 'bg-red-500'
              }`}
            />
            Live
          </span>
          <span>Backend:</span>
          <span className={`font-medium ${backendOnline ? 'text-emerald-600' : 'text-red-600'}`}>
            {backendOnline ? 'Ready' : 'Offline'}
          </span>
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
              <StatusBadge statusLevel={risk ?? 'LOW'} label={risk ?? 'LOW'} />
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-sky-600" />
          <span>Data Source:</span>
          <span className="text-gray-600">
            Documented field data (built-in) · API {backendOnline ? 'connected' : 'unreachable'}
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-gray-500 text-xs">
        <span>Baghewala Heavy-Oil Digital Twin</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span>Advisory Support Only</span>
      </div>
    </footer>
  );
};
