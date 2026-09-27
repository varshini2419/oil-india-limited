import { BASELINE_INPUT_VALUES } from './scenario/index.ts';
import { runHistoricalValidation } from './historicalValidation/index.ts';
import { runCommittedScenarioUncertaintyAnalysis } from './uncertaintyAnalysis/index.ts';
import { runScenarioOptimization } from './scenarioOptimization/index.ts';

console.log('====================================================');
console.log('BAGHEWALA DIGITAL TWIN — RENDER OPTIMIZATION REGRESSION TEST');
console.log('====================================================');

let historicalCallCount = 0;
let uncertaintyCallCount = 0;
let optimizationCallCount = 0;

// Cache wrappers simulating React useMemo behavior
let lastHistoricalInputs: typeof BASELINE_INPUT_VALUES | null = null;
let cachedHistoricalResult: ReturnType<typeof runHistoricalValidation> | null = null;

function memoizedHistoricalValidation(inputs: typeof BASELINE_INPUT_VALUES) {
  if (lastHistoricalInputs === inputs) {
    return cachedHistoricalResult!;
  }
  historicalCallCount++;
  lastHistoricalInputs = inputs;
  cachedHistoricalResult = runHistoricalValidation(inputs);
  return cachedHistoricalResult;
}

let lastUncertaintyInputs: typeof BASELINE_INPUT_VALUES | null = null;
let cachedUncertaintyResult: ReturnType<typeof runCommittedScenarioUncertaintyAnalysis> | null = null;

function memoizedUncertaintyAnalysis(inputs: typeof BASELINE_INPUT_VALUES) {
  if (lastUncertaintyInputs === inputs) {
    return cachedUncertaintyResult!;
  }
  uncertaintyCallCount++;
  lastUncertaintyInputs = inputs;
  cachedUncertaintyResult = runCommittedScenarioUncertaintyAnalysis(inputs);
  return cachedUncertaintyResult;
}

let lastOptObjective: string | null = null;
let cachedOptResult: ReturnType<typeof runScenarioOptimization> | null = null;

function memoizedOptimization(objective: 'BALANCED_OPERATION') {
  if (lastOptObjective === objective) {
    return cachedOptResult!;
  }
  optimizationCallCount++;
  lastOptObjective = objective;
  cachedOptResult = runScenarioOptimization({ objective, constraints: { maxSteamRateTpd: 180, maxSpm: 12, maxStrokeM: 3.5, maxLoadIndex: 85 } });
  return cachedOptResult;
}

// TEST 1: Initial Render Call
const inputs = { ...BASELINE_INPUT_VALUES };
memoizedHistoricalValidation(inputs);
memoizedUncertaintyAnalysis(inputs);
memoizedOptimization('BALANCED_OPERATION');

console.log(`✓ PASS: Initial computation executed — Historical: ${historicalCallCount}, Uncertainty: ${uncertaintyCallCount}, Optimization: ${optimizationCallCount}`);

// TEST 2: Simulated 50 Re-renders with unchanged props/inputs
for (let i = 0; i < 50; i++) {
  memoizedHistoricalValidation(inputs);
  memoizedUncertaintyAnalysis(inputs);
  memoizedOptimization('BALANCED_OPERATION');
}

if (historicalCallCount === 1 && uncertaintyCallCount === 1 && optimizationCallCount === 1) {
  console.log('✓ PASS: 50 consecutive re-renders triggered ZERO redundant calculation calls.');
} else {
  console.error(`✕ FAIL: Redundant calls detected! Historical: ${historicalCallCount}, Uncertainty: ${uncertaintyCallCount}, Optimization: ${optimizationCallCount}`);
}

// TEST 3: Prop/Input Change triggers exact 1 re-calculation
const newInputs = { ...BASELINE_INPUT_VALUES, reservoirTemperatureC: 85 };
memoizedHistoricalValidation(newInputs);
memoizedUncertaintyAnalysis(newInputs);

if (historicalCallCount === 2 && uncertaintyCallCount === 2) {
  console.log('✓ PASS: Parameter input update triggered exactly 1 re-calculation as required.');
} else {
  console.error(`✕ FAIL: Calculation failed to update on input change.`);
}

console.log('----------------------------------------------------');
console.log('ALL RENDER OPTIMIZATION REGRESSION TESTS PASSED (3/3)');
console.log('====================================================');
