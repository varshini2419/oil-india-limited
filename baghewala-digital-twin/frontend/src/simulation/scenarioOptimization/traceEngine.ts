import type { ScenarioOptimizationResult, EngineeringDecisionTrace } from './types';
import { SCENARIO_OPTIMIZATION_DISCLAIMER } from './defaults';

export function generateEngineeringDecisionTrace(
  optResult: ScenarioOptimizationResult,
  baselineBopd = 0.69
): EngineeringDecisionTrace {
  const selectedEval = optResult.evaluations.find(
    (e) => e.candidate.id === optResult.recommendation.selectedScenarioId
  ) ?? optResult.evaluations[0];

  const selectedBopd = selectedEval?.estimatedProductionBopd ?? baselineBopd;
  const prodDelta = Number((selectedBopd - baselineBopd).toFixed(2));
  const prodPercentChange = baselineBopd > 0 ? Number(((prodDelta / baselineBopd) * 100).toFixed(1)) : 0;

  const baselineSteam = 50.0;
  const selectedSteam = selectedEval?.candidate.inputs.steamInjectionRateTpd ?? 50.0;
  const steamDelta = Number((selectedSteam - baselineSteam).toFixed(1));

  const hexStamp = Math.floor(Date.now() / 1000).toString(16).toUpperCase();
  const traceId = `OPT-${hexStamp}`;

  const c = optResult.constraints;
  const constraintsDesc = `Max Steam: ${c.maxSteamRateTpd} TPD | Max SPM: ${c.maxSpm} | Max Stroke: ${c.maxStrokeM}m | Max Load: ${c.maxLoadIndex} | Max Risk: ${c.maxRiskLevel}`;

  const riskChangeText = `Baseline (LOW / 25) → Selected (${selectedEval?.riskLevel ?? 'LOW'} / ${selectedEval?.riskScore ?? 25})`;

  return {
    traceId,
    timestamp: new Date().toISOString(),
    objective: optResult.objective,
    constraintsDescription: constraintsDesc,
    candidateScenariosCount: optResult.evaluatedCandidatesCount,
    feasibleScenariosCount: optResult.feasibleScenariosCount,
    selectedScenarioId: optResult.recommendation.selectedScenarioId,
    selectedScenarioName: optResult.recommendation.selectedScenarioName,
    baselineProductionBopd: baselineBopd,
    selectedProductionBopd: selectedBopd,
    productionDeltaBopd: prodDelta,
    productionPercentChange: prodPercentChange,
    steamDeltaTpd: steamDelta,
    riskChangeText,
    historicalValidationErrorPercent: selectedEval?.historicalError ?? 3.8,
    uncertaintyRange: selectedEval?.uncertaintyRangeBopd ?? 2.1,
    confidenceLevel: selectedEval?.confidenceLevel ?? 'MODERATE',
    disclaimer: SCENARIO_OPTIMIZATION_DISCLAIMER,
  };
}
