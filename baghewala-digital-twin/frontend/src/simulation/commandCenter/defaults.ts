export const MANDATORY_COMMAND_CENTER_DISCLAIMER =
  'Decision support only — no automatic field actuation. System outputs are advisory operational recommendations. Software test success does not certify physical field performance or safety.';

export const SAFETY_BANNERS = [
  'Decision support only — no automatic field actuation.',
  'SIMULATED TELEMETRY is used when real field telemetry is unavailable.',
  'Software test success does not certify physical field performance or field safety.',
  'Model outputs are subject to data quality, calibration and uncertainty limitations.',
];

export const TOTAL_VERIFIED_SIMULATION_TESTS = 274;

export const COMMAND_CENTER_PIPELINE_STAGES = [
  { stageNumber: 1, stageName: 'FIELD DATA', routePath: '/field-data' },
  { stageNumber: 2, stageName: 'QUALITY', routePath: '/field-data' },
  { stageNumber: 3, stageName: 'PHYSICS', routePath: '/simulation' },
  { stageNumber: 4, stageName: 'CALIBRATION', routePath: '/simulation' },
  { stageNumber: 5, stageName: 'UNCERTAINTY', routePath: '/results' },
  { stageNumber: 6, stageName: 'OPTIMIZATION', routePath: '/scenarios' },
  { stageNumber: 7, stageName: 'RISK', routePath: '/results' },
  { stageNumber: 8, stageName: 'DECISION', routePath: '/integrated-validation' },
  { stageNumber: 9, stageName: 'READINESS', routePath: '/operational-readiness' },
];
