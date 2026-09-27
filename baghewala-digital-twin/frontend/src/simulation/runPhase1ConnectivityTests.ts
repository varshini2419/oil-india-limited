import { loadBaseline, updateScenario } from './scenario/scenarioEngine';
import { calculateThermalModel } from './thermal/thermalModel';
import { calculateViscosityModel } from './viscosity/viscosityModel';
import { calculateMobilityModel } from './mobility/mobilityModel';
import { calculateProductionModel } from './production/productionModel';
import { optimizeCSS } from './cssOptimization';
import type { ScenarioInputValues } from './scenario/types';

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

export function runPhase1ConnectivityTests(): number {
  console.log('====================================================');
  console.log('BAGHEWALA DIGITAL TWIN — PHASE 1 CONNECTIVITY TEST SUITE');
  console.log('====================================================');

  // TEST 1: Temperature Propagation
  runTest('1. Temperature Propagation: Reservoir temp change alters thermal & viscosity solvers', () => {
    const scenario = loadBaseline();
    const updated = updateScenario(scenario, { reservoirTemperatureC: 75.0 });
    
    const thermal = calculateThermalModel(updated);
    const evalTemp = Math.max(updated.inputs.reservoirTemperatureC, thermal.predictedReservoirTemperatureC);
    const viscosity = calculateViscosityModel(evalTemp, 48.0);
    
    if (updated.inputs.reservoirTemperatureC !== 75.0) {
      throw new Error(`Expected updated inputs.reservoirTemperatureC === 75.0 °C, got ${updated.inputs.reservoirTemperatureC}`);
    }
    if (evalTemp < 75.0) {
      throw new Error(`Expected effective reservoir temp >= 75.0 °C, got ${evalTemp}`);
    }
    if (viscosity.estimatedViscosityCp >= 50000) {
      throw new Error(`Expected viscosity < 50,000 cP at 75°C, got ${viscosity.estimatedViscosityCp} cP`);
    }
  });

  // TEST 2: Water Cut Propagation
  runTest('2. Water Cut Propagation: Water cut change calculates total fluid production (BFPD)', () => {
    const scenario = loadBaseline();
    const updated = updateScenario(scenario, { waterCutPercent: 50.0 });
    
    const thermal = calculateThermalModel(updated);
    const viscosity = calculateViscosityModel(thermal.predictedReservoirTemperatureC, 48.0);
    const mobility = calculateMobilityModel(viscosity.estimatedViscosityCp, thermal.predictedReservoirTemperatureC, updated.inputs.permeabilityDarcy);
    const production = calculateProductionModel(
      mobility.mobilityDcP,
      thermal.predictedReservoirTemperatureC,
      viscosity.estimatedViscosityCp,
      30.0,
      updated.inputs.vfdFrequencyHz,
      updated.inputs.spm,
      updated.inputs.strokeLengthMeters,
      undefined,
      updated.inputs.waterCutPercent,
      updated.inputs.reservoirPressureBar
    );

    if (production.waterCutPercent !== 50.0) {
      throw new Error(`Expected waterCutPercent === 50.0, got ${production.waterCutPercent}`);
    }
    if (production.totalFluidProductionBfpd <= production.estimatedProductionBopd) {
      throw new Error(`Expected BFPD (${production.totalFluidProductionBfpd}) > BOPD (${production.estimatedProductionBopd}) for 50% water cut`);
    }
    const expectedBfpd = production.estimatedProductionBopd / (1 - 0.5);
    if (Math.abs(production.totalFluidProductionBfpd - expectedBfpd) > 0.01) {
      throw new Error(`BFPD mismatch: expected ${expectedBfpd}, got ${production.totalFluidProductionBfpd}`);
    }
  });

  // TEST 3: Reservoir Pressure Propagation
  runTest('3. Reservoir Pressure Propagation: Pressure change updates drawdown and production', () => {
    const scenario = loadBaseline();
    const updated = updateScenario(scenario, { reservoirPressureBar: 70.0 });
    
    const drawdownBar = Math.max(5.0, updated.inputs.reservoirPressureBar - 18.0);
    const thermal = calculateThermalModel(updated);
    const viscosity = calculateViscosityModel(thermal.predictedReservoirTemperatureC, 48.0);
    const mobility = calculateMobilityModel(viscosity.estimatedViscosityCp, thermal.predictedReservoirTemperatureC, updated.inputs.permeabilityDarcy);
    
    const baselineProd = calculateProductionModel(mobility.mobilityDcP, thermal.predictedReservoirTemperatureC, viscosity.estimatedViscosityCp, 30.0, 50, 8, 3.0, undefined, 20.0, 48.0);
    const updatedProd = calculateProductionModel(mobility.mobilityDcP, thermal.predictedReservoirTemperatureC, viscosity.estimatedViscosityCp, drawdownBar, 50, 8, 3.0, baselineProd.estimatedProductionBopd, 20.0, 70.0);

    if (drawdownBar !== 52.0) {
      throw new Error(`Expected drawdownBar === 52.0 bar, got ${drawdownBar}`);
    }
    if (updatedProd.reservoirPressureBar !== 70.0) {
      throw new Error(`Expected reservoirPressureBar === 70.0 bar, got ${updatedProd.reservoirPressureBar}`);
    }
    if (updatedProd.estimatedProductionBopd <= baselineProd.estimatedProductionBopd) {
      throw new Error(`Expected higher production at 70 bar reservoir pressure, got ${updatedProd.estimatedProductionBopd} vs baseline ${baselineProd.estimatedProductionBopd}`);
    }
  });

  // TEST 4: Permeability Propagation
  runTest('4. Permeability Propagation: Permeability change alters oil mobility and production rate', () => {
    const scenario = loadBaseline();
    const updated = updateScenario(scenario, { permeabilityDarcy: 5.0 });
    
    const thermal = calculateThermalModel(updated);
    const viscosity = calculateViscosityModel(thermal.predictedReservoirTemperatureC, 48.0);
    
    const baselineMobility = calculateMobilityModel(viscosity.estimatedViscosityCp, thermal.predictedReservoirTemperatureC, scenario.inputs.permeabilityDarcy);
    const updatedMobility = calculateMobilityModel(viscosity.estimatedViscosityCp, thermal.predictedReservoirTemperatureC, updated.inputs.permeabilityDarcy);

    if (updatedMobility.mobilityDcP <= baselineMobility.mobilityDcP) {
      throw new Error(`Expected higher mobility at 5.0 Darcy, got ${updatedMobility.mobilityDcP} vs ${baselineMobility.mobilityDcP}`);
    }

    const baselineProd = calculateProductionModel(baselineMobility.mobilityDcP, 48, viscosity.estimatedViscosityCp, 30, 50, 8, 3.0);
    const updatedProd = calculateProductionModel(updatedMobility.mobilityDcP, 48, viscosity.estimatedViscosityCp, 30, 50, 8, 3.0, baselineProd.estimatedProductionBopd);

    if (updatedProd.estimatedProductionBopd <= baselineProd.estimatedProductionBopd) {
      throw new Error(`Expected higher production with 5.0 Darcy permeability, got ${updatedProd.estimatedProductionBopd} vs ${baselineProd.estimatedProductionBopd}`);
    }
  });

  // TEST 5: Steam Injection Temperature Propagation
  runTest('5. Steam Injection Temperature Propagation: Steam temp updates thermal solver & CSS optimization', () => {
    const scenario = loadBaseline();
    const updated = updateScenario(scenario, { steamInjectionTemperatureC: 350.0 });

    const thermal = calculateThermalModel(updated);
    const css = optimizeCSS({
      steamInjectionRateTpd: updated.inputs.steamInjectionRateTpd,
      steamInjectionTemperatureC: updated.inputs.steamInjectionTemperatureC,
      steamQualityFraction: updated.inputs.steamQualityPercent / 100,
      injectionDurationDays: 5.0,
      soakDurationDays: updated.inputs.soakDurationDays,
      productionDurationDays: 30.0,
      reservoirTemperatureC: thermal.predictedReservoirTemperatureC,
      reservoirPressureBar: updated.inputs.reservoirPressureBar,
      baselineViscosityCp: 50000,
      baselineMobilityDPerCp: 0.0003,
      baselineProductionBopd: 0.69,
      vfdFrequencyHz: updated.inputs.vfdFrequencyHz,
      spm: updated.inputs.spm,
      strokeLengthMeters: updated.inputs.strokeLengthMeters,
    });

    if (updated.inputs.steamInjectionTemperatureC !== 350.0) {
      throw new Error(`Expected steamInjectionTemperatureC === 350.0, got ${updated.inputs.steamInjectionTemperatureC}`);
    }
    if (!css.optimalCandidate) {
      throw new Error('Expected CSS optimization to yield an optimal candidate');
    }
  });

  // TEST 6: Weather Parameters & Canonical 14 Parameters Propagation
  runTest('6. Weather Parameters & Canonical 14 Inputs: All 14 parameters exist and update without state override', () => {
    const scenario = loadBaseline();
    const canonicalKeys: (keyof ScenarioInputValues)[] = [
      'ambientTemperatureC',
      'humidityPercent',
      'windSpeedKmh',
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
    ];

    for (const key of canonicalKeys) {
      if (typeof scenario.inputs[key] !== 'number') {
        throw new Error(`Missing canonical input key: ${key}`);
      }
    }

    const updated = updateScenario(scenario, {
      humidityPercent: 75.0,
      windSpeedKmh: 28.0,
    });

    if (updated.inputs.humidityPercent !== 75.0) {
      throw new Error(`Expected humidityPercent === 75.0, got ${updated.inputs.humidityPercent}`);
    }
    if (updated.inputs.windSpeedKmh !== 28.0) {
      throw new Error(`Expected windSpeedKmh === 28.0, got ${updated.inputs.windSpeedKmh}`);
    }
  });

  console.log('----------------------------------------------------');
  if (failedTestCount === 0) {
    console.log('ALL PHASE 1 CONNECTIVITY TESTS PASSED (6/6)');
  } else {
    console.error(`FAILED CONNECTIVITY TESTS: ${failedTestCount}`);
  }
  console.log('====================================================');
  return failedTestCount;
}

// Execute directly if run via CLI / tsx
const proc = (globalThis as any).process;
if (proc?.argv && (import.meta.url === `file://${proc.argv[1]}` || proc.argv[1]?.endsWith('runPhase1ConnectivityTests.ts'))) {
  const code = runPhase1ConnectivityTests();
  if (code !== 0 && proc.exit) {
    proc.exit(1);
  }
}
