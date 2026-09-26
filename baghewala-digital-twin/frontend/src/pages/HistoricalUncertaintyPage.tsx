import React, { useState, useMemo } from 'react';
import {
  Activity,
  Sliders,
  HelpCircle,
  BarChart2,
  Layers,
  ArrowUpDown,
  Database,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { runUncertaintyAnalysis } from '../simulation/uncertaintyAnalysis/uncertaintyEngine';
import { DEFAULT_UNCERTAINTY_CONFIG } from '../simulation/uncertaintyAnalysis/defaults';
import type { UncertaintyResult } from '../simulation/uncertaintyAnalysis/types';

export const HistoricalUncertaintyPage: React.FC = () => {
  const [sampleCount, setSampleCount] = useState<number>(500);
  const [seed, setSeed] = useState<number>(42);
  const [activeTab, setActiveTab] = useState<'distributions' | 'tornado' | 'sensitivity' | 'correlations'>('distributions');

  // Trigger analysis recalculation
  const [triggerCount, setTriggerCount] = useState<number>(0);

  const analysisResult: UncertaintyResult = useMemo(() => {
    return runUncertaintyAnalysis({
      sampleCount,
      seed,
    });
  }, [sampleCount, seed, triggerCount]);

  const {
    productionStats,
    viscosityStats,
    mobilityStats,
    riskScoreStats,
    sensitivityResults,
    tornadoEntries,
    correlations,
    disclaimer,
  } = analysisResult;

  const topSensitiveParam = sensitivityResults[0]?.parameterName ?? 'Reservoir Permeability';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                STEP 5.3 — UNCERTAINTY & SENSITIVITY ANALYSIS
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Monte Carlo Parameter Sampling & One-at-a-Time (OAT) Sensitivity Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
              500 SAMPLES ACTIVE
            </span>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-4 p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-lg flex items-start gap-3 text-xs text-cyan-300 font-mono">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>{disclaimer}</p>
        </div>
      </div>

      {/* Section A: Analysis Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Monte Carlo & Sensitivity Controls</span>
          </div>
          <button
            onClick={() => setTriggerCount((c) => c + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RUN MONTE CARLO ANALYSIS</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-400 mb-1">SAMPLE COUNT (N)</label>
            <input
              type="number"
              min={10}
              max={5000}
              step={50}
              value={sampleCount}
              onChange={(e) => setSampleCount(Math.max(10, Math.min(5000, Number(e.target.value) || 500)))}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Supported range: 10 to 5,000 samples</span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">PRNG SEED</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value) || 42)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Mulberry32 deterministic seed</span>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">EVALUATED PARAMETERS</label>
            <div className="text-slate-200 font-bold pt-1.5">
              {DEFAULT_UNCERTAINTY_CONFIG.parameters.length} Key Reservoir & Engineering Parameters
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Permeability, Viscosity, Steam, Drawdown, SRP</span>
          </div>
        </div>
      </div>

      {/* Section B: Output Distribution Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Production P10 / P50 / P90 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>PRODUCTION DISTRIBUTION</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P90 (Conservative):</span>
              <span className="font-bold text-slate-200">{productionStats.p90} BOPD</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-y border-slate-800/80 py-1">
              <span className="text-cyan-400">P50 (Median):</span>
              <span className="text-cyan-300 text-sm">{productionStats.p50} BOPD</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P10 (Optimistic):</span>
              <span className="font-bold text-emerald-400">{productionStats.p10} BOPD</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
            Prob q &gt; 0.75 BOPD: <strong className="text-emerald-400 font-bold">{productionStats.probGreaterThanBaseline}%</strong>
          </div>
        </div>

        {/* Viscosity P10 / P50 / P90 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>VISCOSITY DISTRIBUTION</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P90 (High Visc):</span>
              <span className="font-bold text-slate-200">{viscosityStats.p90} cP</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-y border-slate-800/80 py-1">
              <span className="text-purple-400">P50 (Median):</span>
              <span className="text-purple-300 text-sm">{viscosityStats.p50} cP</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P10 (Low Visc):</span>
              <span className="font-bold text-emerald-400">{viscosityStats.p10} cP</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
            Std Dev: <strong className="text-slate-300 font-bold">±{viscosityStats.stdDev} cP</strong>
          </div>
        </div>

        {/* Mobility P10 / P50 / P90 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>MOBILITY DISTRIBUTION</span>
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P90 (Low Mob):</span>
              <span className="font-bold text-slate-200">{mobilityStats.p90} D/cP</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-y border-slate-800/80 py-1">
              <span className="text-indigo-400">P50 (Median):</span>
              <span className="text-indigo-300 text-sm">{mobilityStats.p50} D/cP</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P10 (High Mob):</span>
              <span className="font-bold text-emerald-400">{mobilityStats.p10} D/cP</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
            Min: {mobilityStats.min} | Max: {mobilityStats.max}
          </div>
        </div>

        {/* Risk Score P10 / P50 / P90 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>RISK SCORE DISTRIBUTION</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P90 (High Risk):</span>
              <span className="font-bold text-rose-400">{riskScoreStats.p90} / 100</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-y border-slate-800/80 py-1">
              <span className="text-amber-400">P50 (Median):</span>
              <span className="text-amber-300 text-sm">{riskScoreStats.p50} / 100</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">P10 (Low Risk):</span>
              <span className="font-bold text-emerald-400">{riskScoreStats.p10} / 100</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
            Mean Risk Score: <strong className="text-slate-300 font-bold">{riskScoreStats.mean} / 100</strong>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Views */}
      <div className="flex border-b border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveTab('distributions')}
          className={`px-4 py-2.5 font-semibold transition-colors border-b-2 ${
            activeTab === 'distributions'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          DISTRIBUTION & PROVENANCE
        </button>
        <button
          onClick={() => setActiveTab('tornado')}
          className={`px-4 py-2.5 font-semibold transition-colors border-b-2 ${
            activeTab === 'tornado'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          TORNADO SENSITIVITY CHART
        </button>
        <button
          onClick={() => setActiveTab('sensitivity')}
          className={`px-4 py-2.5 font-semibold transition-colors border-b-2 ${
            activeTab === 'sensitivity'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          OAT SENSITIVITY RANKING
        </button>
        <button
          onClick={() => setActiveTab('correlations')}
          className={`px-4 py-2.5 font-semibold transition-colors border-b-2 ${
            activeTab === 'correlations'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          MODEL-SAMPLE CORRELATIONS
        </button>
      </div>

      {/* Tab 1: Distributions & Provenance */}
      {activeTab === 'distributions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Evaluated Uncertainty Parameters & Provenance
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="p-3">PARAMETER</th>
                  <th className="p-3">CATEGORY</th>
                  <th className="p-3 text-right">BASELINE</th>
                  <th className="p-3 text-right">BOUNDS [MIN, MAX]</th>
                  <th className="p-3 text-center">UNCERTAINTY RANGE</th>
                  <th className="p-3">PROVENANCE / SOURCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {DEFAULT_UNCERTAINTY_CONFIG.parameters.map((param) => (
                  <tr key={param.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-semibold text-slate-100">{param.name}</td>
                    <td className="p-3 uppercase text-[10px] text-slate-400">{param.category}</td>
                    <td className="p-3 text-right text-slate-200 font-bold">
                      {param.baselineValue} {param.unit}
                    </td>
                    <td className="p-3 text-right text-slate-400 font-mono">
                      [{param.minAllowed}, {param.maxAllowed}] {param.unit}
                    </td>
                    <td className="p-3 text-center text-cyan-300 font-mono">
                      {param.uncertaintyType === 'PERCENTAGE'
                        ? `±${param.uncertaintyValue}%`
                        : `±${param.uncertaintyValue} ${param.unit}`}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          param.sourceType === 'documented'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : param.sourceType === 'calibrated'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : param.sourceType === 'scenario'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {param.provenanceLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Tornado Chart */}
      {activeTab === 'tornado' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-cyan-400" />
            Tornado Diagram — Production Sensitivity (BOPD Output Range)
          </h2>

          <div className="space-y-3 font-mono text-xs">
            {tornadoEntries.map((entry) => {
              const lowDelta = entry.negativeEffect;
              const highDelta = entry.positiveEffect;

              return (
                <div key={entry.parameterId} className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="flex justify-between items-center mb-1 text-slate-200 font-bold">
                    <span>{entry.parameterName}</span>
                    <span className="text-cyan-400 text-xs">
                      Range: {entry.totalRange} BOPD (Norm: {(entry.normalizedSensitivity * 100).toFixed(0)}%)
                    </span>
                  </div>

                  {/* Tornado bar */}
                  <div className="grid grid-cols-2 gap-1 items-center my-2">
                    {/* Negative effect bar (left) */}
                    <div className="flex justify-end items-center gap-2">
                      <span className="text-[10px] text-amber-400 font-mono">
                        {entry.lowValueOutput} BOPD ({lowDelta >= 0 ? `+${lowDelta}` : lowDelta})
                      </span>
                      <div className="w-48 bg-slate-900 rounded h-3.5 flex justify-end overflow-hidden">
                        <div
                          className="bg-amber-500/80 h-full rounded-l"
                          style={{ width: `${Math.min(100, Math.abs(lowDelta) * 5)}%` }}
                        />
                      </div>
                    </div>

                    {/* Positive effect bar (right) */}
                    <div className="flex justify-start items-center gap-2">
                      <div className="w-48 bg-slate-900 rounded h-3.5 flex justify-start overflow-hidden">
                        <div
                          className="bg-emerald-500/80 h-full rounded-r"
                          style={{ width: `${Math.min(100, Math.abs(highDelta) * 5)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {entry.highValueOutput} BOPD ({highDelta >= 0 ? `+${highDelta}` : highDelta})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: OAT Sensitivity Ranking */}
      {activeTab === 'sensitivity' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            One-at-a-Time (OAT) Parameter Sensitivity Ranking
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="p-3 text-center">RANK</th>
                  <th className="p-3">PARAMETER</th>
                  <th className="p-3 text-right">MAX PRODUCTION Δ</th>
                  <th className="p-3 text-right">SENSITIVITY INDEX</th>
                  <th className="p-3 font-mono">PROVENANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sensitivityResults.map((sens) => (
                  <tr key={sens.parameterId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-center font-bold text-cyan-300">#{sens.rank}</td>
                    <td className="p-3 font-semibold text-slate-100">{sens.parameterName}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      ±{sens.maxOutputDelta} BOPD
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-200">
                      {(sens.normalizedSensitivity * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">{sens.provenanceLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Model-Sample Correlations */}
      {activeTab === 'correlations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            Model-Sample Pearson Correlation Matrix
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="p-3">INPUT PARAMETER</th>
                  <th className="p-3">AFFECTED OUTPUT METRIC</th>
                  <th className="p-3 text-right">PEARSON (r)</th>
                  <th className="p-3">INTERPRETATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {correlations.map((corr, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-semibold text-slate-100">{corr.inputParameterName}</td>
                    <td className="p-3 text-slate-300">{corr.outputMetricName}</td>
                    <td
                      className={`p-3 text-right font-bold font-mono ${
                        corr.correlationCoefficient >= 0.5
                          ? 'text-emerald-400'
                          : corr.correlationCoefficient <= -0.5
                          ? 'text-purple-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {corr.correlationCoefficient > 0
                        ? `+${corr.correlationCoefficient}`
                        : corr.correlationCoefficient}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">{corr.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engineering Interpretation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2 font-mono text-xs">
        <div className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Engineering Synthesis & Physical Interpretation</span>
        </div>
        <p className="text-slate-300 leading-relaxed pt-1">
          Within the configured parameter uncertainty bounds, oil production demonstrates highest modeled sensitivity to{' '}
          <strong className="text-cyan-300">{topSensitiveParam}</strong> and Productivity-Mobility Coefficient (C_prod). Steam injection rate exhibits moderate positive correlation (r ≈ +0.42) with reservoir heating and oil viscosity reduction.
        </p>
      </div>
    </div>
  );
};
