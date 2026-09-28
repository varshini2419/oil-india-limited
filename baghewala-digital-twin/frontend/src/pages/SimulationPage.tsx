import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AiEngineeringExplanationPanel } from '../components/simulation/AiEngineeringExplanationPanel';
import { SimulationHistoricalIncidents } from '../components/simulation/SimulationHistoricalIncidents';
import { DigitalTwinViewport } from '../components/digital-twin/DigitalTwinViewport';
import { NormalOperatingConditionPanel } from '../components/simulation/NormalOperatingConditionPanel';
import { MLViscosityControlPanel } from '../components/simulation/MLViscosityControlPanel';
import { SimulationControlsAndComparison } from '../components/simulation/SimulationControlsAndComparison';
import { SimulationResultComparison } from '../components/simulation/SimulationResultComparison';
import { SimulationReportModal } from '../components/simulation/SimulationReportModal';
import { SimulationAiSummaryAndAlerts } from '../components/simulation/SimulationAiSummaryAndAlerts';
import { useScenarioStore } from '../simulation/scenario';
import {
  Activity,
  Brain,
  Compass,
  GitCompare,
  Sliders,
  Database,
  CheckCircle2,
  Zap,
  FileText,
  Sparkles,
  Download,
} from 'lucide-react';

const ScenarioOptimizationPanel = lazy(() =>
  import('../components/simulation/ScenarioOptimizationPanel').then((m) => ({
    default: m.ScenarioOptimizationPanel,
  }))
);

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

const ProductionPilotPanel = lazy(() =>
  import('../components/simulation/ProductionPilotPanel').then((m) => ({
    default: m.ProductionPilotPanel,
  }))
);

const AnalysisPanelFallback: React.FC<{ label: string }> = ({ label }) => (
  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-xs text-slate-400 flex items-center justify-between shadow-md">
    <span className="font-sans font-medium">Loading {label}...</span>
    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
  </div>
);

type WorkstationTab =
  | 'TWIN'
  | 'ML_ADVISORY'
  | 'NOC'
  | 'RESULTS'
  | 'OPTIMIZATION'
  | 'HISTORICAL'
  | 'CONFIDENCE'
  | 'PILOT'
  | 'AI_COPILOT'
  | 'REPORT';

interface NavTabItem {
  id: WorkstationTab;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

const NAV_TABS: NavTabItem[] = [
  { id: 'TWIN', label: 'Digital Twin & Simulation', icon: Activity, badge: 'Live' },
  { id: 'ML_ADVISORY', label: 'ML Advisory', icon: Brain, badge: '30 Wells' },
  { id: 'NOC', label: 'Baseline NOC', icon: Compass, badge: 'Reference' },
  { id: 'RESULTS', label: 'Results & Comparison', icon: GitCompare, badge: '14 Metrics' },
  { id: 'OPTIMIZATION', label: 'Phase 4: Optimization', icon: Sliders, badge: 'Pareto' },
  { id: 'HISTORICAL', label: 'Phase 5: Validation', icon: Database, badge: 'Field Match' },
  { id: 'CONFIDENCE', label: 'Phase 5: Confidence', icon: CheckCircle2, badge: 'SPE 100642' },
  { id: 'PILOT', label: 'Phase 6: Pilot', icon: Zap, badge: 'SCADA Replay' },
  { id: 'AI_COPILOT', label: 'AI Explanation & RAG', icon: FileText, badge: '5 Steps' },
  { id: 'REPORT', label: 'Decision Report', icon: Sparkles, badge: '20 Sections' },
];

export const SimulationPage: React.FC = () => {
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

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeWorkstationTab, setActiveWorkstationTab] = useState<WorkstationTab>('TWIN');

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
            Physics-grounded reactive simulator & ML operating advisory across 6 engineering phases.
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
      
