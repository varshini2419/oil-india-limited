import React, { useState } from 'react';
import { useScenarioStore } from '../../simulation/scenario';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Sliders, ArrowRight, Flame, RefreshCw } from 'lucide-react';

export const CSSCandidatePanel: React.FC = () => {
  const { committedSimulationResult, cssOptimizationResult, updateInput } = useScenarioStore();
  const inputs = committedSimulationResult.inputs;

  // Local controls for CSS optimization inputs
  const [steamRate, setSteamRate] = useState(inputs.steamInjectionRateTpd);
  const [steamQuality, setSteamQuality] = useState(inputs.steamQualityPercent);
  const [injectionTemp, setInjectionTemp] = useState(inputs.steamInjectionTemperatureC);
  const [soakDays, setSoakDays] = useState(inputs.soakDurationDays);

  const currentResult = cssOptimizationResult;
  const currentCand = currentResult.currentCandidate;
  const optimalCand = currentResult.optimalCandidate;

  // Run dynamic grid search evaluation based on controls
  const handleOptimizeClick = () => {
    // Triggers optimization re-evaluation and applies preview
    updateInput('steamInjectionRateTpd', steamRate);
    updateInput('steamQualityPercent', steamQuality);
    updateInput('steamInjectionTemperatureC', injectionTemp);
    updateInput('soakDurationDays', soakDays);
  };

  const applyRecommended = () => {
    updateInput('steamInjectionRateTpd', optimalCand.steamInjectionRateTpd);
    updateInput('steamQualityPercent', optimalCand.steamQualityFraction * 100);
    updateInput('steamInjectionTemperatureC', optimalCand.steamInjectionTemperatureC);
    updateInput('soakDurationDays', optimalCand.soakDurationDays);
    setSteamRate(optimalCand.steamInjectionRateTpd);
    setSteamQuality(optimalCand.steamQualityFraction * 100);
    setInjectionTemp(optimalCand.steamInjectionTemperatureC);
    setSoakDays(optimalCand.soakDurationDays);
  };

  // Top representative candidates list from optimization result
  const candidates = currentResult.candidates;
  const sortedCandidates = [...candidates].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  const displayCandidates = sortedCandidates.slice(0, 8);

  const hasCurrent = displayCandidates.some(
    (c) =>
      c.steamInjectionRateTpd === inputs.steamInjectionRateTpd &&
      c.soakDurationDays === inputs.soakDurationDays &&
      Math.round(c.steamQualityFraction * 100) === Math.round(inputs.steamQualityPercent)
  );

  if (!hasCurrent) {
    displayCandidates.unshift(currentCand);
  }

  // Calculate BEFORE vs AFTER deltas
  const curBopd = currentCand.cssProductionBopd;
  const optBopd = optimalCand.cssProductionBopd;
  const bopdDelta = Number((optBopd - curBopd).toFixed(2));
  const bopdDeltaPct = curBopd > 0 ? Number(((bopdDelta / curBopd) * 100).toFixed(1)) : 0;

  const curVisc = currentCand.cssViscosityCp;
  const optVisc = optimalCand.cssViscosityCp;
  const viscDelta = Number((optVisc - curVisc).toFixed(0));

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-5 font-mono shadow-sm space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300 text-xs">
          <Sliders className="w-4 h-4 text-sky-500" />
          <span>MULTI-OBJECTIVE CSS OPTIMIZER & CANDIDATE SCREENING</span>
        </div>

        <button
          onClick={applyRecommended}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>APPLY RECOMMENDED CSS ({optimalCand.steamInjectionRateTpd} TPD, {optimalCand.soakDurationDays}d)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. CSS OPTIMIZATION INPUT CONTROLS BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <Flame className="w-4 h-4" /> CSS STEAM INJECTION PARAMETER CONTROLS
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Adjust sliders to preview thermal impact</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
          {/* Steam Rate Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400 font-bold">STEAM RATE (TPD):</span>
              <strong className="text-rose-600 dark:text-rose-400">{steamRate.toFixed(0)} TPD</strong>
            </div>
            <input
              type="range"
              min="20"
              max="140"
              step="5"
              value={steamRate}
              onChange={(e) => setSteamRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Steam Quality Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400 font-bold">STEAM QUALITY (%):</span>
              <strong className="text-sky-600 dark:text-sky-400">{steamQuality.toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={steamQuality}
              onChange={(e) => setSteamQuality(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Injection Temperature Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400 font-bold">INJECTION TEMP (°C):</span>
              <strong className="text-orange-600 dark:text-orange-400">{injectionTemp.toFixed(0)} °C</strong>
            </div>
            <input
              type="range"
              min="150"
              max="320"
              step="5"
              value={injectionTemp}
              onChange={(e) => setInjectionTemp(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Soak Duration Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px]">
              <span className="text-slate-400 font-bold">SOAK DURATION (DAYS):</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{soakDays.toFixed(1)} days</strong>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={soakDays}
              onChange={(e) => setSoakDays(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleOptimizeClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>OPTIMIZE CSS & UPDATE PREVIEW</span>
          </button>
        </div>
      </div>

      {/* 2. RECOMMENDED STRATEGY CARD & BEFORE VS AFTER COMPARISON DUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card A: Recommended Strategy */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> RECOMMENDED CSS STRATEGY
            </span>
            <span className="text-[10px] bg-white dark:bg-emerald-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
              VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Steam Rate: <strong>{optimalCand.steamInjectionRateTpd} TPD</strong></div>
            <div>Quality: <strong>{(optimalCand.steamQualityFraction * 100).toFixed(0)}%</strong></div>
            <div>Injection Temp: <strong>{optimalCand.steamInjectionTemperatureC}°C</strong></div>
            <div>Soak Duration: <strong>{optimalCand.soakDurationDays} days</strong></div>
            <div>Expected Res Temp: <strong className="text-rose-600 dark:text-rose-400">{optimalCand.predictedCssTemperatureC.toFixed(1)}°C</strong></div>
            <div>Expected Viscosity: <strong className="text-purple-600 dark:text-purple-400">{optimalCand.cssViscosityCp.toLocaleString()} cP</strong></div>
            <div>Expected Oil Production: <strong className="text-emerald-600 dark:text-emerald-400">{optimalCand.cssProductionBopd.toFixed(1)} BOPD</strong></div>
            <div>Multi-Objective Score: <strong className="text-sky-600 dark:text-sky-400">{optimalCand.efficiencyScore.toFixed(1)} / 100</strong></div>
          </div>
        </div>

        {/* Card B: BEFORE vs AFTER Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>BEFORE vs AFTER COMPARISON</span>
            <span className="text-[10px] text-slate-400 font-normal">Current vs Recommended</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Oil Production:</span>
              <span>{curBopd.toFixed(1)} BOPD $\rightarrow$ <strong className="text-emerald-500">{optBopd.toFixed(1)} BOPD</strong> ({bopdDelta >= 0 ? `+${bopdDelta}` : bopdDelta} BOPD, +{bopdDeltaPct}%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Crude Viscosity:</span>
              <span>{curVisc.toLocaleString()} cP $\rightarrow$ <strong className="text-purple-500">{optVisc.toLocaleString()} cP</strong> ({viscDelta} cP)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Steam Injection:</span>
              <span>{inputs.steamInjectionRateTpd} TPD $\rightarrow$ <strong>{optimalCand.steamInjectionRateTpd} TPD</strong></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Soak Period:</span>
              <span>{inputs.soakDurationDays} days $\rightarrow$ <strong>{optimalCand.soakDurationDays} days</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CANDIDATE SCREENING TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3">SCENARIO ROLE</th>
              <th className="py-2.5 px-3">STEAM (TPD)</th>
              <th className="py-2.5 px-3">QUALITY (%)</th>
              <th className="py-2.5 px-3">INJ TEMP (°C)</th>
              <th className="py-2.5 px-3">SOAK (DAYS)</th>
              <th className="py-2.5 px-3">PREDICTED RES TEMP</th>
              <th className="py-2.5 px-3">VISCOSITY (cP)</th>
              <th className="py-2.5 px-3">PREDICTED BOPD</th>
              <th className="py-2.5 px-3">SCORE</th>
              <th className="py-2.5 px-3">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-950">
            {displayCandidates.map((c, idx) => {
              const isCurrent =
                c.steamInjectionRateTpd === inputs.steamInjectionRateTpd &&
                c.soakDurationDays === inputs.soakDurationDays &&
                Math.round(c.steamQualityFraction * 100) === Math.round(inputs.steamQualityPercent);

              const isOptimal =
                c.steamInjectionRateTpd === optimalCand.steamInjectionRateTpd &&
                c.soakDurationDays === optimalCand.soakDurationDays &&
                Math.round(c.steamQualityFraction * 100) === Math.round(optimalCand.steamQualityFraction * 100);

              const isRejected = !c.isValid || c.status === 'HIGH_THERMAL_LOAD' || c.status === 'OUT_OF_RANGE';

              return (
                <tr
                  key={idx}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                    isCurrent ? 'bg-sky-50/60 dark:bg-sky-950/30 font-bold' : isOptimal ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 text-[10px] font-bold mr-1">
                        CURRENT
                      </span>
                    )}
                    {isOptimal && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                        RECOMMENDED
                      </span>
                    )}
                    {!isCurrent && !isOptimal && isRejected && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[10px] font-bold">
                        REJECTED
                      </span>
                    )}
                    {!isCurrent && !isOptimal && !isRejected && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                        STRATEGY #{idx + 1}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">{c.steamInjectionRateTpd.toFixed(0)}</td>
                  <td className="py-2.5 px-3">{(c.steamQualityFraction * 100).toFixed(0)}%</td>
                  <td className="py-2.5 px-3">{c.steamInjectionTemperatureC.toFixed(0)}°C</td>
                  <td className="py-2.5 px-3">{c.soakDurationDays.toFixed(1)}</td>
                  <td className="py-2.5 px-3 font-bold text-orange-600 dark:text-orange-400">{c.predictedCssTemperatureC.toFixed(1)}°C</td>
                  <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400">{c.cssViscosityCp.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">{c.cssProductionBopd.toFixed(1)} BOPD</td>
                  <td className="py-2.5 px-3 font-bold">{c.efficiencyScore.toFixed(1)}</td>
                  <td className="py-2.5 px-3">
                    {c.status === 'NORMAL' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10.5px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                      </span>
                    ) : c.status === 'CAUTION' ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[10.5px]">
                        <AlertTriangle className="w-3.5 h-3.5" /> CAUTION
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-[10.5px]">
                        <XCircle className="w-3.5 h-3.5" /> REJECTED
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
