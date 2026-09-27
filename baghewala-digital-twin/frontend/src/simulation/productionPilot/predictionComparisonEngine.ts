/**
 * Physics Prediction and Actual-vs-Predicted Comparison Engine
 * Baghewala Heavy-Oil Field Digital Twin - Phase 6
 */

import type { TelemetryRecord, PredictedPilotState, ActualVsPredictedComparison } from './types';
import type { ScenarioInputValues } from '../scenario/types';
import { BASELINE_INPUT_VALUES } from '../scenario/defaults';
import { createScenario } from '../scenario/scenarioEngine';
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { calculateProductionModel } from '../production/productionModel';

export function runPhysicsPredictionForTelemetry(
  _telemetry: TelemetryRecord,
  committedInputs: ScenarioInputValues = BASELINE_INPUT_VALUES
): PredictedPilotState {
  // Construct transient scenario with committed inputs
  const scenarioObj = createScenario('Pilot Prediction', 'Transient physics prediction for telemetry comparison', committedInputs);

  // 1. Thermal Model
  const thermalResult = calculateThermalModel(scenarioObj);

  // 2. Viscosity Model
  const viscosityResult = calculateViscosityModel(
    thermalResult.predictedReservoirTemperatureC,
    committedInputs.reservoirTemperatureC
  );

  // 3. Mobility Model
  const mobilityResult = calculateMobilityModel(
    viscosityResult.estimatedViscosityCp,
    thermalResult.predictedReservoirTemperatureC,
    committedInputs.permeabilityDarcy,
    1.0,
    viscosityResult.baselineViscosityCp
  );

  // 4. Drawdown & Production Model
  const effectiveDrawdownBar = Math.max(5.0, committedInputs.reservoirPressureBar - 18.0);
  const productionResult = calculateProductionModel(
    mobilityResult.mobilityDcP,
    thermalResult.predictedReservoirTemperatureC,
    viscosityResult.estimatedViscosityCp,
    effectiveDrawdownBar,
    committedInputs.vfdFrequencyHz,
    committedInputs.spm,
    committedInputs.strokeLengthMeters,
    0.75
  );

  const totalFluidBfpd = Number(
    (productionResult.estimatedProductionBopd / Math.max(0.01, 1 - committedInputs.waterCutPercent / 100.0)).toFixed(2)
  );

  return {
    predictedProductionBOPD: productionResult.estimatedProductionBopd,
    predictedTemperatureC: thermalResult.predictedReservoirTemperatureC,
    predictedPressureBar: committedInputs.reservoirPressureBar,
    predictedViscosityCp: viscosityResult.estimatedViscosityCp,
    predictedMobilityDcP: mobilityResult.mobilityDcP,
    predictedWaterCutPct: committedInputs.waterCutPercent,
    totalFluidBfpd,
  };
}

export function compareActualVsPredicted(
  telemetry: TelemetryRecord,
  prediction: PredictedPilotState
): ActualVsPredictedComparison {
  const actualProd = telemetry.observedProductionBOPD;
  const predProd = prediction.predictedProductionBOPD;

  const prodErrorBopd = Number(Math.abs(actualProd - predProd).toFixed(2));
  const prodErrorPct = Number(((prodErrorBopd / Math.max(0.01, predProd)) * 100).toFixed(1));

  const actualTemp = telemetry.reservoirTemperatureC;
  const predTemp = prediction.predictedTemperatureC;
  const tempDevC = Number((actualTemp - predTemp).toFixed(1));

  const actualPress = telemetry.reservoirPressureBar;
  const predPress = prediction.predictedPressureBar;
  const pressDevBar = Number((actualPress - predPress).toFixed(1));

  const actualWc = telemetry.waterCutPct;
  const predWc = prediction.predictedWaterCutPct;
  const wcDevPct = Number((actualWc - predWc).toFixed(1));

  // Steam response deviation: expected thermal gain based on steam injection rate vs actual temp
  const expectedTempGain = telemetry.steamInjectionRateTPD > 0 ? telemetry.steamInjectionRateTPD * 0.15 : 0;
  const actualTempGain = Math.max(0, actualTemp - BASELINE_INPUT_VALUES.reservoirTemperatureC);
  const steamDev = Number((expectedTempGain - actualTempGain).toFixed(1));

  return {
    timestamp: telemetry.timestamp,
    wellId: telemetry.wellId,
    predictedProductionBOPD: predProd,
    actualProductionBOPD: actualProd,
    productionErrorBOPD: prodErrorBopd,
    productionErrorPct: prodErrorPct,
    predictedTemperatureC: predTemp,
    actualTemperatureC: actualTemp,
    temperatureDeviationC: tempDevC,
    predictedPressureBar: predPress,
    actualPressureBar: actualPress,
    pressureDeviationBar: pressDevBar,
    predictedWaterCutPct: predWc,
    actualWaterCutPct: actualWc,
    waterCutDeviationPct: wcDevPct,
    steamResponseDeviation: steamDev,
  };
}
