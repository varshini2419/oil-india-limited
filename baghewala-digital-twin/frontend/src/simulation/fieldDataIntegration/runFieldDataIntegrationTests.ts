import {
  normalizeTelemetryUnits,
  validateTelemetryRecordSchema,
  validateRawDatasetPayload,
  detectAndClassifyOutliers,
  handleMissingValues,
  computeDataQualityReport,
  mapTelemetryToDigitalTwinState,
  ingestRawTelemetryPayload,
  TelemetryStreamReplay,
  MockFieldBackendAdapter,
  DEFAULT_INGESTION_CONFIG,
} from './index';
import type { RawTelemetryInput, NormalizedTelemetryRecord } from './index';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('====================================================');
console.log('STEP 5.6 — BAGHEWALA FIELD DATA INTEGRATION TEST SUITE');
console.log('====================================================');

// 1. Unit Normalization - Temperature
const tempResC = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 58, reservoirTemperatureUnit: '°C' }, 'REAL_FIELD');
assert(tempResC.reservoirTemperature?.value === 58 && tempResC.reservoirTemperature.unit === '°C' && tempResC.reservoirTemperature.provenance === 'MEASURED', 'Unit Norm: Temp °C');

const tempResF = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 136.4, reservoirTemperatureUnit: '°F' }, 'REAL_FIELD');
assert(Math.abs((tempResF.reservoirTemperature?.value || 0) - 58.0) < 0.1 && tempResF.reservoirTemperature?.unit === '°C', 'Unit Norm: Temp °F to °C');

const tempResK = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 331.15, reservoirTemperatureUnit: 'K' }, 'REAL_FIELD');
assert(Math.abs((tempResK.reservoirTemperature?.value || 0) - 58.0) < 0.1, 'Unit Norm: Temp K to °C');

// 2. Unit Normalization - Pressure
const pressPsi = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirPressure: 1450, reservoirPressureUnit: 'psi' }, 'REAL_FIELD');
assert(Math.abs((pressPsi.reservoirPressure?.value || 0) - 100.0) < 0.5 && pressPsi.reservoirPressure?.unit === 'bar', 'Unit Norm: Pressure psi to bar');

const pressMpa = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirPressure: 9.0, reservoirPressureUnit: 'MPa' }, 'REAL_FIELD');
assert(Math.abs((pressMpa.reservoirPressure?.value || 0) - 90.0) < 0.1, 'Unit Norm: Pressure MPa to bar');

// 3. Unit Normalization - Production & Steam
const prodM3 = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', productionBopd: 15.9, productionUnit: 'm3/day' }, 'HISTORICAL');
assert(Math.abs((prodM3.productionBopd?.value || 0) - 100.0) < 0.5, 'Unit Norm: Production m3/day to BOPD');

const steamKg = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', steamRateTpd: 100000, steamRateUnit: 'kg/day' }, 'HISTORICAL');
assert(Math.abs((steamKg.steamRateTpd?.value || 0) - 100.0) < 0.1, 'Unit Norm: Steam kg/day to TPD');

// 4. Unit Normalization - Stroke Length
const strokeFt = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', strokeM: 9.8425, strokeUnit: 'ft' }, 'USER_IMPORTED');
assert(Math.abs((strokeFt.strokeM?.value || 0) - 3.0) < 0.1, 'Unit Norm: Stroke ft to m');

// 5. Unit Normalization - Missing Unit Fallback
const noUnit = normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 58 }, 'SIMULATED');
assert(noUnit.reservoirTemperature?.provenance === 'UNIT_UNKNOWN' && noUnit.reservoirTemperature.unit === '°C', 'Unit Norm: Absent unit marked UNIT_UNKNOWN');

// 6. Security & Schema Validation - Prototype Pollution
const dangerousRecord: RawTelemetryInput = { timestamp: '2026-09-26T10:00:00Z' } as any;
Object.defineProperty(dangerousRecord, '__proto__', { value: { hacked: true }, enumerable: true, configurable: true });
const secRes = validateTelemetryRecordSchema(dangerousRecord);
assert(!secRes.isValid && secRes.errors[0].includes('Security violation'), 'Schema: Prototype pollution blocked');

// 7. Schema Validation - Timestamp
const badTsRecord: RawTelemetryInput = { timestamp: 'invalid-date-string' };
const tsRes = validateTelemetryRecordSchema(badTsRecord);
assert(!tsRes.isValid && tsRes.errors[0].includes('Malformed timestamp'), 'Schema: Invalid ISO timestamp rejected');

