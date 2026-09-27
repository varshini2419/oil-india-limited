/**
 * BAGHEWALA DIGITAL TWIN — FIELD CALIBRATION & RESIDUAL ENGINE
 * 
 * Compares Digital Twin physics outputs against observed reference data.
 * Computes MAE, MAPE, RMSE, Bias, parameter residuals, and before-vs-after calibration metrics.
 * 
 * IMPORTANT: Calibration parameters are explicitly labeled "Calibration Parameters — Prototype Only"
 * and do not mutate baseline physics equations.
 */

import type { FieldObservationRecord } from './demoData';
import type { ScenarioInputValues } from '../scenario/types';
import { calculateThermalModel } from '../thermal';
import { calculateViscosityModel } from '../viscosity';
import { calculateMobilityModel } from '../mobility';
import { calculateProductionModel } from '../production';
import { optimizeSRP } from '../srpOptimization';

export interface CalibrationMultipliers {
  thermalGainMultiplier: number;
  viscosityMultiplier: number;
  mobilityMultiplier: number;
  productionMultiplier: number;
  srpLoadMultiplier: number;
}

export const DEFAULT_CALIBRATION_MULTIPLIERS: CalibrationMultipliers = {
  thermalGainMultiplier: 1.0,
  viscosityMultiplier: 1.0,
  mobilityMultiplier: 1.0,
  productionMultiplier: 1.0,
  srpLoadMultiplier: 1.0,
};

export interface ParameterResidual {
  parameterName: string;
  observed: number;
  modeledUncalibrated: number;
  modeledCalibrated: number;
  residualUncalibrated: number; // observed - uncalibrated
  residualCalibrated: number;   // observed - calibrated
  absErrorUncalibrated: number;
  absErrorCalibrated: number;
  relErrorPercentUncalibrated: number;
  relErrorPercentCalibrated: number;
  unit: string;
  source: string;
}

export interface CalibrationMetrics {
  mae: number;
  rmse: number;
  mape: number;
  bias: number;
}

export interface CalibrationComparisonResult {
  parameterName: string;
  uncalibratedMetrics: CalibrationMetrics;
  calibratedMetrics: CalibrationMetrics;
  residuals: ParameterResidual[];
  improvementPercentage: number; // Error reduction %
}

export function calculateCalibrationError(observed: number, model: number): { absoluteError: number; relativeErrorPercent: number } {
  const absoluteError = Math.abs(model - observed);
  const denominator = Math.abs(observed);
  const relativeErrorPercent = denominator > 0 ? (absoluteError / denominator) * 100 : 0;
  return {
    absoluteError: parseFloat(absoluteError.toFixed(4)),
    relativeErrorPercent: parseFloat(relativeErrorPercent.toFixed(2)),
  };
}

export function calculateMAE(residuals: number[]): number {
  if (!residuals || residuals.length === 0) return 0;
  const sumAbs = residuals.reduce((acc, r) => acc + Math.abs(r), 0);
  return parseFloat((sumAbs / residuals.length).toFixed(4));
}

export function calculateMAPE(observed: number[], model: number[]): number {
  if (!observed || observed.length === 0 || observed.length !== model.length) return 0;
  let sum = 0;
  let validCount = 0;
  for (let i = 0; i < observed.length; i++) {
    if (Math.abs(observed[i]) > 0) {
      sum += Math.abs(observed[i] - model[i]) / Math.abs(observed[i]);
      validCount++;
    }
  }
  return validCount > 0 ? parseFloat(((sum / validCount) * 100).toFixed(2)) : 0;
}

export function calculateRMSE(residuals: number[]): number {
  if (!residuals || residuals.length === 0) return 0;
  const sumSq = residuals.reduce((acc, r) => acc + r * r, 0);
  return parseFloat(Math.sqrt(sumSq / residuals.length).toFixed(4));
}

export function calculateBias(residuals: number[]): number {
  if (!residuals || residuals.length === 0) return 0;
  const sum = residuals.reduce((acc, r) => acc + r, 0);
  return parseFloat((sum / residuals.length).toFixed(4));
}

