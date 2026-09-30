import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AiEngineeringExplanationPanel } from '../components/simulation/AiEngineeringExplanationPanel';
import { SimulationHistoricalIncidents } from '../components/simulation/SimulationHistoricalIncidents';
import { DigitalTwinViewport } from '../components/digital-twin/DigitalTwinViewport';
import './DigitalTwinPage.css';
import { SimulationControlsAndComparison } from '../components/simulation/SimulationControlsAndComparison';
import { SimulationResultComparison } from '../components/simulation/SimulationResultComparison';
import { SimulationAiSummaryAndAlerts } from '../components/simulation/SimulationAiSummaryAndAlerts';
import { useScenarioStore } from '../simulation/scenario';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { EngineeringMetricsPanel } from '../components/simulation/EngineeringMetricsPanel';
import { NormalOperatingConditionPanel } from '../components/simulation/NormalOperatingConditionPanel';
import {
  Activity,
  Brain,
  GitCompare,
  CheckCircle2,
  Cpu,
  Flame,
  ShieldAlert,
  LayoutDashboard,
  Compass,
} from 'lucide-react';

const HistoricalValidationPanel = lazy(() =>
  import('../components/simulation/HistoricalValidationPanel').then((m) => ({
    default: m.HistoricalValidationPanel,
  }))
);

const UncertaintyAnalysisPanel = lazy(() =>
  import('../components/simulation/UncertaintyAnalysisPanel').then((m) => ({
    default: m.UncertaintyAnalysisPanel,
  }))
);

const EngineeringConfidencePanel = lazy(() =>
  import('../components/simulation/EngineeringConfidencePanel').then((m) => ({
    default: m.EngineeringConfidencePanel,
  }))
);

const DashboardPanel = lazy(() =>
  import('../components/dashboard/DashboardPanel').then((m) => ({
    default: m.DashboardPanel,
  }))
);

const SPMOptimizerPanel = lazy(() =>
  import('../components/simulation/SPMOptimizerPanel').then((m) => ({
    default: m.SPMOptimizerPanel,
  }))
);

const CSSOptimizerPanel = lazy(() =>
  import('../components/simulation/CSSOptimizerPanel').then((m) => ({
    default: m.CSSOptimizerPanel,
  }))
);

const PredictiveMaintenancePanel = lazy(() =>
  import('../components/simulation/PredictiveMaintenancePanel').then((m) => ({
    default: m.PredictiveMaintenancePanel,
  }))
);


const AnalysisPanelFallback: React.FC<{ label: string }> = ({ label }) => (
  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-xs text-slate-400 flex items-center justify-between shadow-md">
    <span className="font-sans font-medium">Loading {label}...</span>
    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
  </div>
);

export type WorkstationTab =  | 'DASHBOARD'
  | 'TWIN'
  | 'SPM_OPTIMIZER'
  | 'CSS_OPTIMIZER'
  | 'PREDICTIVE_MAINTENANCE'
  | 'NOC'
  | 'RESULTS'
  | 'VALIDATION'
  | 'AI_COPILOT'
  ;

interface NavTabItem {
  id: WorkstationTab;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

const NAV_TABS: NavTabItem[] = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live Overview' },
  { id: 'TWIN', label: 'Digital Twin & Simulation', icon: Activity, badge: 'Live' },
  { id: 'SPM_OPTIMIZER', label: 'SPM Optimizer', icon: Cpu, badge: '2D Twin' },
  { id: 'CSS_OPTIMIZER', label: 'CSS Optimizer', icon: Flame, badge: 'Thermal' },
  { id: 'PREDICTIVE_MAINTENANCE', label: 'Predictive Maintenance', icon: ShieldAlert, badge: 'Health' },
  { id: 'NOC', label: 'Baseline NOC', icon: Compass, badge: 'Reference' },
  { id: 'RESULTS', label: 'Results & Comparison', icon: GitCompare, badge: 'Live metrics' },
  { id: 'VALIDATION', label: 'Validation & Confidence', icon: CheckCircle2, badge: 'Evidence' },
  { id: 'AI_COPILOT', label: 'AI Copilot & Evidence', icon: Brain, badge: 'RAG' },
];

