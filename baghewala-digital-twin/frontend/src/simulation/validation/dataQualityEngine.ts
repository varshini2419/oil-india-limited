/**
 * BAGHEWALA DIGITAL TWIN — DATA QUALITY ENGINE
 * 
 * Inspects reference observation datasets for missing values, timestamp anomalies,
 * out-of-bounds physical values, and physically impossible parameter combinations.
 */

import type { FieldObservationRecord } from './demoData';

export interface DataQualityIssue {
  recordId?: string;
  severity: 'WARNING' | 'BLOCKER';
  field: string;
  message: string;
}

export interface DataQualityResult {
  status: 'PASS' | 'WARNING' | 'BLOCKED';
  score: number; // 0 - 100
  totalRecordsChecked: number;
  validRecordsCount: number;
  issues: DataQualityIssue[];
  warningsCount: number;
  blockersCount: number;
  evaluatedAt: string;
}

export function performDataQualityCheck(records: FieldObservationRecord[]): DataQualityResult {
  const issues: DataQualityIssue[] = [];
  const evaluatedAt = new Date().toISOString();

  if (!records || records.length === 0) {
    return {
      status: 'BLOCKED',
      score: 0,
      totalRecordsChecked: 0,
      validRecordsCount: 0,
      issues: [
        {
          severity: 'BLOCKER',
          field: 'dataset',
          message: 'Validation dataset is empty. At least one reference observation record is required.',
        },
      ],
      warningsCount: 0,
      blockersCount: 1,
      evaluatedAt,
    };
  }

  const timestamps = new Set<string>();

  records.forEach((rec, idx) => {
    // 1. Missing / Duplicate Timestamps
    if (!rec.timestamp) {
      issues.push({
        recordId: rec.id,
        severity: 'BLOCKER',
        field: 'timestamp',
        message: `Record ${idx + 1} (${rec.id}) is missing a valid timestamp.`,
      });
    } else if (timestamps.has(rec.timestamp)) {
      issues.push({
        recordId: rec.id,
        severity: 'WARNING',
        field: 'timestamp',
        message: `Duplicate timestamp detected: ${rec.timestamp} on record ${rec.id}.`,
      });
    } else {
      timestamps.add(rec.timestamp);
    }

    // 2. Out-of-Range Reservoir Temperature
    if (rec.reservoirTempC === undefined || rec.reservoirTempC === null || Number.isNaN(rec.reservoirTempC)) {
      issues.push({
        recordId: rec.id,
        severity: 'BLOCKER',
        field: 'reservoirTempC',
        message: `Record ${rec.id}: Reservoir temperature is missing or non-numeric.`,
      });
    } else if (rec.reservoirTempC < 10 || rec.reservoirTempC > 250) {
      issues.push({
        recordId: rec.id,
        severity: 'WARNING',
        field: 'reservoirTempC',
        message: `Record ${rec.id}: Reservoir temp (${rec.reservoirTempC}°C) is outside typical Bikaner-Nagaur basin bounds (10-250°C).`,
      });
    }

    // 3. Out-of-Range Crude Viscosity
    if (rec.crudeViscosityCp === undefined || rec.crudeViscosityCp === null || Number.isNaN(rec.crudeViscosityCp)) {
      issues.push({
        recordId: rec.id,
        severity: 'BLOCKER',
        field: 'crudeViscosityCp',
        message: `Record ${rec.id}: Crude viscosity is missing or non-numeric.`,
      });
    } else if (rec.crudeViscosityCp <= 0) {
      issues.push({
        recordId: rec.id,
        severity: 'BLOCKER',
        field: 'crudeViscosityCp',
        message: `Record ${rec.id}: Non-positive crude viscosity (${rec.crudeViscosityCp} cP) is physically impossible.`,
      });
    }

    // 4. Steam Injection & Temperature Consistency
    if (rec.steamInjectionRateTpd > 0 && rec.steamTemperatureC < 100) {
      issues.push({
        recordId: rec.id,
        severity: 'WARNING',
        field: 'steamTemperatureC',
        message: `Record ${rec.id}: Steam rate is ${rec.steamInjectionRateTpd} TPD but steam temp is ${rec.steamTemperatureC}°C (sub-boiling liquid phase).`,
      });
    }

    // 5. SPM & Production Consistency
    if (rec.spm > 0 && (rec.productionBopd === undefined || rec.productionBopd < 0)) {
      issues.push({
        recordId: rec.id,
        severity: 'WARNING',
        field: 'productionBopd',
        message: `Record ${rec.id}: Pumping SPM active (${rec.spm}) but production observation is missing or negative.`,
      });
    }
  });

  const blockersCount = issues.filter((i) => i.severity === 'BLOCKER').length;
  const warningsCount = issues.filter((i) => i.severity === 'WARNING').length;

  let status: 'PASS' | 'WARNING' | 'BLOCKED' = 'PASS';
  if (blockersCount > 0) {
    status = 'BLOCKED';
  } else if (warningsCount > 0) {
    status = 'WARNING';
  }

  const score = Math.max(0, 100 - (blockersCount * 25 + warningsCount * 10));
  const validRecordsCount = records.length - blockersCount;

  return {
    status,
    score,
    totalRecordsChecked: records.length,
    validRecordsCount,
    issues,
    warningsCount,
    blockersCount,
    evaluatedAt,
  };
}
