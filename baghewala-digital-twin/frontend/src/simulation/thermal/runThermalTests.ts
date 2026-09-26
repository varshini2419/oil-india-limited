import { loadBaseline, createScenario } from '../scenario/scenarioEngine';
import { BASELINE_INPUT_VALUES } from '../scenario/defaults';
import { calculateThermalModel, compareThermalScenarios } from './thermalModel';
import { validateThermalInputs } from './thermalValidation';

export interface TestResultItem {
  testName: string;
  passed: boolean;
  details: string;
}

export const runAllThermalTests = (): TestResultItem[] => {
  const results: TestResultItem[] = [];

  // TEST 1 — BASELINE
  try {
    const baselineScenario = loadBaseline();
    const baselineResult = calculateThermalModel(baselineScenario);
    
    const isBaselineValid =
      baselineResult.baselineReservoirTemperatureC === 48.0 &&
      baselineResult.predictedReservoirTemperatureC >= 48.0 &&
      !Number.isNaN(baselineResult.predictedReservoirTemperatureC);

    results.push({
      testName: 'TEST 1 — BASELINE',
      passed: isBaselineValid,
      details: `Static Baseline Reservoir Temp: ${baselineResult.baselineReservoirTemperatureC}°C, Modeled Baseline Temp: ${baselineResult.predictedReservoirTemperatureC}°C, State: ${baselineResult.thermalState}`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 1 — BASELINE',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 2 — HIGH STEAM
  try {
    const highSteamScenario = createScenario('High Steam Test', 'Testing high steam rate', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 100.0,
      steamQualityPercent: 80.0,
      soakDurationDays: 5.0,
    });
    const highSteamResult = calculateThermalModel(highSteamScenario);
    
    const passed =
      highSteamResult.thermalInfluenceC > 0 &&
      highSteamResult.predictedReservoirTemperatureC > 48.0 &&
      ['WARMING', 'HOT', 'HIGH_THERMAL_RESPONSE'].includes(highSteamResult.thermalState);

    results.push({
      testName: 'TEST 2 — HIGH STEAM',
      passed,
      details: `Modeled Temp: ${highSteamResult.predictedReservoirTemperatureC}°C, Influence: +${highSteamResult.thermalInfluenceC}°C, State: ${highSteamResult.thermalState}`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 2 — HIGH STEAM',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 3 — LOW STEAM
  try {
    const lowSteamScenario = createScenario('Low Steam Test', 'Testing low steam rate', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 20.0,
      steamQualityPercent: 80.0,
      soakDurationDays: 5.0,
    });
    const highSteamScenario = createScenario('High Steam Test', 'Testing high steam rate', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 100.0,
      steamQualityPercent: 80.0,
      soakDurationDays: 5.0,
    });

    const lowSteamResult = calculateThermalModel(lowSteamScenario);
    const highSteamResult = calculateThermalModel(highSteamScenario);

    const passed =
      lowSteamResult.thermalInfluenceC > 0 &&
      lowSteamResult.thermalInfluenceC < highSteamResult.thermalInfluenceC &&
      lowSteamResult.predictedReservoirTemperatureC < highSteamResult.predictedReservoirTemperatureC;

    results.push({
      testName: 'TEST 3 — LOW STEAM',
      passed,
      details: `Low Steam Influence (+${lowSteamResult.thermalInfluenceC}°C) is less than High Steam Influence (+${highSteamResult.thermalInfluenceC}°C)`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 3 — LOW STEAM',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 4 — AMBIENT CHANGE
  try {
    const baselineScenario = loadBaseline();
    const highAmbientScenario = createScenario('High Ambient Test', 'Testing ambient temperature shift', {
      ...BASELINE_INPUT_VALUES,
      ambientTemperatureC: 45.0, // +10°C ambient increase
    });

    const baselineResult = calculateThermalModel(baselineScenario);
    const highAmbientResult = calculateThermalModel(highAmbientScenario);

    const ambientChange = highAmbientResult.ambientTemperatureC - baselineResult.ambientTemperatureC; // +10°C
    const reservoirChange = highAmbientResult.predictedReservoirTemperatureC - baselineResult.predictedReservoirTemperatureC; // +0.2°C

    const passed =
      ambientChange === 10.0 &&
      reservoirChange < 1.0 && // Proves reservoir temp did NOT increase by +10°C
      highAmbientResult.surfaceEquipmentTemperatureC === 50.0;

    results.push({
      testName: 'TEST 4 — AMBIENT CHANGE',
      passed,
      details: `Ambient Delta: +${ambientChange}°C → Reservoir Delta: +${reservoirChange}°C (Decoupled deep formation response). Surface equip: ${highAmbientResult.surfaceEquipmentTemperatureC}°C`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 4 — AMBIENT CHANGE',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 5 — LONGER SOAK
  try {
    const shortSoakScenario = createScenario('Short Soak', '2 days soak', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 80.0,
      soakDurationDays: 2.0,
    });
    const longSoakScenario = createScenario('Long Soak', '10 days soak', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 80.0,
      soakDurationDays: 10.0,
    });

    const shortSoakResult = calculateThermalModel(shortSoakScenario);
    const longSoakResult = calculateThermalModel(longSoakScenario);

    const passed =
      longSoakResult.breakdown.timeResponsePercent > shortSoakResult.breakdown.timeResponsePercent &&
      longSoakResult.predictedReservoirTemperatureC > shortSoakResult.predictedReservoirTemperatureC;

    results.push({
      testName: 'TEST 5 — LONGER SOAK',
      passed,
      details: `Short Soak Time Response: ${shortSoakResult.breakdown.timeResponsePercent}% (${shortSoakResult.predictedReservoirTemperatureC}°C) vs Long Soak: ${longSoakResult.breakdown.timeResponsePercent}% (${longSoakResult.predictedReservoirTemperatureC}°C)`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 5 — LONGER SOAK',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 6 — INVALID INPUT
  try {
    const invalidScenario = createScenario('Invalid Input Test', 'Testing NaN input handling', {
      ...BASELINE_INPUT_VALUES,
      ambientTemperatureC: NaN,
    });

    const validationCheck = validateThermalInputs(invalidScenario);

    const passed = !validationCheck.isValid && validationCheck.errors.length > 0;

    results.push({
      testName: 'TEST 6 — INVALID INPUT',
      passed,
      details: `Validation correctly caught invalid input: "${validationCheck.errors[0]}"`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 6 — INVALID INPUT',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 7 — EXTREME INPUT
  try {
    const extremeScenario = createScenario('Extreme Steam Input', 'Testing upper thermal bound clamping', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 1500.0, // Extreme unphysical steam rate
      steamQualityPercent: 100.0,
      soakDurationDays: 30.0,
    });

    const extremeResult = calculateThermalModel(extremeScenario);

    const passed =
      extremeResult.predictedReservoirTemperatureC <= 300.0 &&
      !Number.isNaN(extremeResult.predictedReservoirTemperatureC) &&
      extremeResult.warnings.length > 0;

    results.push({
      testName: 'TEST 7 — EXTREME INPUT',
      passed,
      details: `Extreme Result: ${extremeResult.predictedReservoirTemperatureC}°C, Clamped/Bounded with Warning: "${extremeResult.warnings[0]}"`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 7 — EXTREME INPUT',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  // TEST 8 — COMPARISON TABLE GENERATION
  try {
    const baselineScenario = loadBaseline();
    const highSteamScenario = createScenario('High Steam Test', 'Testing comparison table', {
      ...BASELINE_INPUT_VALUES,
      steamInjectionRateTpd: 100.0,
    });

    const baselineResult = calculateThermalModel(baselineScenario);
    const scenarioResult = calculateThermalModel(highSteamScenario);
    const comparisonRows = compareThermalScenarios(baselineResult, scenarioResult);

    const passed = comparisonRows.length === 4 && comparisonRows.some(r => r.parameter.includes('Modeled Reservoir Temperature') && r.delta > 0);

    results.push({
      testName: 'TEST 8 — SCENARIO COMPARISON TABLE',
      passed,
      details: `Generated ${comparisonRows.length} comparison rows with predicted temperature delta +${comparisonRows.find(r => r.parameter.includes('Modeled'))?.delta}°C`,
    });
  } catch (err: any) {
    results.push({
      testName: 'TEST 8 — SCENARIO COMPARISON TABLE',
      passed: false,
      details: `Error: ${err?.message || err}`,
    });
  }

  return results;
};

// Auto-run when executed directly
const results = runAllThermalTests();
console.log('=== BAGHEWALA THERMAL MODEL TEST SUITE RESULTS ===');
results.forEach((r) => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.testName}: ${r.details}`);
});

