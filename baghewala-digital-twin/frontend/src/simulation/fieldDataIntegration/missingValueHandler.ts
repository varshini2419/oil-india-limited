import type {
  NormalizedTelemetryRecord,
  MissingValuePolicy,
  TelemetryValue,
} from './types';
import { TARGET_UNITS } from './defaults';

export function handleMissingValues(
  records: NormalizedTelemetryRecord[],
  policy: MissingValuePolicy
): NormalizedTelemetryRecord[] {
  if (records.length === 0 || policy === 'KEEP_MISSING') {
    return records;
  }

  const numericKeys: Array<keyof NormalizedTelemetryRecord> = [
    'reservoirTemperature',
    'reservoirPressure',
    'flowingPressure',
    'viscosity',
    'permeability',
    'steamRateTpd',
    'steamQuality',
    'vfdHz',
    'spm',
    'strokeM',
    'productionBopd',
    'waterCut',
  ];

  if (policy === 'REJECT_RECORD') {
    return records.map((rec) => {
      const essentialKeys: Array<keyof NormalizedTelemetryRecord> = [
        'reservoirTemperature',
        'vfdHz',
        'spm',
        'strokeM',
      ];
      const isMissingEssential = essentialKeys.some(
        (key) => !(rec[key] as TelemetryValue<number> | undefined)?.value
      );

      if (isMissingEssential) {
        return {
          ...rec,
          qualityStatus: 'INVALID',
          errors: [...rec.errors, 'Rejected record due to missing essential operating metrics under REJECT_RECORD policy.'],
        };
      }
      return rec;
    });
  }

  // Deep clone records to mutate safely
  const updatedRecords: NormalizedTelemetryRecord[] = records.map((r) => ({ ...r }));

  numericKeys.forEach((key) => {
    const n = updatedRecords.length;
    const values: (number | null)[] = updatedRecords.map((r) => {
      const valObj = r[key] as TelemetryValue<number> | undefined;
      return valObj && typeof valObj.value === 'number' && !isNaN(valObj.value) ? valObj.value : null;
    });

    if (policy === 'LINEAR_INTERPOLATION') {
      let i = 0;
      while (i < n) {
        if (values[i] === null) {
          // Find prev valid index
          let prevIdx = i - 1;
          while (prevIdx >= 0 && values[prevIdx] === null) prevIdx--;

          // Find next valid index
          let nextIdx = i + 1;
          while (nextIdx < n && values[nextIdx] === null) nextIdx++;

          if (prevIdx >= 0 && nextIdx < n) {
            const prevVal = values[prevIdx]!;
            const nextVal = values[nextIdx]!;
            const fraction = (i - prevIdx) / (nextIdx - prevIdx);
            const interpolated = Number((prevVal + fraction * (nextVal - prevVal)).toFixed(2));

            const targetUnit = (TARGET_UNITS as Record<string, string>)[key] || '';

            (updatedRecords[i][key] as TelemetryValue<number>) = {
              value: interpolated,
              unit: targetUnit,
              provenance: 'IMPUTED',
              isImputed: true,
            };
            updatedRecords[i].warnings.push(`[${String(key)}] Missing value imputed via linear interpolation (${interpolated}).`);
          } else if (prevIdx >= 0) {
            // Forward fill fallback if no future valid value
            const prevVal = values[prevIdx]!;
            const targetUnit = (TARGET_UNITS as Record<string, string>)[key] || '';
            (updatedRecords[i][key] as TelemetryValue<number>) = {
              value: prevVal,
              unit: targetUnit,
              provenance: 'IMPUTED',
              isImputed: true,
            };
          }
        }
        i++;
      }
    } else if (policy === 'FORWARD_FILL') {
      let lastKnownVal: number | null = null;
      let lastKnownUnit = '';

      for (let i = 0; i < n; i++) {
        if (values[i] !== null) {
          lastKnownVal = values[i];
          const valObj = updatedRecords[i][key] as TelemetryValue<number> | undefined;
          if (valObj?.unit) lastKnownUnit = valObj.unit;
        } else if (lastKnownVal !== null) {
          (updatedRecords[i][key] as TelemetryValue<number>) = {
            value: lastKnownVal,
            unit: lastKnownUnit,
            provenance: 'IMPUTED',
            isImputed: true,
          };
          updatedRecords[i].warnings.push(`[${String(key)}] Missing value imputed via forward fill (${lastKnownVal}).`);
        }
      }
    }
  });

  return updatedRecords;
}
