import React, { useState, useMemo } from 'react';
import {
  Sliders,
  HelpCircle,
  Award,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Zap,
  Target,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { runScenarioOptimization } from '../simulation/scenarioOptimization';
import type {
  DecisionObjective,
  ScenarioOptimizationResult,
  DecisionConstraint,
} from '../simulation/scenarioOptimization/types';
import { DEFAULT_DECISION_CONSTRAINTS } from '../simulation/scenarioOptimization/defaults';

export const ScenarioOptimizationPage: React.FC = () => {
  const [useCalibratedModel, setUseCalibratedModel] = useState<boolean>(true);
  const [objective, setObjective] = useState<DecisionObjective>('BALANCED_OPERATION');
  const [constraints, setConstraints] = useState<DecisionConstraint>({
    ...DEFAULT_DECISION_CONSTRAINTS,
  });

  const optimizationResult: ScenarioOptimizationResult = useMemo(() => {
    return runScenarioOptimization({
      modelMode: useCalibratedModel ? 'CALIBRATED' : 'BASELINE',
      objective,
      constraints,
    });
  }, [useCalibratedModel, objective, constraints]);

  const {
    recommendation,
    evaluations,
    comparisonRows,
    feasibleScenariosCount,
    evaluatedCandidatesCount,
    disclaimer,
  } = optimizationResult;

  const topEvaluation = evaluations.find(
    (e) => e.candidate.id === recommendation.selectedScenarioId
  );

  const handleConstraintChange = (key: keyof DecisionConstraint, value: number) => {
    setConstraints((prev: DecisionConstraint) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetConstraints = () => {
    setConstraints({ ...DEFAULT_DECISION_CONSTRAINTS });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
                STEP 5.4 — SCENARIO OPTIMIZATION & DECISION SUPPORT ENGINE
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-Objective Decision Ranking, Constraint Verification & Pareto Trade-Off Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
              {feasibleScenariosCount}/{evaluatedCandidatesCount} FEASIBLE SCENARIOS
            </span>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-4 p-3 bg-amber-950/30 border border-amber-500/20 rounded-lg flex items-start gap-3 text-xs text-amber-300 font-mono">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-200 uppercase">MODEL-BASED DECISION SUPPORT DISCLAIMER: </span>
            <span>{disclaimer}</span>
          </div>
        </div>
      </div>

      {/* Section A: Controls & Calibration Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Decision Engine Controls & Constraints</span>
          </div>

          {/* Model Calibration Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setUseCalibratedModel(false)}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                !useCalibratedModel
                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BASELINE MODEL
            </button>
            <button
              onClick={() => setUseCalibratedModel(true)}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                useCalibratedModel
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CALIBRATED MODEL (STEP 5.2)
            </button>
          </div>
        </div>

        {/* Objective Selection */}
        <div>
          <label className="block text-slate-400 mb-2 font-bold uppercase tracking-wider text-[11px]">
            SELECT DECISION OBJECTIVE
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'BALANCED_OPERATION',
                label: 'Balanced Operation',
                desc: 'Optimize oil production while keeping SRP load and operational risk at acceptable levels.',
                icon: Target,
              },
              {
                id: 'MAXIMIZE_PRODUCTION',
                label: 'Maximize Production',
                desc: 'Prioritize highest estimated daily oil production rate (BOPD).',
                icon: TrendingUp,
              },
              {
                id: 'MINIMIZE_OPERATING_RISK',
                label: 'Minimize Risk',
                desc: 'Minimize equipment mechanical fatigue, rod load index, and overall operational risk.',
                icon: ShieldAlert,
              },
              {
                id: 'MAXIMIZE_EFFICIENCY',
                label: 'Thermal Efficiency',
                desc: 'Maximize thermal steam enthalpy efficiency and oil recovery per injected steam ton.',
                icon: Zap,
              },
            ].map((obj) => {
              const Icon = obj.icon;
              const isSelected = objective === obj.id;
              return (
                <button
                  key={obj.id}
                  onClick={() => setObjective(obj.id as DecisionObjective)}
                  className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{obj.label}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400 font-sans">{obj.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Constraint Inputs */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              OPERATIONAL HARD & SOFT CONSTRAINTS
            </span>
            <button
              onClick={resetConstraints}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>RESET DEFAULTS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">MAX VFD FREQ (Hz)</label>
              <input
                type="number"
                min={30}
                max={70}
                value={constraints.maxVfdHz}
                onChange={(e) => handleConstraintChange('maxVfdHz', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">MAX SRP SPEED (SPM)</label>
              <input
                type="number"
                min={2}
                max={15}
                value={constraints.maxSpm}
                onChange={(e) => handleConstraintChange('maxSpm', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">MAX STEAM RATE (TPD)</label>
              <input
                type="number"
                min={0}
                max={250}
                value={constraints.maxSteamRateTpd}
                onChange={(e) => handleConstraintChange('maxSteamRateTpd', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">MAX LOAD INDEX (/100)</label>
              <input
                type="number"
                min={50}
                max={100}
                value={constraints.maxLoadIndex}
                onChange={(e) => handleConstraintChange('maxLoadIndex', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">MIN PROD RATE (BOPD)</label>
              <input
                type="number"
                min={0}
                max={50}
                step={0.1}
                value={constraints.minProductionBopd}
                onChange={(e) => handleConstraintChange('minProductionBopd', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section B: Top Recommendation Highlight Card */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                  RECOMMENDED SCENARIO
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  CONFIDENCE: {recommendation.confidence}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 font-mono mt-0.5">
                {recommendation.selectedScenarioName}
              </h2>
            </div>
          </div>

          {topEvaluation && (
            <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">ESTIMATED PROD</div>
                <div className="text-lg font-bold text-emerald-400">
                  {topEvaluation.estimatedProductionBopd.toFixed(1)} <span className="text-xs text-slate-400">BOPD</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-slate-400 text-[10px]">RISK PROFILE</div>
                <div className="text-sm font-bold text-slate-200">
                  {topEvaluation.riskLevel} ({topEvaluation.riskScore}/100)
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-slate-400 text-[10px]">SRP LOAD INDEX</div>
                <div className="text-sm font-bold text-slate-200">
                  {topEvaluation.srpLoadIndex.toFixed(1)}/100
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reasons & Trade-off Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 font-mono text-xs">
          <div>
            <h3 className="font-bold text-slate-200 mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>KEY DECISION RATIONALE</span>
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              {recommendation.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-200 mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>PARETO TRADE-OFF ANALYSIS</span>
              </h3>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-slate-300 font-sans leading-relaxed">
                {recommendation.tradeOffAnalysisText}
              </div>
            </div>

            {recommendation.warnings.length > 0 && (
              <div>
                <h3 className="font-bold text-amber-300 mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>OPERATIONAL WARNINGS</span>
                </h3>
                <ul className="space-y-1 text-amber-300">
                  {recommendation.warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 bg-amber-950/20 p-2 rounded border border-amber-500/20">
                      <span>⚠</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section C: Scenario Candidate Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>EVALUATED OPERATIONAL SCENARIOS ({evaluations.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            PARETO NON-DOMINATED: {evaluations.filter((e) => e.paretoClassification === 'NON_DOMINATED').length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.map((evalItem) => {
            const isSelected = evalItem.candidate.id === recommendation.selectedScenarioId;
            const isNonDominated = evalItem.paretoClassification === 'NON_DOMINATED';

            return (
              <div
                key={evalItem.candidate.id}
                className={`bg-slate-900 rounded-xl border p-4 font-mono text-xs flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                    : evalItem.isFeasible
                    ? 'border-slate-800 hover:border-slate-700'
                    : 'border-slate-800/50 opacity-60 bg-slate-950/30'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {evalItem.candidate.scenarioType}
                      </span>
                      <h4 className="font-bold text-slate-100 text-sm">{evalItem.candidate.name}</h4>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isNonDominated ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          PARETO OPTIMAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          DOMINATED
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evalItem.status === 'SAFE'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : evalItem.status === 'CAUTION'
                            ? 'bg-amber-500/10 text-amber-400'
                            : evalItem.status === 'HIGH_RISK'
                            ? 'bg-orange-500/10 text-orange-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {evalItem.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 font-sans text-[11px] mb-3 leading-relaxed">
                    {evalItem.candidate.description}
                  </p>

                  {/* Operational Settings Pill */}
                  <div className="bg-slate-950 p-2 rounded border border-slate-800/80 mb-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div>
                      <div className="text-slate-400">VFD</div>
                      <div className="font-bold text-slate-200">{evalItem.candidate.inputs.vfdFrequencyHz} Hz</div>
                    </div>
                    <div>
                      <div className="text-slate-400">SPM</div>
                      <div className="font-bold text-slate-200">{evalItem.candidate.inputs.spm}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">STEAM</div>
                      <div className="font-bold text-slate-200">{evalItem.candidate.inputs.steamInjectionRateTpd} TPD</div>
                    </div>
                  </div>

                  {/* Model Performance Readout */}
                  <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded border border-slate-800/60 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Modeled Oil Production:</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {evalItem.estimatedProductionBopd.toFixed(1)} BOPD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">P10 – P90 Uncertainty:</span>
                      <span className="text-slate-300">
                        {evalItem.uncertainty.p10ProductionBopd.toFixed(1)} – {evalItem.uncertainty.p90ProductionBopd.toFixed(1)} BOPD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Risk Profile:</span>
                      <span className="text-slate-300">
                        {evalItem.riskLevel} ({evalItem.riskScore}/100)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">SRP Mechanical Load:</span>
                      <span className="text-slate-300">
                        {evalItem.srpLoadIndex.toFixed(1)}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">CSS Thermal Score:</span>
                      <span className="text-slate-300">
                        {evalItem.cssPerformanceScore.toFixed(1)}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Constraint Violations or Warnings */}
                {evalItem.constraintWarnings.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-amber-300">
                    <span className="font-bold">Warnings: </span>
                    {evalItem.constraintWarnings.join('; ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section D: Comprehensive Scenario Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>FULL SCENARIO COMPARISON MATRIX</span>
          </h3>
          <span className="text-slate-400">MODE: {useCalibratedModel ? 'CALIBRATED' : 'BASELINE'}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3 font-semibold">SCENARIO NAME</th>
                <th className="py-2.5 px-3 font-semibold">OPERATING POINT</th>
                <th className="py-2.5 px-3 font-semibold">MODELED BOPD (P50)</th>
                <th className="py-2.5 px-3 font-semibold">RISK LEVEL</th>
                <th className="py-2.5 px-3 font-semibold">LOAD INDEX</th>
                <th className="py-2.5 px-3 font-semibold">CSS SCORE</th>
                <th className="py-2.5 px-3 font-semibold">STATUS</th>
                <th className="py-2.5 px-3 font-semibold">PARETO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisonRows.map((row) => (
                <tr
                  key={row.scenarioId}
                  className={`hover:bg-slate-800/30 transition-colors ${
                    row.isRecommended ? 'bg-emerald-950/20 font-bold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-slate-200">
                    <div className="flex items-center gap-1.5">
                      {row.isRecommended && <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      <span>{row.scenarioName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {row.vfdFrequencyHz} Hz | {row.spm} SPM | {row.steamRateTpd} TPD
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    {row.estimatedProductionBopd.toFixed(1)} BOPD ({row.p50ProductionBopd.toFixed(1)})
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {row.riskLevel}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {row.srpLoadIndex.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {row.cssEffectivenessScore.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        row.constraintStatus === 'SAFE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : row.constraintStatus === 'CAUTION'
                          ? 'bg-amber-500/10 text-amber-400'
                          : row.constraintStatus === 'HIGH_RISK'
                          ? 'bg-orange-500/10 text-orange-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {row.constraintStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        row.paretoClassification === 'NON_DOMINATED'
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {row.paretoClassification}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