export const SimulationPage: React.FC = () => {
  useDocumentTitle({
    title: "Simulation Workstation",
    description:
      "Physics-grounded simulation workstation: twin controls, ML advisory, results, validation and confidence.",
  });
  useEffect(() => {
    const startTime = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      console.log(`[SIMULATION PERF] SimulationPage mounted & rendered in ${renderTime.toFixed(2)} ms`);
    });
  }, []);

  const {
    activeScenario,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpOptimizationResult,
    aiRiskResult,
  } = useScenarioStore();

  const [activeWorkstationTab, setActiveWorkstationTab] = useState<WorkstationTab>('DASHBOARD');

  const inputs = activeScenario.inputs;

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER BANNER */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl transition-all duration-500 hover:shadow-2xl group">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-gradient-to-br from-sky-400/20 to-indigo-500/20 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span>Jodhpur Sandstone • Baghewala Heavy Oil Field, Rajasthan • OIL India Limited</span>
          </div>
          <h1 className="text-2xl font-bold font-sans text-slate-800 dark:text-slate-100 tracking-tight mb-1 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
            BAGHEWALA DIGITAL TWIN WORKSTATION
          </h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Physics-grounded reactive simulator & ML operating advisory across the full engineering workflow.
          </p>
        </div>
      </div>

      {/* 2. GITHUB-STYLE SECTION HEADER NAVIGATION BAR */}
      <nav className="bg-[#0d1117] border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden sticky top-3 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-3 py-1.5 text-xs">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeWorkstationTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveWorkstationTab(tab.id)}
                className={`relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap cursor-pointer select-none group ${
                  isActive
                    ? 'text-white font-semibold bg-slate-800/90 shadow-sm after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-sky-400 after:rounded-full'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. SEPARATED SECTION CONTENT BASED ON ACTIVE HEADER TAB */}
      
      {/* TAB 0: LIVE OPERATIONS DASHBOARD */}
      {activeWorkstationTab === 'DASHBOARD' && (
        <Suspense fallback={<AnalysisPanelFallback label="Live Operations Dashboard" />}>
          <DashboardPanel onNavigateTab={setActiveWorkstationTab} />
        </Suspense>
      )}
      
      {/* TAB 1: DIGITAL TWIN & SIMULATION */}
      {activeWorkstationTab === 'TWIN' && (
        <div className="space-y-6">
          <div className="flex flex-col xl:flex-row gap-5 items-start">
            {/* Left: 2D Cinematic Digital Twin Viewport & Live AI Operating Summary */}
            <div className="w-full xl:w-[70%] 2xl:w-[73%] flex flex-col min-w-0 space-y-5">
              <DigitalTwinViewport className="digital-twin-color-scope" />
              {/* Simulation AI Operating Summary & Alerts */}
              <SimulationAiSummaryAndAlerts />
              <EngineeringMetricsPanel showTimeline={false} />
            </div>

            {/* Right: Simulation Controls Sidebar */}
            <div className="w-full xl:w-[30%] 2xl:w-[27%] xl:sticky xl:top-20 overflow-y-auto max-h-[92vh] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <SimulationControlsAndComparison />
            </div>
          </div>

          {/* 8-Stage Visual Dependency Chain Pipeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" />
              Simulation Dependency Pipeline
            </h3>
            <div className="space-y-4 font-mono text-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                Causal Model Chain: Parameter inputs propagate reactively through thermal heating, viscosity reduction, mobility, inflow, SRP lift, and risk evaluation.
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center text-xs relative font-sans">
                {/* STAGE 1: INPUTS */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-md transition-all duration-300 relative group">
                  <span className="text-slate-500 dark:text-slate-400 block font-bold tracking-wider text-[10px] mb-2 uppercase">1. Inputs</span>
                  <span className="text-sky-700 dark:text-sky-400 font-bold block text-sm">
                    {inputs.reservoirTemperatureC}°C<br/>{inputs.vfdFrequencyHz}Hz
                  </span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 mt-2.5 py-1 px-2 rounded-md block font-bold border border-emerald-200 dark:border-emerald-800/80 tracking-widest shadow-sm">VALIDATED</span>
                </div>

                {/* STAGE 2: THERMAL */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all duration-300 relative group">
                  <span className="text-slate-500 dark:text-slate-400 block font-bold tracking-wider text-[10px] mb-2 uppercase">2. Thermal</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold block text-sm">
                    {thermalResult.predictedReservoirTemperatureC.toFixed(1)}°C
                  </span>
                  <span className="text-[11px] text-rose-500 dark:text-rose-300 mt-1 block font-bold bg-rose-50 dark:bg-rose-950/40 rounded-md py-0.5 border border-rose-100 dark:border-rose-900/40">
                    {thermalResult.temperatureChangeC >= 0 ? `+${thermalResult.temperatureChangeC.toFixed(1)}°C` : `${thermalResult.temperatureChangeC.toFixed(1)}°C`}
                  </span>
                </div>

                {/* STAGE 3: VISCOSITY */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-300 relative group">
                  <span className="text-slate-500 dark:text-slate-400 block font-bold tracking-wider text-[10px] mb-2 uppercase">3. Viscosity</span>
                  <span className="text-purple-700 dark:text-purple-400 font-bold block text-sm">
                    {viscosityResult.estimatedViscosityCp.toLocaleString()} cP
                  </span>
                  <span className="text-[11px] text-purple-600 dark:text-purple-300 mt-1 block font-bold bg-purple-50 dark:bg-purple-950/40 rounded-md py-0.5 border border-purple-100 dark:border-purple-900/40">
                    {viscosityResult.viscosityChangePercent}%
                  </span>
                </div>

                {/* STAGE 4: MOBILITY */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all duration-300 relative group">
                  <span className="text-slate-500 dark:text-slate-400 block font-bold tracking-wider text-[10px] mb-2 uppercase">4. Mobility</span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold block text-sm">
                    {mobilityResult.mobilityDcP.toFixed(4)} <span className="text-[10px]">D/cP</span>
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-300 mt-1 block font-bold bg-amber-50 dark:bg-amber-950/40 rounded-md py-0.5 border border-amber-100 dark:border-amber-900/40">
                    +{mobilityResult.mobilityChangePercent}%
                  </span>
                </div>

                {/* STAGE 5: PRODUCTION */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-300 relative group">
                  <span className="text-slate-500 dark:text-slate-400 block font-bold tracking-wider text-[10px] mb-2 uppercase">5. Production</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold block text-sm">
                    {productionResult.estimatedProductionBopd.toFixed(1)} BOPD
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-bold bg-emerald-50 dark:bg-emerald-950/40 rounded-md py-0.5 border border-emerald-100 dark:border-emerald-900/40">
                    +{productionResult.productionChangePercent}%
                  </span>
                </div>

                {/* STAGE 6: SRP LIFT */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-300 dark:hover:border-amber-700 hover:shadow-md transition-all duration-300 relative group">
                  <span className="text-slate-500 dark:text-slate-400 block font-bold tracking-wider text-[10px] mb-2 uppercase">6. SRP Lift</span>
                  <span className="text-orange-600 dark:text-amber-400 font-bold block text-sm">
                    Load: {srpOptimizationResult.currentCandidate.loadIndex.toFixed(0)}%
                  </span>
                  <span className="text-[11px] text-orange-600 dark:text-amber-300 mt-1 block font-bold bg-orange-50 dark:bg-amber-950/40 rounded-md py-0.5 border border-orange-100 dark:border-amber-900/40">
                    Opt: {srpOptimizationResult.optimalCandidate.vfdFrequencyHz}Hz
                  </span>
                </div>

                {/* STAGE 7: RISK */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all duration-300 relative group">
                  <span className="text-slate-500 dark:text-slate-400 block font-bold tracking-wider text-[10px] mb-2 uppercase">7. Risk</span>
                  <span className={`font-bold block text-sm mt-0.5 ${
                    aiRiskResult.riskLevel === 'HIGH'
                      ? 'text-rose-600 dark:text-rose-400'
                      : aiRiskResult.riskLevel === 'MODERATE'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {aiRiskResult.riskLevel}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block font-bold bg-slate-50 dark:bg-slate-800/50 rounded-md py-0.5 border border-slate-100 dark:border-slate-800">
                    Score: {aiRiskResult.riskScore}/100
                  </span>
                </div>

                {/* STAGE 8: DECISION */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 shadow-md hover:border-emerald-400 hover:shadow-lg transition-all duration-300 relative group">
                  <span className="text-emerald-700 dark:text-emerald-300 block font-bold tracking-wider text-[10px] mb-2 uppercase">8. Decision</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold block text-[11px] mt-1 tracking-widest bg-white dark:bg-emerald-900/40 py-1 px-1 rounded border border-emerald-100 dark:border-emerald-800">
                    ADVISORY
                  </span>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300/80 mt-1 block font-bold">
                    0 ACTUATION
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SPM OPTIMIZER WORKSTATION */}
      {activeWorkstationTab === 'SPM_OPTIMIZER' && (
        <Suspense fallback={<AnalysisPanelFallback label="SPM Optimizer Workstation" />}>
          <SPMOptimizerPanel />
        </Suspense>
      )}

      {/* TAB: CSS OPTIMIZER WORKSTATION */}
      {activeWorkstationTab === 'CSS_OPTIMIZER' && (
        <Suspense fallback={<AnalysisPanelFallback label="CSS Optimizer Workstation" />}>
          <CSSOptimizerPanel />
        </Suspense>
      )}

      {/* TAB: PREDICTIVE MAINTENANCE WORKSTATION */}
      {activeWorkstationTab === 'PREDICTIVE_MAINTENANCE' && (
        <Suspense fallback={<AnalysisPanelFallback label="Predictive Maintenance Workstation" />}>
          <PredictiveMaintenancePanel />
        </Suspense>
      )}


      {/* BASELINE NORMAL OPERATING CONDITION */}
      {activeWorkstationTab === 'NOC' && (
        <div className="space-y-6">
          <NormalOperatingConditionPanel />
        </div>
      )}

      {/* RESULTS & COMPARISON */}
      {activeWorkstationTab === 'RESULTS' && (
        <div className="space-y-6">
          <SimulationResultComparison />
        </div>
      )}

      {/* VALIDATION & CONFIDENCE */}
      {activeWorkstationTab === 'VALIDATION' && (
        <div className="space-y-6">
          <Suspense fallback={<AnalysisPanelFallback label="Historical Validation" />}>
            <HistoricalValidationPanel />
          </Suspense>
          <Suspense fallback={<AnalysisPanelFallback label="Uncertainty Analysis" />}>
            <UncertaintyAnalysisPanel />
          </Suspense>
          <Suspense fallback={<AnalysisPanelFallback label="Engineering Confidence" />}>
            <EngineeringConfidencePanel />
          </Suspense>
        </div>
      )}

      {/* AI COPILOT & EVIDENCE */}
      {activeWorkstationTab === 'AI_COPILOT' && (
        <div className="space-y-6">
          <AiEngineeringExplanationPanel />
          <SimulationHistoricalIncidents />
        </div>
      )}

    </div>
  );
};
export default SimulationPage;
