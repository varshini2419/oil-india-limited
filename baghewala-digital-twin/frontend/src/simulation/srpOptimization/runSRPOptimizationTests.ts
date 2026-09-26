import { optimizeSRP, compareOptimizationResults } from './optimizationEngine';
import { evaluateSRPCandidate } from './srpOptimizationModel';
import { validateSRPInput } from './validation';
import type { SRPOptimizationInput } from './types';

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
console.log('RUNNING STEP 4.7 — SRP + VFD OPTIMIZATION UNIT TESTS');
console.log('===================================================\n');

const defaultInput: SRPOptimizationInput = {
  vfdFrequencyHz: 45.0,
  spm: 8.0,
  strokeLengthM: 2.5,
  oilMobilityDcp: 0.0005,
  effectiveDrawdownBar: 30.0,
  temperatureC: 48.0,
  viscosityCp: 15000.0,
};

// Test 1: Validation of default inputs
const valResult = validateSRPInput(defaultInput);
assert(valResult.isValid === true, 'Test 1: Default operating inputs pass validation');

// Test 2: Out of bounds detection
const invalidInput = { ...defaultInput, vfdFrequencyHz: 70.0 };
const valInvalid = validateSRPInput(invalidInput);
assert(valInvalid.isValid === false, 'Test 2: Out-of-bounds VFD frequency (70 Hz) fails validation');

// Test 3: Candidate evaluation for baseline
const candidate = evaluateSRPCandidate(defaultInput);
assert(candidate.loadIndex > 0 && candidate.loadIndex < 100, 'Test 3: Baseline candidate computes valid load index (0-100)');
assert(candidate.status === 'NORMAL' || candidate.status === 'CAUTION', 'Test 4: Baseline candidate status is valid operating status');
assert(candidate.efficiencyIndex > 0, 'Test 5: Baseline candidate computes positive efficiency index');

// Test 6: High load candidate detection
const highLoadInput: SRPOptimizationInput = { ...defaultInput, vfdFrequencyHz: 60.0, spm: 12.0, strokeLengthM: 3.0 };
const highLoadCandidate = evaluateSRPCandidate(highLoadInput);
assert(highLoadCandidate.loadIndex > 85.0, 'Test 6: High speed & stroke candidate exceeds caution threshold (>85.0)');
assert(highLoadCandidate.status === 'HIGH_LOAD', 'Test 7: High speed candidate receives HIGH_LOAD status');

// Test 8: Grid search optimization execution
const optResult = optimizeSRP(defaultInput);
assert(optResult.candidates.length === 288, 'Test 8: Grid search generates exactly 288 candidate points');
assert(optResult.optimalCandidate.isValid === true, 'Test 9: Optimal candidate is a valid candidate');
assert(optResult.optimalCandidate.efficiencyIndex >= optResult.currentCandidate.efficiencyIndex, 'Test 10: Optimal candidate efficiency >= current candidate efficiency');

// Test 11: Operating window bounds validation
assert(optResult.operatingWindow.totalCandidatesCount === 288, 'Test 11: Operating window records total candidates count');
assert(optResult.operatingWindow.minVFD >= 25.0 && optResult.operatingWindow.maxVFD <= 60.0, 'Test 12: Operating window VFD bounds within equipment limits');

// Test 13: Disclaimers and provenance
assert(optResult.disclaimers.length >= 3, 'Test 13: Disclaimers contain required safety warnings');
assert(optResult.modelType.includes('SRP + VFD Optimization'), 'Test 14: Model type clearly identifies SRP optimization step');

// Test 15: Comparison table generation
const comparison = compareOptimizationResults(optResult);
assert(comparison.length === 7, 'Test 15: Comparison table contains 7 key metrics rows');

console.log('\n===================================================');
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('===================================================');

if (failed > 0) {
  throw new Error(`Unit tests failed: ${failed} failure(s).`);
}
