import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { PlaceholderCard } from '../components/ui/PlaceholderCard';
import { Panel } from '../components/ui/Panel';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { FieldDataPanel } from '../components/ui/FieldDataPanel';
import { MapPin, Layers, Gauge, Cpu, Activity, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Dashboard"
        subtitle="Baghewala Heavy-Oil Digital Twin overview & operational status"
        badgeText="v1.0.0 Release Freeze"
      />

      {/* Grid of overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PlaceholderCard
          title="Field"
          value="Baghewala Field"
          description="Bikaner-Nagaur Basin, Rajasthan"
          statusText="Documented"
          icon={<MapPin className="w-5 h-5 text-sky-400" />}
        />

        <PlaceholderCard
          title="Reservoir"
          value="Jodhpur Sandstone"
          description="High Viscosity (~15,000 cP) Matrix"
          statusText="Documented"
          icon={<Layers className="w-5 h-5 text-amber-400" />}
        />

        <PlaceholderCard
          title="Well"
          value="BGW-REP-01 (CSS Well)"
          description="Dual Recovery: CSS + SRP Systems"
          statusText="Representative"
          icon={<Gauge className="w-5 h-5 text-indigo-400" />}
        />

        <PlaceholderCard
          title="Current Simulation"
          value="Interactive Engine Active"
          description="7-Stage Physics Pipeline Synced"
          statusText="Step 6.2 Certified"
          icon={<Cpu className="w-5 h-5 text-emerald-400" />}
        />

        <PlaceholderCard
          title="Production"
          value="Calculated Forecast"
          description="Dynamic Inflow & SRP Lift Model"
          statusText="Modeled Output"
          icon={<Activity className="w-5 h-5 text-cyan-400" />}
        />

        <PlaceholderCard
          title="System Status"
          value="Operational Ready"
          description="141/141 verified unit tests PASS"
          statusText="Operational"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        />

        <PlaceholderCard
          title="AI Engineering Status"
          value="Explainable Trace Active"
          description="High Data Support | 4 Open Gaps"
          statusText="Advisory Active"
          icon={<Cpu className="w-5 h-5 text-sky-400" />}
        />
      </div>

      {/* Overview Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="System Architecture & State" subtitle="Foundation status indicator">
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-slate-400">Frontend Navigation Shell:</span>
              <StatusIndicator status="ready" label="Active" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-slate-400">FastAPI Backend Service:</span>
              <StatusIndicator status="ready" label="Connected (/api/health)" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-slate-400">2D Digital Twin Visualizer:</span>
              <StatusIndicator status="ready" label="Step 3.4 Animated" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded border border-slate-800">
              <span className="text-slate-400">Baghewala Data Foundation:</span>
              <StatusIndicator status="ready" label="Step 4.1 Active" />
            </div>
          </div>
        </Panel>

        <Panel title="Engineering Scope Notice" subtitle="SIH Digital Twin Roadmap">
          <div className="p-3 bg-sky-950/20 border border-sky-800/40 rounded text-xs text-sky-200/90 leading-relaxed font-sans space-y-2">
            <p>
              <strong className="font-mono text-sky-400">Baghewala Data Foundation (Step 4.1):</strong> Centralized data profiles for Baghewala Field, Jodhpur Sandstone reservoir, heavy crude viscosity curves, and representative well model BGW-REP-01 with full provenance classification.
            </p>
            <p className="text-slate-400">
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
