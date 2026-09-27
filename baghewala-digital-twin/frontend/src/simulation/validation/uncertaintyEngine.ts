/**
 * BAGHEWALA DIGITAL TWIN — UNCERTAINTY PROPAGATION ENGINE
 * 
 * Computes deterministic output uncertainty envelopes (LOW, CENTRAL, HIGH)
 * for Digital Twin outputs given parameter variation bounds.
 * 
 * Avoids synthetic/fake Monte Carlo output generation by executing deterministic
 * multi-point boundary evaluations against authoritative physics models.
 */

import type { ScenarioInputValues } from '../scenario/types';
import { calculateThermalModel } from '../thermal';
import { calculateViscosityModel } from '../viscosity';
import { calculateMobilityModel } from '../mobility';
import { calculateProductionModel } from '../production';
import { optimizeSRP } from '../srpOptimization';
import { analyzeAIRisk } from '../riskEngine';

export interface UncertaintyInputRanges {
  reservoirTempDeltaC: number;        // e.g. ± 3.0°C
  steamRateDeltaPercent: number;      // e.g. ± 10.0%
  spmDeltaPercent: number;            // e.g. ± 5.0%
  strokeLengthDeltaPercent: number;   // e.g. ± 5.0%
  vfdFrequencyDeltaPercent: number;   // e.g. ± 5.0%
}

export const DEFAULT_UNCERTAINTY_RANGES: UncertaintyInputRanges = {
  reservoirTempDeltaC: 3.0,
  steamRateDeltaPercent: 10.0,
  spmDeltaPercent: 5.0,
  strokeLengthDeltaPercent: 5.0,
  vfdFrequencyDeltaPercent: 5.0,
};

export interface OutputRange {
  parameterName: string;
  unit: string;
  low: number;
  central: number;
  high: number;
}

export interface UncertaintyAnalysisResult {
  evaluatedInputs: ScenarioInputValues;
  ranges: OutputRange[];
  uncertaintyBounds: UncertaintyInputRanges;
  evaluatedAt: string;
}

