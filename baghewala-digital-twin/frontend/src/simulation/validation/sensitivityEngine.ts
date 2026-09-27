/**
 * BAGHEWALA DIGITAL TWIN — SENSITIVITY ENGINE
 * 
 * Evaluates output responsiveness to controlled parameter perturbations (+5°C, +10 TPD, +2 SPM, etc.).
 * Calculates parameter sensitivity metrics and ranks inputs by output impact.
 * 
 * Terminology rule: Uses neutral phrasing ("Highest calculated sensitivity under current scenario").
 */

import type { ScenarioInputValues } from '../scenario/types';
import { calculateThermalModel } from '../thermal';
import { calculateViscosityModel } from '../viscosity';
import { calculateMobilityModel } from '../mobility';
import { calculateProductionModel } from '../production';
import { optimizeSRP } from '../srpOptimization';

export interface ParameterSensitivityRecord {
  parameterName: string;
  inputKey: keyof ScenarioInputValues;
  baseValue: number;
  perturbedValue: number;
  deltaInput: string;
  baseProductionBopd: number;
  perturbedProductionBopd: number;
  deltaProductionBopd: number;
  baseViscosityCp: number;
  perturbedViscosityCp: number;
  deltaViscosityPercent: number;
  baseSrpLoadIndex: number;
  perturbedSrpLoadIndex: number;
  deltaSrpLoadIndex: number;
  normalizedSensitivityScore: number; // 0 - 100
  rank: number;
}

export interface SensitivityAnalysisResult {
  records: ParameterSensitivityRecord[];
  highestSensitivityParameter: string;
  evaluatedAt: string;
}

export function performSensitivityAnalysis(inputs: ScenarioInputValues): SensitivityAnalysisResult {
  const evaluatedAt = new Date().toISOString();

  // Baseline Calculation
  const baseThermal = calculateThermalModel({ inputs } as any);
  const baseTemp = baseThermal.predictedReservoirTemperatureC;
  const baseVisc = calculateViscosityModel(baseTemp, 48.0).estimatedViscosityCp;
  const baseMob = calculateMobilityModel(baseVisc, baseTemp).mobilityDcP;
  const baseProd = calculateProductionModel(
    baseMob,
    baseTemp,
    baseVisc,
    30.0,
    inputs.vfdFrequencyHz,
    inputs.spm,
    inputs.strokeLengthMeters
  ).estimatedProductionBopd;
  const baseSrp = optimizeSRP({
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthM: inputs.strokeLengthMeters,
    oilMobilityDcp: baseMob,
    effectiveDrawdownBar: 30.0,
    temperatureC: baseTemp,
    viscosityCp: baseVisc,
  }).currentCandidate.loadIndex;

  const perturbations: Array<{
    name: string;
    key: keyof ScenarioInputValues;
    deltaVal: number;
    unit: string;
  }> = [
    { name: 'Reservoir Temperature', key: 'reservoirTemperatureC', deltaVal: 5.0, unit: '°C' },
    { name: 'Steam Injection Rate', key: 'steamInjectionRateTpd', deltaVal: 20.0, unit: 'TPD' },
    { name: 'Pumping Speed (SPM)', key: 'spm', deltaVal: 2.0, unit: 'SPM' },
    { name: 'Stroke Length', key: 'strokeLengthMeters', deltaVal: 0.5, unit: 'm' },
    { name: 'VFD Frequency', key: 'vfdFrequencyHz', deltaVal: 5.0, unit: 'Hz' },
    { name: 'Soak Duration', key: 'soakDurationDays', deltaVal: 2.0, unit: 'days' },
  ];

  const rawRecords = perturbations.map((p) => {
    const baseVal = inputs[p.key];
    const perturbedVal = baseVal + p.deltaVal;
    const pertInputs: ScenarioInputValues = { ...inputs, [p.key]: perturbedVal };

    const pertThermal = calculateThermalModel({ inputs: pertInputs } as any);
    const pertTemp = pertThermal.predictedReservoirTemperatureC;
    const pertVisc = calculateViscosityModel(pertTemp, 48.0).estimatedViscosityCp;
    const pertMob = calculateMobilityModel(pertVisc, pertTemp).mobilityDcP;
    const pertProd = calculateProductionModel(
      pertMob,
      pertTemp,
      pertVisc,
      30.0,
      pertInputs.vfdFrequencyHz,
      pertInputs.spm,
      pertInputs.strokeLengthMeters
    ).estimatedProductionBopd;
    const pertSrp = optimizeSRP({
      vfdFrequencyHz: pertInputs.vfdFrequencyHz,
      spm: pertInputs.spm,
      strokeLengthM: pertInputs.strokeLengthMeters,
      oilMobilityDcp: pertMob,
      effectiveDrawdownBar: 30.0,
      temperatureC: pertTemp,
      viscosityCp: pertVisc,
    }).currentCandidate.loadIndex;

    const dProd = parseFloat((pertProd - baseProd).toFixed(2));
    const dViscPct = parseFloat((((pertVisc - baseVisc) / baseVisc) * 100).toFixed(1));
    const dSrp = parseFloat((pertSrp - baseSrp).toFixed(1));

    // Impact Magnitude
    const absProdImpact = Math.abs(dProd);
    const absViscImpact = Math.abs(dViscPct) / 10;
    const absSrpImpact = Math.abs(dSrp) / 5;
    const rawImpact = absProdImpact + absViscImpact + absSrpImpact;

    return {
      parameterName: p.name,
      inputKey: p.key,
      baseValue: baseVal,
      perturbedValue: perturbedVal,
      deltaInput: `+${p.deltaVal} ${p.unit}`,
      baseProductionBopd: baseProd,
      perturbedProductionBopd: pertProd,
      deltaProductionBopd: dProd,
      baseViscosityCp: baseVisc,
      perturbedViscosityCp: pertVisc,
      deltaViscosityPercent: dViscPct,
      baseSrpLoadIndex: baseSrp,
      perturbedSrpLoadIndex: pertSrp,
      deltaSrpLoadIndex: dSrp,
      rawImpact,
    };
  });

  const maxImpact = Math.max(...rawRecords.map((r) => r.rawImpact), 0.001);

  const sorted = rawRecords
    .map((r) => ({
      ...r,
      normalizedSensitivityScore: parseFloat(((r.rawImpact / maxImpact) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.normalizedSensitivityScore - a.normalizedSensitivityScore);

  const records: ParameterSensitivityRecord[] = sorted.map((item, index) => {
    const { rawImpact, ...rest } = item;
    return {
      ...rest,
      rank: index + 1,
    };
  });

  const highestSensitivityParameter = records.length > 0 ? records[0].parameterName : 'None';

  return {
    records,
    highestSensitivityParameter,
    evaluatedAt,
  };
}
