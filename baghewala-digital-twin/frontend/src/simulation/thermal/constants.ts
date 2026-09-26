import type { ThermalModelParams } from './types';

export const DEFAULT_THERMAL_MODEL_PARAMS: ThermalModelParams = {
  steamGeneratorTempC: 260.0,          // Surface steam generator output temp
  thermalResponseFactorK: 0.25,        // k_steam: fraction of steam thermal delta transferred to matrix
  timeConstantTauDays: 5.0,            // tau: exponential time response constant (days)
  referenceSteamRateTpd: 150.0,        // Normalizing reference capacity for steam generator
  ambientSurfaceOffsetC: 5.0,          // Surface piping/wellhead equipment operating offset above ambient
  ambientReservoirCoupling: 0.02,      // Minor coupling factor of ambient on deep formation
  reservoirDepthM: 1100.0,             // Jodhpur Sandstone average depth (m)
  minTempBoundC: 10.0,                 // Physical minimum temperature bound
  maxTempBoundC: 300.0,                // Prototype thermal ceiling bound
};

export const THERMAL_MODEL_ASSUMPTIONS: string[] = [
  'Steam generator surface temperature is assumed at 260.0°C based on standard Cyclic Steam Injection (CSS) operational parameters.',
  'Near-wellbore sand matrix thermal diffusion is modeled via a reduced-order response factor (k_steam = 0.25) [MODEL ASSUMPTION].',
  'Soak time thermal saturation follows exponential response [1 - exp(-t/tau)] with time constant tau = 5.0 days [MODEL ASSUMPTION].',
  'Ambient surface temperature affects surface wellhead/piping context (T_surface = T_ambient + 5.0°C) with minimal direct geothermal coupling down 1100m reservoir depth [MODEL ASSUMPTION].',
  'No geothermal gradient expansion is assumed beyond initial static reservoir temperature (48.0°C) [DOCUMENTED FIELD DATA].',
];
