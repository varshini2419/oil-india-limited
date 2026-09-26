import type { ModelAcceptanceResult, ModelAcceptanceStatus, FinalValidationInput } from './types';
import type { IntegratedValidationState } from '../integratedValidation/types';

export function evaluateModelAcceptance(
  validationState?: IntegratedValidationState,
  input: FinalValidationInput = {}
): ModelAcceptanceResult {
  const limitations: string[] = [];

  if (!validationState) {
    return {
      status: 'THRESHOLD_NOT_DEFINED',
      historicalSampleCount: 0,
      baselineModelAvailable: true,
      calibratedModelAvailable: false,
      modelMode: input.modelMode || 'BASELINE',
      errorMetricMae: 0,
      uncertaintyWidthBopd: 0,
      outOfRangeCondition: false,
      summary: 'Integrated validation state missing. Acceptance threshold not defined.',
      limitations: ['Integrated validation pipeline state was not provided.'],
    };
  }

  const sampleCount = validationState.confidenceResult.factors.validationSampleCount ?? validationState.normalizedRecords.length;
  const mae = validationState.validationResult.performanceSummary?.[0]?.maeCalibrated ?? validationState.validationResult.performanceSummary?.[0]?.maeBaseline ?? 0;
  const uncertaintyWidth = validationState.uncertaintyStats ? (validationState.uncertaintyStats.p90Bopd - validationState.uncertaintyStats.p10Bopd) : 0;
  const isCalibrated = validationState.report?.modelMode === 'CALIBRATED' || input.modelMode === 'CALIBRATED';
  const overallStatus = validationState.validationResult.overallStatus;

  if (sampleCount < 2) {
    limitations.push('Historical sample count is sparse (<2 samples).');
  }

  if (uncertaintyWidth > 50) {
    limitations.push('Uncertainty interval width is wide (>50 BOPD).');
  }

  let status: ModelAcceptanceStatus = 'ACCEPTED';
  let summary = 'Physics model accepted cleanly for advisory decision support.';

  if (overallStatus === 'PARTIALLY_VALIDATED' || overallStatus === 'INSUFFICIENT_DATA' || overallStatus === 'OUTSIDE_MODEL_RANGE') {
    status = 'ACCEPTED_WITH_LIMITATIONS';
    summary = `Model accepted with limitations: Status is ${overallStatus}.`;
  } else if (limitations.length > 0) {
    status = 'ACCEPTED_WITH_LIMITATIONS';
    summary = `Model accepted with ${limitations.length} operational limitation(s).`;
  }

  return {
    status,
    historicalSampleCount: sampleCount,
    baselineModelAvailable: true,
    calibratedModelAvailable: isCalibrated,
    modelMode: isCalibrated ? 'CALIBRATED' : 'BASELINE',
    errorMetricMae: mae,
    uncertaintyWidthBopd: uncertaintyWidth,
    outOfRangeCondition: false,
    summary,
    limitations,
  };
}
