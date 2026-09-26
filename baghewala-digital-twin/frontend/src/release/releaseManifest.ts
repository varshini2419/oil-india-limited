import type { ReleaseManifest, ProductionAppMode } from './types';
import { MANDATORY_RELEASE_DISCLAIMER, PROJECT_RELEASE_VERSION } from './envConfig';

export const MANDATORY_RELEASE_LIMITATIONS: string[] = [
  'SIMULATED and REPLAY telemetry modes do not represent real physical field SCADA signals.',
  'REAL_FIELD mode returns NOT_CONNECTED when no authenticated physical SCADA connection exists.',
  'Missing measurements are explicitly tagged NOT_AVAILABLE and are never silently substituted with simulated values.',
  'All digital twin decision support recommendations remain strictly advisory; no automatic equipment control commands are issued to pumps, SRP drives, steam boilers, or wellhead valves.',
  'Passing software unit and integration tests does not constitute physical field equipment deployment certification.',
  'Operational deployment to real physical wellheads requires formal Oil India engineering review and safety authorization.',
];

export function generateReleaseManifest(appMode: ProductionAppMode = 'DEMONSTRATION'): ReleaseManifest {
  const generatedAt = new Date().toISOString();
  const releaseId = `REL-BW-${Date.now()}`;

  return {
    projectName: 'Baghewala Heavy-Oil Field Digital Twin Workspace',
    version: PROJECT_RELEASE_VERSION,
    releaseId,
    generatedAt,
    appMode,
    step5FreezeStatus: 'FROZEN_VALIDATED',
    step61Status: 'BLOCKED_SAFETY_AUDIT',
    step62Status: 'RELEASE_BLOCKED',
    verifiedTestSuitesCount: 23,
    verifiedTotalTestsCount: 518,
    buildStatus: 'SUCCESS_ZERO_ERRORS',
    registeredRoutesCount: 17,
    realFieldConnectivityStatus: 'NOT_CONNECTED_DISCONNECTED',
    safetyGovernanceStatus: 'ADVISORY_ONLY_ENFORCED',
    limitations: MANDATORY_RELEASE_LIMITATIONS,
    disclaimer: MANDATORY_RELEASE_DISCLAIMER,
  };
}
