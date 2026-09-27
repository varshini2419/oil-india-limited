import type {
  IngestionConfig,
  IngestionResult,
  NormalizedTelemetryRecord,
  RawTelemetryInput,
  FieldDataBackendAdapter,
} from './types';
import { DEFAULT_INGESTION_CONFIG, FIELD_DATA_DISCLAIMER } from './defaults';
import { validateRawDatasetPayload, validateTelemetryRecordSchema } from './schemaValidator';
import { normalizeTelemetryUnits } from './unitNormalizer';
import { handleMissingValues } from './missingValueHandler';
import { detectAndClassifyOutliers } from './outlierDetector';
import { computeDataQualityReport } from './qualityEngine';
import { mapTelemetryToDigitalTwinState } from './telemetryMapper';
import type { DigitalTwinState } from '../realtimeMonitoring/types';

export function ingestRawTelemetryPayload(
  payload: string,
  configOverrides?: Partial<IngestionConfig>
): IngestionResult {
  const config: IngestionConfig = {
    ...DEFAULT_INGESTION_CONFIG,
    ...configOverrides,
  };

  const validationResult = validateRawDatasetPayload(payload, config);
  if (!validationResult.isValid || !validationResult.parsedData) {
    return {
      isSuccess: false,
      qualityReport: computeDataQualityReport([], [], [validationResult.error || 'Payload validation failed.']),
      records: [],
      disclaimer: FIELD_DATA_DISCLAIMER,
      error: validationResult.error || 'Payload validation failed.',
    };
  }

  const rawInputs: RawTelemetryInput[] = validationResult.parsedData;
  const normalizedRecords: NormalizedTelemetryRecord[] = [];
  const globalWarnings: string[] = [];
  const globalErrors: string[] = [];

  rawInputs.forEach((raw) => {
    const schemaRes = validateTelemetryRecordSchema(raw);
    const normalized = normalizeTelemetryUnits(raw, config.sourceType);

    if (!schemaRes.isValid) {
      normalized.qualityStatus = 'INVALID';
      normalized.errors.push(...schemaRes.errors);
    }
    if (schemaRes.warnings.length > 0) {
      normalized.warnings.push(...schemaRes.warnings);
    }

    normalizedRecords.push(normalized);
  });

  // Apply Missing Value Policy
  let processedRecords = handleMissingValues(normalizedRecords, config.missingValuePolicy);

  // Apply Outlier Detection
  processedRecords = detectAndClassifyOutliers(processedRecords, config.rejectOutliers);

  // Compute overall Data Quality Report
  const qualityReport = computeDataQualityReport(processedRecords, globalWarnings, globalErrors);

  return {
    isSuccess: qualityReport.overallStatus !== 'INVALID',
    qualityReport,
    records: processedRecords,
    disclaimer: FIELD_DATA_DISCLAIMER,
  };
}

// Telemetry Stream Replay Manager
export class TelemetryStreamReplay {
  private records: NormalizedTelemetryRecord[];
  private currentIndex = 0;
  private isRunning = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private onStateChange: (state: DigitalTwinState, record: NormalizedTelemetryRecord) => void;

  constructor(
    records: NormalizedTelemetryRecord[],
    onStateChange: (state: DigitalTwinState, record: NormalizedTelemetryRecord) => void
  ) {
    this.records = records;
    this.onStateChange = onStateChange;
  }

  public start(intervalMs = 2000) {
    if (this.isRunning || this.records.length === 0) return;
    this.isRunning = true;
    this.timerId = setInterval(() => {
      this.stepForward();
    }, intervalMs);
    if (this.timerId && typeof (this.timerId as any).unref === 'function') {
      (this.timerId as any).unref();
    }
  }

  public pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public reset() {
    this.pause();
    this.currentIndex = 0;
  }

  public stepForward(): boolean {
    if (this.currentIndex >= this.records.length) {
      this.pause();
      return false;
    }

    const currentRecord = this.records[this.currentIndex];
    const twinState = mapTelemetryToDigitalTwinState(currentRecord);
    this.onStateChange(twinState, currentRecord);

    this.currentIndex++;
    if (this.currentIndex >= this.records.length) {
      this.pause();
    }
    return true;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

// Mock Field Data Backend Adapter
export class MockFieldBackendAdapter implements FieldDataBackendAdapter {
  private mockRecords: NormalizedTelemetryRecord[];

  constructor(mockRecords: NormalizedTelemetryRecord[] = []) {
    this.mockRecords = mockRecords;
  }

  public async fetchLatestTelemetry(): Promise<NormalizedTelemetryRecord | null> {
    if (this.mockRecords.length === 0) return null;
    return this.mockRecords[this.mockRecords.length - 1];
  }

  public async fetchTelemetryRange(start: string, end: string): Promise<NormalizedTelemetryRecord[]> {
    return this.mockRecords.filter((r) => r.timestamp >= start && r.timestamp <= end);
  }

  public subscribeToTelemetry(callback: (record: NormalizedTelemetryRecord) => void): () => void {
    let index = 0;
    const interval = setInterval(() => {
      if (index < this.mockRecords.length) {
        callback(this.mockRecords[index]);
        index++;
      }
    }, 2000);
    if (interval && typeof (interval as any).unref === 'function') {
      (interval as any).unref();
    }

    return () => clearInterval(interval);
  }
}
