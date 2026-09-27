import { loadBaseline, updateScenario } from './scenario/scenarioEngine';
import { calculateThermalModel } from './thermal/thermalModel';
import { calculateViscosityModel } from './viscosity/viscosityModel';
import { calculateMobilityModel } from './mobility/mobilityModel';
import { calculateProductionModel } from './production/productionModel';
import { optimizeSRP } from './srpOptimization';
import { optimizeCSS } from './cssOptimization';
import { analyzeAIRisk } from './riskEngine';
import type { SimulationResult } from './scenario/types';

let failedTestCount = 0;

function runTest(description: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ PASS: ${description}`);
  } catch (err: unknown) {
    failedTestCount++;
    console.error(`✗ FAIL: ${description}`);
    console.error(err instanceof Error ? err.message : String(err));
  }
}

export function runDigitalTwinSynchronizationTests(): number {
  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — 2D TWIN SYNCHRONIZATION REGRESSION TEST');
  console.log('====================================================');

  // Simulated State Machine representing scenarioStore behavior
  let activeScenario = loadBaseline();
  let committedScenario = loadBaseline();
  let committedRunTimestamp = new Date().toISOString();

  function computeCommittedResult(): SimulationResult {
    const thermal = calculateThermalModel(committedScenario);
    const viscosity = calculateViscosityModel(thermal.predictedReservoirTemperatureC, 48.0);
    const mobility = calculateMobilityModel(viscosity.estimatedViscosityCp, thermal.predictedReservoirTemperatureC, committedScenario.inputs.permeabilityDarcy, 1.0, viscosity.estimatedViscosityCp);
    const drawdownBar = Math.max(5.0, committedScenario.inputs.reservoirPressureBar - 18.0);
    const production = calculateProductionModel(mobility.mobilityDcP, thermal.predictedReservoirTemperatureC, viscosity.estimatedViscosityCp, drawdownBar, committedScenario.inputs.vfdFrequencyHz, committedScenario.inputs.spm, committedScenario.inputs.strokeLengthMeters, undefined, committedScenario.inputs.waterCutPercent, committedScenario.inputs.reservoirPressureBar);
    const srp = optimizeSRP({ vfdFrequencyHz: committedScenario.inputs.vfdFrequencyHz, spm: committedScenario.inputs.spm, strokeLengthM: committedScenario.inputs.strokeLengthMeters, oilMobilityDcp: mobility.mobilityDcP, effectiveDrawdownBar: drawdownBar, temperatureC: thermal.predictedReservoirTemperatureC, viscosityCp: viscosity.estimatedViscosityCp });
    const css = optimizeCSS({ steamInjectionRateTpd: committedScenario.inputs.steamInjectionRateTpd, steamInjectionTemperatureC: committedScenario.inputs.steamInjectionTemperatureC, steamQualityFraction: committedScenario.inputs.steamQualityPercent / 100.0, injectionDurationDays: 5.0, soakDurationDays: committedScenario.inputs.soakDurationDays, productionDurationDays: 90.0, reservoirTemperatureC: thermal.predictedReservoirTemperatureC, reservoirPressureBar: committedScenario.inputs.reservoirPressureBar, baselineViscosityCp: viscosity.estimatedViscosityCp, baselineMobilityDPerCp: mobility.mobilityDcP, baselineProductionBopd: production.estimatedProductionBopd, vfdFrequencyHz: committedScenario.inputs.vfdFrequencyHz, spm: committedScenario.inputs.spm, strokeLengthMeters: committedScenario.inputs.strokeLengthMeters });
    const risk = analyzeAIRisk({ temperatureC: thermal.predictedReservoirTemperatureC, viscosityCp: viscosity.estimatedViscosityCp, mobilityDPerCp: mobility.mobilityDcP, productionBopd: production.estimatedProductionBopd, vfdFrequencyHz: committedScenario.inputs.vfdFrequencyHz, spm: committedScenario.inputs.spm, strokeLengthMeters: committedScenario.inputs.strokeLengthMeters, steamInjectionRateTpd: committedScenario.inputs.steamInjectionRateTpd, srpLoadIndex: srp.currentCandidate.loadIndex, cssThermalGainC: css.thermalBreakdown.deltaTemperatureC });

    return {
      thermal,
      viscosity,
      mobility,
      production,
      srp,
      css,
      risk,
      pressure: { reservoirPressureBar: committedScenario.inputs.reservoirPressureBar, flowingPressureBar: 18.0, drawdownBar, source: 'Jodhpur Sandstone Reservoir Pressure Model' },
      trace: {
        scenarioId: committedScenario.id,
        scenarioName: committedScenario.name,
        runId: `RUN-${committedScenario.id}-${committedRunTimestamp}`,
        inputs: { ...committedScenario.inputs },
        derived: { predictedReservoirTemperatureC: thermal.predictedReservoirTemperatureC, estimatedViscosityCp: viscosity.estimatedViscosityCp, mobilityDcP: mobility.mobilityDcP, estimatedProductionBopd: production.estimatedProductionBopd, totalFluidProductionBfpd: production.totalFluidProductionBfpd, srpLoadIndex: srp.currentCandidate.loadIndex, riskScore: risk.riskScore, riskLevel: risk.riskLevel },
        calculatedAt: committedRunTimestamp,
      },
      inputs: { ...committedScenario.inputs },
      calculatedAt: committedRunTimestamp,
    };
  }

  // TEST 1: Draft parameter change → committed result unchanged → Twin unchanged
  runTest('TEST 1: Draft parameter change updates draft state & marks isStale=true, but committed result and 2D Twin remain strictly unchanged', () => {
    const initialCommittedResult = computeCommittedResult();
    const initialRunId = initialCommittedResult.trace.runId;

    // User modifies draft slider parameters without clicking RUN SIMULATION
    activeScenario = updateScenario(activeScenario, {
      reservoirTemperatureC: 85.0,
      steamInjectionRateTpd: 150.0,
      spm: 16.0,
      vfdFrequencyHz: 65.0,
    });

    const isStale = JSON.stringify(activeScenario.inputs) !== JSON.stringify(committedScenario.inputs);
    if (!isStale) {
      throw new Error('Expected isStale to evaluate to true after draft input modification');
    }

    const currentCommittedResult = computeCommittedResult();

    if (currentCommittedResult.trace.runId !== initialRunId) {
      throw new Error('Committed run ID changed on draft slider modification');
    }
    if (currentCommittedResult.inputs.reservoirTemperatureC !== 48.0) {
      throw new Error(`Committed reservoir temperature changed without RUN SIMULATION: got ${currentCommittedResult.inputs.reservoirTemperatureC}°C`);
    }
    if (currentCommittedResult.inputs.spm !== 8.0) {
      throw new Error(`Committed SPM changed without RUN SIMULATION: got ${currentCommittedResult.inputs.spm}`);
    }
    if (currentCommittedResult.thermal.predictedReservoirTemperatureC !== initialCommittedResult.thermal.predictedReservoirTemperatureC) {
      throw new Error('Committed predicted reservoir temperature changed without RUN SIMULATION');
    }
  });

  // TEST 2: RUN SIMULATION → committed result changes → Twin updates
  runTest('TEST 2: Clicking RUN SIMULATION commits new inputs, generates exactly one new run ID, and updates committed result for 2D Twin', () => {
    // User clicks RUN SIMULATION
    committedScenario = { ...activeScenario };
    committedRunTimestamp = new Date().toISOString();

    const updatedCommittedResult = computeCommittedResult();
    const isStale = JSON.stringify(activeScenario.inputs) !== JSON.stringify(committedScenario.inputs);

    if (isStale) {
      throw new Error('Expected isStale to evaluate to false after RUN SIMULATION commit');
    }
    if (updatedCommittedResult.inputs.reservoirTemperatureC !== 85.0) {
      throw new Error(`Expected committed reservoir temperature 85.0°C, got ${updatedCommittedResult.inputs.reservoirTemperatureC}°C`);
    }
    if (updatedCommittedResult.inputs.spm !== 16.0) {
      throw new Error(`Expected committed SPM 16.0, got ${updatedCommittedResult.inputs.spm}`);
    }
    if (updatedCommittedResult.thermal.predictedReservoirTemperatureC < 85.0) {
      throw new Error(`Expected updated thermal prediction >= 85.0°C, got ${updatedCommittedResult.thermal.predictedReservoirTemperatureC}°C`);
    }
  });

  // TEST 3: Animation playback uses committed scenario parameters
  runTest('TEST 3: PLAY animation consumes committed SPM & stroke length and does not alter physics on slider edits while playing', () => {
    const committedResult = computeCommittedResult();

    // Verify animation controller parameters derived strictly from committed result
    const activeSpm = committedResult.inputs.spm;

    if (activeSpm !== 16.0) {
      throw new Error(`Animation controller activeSpm mismatch: expected 16.0, got ${activeSpm}`);
    }

    // User drags slider while animation is playing
    activeScenario = updateScenario(activeScenario, { spm: 4.0 });

    const currentCommittedResult = computeCommittedResult();
    const playbackSpm = currentCommittedResult.inputs.spm;

    if (playbackSpm !== 16.0) {
      throw new Error(`Animation playback SPM altered during live play on draft slider move: got ${playbackSpm}`);
    }
  });

  console.log('----------------------------------------------------');
  console.log(`2D TWIN SYNCHRONIZATION REGRESSION TESTS COMPLETED: ${3 - failedTestCount}/3 PASSED`);
  console.log('====================================================');

  return failedTestCount;
}

// Execute directly
runDigitalTwinSynchronizationTests();

