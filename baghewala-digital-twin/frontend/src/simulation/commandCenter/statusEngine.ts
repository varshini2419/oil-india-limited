import type { SubsystemStatus, SubsystemStatusItem } from './types';
import type { RiskLevel } from '../riskEngine/types';

export function evaluateRiskStatus(riskLevel: RiskLevel | undefined): SubsystemStatus {
  switch (riskLevel) {
    case 'LOW':
      return 'NORMAL';
    case 'MODERATE':
      return 'WARNING';
    case 'HIGH':
      return 'HIGH';
    case 'CRITICAL':
      return 'CRITICAL';
    default:
      return 'NOT_AVAILABLE';
  }
}

export function evaluateSRPStatus(loadIndex: number | undefined): SubsystemStatus {
  if (loadIndex === undefined || !Number.isFinite(loadIndex)) return 'NOT_AVAILABLE';
  if (loadIndex > 85.0) return 'CRITICAL';
  if (loadIndex > 75.0) return 'HIGH';
  if (loadIndex > 65.0) return 'WARNING';
  return 'NORMAL';
}

export function evaluateViscosityStatus(viscosityCp: number | undefined): SubsystemStatus {
  if (viscosityCp === undefined || !Number.isFinite(viscosityCp)) return 'NOT_AVAILABLE';
  if (viscosityCp > 10000) return 'CRITICAL';
  if (viscosityCp > 5000) return 'HIGH';
  if (viscosityCp > 2000) return 'WARNING';
  return 'NORMAL';
}

export function evaluateDataQualityStatus(qualityScore: number | undefined): SubsystemStatus {
  if (qualityScore === undefined || !Number.isFinite(qualityScore)) return 'NOT_AVAILABLE';
  if (qualityScore < 50) return 'CRITICAL';
  if (qualityScore < 80) return 'WARNING';
  return 'NORMAL';
}

export function createStatusItem(
  subsystemId: string,
  subsystemName: string,
  metricName: string,
  value: string | number,
  status: SubsystemStatus,
  explanation: string,
  provenance: string,
  stepReference: string
): SubsystemStatusItem {
  return {
    subsystemId,
    subsystemName,
    metricName,
    value,
    status,
    explanation,
    provenance,
    stepReference,
  };
}
