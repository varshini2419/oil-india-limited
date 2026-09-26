export const MANDATORY_FIELD_INTEGRATION_DISCLAIMER =
  'Decision support only — no automatic field actuation. This field integration and controlled pilot readiness workspace operates strictly in advisory mode. No automatic control commands are issued to pumps, SRP drives, steam injection boilers, or wellhead valves.';

// Software timing thresholds (labeled as configured software threshold, not field certification standard)
export const STALE_TELEMETRY_THRESHOLD_SECONDS = 300; // 5 minutes (Configured software threshold)
export const OFFLINE_TELEMETRY_THRESHOLD_SECONDS = 3600; // 60 minutes (Configured software threshold)

export const FIELD_INTEGRATION_VERSION = 'v1.0.0-pilot-readiness';

export const PHYSICAL_BOUNDARIES = {
  temperatureC: { min: 10, max: 250, unit: '°C' },
  pressureBar: { min: 1, max: 100, unit: 'bar' },
  productionBopd: { min: 0, max: 200, unit: 'BOPD' },
  viscosityCp: { min: 1, max: 50000, unit: 'cP' },
  vfdFrequencyHz: { min: 10, max: 65, unit: 'Hz' },
  spm: { min: 1, max: 20, unit: 'SPM' },
  strokeLengthMeters: { min: 0.5, max: 5.0, unit: 'm' },
  steamRateTpd: { min: 0, max: 500, unit: 'TPD' },
  steamQuality: { min: 0.0, max: 1.0, unit: 'fraction' },
  waterCutPercent: { min: 0, max: 100, unit: '%' },
  motorLoadPercent: { min: 0, max: 150, unit: '%' },
};

export const DEFAULT_SIMULATED_TELEMETRY_RAW = {
  wellId: 'BW-01',
  temperature: 58.0,
  temperatureUnit: '°C',
  pressure: 35.0,
  pressureUnit: 'bar',
  production: 0.75,
  productionUnit: 'BOPD',
  viscosity: 5014.1,
  viscosityUnit: 'cP',
  vfdHz: 45.0,
  spm: 6.5,
  strokeM: 2.5,
  steamRateTpd: 80.0,
  steamQuality: 0.75,
  waterCut: 15.0,
  motorLoad: 68.5,
};

export const DEFAULT_REPLAY_TELEMETRY_RAW = {
  wellId: 'BW-HIST-01',
  temperature: 65.5,
  temperatureUnit: '°C',
  pressure: 38.2,
  pressureUnit: 'bar',
  production: 1.85,
  productionUnit: 'BOPD',
  viscosity: 3450.0,
  viscosityUnit: 'cP',
  vfdHz: 48.0,
  spm: 7.2,
  strokeM: 2.8,
  steamRateTpd: 95.0,
  steamQuality: 0.80,
  waterCut: 12.0,
  motorLoad: 72.0,
};

export const MANDATORY_ENGINEERING_LIMITATIONS: string[] = [
  'SIMULATED and REPLAY telemetry modes do not represent real physical field SCADA signals.',
  'REAL_FIELD mode returns NOT_CONNECTED when no authenticated physical SCADA endpoint is established.',
  'Missing measurements are explicitly tagged NOT_AVAILABLE and are not silently substituted with simulated physics values.',
  'Data freshness thresholds (300s stale / 3600s offline) reflect configured software thresholds, not physical oilfield certification standards.',
  'All recommendations produced by the digital twin decision engine remain strictly advisory; no automatic actuation of wellhead valves, pumps, or steam generators is permitted.',
  'Passing software unit and integration tests does not constitute physical field equipment deployment certification.',
];
