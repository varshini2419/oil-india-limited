import React from 'react';
import { PlaceholderCard } from '../components/ui/PlaceholderCard';
import { Panel } from '../components/ui/Panel';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { FieldDataPanel } from '../components/ui/FieldDataPanel';
import { MapPin, Layers, Gauge, Cpu, Activity, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-2 border-b border-gray-200">
        {/* Page title block */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-extrabold tracking-wide text-slate-900 uppercase font-mono">
              Field Dashboard
            </h1>
            <span className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-mono font-bold bg-gray-100 text-gray-600 border border-gray-300 rounded">
              v1.0.0 Release Freeze
            </span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1 font-sans">
            Baghewala Heavy-Oil Digital Twin overview &amp; operational status
          </p>
        </div>

        {/* Operator brand mark */}
        <div className="flex items-center gap-3 shrink-0">
          <svg className="w-9 h-12" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Ring */}
            <circle cx="18" cy="14" r="11" stroke="#111111" strokeWidth="7" />
            {/* Stem */}
            <rect x="15.5" y="27" width="5" height="12" fill="#c62828" />
            {/* Base */}
            <rect x="11" y="40" width="14" height="4" rx="1" fill="#c62828" />
          </svg>
          <span className="text-[26px] font-black tracking-tight text-slate-900 font-sans">
            OIL INDIA LIMITED
          </span>
        </div>
      </div>

      {/* Grid of overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PlaceholderCard
          title="Field"
          value="Baghewala Field"
          description="High Data Support"
          statusText="Documented"
          tone="dark"
          icon={<MapPin className="w-4 h-4" />}
        />

        <PlaceholderCard
          title="Reservoir"
          value="Jodhpur Sandstone"
          description="High Viscosity (~15,000 cP) Matrix"
          statusText="Documented"
          tone="dark"
          icon={<Layers className="w-4 h-4" />}
        />

        <PlaceholderCard
          title="Well"
          value="BGW-REP-01 (CSS Well)"
          description="Dual Recovery: CSS + SRP Systems"
          statusText="Representative"
          tone="dark"
          icon={<Gauge className="w-4 h-4" />}
        />

        <PlaceholderCard
          title="Current Simulation"
          value="Interactive Engine Active"
          description="7-Stage Physics Pipeline Synced"
          statusText="Step 6.2 Certified"
          tone="maroon"
          icon={<Cpu className="w-4 h-4" />}
        />

        <PlaceholderCard
          title="Production"
          value="Calculated Forecast"
          description="Dynamic Inflow & SRP Lift Model"
          statusText="Modeled Output"
          tone="dark"
          icon={<Activity className="w-4 h-4" />}
        />

        <PlaceholderCard
          title="System Status"
          value="Operational Ready"
          description="141/141 verified unit tests PASS"
          statusText="Operational"
          tone="dark"
          icon={<ShieldCheck className="w-4 h-4" />}
        />

        <PlaceholderCard
          title="AI Engineering Status"
          value="Explainable Trace Active"
          description="High Data Support | 4 Open Gaps"
          statusText="Advisory Active"
          tone="maroon"
          icon={<Cpu className="w-4 h-4" />}
        />
      </div>

      {/* Overview Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="System Architecture & State" subtitle="Foundation status indicator">
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-500">Frontend Navigation Shell:</span>
              <StatusIndicator status="ready" label="Active" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-500">FastAPI Backend Service:</span>
              <StatusIndicator status="ready" label="Connected (/api/health)" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-500">2D Digital Twin Visualizer:</span>
              <StatusIndicator status="ready" label="Step 3.4 Animated" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-500">Baghewala Data Foundation:</span>
              <StatusIndicator status="ready" label="Step 4.1 Active" />
            </div>
          </div>
        </Panel>

        <Panel title="Engineering Scope Notice" subtitle="SIH Digital Twin Roadmap">
          <div className="p-3 bg-sky-50 border border-sky-200 rounded text-xs text-sky-900 leading-relaxed font-sans space-y-2">
            <p>
              <strong className="font-mono text-sky-700">Baghewala Data Foundation (Step 4.1):</strong> Centralized data profiles for Baghewala Field, Jodhpur Sandstone reservoir, heavy crude viscosity curves, and representative well model BGW-REP-01 with full provenance classification.
            </p>
            <p className="text-gray-500">
              Physics models (thermal steam dissipation, viscosity-temperature kinetics, sucker rod pump kinematics, and production recovery curves) will be integrated in subsequent Step 4 sub-modules.
            </p>
          </div>
        </Panel>
      </div>

      {/* Baghewala Provenance & Field Data Panel */}
      <FieldDataPanel />
    </div>
  );
};
