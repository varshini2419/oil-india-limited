import type {
  UncertaintyParameter,
  UncertaintyConfiguration,
  UncertaintyValidationResult,
  SampledScenarioInputs,
} from './types';

export function validateUncertaintyParameter(param: UncertaintyParameter): UncertaintyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof param.baselineValue !== 'number' || isNaN(param.baselineValue) || !isFinite(param.baselineValue)) {
    errors.push(`Parameter ${param.name} baseline value is non-numeric (NaN/Infinity).`);
  }

  if (typeof param.minAllowed !== 'number' || isNaN(param.minAllowed) || !isFinite(param.minAllowed)) {
    errors.push(`Parameter ${param.name} minAllowed is non-numeric.`);
  }

  if (typeof param.maxAllowed !== 'number' || isNaN(param.maxAllowed) || !isFinite(param.maxAllowed)) {
    errors.push(`Parameter ${param.name} maxAllowed is non-numeric.`);
  }

  if (param.minAllowed >= param.maxAllowed) {
    errors.push(`Parameter ${param.name} minAllowed (${param.minAllowed}) must be strictly less than maxAllowed (${param.maxAllowed}).`);
  }

  if (param.baselineValue < param.minAllowed || param.baselineValue > param.maxAllowed) {
    warnings.push(`Parameter ${param.name} baseline value (${param.baselineValue}) lies outside defined bounds [${param.minAllowed}, ${param.maxAllowed}].`);
  }

  if (param.uncertaintyValue < 0) {
    errors.push(`Parameter ${param.name} uncertainty value cannot be negative.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateSampledInputs(inputs: SampledScenarioInputs): UncertaintyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [key, val] of Object.entries(inputs)) {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      errors.push(`Sampled input ${key} is non-numeric (NaN/Infinity).`);
    }
  }

  if (inputs.reservoirPermeabilityD <= 0) {
    errors.push(`Reservoir permeability (${inputs.reservoirPermeabilityD} D) must be strictly positive.`);
  }

  if (inputs.crudeViscosityInputCp <= 0) {
    errors.push(`Crude viscosity (${inputs.crudeViscosityInputCp} cP) must be strictly positive.`);
  }

  if (inputs.reservoirTemperatureC < -50 || inputs.reservoirTemperatureC > 350) {
    errors.push(`Reservoir temperature (${inputs.reservoirTemperatureC} °C) is physically impossible.`);
  }

  if (inputs.steamInjectionRateTpd < 0 || inputs.steamInjectionRateTpd > 1000) {
    errors.push(`Steam injection rate (${inputs.steamInjectionRateTpd} TPD) is outside physical range [0, 1000].`);
  }

  if (inputs.vfdFrequencyHz < 10 || inputs.vfdFrequencyHz > 80) {
    errors.push(`VFD frequency (${inputs.vfdFrequencyHz} Hz) is outside safe operational range [10, 80].`);
  }

  if (inputs.spm < 1 || inputs.spm > 20) {
    errors.push(`SPM (${inputs.spm}) is outside safe operational range [1, 20].`);
  }

  if (inputs.strokeLengthMeters < 0.5 || inputs.strokeLengthMeters > 6.0) {
    errors.push(`Stroke length (${inputs.strokeLengthMeters} m) is outside safe physical range [0.5, 6.0].`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateUncertaintyConfig(config: UncertaintyConfiguration): UncertaintyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof config.sampleCount !== 'number' || isNaN(config.sampleCount) || !isFinite(config.sampleCount)) {
    errors.push('Sample count must be a valid finite number.');
  } else if (config.sampleCount < 2 || config.sampleCount > 10000) {
    errors.push(`Sample count (${config.sampleCount}) must be between 2 and 10,000.`);
  }

  if (typeof config.seed !== 'number' || isNaN(config.seed) || !isFinite(config.seed)) {
    errors.push('PRNG random seed must be a valid number.');
  }

  if (!Array.isArray(config.parameters) || config.parameters.length === 0) {
    errors.push('Uncertainty configuration must contain at least one parameter.');
  } else {
    for (const param of config.parameters) {
      const pVal = validateUncertaintyParameter(param);
      if (!pVal.isValid) {
        errors.push(...pVal.errors);
      }
      warnings.push(...pVal.warnings);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
