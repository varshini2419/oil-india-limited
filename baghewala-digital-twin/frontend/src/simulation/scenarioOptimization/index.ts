import type {
  ScenarioOptimizationInput,
  ScenarioOptimizationResult,
  DecisionConstraint,
} from './types';
import {
  DEFAULT_DECISION_CONSTRAINTS,
  DEFAULT_OBJECTIVE,
  SCENARIO_OPTIMIZATION_DISCLAIMER,
} from './defaults';
import { validateDecisionConstraints } from './validation';
import { generateStandardScenarioCandidates } from './scenarioGenerator';
import { evaluateCandidate, computeParetoClassifications } from './scenarioEvaluator';
import { rankAndRecommendScenarios } from './decisionEngine';
import { buildScenarioComparisonRows } from './comparisonEngine';

export function runScenarioOptimization(
  input?: ScenarioOptimizationInput
): ScenarioOptimizationResult {
  const objective = input?.objective ?? DEFAULT_OBJECTIVE;
  const modelMode = input?.modelMode ?? 'BASELINE';

  const constraints: DecisionConstraint = {
    ...DEFAULT_DECISION_CONSTRAINTS,
    ...(input?.constraints ?? {}),
  };

  const constraintVal = validateDecisionConstraints(constraints);
  if (!constraintVal.isValid) {
    // Return empty fallback result safely if constraints are invalid
    return {
      objective,
      constraints,
      modelMode,
      evaluatedCandidatesCount: 0,
      feasibleScenariosCount: 0,
      nonDominatedScenariosCount: 0,
      evaluations: [],
      comparisonRows: [],
      recommendation: {
        selectedScenarioId: 'NONE',
        selectedScenarioName: 'Invalid Constraints Provided',
        objective,
        reasons: [],
        confidence: 'LOW',
        warnings: constraintVal.errors,
        limitations: [SCENARIO_OPTIMIZATION_DISCLAIMER],
        tradeOffAnalysisText: 'Invalid decision constraint configuration.',
      },
      calculatedAt: new Date().toISOString(),
      disclaimer: SCENARIO_OPTIMIZATION_DISCLAIMER,
    };
  }

  // 1. Generate Candidates (Standard presets + optional custom candidates)
  const standardCandidates = generateStandardScenarioCandidates(modelMode);
  const allCandidates = [...standardCandidates, ...(input?.customScenarios ?? [])];

  // 2. Full Pipeline Evaluation per candidate
  const rawEvaluations = allCandidates.map((c) => evaluateCandidate(c, constraints, modelMode));

  // 3. Compute Pareto Classifications (Dominated vs Non-Dominated)
  const paretoEvaluations = computeParetoClassifications(rawEvaluations);

  // 4. Rank & Recommend according to Decision Objective
  const { rankedEvaluations, recommendation } = rankAndRecommendScenarios(paretoEvaluations, objective);

  // 5. Build Comparison Table Rows
  const comparisonRows = buildScenarioComparisonRows(rankedEvaluations, recommendation);

  const feasibleCount = rankedEvaluations.filter((e) => e.isFeasible).length;
  const nonDominatedCount = rankedEvaluations.filter((e) => e.paretoClassification === 'NON_DOMINATED').length;

  return {
    objective,
    constraints,
    modelMode,
    evaluatedCandidatesCount: allCandidates.length,
    feasibleScenariosCount: feasibleCount,
    nonDominatedScenariosCount: nonDominatedCount,
    evaluations: rankedEvaluations,
    comparisonRows,
    recommendation,
    calculatedAt: new Date().toISOString(),
    disclaimer: SCENARIO_OPTIMIZATION_DISCLAIMER,
  };
}

export * from './types';
export * from './defaults';
export * from './validation';
export * from './scenarioGenerator';
export * from './scenarioEvaluator';
export * from './decisionEngine';
export * from './comparisonEngine';
