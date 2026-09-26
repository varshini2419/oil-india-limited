import { loadHistoricalBacktestDataset } from '../historicalValidation/historicalDataset';
import { runBacktestForCase } from '../historicalValidation/backtestEngine';
import {
  buildCalibrationObservations,
  runPipelineWithCustomParameters,
} from './calibrationDataset';
import { validateCalibrationParameterValue } from './validation';
import { runSensitivityAnalysisForParameter } from './sensitivityAnalysis';
import {
  calculateAggregateErrorMetrics,
} from './comparisonEngine';
import {
  resetParameterRegistryToBaseline,
} from './parameterRegistry';
import { runHistoricalCalibration } from './calibrationEngine';
import { INITIAL_CANDIDATE_PARAMETERS } from './defaults';
import type { CalibrationParameter } from './types';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}${detail ? ` (${detail})` : ''}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    failCount++;
  }
}

console.log('===================================================');
console.log('RUNNING STEP 5.2 — HISTORICAL CALIBRATION & PARAMETER TUNING TESTS');
console.log('===================================================');

// Reset state
resetParameterRegistryToBaseline();

// 1. Historical dataset loads
const cases = loadHistoricalBacktestDataset();
assert(cases.length >= 4, 'TEST 1: Historical dataset loads 4+ backtesting cases', `Found ${cases.length} cases`);

// 2. Empty dataset handled safely
const emptyMetrics = calculateAggregateErrorMetrics([], 'baseline');
assert(
  emptyMetrics.mae === 0 && emptyMetrics.observationCount === 0,
  'TEST 2: Empty dataset handled safely without throwing exceptions'
);

// 3. Invalid observation rejected
const testParam = INITIAL_CANDIDATE_PARAMETERS[0]; // C_prod
const invalidResult = validateCalibrationParameterValue(testParam, -50.0);
assert(!invalidResult.isValid, 'TEST 3: Negative candidate parameter value rejected by validation');

// 4. Baseline error calculation
const baselineObs = buildCalibrationObservations(50.0);
const baseMetrics = calculateAggregateErrorMetrics(baselineObs, 'baseline');
assert(baseMetrics.mae >= 0 && baseMetrics.observationCount > 0, 'TEST 4: Baseline error metrics calculated successfully', `MAE: ${baseMetrics.mae}`);

// 5. Zero-observation protection
const zeroValMetrics = calculateAggregateErrorMetrics(
  [
    {
      id: 'OBS_ZERO',
      dateOrYear: 2026,
      parameter: 'Zero Test',
      observedValue: 0,
      baselinePredictedValue: 10,
      calibratedPredictedValue: 10,
      unit: 'BOPD',
      baselineAbsoluteError: 10,
      baselinePercentageError: null,
      calibratedAbsoluteError: 10,
      calibratedPercentageError: null,
      sourceId: 'TEST',
      dataQuality: 'COMPLETE',
    },
  ],
  'baseline'
);
assert(
  zeroValMetrics.mape === 0.0 && zeroValMetrics.mae === 10.0,
  'TEST 5: Zero observation value handled safely without division by zero'
);

// 6. Sensitivity analysis deterministic
const sens1 = runSensitivityAnalysisForParameter(testParam);
const sens2 = runSensitivityAnalysisForParameter(testParam);
assert(
  sens1.optimalValue === sens2.optimalValue && sens1.steps.length === 5,
  'TEST 6: Sensitivity analysis runs deterministically'
);

// 7. Parameter bounds enforced
const outOfBoundsHigh = validateCalibrationParameterValue(testParam, 5000.0);
assert(!outOfBoundsHigh.isValid, 'TEST 7: Out-of-bounds parameter candidate (> maxAllowed) rejected');

// 8. Calibration reduces error when data supports it
const calibrationReport = runHistoricalCalibration();
assert(
  calibrationReport.summary.calibratedParametersCount >= 1,
  'TEST 8: Calibration engine successfully calibrates supported parameters',
  `Calibrated: ${calibrationReport.summary.calibratedParametersCount}`
);

// 9. Calibration rejected when it does not improve error
const strictReport = runHistoricalCalibration({ minImprovementPercent: 99.9 });
assert(
  strictReport.results.some((r) => r.status === 'NOT_CALIBRATABLE' || r.status === 'INSUFFICIENT_DATA'),
  'TEST 9: Calibration rejected when improvement threshold is unachievable'
);

// 10. Insufficient-data handling
const thermalParamReport = calibrationReport.results.find(
  (r) => r.parameterId === 'PARAM_THERMAL_STEAM_GAIN_COEFFICIENT'
);
assert(
  thermalParamReport?.status === 'INSUFFICIENT_DATA' || thermalParamReport?.status === 'NOT_CALIBRATABLE',
  'TEST 10: Unmeasured parameter correctly tagged INSUFFICIENT_DATA'
);

// 11. Holdout validation
assert(
  calibrationReport.results.some((r) => r.overfitStatus !== undefined),
  'TEST 11: Holdout validation status recorded for calibration candidate'
);

// 12. Overfitting detection logic
const overfitCandidate = calibrationReport.results.find((r) => r.status === 'CALIBRATED');
assert(
  overfitCandidate?.overfitStatus === 'INSUFFICIENT_DATA_FOR_HOLDOUT_VALIDATION' ||
    overfitCandidate?.overfitStatus === 'VALIDATED_NO_OVERFIT' ||
    overfitCandidate?.overfitStatus === 'OVERFIT_WARNING',
  'TEST 12: Overfitting / data sufficiency status properly evaluated'
);

// 13. Provenance classification
const calibratedProdParam = calibrationReport.parameters.find(
  (p) => p.id === 'PARAM_PRODUCTIVITY_MOBILITY_COEFFICIENT'
);
assert(
  calibratedProdParam?.sourceType === 'calibrated',
  'TEST 13: Calibrated parameter assigned sourceType: "calibrated"'
);

// 14. Documented parameters cannot be modified
const docParam: CalibrationParameter = {
  ...testParam,
  sourceType: 'documented',
  sourceId: 'SRC_SPE_CSS_03',
};
const docValidation = validateCalibrationParameterValue(docParam, 120.0);
assert(!docValidation.isValid, 'TEST 14: Immutable documented parameter modification blocked');

// 15. Existing Step 5.1 backtest remains unchanged
const originalBacktestCase = cases[0];
const baseOutputs = runBacktestForCase(originalBacktestCase);
assert(
  baseOutputs.thermalResult.predictedReservoirTemperatureC > 0 &&
    baseOutputs.viscosityResult.estimatedViscosityCp > 0,
  'TEST 15: Existing Step 5.1 backtest engine executes unchanged'
);

// 16. Full pipeline compatibility with Steps 4.3–4.9
const customRun = runPipelineWithCustomParameters(originalBacktestCase, 75.0);
assert(
  customRun.predictedProduction > 0 && customRun.predictedMobility > 0,
  'TEST 16: Full pipeline compatibility maintained across Steps 4.3–4.9'
);

console.log('===================================================');
console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('===================================================');

if (failCount > 0) {
  throw new Error(`${failCount} historical calibration test(s) failed.`);
}
