import type {
  NormalizedFieldTelemetryRecord,
  QualityGateResult,
  QualityGateStatus,
  TelemetryFreshness,
  TelemetryMode,
} from './types';
import {
  PHYSICAL_BOUNDARIES,
  STALE_TELEMETRY_THRESHOLD_SECONDS,
  OFFLINE_TELEMETRY_THRESHOLD_SECONDS,
} from './defaults';
import { evaluateTelemetryAgeSeconds, checkFreshnessStatus } from './telemetryConnectionEngine';

export function evaluateLiveDataQuality(
  record: NormalizedFieldTelemetryRecord | null,
  options: { mode?: TelemetryMode; lastReceivedAt?: string; nowIso?: string } = {}
): QualityGateResult {
  if (!record) {
    return {
      status: 'REJECTED',
      qualityScore: 0,
      freshness: 'OFFLINE',
      ageSeconds: 999999,
      schemaValid: false,
      timestampValid: false,
      unitValid: false,
      completenessPercent: 0,
      missingFields: [
        'temperature',
        'pressure',
        'productionBopd',
        'viscosity',
        'vfdFrequencyHz',
        'spm',
        'strokeLengthMeters',
      ],
      rangeViolations: [],
      outliers: [],
      rejectionReasons: ['No telemetry record received (connection disconnected or empty payload)'],
      warnings: ['Telemetry stream is disconnected or unconfigured.'],
    };
  }

  const rejectionReasons: string[] = [];
  const rangeViolations: string[] = [];
  const outliers: string[] = [];
  const warnings: string[] = [...record.warnings];
  const missingFields = [...record.missingFields];

  // 1. Evaluate Freshness
  const ageSeconds = evaluateTelemetryAgeSeconds(record.timestamp, options.nowIso);
  const freshness: TelemetryFreshness = checkFreshnessStatus(ageSeconds);

  if (freshness === 'STALE') {
    warnings.push(
      `Telemetry timestamp is stale (${ageSeconds}s old; exceeds configured software threshold ${STALE_TELEMETRY_THRESHOLD_SECONDS}s). LIVE DATA STATUS -> STALE.`
    );
  } else if (freshness === 'OFFLINE') {
    rejectionReasons.push(
      `Telemetry timestamp is offline (${ageSeconds}s old; exceeds maximum allowed offline threshold ${OFFLINE_TELEMETRY_THRESHOLD_SECONDS}s).`
    );
  }

  // 2. Evaluate Schema & Timestamp
  const timestampValid = !isNaN(new Date(record.timestamp).getTime());
  if (!timestampValid) {
    rejectionReasons.push(`Invalid timestamp string '${record.timestamp}'.`);
  }

  const schemaValid = Boolean(record.wellId && record.timestamp && timestampValid);

  // 3. Evaluate Physical Boundaries & Outliers
  const checkBounds = (val: number | null, key: keyof typeof PHYSICAL_BOUNDARIES, label: string) => {
    if (val === null) return;
    if (isNaN(val) || !isFinite(val)) {
      rejectionReasons.push(`${label} value '${val}' is NaN or Infinity.`);
      return;
    }

    const bounds = PHYSICAL_BOUNDARIES[key];
    if (val < bounds.min || val > bounds.max) {
      const msg = `${label} (${val} ${bounds.unit}) is outside physical model boundaries [${bounds.min}, ${bounds.max}].`;
      rangeViolations.push(msg);

      // Extreme physical violations trigger rejection
      if (val < 0 && key !== 'temperatureC') {
        rejectionReasons.push(`Physically impossible negative value for ${label}: ${val}`);
      } else if (val > bounds.max * 1.5) {
        outliers.push(`Extreme upper outlier for ${label}: ${val}`);
        rejectionReasons.push(`Extreme physical violation for ${label}: ${val} > ${bounds.max * 1.5}`);
      } else {
        warnings.push(msg);
      }
    }
  };

  checkBounds(record.temperatureC, 'temperatureC', 'Reservoir Temperature');
  checkBounds(record.pressureBar, 'pressureBar', 'Reservoir Pressure');
  checkBounds(record.productionBopd, 'productionBopd', 'Production Rate');
  checkBounds(record.viscosityCp, 'viscosityCp', 'Oil Viscosity');
  checkBounds(record.vfdFrequencyHz, 'vfdFrequencyHz', 'VFD Frequency');
  checkBounds(record.spm, 'spm', 'Pumping SPM');
  checkBounds(record.strokeLengthMeters, 'strokeLengthMeters', 'Stroke Length');
  checkBounds(record.steamRateTpd, 'steamRateTpd', 'Steam Injection Rate');
  checkBounds(record.steamQuality, 'steamQuality', 'Steam Quality');
  checkBounds(record.waterCutPercent, 'waterCutPercent', 'Water Cut');

  // 4. Calculate Completeness
  const essentialFields = [
    record.temperatureC,
    record.pressureBar,
    record.productionBopd,
    record.viscosityCp,
    record.vfdFrequencyHz,
    record.spm,
    record.strokeLengthMeters,
  ];

  const presentCount = essentialFields.filter((f) => f !== null && !isNaN(f)).length;
  const completenessPercent = Number(((presentCount / essentialFields.length) * 100).toFixed(1));

  if (completenessPercent < 40) {
    warnings.push(`Low telemetry completeness (${completenessPercent}%). Some sensors are NOT_AVAILABLE.`);
  }

  // 5. Compute Quality Score (0 to 100)
  let qualityScore = 100;

  if (!schemaValid) qualityScore -= 40;
  if (freshness === 'STALE') qualityScore -= 20;
  if (freshness === 'OFFLINE') qualityScore -= 60;
  qualityScore -= Math.max(0, 100 - completenessPercent) * 0.3;
  qualityScore -= rangeViolations.length * 10;
  qualityScore -= rejectionReasons.length * 25;
  qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));

  // 6. Determine Final Status
  let status: QualityGateStatus = 'ACCEPTED';
  if (rejectionReasons.length > 0 || qualityScore < 40 || !schemaValid) {
    status = 'REJECTED';
  } else if (warnings.length > 0 || rangeViolations.length > 0 || freshness === 'STALE' || qualityScore < 85) {
    status = 'ACCEPTED_WITH_WARNING';
  }

  return {
    status,
    qualityScore,
    freshness,
    ageSeconds,
    schemaValid,
    timestampValid,
    unitValid: true,
    completenessPercent,
    missingFields,
    rangeViolations,
    outliers,
    rejectionReasons,
    warnings,
  };
}
