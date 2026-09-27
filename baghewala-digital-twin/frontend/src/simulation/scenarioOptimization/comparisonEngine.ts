import type {
  ScenarioEvaluation,
  ScenarioComparisonRow,
  ScenarioRecommendation,
} from './types';

export function buildScenarioComparisonRows(
  evaluations: ScenarioEvaluation[],
  recommendation?: ScenarioRecommendation
): ScenarioComparisonRow[] {
  return evaluations.map((ev) => {
    const isRec = recommendation ? recommendation.selectedScenarioId === ev.candidate.id : false;

    return {
      scenarioId: ev.candidate.id,
      scenarioName: ev.candidate.name,
      scenarioType: ev.candidate.scenarioType,
      temperatureC: ev.temperatureC,
      viscosityCp: ev.viscosityCp,
      mobilityDcP: ev.mobilityDcP,
      estimatedProductionBopd: ev.estimatedProductionBopd,
      totalFluidProductionBfpd: ev.totalFluidProductionBfpd,
      p10ProductionBopd: ev.uncertainty.p10ProductionBopd,
      p50ProductionBopd: ev.uncertainty.p50ProductionBopd,
      p90ProductionBopd: ev.uncertainty.p90ProductionBopd,
      vfdFrequencyHz: ev.candidate.inputs.vfdFrequencyHz,
      spm: ev.candidate.inputs.spm,
      strokeLengthM: ev.candidate.inputs.strokeLengthMeters,
      steamRateTpd: ev.candidate.inputs.steamInjectionRateTpd,
      waterCutPercent: ev.candidate.inputs.waterCutPercent,
      srpLoadIndex: ev.srpLoadIndex,
      cssEffectivenessScore: ev.cssPerformanceScore,
      riskLevel: ev.riskLevel,
      confidence: ev.confidence,
      constraintStatus: ev.status,
      paretoClassification: ev.paretoClassification,
      feasibility: ev.feasibility,
      isRecommended: isRec,
      historicalError: ev.historicalError,
      uncertaintyRangeBopd: ev.uncertaintyRangeBopd,
      confidenceLevel: ev.confidenceLevel,
    };
  });
}
