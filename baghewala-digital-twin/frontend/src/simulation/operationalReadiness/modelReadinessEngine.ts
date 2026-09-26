import type { ModelReadinessEvaluation, ModelReadinessStatus } from './types';
import type { ValidationResult } from '../integratedValidation/types';

export function evaluateModelReadiness(
  validationResult?: ValidationResult,
  uncertaintyWidthBopd?: number
): ModelReadinessEvaluation {
  const warnings: string[] = [];

  if (!validationResult || !validationResult.performanceSummary || validationResult.performanceSummary.length === 0) {
    return {
      status: 'NOT_AVAILABLE',
      baselineModelAvailable: true,
      calibratedModelAvailable: false,
      validationSampleCount: 0,
      maeViscosityCp: null,
      maeProductionBopd: null,
      rmseProductionBopd: null,
      mapeProductionPercent: null,
      uncertaintyWidthBopd: uncertaintyWidthBopd ?? null,
      warnings: ['No historical observations available for quantitative model accuracy validation. Status set to NOT_AVAILABLE.'],
    };
  }

  // Extract production metrics safely
  const summaries = validationResult.performanceSummary || [];
  const prodSummary = summaries.find((s: any) => (s.metricLabel || s.metricKey || '').toLowerCase().includes('production'));
  const viscSummary = summaries.find((s: any) => (s.metricLabel || s.metricKey || '').toLowerCase().includes('viscosity'));

  const maeProductionBopd = prodSummary ? (Number.isFinite(prodSummary.maeCalibrated) ? prodSummary.maeCalibrated : prodSummary.maeBaseline) : null;
  const rmseProductionBopd = prodSummary ? (Number.isFinite(prodSummary.rmseCalibrated) ? prodSummary.rmseCalibrated : prodSummary.rmseBaseline) : null;
  const mapeProductionPercent = prodSummary ? (prodSummary.mapeCalibrated ?? prodSummary.mapeBaseline ?? null) : null;
  const maeViscosityCp = viscSummary ? (Number.isFinite(viscSummary.maeCalibrated) ? viscSummary.maeCalibrated : viscSummary.maeBaseline) : null;

  const sampleCount = prodSummary ? prodSummary.sampleCount : 0;
  const isCalibrated = true;

  if (validationResult.overallStatus === 'INSUFFICIENT_DATA') {
    warnings.push('Fewer than 3 historical observation samples available for statistical backtesting.');
  }
  if (validationResult.overallStatus === 'OUTSIDE_MODEL_RANGE') {
    warnings.push('Inputs or field observations exceed model calibrated temperature or viscosity operating boundaries.');
  }
  if (uncertaintyWidthBopd !== undefined && uncertaintyWidthBopd > 10.0) {
    warnings.push(`Wide Monte Carlo P10–P90 uncertainty interval (${uncertaintyWidthBopd.toFixed(1)} BOPD).`);
  }

  let status: ModelReadinessStatus = 'READY';
  if (isCalibrated) {
    status = 'CALIBRATED';
  }
  if (validationResult.overallStatus === 'INSUFFICIENT_DATA' || validationResult.overallStatus === 'OUTSIDE_MODEL_RANGE') {
    status = 'UNCERTAIN';
  }
  if (prodSummary && prodSummary.insufficientData) {
    status = 'UNCERTAIN';
  }

  return {
    status,
    baselineModelAvailable: true,
    calibratedModelAvailable: isCalibrated,
    validationSampleCount: sampleCount,
    maeViscosityCp,
    maeProductionBopd,
    rmseProductionBopd,
    mapeProductionPercent,
    uncertaintyWidthBopd: uncertaintyWidthBopd ?? null,
    warnings,
  };
}
