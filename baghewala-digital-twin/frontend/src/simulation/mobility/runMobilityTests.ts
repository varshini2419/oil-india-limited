import { loadBaseline } from '../scenario/scenarioEngine';
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel, compareMobilityResults } from './mobilityModel';
import { validateMobilityInputs } from './validation';

export interface MobilityTestResultItem {
  testName: string;
  passed: boolean;
  details: string;
}

export const runAllMobilityTests = (): MobilityTestResultItem[] => {
  const results: MobilityTestResultItem[] = [];

  // TEST 1: Baseline mobility calculation
  try {
    const baseThermal = calculateThermalModel(loadBaseline());
    const baseViscosity = calculateViscosityModel(baseThermal.predictedReservoirTemperatureC);
    const baseMobility = calculateMobilityModel(
      baseViscosity.estimatedViscosityCp,
      baseThermal.predictedReservoirTemperatureC
    );

    const passed =
      baseMobility.mobilityDcP > 0 &&
      Number.isFinite(baseMobility.mobilityDcP) &&
      !Number.isNaN(baseMobility.mobilityDcP) &&
      baseMobility.permeabilityD === 2.5 &&
      baseMobility.mobilityUnit === 'D/cP';

    results.push({
      testName: 'TEST 1: Baseline Mobility',
      passed,
      details: `Temp: ${baseThermal.predictedReservoirTemperatureC}°C, Visc: ${baseViscosity.estimatedViscosityCp} cP → Mobility: ${baseMobility.mobilityDcP} D/cP`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 1: Baseline Mobility', passed: false, details: err?.message || String(err) });
  }

  // TEST 2: Higher temp → lower viscosity → higher mobility
  try {
    const lowTempRes = calculateViscosityModel(48.0);
    const highTempRes = calculateViscosityModel(100.0);

    const lowMob = calculateMobilityModel(lowTempRes.estimatedViscosityCp, 48.0);
    const highMob = calculateMobilityModel(highTempRes.estimatedViscosityCp, 100.0);

    const passed =
      highTempRes.estimatedViscosityCp < lowTempRes.estimatedViscosityCp &&
      highMob.mobilityDcP > lowMob.mobilityDcP;

    results.push({
      testName: 'TEST 2: Temp ↑ → Visc ↓ → Mobility ↑',
      passed,
      details: `T: 48°C → 100°C | Visc: ${lowTempRes.estimatedViscosityCp} → ${highTempRes.estimatedViscosityCp} cP | Mobility: ${lowMob.mobilityDcP} → ${highMob.mobilityDcP} D/cP`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 2: Temp ↑ → Visc ↓ → Mobility ↑', passed: false, details: err?.message || String(err) });
  }

  // TEST 3: Lower temp → higher viscosity → lower mobility
  try {
    const highTempRes = calculateViscosityModel(120.0);
    const lowTempRes = calculateViscosityModel(60.0);

    const highMob = calculateMobilityModel(highTempRes.estimatedViscosityCp, 120.0);
    const lowMob = calculateMobilityModel(lowTempRes.estimatedViscosityCp, 60.0);

    const passed =
      lowTempRes.estimatedViscosityCp > highTempRes.estimatedViscosityCp &&
      lowMob.mobilityDcP < highMob.mobilityDcP;

    results.push({
      testName: 'TEST 3: Temp ↓ → Visc ↑ → Mobility ↓',
      passed,
      details: `T: 120°C → 60°C | Visc: ${highTempRes.estimatedViscosityCp} → ${lowTempRes.estimatedViscosityCp} cP | Mobility: ${highMob.mobilityDcP} → ${lowMob.mobilityDcP} D/cP`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 3: Temp ↓ → Visc ↑ → Mobility ↓', passed: false, details: err?.message || String(err) });
  }

  // TEST 4: Higher permeability → higher mobility
  try {
    const visc = 500.0;
    const mobPerm2_5 = calculateMobilityModel(visc, 80.0, 2.5);
    const mobPerm5_0 = calculateMobilityModel(visc, 80.0, 5.0);

    const passed = mobPerm5_0.mobilityDcP > mobPerm2_5.mobilityDcP;

    results.push({
      testName: 'TEST 4: Permeability ↑ → Mobility ↑',
      passed,
      details: `Perm 2.5D → 5.0D | Mobility: ${mobPerm2_5.mobilityDcP} → ${mobPerm5_0.mobilityDcP} D/cP`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 4: Permeability ↑ → Mobility ↑', passed: false, details: err?.message || String(err) });
  }

  // TEST 5: Relative permeability effect
  try {
    const visc = 500.0;
    const mobFull = calculateMobilityModel(visc, 80.0, 2.5, 1.0);
    const mobHalf = calculateMobilityModel(visc, 80.0, 2.5, 0.5);

    const passed = Math.abs(mobHalf.mobilityDcP - (mobFull.mobilityDcP / 2)) < 0.0001;

    results.push({
      testName: 'TEST 5: Relative Permeability Halved',
      passed,
      details: `k_ro 1.0 (${mobFull.mobilityDcP} D/cP) vs k_ro 0.5 (${mobHalf.mobilityDcP} D/cP)`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 5: Relative Permeability Halved', passed: false, details: err?.message || String(err) });
  }

  // TEST 6: Same input produces deterministic output
  try {
    const mob1 = calculateMobilityModel(450.0, 80.0, 2.5, 1.0);
    const mob2 = calculateMobilityModel(450.0, 80.0, 2.5, 1.0);

    const passed = mob1.mobilityDcP === mob2.mobilityDcP && mob1.mobilityDeltaDcP === mob2.mobilityDeltaDcP;

    results.push({
      testName: 'TEST 6: Deterministic Output',
      passed,
      details: `Identical output: ${mob1.mobilityDcP} D/cP === ${mob2.mobilityDcP} D/cP`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 6: Deterministic Output', passed: false, details: err?.message || String(err) });
  }

  // TEST 7: NaN viscosity is rejected
  try {
    const check = validateMobilityInputs(NaN, 2.5, 1.0);
    const mob = calculateMobilityModel(NaN, 48.0);

    const passed = !check.isValid && mob.status === 'INVALID' && mob.warnings.length > 0;

    results.push({
      testName: 'TEST 7: NaN Viscosity Rejected',
      passed,
      details: `Validation caught NaN cleanly. Status: ${mob.status}`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 7: NaN Viscosity Rejected', passed: false, details: err?.message || String(err) });
  }

  // TEST 8: Zero viscosity is rejected
  try {
    const check = validateMobilityInputs(0.0, 2.5, 1.0);
    const mob = calculateMobilityModel(0.0, 48.0);

    const passed = !check.isValid && mob.status === 'INVALID';

    results.push({
      testName: 'TEST 8: Zero Viscosity Rejected',
      passed,
      details: `Validation caught zero viscosity. Status: ${mob.status}`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 8: Zero Viscosity Rejected', passed: false, details: err?.message || String(err) });
  }

  // TEST 9: Negative permeability is rejected
  try {
    const check = validateMobilityInputs(500.0, -2.5, 1.0);

    const passed = !check.isValid && check.errors.some((e) => e.includes('Negative'));

    results.push({
      testName: 'TEST 9: Negative Permeability Rejected',
      passed,
      details: `Validation error: "${check.errors[0]}"`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 9: Negative Permeability Rejected', passed: false, details: err?.message || String(err) });
  }

  // TEST 10: Relative permeability > 1.0 is rejected
  try {
    const check = validateMobilityInputs(500.0, 2.5, 1.5);

    const passed = !check.isValid && check.errors.some((e) => e.includes('Relative permeability'));

    results.push({
      testName: 'TEST 10: Relative Permeability > 1.0 Rejected',
      passed,
      details: `Validation error: "${check.errors[0]}"`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 10: Relative Permeability > 1.0 Rejected', passed: false, details: err?.message || String(err) });
  }

  // TEST 11: Baseline vs scenario comparison
  try {
    const baseMob = calculateMobilityModel(15000.0, 48.0, 2.5, 1.0);
    const scenMob = calculateMobilityModel(450.0, 80.0, 2.5, 1.0, 15000.0);

    const rows = compareMobilityResults(baseMob, scenMob);

    const passed = rows.length === 3 && rows[2].delta > 0 && rows[2].percentChange > 0;

    results.push({
      testName: 'TEST 11: Scenario Comparison Table',
      passed,
      details: `Mobility delta +${rows[2].delta} D/cP (+${rows[2].percentChange}%)`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 11: Scenario Comparison Table', passed: false, details: err?.message || String(err) });
  }

  // TEST 12: Step 4.4 Viscosity Flows into Step 4.5
  try {
    const thermal = calculateThermalModel(loadBaseline());
    const viscosity = calculateViscosityModel(thermal.predictedReservoirTemperatureC);
    const mobility = calculateMobilityModel(viscosity.estimatedViscosityCp, thermal.predictedReservoirTemperatureC);

    const passed =
      mobility.viscosityCp === viscosity.estimatedViscosityCp &&
      mobility.temperatureC === thermal.predictedReservoirTemperatureC;

    results.push({
      testName: 'TEST 12: Step 4.4 → Step 4.5 Pipeline Flow',
      passed,
      details: `Temp ${thermal.predictedReservoirTemperatureC}°C → Visc ${viscosity.estimatedViscosityCp} cP → Mobility ${mobility.mobilityDcP} D/cP`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 12: Step 4.4 → Step 4.5 Pipeline Flow', passed: false, details: err?.message || String(err) });
  }

  return results;
};

// Auto-run when executed directly
const results = runAllMobilityTests();
console.log('=== BAGHEWALA MOBILITY MODEL TEST SUITE RESULTS ===');
results.forEach((r) => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.testName}: ${r.details}`);
});
