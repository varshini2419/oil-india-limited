import { analyzeAIRisk, compareRiskResults } from './recommendationEngine';
import { validateRiskEvidence } from './validation';
import type { RiskEvidence } from './types';

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
console.log('RUNNING STEP 4.9 — AI RISK & RECOMMENDATION TESTS');
console.log('===================================================\n');

const baselineEvidence: RiskEvidence = {
  temperatureC: 85.0,
  viscosityCp: 450.0,
  mobilityDPerCp: 0.0055,
  productionBopd: 25.5,
  vfdFrequencyHz: 45.0,
  spm: 8.0,
  strokeLengthMeters: 2.5,
  steamInjectionRateTpd: 80.0,
  srpLoadIndex: 45.0,
  cssThermalGainC: 37.0,
};

// Test 1: Baseline normal operation yields LOW risk
const baseResult = analyzeAIRisk(baselineEvidence);
assert(baseResult.riskLevel === 'LOW', 'TEST 1: Normal heated operating point yields LOW risk level');

// Test 2: Elevated SRP load detection
const highLoadEvidence: RiskEvidence = { ...baselineEvidence, srpLoadIndex: 92.0 };
const highLoadResult = analyzeAIRisk(highLoadEvidence);
assert(highLoadResult.detectedIssues.some((i) => i.category === 'SRP_LOAD'), 'TEST 2: Elevated SRP load issue detected');
assert(highLoadResult.recommendedActions.some((a) => a.targetModule === 'SRP'), 'TEST 3: SRP parameter adjustment recommendation generated');

// Test 4: High viscosity detection
const highViscEvidence: RiskEvidence = { ...baselineEvidence, viscosityCp: 35000.0, temperatureC: 48.0 };
const highViscResult = analyzeAIRisk(highViscEvidence);
assert(highViscResult.detectedIssues.some((i) => i.category === 'VISCOSITY'), 'TEST 4: High crude viscosity issue detected');
assert(highViscResult.recommendedActions.some((a) => a.targetModule === 'CSS'), 'TEST 5: CSS thermal boost recommendation generated');

// Test 6: Insufficient CSS thermal gain detection
const lowThermalEvidence: RiskEvidence = { ...baselineEvidence, steamInjectionRateTpd: 80.0, cssThermalGainC: 5.0, temperatureC: 50.0 };
const lowThermalResult = analyzeAIRisk(lowThermalEvidence);
assert(lowThermalResult.detectedIssues.some((i) => i.category === 'THERMAL'), 'TEST 6: Insufficient CSS thermal gain issue detected');

// Test 7: Risk score calculation (0 - 100)
assert(highLoadResult.riskScore > 0 && highLoadResult.riskScore <= 100, 'TEST 7: Risk score bounded between 0 and 100');

// Test 8: Confidence rating
assert(baseResult.confidence === 'Model-based' || baseResult.confidence === 'Rule-based', 'TEST 8: Valid AI confidence rating assigned');

// Test 9: Input validation
const valResult = validateRiskEvidence({ temperatureC: 450.0 });
assert(valResult.isValid === false, 'TEST 9: Out-of-bounds temperature (>300°C) fails validation');

// Test 10: Comparison table generation
const compRows = compareRiskResults(baseResult);
assert(compRows.length === 6, 'TEST 10: Risk comparison table generates 6 metric rows');

console.log('\n===================================================');
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('===================================================');

if (failed > 0) {
  throw new Error(`Unit tests failed: ${failed} failure(s).`);
}
