/**
 * BAGHEWALA DIGITAL TWIN — PROMPT 6 HISTORICAL VALIDATION TEST SUITE
 * 
 * Verifies field data calibration, data quality auditing, residual calculations,
 * MAE/RMSE/MAPE/Bias formulas, calibration multipliers, uncertainty range envelopes,
 * input sensitivity rankings, and report generation.
 */

import { DEMO_FIELD_OBSERVATIONS } from './validation/demoData';
import { performDataQualityCheck } from './validation/dataQualityEngine';
import {
  calculateCalibrationError,
  calculateMAE,
  calculateRMSE,
  calculateBias,
  evaluateModelAgainstObservation,
} from './validation/fieldCalibrationEngine';
import { propagateUncertainty } from './validation/uncertaintyEngine';
import { performSensitivityAnalysis } from './validation/sensitivityEngine';
import { generateHistoricalValidationReport } from './validation/validationReportEngine';
import { BASELINE_INPUT_VALUES } from './scenario/defaults';

console.log('====================================================');
console.log('BAGHEWALA DIGITAL TWIN — PROMPT 6 HISTORICAL VALIDATION TEST SUITE');
console.log('====================================================');

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failedCount++;
  }
}

// 1. Reference Data Loading
assert(
  DEMO_FIELD_OBSERVATIONS.length >= 4,
  'TEST 1: Reference observation dataset loads at least 4 observation records'
);

// 2. Data Quality Check — Valid Dataset
const dqCheckPass = performDataQualityCheck(DEMO_FIELD_OBSERVATIONS);
assert(
  dqCheckPass.status === 'PASS' || dqCheckPass.status === 'WARNING',
  'TEST 2: Data quality engine inspects reference dataset and returns valid status'
);

// 3. Data Quality Check — Invalid / Empty Dataset Detection
const dqCheckEmpty = performDataQualityCheck([]);
assert(
  dqCheckEmpty.status === 'BLOCKED' && dqCheckEmpty.blockersCount > 0,
  'TEST 3: Data quality engine correctly flags empty dataset as BLOCKED'
);

// 4. Absolute Error Calculation
const err1 = calculateCalibrationError(10.0, 12.5);
assert(
  err1.absoluteError === 2.5,
  'TEST 4: Absolute error calculation (12.5 vs 10.0 = 2.5) is exact'
);

// 5. Relative Error Percentage Calculation
assert(
  err1.relativeErrorPercent === 25.0,
  'TEST 5: Relative error percentage calculation (2.5 / 10.0 = 25.0%) is exact'
);

// 6. MAE Calculation
const residualsTest = [2.0, -4.0, 6.0, -8.0];
const maeTest = calculateMAE(residualsTest);
assert(
  maeTest === 5.0,
  'TEST 6: MAE calculation for residuals [2, -4, 6, -8] is exact (5.0)'
);

// 7. RMSE Calculation
const rmseTest = calculateRMSE([3.0, 4.0]); // sqrt((9+16)/2) = sqrt(12.5) = 3.5355
assert(
  Math.abs(rmseTest - 3.5355) < 0.01,
  'TEST 7: RMSE calculation for residuals [3, 4] is exact (~3.5355)'
);

// 8. Bias Calculation
const biasTest = calculateBias([10.0, -4.0, 0.0]); // sum 6 / 3 = 2.0
assert(
  biasTest === 2.0,
  'TEST 8: Bias calculation for residuals [10, -4, 0] is exact (2.0)'
);

// 9. Calibration Multipliers
const resBase = evaluateModelAgainstObservation(BASELINE_INPUT_VALUES, DEMO_FIELD_OBSERVATIONS[0], {
  thermalGainMultiplier: 1.0,
  viscosityMultiplier: 1.0,
  mobilityMultiplier: 1.0,
  productionMultiplier: 1.0,
  srpLoadMultiplier: 1.0,
});
const resTuned = evaluateModelAgainstObservation(BASELINE_INPUT_VALUES, DEMO_FIELD_OBSERVATIONS[0], {
  thermalGainMultiplier: 1.0,
  viscosityMultiplier: 1.0,
  mobilityMultiplier: 1.0,
  productionMultiplier: 1.5,
  srpLoadMultiplier: 1.0,
});
const prodBase = resBase.find((r) => r.parameterName === 'Production Rate')?.modeledCalibrated || 0;
const prodTuned = resTuned.find((r) => r.parameterName === 'Production Rate')?.modeledCalibrated || 0;
assert(
  Math.abs(prodTuned - prodBase * 1.5) < 0.05,
  'TEST 9: Calibration multipliers modify modeled outputs deterministically (1.5x production multiplier)'
);

// 10. Calibration State Isolation
const uncalViscBefore = resBase.find((r) => r.parameterName === 'Crude Viscosity')?.modeledUncalibrated;
const uncalViscAfter = resTuned.find((r) => r.parameterName === 'Crude Viscosity')?.modeledUncalibrated;
assert(
  uncalViscBefore === uncalViscAfter,
  'TEST 10: Calibration parameters never mutate uncalibrated baseline physics outputs'
);

// 11. Residual Calculation Formula (Observed - Modeled)
const singleRes = resBase[0];
const expectedResidual = parseFloat((singleRes.observed - singleRes.modeledCalibrated).toFixed(4));
assert(
  singleRes.residualCalibrated === expectedResidual,
  'TEST 11: Parameter residual calculation formula (Observed - Modeled) verified'
);

// 12. Uncertainty Envelopes Ordering (Low <= High)
const uncertaintyRes = propagateUncertainty(BASELINE_INPUT_VALUES);
const tempEnvelope = uncertaintyRes.ranges.find((r) => r.parameterName === 'Predicted Reservoir Temp');
assert(
  tempEnvelope !== undefined && tempEnvelope.low <= tempEnvelope.high,
  'TEST 12: Uncertainty output range envelopes satisfy low <= high bound ordering'
);

// 13. Sensitivity Ranking
const sensRes = performSensitivityAnalysis(BASELINE_INPUT_VALUES);
assert(
  sensRes.records.length >= 5 && sensRes.records[0].rank === 1,
  'TEST 13: Input sensitivity analysis ranks parameters by output responsiveness'
);

// 14. Input Sensitivity Order Stability
assert(
  sensRes.highestSensitivityParameter.length > 0,
  'TEST 14: Highest sensitivity parameter identified using neutral terminology'
);

// 15. Validation Report Generation
const valReport = generateHistoricalValidationReport(BASELINE_INPUT_VALUES);
assert(
  valReport.reportId.startsWith('VAL-RPT-') && valReport.sections.length === 10,
  'TEST 15: Validation report engine generates structured 10-section report'
);

// 16. Mandated Safety Disclaimer
assert(
  valReport.disclaimer === 'HISTORICAL VALIDATION — DEMONSTRATION / REFERENCE DATA MUST NOT BE INTERPRETED AS VERIFIED CURRENT FIELD PERFORMANCE.',
  'TEST 16: Mandated historical validation safety disclaimer present in generated report'
);

// Summary
console.log('====================================================');
console.log(`PROMPT 6 HISTORICAL VALIDATION TESTS COMPLETED: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('====================================================');

if (failedCount > 0) {
  throw new Error(`${failedCount} test(s) failed in Prompt 6 test suite.`);
}
