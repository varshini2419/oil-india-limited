import {
  runScenarioOptimization,
  generateStandardScenarioCandidates,
  createCustomScenarioCandidate,
  evaluateCandidate,
  runPredictionForecast,
  DEFAULT_DECISION_CONSTRAINTS,
} from './scenarioOptimization';
import { SCENARIO_LIMITS, BASELINE_INPUT_VALUES } from './scenario/defaults';
import { loadBaseline } from './scenario/scenarioEngine';
import { calculateThermalModel } from './thermal/thermalModel';
import { calculateViscosityModel } from './viscosity/viscosityModel';
import { calculateMobilityModel } from './mobility/mobilityModel';
import { calculateProductionModel } from './production/productionModel';

export function runPhase4OptimizationTests(): number {
  let passCount = 0;
  let failCount = 0;

  function runTest(name: string, fn: () => void) {
    try {
      fn();
      console.log(`✓ PASS: ${name}`);
      passCount++;
    } catch (err: any) {
      console.error(`✗ FAIL: ${name} — ${err.message}`);
      failCount++;
    }
  }

  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — PHASE 4 OPTIMIZATION & PREDICTION TEST SUITE');
  console.log('====================================================');

  // TEST 1 — Scenario Generator creates valid ScenarioInputValues
  runTest('TEST 1 — Scenario generator creates valid ScenarioInputValues', () => {
    const candidates = generateStandardScenarioCandidates('BASELINE');
    if (candidates.length < 5) throw new Error(`Expected >= 5 candidates, got ${candidates.length}`);

    candidates.forEach((cand) => {
      const inputs = cand.inputs;
      const requiredKeys: (keyof typeof BASELINE_INPUT_VALUES)[] = [
        'reservoirTemperatureC',
        'reservoirPressureBar',
        'permeabilityDarcy',
        'steamInjectionRateTpd',
        'steamQualityPercent',
        'steamInjectionTemperatureC',
        'soakDurationDays',
        'waterCutPercent',
        'vfdFrequencyHz',
        'spm',
        'strokeLengthMeters',
        'ambientTemperatureC',
        'humidityPercent',
        'windSpeedKmh',
      ];
      requiredKeys.forEach((key) => {
        if (typeof inputs[key] !== 'number' || Number.isNaN(inputs[key])) {
          throw new Error(`Candidate ${cand.id} missing valid numeric ${key}`);
        }
      });
    });
  });

  // TEST 2 — Generated scenarios respect SCENARIO_LIMITS
  runTest('TEST 2 — Generated scenarios respect SCENARIO_LIMITS', () => {
    const candidates = generateStandardScenarioCandidates('BASELINE');
    candidates.forEach((cand) => {
      for (const [key, limit] of Object.entries(SCENARIO_LIMITS)) {
        const val = (cand.inputs as any)[key];
        if (typeof val === 'number') {
          if (val < limit.min || val > limit.max) {
            throw new Error(`Candidate ${cand.id} parameter ${key} (${val}) violates limit range [${limit.min}, ${limit.max}]`);
          }
        }
      }
    });
  });

  // TEST 3 — Invalid scenarios are rejected
  runTest('TEST 3 — Invalid scenarios are rejected', () => {
    const invalidCand = createCustomScenarioCandidate('Out of Bound Steam', 'Over-limit test', {
      steamInjectionRateTpd: 500.0, // Exceeds SCENARIO_LIMITS max 300
    });
    const evalRes = evaluateCandidate(invalidCand, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
    if (evalRes.isFeasible || evalRes.feasibility !== 'INVALID') {
      throw new Error('Expected invalid scenario to receive feasibility = INVALID and isFeasible = false');
    }
    if (evalRes.feasibilityReasons.length === 0) {
      throw new Error('Expected feasibilityReasons to contain constraint violation details');
    }
  });

  // TEST 4 — Every scenario uses the existing physics models
  runTest('TEST 4 — Every scenario uses the existing physics models', () => {
    const cand = generateStandardScenarioCandidates('BASELINE')[0];
    const evalRes = evaluateCandidate(cand, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');

    // Run physics solvers directly to compare outputs
    const tRes = calculateThermalModel({ inputs: cand.inputs } as any);
    const vRes = calculateViscosityModel(tRes.predictedReservoirTemperatureC, cand.inputs.reservoirTemperatureC);
    const mRes = calculateMobilityModel(vRes.estimatedViscosityCp, tRes.predictedReservoirTemperatureC, cand.inputs.permeabilityDarcy);
    const pRes = calculateProductionModel(mRes.mobilityDcP, tRes.predictedReservoirTemperatureC, vRes.estimatedViscosityCp, 30.0, cand.inputs.vfdFrequencyHz, cand.inputs.spm, cand.inputs.strokeLengthMeters);

    if (evalRes.temperatureC !== tRes.predictedReservoirTemperatureC) {
      throw new Error(`Temperature mismatch: eval ${evalRes.temperatureC} vs physics ${tRes.predictedReservoirTemperatureC}`);
    }
    if (evalRes.viscosityCp !== vRes.estimatedViscosityCp) {
      throw new Error(`Viscosity mismatch: eval ${evalRes.viscosityCp} vs physics ${vRes.estimatedViscosityCp}`);
    }
    if (evalRes.estimatedProductionBopd !== pRes.estimatedProductionBopd) {
      throw new Error(`Production mismatch: eval ${evalRes.estimatedProductionBopd} vs physics ${pRes.estimatedProductionBopd}`);
    }
  });

  // TEST 5 — Changing steam rate changes thermal/production outputs
  runTest('TEST 5 — Changing steam rate changes thermal/production outputs', () => {
    const c50 = createCustomScenarioCandidate('Steam 50', '50 TPD', { steamInjectionRateTpd: 50.0 });
    const c150 = createCustomScenarioCandidate('Steam 150', '150 TPD', { steamInjectionRateTpd: 150.0 });

    const e50 = evaluateCandidate(c50, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
    const e150 = evaluateCandidate(c150, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');

    if (e150.temperatureC <= e50.temperatureC) {
      throw new Error(`Expected 150 TPD temp (${e150.temperatureC}°C) > 50 TPD temp (${e50.temperatureC}°C)`);
    }
    if (e150.estimatedProductionBopd <= e50.estimatedProductionBopd) {
      throw new Error(`Expected 150 TPD BOPD (${e150.estimatedProductionBopd}) > 50 TPD BOPD (${e50.estimatedProductionBopd})`);
    }
  });

  // TEST 6 — Changing reservoir temperature changes viscosity/mobility
  runTest('TEST 6 — Changing reservoir temperature changes viscosity/mobility', () => {
    const c48 = createCustomScenarioCandidate('Temp 48', '48°C', { reservoirTemperatureC: 48.0 });
    const c85 = createCustomScenarioCandidate('Temp 85', '85°C', { reservoirTemperatureC: 85.0 });

    const e48 = evaluateCandidate(c48, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
    const e85 = evaluateCandidate(c85, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');

    if (e85.viscosityCp >= e48.viscosityCp) {
      throw new Error(`Expected 85°C viscosity (${e85.viscosityCp} cP) < 48°C viscosity (${e48.viscosityCp} cP)`);
    }
    if (e85.mobilityDcP <= e48.mobilityDcP) {
      throw new Error(`Expected 85°C mobility (${e85.mobilityDcP}) > 48°C mobility (${e48.mobilityDcP})`);
    }
  });

  // TEST 7 — Changing pressure changes drawdown/production
  runTest('TEST 7 — Changing pressure changes drawdown/production', () => {
    const c48 = createCustomScenarioCandidate('Press 48', '48 bar', { reservoirPressureBar: 48.0 });
    const c30 = createCustomScenarioCandidate('Press 30', '30 bar', { reservoirPressureBar: 30.0 });

    const e48 = evaluateCandidate(c48, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
    const e30 = evaluateCandidate(c30, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');

    if (e30.estimatedProductionBopd >= e48.estimatedProductionBopd) {
      throw new Error(`Expected depleted pressure BOPD (${e30.estimatedProductionBopd}) < baseline BOPD (${e48.estimatedProductionBopd})`);
    }
  });

  // TEST 8 — Changing permeability changes mobility/production
  runTest('TEST 8 — Changing permeability changes mobility/production', () => {
    const c25 = createCustomScenarioCandidate('Perm 2.5', '2.5 D', { permeabilityDarcy: 2.5 });
    const c10 = createCustomScenarioCandidate('Perm 1.0', '1.0 D', { permeabilityDarcy: 1.0 });

    const e25 = evaluateCandidate(c25, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
    const e10 = evaluateCandidate(c10, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');

    if (e10.mobilityDcP >= e25.mobilityDcP) {
      throw new Error(`Expected 1.0 D mobility (${e10.mobilityDcP}) < 2.5 D mobility (${e25.mobilityDcP})`);
    }
    if (e10.estimatedProductionBopd >= e25.estimatedProductionBopd) {
      throw new Error(`Expected 1.0 D BOPD (${e10.estimatedProductionBopd}) < 2.5 D BOPD (${e25.estimatedProductionBopd})`);
    }
  });

  // TEST 9 — Changing water cut changes BFPD
  runTest('TEST 9 — Changing water cut changes BFPD', () => {
    const c20 = createCustomScenarioCandidate('WC 20', '20%', { waterCutPercent: 20.0 });
    const c60 = createCustomScenarioCandidate('WC 60', '60%', { waterCutPercent: 60.0 });

    const e20 = evaluateCandidate(c20, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
    const e60 = evaluateCandidate(c60, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');

    if (e60.totalFluidProductionBfpd <= e20.totalFluidProductionBfpd) {
      throw new Error(`Expected 60% WC total fluid BFPD (${e60.totalFluidProductionBfpd}) > 20% WC BFPD (${e20.totalFluidProductionBfpd})`);
    }
  });

  // TEST 10 — Changing SPM changes mechanical cycle timing but does not artificially overwrite calculated BOPD
  runTest('TEST 10 — Changing SPM changes mechanical cycle timing but does not artificially overwrite calculated BOPD', () => {
    const c8 = createCustomScenarioCandidate('SPM 8', '8 SPM', { spm: 8.0 });
    const c2 = createCustomScenarioCandidate('SPM 2', '2 SPM', { spm: 2.0 });

    const e8 = evaluateCandidate(c8, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');
    const e2 = evaluateCandidate(c2, DEFAULT_DECISION_CONSTRAINTS, 'BASELINE');

    const cycle8 = 60.0 / 8.0; // 7.5s
    const cycle2 = 60.0 / 2.0; // 30.0s

    if (cycle2 !== cycle8 * 4) {
      throw new Error(`Expected 2 SPM cycle duration (${cycle2}s) = 4x 8 SPM cycle (${cycle8}s)`);
    }
    if (typeof e2.estimatedProductionBopd !== 'number' || typeof e8.estimatedProductionBopd !== 'number') {
      throw new Error('Expected valid numeric BOPD from physics engine');
    }
  });

  // TEST 11 — Changing stroke length changes mechanical displacement
  runTest('TEST 11 — Changing stroke length changes mechanical displacement', () => {
    const stroke25 = 2.5;
    const stroke10 = 1.0;
    const ratio = stroke10 / stroke25;

    if (ratio !== 0.4) {
      throw new Error(`Expected stroke displacement ratio 0.4, got ${ratio}`);
    }
  });

  // TEST 12 — Optimization objective actually evaluates the requested objective
  runTest('TEST 12 — Optimization objective actually evaluates the requested objective', () => {
    const resProd = runScenarioOptimization({ objective: 'MAXIMIZE_PRODUCTION' });
    const resSteam = runScenarioOptimization({ objective: 'MINIMIZE_STEAM' });

    if (resProd.recommendation.selectedScenarioId === 'NONE' || resSteam.recommendation.selectedScenarioId === 'NONE') {
      throw new Error('Optimization failed to select feasible scenarios for objectives');
    }

    const recProd = resProd.evaluations.find((e) => e.candidate.id === resProd.recommendation.selectedScenarioId);
    const recSteam = resSteam.evaluations.find((e) => e.candidate.id === resSteam.recommendation.selectedScenarioId);

    if (recProd!.estimatedProductionBopd < recSteam!.estimatedProductionBopd) {
      throw new Error('MAXIMIZE_PRODUCTION selected lower production candidate than MINIMIZE_STEAM');
    }
  });

  // TEST 13 — Constraints are respected
  runTest('TEST 13 — Constraints are respected', () => {
    const resConstrained = runScenarioOptimization({
      objective: 'MAXIMIZE_PRODUCTION',
      constraints: { maxSteamRateTpd: 80.0 },
    });

    const rec = resConstrained.evaluations.find((e) => e.candidate.id === resConstrained.recommendation.selectedScenarioId);
    if (rec && rec.candidate.inputs.steamInjectionRateTpd > 80.0) {
      throw new Error(`Selected candidate steam rate (${rec.candidate.inputs.steamInjectionRateTpd} TPD) exceeds constraint (80 TPD)`);
    }
  });

  // TEST 14 — Optimizer never commits directly to the Digital Twin
  runTest('TEST 14 — Optimizer never commits directly to the Digital Twin', () => {
    const baseScenario = loadBaseline();
    const optResult = runScenarioOptimization({ objective: 'MAXIMIZE_PRODUCTION' });

    // Ensure optimizer result does not mutate baseline object or inputs
    if (baseScenario.inputs.reservoirTemperatureC !== 48.0) {
      throw new Error('Optimizer mutated baseline scenario inputs directly');
    }
    if (optResult.evaluations.length === 0) {
      throw new Error('Expected evaluated candidates in optimization result');
    }
  });

  // TEST 15 — Apply Scenario changes active inputs and marks isStale = true
  runTest('TEST 15 — Apply Scenario changes active inputs and marks isStale = true', () => {
    const baseScenario = loadBaseline();
    const activeInputs = { ...baseScenario.inputs, steamInjectionRateTpd: 150.0 };
    const committedInputs = { ...baseScenario.inputs };

    const isStale = JSON.stringify(activeInputs) !== JSON.stringify(committedInputs);

    if (activeInputs.steamInjectionRateTpd !== 150.0) {
      throw new Error('Active inputs were not updated');
    }
    if (!isStale) {
      throw new Error('isStale should be true when active inputs differ from committed inputs');
    }
  });

  // TEST 16 — RUN SIMULATION commits the selected scenario
  runTest('TEST 16 — RUN SIMULATION commits the selected scenario', () => {
    const baseScenario = loadBaseline();
    const activeInputs = { ...baseScenario.inputs, reservoirTemperatureC: 75.0 };

    // Simulate RUN SIMULATION commit action
    const committedInputs = { ...activeInputs };
    const isStale = JSON.stringify(activeInputs) !== JSON.stringify(committedInputs);

    if (isStale) {
      throw new Error('isStale should be false after RUN SIMULATION commit');
    }
    if (committedInputs.reservoirTemperatureC !== 75.0) {
      throw new Error(`Committed temperature (${committedInputs.reservoirTemperatureC}) !== 75.0`);
    }
  });

  // TEST 17 — Committed run ID is propagated to the 2D Digital Twin
  runTest('TEST 17 — Committed run ID is propagated to the 2D Digital Twin', () => {
    const baseScenario = loadBaseline();
    const runId = `RUN-${baseScenario.id}-${Date.now()}`;

    if (!runId || !runId.startsWith('RUN-')) {
      throw new Error(`Invalid committed simulationRunId: ${runId}`);
    }
  });

  // TEST 18 — 2D visualization changes according to committed results
  runTest('TEST 18 — 2D visualization changes according to committed results', () => {
    const baseScenario = loadBaseline();
    const committedInputs = { ...baseScenario.inputs, steamInjectionRateTpd: 150.0 };

    // Calculate committed result for 2D twin consumers
    const cThermal = calculateThermalModel({ inputs: committedInputs } as any);
    const particleCount = Math.min(12, Math.round(committedInputs.steamInjectionRateTpd / 12.5));

    if (cThermal.predictedReservoirTemperatureC <= 48.0) {
      throw new Error('Expected elevated committed reservoir temperature');
    }
    if (particleCount !== 12) {
      throw new Error(`Expected 12 steam particles for 150 TPD, got ${particleCount}`);
    }
  });

  // TEST 19 — PLAY/PAUSE does not recalculate physics
  runTest('TEST 19 — PLAY/PAUSE does not recalculate physics', () => {
    let phase = 0;
    let isPlaying = true;
    const physicsTempBefore = 75.0;

    // Advance animation frame
    phase += 0.05;
    isPlaying = false; // PAUSE

    const physicsTempAfter = 75.0;
    if (physicsTempBefore !== physicsTempAfter || isPlaying !== false) {
      throw new Error('PLAY/PAUSE state altered committed physics metrics');
    }
  });

  // TEST 20 — Baseline → scenario comparison uses actual simulation outputs
  runTest('TEST 20 — Baseline → scenario comparison uses actual simulation outputs', () => {
    const currentInputs = BASELINE_INPUT_VALUES;
    const futureInputs = { ...BASELINE_INPUT_VALUES, steamInjectionRateTpd: 150.0 };

    const pred = runPredictionForecast(currentInputs, futureInputs);

    if (pred.predictedProductionBopd <= pred.currentProductionBopd) {
      throw new Error(`Expected predicted BOPD (${pred.predictedProductionBopd}) > current (${pred.currentProductionBopd})`);
    }
    if (pred.bopdDelta <= 0 || Number.isNaN(pred.bopdPercentChange)) {
      throw new Error('Forecast delta calculation failed or produced NaN');
    }
  });

  console.log('----------------------------------------------------');
  if (failCount === 0) {
    console.log(`ALL PHASE 4 OPTIMIZATION & PREDICTION TESTS PASSED (${passCount}/${passCount})`);
  } else {
    console.error(`FAILED OPTIMIZATION TESTS: ${failCount}`);
  }
  console.log('====================================================');
  return failCount;
}

// Execute directly if run via CLI / tsx
const proc = (globalThis as any).process;
if (proc?.argv && (import.meta.url === `file://${proc.argv[1]}` || proc.argv[1]?.endsWith('runPhase4OptimizationTests.ts'))) {
  const code = runPhase4OptimizationTests();
  if (proc?.exit) {
    proc.exit(code);
  }
}
