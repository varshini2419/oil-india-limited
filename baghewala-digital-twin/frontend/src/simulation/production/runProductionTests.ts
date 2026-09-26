import { loadBaseline } from '../scenario/scenarioEngine';
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { calculateProductionModel, compareProductionResults } from './productionModel';
import { validateProductionInputs } from './validation';

export interface ProductionTestResultItem {
  testName: string;
  passed: boolean;
  details: string;
}

export const runAllProductionTests = (): ProductionTestResultItem[] => {
  const results: ProductionTestResultItem[] = [];

  // TEST 1 — Baseline
  try {
    const baseThermal = calculateThermalModel(loadBaseline());
    const baseViscosity = calculateViscosityModel(baseThermal.predictedReservoirTemperatureC);
    const baseMobility = calculateMobilityModel(baseViscosity.estimatedViscosityCp, baseThermal.predictedReservoirTemperatureC);
    const baseProd = calculateProductionModel(baseMobility.mobilityDcP, baseThermal.predictedReservoirTemperatureC, baseViscosity.estimatedViscosityCp);

    const passed =
      baseProd.estimatedProductionBopd > 0 &&
      Number.isFinite(baseProd.estimatedProductionBopd) &&
      !Number.isNaN(baseProd.estimatedProductionBopd) &&
      baseProd.productionUnit === 'BOPD';

    results.push({
      testName: 'TEST 1: Baseline Production',
      passed,
      details: `Mobility ${baseMobility.mobilityDcP} D/cP → Baseline Production: ${baseProd.estimatedProductionBopd} BOPD`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 1: Baseline Production', passed: false, details: err?.message || String(err) });
  }

  // TEST 2 — Higher Mobility → Higher Production
  try {
    const lowMob = calculateMobilityModel(15000.0, 48.0);
    const highMob = calculateMobilityModel(450.0, 80.0);

    const prodLowMob = calculateProductionModel(lowMob.mobilityDcP, 48.0, 15000.0);
    const prodHighMob = calculateProductionModel(highMob.mobilityDcP, 80.0, 450.0);

    const passed =
      highMob.mobilityDcP > lowMob.mobilityDcP &&
      prodHighMob.estimatedProductionBopd > prodLowMob.estimatedProductionBopd;

    results.push({
      testName: 'TEST 2: Higher Mobility → Higher Production',
      passed,
      details: `Mobility ${lowMob.mobilityDcP} → ${highMob.mobilityDcP} D/cP | Production ${prodLowMob.estimatedProductionBopd} → ${prodHighMob.estimatedProductionBopd} BOPD`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 2: Higher Mobility → Higher Production', passed: false, details: err?.message || String(err) });
  }

  // TEST 3 — Lower Mobility → Lower Production
  try {
    const highMob = calculateMobilityModel(45.0, 120.0);
    const lowMob = calculateMobilityModel(4027.0, 60.0);

    const prodHighMob = calculateProductionModel(highMob.mobilityDcP, 120.0, 45.0);
    const prodLowMob = calculateProductionModel(lowMob.mobilityDcP, 60.0, 4027.0);

    const passed =
      lowMob.mobilityDcP < highMob.mobilityDcP &&
      prodLowMob.estimatedProductionBopd < prodHighMob.estimatedProductionBopd;

    results.push({
      testName: 'TEST 3: Lower Mobility → Lower Production',
      passed,
      details: `Mobility ${highMob.mobilityDcP} → ${lowMob.mobilityDcP} D/cP | Production ${prodHighMob.estimatedProductionBopd} → ${prodLowMob.estimatedProductionBopd} BOPD`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 3: Lower Mobility → Lower Production', passed: false, details: err?.message || String(err) });
  }

  // TEST 4 — Higher Drawdown → Higher Production
  try {
    const mob = calculateMobilityModel(450.0, 80.0);
    const prodDrawdown30 = calculateProductionModel(mob.mobilityDcP, 80.0, 450.0, 30.0);
    const prodDrawdown50 = calculateProductionModel(mob.mobilityDcP, 80.0, 450.0, 50.0);

    const passed = prodDrawdown50.estimatedProductionBopd > prodDrawdown30.estimatedProductionBopd;

    results.push({
      testName: 'TEST 4: Higher Drawdown → Higher Production',
      passed,
      details: `Drawdown 30 → 50 bar | Production ${prodDrawdown30.estimatedProductionBopd} → ${prodDrawdown50.estimatedProductionBopd} BOPD`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 4: Higher Drawdown → Higher Production', passed: false, details: err?.message || String(err) });
  }

  // TEST 5 — Lower Drawdown → Lower Production
  try {
    const mob = calculateMobilityModel(450.0, 80.0);
    const prodDrawdown30 = calculateProductionModel(mob.mobilityDcP, 80.0, 450.0, 30.0);
    const prodDrawdown10 = calculateProductionModel(mob.mobilityDcP, 80.0, 450.0, 10.0);

    const passed = prodDrawdown10.estimatedProductionBopd < prodDrawdown30.estimatedProductionBopd;

    results.push({
      testName: 'TEST 5: Lower Drawdown → Lower Production',
      passed,
      details: `Drawdown 30 → 10 bar | Production ${prodDrawdown30.estimatedProductionBopd} → ${prodDrawdown10.estimatedProductionBopd} BOPD`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 5: Lower Drawdown → Lower Production', passed: false, details: err?.message || String(err) });
  }

  // TEST 6 — Pump Operation Factor Response
  try {
    const mob = calculateMobilityModel(450.0, 80.0);
    const prodNormalPump = calculateProductionModel(mob.mobilityDcP, 80.0, 450.0, 30.0, 50.0, 8.0, 2.5);
    const prodHighPump = calculateProductionModel(mob.mobilityDcP, 80.0, 450.0, 30.0, 60.0, 12.0, 3.5);

    const passed = prodHighPump.estimatedProductionBopd > prodNormalPump.estimatedProductionBopd;

    results.push({
      testName: 'TEST 6: Pump Operation Factor Response',
      passed,
      details: `Normal Pump (${prodNormalPump.pumpOperationFactor}x) ${prodNormalPump.estimatedProductionBopd} BOPD vs High Pump (${prodHighPump.pumpOperationFactor}x) ${prodHighPump.estimatedProductionBopd} BOPD`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 6: Pump Operation Factor Response', passed: false, details: err?.message || String(err) });
  }

  // TEST 7 — Deterministic Output
  try {
    const mob = calculateMobilityModel(450.0, 80.0);
    const p1 = calculateProductionModel(mob.mobilityDcP, 80.0, 450.0);
    const p2 = calculateProductionModel(mob.mobilityDcP, 80.0, 450.0);

    const passed = p1.estimatedProductionBopd === p2.estimatedProductionBopd;

    results.push({
      testName: 'TEST 7: Deterministic Output',
      passed,
      details: `Identical outputs: ${p1.estimatedProductionBopd} BOPD === ${p2.estimatedProductionBopd} BOPD`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 7: Deterministic Output', passed: false, details: err?.message || String(err) });
  }

  // TEST 8 — NaN Viscosity / Mobility Rejected
  try {
    const check = validateProductionInputs(NaN, 30.0, 50.0, 8.0, 2.5);
    const prod = calculateProductionModel(NaN, 48.0, 15000.0);

    const passed = !check.isValid && prod.status === 'INVALID' && prod.warnings.length > 0;

    results.push({
      testName: 'TEST 8: NaN Rejected Safely',
      passed,
      details: `Validation caught NaN cleanly. Status: ${prod.status}`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 8: NaN Rejected Safely', passed: false, details: err?.message || String(err) });
  }

  // TEST 9 — Infinity Rejected
  try {
    const check = validateProductionInputs(Infinity, 30.0, 50.0, 8.0, 2.5);
    const prod = calculateProductionModel(Infinity, 48.0, 15000.0);

    const passed = !check.isValid && prod.status === 'INVALID';

    results.push({
      testName: 'TEST 9: Infinity Rejected Safely',
      passed,
      details: `Validation caught Infinity cleanly. Status: ${prod.status}`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 9: Infinity Rejected Safely', passed: false, details: err?.message || String(err) });
  }

  // TEST 10 — Negative Mobility Rejected
  try {
    const check = validateProductionInputs(-0.005, 30.0, 50.0, 8.0, 2.5);

    const passed = !check.isValid && check.errors.some((e) => e.includes('mobility'));

    results.push({
      testName: 'TEST 10: Negative Mobility Rejected',
      passed,
      details: `Validation error: "${check.errors[0]}"`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 10: Negative Mobility Rejected', passed: false, details: err?.message || String(err) });
  }

  // TEST 11 — Negative Drawdown Rejected
  try {
    const check = validateProductionInputs(0.005, -30.0, 50.0, 8.0, 2.5);

    const passed = !check.isValid && check.errors.some((e) => e.includes('drawdown'));

    results.push({
      testName: 'TEST 11: Negative Drawdown Rejected',
      passed,
      details: `Validation error: "${check.errors[0]}"`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 11: Negative Drawdown Rejected', passed: false, details: err?.message || String(err) });
  }

  // TEST 12 — Zero/Invalid Baseline Safe Handling
  try {
    const prod = calculateProductionModel(0.005, 80.0, 450.0, 30.0, 50.0, 8.0, 2.5, 0.0);

    const passed = Number.isFinite(prod.productionChangePercent) && !Number.isNaN(prod.productionChangePercent);

    results.push({
      testName: 'TEST 12: Zero Baseline Handled Safely',
      passed,
      details: `Zero baseline handling resulted in finite change percent (${prod.productionChangePercent}%) without division error`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 12: Zero Baseline Handled Safely', passed: false, details: err?.message || String(err) });
  }

  // TEST 13 — Complete Pipeline Flow (Temp → Visc → Mobility → Prod)
  try {
    const thermal = calculateThermalModel(loadBaseline());
    const viscosity = calculateViscosityModel(thermal.predictedReservoirTemperatureC);
    const mobility = calculateMobilityModel(viscosity.estimatedViscosityCp, thermal.predictedReservoirTemperatureC);
    const production = calculateProductionModel(mobility.mobilityDcP, thermal.predictedReservoirTemperatureC, viscosity.estimatedViscosityCp);

    const passed =
      production.temperatureC === thermal.predictedReservoirTemperatureC &&
      production.viscosityCp === viscosity.estimatedViscosityCp &&
      production.oilMobilityDcp === mobility.mobilityDcP &&
      production.estimatedProductionBopd > 0;

    results.push({
      testName: 'TEST 13: Full Pipeline Flow (4.3 → 4.4 → 4.5 → 4.6)',
      passed,
      details: `Temp ${thermal.predictedReservoirTemperatureC}°C → Visc ${viscosity.estimatedViscosityCp} cP → Mobility ${mobility.mobilityDcP} D/cP → Prod ${production.estimatedProductionBopd} BOPD`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 13: Full Pipeline Flow', passed: false, details: err?.message || String(err) });
  }

  // TEST 14 — Comparison Table Generation
  try {
    const baseProd = calculateProductionModel(0.0005, 48.0, 15000.0);
    const scenProd = calculateProductionModel(0.006, 80.0, 450.0);
    const rows = compareProductionResults(baseProd, scenProd);

    const passed = rows.length === 3 && rows[2].delta > 0;

    results.push({
      testName: 'TEST 14: Comparison Table Generation',
      passed,
      details: `Generated ${rows.length} rows with production delta +${rows[2].delta} BOPD`,
    });
  } catch (err: any) {
    results.push({ testName: 'TEST 14: Comparison Table Generation', passed: false, details: err?.message || String(err) });
  }

  return results;
};

// Auto-run when executed directly
const results = runAllProductionTests();
console.log('=== BAGHEWALA PRODUCTION MODEL TEST SUITE RESULTS ===');
results.forEach((r) => {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.testName}: ${r.details}`);
});
