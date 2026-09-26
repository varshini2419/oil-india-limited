import { createScenario } from '../scenario/scenarioEngine';
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { calculateProductionModel } from '../production/productionModel';
import { optimizeSRP } from '../srpOptimization/optimizationEngine';
import { optimizeCSS } from '../cssOptimization/optimizationEngine';
import { analyzeAIRisk } from '../riskEngine/recommendationEngine';
import type { BacktestCase, HistoricalModelOutput } from './types';

export function runBacktestForCase(testCase: BacktestCase): HistoricalModelOutput {
  // Construct scenario from historical case inputs
  const scenario = createScenario(testCase.name, testCase.description, testCase.inputs);
  scenario.id = `HIST_${testCase.id}`;

  // 1. Step 4.3 Thermal Model
  const thermalResult = calculateThermalModel(scenario);

  // 2. Step 4.4 Heavy-Oil Viscosity Model
  const viscosityResult = calculateViscosityModel(
    thermalResult.predictedReservoirTemperatureC,
    testCase.inputs.reservoirTemperatureC
  );

  // 3. Step 4.5 Heavy-Oil Mobility Model
  const mobilityResult = calculateMobilityModel(
    viscosityResult.estimatedViscosityCp,
    thermalResult.predictedReservoirTemperatureC,
    2.5,
    1.0,
    15000.0
  );

  // 4. Step 4.6 Estimated Production Model
  const productionResult = calculateProductionModel(
    mobilityResult.mobilityDcP,
    thermalResult.predictedReservoirTemperatureC,
    viscosityResult.estimatedViscosityCp,
    30.0,
    testCase.inputs.vfdFrequencyHz,
    testCase.inputs.spm,
    testCase.inputs.strokeLengthMeters,
    0.75
  );

  // 5. Step 4.7 SRP + VFD Optimization Engine
  const srpResult = optimizeSRP({
    vfdFrequencyHz: testCase.inputs.vfdFrequencyHz,
    spm: testCase.inputs.spm,
    strokeLengthM: testCase.inputs.strokeLengthMeters,
    oilMobilityDcp: mobilityResult.mobilityDcP,
    effectiveDrawdownBar: 30.0,
    temperatureC: thermalResult.predictedReservoirTemperatureC,
    viscosityCp: viscosityResult.estimatedViscosityCp,
  });

  // 6. Step 4.8 CSS Optimization Engine
  const cssResult = optimizeCSS({
    steamInjectionRateTpd: testCase.inputs.steamInjectionRateTpd,
    steamInjectionTemperatureC: 300.0,
    steamQualityFraction: testCase.inputs.steamQualityPercent / 100.0,
    injectionDurationDays: 5.0,
    soakDurationDays: testCase.inputs.soakDurationDays,
    productionDurationDays: 90.0,
    reservoirTemperatureC: thermalResult.predictedReservoirTemperatureC,
    reservoirPressureBar: 90.0,
    baselineViscosityCp: viscosityResult.baselineViscosityCp,
    baselineMobilityDPerCp: mobilityResult.baselineMobilityDcP,
    baselineProductionBopd: productionResult.baselineProductionBopd,
    vfdFrequencyHz: testCase.inputs.vfdFrequencyHz,
    spm: testCase.inputs.spm,
    strokeLengthMeters: testCase.inputs.strokeLengthMeters,
  });

  // 7. Step 4.9 AI Risk Engine
  const riskResult = analyzeAIRisk({
    temperatureC: thermalResult.predictedReservoirTemperatureC,
    viscosityCp: viscosityResult.estimatedViscosityCp,
    mobilityDPerCp: mobilityResult.mobilityDcP,
    productionBopd: productionResult.estimatedProductionBopd,
    vfdFrequencyHz: testCase.inputs.vfdFrequencyHz,
    spm: testCase.inputs.spm,
    strokeLengthMeters: testCase.inputs.strokeLengthMeters,
    steamInjectionRateTpd: testCase.inputs.steamInjectionRateTpd,
    srpLoadIndex: srpResult.currentCandidate.loadIndex,
    cssThermalGainC: cssResult.thermalBreakdown.deltaTemperatureC,
  });

  return {
    historicalCaseId: testCase.id,
    scenarioInputs: testCase.inputs,
    thermalResult,
    viscosityResult,
    mobilityResult,
    productionResult,
    srpResult,
    cssResult,
    riskResult,
  };
}
