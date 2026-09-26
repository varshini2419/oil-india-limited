import type { ReleaseVerificationResult, ProductionAppMode } from './types';
import { generateReleaseManifest } from './releaseManifest';
import { evaluateReleaseChecklist } from './releaseChecklist';
import { generateDemonstrationScenarios } from './demonstrationEngine';

export function executeReleaseVerification(
  appMode: ProductionAppMode = 'DEMONSTRATION'
): ReleaseVerificationResult {
  const manifest = generateReleaseManifest(appMode);
  const checklist = evaluateReleaseChecklist();
  const demoScenarios = generateDemonstrationScenarios();

  const checklistPassedCount = checklist.filter((item) => item.passed).length;
  const checklistTotalCount = checklist.length;

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (checklistPassedCount < checklistTotalCount) {
    const failedItems = checklist.filter((item) => !item.passed).map((i) => i.description);
    blockers.push(`Release checklist has ${checklistTotalCount - checklistPassedCount} unfulfilled checks: ${failedItems.join('; ')}`);
  }

  if (manifest.realFieldConnectivityStatus === 'NOT_CONNECTED_DISCONNECTED') {
    warnings.push('Physical SCADA endpoint is DISCONNECTED. Real-field live stream is unavailable (SIMULATED and REPLAY modes active).');
  }

  const isReleaseReady = blockers.length === 0;

  const freezeId = `${isReleaseReady ? 'FREEZE' : 'REVIEW'}-BW-${Date.now()}`;
  const timestamp = new Date().toISOString();

  return {
    isReleaseReady,
    manifest,
    checklistPassedCount,
    checklistTotalCount,
    demoScenariosCount: demoScenarios.length,
    blockers,
    warnings,
    freezeRecord: {
      freezeId,
      timestamp,
      authorizedRole: isReleaseReady ? 'Lead Digital Twin Systems Engineer & Operations Lead' : 'NOT AUTHORIZED — RELEASE BLOCKED',
      freezeStatement: isReleaseReady
        ? 'FINAL SOFTWARE FREEZE CERTIFICATE: Step 5 engineering model logic, Step 6.1 field integration layer, and Step 6.2 production deployment package are verified regression-clean, fully documented, and frozen under advisory-only safety governance.'
        : `NO RELEASE FREEZE: ${blockers.join(' ')}`,
    },
  };
}
