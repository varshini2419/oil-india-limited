import type { ConfidenceEvaluation, EngineeringConfidenceLevel, HistoricalMatchResult, ValidationStatus } from './types';
import type { ScenarioInputValues } from '../scenario/types';
import { BAGHEWALA_HISTORICAL_DATASET } from './historicalDataset';

/**
 * Checks whether current operating conditions fall inside the historical envelope.
 */
export function checkIsWithinOperatingEnvelope(inputs: ScenarioInputValues): boolean {
  const dataset = BAGHEWALA_HISTORICAL_DATASET;

  const minTemp = Math.min(...dataset.map((d) => d.reservoirTemperatureC)) - 5.0;
  const maxTemp = Math.max(...dataset.map((d) => d.reservoirTemperatureC)) + 5.0;

  const minPress = Math.min(...dataset.map((d) => d.reservoirPressureBar)) - 5.0;
  const maxPress = Math.max(...dataset.map((d) => d.reservoirPressureBar)) + 5.0;

  const minSteam = Math.min(...dataset.map((d) => d.steamInjectionRateTpd));
  const maxSteam = Math.max(...dataset.map((d) => d.steamInjectionRateTpd)) + 20.0;

  const isTempValid = inputs.reservoirTemperatureC >= minTemp && inputs.reservoirTemperatureC <= maxTemp;
  const isPressValid = inputs.reservoirPressureBar >= minPress && inputs.reservoirPressureBar <= maxPress;
  const isSteamValid = inputs.steamInjectionRateTpd >= minSteam && inputs.steamInjectionRateTpd <= maxSteam;

  return isTempValid && isPressValid && isSteamValid;
}

/**
 * Evaluates engineering confidence based on historical match distance, validation error,
 * operating envelope boundaries, and parameter sensitivity.
 */
export function evaluateEngineeringConfidence(
  topMatch: HistoricalMatchResult | undefined,
  mape: number,
  inputs: ScenarioInputValues,
  validationStatus: ValidationStatus
): ConfidenceEvaluation {
  const positiveReasons: string[] = [];
  const warningReasons: string[] = [];

  const isWithinEnvelope = checkIsWithinOperatingEnvelope(inputs);
  const distance = topMatch?.distance ?? 0.5;

  if (topMatch && distance <= 0.20) {
    positiveReasons.push(`Close historical match available (${topMatch.record.name ?? topMatch.record.id} - ${topMatch.matchQualityPercent}% match)`);
  } else if (topMatch) {
    warningReasons.push(`Moderate historical match distance (${(distance * 100).toFixed(0)}% normalized deviation)`);
  } else {
    warningReasons.push('No historical record match found');
  }

  if (isWithinEnvelope) {
    positiveReasons.push('Operating conditions fall within documented Baghewala historical envelope');
  } else {
    warningReasons.push('Operating parameters exceed documented historical operating envelope');
  }

  if (mape <= 20.0) {
    positiveReasons.push(`Low historical validation error (MAPE: ${mape.toFixed(1)}%)`);
  } else if (mape <= 40.0) {
    warningReasons.push(`Moderate historical validation error (MAPE: ${mape.toFixed(1)}%)`);
  } else {
    warningReasons.push(`Elevated historical validation error (MAPE: ${mape.toFixed(1)}%)`);
  }

  if (validationStatus === 'VALIDATED') {
    positiveReasons.push('Current scenario evaluated as historically validated');
  } else if (validationStatus === 'OUTSIDE_HISTORICAL_RANGE') {
    warningReasons.push('Scenario operating range marked OUTSIDE_HISTORICAL_RANGE');
  }

  let level: EngineeringConfidenceLevel = 'MODERATE';
  let score = 65;

  if (distance <= 0.18 && isWithinEnvelope && mape <= 25.0) {
    level = 'HIGH';
    score = 88;
  } else if (!isWithinEnvelope || distance > 0.40 || mape > 50.0 || validationStatus === 'OUTSIDE_HISTORICAL_RANGE') {
    level = 'LOW';
    score = 35;
  } else {
    level = 'MODERATE';
    score = 62;
  }

  return {
    level,
    score,
    positiveReasons,
    warningReasons,
    isWithinOperatingEnvelope: isWithinEnvelope,
    historicalDistance: distance,
  };
}
