import type { WhatIfInputs, WhatIfResult, DigitalTwinState } from './types';
import type { ModelMode } from '../historicalCalibration/types';
import { validateWhatIfInputs } from './validation';
import { estimateDigitalTwinState } from './stateEstimator';
import { runUncertaintyAnalysis } from '../uncertaintyAnalysis/uncertaintyEngine';

export function runWhatIfSimulation(
  currentState: DigitalTwinState,
  inputs: WhatIfInputs,
  modelMode: ModelMode = 'CALIBRATED'
): WhatIfResult {
  const validation = validateWhatIfInputs(inputs);

  if (!validation.isValid) {
    return {
      isFeasible: false,
      validationMessage: 'OUT OF MODEL RANGE: Proposed what-if parameter values exceed validated engineering boundaries.',
      violations: validation.violations,
      warnings: validation.warnings,
      currentState,
      whatIfState: currentState,
      deltas: {
        reservoirTemperatureC: 0,
        estimatedViscosityCp: 0,
        oilMobilityDcP: 0,
        estimatedProductionBopd: 0,
        srpLoadIndex: 0,
        thermalGainC: 0,
        riskScore: 0,
      },
      uncertainty: {
        meanProductionBopd: 0,
        p10ProductionBopd: 0,
        p50ProductionBopd: 0,
        p90ProductionBopd: 0,
        stdDevProductionBopd: 0,
        confidence: 'INSUFFICIENT_DATA',
        isAvailable: false,
      },
    };
  }

  // Calculate what-if state
  const whatIfState = estimateDigitalTwinState(
    {
      reservoirTemperatureC: inputs.reservoirTemperatureC ?? currentState.reservoir.reservoirTemperatureC,
      steamInjectionRateTpd: inputs.steamInjectionRateTpd ?? currentState.css.steamInjectionRateTpd,
      steamQualityPercent: inputs.steamQualityPercent ?? currentState.css.steamQualityPercent,
      vfdFrequencyHz: inputs.vfdFrequencyHz ?? currentState.srp.vfdFrequencyHz,
      spm: inputs.spm ?? currentState.srp.spm,
      strokeLengthMeters: inputs.strokeLengthMeters ?? currentState.srp.strokeLengthMeters,
    },
    modelMode
  );

  // Compute deltas
  const deltas = {
    reservoirTemperatureC: Number(
      (whatIfState.reservoir.reservoirTemperatureC - currentState.reservoir.reservoirTemperatureC).toFixed(1)
    ),
    estimatedViscosityCp: Number(
      (whatIfState.reservoir.estimatedViscosityCp - currentState.reservoir.estimatedViscosityCp).toFixed(1)
    ),
    oilMobilityDcP: Number(
      (whatIfState.reservoir.oilMobilityDcP - currentState.reservoir.oilMobilityDcP).toFixed(6)
    ),
    estimatedProductionBopd: Number(
      (whatIfState.production.estimatedProductionBopd - currentState.production.estimatedProductionBopd).toFixed(2)
    ),
    srpLoadIndex: Number(
      (whatIfState.srp.srpLoadIndex - currentState.srp.srpLoadIndex).toFixed(1)
    ),
    thermalGainC: Number(
      (whatIfState.css.thermalGainC - currentState.css.thermalGainC).toFixed(1)
    ),
    riskScore: Number(
      (whatIfState.risk.riskScore - currentState.risk.riskScore).toFixed(1)
    ),
  };

  // Run Monte Carlo Uncertainty for What-If State
  const uncertaintyRun = runUncertaintyAnalysis({
    sampleCount: 100,
    seed: 42,
  });

  const scale = whatIfState.production.estimatedProductionBopd / 0.75;
  const p10Prod = Number((uncertaintyRun.productionStats.p10 * scale).toFixed(2));
  const p50Prod = Number((uncertaintyRun.productionStats.p50 * scale).toFixed(2));
  const p90Prod = Number((uncertaintyRun.productionStats.p90 * scale).toFixed(2));
  const meanProd = Number((uncertaintyRun.productionStats.mean * scale).toFixed(2));
  const stdDevProd = Number((uncertaintyRun.productionStats.stdDev * scale).toFixed(2));

  return {
    isFeasible: true,
    violations: [],
    warnings: validation.warnings,
    currentState,
    whatIfState,
    deltas,
    uncertainty: {
      meanProductionBopd: meanProd,
      p10ProductionBopd: p10Prod,
      p50ProductionBopd: p50Prod,
      p90ProductionBopd: p90Prod,
      stdDevProductionBopd: stdDevProd,
      confidence: modelMode === 'CALIBRATED' ? 'HIGH' : 'MEDIUM',
      isAvailable: true,
    },
  };
}
