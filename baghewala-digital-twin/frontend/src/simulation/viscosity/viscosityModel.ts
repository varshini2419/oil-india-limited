import type {
  ViscosityResult,
  ViscosityModelStatus,
  ViscosityConfidence,
  ViscosityBreakdown,
  ViscosityComparisonRow,
} from './types';
import {
  BAGHEWALA_VISCOSITY_CALIBRATION_POINTS,
  MIN_CALIBRATED_TEMP_C,
  MAX_CALIBRATED_TEMP_C,
  MIN_VISCOSITY_CP_BOUND,
  MAX_VISCOSITY_CP_BOUND,
} from './defaults';
import { validateViscosityInputs } from './validation';

/**
 * Log-linear interpolation for heavy crude oil viscosity vs temperature
 */
export const interpolateViscosityCp = (temperatureC: number): { viscosityCp: number; segment: string } => {
  const points = BAGHEWALA_VISCOSITY_CALIBRATION_POINTS;

  // 1. Below lowest calibrated temperature
  if (temperatureC <= points[0].temperatureC) {
    const p0 = points[0];
    const p1 = points[1];
    const slope = (Math.log(p1.viscosityCp) - Math.log(p0.viscosityCp)) / (p1.temperatureC - p0.temperatureC);
    const logVisc = Math.log(p0.viscosityCp) + slope * (temperatureC - p0.temperatureC);
    const rawVisc = Math.exp(logVisc);
    const clampedVisc = Math.min(MAX_VISCOSITY_CP_BOUND, Math.max(MIN_VISCOSITY_CP_BOUND, rawVisc));
    return {
      viscosityCp: Number(clampedVisc.toFixed(1)),
      segment: `Extrapolated (< ${points[0].temperatureC}°C)`,
    };
  }

  // 2. Above highest calibrated temperature
  if (temperatureC >= points[points.length - 1].temperatureC) {
    const pn = points[points.length - 1];
    const pn1 = points[points.length - 2];
    const slope = (Math.log(pn.viscosityCp) - Math.log(pn1.viscosityCp)) / (pn.temperatureC - pn1.temperatureC);
    const logVisc = Math.log(pn.viscosityCp) + slope * (temperatureC - pn.temperatureC);
    const rawVisc = Math.exp(logVisc);
    const clampedVisc = Math.min(MAX_VISCOSITY_CP_BOUND, Math.max(MIN_VISCOSITY_CP_BOUND, rawVisc));
    return {
      viscosityCp: Number(clampedVisc.toFixed(1)),
      segment: `Extrapolated (> ${pn.temperatureC}°C)`,
    };
  }

  // 3. In-range interpolation between reference points
  for (let i = 0; i < points.length - 1; i++) {
    const pA = points[i];
    const pB = points[i + 1];

    if (temperatureC >= pA.temperatureC && temperatureC <= pB.temperatureC) {
      // Exact match check
      if (temperatureC === pA.temperatureC) {
        return { viscosityCp: pA.viscosityCp, segment: `Exact Reference Point (${pA.temperatureC}°C)` };
      }
      if (temperatureC === pB.temperatureC) {
        return { viscosityCp: pB.viscosityCp, segment: `Exact Reference Point (${pB.temperatureC}°C)` };
      }

      const slope = (Math.log(pB.viscosityCp) - Math.log(pA.viscosityCp)) / (pB.temperatureC - pA.temperatureC);
      const logVisc = Math.log(pA.viscosityCp) + slope * (temperatureC - pA.temperatureC);
      const calculated = Math.exp(logVisc);

      return {
        viscosityCp: Number(calculated.toFixed(1)),
        segment: `Interpolated (${pA.temperatureC}°C - ${pB.temperatureC}°C)`,
      };
    }
  }

  // Fallback safe default
  return { viscosityCp: 15000.0, segment: 'Fallback Native Reference' };
};

/**
 * Calculates heavy-oil viscosity response from Step 4.3 temperature input
 */
