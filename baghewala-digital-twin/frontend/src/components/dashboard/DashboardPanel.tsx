import React from 'react';
import { AnimationProvider } from '../digital-twin/animations';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKpiCards } from './DashboardKpiCards';
import { ViscosityMobilitySection } from './ViscosityMobilitySection';
import { ThermalReservoirMonitoring } from './ThermalReservoirMonitoring';
import { CssSrpPerformanceSection } from './CssSrpPerformanceSection';
import { ProductionPerformanceSection } from './ProductionPerformanceSection';
import { SystemHealthAlertsSection } from './SystemHealthAlertsSection';
import { BaselineComparisonSection } from './BaselineComparisonSection';
import { ProcessFlowMultiChartSection } from './ProcessFlowMultiChartSection';
import type { WorkstationTab } from '../../pages/SimulationPage';

interface DashboardPanelProps {
  onNavigateTab?: (tab: WorkstationTab) => void;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({ onNavigateTab }) => {
  return (
    <AnimationProvider>
      <div className="space-y-5 font-sans">
        {/* 1. Top Live Header */}
        <DashboardHeader />

        {/* 2. 8 KPI Overview Cards */}
        <DashboardKpiCards />

        {/* 3. Engineering Causal Flow & Viscosity Condition */}
        <ViscosityMobilitySection />

        {/* 4. Thermal & Reservoir Monitoring & Inlet/Outlet Balance */}
        <ThermalReservoirMonitoring />

        {/* 5. CSS & SRP Mechanical Performance Workstation */}
        <CssSrpPerformanceSection />

        {/* 6. Production Yield & Live Production Line Chart */}
        <ProductionPerformanceSection />

        {/* 7. System Health, Radial Risk Radials & Active Alerts */}
        <SystemHealthAlertsSection onNavigateTab={onNavigateTab} />

        {/* 8. Normal Baseline vs Current & 3-Way Benchmark */}
        <BaselineComparisonSection />

        {/* 9. Process Flow Pipeline & Selectable Multi-Metric Chart */}
        <ProcessFlowMultiChartSection />
      </div>
    </AnimationProvider>
  );
};
export default DashboardPanel;
