export const MANDATORY_ASSESSMENT_DISCLAIMER =
  'Decision support only — no automatic field actuation. Simulation results must not be presented as measured field results. Software testing does not equal physical field certification.';

export const REAL_FIELD_UNCONNECTED_NOTICE = 'REAL FIELD TELEMETRY: NOT CONNECTED';

export const TOTAL_VERIFIED_SIMULATION_TESTS_ASSESSMENT = 366;

export const DEFAULT_REQUIRED_FIELD_VALIDATIONS: string[] = [
  'Connect calibrated multi-phase wellhead flow meters for continuous oil production metering.',
  'Integrate physical SCADA telemetry stream for real-time sucker rod pump (SRP) dynamic load cells.',
  'Calibrate downhole reservoir temperature and pressure sensor gauges with certified field logging tools.',
  'Verify steam quality fraction (X_s) at wellhead injection manifold during CSS active injection cycles.',
  'Perform third-party engineering safety and operational review prior to field implementation.',
  'Establish secure, air-gapped or encrypted field telemetry ingestion gateway compliant with industrial cybersecurity protocols.',
];

export const DEFAULT_ENGINEERING_LIMITATIONS: string[] = [
  'Digital twin relies on log-linear viscosity extrapolation above 180°C.',
  'Single-well simulator does not account for inter-well interference or reservoir-wide pressure depletion.',
  'Field SCADA hardware telemetry is currently unconnected; all inputs are derived from simulated what-if or historical appraisal data.',
  'Decoupled advisory-only architecture requires human engineer authorization before any physical operational adjustment.',
];