// 8. Schema Validation - Non-numeric & NaN
const badNumRecord: RawTelemetryInput = { timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 'NOT_A_NUMBER' };
const numRes = validateTelemetryRecordSchema(badNumRecord);
assert(!numRes.isValid && numRes.errors[0].includes('non-numeric'), 'Schema: Non-numeric field rejected');

// 9. Schema Validation - Negative value check
const negRecord: RawTelemetryInput = { timestamp: '2026-09-26T10:00:00Z', vfdHz: -10 };
const negRes = validateTelemetryRecordSchema(negRecord);
assert(!negRes.isValid && negRes.errors[0].includes('cannot be negative'), 'Schema: Negative VFD Hz rejected');

// 10. Payload Validation - JSON Array
const jsonPayload = JSON.stringify([
  { timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 58, reservoirTemperatureUnit: '°C', vfdHz: 45, spm: 6, strokeM: 3 },
  { timestamp: '2026-09-26T10:05:00Z', reservoirTemperature: 60, reservoirTemperatureUnit: '°C', vfdHz: 45, spm: 6, strokeM: 3 },
]);
const jsonValRes = validateRawDatasetPayload(jsonPayload, DEFAULT_INGESTION_CONFIG);
assert(jsonValRes.isValid && jsonValRes.parsedData?.length === 2, 'Payload: Valid JSON array parsed');

// 11. Payload Validation - CSV Format
const csvPayload = `timestamp,reservoirTemperature,reservoirTemperatureUnit,vfdHz,spm,strokeM
2026-09-26T10:00:00Z,58,°C,45,6,3
2026-09-26T10:05:00Z,60,°C,48,7,3`;
const csvValRes = validateRawDatasetPayload(csvPayload, DEFAULT_INGESTION_CONFIG);
assert(csvValRes.isValid && csvValRes.parsedData?.length === 2, 'Payload: Valid CSV payload parsed');

// 12. Payload Validation - Invalid Payload
const badPayloadRes = validateRawDatasetPayload('', DEFAULT_INGESTION_CONFIG);
assert(!badPayloadRes.isValid, 'Payload: Empty payload rejected');

// 13. Outlier Detection - Normal Dataset
const normalRecs: NormalizedTelemetryRecord[] = [
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 58, reservoirTemperatureUnit: '°C', reservoirPressure: 90, viscosity: 450, vfdHz: 45, spm: 6, strokeM: 3, productionBopd: 100 }, 'REAL_FIELD'),
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:05:00Z', reservoirTemperature: 59, reservoirTemperatureUnit: '°C', reservoirPressure: 90, viscosity: 450, vfdHz: 45, spm: 6, strokeM: 3, productionBopd: 100 }, 'REAL_FIELD'),
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:10:00Z', reservoirTemperature: 58.5, reservoirTemperatureUnit: '°C', reservoirPressure: 90, viscosity: 450, vfdHz: 45, spm: 6, strokeM: 3, productionBopd: 100 }, 'REAL_FIELD'),
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:15:00Z', reservoirTemperature: 58, reservoirTemperatureUnit: '°C', reservoirPressure: 90, viscosity: 450, vfdHz: 45, spm: 6, strokeM: 3, productionBopd: 100 }, 'REAL_FIELD'),
];
const outlierResNormal = detectAndClassifyOutliers(normalRecs);
assert(outlierResNormal[0].reservoirTemperature?.outlierStatus === 'NORMAL', 'Outliers: Normal values classified NORMAL');

// 14. Outlier Detection - Extreme Outlier
const outlierRecs: NormalizedTelemetryRecord[] = [
  ...normalRecs,
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:20:00Z', reservoirTemperature: 350, reservoirTemperatureUnit: '°C' }, 'REAL_FIELD'),
];
const outlierResExtreme = detectAndClassifyOutliers(outlierRecs);
assert(outlierResExtreme[4].reservoirTemperature?.outlierStatus === 'EXTREME_OUTLIER', 'Outliers: Extreme spike classified EXTREME_OUTLIER');

// 15. Outlier Detection - Reject Outliers Option
const rejectedOutliers = detectAndClassifyOutliers(outlierRecs, true);
assert(rejectedOutliers[4].qualityStatus === 'INVALID', 'Outliers: Extreme outlier record rejected under rejectOutliers option');

// 16. Missing Value Handling - LINEAR_INTERPOLATION
const missingRecs: NormalizedTelemetryRecord[] = [
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 50, reservoirTemperatureUnit: '°C' }, 'REAL_FIELD'),
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:05:00Z' }, 'REAL_FIELD'),
  normalizeTelemetryUnits({ timestamp: '2026-09-26T10:10:00Z', reservoirTemperature: 60, reservoirTemperatureUnit: '°C' }, 'REAL_FIELD'),
];
const interpolated = handleMissingValues(missingRecs, 'LINEAR_INTERPOLATION');
assert(interpolated[1].reservoirTemperature?.value === 55 && interpolated[1].reservoirTemperature?.provenance === 'IMPUTED' && interpolated[1].reservoirTemperature?.isImputed === true, 'Missing Values: Linear interpolation computed 55 °C with IMPUTED provenance');

