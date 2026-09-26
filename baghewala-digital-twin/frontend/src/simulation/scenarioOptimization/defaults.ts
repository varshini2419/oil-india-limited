import type { DecisionConstraint, DecisionObjective } from './types';

export const SCENARIO_OPTIMIZATION_DISCLAIMER =
  'IMPORTANT DECISION SUPPORT NOTICE: Scenario optimization rankings and recommendations are decision-support modeling outputs derived from Baghewala physics equations and calibrated parameters. They do NOT constitute an autonomous field control signal, operational command, or guaranteed production forecast.';

export const DEFAULT_OBJECTIVE: DecisionObjective = 'BALANCED_OPERATION';

export const DEFAULT_DECISION_CONSTRAINTS: DecisionConstraint = {
  maxVfdHz: 60.0,
  maxSpm: 12.0,
  maxStrokeM: 3.5,
  maxSteamRateTpd: 180.0,
  maxLoadIndex: 85.0,
  minProductionBopd: 0.1,
  maxViscosityCp: 30000.0,
  minTemperatureC: 35.0,
  maxRiskLevel: 'HIGH',
};
