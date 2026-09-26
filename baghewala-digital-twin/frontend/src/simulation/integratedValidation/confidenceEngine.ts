import type { ConfidenceResult, UncertaintyStatistics } from './types';
import type { DataQualityReport } from '../fieldDataIntegration/types';
import type { ModelMode } from '../historicalCalibration/types';
import type { ScenarioConfidence } from '../scenarioOptimization/types';
import { UNCERTAINTY_WIDTH_THRESHOLDS, CONFIDENCE_WEIGHTS } from './defaults';

export function evaluateSystemConfidence(
  qualityReport: DataQualityReport,
  modelMode: ModelMode,
  uncertaintyStats: UncertaintyStatistics,
  sampleCount: number
): ConfidenceResult {
  if (qualityReport.recordCount === 0 || qualityReport.overallStatus === 'INSUFFICIENT_DATA') {
    return {
      confidence: 'INSUFFICIENT_DATA',
      confidenceScore: 0,
      factors: {
        dataQualityScore: 0,
        dataCoveragePercent: 0,
        calibrationAvailable: false,
        uncertaintyWidthBopd: 0,
        validationSampleCount: 0,
        provenanceRating: 'NO_DATA',
      },
      explanation: 'Insufficient data available to establish model validation confidence.',
    };
  }

  const qualityScore = qualityReport.qualityScore;
  const coveragePercent = qualityReport.completenessPercent;
  const isCalibrated = modelMode === 'CALIBRATED';
  const uncertaintyWidth = Math.abs(uncertaintyStats.p10Bopd - uncertaintyStats.p90Bopd);
  const sampleRating = Math.min(100, sampleCount * 25);

  // Compute weighted score (0 to 100)
  let score =
    qualityScore * CONFIDENCE_WEIGHTS.dataQuality +
    coveragePercent * CONFIDENCE_WEIGHTS.dataCoverage +
    (isCalibrated ? 100 : 40) * CONFIDENCE_WEIGHTS.calibrationBonus +
    sampleRating * CONFIDENCE_WEIGHTS.sampleCountWeight;

  // Uncertainty width penalty
  if (uncertaintyWidth > UNCERTAINTY_WIDTH_THRESHOLDS.wideBopd) {
    score -= 20;
  } else if (uncertaintyWidth > UNCERTAINTY_WIDTH_THRESHOLDS.moderateBopd) {
    score -= 10;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let confidence: ScenarioConfidence = 'MEDIUM';
  if (score >= 80 && sampleCount >= 3 && isCalibrated && qualityScore >= 75) {
    confidence = 'HIGH';
  } else if (score < 50 || sampleCount < 2 || qualityScore < 50) {
    confidence = 'LOW';
  } else {
    confidence = 'MEDIUM';
  }

  let provenanceRating = 'MEASURED';
  if (qualityReport.missingValueCount > 0) provenanceRating = 'PARTIALLY_IMPUTED';
  if (qualityReport.overallStatus === 'INVALID') provenanceRating = 'UNRELIABLE';

  const explanation =
    confidence === 'HIGH'
      ? `High model confidence established based on robust data quality (${qualityScore}%), calibrated model mode, and narrow uncertainty interval (${uncertaintyWidth.toFixed(1)} BOPD).`
      : confidence === 'MEDIUM'
      ? `Moderate model confidence assigned due to data completeness (${coveragePercent}%) and model uncertainty width (${uncertaintyWidth.toFixed(1)} BOPD).`
      : `Low model confidence due to limited sample count (${sampleCount}), uncalibrated parameters, or elevated input uncertainty.`;

  return {
    confidence,
    confidenceScore: score,
    factors: {
      dataQualityScore: qualityScore,
      dataCoveragePercent: coveragePercent,
      calibrationAvailable: isCalibrated,
      uncertaintyWidthBopd: Number(uncertaintyWidth.toFixed(2)),
      validationSampleCount: sampleCount,
      provenanceRating,
    },
    explanation,
  };
}
