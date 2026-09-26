import { OPERATION_BOUNDS, LOAD_INDEX_THRESHOLDS } from './defaults';
import type { OperatingStatus, SRPOptimizationInput } from './types';

export interface ValidationResult {
  isValid: boolean;
  status: OperatingStatus;
  errors: string[];
  warnings: string[];
}

export function validateSRPInput(input: Partial<SRPOptimizationInput>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const vfd = input.vfdFrequencyHz ?? OPERATION_BOUNDS.vfd.default;
  const spm = input.spm ?? OPERATION_BOUNDS.spm.default;
  const stroke = input.strokeLengthM ?? OPERATION_BOUNDS.stroke.default;

  if (vfd < OPERATION_BOUNDS.vfd.min || vfd > OPERATION_BOUNDS.vfd.max) {
    errors.push(`VFD frequency (${vfd} Hz) is out of valid operational bounds [${OPERATION_BOUNDS.vfd.min} - ${OPERATION_BOUNDS.vfd.max} Hz].`);
  }

  if (spm < OPERATION_BOUNDS.spm.min || spm > OPERATION_BOUNDS.spm.max) {
    errors.push(`Surface SPM (${spm}) is out of valid operational bounds [${OPERATION_BOUNDS.spm.min} - ${OPERATION_BOUNDS.spm.max} SPM].`);
  }

  if (stroke < OPERATION_BOUNDS.stroke.min || stroke > OPERATION_BOUNDS.stroke.max) {
    errors.push(`Stroke length (${stroke} m) is out of valid operational bounds [${OPERATION_BOUNDS.stroke.min} - ${OPERATION_BOUNDS.stroke.max} m].`);
  }

  const isValid = errors.length === 0;
  const status: OperatingStatus = isValid ? 'NORMAL' : 'OUT_OF_RANGE';

  return { isValid, status, errors, warnings };
}

export function determineStatusFromLoadIndex(loadIndex: number, isOutOfBounds = false): OperatingStatus {
  if (isOutOfBounds) return 'OUT_OF_RANGE';
  if (loadIndex <= LOAD_INDEX_THRESHOLDS.normalMax) return 'NORMAL';
  if (loadIndex <= LOAD_INDEX_THRESHOLDS.cautionMax) return 'CAUTION';
  return 'HIGH_LOAD';
}
