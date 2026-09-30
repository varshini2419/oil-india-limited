import React from 'react';
import { AnimationProvider } from '../digital-twin/animations';
import { PredictiveMaintenanceTelemetry } from '../predictiveMaintenance/PredictiveMaintenanceTelemetry';
import { RiskGauges } from '../predictiveMaintenance/RiskGauges';
import { EquipmentHealth } from '../predictiveMaintenance/EquipmentHealth';
import { RiskFactors } from '../predictiveMaintenance/RiskFactors';
import { MaintenanceAlerts } from '../predictiveMaintenance/MaintenanceAlerts';
import { MaintenanceStatus } from '../predictiveMaintenance/MaintenanceStatus';
import { MaintenanceTrend } from '../predictiveMaintenance/MaintenanceTrend';
import { SRP2DVisualization } from '../srp/SRP2DVisualization';
import { DynamometerChart } from '../srp/DynamometerChart';
import { ShieldAlert } from 'lucide-react';

export const PredictiveMaintenancePanel: React.FC = () => {
  return (
    <AnimationProvider>
      <div className="space-y-5">
        {/* Top Header Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-500" />
              <span>Phase 4.9 • Mechanical Health Command Center & Predictive Diagnostics</span>
            </div>
            <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight">
              SRP MECHANICAL HEALTH & PREDICTIVE MAINTENANCE WORKSTATION
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 leading-relaxed">
              Continuous failure-risk estimation, component fatigue breakdown, API RP 11L dynamometer diagnostics & live health trends.
            </p>
          </div>
        </div>

        {/* 1. Live Operating Telemetry & Status Bar */}
        <PredictiveMaintenanceTelemetry />

        {/* 2. Failure Risk Circular Gauges */}
        <RiskGauges />

        {/* 3. Overall Equipment Health & Risk Contributors Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <EquipmentHealth />
          <RiskFactors />
        </div>

        {/* 4. 2D SRP Mechanical Schematic & Dynamometer Performance Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SRP2DVisualization />
          <DynamometerChart />
        </div>

        {/* 5. Active Maintenance Alerts & Subsystem Health Status Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <MaintenanceAlerts />
          <MaintenanceStatus />
        </div>

        {/* 6. Rolling Predictive Trend Chart */}
        <MaintenanceTrend />
      </div>
    </AnimationProvider>
  );
};
