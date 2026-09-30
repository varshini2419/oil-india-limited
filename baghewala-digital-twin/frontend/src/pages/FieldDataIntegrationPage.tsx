import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import {
  Database,
  Upload,
  RotateCcw,
  SkipForward,
  AlertTriangle,
  FileText,
  Sliders,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ingestRawTelemetryPayload,
  mapTelemetryToDigitalTwinState,
  DATA_SOURCE_LABELS,
  FIELD_DATA_DISCLAIMER,
} from '../simulation/fieldDataIntegration';
import type {
  FieldDataSource,
  MissingValuePolicy,
  IngestionResult,
} from '../simulation/fieldDataIntegration';
import type { DigitalTwinState } from '../simulation/realtimeMonitoring/types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SAMPLE_BAGHEWALA_PAYLOAD = JSON.stringify(
  [
    {
      timestamp: '2026-09-26T08:00:00Z',
      wellId: 'BG-01',
      reservoirTemperature: 58,
      reservoirTemperatureUnit: '°C',
      reservoirPressure: 90,
      reservoirPressureUnit: 'bar',
      viscosity: 450,
      viscosityUnit: 'cP',
      vfdHz: 45,
      spm: 6,
      strokeM: 3.0,
      steamRateTpd: 100,
      productionBopd: 100,
      productionUnit: 'BOPD',
    },
    {
      timestamp: '2026-09-26T08:15:00Z',
      wellId: 'BG-01',
      reservoirTemperature: 62,
      reservoirTemperatureUnit: '°C',
      reservoirPressure: 90,
      viscosity: 410,
      vfdHz: 48,
      spm: 6.5,
      strokeM: 3.2,
      steamRateTpd: 120,
      productionBopd: 112,
    },
    {
      timestamp: '2026-09-26T08:30:00Z',
      wellId: 'BG-01',
      reservoirTemperature: 68,
      reservoirTemperatureUnit: '°C',
      vfdHz: 50,
      spm: 7.0,
      strokeM: 3.2,
      steamRateTpd: 140,
      productionBopd: 125,
    },
    {
      timestamp: '2026-09-26T08:45:00Z',
      wellId: 'BG-01',
      reservoirTemperature: 75,
      reservoirTemperatureUnit: '°C',
      vfdHz: 50,
      spm: 7.0,
      strokeM: 3.2,
      steamRateTpd: 150,
      productionBopd: 138,
    },
    {
      timestamp: '2026-09-26T09:00:00Z',
      wellId: 'BG-01',
      reservoirTemperature: 80,
      reservoirTemperatureUnit: '°C',
      vfdHz: 52,
      spm: 7.2,
      strokeM: 3.5,
      steamRateTpd: 150,
      productionBopd: 146,
    },
  ],
  null,
  2
);