      {/* TAB 1: DIGITAL TWIN & SIMULATION */}
      {activeWorkstationTab === 'TWIN' && (
        <div className="space-y-6">
          <div className="flex flex-col xl:flex-row gap-5 items-start">
            {/* Left: 2D Cinematic Digital Twin Viewport & Live AI Operating Summary */}
            <div className="w-full xl:w-[70%] 2xl:w-[73%] flex flex-col min-w-0 space-y-5">
              <DigitalTwinViewport />
              {/* Simulation AI Operating Summary & Alerts */}
              <SimulationAiSummaryAndAlerts />
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

      {/* TAB 2: ML VISCOSITY ADVISORY */}
      {activeWorkstationTab === 'ML_ADVISORY' && (
        <div className="space-y-6">
          <MLViscosityControlPanel />
        </div>
      )}

      {/* TAB 3: BASELINE NORMAL OPERATING CONDITION */}
      {activeWorkstationTab === 'NOC' && (
        <div className="space-y-6">
          <NormalOperatingConditionPanel />
        </div>
      )}

      {/* TAB 4: RESULTS & COMPARISON */}
      {activeWorkstationTab === 'RESULTS' && (
        <div className="space-y-6">
          <SimulationResultComparison />
        </div>
      )}

      {/* TAB 5: PHASE 4 OPTIMIZATION */}
      {activeWorkstationTab === 'OPTIMIZATION' && (
        <Suspense fallback={<AnalysisPanelFallback label="Phase 4 Optimization Panel" />}>
          <ScenarioOptimizationPanel />
        </Suspense>
      )}

      {/* TAB 6: PHASE 5 HISTORICAL VALIDATION */}
      {activeWorkstationTab === 'HISTORICAL' && (
        <div className="space-y-6">
          <Suspense fallback={<AnalysisPanelFallback label="Phase 5 Historical Validation" />}>
            <HistoricalValidationPanel />
          </Suspense>
          <Suspense fallback={<AnalysisPanelFallback label="Phase 5 Uncertainty Analysis" />}>
            <UncertaintyAnalysisPanel />
          </Suspense>
        </div>
      )}

      {/* TAB 7: PHASE 5 CONFIDENCE */}
      {activeWorkstationTab === 'CONFIDENCE' && (
        <Suspense fallback={<AnalysisPanelFallback label="Phase 5 Engineering Confidence" />}>
          <EngineeringConfidencePanel />
        </Suspense>
      )}

      {/* TAB 8: PHASE 6 PILOT */}
      {activeWorkstationTab === 'PILOT' && (
        <Suspense fallback={<AnalysisPanelFallback label="Phase 6 Production Pilot" />}>
          <ProductionPilotPanel />
        </Suspense>
      )}

      {/* TAB 9: AI EXPLANATION & RAG */}
      {activeWorkstationTab === 'AI_COPILOT' && (
        <div className="space-y-6">
          <AiEngineeringExplanationPanel />
          <SimulationHistoricalIncidents />
        </div>
      )}

      {/* TAB 10: DECISION REPORT GENERATOR */}
      {activeWorkstationTab === 'REPORT' && (
        <div className="space-y-6">
          <div className="p-8 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-950/40 dark:via-blue-900/30 dark:to-indigo-950/40 border border-sky-200 dark:border-sky-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-5">
              <div className="p-4 bg-white dark:bg-sky-900/60 rounded-2xl border border-sky-200 dark:border-sky-700 shadow-md">
                <FileText className="w-10 h-10 text-sky-600 dark:text-sky-300" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-white dark:bg-sky-950 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                    CANONICAL DECISION AUDIT
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    20 SECTIONS
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                  Comprehensive Baghewala Engineering Decision Report
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
                  Exports a multi-phase audit trace comprising thermodynamic heating plume calculations, Vogel heavy-oil inflow performance curves, SRP rod load index ratings, RAG-grounded field incident evidence, and markdown/JSON report bundles.
                </p>
              </div>
            </div>

            <button
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>GENERATE FULL REPORT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-sans">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <strong className="text-slate-800 dark:text-slate-100 font-bold block text-sm">Full Causal Decision Trace</strong>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Step-by-step causal chain recording exactly how ambient weather and thermal injection inputs propagated downstream into viscosity and production yield.
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <strong className="text-slate-800 dark:text-slate-100 font-bold block text-sm">Multimodal RAG Evidence</strong>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Synthesized citations from Oil India Limited operational records and SPE technical papers with provenance tags and similarity scores.
              </p>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <strong className="text-slate-800 dark:text-slate-100 font-bold block text-sm">Multi-Format Export</strong>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Download formatted GitHub Flavored Markdown files or raw machine-readable JSON for integration into SCADA archives and regulatory submissions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PROMPT 8 MODAL */}
      <SimulationReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
};
export default SimulationPage;
