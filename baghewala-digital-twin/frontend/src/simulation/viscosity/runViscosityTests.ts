import { loadBaseline, createScenario } from '../scenario/scenarioEngine';
import { BASELINE_INPUT_VALUES } from '../scenario/defaults';
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel, compareViscosityResults } from './viscosityModel';
import { validateViscosityInputs } from './validation';

export interface ViscosityTestResultItem {
  testName: string;
  passed: boolean;
  details: string;
}

export const runAllViscosityTests = (): ViscosityTestResultItem[] => {
  const results: ViscosityTestResultItem[] = [];

  // TEST 1 — BASELINE
  try {
    const baselineScenario = loadBaseline();
    const thermalResult = calculateThermalModel(baselineScenario);
    const viscosityResult = calculateViscosityModel(thermalResult.predictedReservoirTemperatureC);

    const passed =
      viscosityResult.estimatedViscosityCp > 0 &&
      Number.isFinite(viscosityResult.estimatedViscosityCp) &&
      !Number.isNaN(viscosityResult.estimatedViscosityCp) &&
      viscosityResult.modelStatus === 'CALIBRATED';

    results.push({
      testName: 'TEST 1 — BASELINE',
      passed,
      details: `Temp: ${thermalResult.predictedReservoirTemperatureC}°C → Estimated Viscosity: ${viscosityResult.estimatedViscosityCp} cP (Status: ${viscosityResult.modelStatus})`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 1 — BASELINE',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 2 — INCREASE TEMPERATURE
  try {
    const baseThermal = calculateThermalModel(loadBaseline());
    const highSteamScenario = createScenario('High Steam', 'High thermal injection', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 150.0,
      soakDurationDays: 10.0,
    });
    const highThermal = calculateThermalModel(highSteamScenario);

    const baseViscosity = calculateViscosityModel(baseThermal.predictedReservoirTemperatureC);
    const highViscosity = calculateViscosityModel(highThermal.predictedReservoirTemperatureC);

    const passed =
      highThermal.predictedReservoirTemperatureC > baseThermal.predictedReservoirTemperatureC &&
      highViscosity.estimatedViscosityCp < baseViscosity.estimatedViscosityCp;

    results.push({
      testName: 'TEST 2 — INCREASE TEMPERATURE',
      passed,
      details: `Temp increase (${baseThermal.predictedReservoirTemperatureC}°C → ${highThermal.predictedReservoirTemperatureC}°C) caused Viscosity drop (${baseViscosity.estimatedViscosityCp} cP → ${highViscosity.estimatedViscosityCp} cP)`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 2 — INCREASE TEMPERATURE',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 3 — DECREASE TEMPERATURE
  try {
    const highSteamScenario = createScenario('High Steam', 'High thermal injection', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 150.0,
      soakDurationDays: 10.0,
    });
    const lowSteamScenario = createScenario('Low Steam', 'Low thermal injection', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 10.0,
      soakDurationDays: 2.0,
    });

    const highThermal = calculateThermalModel(highSteamScenario);
    const lowThermal = calculateThermalModel(lowSteamScenario);

    const highViscosity = calculateViscosityModel(highThermal.predictedReservoirTemperatureC);
    const lowViscosity = calculateViscosityModel(lowThermal.predictedReservoirTemperatureC);

    const passed =
      lowThermal.predictedReservoirTemperatureC < highThermal.predictedReservoirTemperatureC &&
      lowViscosity.estimatedViscosityCp > highViscosity.estimatedViscosityCp;

    results.push({
      testName: 'TEST 3 — DECREASE TEMPERATURE',
      passed,
      details: `Temp decrease (${highThermal.predictedReservoirTemperatureC}°C → ${lowThermal.predictedReservoirTemperatureC}°C) caused Viscosity increase (${highViscosity.estimatedViscosityCp} cP → ${lowViscosity.estimatedViscosityCp} cP)`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 3 — DECREASE TEMPERATURE',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 4 — SAME INPUT (DETERMINISTIC)
  try {
    const temp = 75.0;
    const res1 = calculateViscosityModel(temp);
    const res2 = calculateViscosityModel(temp);

    const passed =
      res1.estimatedViscosityCp === res2.estimatedViscosityCp &&
      res1.viscosityChangeCp === res2.viscosityChangeCp;

    results.push({
      testName: 'TEST 4 — SAME INPUT (DETERMINISTIC)',
      passed,
      details: `Identical outputs for T=${temp}°C: ${res1.estimatedViscosityCp} cP === ${res2.estimatedViscosityCp} cP`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 4 — SAME INPUT (DETERMINISTIC)',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 5 — INVALID INPUT (NaN)
  try {
    const invalidCheck = validateViscosityInputs(NaN);
    const res = calculateViscosityModel(NaN);

    const passed =
      !invalidCheck.isValid &&
      res.modelStatus === 'INVALID' &&
      res.warnings.length > 0 &&
      Number.isFinite(res.estimatedViscosityCp);

    results.push({
      testName: 'TEST 5 — INVALID INPUT (NaN)',
      passed,
      details: `Validation caught NaN safely. Fallback output: ${res.estimatedViscosityCp} cP, Status: ${res.modelStatus}`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 5 — INVALID INPUT (NaN)',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 6 — OUT-OF-RANGE INPUT (220°C)
  try {
    const extremeTemp = 220.0; // Above 180°C calibration boundary
    const extremeCheck = validateViscosityInputs(extremeTemp);
    const res = calculateViscosityModel(extremeTemp);

    const passed =
      extremeCheck.warnings.length > 0 &&
      res.modelStatus === 'EXTRAPOLATED' &&
      res.estimatedViscosityCp > 0 &&
      res.warnings.length > 0;

    results.push({
      testName: 'TEST 6 — OUT-OF-RANGE INPUT (220°C)',
      passed,
      details: `Extrapolated output: ${res.estimatedViscosityCp} cP, Status: ${res.modelStatus}, Warning: "${res.warnings[0]}"`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 6 — OUT-OF-RANGE INPUT (220°C)',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 7 — COMPARISON TABLE GENERATION
  try {
    const baseRes = calculateViscosityModel(48.0);
    const scenRes = calculateViscosityModel(80.0);
    const rows = compareViscosityResults(baseRes, scenRes);

    const passed = rows.length === 2 && rows[1].delta < 0;

    results.push({
      testName: 'TEST 7 — COMPARISON TABLE',
      passed,
      details: `Generated ${rows.length} rows with viscosity delta ${rows[1].delta} cP (${rows[1].percentChange}%)`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 7 — COMPARISON TABLE',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  return results;
};

// Auto-run when executed directly
const results = runAllViscosityTests();
console.log('=== BAGHEWALA VISCOSITY MODEL TEST SUITE RESULTS ===');
results.forEach((r) => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.testName}: ${r.details}`);
});
