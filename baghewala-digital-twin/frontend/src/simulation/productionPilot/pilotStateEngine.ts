/**
 * Production Pilot State Isolation Engine
 * Baghewala Heavy-Oil Field Digital Twin - Phase 6
 * ISOLATED PILOT STATE - NEVER OVERWRITES COMMITTED SIMULATION RESULT
 */

import type { PilotState, PilotSimulatorProfile } from './types';
import { evaluatePilotConfidence } from './pilotConfidenceEngine';

export function createInitialPilotState(
  wellId: string = 'BGW-PILOT-01',
  profile: PilotSimulatorProfile = 'NORMAL'
): PilotState {
  return {
    wellId,
    status: 'PAUSED',
    currentProfile: profile,
    telemetryHistory: [],
    comparisonHistory: [],
    activeDeviations: [],
    riskLevel: 'NORMAL',
    confidence: evaluatePilotConfidence(undefined, undefined, []),
    lastUpdated: new Date().toISOString(),
    stepCount: 0,
  };
}
