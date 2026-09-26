import type { PilotScenarioConfig } from './types';

export const MANDATORY_PILOT_DISCLAIMER =
  'Antigravity Engineering Digital Twin — Decision support only — no automatic field actuation.';

export const REAL_FIELD_NOT_CONNECTED_LABEL = 'REAL FIELD TELEMETRY: NOT CONNECTED';

export const TOTAL_VERIFIED_SIMULATION_TESTS_PILOT = 334;

export const PILOT_SCENARIOS: PilotScenarioConfig[] = [
  {
    id: 'SCENARIO_A_NORMAL',
    name: 'Scenario A: Normal Operating Baseline',
    code: 'PILOT-SCEN-A',
    description: 'Heated reservoir at 68°C thermal equilibrium with nominal SRP pumping speed (4.2 SPM, 45 Hz).',
    provenanceTag: 'SIMULATED',
    sourceType: 'HISTORICAL',
    isSimulatedWhatIf: true,
    overrides: {
      reservoirTemperatureC: 68.0,
      reservoirPressureBar: 55.0,
      steamRateTpd: 120,
      vfdFrequencyHz: 45.0,
      spm: 4.2,
      strokeLengthMeters: 2.2,
      soakDurationDays: 5,
    },
  },
  {
    id: 'SCENARIO_B_VISCOSITY_SPIKE',
    name: 'Scenario B: Increasing Crude Viscosity (Cool Reservoir)',
    code: 'PILOT-SCEN-B',
    description: 'Reservoir cools to 48.9°C, causing crude oil viscosity to spike to >13,500 cP and mobility to drop.',
    provenanceTag: 'SIMULATED',
    sourceType: 'USER_IMPORTED',
    isSimulatedWhatIf: true,
    overrides: {
      reservoirTemperatureC: 48.9,
      steamRateTpd: 40,
      vfdFrequencyHz: 40.0,
      spm: 3.5,
    },
  },
  {
    id: 'SCENARIO_C_PRESSURE_DROP',
    name: 'Scenario C: Reduced Reservoir Pressure & Drawdown',
    code: 'PILOT-SCEN-C',
    description: 'Reservoir static pressure declines to 32 bar, reducing effective drawdown drive and liquid production rate.',
    provenanceTag: 'SIMULATED',
    sourceType: 'USER_IMPORTED',
    isSimulatedWhatIf: true,
    overrides: {
      reservoirPressureBar: 32.0,
      vfdFrequencyHz: 42.0,
      spm: 3.8,
    },
  },
  {
    id: 'SCENARIO_D_SRP_DEGRADATION',
    name: 'Scenario D: SRP Mechanical Performance Degradation',
    code: 'PILOT-SCEN-D',
    description: 'SRP pumping speed driven to 10 SPM / 58 Hz, triggering elevated structural load index (>85%) and risk warning.',
    provenanceTag: 'SIMULATED',
    sourceType: 'USER_IMPORTED',
    isSimulatedWhatIf: true,
    overrides: {
      vfdFrequencyHz: 58.0,
      spm: 10.0,
      strokeLengthMeters: 3.2,
    },
  },
  {
    id: 'SCENARIO_E_CSS_THERMAL_GAIN',
    name: 'Scenario E: High CSS Steam Injection Thermal Response',
    code: 'PILOT-SCEN-E',
    description: 'Steam injection increased to 220 TPD, boosting reservoir temperature to 85°C and reducing viscosity to <400 cP.',
    provenanceTag: 'SIMULATED',
    sourceType: 'USER_IMPORTED',
    isSimulatedWhatIf: true,
    overrides: {
      reservoirTemperatureC: 85.0,
      steamRateTpd: 220,
      soakDurationDays: 7,
    },
  },
  {
    id: 'SCENARIO_F_COMBINED_ADVERSE',
    name: 'Scenario F: Combined Adverse Conditions (High Viscosity + High Load)',
    code: 'PILOT-SCEN-F',
    description: 'Simultaneous low temperature (50°C) and aggressive pump drive (55 Hz), triggering multi-variable risk advisory.',
    provenanceTag: 'SIMULATED',
    sourceType: 'USER_IMPORTED',
    isSimulatedWhatIf: true,
    overrides: {
      reservoirTemperatureC: 50.0,
      steamRateTpd: 30,
      vfdFrequencyHz: 55.0,
      spm: 9.0,
    },
  },
  {
    id: 'SCENARIO_G_SENSOR_DEGRADATION',
    name: 'Scenario G: Sensor Noise & Data Quality Degradation',
    code: 'PILOT-SCEN-G',
    description: 'Field data stream corrupted with synthetic outliers and missing metrics, testing data acceptance & quality fallback.',
    provenanceTag: 'SIMULATED',
    sourceType: 'USER_IMPORTED',
    isSimulatedWhatIf: true,
    overrides: {
      noiseLevel: 0.35,
      corruptSensor: true,
    },
  },
  {
    id: 'SCENARIO_H_RECOVERY_INTERVENTION',
    name: 'Scenario H: Post-Intervention Recovery & Optimization',
    code: 'PILOT-SCEN-H',
    description: 'Optimized steam injection (160 TPD) and tuned SRP VFD drive (46 Hz), demonstrating production recovery.',
    provenanceTag: 'SIMULATED',
    sourceType: 'HISTORICAL',
    isSimulatedWhatIf: true,
    overrides: {
      reservoirTemperatureC: 75.0,
      steamRateTpd: 160,
      vfdFrequencyHz: 46.0,
      spm: 4.5,
      strokeLengthMeters: 2.5,
    },
  },
];