export function propagateUncertainty(
  inputs: ScenarioInputValues,
  bounds: UncertaintyInputRanges = DEFAULT_UNCERTAINTY_RANGES
): UncertaintyAnalysisResult {
  const evaluatedAt = new Date().toISOString();

  // Central Evaluation
  const evalCentralTemp = inputs.reservoirTemperatureC;
  const thermCentral = calculateThermalModel({ inputs } as any);
  const tempCentral = thermCentral.predictedReservoirTemperatureC;
  const viscCentral = calculateViscosityModel(tempCentral, 48.0).estimatedViscosityCp;
  const mobCentral = calculateMobilityModel(viscCentral, tempCentral).mobilityDcP;
  const prodCentral = calculateProductionModel(
    mobCentral,
    tempCentral,
    viscCentral,
    30.0,
    inputs.vfdFrequencyHz,
    inputs.spm,
    inputs.strokeLengthMeters
  ).estimatedProductionBopd;
  const srpCentral = optimizeSRP({
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthM: inputs.strokeLengthMeters,
    oilMobilityDcp: mobCentral,
    effectiveDrawdownBar: 30.0,
    temperatureC: tempCentral,
    viscosityCp: viscCentral,
  }).currentCandidate.loadIndex;
  const riskCentral = analyzeAIRisk({
    temperatureC: tempCentral,
    viscosityCp: viscCentral,
    mobilityDPerCp: mobCentral,
    productionBopd: prodCentral,
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthMeters: inputs.strokeLengthMeters,
    steamInjectionRateTpd: inputs.steamInjectionRateTpd,
    srpLoadIndex: srpCentral,
    cssThermalGainC: thermCentral.thermalInfluenceC,
  }).riskScore;

  // Low Evaluation (Pessimistic: lower temp/steam, lower SPM)
  const lowTempIn = Math.max(10, evalCentralTemp - bounds.reservoirTempDeltaC);
  const lowSteamIn = Math.max(0, inputs.steamInjectionRateTpd * (1 - bounds.steamRateDeltaPercent / 100));
  const lowSpmIn = Math.max(1, inputs.spm * (1 - bounds.spmDeltaPercent / 100));

  const inputsLow: ScenarioInputValues = {
    ...inputs,
    reservoirTemperatureC: lowTempIn,
    steamInjectionRateTpd: lowSteamIn,
    spm: lowSpmIn,
  };
  const thermLow = calculateThermalModel({ inputs: inputsLow } as any);
  const tempLow = thermLow.predictedReservoirTemperatureC;
  const viscLow = calculateViscosityModel(tempLow, 48.0).estimatedViscosityCp; // Note: lower temp -> higher viscosity
  const mobLow = calculateMobilityModel(viscLow, tempLow).mobilityDcP;
  const prodLow = calculateProductionModel(
    mobLow,
    tempLow,
    viscLow,
    30.0,
    inputsLow.vfdFrequencyHz,
    inputsLow.spm,
    inputsLow.strokeLengthMeters
  ).estimatedProductionBopd;
  const srpLow = optimizeSRP({
    vfdFrequencyHz: inputsLow.vfdFrequencyHz,
    spm: inputsLow.spm,
    strokeLengthM: inputsLow.strokeLengthMeters,
    oilMobilityDcp: mobLow,
    effectiveDrawdownBar: 30.0,
    temperatureC: tempLow,
    viscosityCp: viscLow,
  }).currentCandidate.loadIndex;
  const riskLow = analyzeAIRisk({
    temperatureC: tempLow,
    viscosityCp: viscLow,
    mobilityDPerCp: mobLow,
    productionBopd: prodLow,
    vfdFrequencyHz: inputsLow.vfdFrequencyHz,
    spm: inputsLow.spm,
    strokeLengthMeters: inputsLow.strokeLengthMeters,
    steamInjectionRateTpd: inputsLow.steamInjectionRateTpd,
    srpLoadIndex: srpLow,
    cssThermalGainC: thermLow.thermalInfluenceC,
  }).riskScore;

  // High Evaluation (Optimistic: higher temp/steam, higher SPM)
  const highTempIn = evalCentralTemp + bounds.reservoirTempDeltaC;
  const highSteamIn = inputs.steamInjectionRateTpd * (1 + bounds.steamRateDeltaPercent / 100);
  const highSpmIn = inputs.spm * (1 + bounds.spmDeltaPercent / 100);

  const inputsHigh: ScenarioInputValues = {
    ...inputs,
    reservoirTemperatureC: highTempIn,
    steamInjectionRateTpd: highSteamIn,
    spm: highSpmIn,
  };
  const thermHigh = calculateThermalModel({ inputs: inputsHigh } as any);
  const tempHigh = thermHigh.predictedReservoirTemperatureC;
  const viscHigh = calculateViscosityModel(tempHigh, 48.0).estimatedViscosityCp; // higher temp -> lower viscosity
  const mobHigh = calculateMobilityModel(viscHigh, tempHigh).mobilityDcP;
  const prodHigh = calculateProductionModel(
    mobHigh,
    tempHigh,
    viscHigh,
    30.0,
    inputsHigh.vfdFrequencyHz,
    inputsHigh.spm,
    inputsHigh.strokeLengthMeters
  ).estimatedProductionBopd;
  const srpHigh = optimizeSRP({
    vfdFrequencyHz: inputsHigh.vfdFrequencyHz,
    spm: inputsHigh.spm,
    strokeLengthM: inputsHigh.strokeLengthMeters,
    oilMobilityDcp: mobHigh,
    effectiveDrawdownBar: 30.0,
    temperatureC: tempHigh,
    viscosityCp: viscHigh,
  }).currentCandidate.loadIndex;
  const riskHigh = analyzeAIRisk({
    temperatureC: tempHigh,
    viscosityCp: viscHigh,
    mobilityDPerCp: mobHigh,
    productionBopd: prodHigh,
    vfdFrequencyHz: inputsHigh.vfdFrequencyHz,
    spm: inputsHigh.spm,
    strokeLengthMeters: inputsHigh.strokeLengthMeters,
    steamInjectionRateTpd: inputsHigh.steamInjectionRateTpd,
    srpLoadIndex: srpHigh,
    cssThermalGainC: thermHigh.thermalInfluenceC,
  }).riskScore;

  const ranges: OutputRange[] = [
    {
      parameterName: 'Predicted Reservoir Temp',
      unit: '°C',
      low: parseFloat(Math.min(tempLow, tempCentral, tempHigh).toFixed(1)),
      central: parseFloat(tempCentral.toFixed(1)),
      high: parseFloat(Math.max(tempLow, tempCentral, tempHigh).toFixed(1)),
    },
    {
      parameterName: 'Crude Viscosity',
      unit: 'cP',
      low: parseFloat(Math.min(viscLow, viscCentral, viscHigh).toFixed(1)),
      central: parseFloat(viscCentral.toFixed(1)),
      high: parseFloat(Math.max(viscLow, viscCentral, viscHigh).toFixed(1)),
    },
    {
      parameterName: 'Fluid Mobility (k/μ)',
      unit: 'D/cP',
      low: parseFloat(Math.min(mobLow, mobCentral, mobHigh).toFixed(4)),
      central: parseFloat(mobCentral.toFixed(4)),
      high: parseFloat(Math.max(mobLow, mobCentral, mobHigh).toFixed(4)),
    },
    {
      parameterName: 'Oil Production Rate',
      unit: 'BOPD',
      low: parseFloat(Math.min(prodLow, prodCentral, prodHigh).toFixed(2)),
      central: parseFloat(prodCentral.toFixed(2)),
      high: parseFloat(Math.max(prodLow, prodCentral, prodHigh).toFixed(2)),
    },
    {
      parameterName: 'SRP Rod Load Index',
      unit: '/100',
      low: parseFloat(Math.min(srpLow, srpCentral, srpHigh).toFixed(1)),
      central: parseFloat(srpCentral.toFixed(1)),
      high: parseFloat(Math.max(srpLow, srpCentral, srpHigh).toFixed(1)),
    },
    {
      parameterName: 'System Risk Score',
      unit: '/100',
      low: parseFloat(Math.min(riskLow, riskCentral, riskHigh).toFixed(1)),
      central: parseFloat(riskCentral.toFixed(1)),
      high: parseFloat(Math.max(riskLow, riskCentral, riskHigh).toFixed(1)),
    },
  ];

  return {
    evaluatedInputs: inputs,
    ranges,
    uncertaintyBounds: bounds,
    evaluatedAt,
  };
}
