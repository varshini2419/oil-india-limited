import { loadHistoricalBacktestDataset } from './historicalDataset';
import { runBacktestForCase } from './backtestEngine';
import { calculateAbsoluteError, calculatePercentageError } from './errorMetrics';
import { compareHistoricalCase, runFullHistoricalValidation } from './comparisonEngine';
import { determineValidationStatus } from './validation';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

console.log('===================================================');
console.log('RUNNING STEP 5.1 — HISTORICAL VALIDATION & BACKTEST TESTS');
console.log('===================================================\n');

// TEST 1: Historical dataset loads successfully
const dataset = loadHistoricalBacktestDataset();
assert(dataset.length >= 4, 'TEST 1: Historical dataset loads 4+ backtesting cases');

// TEST 2: Documented historical values preserve provenance
const case1Obs = dataset[0].observations[0];
assert((case1Obs.sourceType === 'documented' || case1Obs.sourceType === 'publication') && (case1Obs.sourceId ?? '').length > 0, 'TEST 2: Documented historical values preserve provenance & sourceId');

// TEST 3: Known historical/reference case produces deterministic model output
const output1 = runBacktestForCase(dataset[0]);
assert(output1.thermalResult.predictedReservoirTemperatureC > 0, 'TEST 3A: Step 4.3 thermal output generated');
assert(output1.viscosityResult.estimatedViscosityCp > 0, 'TEST 3B: Step 4.4 viscosity output generated');
assert(output1.productionResult.estimatedProductionBopd > 0, 'TEST 3C: Step 4.6 production output generated');

// TEST 4: Historical vs modeled absolute error calculated correctly
const absErr = calculateAbsoluteError(100.0, 110.0);
assert(absErr === 10.0, 'TEST 4: Absolute error |110 - 100| equals 10.0');

// TEST 5: Percentage error calculated correctly
const pctErr = calculatePercentageError(100.0, 110.0);
assert(pctErr === 10.0, 'TEST 5: Percentage error ((110 - 100)/100)*100 equals 10.0%');

// TEST 6: Zero historical value does not cause division by zero
const zeroPctErr = calculatePercentageError(0, 0);
const zeroDivErr = calculatePercentageError(0, 50);
assert(zeroPctErr === 0 && zeroDivErr === null, 'TEST 6: Zero historical value handled safely without division by zero');

// TEST 7: Missing historical value produces INSUFFICIENT_DATA
const statusMissing = determineValidationStatus(null, 50.0, null);
assert(statusMissing === 'INSUFFICIENT_DATA', 'TEST 7: Missing historical observation yields INSUFFICIENT_DATA status');

// TEST 8: Partial historical case handled safely
const evaluatedCase1 = compareHistoricalCase(dataset[1]); // CSS 2006 case (PARTIAL)
assert(evaluatedCase1.comparisons !== undefined && evaluatedCase1.comparisons.some((c) => c.status === 'INSUFFICIENT_DATA'), 'TEST 8: Partial historical case handles missing observations safely');

// TEST 9: Model output does not modify historical source data
const origVal = dataset[0].observations[0].observedValue;
compareHistoricalCase(dataset[0]);
assert(dataset[0].observations[0].observedValue === origVal, 'TEST 9: Model evaluation does not mutate original historical observations');

// TEST 10: Existing 4.3 -> 4.9 pipeline still executes
assert(output1.riskResult.riskLevel !== undefined && output1.srpResult.currentCandidate.loadIndex !== undefined, 'TEST 10: Complete 4.3 -> 4.9 pipeline executes seamlessly within backtest engine');

// TEST 11: Historical case with incomplete inputs does not crash pipeline
const partialOutput = runBacktestForCase(dataset[2]);
assert(partialOutput.productionResult.status === 'VALID', 'TEST 11: Incomplete historical inputs executed safely without crashing');

// TEST 12: Repeated backtest produces identical results
const fullVal1 = runFullHistoricalValidation();
const fullVal2 = runFullHistoricalValidation();
assert(fullVal1.summary?.totalCases === fullVal2.summary?.totalCases && fullVal1.cases?.[0]?.outputs?.thermalResult.predictedReservoirTemperatureC === fullVal2.cases?.[0]?.outputs?.thermalResult.predictedReservoirTemperatureC, 'TEST 12: Repeated backtest runs produce identical, deterministic results');

console.log('\n===================================================');
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('===================================================');

if (failed > 0) {
  throw new Error(`Unit tests failed: ${failed} failure(s).`);
}
