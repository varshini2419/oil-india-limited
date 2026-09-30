import type { FinalValidationInput, EvidenceItem } from './types';
import { collectAssessmentEvidence } from '../finalEngineeringAssessment/evidenceEngine';

export function summarizeEngineeringEvidence(input?: FinalValidationInput): EvidenceItem[] {
  const assessmentEvidence = collectAssessmentEvidence(input);

  const evidenceItems: EvidenceItem[] = assessmentEvidence.map((e) => ({
    id: e.evidenceId,
    sourceStep: e.sourceStep,
    sourceModule: e.sourceModule,
    description: e.metric,
    value: e.value,
    unit: e.unit,
    provenance: e.provenance as any,
    status: e.status as any,
    limitations: e.limitations,
  }));

  // Add specific Step 5.13 Consolidated Summary Evidence
  const isRealConn = input?.isRealTelemetryConnected ?? false;

  evidenceItems.push({
    id: 'EVD-513-02',
    sourceStep: 'Step 5.13',
    sourceModule: 'finalValidation',
    description: 'Field SCADA Ingestion Telemetry Stream',
    value: isRealConn ? 'CONNECTED' : 'DISCONNECTED',
    unit: 'status',
    status: isRealConn ? 'PASS' : 'PARTIAL',
    provenance: isRealConn ? 'MEASURED' : 'SIMULATED',
    limitations: isRealConn
      ? ['Live telemetry stream active.']
      : ['Physical field SCADA telemetry hardware currently unconnected.'],
  });

  return evidenceItems;
}
