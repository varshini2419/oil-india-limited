import type {
  TelemetryMode,
  TelemetryConnectionStatus,
  TelemetryProvenanceLabel,
  NormalizedFieldTelemetryRecord,
  FieldIntegrationOptions,
} from './types';
import {
  DEFAULT_SIMULATED_TELEMETRY_RAW,
  DEFAULT_REPLAY_TELEMETRY_RAW,
  STALE_TELEMETRY_THRESHOLD_SECONDS,
  OFFLINE_TELEMETRY_THRESHOLD_SECONDS,
} from './defaults';
import { validateAndNormalizeSchema } from './telemetrySchemaEngine';

export interface TelemetryConnectionResult {
  mode: TelemetryMode;
  status: TelemetryConnectionStatus;
  provenanceLabel: TelemetryProvenanceLabel;
  record: NormalizedFieldTelemetryRecord | null;
  connectionError?: string;
}

export function getTelemetryProvenanceLabel(mode: TelemetryMode): TelemetryProvenanceLabel {
  switch (mode) {
    case 'SIMULATED':
      return 'SIMULATED TELEMETRY';
    case 'REPLAY':
      return 'REPLAY TELEMETRY';
    case 'REAL_FIELD':
      return 'REAL FIELD TELEMETRY';
    default:
      return 'UNKNOWN TELEMETRY';
  }
}

export function establishTelemetryConnection(
  options: FieldIntegrationOptions = {}
): TelemetryConnectionResult {
  const mode = options.mode || 'SIMULATED';
  const provenanceLabel = getTelemetryProvenanceLabel(mode);
  const nowIso = options.nowIso || new Date().toISOString();

  if (mode === 'REAL_FIELD') {
    // Check if authentic real field connection parameters are supplied
    const isConnected = Boolean(
      options.realFieldConnected && options.realFieldConfig?.endpointUrl
    );

    if (!isConnected) {
      // NEVER fabricate a live real-field connection when none exists
      return {
        mode: 'REAL_FIELD',
        status: 'NOT_CONNECTED',
        provenanceLabel: 'REAL FIELD TELEMETRY',
        record: null,
        connectionError:
          'No authenticated physical SCADA connection or live field API endpoint configured.',
      };
    }

    // If connected, parse provided custom live telemetry input
    const rawData = options.customTelemetryInput || {};
    const record = validateAndNormalizeSchema(rawData, 'REAL_FIELD', provenanceLabel, nowIso);

    return {
      mode: 'REAL_FIELD',
      status: 'CONNECTED',
      provenanceLabel: 'REAL FIELD TELEMETRY',
      record,
    };
  }

  if (mode === 'REPLAY') {
    const rawData = options.customTelemetryInput || DEFAULT_REPLAY_TELEMETRY_RAW;
    const record = validateAndNormalizeSchema(rawData, 'REPLAY', provenanceLabel, nowIso);

    return {
      mode: 'REPLAY',
      status: 'REPLAYING',
      provenanceLabel: 'REPLAY TELEMETRY',
      record,
    };
  }

  // Default: SIMULATED mode
  const rawData = options.customTelemetryInput || DEFAULT_SIMULATED_TELEMETRY_RAW;
  const record = validateAndNormalizeSchema(rawData, 'SIMULATED', provenanceLabel, nowIso);

  return {
    mode: 'SIMULATED',
    status: 'SIMULATING',
    provenanceLabel: 'SIMULATED TELEMETRY',
    record,
  };
}

export function evaluateTelemetryAgeSeconds(
  recordTimestampIso?: string | null,
  nowIso?: string
): number {
  if (!recordTimestampIso) return 999999;
  const recordTime = new Date(recordTimestampIso).getTime();
  const currentTime = nowIso ? new Date(nowIso).getTime() : Date.now();
  if (isNaN(recordTime) || isNaN(currentTime)) return 999999;
  return Math.max(0, Math.floor((currentTime - recordTime) / 1000));
}

export function checkFreshnessStatus(ageSeconds: number): 'LIVE' | 'STALE' | 'OFFLINE' {
  if (ageSeconds <= STALE_TELEMETRY_THRESHOLD_SECONDS) {
    return 'LIVE';
  }
  if (ageSeconds <= OFFLINE_TELEMETRY_THRESHOLD_SECONDS) {
    return 'STALE';
  }
  return 'OFFLINE';
}