export function evaluateModelAgainstObservation(
  inputs: ScenarioInputValues,
  observation: FieldObservationRecord,
  multipliers: CalibrationMultipliers = DEFAULT_CALIBRATION_MULTIPLIERS
): ParameterResidual[] {
  // 1. Thermal Output
  const thermalRaw = calculateThermalModel({ inputs } as any);
  const uncalTemp = thermalRaw.predictedReservoirTemperatureC;
  const calTemp = parseFloat((inputs.reservoirTemperatureC + thermalRaw.thermalInfluenceC * multipliers.thermalGainMultiplier).toFixed(1));

  // 2. Viscosity Output
  const viscRaw = calculateViscosityModel(calTemp, 48.0);
  const uncalVisc = viscRaw.estimatedViscosityCp;
  const calVisc = parseFloat((uncalVisc * multipliers.viscosityMultiplier).toFixed(1));

  // 3. Mobility Output
  const mobRaw = calculateMobilityModel(calVisc, calTemp);
  const uncalMob = mobRaw.mobilityDcP;
  const calMob = parseFloat((uncalMob * multipliers.mobilityMultiplier).toFixed(4));

  // 4. Production Output
  const prodRaw = calculateProductionModel(
    calMob,
    calTemp,
    calVisc,
    30.0,
    inputs.vfdFrequencyHz,
    inputs.spm,
    inputs.strokeLengthMeters
  );
  const uncalProd = prodRaw.estimatedProductionBopd;
  const calProd = parseFloat((uncalProd * multipliers.productionMultiplier).toFixed(2));

  // 5. SRP Load Output
  const srpRaw = optimizeSRP({
    vfdFrequencyHz: inputs.vfdFrequencyHz,
    spm: inputs.spm,
    strokeLengthM: inputs.strokeLengthMeters,
    oilMobilityDcp: calMob,
    effectiveDrawdownBar: 30.0,
    temperatureC: calTemp,
    viscosityCp: calVisc,
  });
  const uncalSrp = srpRaw.currentCandidate.loadIndex;
  const calSrp = parseFloat((uncalSrp * multipliers.srpLoadMultiplier).toFixed(1));

  const items: Array<{ name: string; obs: number; uncal: number; cal: number; unit: string }> = [
    { name: 'Reservoir Temperature', obs: observation.reservoirTempC, uncal: uncalTemp, cal: calTemp, unit: '°C' },
    { name: 'Crude Viscosity', obs: observation.crudeViscosityCp, uncal: uncalVisc, cal: calVisc, unit: 'cP' },
    { name: 'Production Rate', obs: observation.productionBopd, uncal: uncalProd, cal: calProd, unit: 'BOPD' },
    { name: 'SRP Load Index', obs: observation.srpLoadIndex, uncal: uncalSrp, cal: calSrp, unit: '/100' },
  ];

  return items.map((item) => {
    const resUncal = parseFloat((item.obs - item.uncal).toFixed(4));
    const resCal = parseFloat((item.obs - item.cal).toFixed(4));
    const errUncal = calculateCalibrationError(item.obs, item.uncal);
    const errCal = calculateCalibrationError(item.obs, item.cal);

    return {
      parameterName: item.name,
      observed: item.obs,
      modeledUncalibrated: item.uncal,
      modeledCalibrated: item.cal,
      residualUncalibrated: resUncal,
      residualCalibrated: resCal,
      absErrorUncalibrated: errUncal.absoluteError,
      absErrorCalibrated: errCal.absoluteError,
      relErrorPercentUncalibrated: errUncal.relativeErrorPercent,
      relErrorPercentCalibrated: errCal.relativeErrorPercent,
      unit: item.unit,
      source: observation.sourceType,
    };
  });
}

export function computeCalibrationMetricsSummary(
  observations: FieldObservationRecord[],
  inputs: ScenarioInputValues,
  multipliers: CalibrationMultipliers = DEFAULT_CALIBRATION_MULTIPLIERS
): Record<string, CalibrationComparisonResult> {
  const result: Record<string, CalibrationComparisonResult> = {};
  const params = ['Reservoir Temperature', 'Crude Viscosity', 'Production Rate', 'SRP Load Index'];

  params.forEach((paramName) => {
    const allResiduals: ParameterResidual[] = [];
    observations.forEach((obs) => {
      const evalRes = evaluateModelAgainstObservation(inputs, obs, multipliers);
      const target = evalRes.find((r) => r.parameterName === paramName);
      if (target) allResiduals.push(target);
    });

    const uncalResList = allResiduals.map((r) => r.residualUncalibrated);
    const calResList = allResiduals.map((r) => r.residualCalibrated);
    const obsList = allResiduals.map((r) => r.observed);
    const uncalModList = allResiduals.map((r) => r.modeledUncalibrated);
    const calModList = allResiduals.map((r) => r.modeledCalibrated);

    const uncalMae = calculateMAE(uncalResList);
    const calMae = calculateMAE(calResList);

    const uncalRmse = calculateRMSE(uncalResList);
    const calRmse = calculateRMSE(calResList);

    const uncalMape = calculateMAPE(obsList, uncalModList);
    const calMape = calculateMAPE(obsList, calModList);

    const uncalBias = calculateBias(uncalResList);
    const calBias = calculateBias(calResList);

    const improvementPercentage = uncalMae > 0 ? parseFloat((((uncalMae - calMae) / uncalMae) * 100).toFixed(1)) : 0;

    result[paramName] = {
      parameterName: paramName,
      uncalibratedMetrics: { mae: uncalMae, rmse: uncalRmse, mape: uncalMape, bias: uncalBias },
      calibratedMetrics: { mae: calMae, rmse: calRmse, mape: calMape, bias: calBias },
      residuals: allResiduals,
      improvementPercentage,
    };
  });

  return result;
}