export const calculateViscosityModel = (
  temperatureC: number,
  baselineTemperatureC: number = 48.0
): ViscosityResult => {
  const validation = validateViscosityInputs(temperatureC);
  const warnings: string[] = [...validation.warnings];

  // Handle invalid non-numeric temperature safely
  if (!validation.isValid) {
    const fallbackVisc = 15000.0;
    return {
      temperatureC: 48.0,
      estimatedViscosityCp: fallbackVisc,
      baselineViscosityCp: fallbackVisc,
      viscosityChangeCp: 0.0,
      viscosityChangePercent: 0.0,
      modelStatus: 'INVALID',
      provenance: 'derived',
      confidence: 'LOW',
      modelType: 'Baghewala Heavy-Oil Viscosity-Temperature Correlation',
      warnings: validation.errors,
      breakdown: {
        temperatureC: 48.0,
        estimatedViscosityCp: fallbackVisc,
        baselineViscosityCp: fallbackVisc,
        viscosityChangeCp: 0.0,
        viscosityChangePercent: 0.0,
        interpolationSegment: 'Invalid Input Fallback',
      },
      calibrationPoints: BAGHEWALA_VISCOSITY_CALIBRATION_POINTS,
      calculatedAt: new Date().toISOString(),
    };
  }

  // Calculate scenario viscosity & baseline viscosity
  const scenarioEval = interpolateViscosityCp(temperatureC);
  const baselineEval = interpolateViscosityCp(baselineTemperatureC);

  const estimatedViscosityCp = scenarioEval.viscosityCp;
  const baselineViscosityCp = baselineEval.viscosityCp;

  const viscosityChangeCp = Number((estimatedViscosityCp - baselineViscosityCp).toFixed(1));

  let viscosityChangePercent = 0.0;
  if (baselineViscosityCp > 0) {
    viscosityChangePercent = Number((((estimatedViscosityCp - baselineViscosityCp) / baselineViscosityCp) * 100).toFixed(1));
  }

  // Model Status & Confidence
  let modelStatus: ViscosityModelStatus = 'CALIBRATED';
  let confidence: ViscosityConfidence = 'HIGH';

  if (temperatureC < MIN_CALIBRATED_TEMP_C || temperatureC > MAX_CALIBRATED_TEMP_C) {
    modelStatus = 'EXTRAPOLATED';
    confidence = 'MEDIUM';
  }

  if (warnings.length > 0) {
    if (modelStatus !== 'EXTRAPOLATED') modelStatus = 'CALIBRATED';
    confidence = 'MEDIUM';
  }

  const breakdown: ViscosityBreakdown = {
    temperatureC: Number(temperatureC.toFixed(1)),
    estimatedViscosityCp,
    baselineViscosityCp,
    viscosityChangeCp,
    viscosityChangePercent,
    interpolationSegment: scenarioEval.segment,
  };

  return {
    temperatureC: Number(temperatureC.toFixed(1)),
    estimatedViscosityCp,
    baselineViscosityCp,
    viscosityChangeCp,
    viscosityChangePercent,
    modelStatus,
    provenance: 'derived',
    confidence,
    modelType: 'Baghewala Heavy-Oil Viscosity-Temperature Correlation',
    warnings,
    breakdown,
    calibrationPoints: BAGHEWALA_VISCOSITY_CALIBRATION_POINTS,
    calculatedAt: new Date().toISOString(),
  };
};

export const compareViscosityResults = (
  baselineResult: ViscosityResult,
  scenarioResult: ViscosityResult
): ViscosityComparisonRow[] => {
  return [
    {
      parameter: 'Reservoir Temperature',
      unit: '°C',
      baselineValue: baselineResult.temperatureC,
      scenarioValue: scenarioResult.temperatureC,
      delta: Number((scenarioResult.temperatureC - baselineResult.temperatureC).toFixed(1)),
      percentChange: baselineResult.temperatureC > 0 ? Number((((scenarioResult.temperatureC - baselineResult.temperatureC) / baselineResult.temperatureC) * 100).toFixed(1)) : 0,
      sourceType: 'derived',
    },
    {
      parameter: 'Estimated Crude Viscosity',
      unit: 'cP',
      baselineValue: baselineResult.estimatedViscosityCp,
      scenarioValue: scenarioResult.estimatedViscosityCp,
      delta: scenarioResult.viscosityChangeCp,
      percentChange: scenarioResult.viscosityChangePercent,
      sourceType: 'derived',
    },
  ];
};
