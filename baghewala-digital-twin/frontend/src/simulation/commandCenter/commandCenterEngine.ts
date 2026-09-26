import type { UnifiedCommandCenterState } from './types';
import { aggregateCommandCenterState } from './dashboardAggregator';
import type { ValidationInput } from '../integratedValidation/types';

export function getCommandCenterState(input: ValidationInput = {}): UnifiedCommandCenterState {
  return aggregateCommandCenterState(input);
}

export function refreshCommandCenterDashboard(input: ValidationInput = {}): UnifiedCommandCenterState {
  return aggregateCommandCenterState(input);
}
