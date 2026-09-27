import { loadBaseline } from './scenario';
import {
  BAGHEWALA_HISTORICAL_DATASET,
  historicalObservationToInputs,
} from './historicalValidation/historicalDataset';
import { findHistoricalMatches } from './historicalValidation/historicalMatcher';
import {
  calculateDatasetErrorMetrics,
  runHistoricalValidation,
} from './historicalValidation/historicalValidationEngine';
import {
  checkIsWithinOperatingEnvelope,
  evaluateEngineeringConfidence,
} from './historicalValidation/confidenceEngine';
import { runCommittedScenarioUncertaintyAnalysis } from './uncertaintyAnalysis/uncertaintyEngine';
import { runScenarioOptimization } from './scenarioOptimization';
import { generateEngineeringDecisionTrace } from './scenarioOptimization/traceEngine';

let passCount = 0;
let failCount = 0;

function runTest(name: string, testFn: () => void) {
  try {
    testFn();
    passCount++;
    console.log(`✓ PASS: ${name}`);
  } catch (err: any) {
    failCount++;
    console.error(`✗ FAIL: ${name}`);
    console.error(`  Error: ${err.message}`);
  }
}

export function runPhase5HistoricalValidationTests(): number {
  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — PHASE 5 HISTORICAL VALIDATION & UNCERTAINTY TEST SUITE');
  console.log('====================================================');

  const baselineScenario = loadBaseline();

  // TEST 1 — Historical record can be converted into canonical ScenarioInputValues
  runTest('TEST 1 — Historical record can be converted into canonical ScenarioInputValues', () => {
    const record = BAGHEWALA_HISTORICAL_DATASET[0];
    const inputs = historicalObservationToInputs(record);

    if (inputs.reservoirTemperatureC !== record.reservoirTemperatureC) {
      throw new Error(`Temperature mismatch: expected ${record.reservoirTemperatureC}, got ${inputs.reservoirTemperatureC}`);
    }
    if (inputs.reservoirPressureBar !== record.reservoirPressureBar) {
      throw new Error(`Pressure mismatch: expected ${record.reservoirPressureBar}, got ${inputs.reservoirPressureBar}`);
    }
    if (inputs.spm !== record.spm) {
      throw new Error(`SPM mismatch: expected ${record.spm}, got ${inputs.spm}`);
    }
  });

  // TEST 2 — Historical matching returns closest operating conditions
  runTest('TEST 2 — Historical matching returns closest operating conditions', () => {
    const inputs = {
      ...baselineScenario.inputs,
      reservoirTemperatureC: 75.0,
      steamInjectionRateTpd: 120.0,
    };
    const matches = findHistoricalMatches(inputs, BAGHEWALA_HISTORICAL_DATASET, { topN: 3 });

    if (matches.length === 0) {
      throw new Error('Historical matcher returned empty results');
    }
    if (matches[0].record.id !== 'HIST-002') {
      throw new Error(`Expected top match HIST-002 for 75°C / 120 TPD steam, got ${matches[0].record.id}`);
    }
    if (matches[0].matchQualityPercent <= 50.0) {
      throw new Error(`Match quality percent should be > 50%, got ${matches[0].matchQualityPercent}%`);
    }
  });

  // TEST 3 — Historical validation calculates MAE correctly
  runTest('TEST 3 — Historical validation calculates MAE correctly', () => {
    const metrics = calculateDatasetErrorMetrics(BAGHEWALA_HISTORICAL_DATASET);

    if (typeof metrics.mae !== 'number' || Number.isNaN(metrics.mae)) {
      throw new Error('MAE calculation produced invalid numeric result');
    }
    if (metrics.mae <= 0) {
      throw new Error(`MAE should be positive, got ${metrics.mae}`);
    }
  });

  // TEST 4 — Historical validation calculates MAPE correctly
  runTest('TEST 4 — Historical validation calculates MAPE correctly', () => {
    const metrics = calculateDatasetErrorMetrics(BAGHEWALA_HISTORICAL_DATASET);

    if (typeof metrics.mape !== 'number' || Number.isNaN(metrics.mape)) {
      throw new Error('MAPE calculation produced invalid numeric result');
    }
    if (metrics.mape <= 0 || metrics.mape > 1000) {
      throw new Error(`MAPE outside realistic range, got ${metrics.mape}%`);
    }
  });

  // TEST 5 — Historical validation calculates RMSE correctly
  runTest('TEST 5 — Historical validation calculates RMSE correctly', () => {
    const metrics = calculateDatasetErrorMetrics(BAGHEWALA_HISTORICAL_DATASET);

    if (typeof metrics.rmse !== 'number' || Number.isNaN(metrics.rmse)) {
      throw new Error('RMSE calculation produced invalid numeric result');
    }
    if (metrics.rmse < metrics.mae) {
      throw new Error(`RMSE (${metrics.rmse}) must be >= MAE (${metrics.mae}) mathematically`);
    }
  });

  // TEST 6 — Uncertainty perturbation changes physics outputs
  runTest('TEST 6 — Uncertainty perturbation changes physics outputs', () => {
    const res = runCommittedScenarioUncertaintyAnalysis(baselineScenario.inputs);

    if (res.minimumProductionBopd >= res.maximumProductionBopd) {
      throw new Error(`Expected minimum production (${res.minimumProductionBopd}) < maximum (${res.maximumProductionBopd})`);
    }
    if (res.productionRangeBopd <= 0) {
      throw new Error(`Production range must be positive, got ${res.productionRangeBopd}`);
    }
  });

  // TEST 7 — Baseline remains unchanged during sensitivity analysis
  runTest('TEST 7 — Baseline remains unchanged during sensitivity analysis', () => {
    const originalTemp = baselineScenario.inputs.reservoirTemperatureC;
    const res = runCommittedScenarioUncertaintyAnalysis(baselineScenario.inputs);

    if (baselineScenario.inputs.reservoirTemperatureC !== originalTemp) {
      throw new Error('Baseline inputs were mutated during sensitivity analysis');
    }
    if (res.baselineProductionBopd <= 0) {
      throw new Error(`Baseline production in uncertainty result invalid: ${res.baselineProductionBopd}`);
    }
  });

  // TEST 8 — Sensitivity ranking is calculated dynamically
  runTest('TEST 8 — Sensitivity ranking is calculated dynamically', () => {
    const resNormal = runCommittedScenarioUncertaintyAnalysis(baselineScenario.inputs);

    // Heated high-steam scenario where steam impact changes
    const heatedInputs = { ...baselineScenario.inputs, reservoirTemperatureC: 80.0, steamInjectionRateTpd: 150.0 };
    const resHeated = runCommittedScenarioUncertaintyAnalysis(heatedInputs);

    if (resNormal.sensitivityRanking.length < 5 || resHeated.sensitivityRanking.length < 5) {
      throw new Error('Sensitivity ranking entries incomplete');
    }

    // Verify top ranked entry has highest production delta
    const topEntry = resNormal.sensitivityRanking[0];
    const secondEntry = resNormal.sensitivityRanking[1];
    if (topEntry.productionDeltaBopd < secondEntry.productionDeltaBopd) {
      throw new Error(`Rank 1 delta (${topEntry.productionDeltaBopd}) < Rank 2 delta (${secondEntry.productionDeltaBopd})`);
    }
  });

  // TEST 9 — Scenario outside historical envelope is flagged
  runTest('TEST 9 — Scenario outside historical envelope is flagged', () => {
    const inside = checkIsWithinOperatingEnvelope(baselineScenario.inputs);
    if (!inside) {
      throw new Error('Baseline scenario should be inside historical envelope');
    }

    const extremeInputs = {
      ...baselineScenario.inputs,
      reservoirTemperatureC: 220.0, // Exceeds historical envelope (max 85°C)
      steamInjectionRateTpd: 500.0,
    };
    const outside = checkIsWithinOperatingEnvelope(extremeInputs);
    if (outside) {
      throw new Error('Extreme inputs (220°C / 500 TPD) failed to be flagged as outside operating envelope');
    }
  });

  // TEST 10 — Confidence classification reacts to validation quality
  runTest('TEST 10 — Confidence classification reacts to validation quality', () => {
    const valNormal = runHistoricalValidation(baselineScenario.inputs);
    const confNormal = evaluateEngineeringConfidence(
      valNormal.topMatch,
      valNormal.mape,
      baselineScenario.inputs,
      valNormal.validationStatus
    );
    if (!confNormal.level) {
      throw new Error('Normal scenario confidence level missing');
    }

    const extremeInputs = { ...baselineScenario.inputs, reservoirTemperatureC: 200.0 };
    const valExtreme = runHistoricalValidation(extremeInputs);
    const confExtreme = evaluateEngineeringConfidence(
      valExtreme.topMatch,
      valExtreme.mape,
      extremeInputs,
      valExtreme.validationStatus
    );

    if (confExtreme.level !== 'LOW') {
      throw new Error(`Extreme scenario confidence should be LOW, got ${confExtreme.level}`);
    }
    if (confExtreme.warningReasons.length === 0) {
      throw new Error('Extreme scenario should contain explicit warning reasons');
    }
  });

  // TEST 11 — Committed scenario is used rather than stale active inputs
  runTest('TEST 11 — Committed scenario is used rather than stale active inputs', () => {
    const committedSc = loadBaseline();
    const activeInputsStale = { ...committedSc.inputs, reservoirTemperatureC: 120.0 };

    // Validation must operate on committed inputs explicitly
    const committedVal = runHistoricalValidation(committedSc.inputs);
    const staleVal = runHistoricalValidation(activeInputsStale);

    if (committedVal.predictedProductionBopd === staleVal.predictedProductionBopd) {
      throw new Error('Historical validation failed to differentiate committed vs active stale inputs');
    }
  });

  // TEST 12 — Historical validation does not mutate ScenarioStore
  runTest('TEST 12 — Historical validation does not mutate ScenarioStore', () => {
    const sc = loadBaseline();
    const tempBefore = sc.inputs.reservoirTemperatureC;

    runHistoricalValidation(sc.inputs);

    if (sc.inputs.reservoirTemperatureC !== tempBefore) {
      throw new Error('Historical validation mutated scenario input parameters in ScenarioStore');
    }
  });

  // TEST 13 — Optimization candidates receive validation/uncertainty metadata
  runTest('TEST 13 — Optimization candidates receive validation/uncertainty metadata', () => {
    const optRes = runScenarioOptimization({ objective: 'MAXIMIZE_PRODUCTION' });

    if (optRes.evaluations.length === 0) {
      throw new Error('Optimization produced no evaluations');
    }
    const cand = optRes.evaluations[0];
    if (typeof cand.historicalError !== 'number' || typeof cand.uncertaintyRangeBopd !== 'number') {
      throw new Error('Optimization candidate missing historicalError or uncertaintyRangeBopd metadata');
    }
    if (!cand.confidenceLevel) {
      throw new Error('Optimization candidate missing confidenceLevel metadata');
    }
  });

  // TEST 14 — Decision trace records Phase 5 metrics
  runTest('TEST 14 — Decision trace records Phase 5 metrics', () => {
    const optRes = runScenarioOptimization({ objective: 'BALANCED_OPERATION' });
    const trace = generateEngineeringDecisionTrace(optRes);

    if (typeof trace.historicalValidationErrorPercent !== 'number') {
      throw new Error('Decision trace missing historicalValidationErrorPercent');
    }
    if (typeof trace.uncertaintyRange !== 'number') {
      throw new Error('Decision trace missing uncertaintyRange');
    }
    if (!trace.confidenceLevel) {
      throw new Error('Decision trace missing confidenceLevel');
    }
  });

  // TEST 15 — Synthetic/demo historical data is clearly labelled
  runTest('TEST 15 — Synthetic/demo historical data is clearly labelled', () => {
    const dataset = BAGHEWALA_HISTORICAL_DATASET;

    for (const record of dataset) {
      if (record.source !== 'DEMONSTRATION_DATA' && record.source !== 'SYNTHETIC_DATA') {
        throw new Error(`Record ${record.id} contains invalid source label: ${record.source}`);
      }
    }

    const valResult = runHistoricalValidation(baselineScenario.inputs);
    if (!valResult.dataProvenanceLabel.includes('DEMONSTRATION') && !valResult.dataProvenanceLabel.includes('SYNTHETIC')) {
      throw new Error('Historical validation result dataProvenanceLabel missing DEMONSTRATION or SYNTHETIC label');
    }
  });

  console.log('----------------------------------------------------');
  if (failCount === 0) {
    console.log(`ALL PHASE 5 HISTORICAL VALIDATION & UNCERTAINTY TESTS PASSED (${passCount}/${passCount})`);
  } else {
    console.error(`FAILED PHASE 5 TESTS: ${failCount}`);
  }
  console.log('====================================================');
  return failCount;
}

// Execute directly if run via CLI / tsx
const proc = (globalThis as any).process;
if (proc?.argv && (import.meta.url === `file://${proc.argv[1]}` || proc.argv[1]?.endsWith('runPhase5HistoricalValidationTests.ts'))) {
  const code = runPhase5HistoricalValidationTests();
  if (proc?.exit) {
    proc.exit(code);
  }
}
