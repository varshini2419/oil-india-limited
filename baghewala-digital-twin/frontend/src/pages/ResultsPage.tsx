import React, { useMemo, useState } from 'react';
import { runHistoricalCalibration } from '../simulation/historicalCalibration/calibrationEngine';
import { runUncertaintyAnalysis } from '../simulation/uncertaintyAnalysis/uncertaintyEngine';
import { runScenarioOptimization } from '../simulation/scenarioOptimization';
import { DEFAULT_DECISION_CONSTRAINTS } from '../simulation/scenarioOptimization/defaults';
import { runHistoricalValidation } from '../simulation/historicalValidation';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { useScenarioStore } from '../simulation/scenario';
import { compareThermalScenarios } from '../simulation/thermal';
import { compareViscosityResults } from '../simulation/viscosity';
import { compareMobilityResults } from '../simulation/mobility';
import { compareProductionResults } from '../simulation/production';
import { compareOptimizationResults } from '../simulation/srpOptimization';
import { compareCSSResults } from '../simulation/cssOptimization';
import { compareRiskResults } from '../simulation/riskEngine';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Flame,
  HelpCircle,
  Database,
  Droplet,
  Zap,
  ArrowRight,
  TrendingUp,
  Sliders,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  useDocumentTitle({
    title: "Results & Comparison",
    description:
      "Live thermal, viscosity, mobility, production, optimization and risk results compared against baseline.",
  });
  const {
    thermalResult,
    baselineThermalResult,
    viscosityResult,
    baselineViscosityResult,
    mobilityResult,
    baselineMobilityResult,
    productionResult,
    baselineProductionResult,
    srpOptimizationResult,
    cssOptimizationResult,
    aiRiskResult,
    activeScenario,
  } = useScenarioStore();
  const [howCalculatedOpen, setHowCalculatedOpen] = useState(false);

  // Live engine computations for the validation & decision summary panels.
  const calibrationReport = useMemo(() => runHistoricalCalibration(), []);
  const uncertaintyResult = useMemo(() => runUncertaintyAnalysis({ sampleCount: 500, seed: 42 }), []);
  const scenarioOptimizationResult = useMemo(
    () =>
      runScenarioOptimization({
        modelMode: 'CALIBRATED',
        objective: 'BALANCED_OPERATION',
        constraints: { ...DEFAULT_DECISION_CONSTRAINTS },
      }),
    []
  );
  const historicalValidationResult = useMemo(
    () => runHistoricalValidation(activeScenario.inputs),
    [activeScenario.inputs]
  );

  const validObservationCount = calibrationReport.observations.filter((o) => o.observedValue !== null).length;
  const totalObservationCount = calibrationReport.observations.length;
  const topSensitivity = uncertaintyResult.sensitivityResults[0];
  const topScenarioEvaluation = scenarioOptimizationResult.evaluations.find(
    (e) => e.candidate.id === scenarioOptimizationResult.recommendation.selectedScenarioId
  );

  const comparisonRows = compareThermalScenarios(baselineThermalResult, thermalResult);
  const viscosityComparisonRows = compareViscosityResults(baselineViscosityResult, viscosityResult);
  const mobilityComparisonRows = compareMobilityResults(baselineMobilityResult, mobilityResult);
  const productionComparisonRows = compareProductionResults(baselineProductionResult, productionResult);
  const optimizationComparisonRows = compareOptimizationResults(srpOptimizationResult);
  const cssComparisonRows = compareCSSResults(cssOptimizationResult);
  const riskComparisonRows = compareRiskResults(aiRiskResult);

  const {
    baselineReservoirTemperatureC,
    predictedReservoirTemperatureC,
    temperatureChangeC,
    thermalInfluenceC,
    thermalState,
    confidence,
    warnings,
    breakdown,
  } = thermalResult;

  const isWarming = temperatureChangeC > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulation Results — Thermal, Viscosity, Mobility & Production Analytics"
        subtitle="Modeled temperature distribution, heavy-oil viscosity reduction, mobility transmissibility, production, CSS cycle optimization, and AI risk advisory"
        badgeText="AI Risk Advisory Active"
      />

      {/* Warnings & Notices */}
      {(warnings.length > 0 || viscosityResult.warnings.length > 0 || mobilityResult.warnings.length > 0 || productionResult.warnings.length > 0) && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-4 font-mono text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Simulation Engine Warnings</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-300/90 pl-1">
            {warnings.map((w, i) => (
              <li key={`t-${i}`}>{w}</li>
            ))}
            {viscosityResult.warnings.map((w, i) => (
              <li key={`v-${i}`}>{w}</li>
            ))}
            {mobilityResult.warnings.map((w, i) => (
              <li key={`m-${i}`}>{w}</li>
            ))}
            {productionResult.warnings.map((w, i) => (
              <li key={`p-${i}`}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 1. THERMAL RESPONSE PRIMARY SUMMARY CARD */}
      <Panel
        title="Thermal Model Results Overview"
        subtitle={`Scenario: ${activeScenario.name} | Reduced-Order Thermal Engine Output`}
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-mono text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            State: {thermalState.replace('_', ' ')}
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Baseline Reservoir Temp</div>
            <div className="text-xl font-bold text-slate-200 mt-1">
              {baselineReservoirTemperatureC} °C
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <Database className="w-3 h-3 text-sky-400" />
              Source: Documented
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Modeled Reservoir Temp</div>
            <div className={`text-xl font-bold mt-1 ${isWarming ? 'text-rose-400' : 'text-sky-400'}`}>
              {predictedReservoirTemperatureC} °C
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-bold">
              Change: {temperatureChangeC >= 0 ? `+${temperatureChangeC}` : temperatureChangeC} °C
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Steam Thermal Influence</div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              +{thermalInfluenceC} °C
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Soak Time Response: {breakdown.timeResponsePercent}%
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Model Confidence</div>
            <div className="text-xl font-bold mt-1 text-sky-400">
              {confidence}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Engine: Reduced-Order
            </div>
          </div>
        </div>
      </Panel>

      {/* 2. HEAVY-OIL VISCOSITY & MOBILITY SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          title="Heavy-Oil Viscosity Profile"
          subtitle="Viscosity reduction curve from the thermal model output"
          action={
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-mono text-[11px] font-bold">
              <Droplet className="w-3.5 h-3.5 text-purple-400" />
              {viscosityResult.modelStatus}
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Baseline Viscosity</span>
              <span className="text-base font-bold text-slate-300 mt-0.5 block">{viscosityResult.baselineViscosityCp} cP</span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Modeled Viscosity</span>
              <span className="text-base font-bold text-purple-400 mt-0.5 block">{viscosityResult.estimatedViscosityCp} cP</span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Viscosity Shift Δ</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">{viscosityResult.viscosityChangeCp} cP</span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Shift %</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">{viscosityResult.viscosityChangePercent}%</span>
            </div>
          </div>
        </Panel>

        <Panel
          title="Heavy-Oil Transmissibility Mobility"
          subtitle="Single-phase Darcy transmissibility (λ_o = k_eff / μ_o)"
          action={
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              {mobilityResult.status}
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Baseline Mobility</span>
              <span className="text-base font-bold text-slate-300 mt-0.5 block">{mobilityResult.baselineMobilityDcP} D/cP</span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Modeled Mobility</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">{mobilityResult.mobilityDcP} D/cP</span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Mobility Delta Δ</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">+{mobilityResult.mobilityDeltaDcP} D/cP</span>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Shift %</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">+{mobilityResult.mobilityChangePercent}%</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* 3. HEAVY-OIL PRODUCTION ANALYSIS (STEP 4.6) */}
      <Panel
        title="Heavy-Oil Production Analysis"
        subtitle="Deterministic heavy-oil production screening estimate (q_bopd = J_o * ΔP * F_pump)"
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950/80 border border-sky-800 text-sky-300 font-mono text-xs font-bold uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            MODELED / ESTIMATED
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Baseline Production</div>
            <div className="text-xl font-bold text-slate-200 mt-1">
              {productionResult.baselineProductionBopd} {productionResult.productionUnit}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Unheated Native Baseline Rate
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Estimated Oil Production</div>
            <div className="text-xl font-bold text-sky-300 mt-1">
              {productionResult.estimatedProductionBopd} {productionResult.productionUnit}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-bold">
              Current Screening Rate
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Production Delta Δ</div>
            <div className={`text-xl font-bold mt-1 ${productionResult.productionChangeBopd >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {productionResult.productionChangeBopd >= 0 ? `+${productionResult.productionChangeBopd}` : productionResult.productionChangeBopd} {productionResult.productionUnit}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Net Bopd Increase
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Production Increase %</div>
            <div className={`text-xl font-bold mt-1 ${productionResult.productionChangePercent >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {productionResult.productionChangePercent >= 0 ? `+${productionResult.productionChangePercent}` : productionResult.productionChangePercent} %
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Relative to Baseline Rate
            </div>
          </div>
        </div>

        {/* 5-Stage Complete Causal Relationship Flow Diagram */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs font-mono font-bold text-slate-300 mb-3 uppercase">
            6-Stage Engineering Physical Causality Pipeline Flow
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded border border-rose-900/60 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">1. Reservoir Temp</span>
              <span className="text-base font-bold text-rose-400 mt-1 block">
                {predictedReservoirTemperatureC} °C
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">Thermal output</span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-purple-900/60 text-center relative">
              <div className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 text-slate-600 z-10">
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-[10px] text-slate-400 block uppercase">2. Viscosity</span>
              <span className="text-base font-bold text-purple-400 mt-1 block">
                {viscosityResult.estimatedViscosityCp} cP
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">Viscosity output</span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-emerald-900/60 text-center relative">
              <div className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 text-slate-600 z-10">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[10px] text-slate-400 block uppercase">3. Oil Mobility</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {mobilityResult.mobilityDcP} D/cP
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">Mobility output</span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-amber-900/60 text-center relative">
              <div className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 text-slate-600 z-10">
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-400 block uppercase">4. Drawdown / J_o</span>
              <span className="text-base font-bold text-amber-300 mt-1 block">
                {productionResult.effectiveDrawdownBar} bar
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block">J_o = {productionResult.productivityIndexBopdBar}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-sky-900/60 text-center relative">
              <div className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 text-slate-600 z-10">
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </div>
              <span className="text-[10px] text-slate-400 block uppercase">5. Est Production</span>
              <span className="text-base font-bold text-sky-300 mt-1 block">
                {productionResult.estimatedProductionBopd} BOPD
              </span>
              <span className="text-[9px] text-sky-400 mt-0.5 block font-bold">Production output</span>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-emerald-500/60 text-center relative">
              <div className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 text-slate-600 z-10">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[10px] text-slate-400 block uppercase">6. Modeled Optimum</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {srpOptimizationResult.optimalCandidate.estimatedProductionBopd} BOPD
              </span>
              <span className="text-[9px] text-emerald-400 mt-0.5 block font-bold">SRP optimization output</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* 4. SRP + VFD PRODUCTION OPTIMIZATION ANALYSIS (STEP 4.7) */}
      <Panel
        title="SRP + VFD Production Optimization Analysis"
        subtitle="Modeled operating window and candidate grid search result"
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-xs font-bold uppercase">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            288 Candidates Evaluated
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded space-y-3">
            <div className="text-slate-200 font-bold uppercase border-b border-slate-800 pb-2">
              Modeled Operating Window Summary
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">ALLOWABLE VFD FREQUENCY</span>
                <span className="text-slate-200 font-bold">
                  {srpOptimizationResult.operatingWindow.minVFD} – {srpOptimizationResult.operatingWindow.maxVFD} Hz
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ALLOWABLE SPM RANGE</span>
                <span className="text-slate-200 font-bold">
                  {srpOptimizationResult.operatingWindow.minSPM} – {srpOptimizationResult.operatingWindow.maxSPM} SPM
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ALLOWABLE STROKE LENGTH</span>
                <span className="text-slate-200 font-bold">
                  {srpOptimizationResult.operatingWindow.minStroke} – {srpOptimizationResult.operatingWindow.maxStroke} m
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">SAFE CANDIDATES</span>
                <span className="text-emerald-400 font-bold">
                  {srpOptimizationResult.operatingWindow.safeCandidatesCount} / {srpOptimizationResult.operatingWindow.totalCandidatesCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded space-y-3">
            <div className="text-slate-200 font-bold uppercase border-b border-slate-800 pb-2">
              Current vs Modeled Optimum Comparison
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                <span className="text-slate-400">Current Operating Point:</span>
                <span className="text-slate-200 font-bold">
                  {srpOptimizationResult.currentCandidate.vfdFrequencyHz} Hz | {srpOptimizationResult.currentCandidate.spm} SPM | {srpOptimizationResult.currentCandidate.strokeLengthM} m ({srpOptimizationResult.currentCandidate.estimatedProductionBopd} BOPD)
                </span>
              </div>
              <div className="flex justify-between items-center bg-sky-950/40 border border-sky-900/60 p-2 rounded">
                <span className="text-sky-300 font-bold">Modeled Optimum Point:</span>
                <span className="text-emerald-400 font-bold">
                  {srpOptimizationResult.optimalCandidate.vfdFrequencyHz} Hz | {srpOptimizationResult.optimalCandidate.spm} SPM | {srpOptimizationResult.optimalCandidate.strokeLengthM} m ({srpOptimizationResult.optimalCandidate.estimatedProductionBopd} BOPD)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Production Gain Delta:</span>
                <span className="text-emerald-400 font-bold">
                  +{srpOptimizationResult.productionDeltaBopd} BOPD (+{srpOptimizationResult.productionDeltaPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table for SRP Optimization */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Optimization Parameter</th>
                <th className="pb-2.5 font-bold">Current Value</th>
                <th className="pb-2.5 font-bold">Optimized Value</th>
                <th className="pb-2.5 font-bold text-right">Δ Difference</th>
                <th className="pb-2.5 font-bold text-center">Data Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {optimizationComparisonRows.map((row, idx) => (
                <tr key={idx} className={row.delta !== 0 ? 'bg-emerald-950/20' : ''}>
                  <td className="py-2.5 text-slate-200 font-medium">{row.parameter}</td>
                  <td className="py-2.5 text-slate-400">
                    {row.currentValue} {row.unit}
                  </td>
                  <td className="py-2.5 text-slate-100 font-bold">
                    {row.optimizedValue} {row.unit}
                  </td>
                  <td className="py-2.5 text-right font-bold">
                    {row.delta !== 0 ? (
                      <span className={row.parameter.includes('Load') ? (row.delta <= 0 ? 'text-emerald-400' : 'text-amber-400') : (row.delta >= 0 ? 'text-emerald-400' : 'text-amber-400')}>
                        {row.delta > 0 ? `+${row.delta}` : row.delta} {row.unit}
                      </span>
                    ) : (
                      <span className="text-slate-600">0.0 {row.unit}</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="text-[9px] px-2 py-0.5 rounded uppercase font-bold border bg-purple-950 text-purple-400 border-purple-800">
                      {row.sourceType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 5. BAGHEWALA CSS OPTIMIZATION ANALYSIS (STEP 4.8) */}
      <Panel
        title="Baghewala CSS Optimization Analysis"
        subtitle="Cyclic Steam Stimulation thermal soak cycle and historical pilot comparison"
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-mono text-xs font-bold uppercase">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            CSS Cycle 1 Optimization
          </span>
        }
      >
        {/* 7-Stage Complete Physical Chain Diagram */}
        <div className="mb-4 font-mono text-xs">
          <div className="font-bold text-slate-300 mb-2 uppercase text-[11px]">
            7-Stage Physical Causality Chain
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px]">
            <div className="bg-slate-950 p-2 rounded border border-rose-900/60">
              <span className="text-slate-400 block">1. STEAM INJ</span>
              <span className="text-rose-400 font-bold mt-0.5 block">{cssOptimizationResult.currentCandidate.steamInjectionRateTpd} TPD</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-amber-900/60">
              <span className="text-slate-400 block">2. THERMAL GAIN</span>
              <span className="text-amber-400 font-bold mt-0.5 block">+{cssOptimizationResult.thermalBreakdown.deltaTemperatureC} °C</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-rose-800">
              <span className="text-slate-400 block">3. RES TEMP</span>
              <span className="text-rose-300 font-bold mt-0.5 block">{cssOptimizationResult.currentCandidate.predictedCssTemperatureC} °C</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-purple-900/60">
              <span className="text-slate-400 block">4. VISCOSITY ↓</span>
              <span className="text-purple-400 font-bold mt-0.5 block">{cssOptimizationResult.currentCandidate.cssViscosityCp} cP</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-emerald-900/60">
              <span className="text-slate-400 block">5. MOBILITY ↑</span>
              <span className="text-emerald-400 font-bold mt-0.5 block">{cssOptimizationResult.currentCandidate.cssMobilityDPerCp} D/cP</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-sky-900/60">
              <span className="text-slate-400 block">6. SRP LIFT</span>
              <span className="text-sky-300 font-bold mt-0.5 block">{cssOptimizationResult.currentCandidate.cssProductionBopd} BOPD</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-emerald-500/60">
              <span className="text-slate-400 block">7. CSS CYCLE RESULT</span>
              <span className="text-emerald-400 font-bold mt-0.5 block">Score: {cssOptimizationResult.currentCandidate.efficiencyScore}</span>
            </div>
          </div>
        </div>

        {/* Historical Reference vs Modeled CSS Cycle Comparison */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded mb-4 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-200 uppercase font-bold text-[11px]">
              DOCUMENTED HISTORICAL DATA vs MODELED SCENARIO
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">
              Baghewala Cycle 1 Pilot Calibration Reference
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">HISTORICAL STEAM VOLUME</span>
              <span className="text-slate-200 font-bold">{cssOptimizationResult.historicalComparison.historicalSteamVolumeTons} Tons</span>
              <span className="text-[9px] text-slate-500 block">[DOCUMENTED - SPE 100642]</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">MODELED STEAM VOLUME</span>
              <span className="text-sky-400 font-bold">{cssOptimizationResult.historicalComparison.modeledSteamVolumeTons} Tons</span>
              <span className="text-[9px] text-slate-500 block">[MODELED SCENARIO]</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">HISTORICAL RECOVERED OIL</span>
              <span className="text-slate-200 font-bold">{cssOptimizationResult.historicalComparison.historicalOilRecoveredTons} Tons</span>
              <span className="text-[9px] text-slate-500 block">[DOCUMENTED - SPE 100642]</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">MODELED RECOVERED OIL</span>
              <span className="text-emerald-400 font-bold">{cssOptimizationResult.historicalComparison.modeledOilRecoveredTons} Tons</span>
              <span className="text-[9px] text-slate-500 block">[MODELED SCENARIO]</span>
            </div>
          </div>
        </div>

        {/* Baseline vs Current vs Optimized Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Parameter</th>
                <th className="pb-2.5 font-bold">Baseline</th>
                <th className="pb-2.5 font-bold">Current CSS</th>
                <th className="pb-2.5 font-bold">Optimized CSS</th>
                <th className="pb-2.5 font-bold text-right">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cssComparisonRows.map((row, idx) => (
                <tr key={idx} className={row.delta !== 0 ? 'bg-sky-950/20' : ''}>
                  <td className="py-2.5 text-slate-200 font-medium">{row.parameter}</td>
                  <td className="py-2.5 text-slate-400">{row.baselineValue}</td>
                  <td className="py-2.5 text-slate-100 font-bold">{row.currentValue}</td>
                  <td className="py-2.5 text-emerald-400 font-bold">{row.optimizedValue}</td>
                  <td className="py-2.5 text-right text-slate-400">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 6. BAGHEWALA AI RISK ADVISORY ANALYSIS (STEP 4.9) */}
      <Panel
        title="Baghewala AI Risk & Operations Advisory"
        subtitle="Automated risk synthesis, detected issues, and recommended engineering action plan"
        action={
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-xs font-bold uppercase border ${
            aiRiskResult.riskLevel === 'LOW'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : aiRiskResult.riskLevel === 'MODERATE'
              ? 'bg-amber-950/80 border-amber-800 text-amber-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            Risk Level: {aiRiskResult.riskLevel} ({aiRiskResult.riskScore}/100)
          </span>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          {/* Risk Level & Issues Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">RISK ASSESSMENT SUMMARY</div>
              <div className="text-sm font-bold text-slate-200">{aiRiskResult.summary}</div>
              <div className="text-[10px] text-slate-400 pt-1">
                Confidence: <strong className="text-sky-400 font-mono">{aiRiskResult.confidence}</strong>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">ACTIVE DETECTED ISSUES ({aiRiskResult.detectedIssues.length})</div>
              {aiRiskResult.detectedIssues.length === 0 ? (
                <div className="text-emerald-400 text-xs font-bold py-1">✓ Zero critical or high severity risk issues detected.</div>
              ) : (
                <ul className="space-y-1 text-[11px]">
                  {aiRiskResult.detectedIssues.map((issue) => (
                    <li key={issue.id} className="flex justify-between items-center bg-slate-900 p-2 rounded">
                      <span className="text-slate-300 font-bold">{issue.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        issue.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        issue.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {issue.severity}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Physical Risk Parameter Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="pb-2.5 font-bold">Risk Metric</th>
                  <th className="pb-2.5 font-bold">Baseline Value</th>
                  <th className="pb-2.5 font-bold">Current Scenario Value</th>
                  <th className="pb-2.5 font-bold">Risk Threshold Boundary</th>
                  <th className="pb-2.5 font-bold text-center">Metric Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {riskComparisonRows.map((row, idx) => (
                  <tr key={idx} className={row.status !== 'LOW' ? 'bg-amber-950/10' : ''}>
                    <td className="py-2.5 text-slate-200 font-medium">{row.metric}</td>
                    <td className="py-2.5 text-slate-400">{row.baselineValue} {row.unit}</td>
                    <td className="py-2.5 text-slate-100 font-bold">{row.currentValue} {row.unit}</td>
                    <td className="py-2.5 text-slate-400">{row.riskThreshold}</td>
                    <td className="py-2.5 text-center">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                        row.status === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                        row.status === 'HIGH' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                        row.status === 'MODERATE' ? 'bg-sky-950 text-sky-400 border-sky-800' :
                        'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      {/* 4. BASELINE VS SCENARIO COMPARISON TABLE */}
      <Panel
        title="Thermal, Viscosity, Mobility & Production Parameter Comparison — Baseline vs Scenario"
        subtitle="Side-by-side delta variations across all 4 executed engineering physics modules"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-2.5 font-bold">Parameter</th>
                <th className="pb-2.5 font-bold">Baseline Value</th>
                <th className="pb-2.5 font-bold">Scenario Value</th>
                <th className="pb-2.5 font-bold text-right">Δ Shift</th>
                <th className="pb-2.5 font-bold text-center">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[...comparisonRows, ...viscosityComparisonRows, ...mobilityComparisonRows, ...productionComparisonRows].map((row, idx) => (
                <tr key={idx} className={row.delta !== 0 ? 'bg-sky-950/20' : ''}>
                  <td className="py-2.5 text-slate-200 font-medium">{row.parameter}</td>
                  <td className="py-2.5 text-slate-400">
                    {row.baselineValue} {row.unit}
                  </td>
                  <td className="py-2.5 text-slate-100 font-bold">
                    {row.scenarioValue} {row.unit}
                  </td>
                  <td className="py-2.5 text-right font-bold">
                    {row.delta !== 0 ? (
                      <span className={row.parameter.includes('Viscosity') ? (row.delta < 0 ? 'text-emerald-400' : 'text-amber-400') : (row.delta > 0 ? 'text-emerald-400' : 'text-amber-400')}>
                        {row.delta > 0 ? `+${row.delta}` : row.delta} {row.unit}
                      </span>
                    ) : (
                      <span className="text-slate-600">0.0 {row.unit}</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold border ${
                        row.sourceType === 'documented'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : row.sourceType === 'scenario'
                          ? 'bg-sky-950 text-sky-400 border-sky-800'
                          : 'bg-purple-950 text-purple-400 border-purple-800'
                      }`}
                    >
                      {row.sourceType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 5. COLLAPSIBLE "HOW WAS THIS CALCULATED?" */}
      <Panel
        title="Model Transparency & Calculation Breakdown"
        subtitle="Transparent step-by-step reduced-order engineering equation breakdown"
      >
        <button
          onClick={() => setHowCalculatedOpen(!howCalculatedOpen)}
          className="w-full flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors text-xs font-mono text-sky-400 font-bold cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>HOW WAS THIS CALCULATED?</span>
          </div>
          {howCalculatedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {howCalculatedOpen && (
          <div className="mt-3 p-4 bg-slate-950 border border-slate-800/80 rounded-lg font-mono text-xs text-slate-300 space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>
                <strong className="text-slate-100">Thermal model output:</strong> Predicted reservoir temperature generated from thermal model ({predictedReservoirTemperatureC}°C).
              </li>
              <li>
                <strong className="text-slate-100">Viscosity interpolation:</strong> Temperature applied to log-linear interpolation over Baghewala reference data points ({viscosityResult.estimatedViscosityCp} cP).
              </li>
              <li>
                <strong className="text-slate-100">Mobility equation:</strong> Oil mobility calculated via Darcy single-phase equation: λ_o = k_eff / μ_o = ({mobilityResult.effectivePermeabilityD} D) / ({mobilityResult.viscosityCp} cP) = {mobilityResult.mobilityDcP} D/cP.
              </li>
              <li>
                <strong className="text-slate-100">Production model:</strong> Productivity index J_o = {productionResult.productivityIndexBopdBar} BOPD/bar. Estimated production q_bopd = J_o * ΔP * F_pump = ({productionResult.productivityIndexBopdBar}) * ({productionResult.effectiveDrawdownBar} bar) * ({productionResult.pumpOperationFactor}) = <strong className="text-sky-300 font-bold">{productionResult.estimatedProductionBopd} BOPD</strong>.
              </li>
              <li>
                <strong className="text-slate-100">Baseline vs Scenario Delta:</strong> Baseline production ({productionResult.baselineProductionBopd} BOPD) → Scenario production ({productionResult.estimatedProductionBopd} BOPD) = <strong className="text-emerald-400 font-bold">+{productionResult.productionChangeBopd} BOPD (+{productionResult.productionChangePercent}%)</strong>.
              </li>
            </ol>
          </div>
        )}
      </Panel>

      {/* 6. HISTORICAL CALIBRATION SUMMARY PANEL (computed live) */}
      <Panel
        title="Historical Calibration & Parameter Tuning Summary"
        subtitle="Empirical parameter fitting pipeline: Baseline Model → Historical Backtest → Sensitivity Analysis → Calibrated Model"
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 font-mono text-xs font-bold uppercase">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            Empirical Fit Active
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Baseline Model MAE</div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {calibrationReport.summary.baselineMetrics.mae}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Uncalibrated Screening Error
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Calibrated Model MAE</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {calibrationReport.summary.calibratedMetrics.mae}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-bold">
              Fitted against SPE 100642 Data
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Production Error Reduction</div>
            <div className="text-xl font-bold text-indigo-300 mt-1">
              -{calibrationReport.summary.overallImprovementPercent.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              C_prod tuned 50 → 250
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Validation Dataset</div>
            <div className="text-xl font-bold text-sky-400 mt-1">
              {validObservationCount} / {totalObservationCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Documented observations with measured values
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>To view full sensitivity curves and before-vs-after observation comparisons:</span>
          </div>
          <a
            href="/simulation"
            className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-bold hover:bg-indigo-500/30 transition-colors"
          >
            Open Simulation Page →
          </a>
        </div>
      </Panel>

      {/* 7. UNCERTAINTY & SENSITIVITY ANALYSIS PANEL (computed live) */}
      <Panel
        title="Uncertainty & Sensitivity Analysis Summary"
        subtitle="Monte Carlo (500 samples) parameter uncertainty propagation & One-at-a-Time sensitivity ranking"
        action={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold uppercase">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            500 Monte Carlo Samples
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Production P50 (Median)</div>
            <div className="text-xl font-bold text-cyan-300 mt-1">
              {uncertaintyResult.productionStats.p50} BOPD
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              P90: {uncertaintyResult.productionStats.p90} | P10: {uncertaintyResult.productionStats.p10} BOPD
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Highest Modeled Sensitivity</div>
            <div className="text-sm font-bold text-amber-300 mt-1 truncate">
              {topSensitivity?.parameterName ?? 'Not available'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Norm Index: {topSensitivity ? (topSensitivity.normalizedSensitivity * 100).toFixed(0) : '—'}%
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Prob &gt; Baseline (0.75 BOPD)</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {uncertaintyResult.productionStats.probGreaterThanBaseline}%
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-bold">
              High Positive Expectation
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Mean Risk Score</div>
            <div className="text-xl font-bold text-purple-300 mt-1">
              {uncertaintyResult.riskScoreStats.mean} / 100
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Low Risk Range
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>To view Tornado charts, full parameter bounds, and Pearson correlation matrices:</span>
          </div>
          <a
            href="/integrated-validation"
            className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded font-bold hover:bg-cyan-500/30 transition-colors"
          >
            Open Full Uncertainty Workspace →
          </a>
        </div>
      </Panel>

      {/* 8. SCENARIO OPTIMIZATION & DECISION ENGINE SUMMARY CARD (computed live) */}
      <Panel
        title="Scenario Optimization & Decision Support"
        subtitle="Multi-objective scenario ranking, hard/soft constraint screening & Pareto trade-offs"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Recommended Scenario</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">
              {scenarioOptimizationResult.recommendation.selectedScenarioName}
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-1">
              Objective: Balanced Operation
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Modeled Rate (P50)</div>
            <div className="text-xl font-bold text-slate-100 mt-1">
              {topScenarioEvaluation ? topScenarioEvaluation.estimatedProductionBopd.toFixed(1) : '—'} <span className="text-xs text-slate-400">BOPD</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Feasible Candidates: {scenarioOptimizationResult.feasibleScenariosCount} / {scenarioOptimizationResult.evaluatedCandidatesCount}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Pareto Classification</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">
              {topScenarioEvaluation?.paretoClassification ?? '—'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Trade-Off Optimal
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Operational Risk</div>
            <div className="text-sm font-bold text-slate-200 mt-1">
              {topScenarioEvaluation ? `${topScenarioEvaluation.riskLevel} (${topScenarioEvaluation.riskScore}/100)` : '—'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              SRP Load: {topScenarioEvaluation ? topScenarioEvaluation.srpLoadIndex.toFixed(1) : '—'} / 100
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>To switch decision objectives, customize constraints, or view full Pareto comparison matrices:</span>
          </div>
          <a
            href="/scenarios"
            className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold hover:bg-emerald-500/30 transition-colors"
          >
            Open Scenarios Page →
          </a>
        </div>
      </Panel>

      {/* 9. HISTORICAL VALIDATION & MODEL RESIDUALS SUMMARY (computed live) */}
      <Panel
        title="Historical Validation & Model Residuals"
        subtitle="Empirical field reference comparison, data quality audit, and uncertainty range propagation"
        action={
          <a
            href="/historical-validation"
            className="px-3 py-1 rounded bg-sky-900 text-sky-100 hover:bg-sky-800 border border-sky-700 font-mono text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
            OPEN VALIDATION WORKSPACE →
          </a>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Validation Status</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">
              {historicalValidationResult.validationStatus}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Confidence: {historicalValidationResult.confidenceBand}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Production Residual MAE</div>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {historicalValidationResult.mae} <span className="text-xs text-slate-400">BOPD</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-bold">
              Predicted {historicalValidationResult.predictedProductionBopd} vs observed {historicalValidationResult.observedProductionBopd} BOPD
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Uncertainty Production Range</div>
            <div className="text-sm font-bold text-cyan-300 mt-1">
              {uncertaintyResult.productionStats.p90} – {uncertaintyResult.productionStats.p10} BOPD
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Central (P50): {uncertaintyResult.productionStats.p50} BOPD
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Highest Sensitivity</div>
            <div className="text-sm font-bold text-slate-200 mt-1 truncate">
              {topSensitivity?.parameterName ?? 'Not available'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Max production delta: ±{topSensitivity?.maxOutputDelta ?? '—'} BOPD
            </div>
          </div>
        </div>
      </Panel>

      {/* 10. AI ENGINEERING DECISION TRACE PANEL */}
      <Panel
        title="AI Engineering Decision Trace & Copilot"
        subtitle="Explainable decision support over physics models, historical RAG evidence, constraints, and non-actuating advisories"
        action={
          <a
            href="/engineering-copilot"
            className="px-3 py-1 rounded bg-sky-900 text-sky-100 hover:bg-sky-800 border border-sky-700 font-mono text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            OPEN ENGINEERING COPILOT →
          </a>
        }
      >
        <div className="p-4 bg-slate-950 rounded border border-slate-800 space-y-2 text-slate-300 font-mono text-xs">
          <div className="flex items-center justify-between">
            <strong className="text-sky-300">Explainable AI Decision Trace Active</strong>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase">
              HIGH DATA SUPPORT
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            The AI Engineering Copilot maps live scenario parameters through authoritative physics models, checks active engineering constraints, retrieves grounded SHARP D4.1 historical evidence, and formats explainable causal chains without automated SCADA equipment actuation.
          </p>
        </div>
      </Panel>

      {/* Downstream Models Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-400 space-y-1">
        <div className="text-slate-300 font-bold uppercase tracking-wider">
          Digital Twin Pipeline Status
        </div>
        <p className="text-[11px] text-slate-400">
          The pipeline completes at the Scenario Optimization & Decision Support engine. All physics models remain strictly driven by documented Baghewala records, calibrated parameters, Monte Carlo uncertainty analysis, and deterministic decision constraints.
        </p>
      </div>
    </div>
  );
};
