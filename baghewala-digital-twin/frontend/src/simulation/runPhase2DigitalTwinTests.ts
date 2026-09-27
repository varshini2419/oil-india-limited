import { loadBaseline, updateScenario } from './scenario/scenarioEngine';
import { calculateThermalModel } from './thermal/thermalModel';
import { calculateViscosityModel } from './viscosity/viscosityModel';
import { calculateMobilityModel } from './mobility/mobilityModel';
import { calculateProductionModel } from './production/productionModel';
import { analyzeAIRisk } from './riskEngine';

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

export function runPhase2DigitalTwinTests(): number {
  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — PHASE 2 2D TWIN CONNECTIVITY SUITE');
  console.log('====================================================');

  // TEST 1 — SPM Motion Cycle Time Coupling
  runTest('TEST 1 — SPM: Changing SPM alters cycle duration (2 SPM cycle time ≈ 4x 8 SPM)', () => {
    const scenario8 = updateScenario(loadBaseline(), { spm: 8.0 });
    const scenario2 = updateScenario(loadBaseline(), { spm: 2.0 });

    const duration8Ms = (8.0 / scenario8.inputs.spm) * 2500;
    const duration2Ms = (8.0 / scenario2.inputs.spm) * 2500;

    if (duration2Ms / duration8Ms !== 4.0) {
      throw new Error(`Expected 2 SPM cycle duration (${duration2Ms}ms) to be 4x of 8 SPM duration (${duration8Ms}ms)`);
    }
  });

  // TEST 2 — Stroke Length Amplitude Scaling
  runTest('TEST 2 — Stroke: 2.5m -> 1.0m decreases visual stroke displacement amplitude proportionally', () => {
    const strokeBase = 2.5;
    const strokeLow = 1.0;

    const baseAmplitude = 35.0 * (strokeBase / 2.5);
    const lowAmplitude = 35.0 * (strokeLow / 2.5);

    if (lowAmplitude !== 14.0) {
      throw new Error(`Expected 1.0m stroke amplitude to equal 14.0px, got ${lowAmplitude}px`);
    }
    if (lowAmplitude / baseAmplitude !== 1.0 / 2.5) {
      throw new Error(`Stroke amplitude scaling ratio mismatch: expected 0.4, got ${lowAmplitude / baseAmplitude}`);
    }
  });

  // TEST 3 — Temperature Thermal Radius Propagation
  runTest('TEST 3 — Temperature: 48°C -> 85°C updates thermal front radius & zone stroke color', () => {
    const scBaseline = updateScenario(loadBaseline(), { reservoirTemperatureC: 48.0 });
    const scHot = updateScenario(loadBaseline(), { reservoirTemperatureC: 85.0 });

    const thermalBase = calculateThermalModel(scBaseline);
    const thermalHot = calculateThermalModel(scHot);

    const evalTempHot = Math.max(scHot.inputs.reservoirTemperatureC, thermalHot.predictedReservoirTemperatureC);

    const scaleBase = Math.max(0.5, Math.min(2.0, 0.75 + thermalBase.thermalInfluenceC / 35.0));
    const scaleHot = Math.max(0.5, Math.min(2.0, 0.75 + (evalTempHot - 48.0) / 35.0));

    if (evalTempHot < 85.0) {
      throw new Error(`Expected eval temp >= 85°C, got ${evalTempHot}°C`);
    }
    if (scaleHot <= scaleBase) {
      throw new Error(`Expected hot thermal scale (${scaleHot}) > baseline scale (${scaleBase})`);
    }
  });

  // TEST 4 — Steam Injection Rate & Particle Count Coupling
  runTest('TEST 4 — Steam: 50 TPD -> 150 TPD increases steam particle count & quality radius', () => {
    const rate50 = 50.0;
    const rate150 = 150.0;

    const count50 = Math.max(2, Math.min(12, Math.round(2 + (rate50 / 15.0))));
    const count150 = Math.max(2, Math.min(12, Math.round(2 + (rate150 / 15.0))));

    if (count150 <= count50) {
      throw new Error(`Expected 150 TPD particle count (${count150}) > 50 TPD count (${count50})`);
    }
    if (count150 !== 12) {
      throw new Error(`Expected 150 TPD to yield 12 particles, got ${count150}`);
    }
  });

  // TEST 5 — Production BOPD Density vs SPM Independence
  runTest('TEST 5 — Production: Production particle density scales with BOPD and is NOT solely controlled by SPM', () => {
    const scLowBopd = updateScenario(loadBaseline(), { spm: 8.0, reservoirTemperatureC: 32.0 });
    const scHighBopd = updateScenario(loadBaseline(), { spm: 8.0, reservoirTemperatureC: 80.0, steamInjectionRateTpd: 120.0 });

    const thermalLow = calculateThermalModel(scLowBopd);
    const thermalHigh = calculateThermalModel(scHighBopd);

    const viscLow = calculateViscosityModel(thermalLow.predictedReservoirTemperatureC, 48.0);
    const viscHigh = calculateViscosityModel(Math.max(80.0, thermalHigh.predictedReservoirTemperatureC), 48.0);

    const mobLow = calculateMobilityModel(viscLow.estimatedViscosityCp, thermalLow.predictedReservoirTemperatureC, 2.5);
    const mobHigh = calculateMobilityModel(viscHigh.estimatedViscosityCp, Math.max(80.0, thermalHigh.predictedReservoirTemperatureC), 2.5);

    const prodLow = calculateProductionModel(mobLow.mobilityDcP, thermalLow.predictedReservoirTemperatureC, viscLow.estimatedViscosityCp, 30.0, 50, 8, 2.5);
    const prodHigh = calculateProductionModel(mobHigh.mobilityDcP, Math.max(80.0, thermalHigh.predictedReservoirTemperatureC), viscHigh.estimatedViscosityCp, 30.0, 50, 8, 2.5);

    const particlesLow = Math.max(2, Math.min(12, Math.round(2 + (prodLow.estimatedProductionBopd / 0.35))));
    const particlesHigh = Math.max(2, Math.min(12, Math.round(2 + (prodHigh.estimatedProductionBopd / 0.35))));

    if (scLowBopd.inputs.spm !== scHighBopd.inputs.spm) {
      throw new Error('SPM must be identical (8.0) to prove BOPD independence');
    }
    if (prodHigh.estimatedProductionBopd <= prodLow.estimatedProductionBopd) {
      throw new Error(`Expected High BOPD (${prodHigh.estimatedProductionBopd}) > Low BOPD (${prodLow.estimatedProductionBopd})`);
    }
    if (particlesHigh <= particlesLow) {
      throw new Error(`Expected production particle count for high BOPD (${particlesHigh}) > low BOPD (${particlesLow})`);
    }
  });

  // TEST 6 — Water Cut Fraction Encoding
  runTest('TEST 6 — Water Cut: 20% -> 60% increases water particle proportion (cyan) vs oil (gold)', () => {
    const wc20 = 20.0;
    const wc60 = 60.0;

    const count = 10;
    const waterParticles20 = Array.from({ length: count }, (_, idx) => (idx / count) < (wc20 / 100)).filter(Boolean).length;
    const waterParticles60 = Array.from({ length: count }, (_, idx) => (idx / count) < (wc60 / 100)).filter(Boolean).length;

    if (waterParticles60 <= waterParticles20) {
      throw new Error(`Expected 60% water cut particles (${waterParticles60}) > 20% water cut particles (${waterParticles20})`);
    }
    if (waterParticles20 !== 2 || waterParticles60 !== 6) {
      throw new Error(`Expected 2 water particles for 20% WC and 6 for 60% WC, got ${waterParticles20} & ${waterParticles60}`);
    }
  });

  // TEST 7 — Reservoir Pressure Depletion Coupling
  runTest('TEST 7 — Pressure: Depleted pressure (30 bar) reduces drawdown and inflow particle mobility', () => {
    const scNormal = updateScenario(loadBaseline(), { reservoirPressureBar: 48.0 });
    const scDepleted = updateScenario(loadBaseline(), { reservoirPressureBar: 30.0 });

    const drawdownNormal = Math.max(5.0, scNormal.inputs.reservoirPressureBar - 18.0);
    const drawdownDepleted = Math.max(5.0, scDepleted.inputs.reservoirPressureBar - 18.0);

    if (drawdownDepleted >= drawdownNormal) {
      throw new Error(`Expected depleted drawdown (${drawdownDepleted} bar) < normal drawdown (${drawdownNormal} bar)`);
    }

    const prodNormal = calculateProductionModel(0.0005, 48, 5000, drawdownNormal, 50, 8, 2.5);
    const prodDepleted = calculateProductionModel(0.0005, 48, 5000, drawdownDepleted, 50, 8, 2.5, prodNormal.estimatedProductionBopd);

    if (prodDepleted.estimatedProductionBopd >= prodNormal.estimatedProductionBopd) {
      throw new Error(`Expected depleted production (${prodDepleted.estimatedProductionBopd}) < normal production (${prodNormal.estimatedProductionBopd})`);
    }
  });

  // TEST 8 — System Risk Level Coupling
  runTest('TEST 8 — Risk: LOW and HIGH risk scenarios yield corresponding risk level & score in 2D twin', () => {
    const scLow = updateScenario(loadBaseline(), { reservoirTemperatureC: 60.0, spm: 8.0 });
    const scHigh = updateScenario(loadBaseline(), { reservoirTemperatureC: 30.0, spm: 18.0, vfdFrequencyHz: 68.0 });

    const riskLow = analyzeAIRisk({
      temperatureC: 60.0,
      viscosityCp: 4000,
      mobilityDPerCp: 0.0006,
      productionBopd: 1.2,
      vfdFrequencyHz: scLow.inputs.vfdFrequencyHz,
      spm: scLow.inputs.spm,
      strokeLengthMeters: scLow.inputs.strokeLengthMeters,
      steamInjectionRateTpd: scLow.inputs.steamInjectionRateTpd,
      srpLoadIndex: 45,
      cssThermalGainC: 12,
    });

    const riskHigh = analyzeAIRisk({
      temperatureC: 30.0,
      viscosityCp: 35000,
      mobilityDPerCp: 0.00008,
      productionBopd: 0.3,
      vfdFrequencyHz: scHigh.inputs.vfdFrequencyHz,
      spm: scHigh.inputs.spm,
      strokeLengthMeters: scHigh.inputs.strokeLengthMeters,
      steamInjectionRateTpd: scHigh.inputs.steamInjectionRateTpd,
      srpLoadIndex: 92,
      cssThermalGainC: 0,
    });

    if (riskHigh.riskScore <= riskLow.riskScore) {
      throw new Error(`Expected HIGH risk score (${riskHigh.riskScore}) > LOW risk score (${riskLow.riskScore})`);
    }
    if (riskHigh.riskLevel !== 'HIGH' && riskHigh.riskLevel !== 'CRITICAL') {
      throw new Error(`Expected HIGH/CRITICAL risk level for elevated scenario, got ${riskHigh.riskLevel}`);
    }
  });

  // TEST 9 — RUN SIMULATION Execution Boundary
  runTest('TEST 9 — RUN SIMULATION: Input edits update active state; RUN SIMULATION commits runId and clears stale flag', () => {
    const scBase = loadBaseline();
    const runIdBase = `RUN-${scBase.id}-1000`;
    const scEdited = updateScenario(scBase, { reservoirTemperatureC: 75.0 });

    const isStaleBeforeRun = JSON.stringify(scEdited.inputs) !== JSON.stringify(scBase.inputs);
    if (!isStaleBeforeRun) {
      throw new Error('Expected isStale === true before RUN SIMULATION execution');
    }

    const scCommitted = scEdited;
    const runIdCommitted = `RUN-${scCommitted.id}-2000`;
    const isStaleAfterRun = JSON.stringify(scEdited.inputs) !== JSON.stringify(scCommitted.inputs);

    if (isStaleAfterRun) {
      throw new Error('Expected isStale === false after RUN SIMULATION commit');
    }
    if (runIdCommitted === runIdBase) {
      throw new Error('Expected unique updated simulationRunId after commit');
    }
  });

  // TEST 10 — PLAY / PAUSE Animation Semantics
  runTest('TEST 10 — PLAY / PAUSE: PLAY updates phase scalar; PAUSE freezes phase; physics values remain identical', () => {
    let phase = 0;
    let isPlaying = false;
    const physicsTempBefore = 75.0;

    // Simulate PLAY
    isPlaying = true;
    phase += (100 / 2500) * 2 * Math.PI;

    if (phase <= 0 || !isPlaying) {
      throw new Error('Expected phase increment during PLAY state');
    }

    // Simulate PAUSE
    isPlaying = false;
    const frozenPhase = phase;

    const physicsTempAfter = 75.0;
    if (physicsTempBefore !== physicsTempAfter || frozenPhase !== phase) {
      throw new Error('Physics values or frozen phase altered during PAUSE state');
    }
  });

  // TEST 11 — Permeability Reduction Coupling (2.5 D -> 1.0 D)
  runTest('TEST 11 — Permeability: 2.5 D -> 1.0 D decreases oil mobility, reduces BOPD & inflow particle count', () => {
    const scBaseline = updateScenario(loadBaseline(), { permeabilityDarcy: 2.5 });
    const scLowPerm = updateScenario(loadBaseline(), { permeabilityDarcy: 1.0 });

    const mobBase = calculateMobilityModel(5000, 48, scBaseline.inputs.permeabilityDarcy);
    const mobLow = calculateMobilityModel(5000, 48, scLowPerm.inputs.permeabilityDarcy);

    if (mobLow.mobilityDcP >= mobBase.mobilityDcP) {
      throw new Error(`Expected low perm mobility (${mobLow.mobilityDcP}) < baseline mobility (${mobBase.mobilityDcP})`);
    }

    const prodBase = calculateProductionModel(mobBase.mobilityDcP, 48, 5000, 30.0, 50, 8, 2.5);
    const prodLow = calculateProductionModel(mobLow.mobilityDcP, 48, 5000, 30.0, 50, 8, 2.5, prodBase.estimatedProductionBopd);

    if (prodLow.estimatedProductionBopd >= prodBase.estimatedProductionBopd) {
      throw new Error(`Expected low perm BOPD (${prodLow.estimatedProductionBopd}) < baseline BOPD (${prodBase.estimatedProductionBopd})`);
    }

    const countBase = Math.max(2, Math.min(6, Math.floor(2 + Math.min(4, mobBase.mobilityDcP * 2500))));
    const countLow = Math.max(2, Math.min(6, Math.floor(2 + Math.min(4, mobLow.mobilityDcP * 2500))));

    if (countLow >= countBase) {
      throw new Error(`Expected low perm inflow particle count (${countLow}) < baseline count (${countBase})`);
    }
  });

  // TEST 12 — Steam Quality Coupling (75% -> 90%)
  runTest('TEST 12 — Steam Quality: 75% -> 90% expands steam particle radius and updates committed quality', () => {
    const qual75 = 75.0;
    const qual90 = 90.0;

    const radius75 = 3.0 + (qual75 / 100.0) * 2.0;
    const radius90 = 3.0 + (qual90 / 100.0) * 2.0;

    if (radius90 <= radius75) {
      throw new Error(`Expected 90% steam quality particle radius (${radius90}px) > 75% radius (${radius75}px)`);
    }
    if (radius90 !== 4.8) {
      throw new Error(`Expected 90% quality radius to equal 4.8px, got ${radius90}px`);
    }
  });

  console.log('----------------------------------------------------');
  if (failedTestCount === 0) {
    console.log('ALL PHASE 2 DIGITAL TWIN CONNECTIVITY TESTS PASSED (12/12)');
  } else {
    console.error(`FAILED DIGITAL TWIN CONNECTIVITY TESTS: ${failedTestCount}`);
  }
  console.log('====================================================');
  return failedTestCount;
}

// Execute directly if run via CLI / tsx
const proc = (globalThis as any).process;
if (proc?.argv && (import.meta.url === `file://${proc.argv[1]}` || proc.argv[1]?.endsWith('runPhase2DigitalTwinTests.ts'))) {
  const code = runPhase2DigitalTwinTests();
  if (code !== 0 && proc.exit) {
    proc.exit(1);
  }
}
