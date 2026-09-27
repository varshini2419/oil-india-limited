/**
 * Real-Time Telemetry Engineering Confidence Engine
 * Baghewala Heavy-Oil Field Digital Twin - Phase 6
 * NON-ACTUATING DECISION SUPPORT ONLY
 */

import type { TelemetryValidationResult, ActualVsPredictedComparison, DeviationAlert, PilotConfidenceEvaluation, PilotConfidenceLevel } from './types';

export function evaluatePilotConfidence(
  validation?: TelemetryValidationResult,
  comparison?: ActualVsPredictedComparison,
  deviations: DeviationAlert[] = []
): PilotConfidenceEvaluation {
  const supportingFactors: string[] = [];
  const riskWarnings: string[] = [];
  let score = 90;

  // 1. Telemetry Quality Assessment
  if (!validation || validation.status === 'VALID') {
    supportingFactors.push('Telemetry sensor data validated within safe physical bounds.');
  } else if (validation.status === 'WARNING') {
    score -= 15;
    riskWarnings.push(`Telemetry validation warnings detected: ${validation.reasons.join('; ')}`);
  } else if (validation.status === 'INVALID') {
    score -= 40;
    riskWarnings.push(`Telemetry invalid: ${validation.reasons.join('; ')}`);
  }

  // 2. Prediction Error Assessment
  if (comparison) {
    if (comparison.productionErrorPct < 10.0) {
      supportingFactors.push(`Actual vs predicted production error (${comparison.productionErrorPct}%) within 10% baseline.`);
    } else if (comparison.productionErrorPct < 20.0) {
      score -= 20;
      riskWarnings.push(`Moderate production prediction error (${comparison.productionErrorPct}%).`);
    } else {
      score -= 35;
      riskWarnings.push(`High production prediction error (${comparison.productionErrorPct}%).`);
    }

    if (Math.abs(comparison.pressureDeviationBar) > 5.0) {
      score -= 10;
      riskWarnings.push(`Observed pressure deviation (${comparison.pressureDeviationBar} bar) from baseline model.`);
    }
  }

  // 3. Active Deviations Assessment
  const hasCriticalDev = deviations.some((d) => d.severity === 'CRITICAL');
  const warningDevCount = deviations.filter((d) => d.severity === 'WARNING').length;

  if (hasCriticalDev) {
    score -= 30;
    riskWarnings.push('Critical engineering deviation active.');
  }
  if (warningDevCount > 0) {
    score -= warningDevCount * 10;
    riskWarnings.push(`${warningDevCount} active warning deviation(s) detected.`);
  }

  // Bound score
  score = Math.max(10, Math.min(100, score));

  // Determine Confidence Level
  let level: PilotConfidenceLevel = 'HIGH';
  if (score < 50 || hasCriticalDev || validation?.status === 'INVALID') {
    level = 'LOW';
  } else if (score < 75 || warningDevCount > 0 || (comparison && comparison.productionErrorPct >= 10.0)) {
    level = 'MODERATE';
  }

  const isWithinEnvelope = validation?.status !== 'INVALID' && !hasCriticalDev;

  return {
    level,
    score,
    supportingFactors,
    riskWarnings,
    isWithinOperatingEnvelope: isWithinEnvelope,
  };
}
