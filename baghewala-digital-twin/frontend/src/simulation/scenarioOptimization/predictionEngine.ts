import type { ScenarioInputValues } from '../scenario/types';
import type { PredictionResult } from './types';
import { createScenario } from '../scenario/scenarioEngine';
import { calculateThermalModel } from '../thermal/thermalModel';
import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { calculateProductionModel } from '../production/productionModel';

export function runPredictionForecast(
  currentInputs: ScenarioInputValues,
  futureInputs: ScenarioInputValues
): PredictionResult {
  // Current evaluation
  const currentScenario = createScenario('Current State', 'Current operating baseline', currentInputs);
  const currentThermal = calculateThermalModel(currentScenario);
  const currentViscosity = calculateViscosityModel(
    currentThermal.predictedReservoirTemperatureC,
    currentInputs.reservoirTemperatureC
  );
  const currentMobility = calculateMobilityModel(
    currentViscosity.estimatedViscosityCp,
    currentThermal.predictedReservoirTemperatureC,
    currentInputs.permeabilityDarcy
  );
  const currentDrawdown = Math.max(5.0, currentInputs.reservoirPressureBar - 18.0);
  const currentProd = calculateProductionModel(
    currentMobility.mobilityDcP,
    currentThermal.predictedReservoirTemperatureC,
    currentViscosity.estimatedViscosityCp,
    currentDrawdown,
    currentInputs.vfdFrequencyHz,
    currentInputs.spm,
    currentInputs.strokeLengthMeters
  );
  const currentBfpd = Number(
    (currentProd.estimatedProductionBopd / Math.max(0.01, 1 - currentInputs.waterCutPercent / 100.0)).toFixed(2)
  );

  // Future evaluation using EXACT SAME simulation engine
  const futureScenario = createScenario('Future State', 'Forecast operating state', futureInputs);
  const futureThermal = calculateThermalModel(futureScenario);
  const futureViscosity = calculateViscosityModel(
    futureThermal.predictedReservoirTemperatureC,
    futureInputs.reservoirTemperatureC
  );
  const futureMobility = calculateMobilityModel(
    futureViscosity.estimatedViscosityCp,
    futureThermal.predictedReservoirTemperatureC,
    futureInputs.permeabilityDarcy
  );
  const futureDrawdown = Math.max(5.0, futureInputs.reservoirPressureBar - 18.0);
  const futureProd = calculateProductionModel(
    futureMobility.mobilityDcP,
    futureThermal.predictedReservoirTemperatureC,
    futureViscosity.estimatedViscosityCp,
    futureDrawdown,
    futureInputs.vfdFrequencyHz,
    futureInputs.spm,
    futureInputs.strokeLengthMeters,
    currentProd.estimatedProductionBopd
  );
  const futureBfpd = Number(
    (futureProd.estimatedProductionBopd / Math.max(0.01, 1 - futureInputs.waterCutPercent / 100.0)).toFixed(2)
  );

  const bopdDelta = Number((futureProd.estimatedProductionBopd - currentProd.estimatedProductionBopd).toFixed(2));
  const bopdPercentChange = currentProd.estimatedProductionBopd > 0
    ? Number(((bopdDelta / currentProd.estimatedProductionBopd) * 100).toFixed(1))
    : 0;

  const viscosityDeltaCp = Number((futureViscosity.estimatedViscosityCp - currentViscosity.estimatedViscosityCp).toFixed(1));
  const viscosityPercentChange = currentViscosity.estimatedViscosityCp > 0
    ? Number(((viscosityDeltaCp / currentViscosity.estimatedViscosityCp) * 100).toFixed(1))
    : 0;

  const temperatureDeltaC = Number((futureThermal.predictedReservoirTemperatureC - currentThermal.predictedReservoirTemperatureC).toFixed(1));

  return {
    currentInputs,
    futureInputs,
    currentProductionBopd: currentProd.estimatedProductionBopd,
    predictedProductionBopd: futureProd.estimatedProductionBopd,
    bopdDelta,
    bopdPercentChange,
    currentViscosityCp: currentViscosity.estimatedViscosityCp,
    predictedViscosityCp: futureViscosity.estimatedViscosityCp,
    viscosityDeltaCp,
    viscosityPercentChange,
    currentTemperatureC: currentThermal.predictedReservoirTemperatureC,
    predictedTemperatureC: futureThermal.predictedReservoirTemperatureC,
    temperatureDeltaC,
    currentFluidBfpd: currentBfpd,
    predictedFluidBfpd: futureBfpd,
    uncertaintyNotice: 'Deterministic simulation — uncertainty model not calibrated.',
    calculatedAt: new Date().toISOString(),
  };
}
