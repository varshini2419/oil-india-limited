import type {
  ScenarioEvaluation,
  DecisionObjective,
  ScenarioRecommendation,
  ScenarioConfidence,
} from './types';

export function rankAndRecommendScenarios(
  evaluations: ScenarioEvaluation[],
  objective: DecisionObjective = 'BALANCED_OPERATION'
): {
  rankedEvaluations: ScenarioEvaluation[];
  recommendation: ScenarioRecommendation;
} {
  const feasible = evaluations.filter((e) => e.isFeasible);
  const infeasible = evaluations.filter((e) => !e.isFeasible);

  const riskScoreMap: Record<string, number> = {
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  const sortedFeasible = [...feasible].sort((a, b) => {
    if (objective === 'MAXIMIZE_PRODUCTION') {
      return b.estimatedProductionBopd - a.estimatedProductionBopd;
    } else if (objective === 'MINIMIZE_STEAM') {
      return a.inputs.steamInjectionRateTpd - b.inputs.steamInjectionRateTpd;
    } else if (objective === 'MINIMIZE_WATER_CUT') {
      return a.inputs.waterCutPercent - b.inputs.waterCutPercent;
    } else if (objective === 'MINIMIZE_OPERATING_RISK') {
      const rA = riskScoreMap[a.riskLevel] ?? 1;
      const rB = riskScoreMap[b.riskLevel] ?? 1;
      if (rA !== rB) return rA - rB;
      return a.srpLoadIndex - b.srpLoadIndex;
    } else if (objective === 'MAXIMIZE_EFFICIENCY') {
      if (b.cssPerformanceScore !== a.cssPerformanceScore) {
        return b.cssPerformanceScore - a.cssPerformanceScore;
      }
      return b.estimatedProductionBopd - a.estimatedProductionBopd;
    } else if (objective === 'TARGET_PRODUCTION') {
      const target = 1.5;
      return Math.abs(a.estimatedProductionBopd - target) - Math.abs(b.estimatedProductionBopd - target);
    } else {
      // BALANCED_OPERATION: Composite score
      const scoreA = a.estimatedProductionBopd - (riskScoreMap[a.riskLevel] ?? 1) * 2.0 - a.srpLoadIndex * 0.05;
      const scoreB = b.estimatedProductionBopd - (riskScoreMap[b.riskLevel] ?? 1) * 2.0 - b.srpLoadIndex * 0.05;
      return scoreB - scoreA;
    }
  });

  const rankedEvaluations = [...sortedFeasible, ...infeasible];

  // Selected top candidate (only from feasible scenarios)
  const topCandidate = sortedFeasible[0];

  const reasons: string[] = [];
  const warnings: string[] = [...(topCandidate?.constraintWarnings ?? [])];
  const limitations: string[] = [
    'Model-based decision support estimate (SPE 100642 appraisal reference data).',
    'Steam enthalpy and downhole effectiveness factors remain assumed.',
    'Holdout validation observations are sparse (4 historical appraisal cases).',
  ];

  if (topCandidate) {
    if (objective === 'MAXIMIZE_PRODUCTION') {
      reasons.push(`Highest estimated oil production rate (${topCandidate.estimatedProductionBopd} BOPD).`);
      reasons.push(`Modeled P50 median expectation: ${topCandidate.uncertainty.p50ProductionBopd} BOPD.`);
    } else if (objective === 'MINIMIZE_OPERATING_RISK') {
      reasons.push(`Lowest operational risk profile (Level: ${topCandidate.riskLevel}, Score: ${topCandidate.riskScore}/100).`);
      reasons.push(`Safe mechanical SRP load index (${topCandidate.srpLoadIndex.toFixed(1)}/100).`);
    } else if (objective === 'MAXIMIZE_EFFICIENCY') {
      reasons.push(`Highest thermal & mechanical efficiency score (${topCandidate.cssPerformanceScore.toFixed(1)}/100).`);
      reasons.push(`Optimized steam enthalpy utilization per produced BOPD.`);
    } else {
      reasons.push(`Balanced trade-off between oil recovery rate (${topCandidate.estimatedProductionBopd} BOPD) and operational risk (${topCandidate.riskLevel}).`);
      reasons.push(`Acceptable SRP equipment load (${topCandidate.srpLoadIndex.toFixed(1)}/100) and thermal soak response.`);
    }

    if (topCandidate.uncertainty.probGreaterThanBaseline > 90) {
      reasons.push(`High statistical probability (${topCandidate.uncertainty.probGreaterThanBaseline}%) of outperforming baseline production.`);
    }
  } else {
    warnings.push('Zero feasible scenarios identified under the current decision constraint set.');
  }

  // Trade-off analysis description
  let tradeOffText = 'No feasible trade-off candidates available.';
  if (sortedFeasible.length >= 2) {
    const c1 = sortedFeasible[0];
    const c2 = sortedFeasible[1];
    const prodDelta = Number((c1.estimatedProductionBopd - c2.estimatedProductionBopd).toFixed(2));
    const loadDelta = Number((c1.srpLoadIndex - c2.srpLoadIndex).toFixed(1));

    tradeOffText = `Top option "${c1.candidate.name}" provides ${
      prodDelta >= 0 ? `+${prodDelta}` : prodDelta
    } BOPD production delta compared to "${c2.candidate.name}" with a ${
      loadDelta >= 0 ? `+${loadDelta}` : loadDelta
    } shift in SRP mechanical load index.`;
  } else if (sortedFeasible.length === 1) {
    tradeOffText = `Single feasible scenario "${sortedFeasible[0].candidate.name}" satisfies all configured operational constraints.`;
  }

  const confidence: ScenarioConfidence = topCandidate ? topCandidate.confidence : 'INSUFFICIENT_DATA';

  const recommendation: ScenarioRecommendation = {
    selectedScenarioId: topCandidate?.candidate.id ?? 'NONE',
    selectedScenarioName: topCandidate?.candidate.name ?? 'No Feasible Scenario',
    objective,
    reasons,
    confidence,
    warnings,
    limitations,
    tradeOffAnalysisText: tradeOffText,
  };

  return {
    rankedEvaluations,
    recommendation,
  };
}
