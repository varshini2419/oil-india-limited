import type { DigitalTwinState, AlertItem, TimelineEvent } from './types';
import { evaluateAlerts } from './alertEngine';

export interface MonitoringSession {
  history: DigitalTwinState[];
  activeAlerts: AlertItem[];
  eventTimeline: TimelineEvent[];
}

export function createMonitoringSession(initialState: DigitalTwinState): MonitoringSession {
  const alertEval = evaluateAlerts(initialState);
  return {
    history: [initialState],
    activeAlerts: alertEval.alerts,
    eventTimeline: alertEval.events,
  };
}

export function pushMonitoringState(
  session: MonitoringSession,
  newState: DigitalTwinState,
  maxHistory = 50
): MonitoringSession {
  const updatedHistory = [...session.history, newState].slice(-maxHistory);
  const alertEval = evaluateAlerts(newState);

  // Merge new events with deduplication
  const updatedTimeline = [...alertEval.events, ...session.eventTimeline].slice(0, 30);

  return {
    history: updatedHistory,
    activeAlerts: alertEval.alerts,
    eventTimeline: updatedTimeline,
  };
}
