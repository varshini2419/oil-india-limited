import type { SourceType } from '../../data/baghewala';
import type { ValidationConfidence } from '../historicalValidation/types';

export type CalibrationStatus =
  | 'DOCUMENTED'
  | 'ASSUMED'
  | 'CALIBRATED'
  | 'NOT_CALIBRATABLE'
  | 'INSUFFICIENT_DATA';

export type OverfitStatus =
  | 'VALIDATED_NO_OVERFIT'
  | 'OVERFIT_WARNING'
  | 'INSUFFICIENT_DATA_FOR_HOLDOUT_VALIDATION';

export type ModelMode = 'BASELINE' | 'CALIBRATED';

export interface CalibrationParameter {
  id: string;
  name: string;
  category: 'production' | 'thermal' | 'viscosity' | 'mobility' | 'srp' | 'css';
  value: number;
  unit: string;
  previousValue: number;
  sourceType: SourceType | 'calibrated';
  sourceId: string;
  calibrationStatus: CalibrationStatus;
  confidence: ValidationConfidence;
  minAllowed: number;
  maxAllowed: number;
  description: string;
  calibratableReason: string;
}

export interface CalibrationObservation {
  id: string;
  dateOrYear: string | number;
  parameter: string;
  observedValue: number | null;
  baselinePredictedValue: number | null;
  calibratedPredictedValue: number | null;
  unit: string;
  baselineAbsoluteError: number | null;
  baselinePercentageError: number | null;
  calibratedAbsoluteError: number | null;
  calibratedPercentageError: number | null;
  sourceId: string;
  dataQuality: 'COMPLETE' | 'PARTIAL' | 'INSUFFICIENT_DATA';
}

export interface ErrorMetrics {
  mae: number;
  rmse: number;
  mape: number;
  maxAbsoluteError: number;
  medianAbsoluteError: number;
  observationCount: number;
}

export interface SensitivityStep {
  perturbationPercent: number; // e.g. -20, -10, 0, +10, +20
  parameterValue: number;
  mae: number;
  rmse: number;
  mape: number;
  improvementPercent: number;
}

export interface SensitivityResult {
  parameterId: string;
  parameterName: string;
  steps: SensitivityStep[];
  optimalValue: number;
  bestImprovementPercent: number;
  isSensitive: boolean;
}

export interface CalibrationResult {
  parameterId: string;
  parameterName: string;
  initialValue: number;
  calibratedValue: number;
  unit: string;
  improvementPercent: number;
  baselineError: ErrorMetrics;
  calibratedError: ErrorMetrics;
  observationsUsed: number;
  confidence: ValidationConfidence;
  status: CalibrationStatus;
  warnings: string[];
  trainingError?: ErrorMetrics;
  validationError?: ErrorMetrics;
  overfitStatus: OverfitStatus;
}

export interface CalibrationSummary {
  totalParametersEvaluated: number;
  calibratedParametersCount: number;
  rejectedParametersCount: number;
  baselineMetrics: ErrorMetrics;
  calibratedMetrics: ErrorMetrics;
  overallImprovementPercent: number;
  calculatedAt: string;
  disclaimer: string;
  activeModelMode: ModelMode;
}

export interface FullCalibrationReport {
  parameters: CalibrationParameter[];
  results: CalibrationResult[];
  sensitivityResults: SensitivityResult[];
  observations: CalibrationObservation[];
  summary: CalibrationSummary;
}
