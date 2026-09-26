import { calculateViscosityModel } from '../viscosity/viscosityModel';
import { calculateMobilityModel } from '../mobility/mobilityModel';
import { calculateProductionModel } from '../production/productionModel';
import { determineCSSStatus, validateCSSInput } from './validation';
import type { CSSCandidate, CSSOptimizationInput } from './types';

export function evaluateCSSCandidate(input: CSSOptimizationInput): CSSCandidate {
  const validation = validateCSSInput(input);
  const {
    steamInjectionRateTpd,
    steamInjectionTemperatureC,
    steamQualityFraction,
    injectionDurationDays,
    soakDurationDays,
    productionDurationDays,
    reservoirTemperatureC,
    baselineViscosityCp,
    baselineProductionBopd,
    vfdFrequencyHz,
    spm,
    strokeLengthMeters,
    activePhase = 'PRODUCTION',
  } = input;

  // 1. Steam Volume
  const steamVolumeTons = Number(
    (steamInjectionRateTpd * injectionDurationDays).toFixed(1)
  );

  // 2. Soak Retention Model (Buildup & Decay)
  const soakBuildup = 1.0 - Math.exp(-Math.max(0, soakDurationDays) / 3.0);
  const soakDecay = Math.exp(-Math.max(0, soakDurationDays) / 30.0);
  const heatRetention = Number((soakBuildup * soakDecay).toFixed(3));

  // 3. Thermal Gain & Predicted CSS Temperature
  const normalizedSteamVolume = steamVolumeTons / 500.0;
  const thermalGain = normalizedSteamVolume * Math.min(1.0, Math.max(0.1, steamQualityFraction)) * 60.0;
  const deltaTemperatureC = Number((thermalGain * heatRetention).toFixed(1));

  let rawCssTemp = reservoirTemperatureC + deltaTemperatureC;
  const predictedCssTemperatureC = Number(
    Math.min(200.0, Math.max(reservoirTemperatureC, rawCssTemp)).toFixed(1)
  );

  // 4. Viscosity Coupling (Step 4.4)
  const viscosityResult = calculateViscosityModel(predictedCssTemperatureC, reservoirTemperatureC);
  const cssViscosityCp = viscosityResult.estimatedViscosityCp;

  // 5. Mobility Coupling (Step 4.5)
  const mobilityResult = calculateMobilityModel(
    cssViscosityCp,
    predictedCssTemperatureC,
    2.5,
    1.0,
    baselineViscosityCp
  );
  const cssMobilityDPerCp = mobilityResult.mobilityDcP;

  // 6. Production Coupling (Step 4.6 & Step 4.7)
  const prodResult = calculateProductionModel(
    cssMobilityDPerCp,
    predictedCssTemperatureC,
    cssViscosityCp,
    30.0,
    vfdFrequencyHz,
    spm,
    strokeLengthMeters,
    baselineProductionBopd
  );
  const cssProductionBopd = prodResult.estimatedProductionBopd;

  const productionIncreaseBopd = Number(
    (cssProductionBopd - baselineProductionBopd).toFixed(2)
  );

  let productionIncreasePercent = 0.0;
  if (baselineProductionBopd > 0) {
    productionIncreasePercent = Number(
      (((cssProductionBopd - baselineProductionBopd) / baselineProductionBopd) * 100).toFixed(1)
    );
  }

  // 7. Cycle Duration & Efficiency Score
  const cycleDurationDays = injectionDurationDays + soakDurationDays + productionDurationDays;

  const steamPenalty = 0.005 * (steamVolumeTons / Math.max(0.1, steamQualityFraction));
  const timePenalty = 0.05 * (injectionDurationDays + soakDurationDays);
  const rawEfficiency = (productionIncreaseBopd * productionDurationDays) / (1.0 + steamPenalty + timePenalty);
  const efficiencyScore = Number(Math.max(0, rawEfficiency).toFixed(2));

  // 8. Status & Validity
  const status = determineCSSStatus(
    validation.isValid,
    steamInjectionRateTpd,
    steamQualityFraction,
    soakDurationDays,
    steamVolumeTons,
    predictedCssTemperatureC
  );

  const isValid = validation.isValid && status !== 'OUT_OF_RANGE';
  let penaltyMessage: string | undefined;

  if (!validation.isValid) {
    penaltyMessage = validation.errors.join(' | ');
  } else if (status === 'HIGH_THERMAL_LOAD') {
    penaltyMessage = 'High thermal load state (>120 TPD steam or >150°C predicted temp).';
  } else if (status === 'CAUTION') {
    penaltyMessage = 'Suboptimal steam quality or extended soak duration parameters.';
  }

  return {
    steamInjectionRateTpd,
    steamInjectionTemperatureC,
    steamQualityFraction,
    injectionDurationDays,
    soakDurationDays,
    productionDurationDays,
    steamVolumeTons,
    predictedCssTemperatureC,
    cssViscosityCp,
    cssMobilityDPerCp,
    cssProductionBopd,
    productionIncreaseBopd,
    productionIncreasePercent,
    cycleDurationDays,
    efficiencyScore,
    status,
    isValid,
    activePhase,
    penaltyMessage,
  };
}