// 17. Missing Value Handling - FORWARD_FILL
const ffilled = handleMissingValues(missingRecs, 'FORWARD_FILL');
assert(ffilled[1].reservoirTemperature?.value === 50 && ffilled[1].reservoirTemperature?.provenance === 'IMPUTED', 'Missing Values: Forward fill computed 50 °C with IMPUTED provenance');

// 18. Missing Value Handling - REJECT_RECORD
const rejectedMissing = handleMissingValues(missingRecs, 'REJECT_RECORD');
assert(rejectedMissing[1].qualityStatus === 'INVALID', 'Missing Values: Missing essential metric rejected under REJECT_RECORD policy');

// 19. Quality Engine - 100% Valid Report
const cleanReport = computeDataQualityReport(normalRecs);
assert(cleanReport.overallStatus === 'VALID' && cleanReport.qualityScore >= 80, 'Quality Engine: Clean dataset scores VALID (score >= 80)');

// 20. Quality Engine - Empty dataset
const emptyReport = computeDataQualityReport([]);
assert(emptyReport.overallStatus === 'INSUFFICIENT_DATA' && emptyReport.qualityScore === 0, 'Quality Engine: Empty dataset reports INSUFFICIENT_DATA');

// 21. Quality Engine - Invalid dataset threshold
const invalidRecs: NormalizedTelemetryRecord[] = normalRecs.map(r => ({ ...r, qualityStatus: 'INVALID' }));
const invalidReport = computeDataQualityReport(invalidRecs);
assert(invalidReport.overallStatus === 'INVALID', 'Quality Engine: Mostly invalid records trigger INVALID report status');

// 22. Telemetry Mapper - Direct state estimation mapping
const sampleRecord = normalizeTelemetryUnits(
  { timestamp: '2026-09-26T10:00:00Z', reservoirTemperature: 65, reservoirTemperatureUnit: '°C', vfdHz: 48, spm: 6.5, strokeM: 3.2 },
  'REAL_FIELD'
);
const twinState = mapTelemetryToDigitalTwinState(sampleRecord);
assert(twinState.reservoir.reservoirTemperatureC === 65 && twinState.srp.vfdFrequencyHz === 48 && twinState.metadata.provenance['Data Source'].includes('REAL FIELD DATA'), 'Telemetry Mapper: Mapped NormalizedTelemetryRecord to DigitalTwinState');

// 23. Ingestion Engine - Full JSON Ingestion Pipeline
const jsonIngestRes = ingestRawTelemetryPayload(jsonPayload, { sourceType: 'USER_IMPORTED' });
assert(jsonIngestRes.isSuccess && jsonIngestRes.records.length === 2 && jsonIngestRes.disclaimer.includes('DATA INGESTION'), 'Ingestion Engine: JSON dataset ingested successfully with disclaimer');

// 24. Ingestion Engine - Full CSV Ingestion Pipeline
const csvIngestRes = ingestRawTelemetryPayload(csvPayload, { sourceType: 'HISTORICAL' });
assert(csvIngestRes.isSuccess && csvIngestRes.records.length === 2, 'Ingestion Engine: CSV dataset ingested successfully');

// 25. Stream Replay - Stepping forward
let replayedCount = 0;
const replay = new TelemetryStreamReplay(jsonIngestRes.records, (_st, _rec) => {
  replayedCount++;
});
replay.stepForward();
assert(replayedCount === 1 && replay.getCurrentIndex() === 1, 'Stream Replay: stepForward advances frame');

replay.stepForward();
assert(replayedCount === 2 && !replay.getIsRunning(), 'Stream Replay: Reaches end of dataset and pauses');

// 26. Mock Backend Adapter - Fetch Latest & Range
const adapter = new MockFieldBackendAdapter(jsonIngestRes.records);
adapter.fetchLatestTelemetry().then(latest => {
  assert(latest?.timestamp === '2026-09-26T10:05:00Z', 'Backend Adapter: fetchLatestTelemetry returns latest record');
});

adapter.fetchTelemetryRange('2026-09-26T10:00:00Z', '2026-09-26T10:05:00Z').then(range => {
  assert(range.length === 2, 'Backend Adapter: fetchTelemetryRange returns range');
});

// Summary
console.log('====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  throw new Error(`Field Data Integration test suite failed with ${failed} failures.`);
}
