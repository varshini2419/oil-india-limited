import type { ReadinessLevel } from './types';

export const OPERATIONAL_READINESS_DISCLAIMER =
  'FOR DEMONSTRATION, ENGINEERING REVIEW AND CONTROLLED PILOT VALIDATION ONLY. Decision support only — no automatic field equipment actuation. System outputs are advisory and not certified for autonomous field control or statistical safety certification.';

export const SYSTEM_LIMITATIONS: string[] = [
  'Simulated telemetry is used when live field sensors are offline.',
  'Calibrated parameters are derived from documented Baghewala historical test cycles and subject to reservoir uncertainty.',
  'Monte Carlo uncertainty ranges reflect input distribution variance, not field-proven statistical bounds.',
  'Recommendations provide advisory operational guidance only; no direct SCADA/equipment actuation exists.',
  'System outputs must be reviewed by qualified petroleum engineers before operational parameter adjustments.',
];

export const READINESS_LEVEL_DESCRIPTIONS: Record<ReadinessLevel, string> = {
  DEMO_READY:
    'Software pipeline, physics models, and interactive dashboard fully operational for demonstration and what-if exploration.',
  ENGINEERING_REVIEW_READY:
    'Physics equations, calibration fit, and uncertainty analysis verified for technical petroleum engineering audit.',
  PILOT_VALIDATION_READY:
    'Field data quality, historical backtest, and decision trace meet standards for controlled pilot testing.',
  NOT_READY:
    'Pipeline health failures, severe data quality defects, or missing critical models prevent operational review.',
};

export const PIPELINE_COMPONENT_DEFS = [
  { id: 'physics_models', name: 'Physics Models Engine', step: 'Steps 4.3–4.9' },
  { id: 'historical_validation', name: 'Historical Backtesting', step: 'Step 5.1' },
  { id: 'calibration', name: 'Parameter Calibration', step: 'Step 5.2' },
  { id: 'uncertainty', name: 'Monte Carlo Uncertainty', step: 'Step 5.3' },
  { id: 'optimization', name: 'Scenario Optimization', step: 'Step 5.4' },
  { id: 'monitoring', name: 'Real-Time Monitoring & What-If', step: 'Step 5.5' },
  { id: 'field_ingestion', name: 'Field Data Ingestion', step: 'Step 5.6' },
  { id: 'integrated_validation', name: 'Integrated Validation & Decision Trace', step: 'Step 5.7' },
  { id: 'provenance_tracking', name: 'Data Provenance Engine', step: 'Cross-module' },
  { id: 'unit_consistency', name: 'Unit Normalization Engine', step: 'Step 5.6' },
  { id: 'test_coverage', name: 'Automated Test Suite', step: 'Verification' },
  { id: 'build_status', name: 'TypeScript Build System', step: 'Compilation' },
];
