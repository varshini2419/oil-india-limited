import { DEFAULT_CSS_OPTIMIZATION_INPUTS } from './defaults';
import { evaluateCSSCandidate } from './cssOptimizationModel';
import { optimizeCSS } from './optimizationEngine';
import { validateCSSInput } from './validation';
import type { CSSOptimizationInput } from './types';

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
console.log('RUNNING STEP 4.8 — CSS OPTIMIZATION UNIT TESTS');
console.log('===================================================\n');

const baseInput = DEFAULT_CSS_OPTIMIZATION_INPUTS;

// TEST 1: Baseline CSS scenario
const baseCand = evaluateCSSCandidate(baseInput);
assert(baseCand.isValid === true, 'TEST 1: Baseline CSS scenario is valid');

// TEST 2: Higher steam rate produces greater thermal response
const highSteamInput: CSSOptimizationInput = { ...baseInput, steamInjectionRateTpd: 120.0 };
const highSteamCand = evaluateCSSCandidate(highSteamInput);
assert(highSteamCand.predictedCssTemperatureC >= baseCand.predictedCssTemperatureC, 'TEST 2: Higher steam rate produces greater modeled thermal response');

// TEST 3: Lower steam rate produces lower thermal response
const lowSteamInput: CSSOptimizationInput = { ...baseInput, steamInjectionRateTpd: 20.0 };
const lowSteamCand = evaluateCSSCandidate(lowSteamInput);
assert(lowSteamCand.predictedCssTemperatureC <= baseCand.predictedCssTemperatureC, 'TEST 3: Lower steam rate produces lower modeled thermal response');

// TEST 4: Longer injection duration increases steam volume
const longInjInput: CSSOptimizationInput = { ...baseInput, injectionDurationDays: 10.0 };
const longInjCand = evaluateCSSCandidate(longInjInput);
assert(longInjCand.steamVolumeTons > baseCand.steamVolumeTons, 'TEST 4: Longer injection duration increases steam volume');

// TEST 5: Soak duration demonstrates bounded thermal retention
const shortSoakInput: CSSOptimizationInput = { ...baseInput, soakDurationDays: 1.0 };
const longSoakInput: CSSOptimizationInput = { ...baseInput, soakDurationDays: 25.0 };
const shortSoakCand = evaluateCSSCandidate(shortSoakInput);
const longSoakCand = evaluateCSSCandidate(longSoakInput);
assert(baseCand.predictedCssTemperatureC >= shortSoakCand.predictedCssTemperatureC, 'TEST 5A: Moderate soak gives higher thermal retention than 1-day soak');
assert(baseCand.predictedCssTemperatureC >= longSoakCand.predictedCssTemperatureC, 'TEST 5B: Extended soak demonstrates thermal decay');

// TEST 6: Higher steam quality increases thermal response
const highQualInput: CSSOptimizationInput = { ...baseInput, steamQualityFraction: 0.95 };
const lowQualInput: CSSOptimizationInput = { ...baseInput, steamQualityFraction: 0.50 };
const highQualCand = evaluateCSSCandidate(highQualInput);
const lowQualCand = evaluateCSSCandidate(lowQualInput);
assert(highQualCand.predictedCssTemperatureC > lowQualCand.predictedCssTemperatureC, 'TEST 6: Higher steam quality increases thermal response');

// TEST 7: Higher temperature decreases viscosity using Step 4.4
assert(highQualCand.cssViscosityCp < lowQualCand.cssViscosityCp, 'TEST 7: Higher temperature decreases viscosity using Step 4.4');

// TEST 8: Lower viscosity increases mobility using Step 4.5
assert(highQualCand.cssMobilityDPerCp > lowQualCand.cssMobilityDPerCp, 'TEST 8: Lower viscosity increases mobility using Step 4.5');

// TEST 9: Increased mobility increases production using Step 4.6
assert(highQualCand.cssProductionBopd > lowQualCand.cssProductionBopd, 'TEST 9: Increased mobility increases production using Step 4.6');

// TEST 10: Invalid steam quality rejected
const invalidQualInput: CSSOptimizationInput = { ...baseInput, steamQualityFraction: 1.5 };
const invalidQualVal = validateCSSInput(invalidQualInput);
assert(invalidQualVal.isValid === false, 'TEST 10: Invalid steam quality fraction (> 1.0) is rejected');

// TEST 11: Negative steam rate rejected
const negSteamInput: CSSOptimizationInput = { ...baseInput, steamInjectionRateTpd: -50.0 };
const negSteamVal = validateCSSInput(negSteamInput);
assert(negSteamVal.isValid === false, 'TEST 11: Negative steam injection rate is rejected');

// TEST 12: Negative duration rejected
const negDurationInput: CSSOptimizationInput = { ...baseInput, injectionDurationDays: -5.0 };
const negDurationVal = validateCSSInput(negDurationInput);
assert(negDurationVal.isValid === false, 'TEST 12: Negative injection duration is rejected');

// TEST 13: Deterministic same-input output
const run1 = evaluateCSSCandidate(baseInput);
const run2 = evaluateCSSCandidate(baseInput);
assert(run1.predictedCssTemperatureC === run2.predictedCssTemperatureC && run1.cssProductionBopd === run2.cssProductionBopd, 'TEST 13: Deterministic output for duplicate inputs');

// TEST 14: Full pipeline execution
const optRes = optimizeCSS(baseInput);
assert(optRes.thermalBreakdown.predictedCssTemperatureC > 0, 'TEST 14A: Thermal breakdown calculated');
assert(optRes.heavyOilBreakdown.cssViscosityCp > 0, 'TEST 14B: Heavy oil viscosity calculated');
assert(optRes.heavyOilBreakdown.cssMobilityDPerCp > 0, 'TEST 14C: Oil mobility calculated');
assert(optRes.productionBreakdown.cssProductionBopd > 0, 'TEST 14D: Production rate calculated');

// TEST 15: Optimization engine returns a valid candidate
assert(optRes.optimalCandidate.isValid === true, 'TEST 15: Optimal candidate returned by engine is valid');

// TEST 16: Optimizer does not select OUT_OF_RANGE candidate
assert(optRes.optimalCandidate.status !== 'OUT_OF_RANGE', 'TEST 16: Optimizer does not select OUT_OF_RANGE candidate');

// TEST 17: Steam volume calculation is correct
assert(baseCand.steamVolumeTons === 80.0 * 5.0, 'TEST 17: Steam volume tons equals rate * duration (80 * 5 = 400 tons)');

// TEST 18: Historical CSS comparison generated correctly
assert(optRes.historicalComparison.historicalCycleNumber === 1 && optRes.historicalComparison.historicalSteamVolumeTons === 1500, 'TEST 18: Historical CSS Cycle 1 comparison generated correctly');

console.log('\n===================================================');
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('===================================================');

if (failed > 0) {
  throw new Error(`Unit tests failed: ${failed} failure(s).`);
}
