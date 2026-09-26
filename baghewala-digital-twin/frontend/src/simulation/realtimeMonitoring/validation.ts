import type { WhatIfInputs } from './types';
import { MONITORING_BOUNDS } from './defaults';

export interface WhatIfValidationResult {
  isValid: boolean;
  violations: string[];
  warnings: string[];
}

export function validateWhatIfInputs(inputs: WhatIfInputs): WhatIfValidationResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  if (inputs.reservoirTemperatureC !== undefined) {
    if (isNaN(inputs.reservoirTemperatureC)) {
      violations.push('Reservoir temperature is NaN.');
    } else if (inputs.reservoirTemperatureC < MONITORING_BOUNDS.minTemperatureC || inputs.reservoirTemperatureC > MONITORING_BOUNDS.maxTemperatureC) {
      violations.push(`Reservoir temperature (${inputs.reservoirTemperatureC.toFixed(1)}°C) is OUT OF MODEL RANGE [${MONITORING_BOUNDS.minTemperatureC} - ${MONITORING_BOUNDS.maxTemperatureC}°C].`);
    } else if (inputs.reservoirTemperatureC > 120.0) {
      warnings.push(`Elevated reservoir temperature (${inputs.reservoirTemperatureC.toFixed(1)}°C) approaching upper physical thermal limit.`);
    }
  }

  if (inputs.steamInjectionRateTpd !== undefined) {
    if (isNaN(inputs.steamInjectionRateTpd) || inputs.steamInjectionRateTpd < 0) {
      violations.push(`Steam injection rate (${inputs.steamInjectionRateTpd}) cannot be negative or NaN.`);
    } else if (inputs.steamInjectionRateTpd > MONITORING_BOUNDS.maxSteamRateTpd) {
      violations.push(`Steam injection rate (${inputs.steamInjectionRateTpd} TPD) exceeds maximum boiler capability (${MONITORING_BOUNDS.maxSteamRateTpd} TPD).`);
    } else if (inputs.steamInjectionRateTpd > 180.0) {
      warnings.push(`High steam injection rate (${inputs.steamInjectionRateTpd} TPD) requires enhanced thermal line insulation.`);
    }
  }

  if (inputs.vfdFrequencyHz !== undefined) {
    if (isNaN(inputs.vfdFrequencyHz) || inputs.vfdFrequencyHz < MONITORING_BOUNDS.minVfdHz || inputs.vfdFrequencyHz > MONITORING_BOUNDS.maxVfdHz) {
      violations.push(`VFD frequency (${inputs.vfdFrequencyHz} Hz) is OUT OF MODEL RANGE [${MONITORING_BOUNDS.minVfdHz} - ${MONITORING_BOUNDS.maxVfdHz} Hz].`);
    } else if (inputs.vfdFrequencyHz > 55.0) {
      warnings.push(`High VFD speed (${inputs.vfdFrequencyHz} Hz) increases mechanical rod stress.`);
    }
  }

  if (inputs.spm !== undefined) {
    if (isNaN(inputs.spm) || inputs.spm < MONITORING_BOUNDS.minSpm || inputs.spm > MONITORING_BOUNDS.maxSpm) {
      violations.push(`Pumping speed (${inputs.spm} SPM) is OUT OF MODEL RANGE [${MONITORING_BOUNDS.minSpm} - ${MONITORING_BOUNDS.maxSpm} SPM].`);
    } else if (inputs.spm > 12.0) {
      warnings.push(`Elevated SPM (${inputs.spm}) accelerates gearbox wear.`);
    }
  }

  if (inputs.strokeLengthMeters !== undefined) {
    if (isNaN(inputs.strokeLengthMeters) || inputs.strokeLengthMeters < MONITORING_BOUNDS.minStrokeM || inputs.strokeLengthMeters > MONITORING_BOUNDS.maxStrokeM) {
      violations.push(`Stroke length (${inputs.strokeLengthMeters} m) is OUT OF MODEL RANGE [${MONITORING_BOUNDS.minStrokeM} - ${MONITORING_BOUNDS.maxStrokeM} m].`);
    }
  }

  if (inputs.effectiveDrawdownBar !== undefined) {
    if (isNaN(inputs.effectiveDrawdownBar) || inputs.effectiveDrawdownBar < 0 || inputs.effectiveDrawdownBar > 100.0) {
      violations.push(`Effective drawdown (${inputs.effectiveDrawdownBar} bar) is OUT OF MODEL RANGE [0 - 100 bar].`);
    }
  }

  if (inputs.steamQualityPercent !== undefined) {
    if (isNaN(inputs.steamQualityPercent) || inputs.steamQualityPercent < 0 || inputs.steamQualityPercent > 100.0) {
      violations.push(`Steam quality (${inputs.steamQualityPercent}%) must be between 0% and 100%.`);
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
  };
}
