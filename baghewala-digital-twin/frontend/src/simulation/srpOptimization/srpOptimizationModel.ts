import { calculateProductionModel } from '../production/productionModel';
import { OPERATION_BOUNDS, SEVERITY_WEIGHTS } from './defaults';
import { determineStatusFromLoadIndex, validateSRPInput } from './validation';
import type { OptimizationCandidate, SRPOptimizationInput } from './types';

export function evaluateSRPCandidate(
  input: SRPOptimizationInput
): OptimizationCandidate {
  const { vfdFrequencyHz, spm, strokeLengthM, oilMobilityDcp, effectiveDrawdownBar, temperatureC, viscosityCp } = input;

  const validation = validateSRPInput(input);
  const isOutOfBounds = !validation.isValid;

  // 1. Severity indices (0 to 100)
  const speedSeverity = Math.min(
    100,
    Math.max(0, Math.pow((vfdFrequencyHz - OPERATION_BOUNDS.vfd.min) / (OPERATION_BOUNDS.vfd.max - OPERATION_BOUNDS.vfd.min), 1.2) * 100)
  );

  const cycleSeverity = Math.min(
    100,
    Math.max(0, Math.pow((spm - OPERATION_BOUNDS.spm.min) / (OPERATION_BOUNDS.spm.max - OPERATION_BOUNDS.spm.min), 1.2) * 100)
  );

  const strokeSeverity = Math.min(
    100,
    Math.max(0, Math.pow((strokeLengthM - OPERATION_BOUNDS.stroke.min) / (OPERATION_BOUNDS.stroke.max - OPERATION_BOUNDS.stroke.min), 1.1) * 100)
  );

  // 2. Combined Load Index (0 to 100)
  const rawLoadIndex =
    SEVERITY_WEIGHTS.speed * speedSeverity +
    SEVERITY_WEIGHTS.cycle * cycleSeverity +
    SEVERITY_WEIGHTS.stroke * strokeSeverity;

  const loadIndex = Number(Math.min(100, Math.max(0, rawLoadIndex)).toFixed(2));

  // 3. Status determination
  const status = determineStatusFromLoadIndex(loadIndex, isOutOfBounds);

  // 4. Production calculation via Step 4.6
  const prodResult = calculateProductionModel(
    oilMobilityDcp,
    temperatureC,
    viscosityCp,
    effectiveDrawdownBar,
    vfdFrequencyHz,
    spm,
    strokeLengthM
  );

  const pumpCapacityFactor = prodResult.pumpOperationFactor;
  const estimatedProductionBopd = prodResult.estimatedProductionBopd;

  // 5. Efficiency Index E = Production / (1 + 0.015 * LoadIndex)
  const efficiencyIndex = Number(
    (estimatedProductionBopd / (1.0 + 0.015 * loadIndex)).toFixed(4)
  );

  const isValid = !isOutOfBounds && loadIndex <= 85.0;
  let penaltyMessage: string | undefined;

  if (isOutOfBounds) {
    penaltyMessage = 'Candidate setpoints are outside allowable equipment operation bounds.';
  } else if (loadIndex > 85.0) {
    penaltyMessage = 'Operating load index exceeds safe threshold (>85.0). Severely penalized.';
  }

  return {
    vfdFrequencyHz,
    spm,
    strokeLengthM,
    pumpCapacityFactor,
    estimatedProductionBopd,
    speedSeverity: Number(speedSeverity.toFixed(2)),
    cycleSeverity: Number(cycleSeverity.toFixed(2)),
    strokeSeverity: Number(strokeSeverity.toFixed(2)),
    loadIndex,
    efficiencyIndex,
    status,
    isValid,
    penaltyMessage,
  };
}
