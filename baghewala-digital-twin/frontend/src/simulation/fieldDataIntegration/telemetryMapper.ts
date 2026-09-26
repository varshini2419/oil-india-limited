import type { NormalizedTelemetryRecord } from './types';
import type { DigitalTwinState } from '../realtimeMonitoring/types';
import type { ScenarioInputValues } from '../scenario/types';
import { estimateDigitalTwinState } from '../realtimeMonitoring/stateEstimator';
import { DATA_SOURCE_LABELS } from './defaults';

export function mapTelemetryToDigitalTwinState(
  record: NormalizedTelemetryRecord
): DigitalTwinState {
  const overrides: Partial<ScenarioInputValues> = {};

  if (record.reservoirTemperature?.value !== undefined) {
    overrides.reservoirTemperatureC = record.reservoirTemperature.value;
  }
  if (record.steamRateTpd?.value !== undefined) {
    overrides.steamInjectionRateTpd = record.steamRateTpd.value;
  }
  if (record.steamQuality?.value !== undefined) {
    overrides.steamQualityPercent = record.steamQuality.value;
  }
  if (record.vfdHz?.value !== undefined) {
    overrides.vfdFrequencyHz = record.vfdHz.value;
  }
  if (record.spm?.value !== undefined) {
    overrides.spm = record.spm.value;
  }
  if (record.strokeM?.value !== undefined) {
    overrides.strokeLengthMeters = record.strokeM.value;
  }

  const baseState = estimateDigitalTwinState(overrides, 'CALIBRATED', record.timestamp);

  // Enhance provenance tracking with Field Data Ingestion Metadata
  const sourceLabel = DATA_SOURCE_LABELS[record.source] || 'UNKNOWN';
  const customProvenance: Record<string, string> = {
    ...baseState.metadata.provenance,
    'Data Source': `${sourceLabel} (${record.source})`,
    'Well ID': record.wellId || 'BG-01',
    'Record ID': record.recordId,
    'Data Quality Status': record.qualityStatus,
    'Reservoir Temp Provenance': record.reservoirTemperature?.provenance || 'DOCUMENTED',
    'SRP VFD Provenance': record.vfdHz?.provenance || 'SCENARIO_INPUT',
    'CSS Steam Provenance': record.steamRateTpd?.provenance || 'SCENARIO_INPUT',
  };

  return {
    ...baseState,
    timestamp: record.timestamp || baseState.timestamp,
    metadata: {
      ...baseState.metadata,
      provenance: customProvenance,
    },
  };
}