export const FieldDataIntegrationPage: React.FC = () => {
  useDocumentTitle({
    title: "Data Explorer",
    description:
      "Field data ingestion, unit normalization, data quality gates and pilot readiness.",
  });
  const [sourceType, setSourceType] = useState<FieldDataSource>('HISTORICAL');
  const [missingPolicy, setMissingPolicy] = useState<MissingValuePolicy>('LINEAR_INTERPOLATION');
  const [rejectOutliers, setRejectOutliers] = useState(false);
  const [payloadText, setPayloadText] = useState(SAMPLE_BAGHEWALA_PAYLOAD);

  const [ingestionResult, setIngestionResult] = useState<IngestionResult>(() =>
    ingestRawTelemetryPayload(SAMPLE_BAGHEWALA_PAYLOAD, {
      sourceType: 'HISTORICAL',
      missingValuePolicy: 'LINEAR_INTERPOLATION',
      rejectOutliers: false,
    })
  );

  const [activeRecordIndex, setActiveRecordIndex] = useState(0);
  const [replayState, setReplayState] = useState<DigitalTwinState | null>(() => {
    if (ingestionResult.records.length > 0) {
      return mapTelemetryToDigitalTwinState(ingestionResult.records[0]);
    }
    return null;
  });

  const handleRunIngestion = () => {
    const result = ingestRawTelemetryPayload(payloadText, {
      sourceType,
      missingValuePolicy: missingPolicy,
      rejectOutliers,
    });
    setIngestionResult(result);
    setActiveRecordIndex(0);
    if (result.records.length > 0) {
      setReplayState(mapTelemetryToDigitalTwinState(result.records[0]));
    } else {
      setReplayState(null);
    }
  };

  const handleStepForward = () => {
    if (activeRecordIndex < ingestionResult.records.length - 1) {
      const nextIdx = activeRecordIndex + 1;
      setActiveRecordIndex(nextIdx);
      setReplayState(mapTelemetryToDigitalTwinState(ingestionResult.records[nextIdx]));
    }
  };

  const handleResetReplay = () => {
    setActiveRecordIndex(0);
    if (ingestionResult.records.length > 0) {
      setReplayState(mapTelemetryToDigitalTwinState(ingestionResult.records[0]));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Data Explorer"
          subtitle="Inspect, normalize and validate imported, historical and simulated telemetry before it reaches the live monitoring view."
          badgeText="Data quality"
        />

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">SOURCE:</span>
            <span className="font-bold text-white">{DATA_SOURCE_LABELS[sourceType]}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-950/80 border border-indigo-800 rounded-lg text-xs font-mono font-bold text-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            SCORE: {ingestionResult.qualityReport.qualityScore}/100
          </div>
        </div>
      </div>

      {/* Provenance & Disclaimer Notice */}
      <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed font-mono">
          <span className="font-bold text-amber-400 block mb-1 uppercase tracking-wider">
            Baghewala Field Ingestion & Provenance Policy
          </span>
          {FIELD_DATA_DISCLAIMER}
        </div>
      </div>

      {/* Configuration & Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Ingestion Parameters
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Data Source Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as FieldDataSource)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="HISTORICAL">HISTORICAL APPRAISAL DATA</option>
                <option value="REAL_FIELD">REAL FIELD DATA</option>
                <option value="USER_IMPORTED">USER IMPORTED DATASET</option>
                <option value="SIMULATED">SIMULATED TELEMETRY</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Missing Value Policy</label>
              <select
                value={missingPolicy}
                onChange={(e) => setMissingPolicy(e.target.value as MissingValuePolicy)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="LINEAR_INTERPOLATION">LINEAR INTERPOLATION (IMPUTED)</option>
                <option value="FORWARD_FILL">FORWARD FILL (IMPUTED)</option>
                <option value="KEEP_MISSING">KEEP MISSING</option>
                <option value="REJECT_RECORD">REJECT RECORD ON MISSING</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rejectOutliers}
                  onChange={(e) => setRejectOutliers(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                Reject Extreme Outliers Automatically
              </label>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={handleRunIngestion}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Ingest Payload
              </button>
              <button
                onClick={() => setPayloadText(SAMPLE_BAGHEWALA_PAYLOAD)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-[11px]"
              >
                Reset Sample
              </button>
            </div>
          </div>
        </div>

        {/* Payload Editor Dropzone */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Raw Dataset Payload (JSON / CSV Format)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Max limit: 5,000 records
            </span>
          </div>

          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            placeholder="Paste JSON array or CSV dataset..."
          />
        </div>
      </div>

      {/* Data Quality Report Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Data Quality Audit Report
          </h3>
          <span
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
              ingestionResult.qualityReport.overallStatus === 'VALID'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : ingestionResult.qualityReport.overallStatus === 'PARTIALLY_VALID'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            STATUS: {ingestionResult.qualityReport.overallStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center font-mono text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">QUALITY SCORE</div>
            <div className="text-lg font-bold text-indigo-400 mt-1">
              {ingestionResult.qualityReport.qualityScore}/100
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">TOTAL RECORDS</div>
            <div className="text-lg font-bold text-white mt-1">
              {ingestionResult.qualityReport.recordCount}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">VALID RECORDS</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {ingestionResult.qualityReport.validRecordCount}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">INVALID RECORDS</div>
            <div className="text-lg font-bold text-rose-400 mt-1">
              {ingestionResult.qualityReport.invalidRecordCount}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">COMPLETENESS</div>
            <div className="text-lg font-bold text-cyan-400 mt-1">
              {ingestionResult.qualityReport.completenessPercent}%
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">OUTLIERS DETECTED</div>
            <div className="text-lg font-bold text-amber-400 mt-1">
              {ingestionResult.qualityReport.outlierCount}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[11px]">IMPUTED VALUES</div>
            <div className="text-lg font-bold text-purple-400 mt-1">
              {ingestionResult.qualityReport.missingValueCount}
            </div>
          </div>
        </div>

        {ingestionResult.qualityReport.warnings.length > 0 && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-xs">
            <div className="text-amber-400 font-bold mb-1">Quality Audit Warnings:</div>
            {ingestionResult.qualityReport.warnings.map((w, idx) => (
              <div key={idx} className="text-slate-300 flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Synchronized Twin State Stream Preview */}
      {replayState && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Synchronized Twin Pipeline Preview (Record #{activeRecordIndex + 1} / {ingestionResult.records.length})
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetReplay}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
              <button
                onClick={handleStepForward}
                disabled={activeRecordIndex >= ingestionResult.records.length - 1}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-mono text-xs font-bold flex items-center gap-1"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Step Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">TIMESTAMP</div>
              <div className="text-white font-bold mt-1 text-[11px] truncate">{replayState.timestamp}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">RESERVOIR TEMP</div>
              <div className="text-emerald-400 font-bold mt-1 text-sm">{replayState.reservoir.reservoirTemperatureC} °C</div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">OIL VISCOSITY</div>
              <div className="text-purple-400 font-bold mt-1 text-sm">{replayState.reservoir.estimatedViscosityCp} cP</div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">ESTIMATED PROD</div>
              <div className="text-cyan-400 font-bold mt-1 text-sm">{replayState.production.estimatedProductionBopd} BOPD</div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">SRP LOAD INDEX</div>
              <div className="text-amber-400 font-bold mt-1 text-sm">{replayState.srp.srpLoadIndex}%</div>
            </div>
            <div className="bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">AI RISK LEVEL</div>
              <div className="text-rose-400 font-bold mt-1 text-sm">{replayState.risk.riskLevel}</div>
            </div>
          </div>
        </div>
      )}

      {/* Normalized Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Normalized Ingested Records ({ingestionResult.records.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="p-2">Idx</th>
                <th className="p-2">Timestamp</th>
                <th className="p-2">Well</th>
                <th className="p-2">Source</th>
                <th className="p-2">Status</th>
                <th className="p-2">Temp (°C)</th>
                <th className="p-2">VFD (Hz)</th>
                <th className="p-2">SPM</th>
                <th className="p-2">Stroke (m)</th>
                <th className="p-2">Steam (TPD)</th>
                <th className="p-2">Prod (BOPD)</th>
                <th className="p-2">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {ingestionResult.records.map((rec, idx) => (
                <tr
                  key={rec.recordId}
                  onClick={() => {
                    setActiveRecordIndex(idx);
                    setReplayState(mapTelemetryToDigitalTwinState(rec));
                  }}
                  className={`cursor-pointer hover:bg-slate-800/60 transition-colors ${
                    activeRecordIndex === idx ? 'bg-slate-800/90 font-bold text-white' : ''
                  }`}
                >
                  <td className="p-2 text-slate-400">#{idx + 1}</td>
                  <td className="p-2 text-[11px]">{rec.timestamp}</td>
                  <td className="p-2 text-cyan-300">{rec.wellId}</td>
                  <td className="p-2 text-[10px] text-slate-400">{rec.source}</td>
                  <td className="p-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rec.qualityStatus === 'VALID'
                          ? 'bg-emerald-950 text-emerald-400'
                          : rec.qualityStatus === 'PARTIALLY_VALID'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {rec.qualityStatus}
                    </span>
                  </td>
                  <td className="p-2 text-emerald-300 font-bold">
                    {rec.reservoirTemperature?.value ?? '-'}
                  </td>
                  <td className="p-2 text-slate-300">{rec.vfdHz?.value ?? '-'}</td>
                  <td className="p-2 text-slate-300">{rec.spm?.value ?? '-'}</td>
                  <td className="p-2 text-slate-300">{rec.strokeM?.value ?? '-'}</td>
                  <td className="p-2 text-indigo-300">{rec.steamRateTpd?.value ?? '-'}</td>
                  <td className="p-2 text-cyan-300 font-bold">
                    {rec.productionBopd?.value ?? '-'}
                  </td>
                  <td className="p-2 text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        rec.reservoirTemperature?.provenance === 'MEASURED'
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : rec.reservoirTemperature?.provenance === 'IMPUTED'
                          ? 'bg-purple-900/60 text-purple-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rec.reservoirTemperature?.provenance || 'MEASURED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
