import type { TelemetryConnectionInfo, TelemetryConnectionStatus } from './types';
import type { FieldDataSource } from '../fieldDataIntegration/types';

export function evaluateTelemetryConnectionReadiness(
  requestedSource: FieldDataSource = 'HISTORICAL',
  overrideStatus?: TelemetryConnectionStatus
): TelemetryConnectionInfo {
  const timestamp = new Date().toISOString();

  if (overrideStatus) {
    switch (overrideStatus) {
      case 'REAL_FIELD_FEED':
        return {
          status: 'REAL_FIELD_FEED',
          connectionLabel: 'REAL FIELD SCADA TELEMETRY',
          lastTimestamp: timestamp,
          recordCount: 144,
          latencySeconds: 2.5,
          schemaValid: true,
          unitStatus: 'VALIDATED_SI_METRIC',
          provenance: 'MEASURED',
          isSimulated: false,
        };
      case 'TEST_FEED':
        return {
          status: 'TEST_FEED',
          connectionLabel: 'TEST BED FIELD FEED',
          lastTimestamp: timestamp,
          recordCount: 48,
          latencySeconds: 1.0,
          schemaValid: true,
          unitStatus: 'VALIDATED_SI_METRIC',
          provenance: 'MEASURED',
          isSimulated: false,
        };
      case 'SIMULATED':
        return {
          status: 'SIMULATED',
          connectionLabel: 'SIMULATED TELEMETRY FEED',
          lastTimestamp: timestamp,
          recordCount: 100,
          latencySeconds: 0.1,
          schemaValid: true,
          unitStatus: 'SIMULATED_NORMALIZED',
          provenance: 'SIMULATED',
          isSimulated: true,
        };
      case 'DISCONNECTED':
      default:
        return {
          status: 'DISCONNECTED',
          connectionLabel: 'NO TELEMETRY CONNECTION',
          lastTimestamp: '',
          recordCount: 0,
          latencySeconds: 0,
          schemaValid: false,
          unitStatus: 'NOT_AVAILABLE',
          provenance: 'UNIT_UNKNOWN',
          isSimulated: false,
        };
    }
  }

  // Handle standard source types
  if (requestedSource === 'REAL_FIELD') {
    // Real field SCADA feed requires explicit external configuration. Defaults to DISCONNECTED if unconfigured.
    return {
      status: 'DISCONNECTED',
      connectionLabel: 'REAL FIELD SCADA FEED (UNCONFIGURED)',
      lastTimestamp: '',
      recordCount: 0,
      latencySeconds: 0,
      schemaValid: false,
      unitStatus: 'NOT_AVAILABLE',
      provenance: 'UNIT_UNKNOWN',
      isSimulated: false,
    };
  }

  if (requestedSource === 'USER_IMPORTED') {
    return {
      status: 'SIMULATED',
      connectionLabel: 'SIMULATED TELEMETRY FEED',
      lastTimestamp: timestamp,
      recordCount: 60,
      latencySeconds: 0.5,
      schemaValid: true,
      unitStatus: 'SIMULATED_NORMALIZED',
      provenance: 'SIMULATED',
      isSimulated: true,
    };
  }

  // Default: HISTORICAL
  return {
    status: 'SIMULATED',
    connectionLabel: 'HISTORICAL APPRAISAL DATASET',
    lastTimestamp: timestamp,
    recordCount: 50,
    latencySeconds: 0.0,
    schemaValid: true,
    unitStatus: 'HISTORICAL_STANDARDIZED',
    provenance: 'MEASURED',
    isSimulated: false,
  };
}
