import React from 'react';
import { useScenarioStore } from '../../../simulation/scenario';

export const PhenomenaMarkers: React.FC = () => {
  const { committedSimulationResult } = useScenarioStore();
  const {
    mobility: mobilityResult,
    viscosity: viscosityResult,
    production: productionResult,
    srp: srpOptimizationResult,
    css: cssOptimizationResult,
    risk: aiRiskResult,
    inputs,
  } = committedSimulationResult;

  return (
    <g id="component-phenomena-markers" className="phenomena-markers-group pointer-events-none">
      {/* Marker 000: AI Risk Level Readout Badge (Step 4.9) */}
      <g transform="translate(420, 15)">
        <rect
          x="0"
          y="0"
          width="180"
          height="30"
          fill={aiRiskResult?.riskLevel === 'LOW' ? '#022c22' : aiRiskResult?.riskLevel === 'MODERATE' ? '#451a03' : '#450a0a'}
          stroke={aiRiskResult?.riskLevel === 'LOW' ? '#10b981' : aiRiskResult?.riskLevel === 'MODERATE' ? '#f59e0b' : '#ef4444'}
          strokeWidth="1"
          rx="4"
          opacity="0.95"
        />
        <text
          x="8"
          y="12"
          fill={aiRiskResult?.riskLevel === 'LOW' ? '#34d399' : aiRiskResult?.riskLevel === 'MODERATE' ? '#fbbf24' : '#fca5a5'}
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="monospace"
        >
          AI RISK LEVEL: {aiRiskResult?.riskLevel ?? 'LOW'} ({aiRiskResult?.riskScore ?? 0}/100)
        </text>
        <text
          x="8"
          y="23"
          fill="#94a3b8"
          fontSize="8"
          fontFamily="monospace"
        >
          ISSUES: {aiRiskResult?.detectedIssues.length ?? 0} DETECTED | {aiRiskResult?.confidence ?? 'Model-based'}
        </text>
      </g>
      {/* Marker 00: CSS Cycle & Phase Readout Badge (Step 4.8) */}
      <g transform="translate(180, 15)">
        <rect
          x="0"
          y="0"
          width="200"
          height="30"
          fill="#450a0a"
          stroke="#f87171"
          strokeWidth="1"
          rx="4"
          opacity="0.95"
        />
        <text
          x="8"
          y="12"
          fill="#fca5a5"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="monospace"
        >
          CSS CYCLE 1: {cssOptimizationResult?.currentCandidate.activePhase ?? 'PRODUCTION'} PHASE
        </text>
        <text
          x="8"
          y="23"
          fill="#fecdd3"
          fontSize="8"
          fontFamily="monospace"
        >
          STEAM: {cssOptimizationResult?.currentCandidate.steamVolumeTons ?? 400}T ({cssOptimizationResult?.currentCandidate.steamInjectionRateTpd ?? 80} TPD)
        </text>
      </g>
      {/* Marker 0: SRP Mode Readout Badge (Step 4.7) */}
      <g transform="translate(680, 220)">
        <rect
          x="0"
          y="0"
          width="170"
          height="32"
          fill="#022c22"
          stroke="#10b981"
          strokeWidth="1"
          rx="4"
          opacity="0.95"
        />
        <text
          x="8"
          y="12"
          fill="#34d399"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="monospace"
        >
          SRP MODE: {srpOptimizationResult?.currentCandidate.spm ?? 8} SPM | {srpOptimizationResult?.currentCandidate.vfdFrequencyHz ?? 45} Hz
        </text>
        <text
          x="8"
          y="24"
          fill="#a7f3d0"
          fontSize="8"
          fontFamily="monospace"
        >
          LOAD: {srpOptimizationResult?.currentCandidate.loadIndex ?? 50}/100 | <tspan fill="#38bdf8">{srpOptimizationResult?.status ?? 'NORMAL'}</tspan>
        </text>
      </g>
      {/* Marker 1: Steam Input Callout Badge */}
      <g transform="translate(180, 50)">
        <rect
          x="0"
          y="0"
          width="150"
          height="22"
          fill="#450a0a"
          stroke="#ef4444"
          strokeWidth="1"
          rx="11"
        />
        <circle cx="11" cy="11" r="5" fill="#ef4444" />
        <text
          x="82"
          y="15"
          fill="#fca5a5"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          ● STEAM INJECTION
        </text>
      </g>

      {/* Marker 2: Production Upflow Callout Badge & Step 4.6 Estimated Production Indicator */}
      <g transform="translate(680, 260)">
        <rect
          x="0"
          y="0"
          width="145"
          height="22"
          fill="#0c4a6e"
          stroke="#38bdf8"
          strokeWidth="1"
          rx="11"
        />
        <circle cx="11" cy="11" r="5" fill="#38bdf8" />
        <text
          x={80}
          y="15"
          fill="#7dd3fc"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          ▲ UPWARD LIFT
        </text>
      </g>

      {/* Step 4.6 Estimated Production Readout Badge */}
      <g transform="translate(680, 290)">
        <rect
          x="0"
          y="0"
          width="170"
          height="26"
          fill="#032b45"
          stroke="#0284c7"
          strokeWidth="1"
          rx="4"
          opacity="0.9"
        />
        <text
          x="10"
          y="12"
          fill="#7dd3fc"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          EST. PROD: <tspan fill="#38bdf8">{productionResult?.estimatedProductionBopd ?? 0.75} BOPD</tspan>
        </text>
        <text
          x="10"
          y="22"
          fill="#64748b"
          fontSize="7.5"
          fontFamily="monospace"
        >
          MODELED SCREENING ESTIMATE
        </text>
      </g>

      {/* Marker 3: Oil Inflow Callout Badge */}
      <g transform="translate(420, 785)">
        <rect
          x="0"
          y="0"
          width="145"
          height="22"
          fill="#451a03"
          stroke="#f59e0b"
          strokeWidth="1"
          rx="11"
        />
        <circle cx="11" cy="11" r="5" fill="#f59e0b" />
        <text
          x={80}
          y="15"
          fill="#fbbf24"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          ► RESERVOIR INFLOW
        </text>
      </g>

      {/* Marker 4: Dynamic Reservoir Fluid Mobility Indicator (Step 4.5) */}
      <g transform="translate(420, 815)">
        <rect
          x="0"
          y="0"
          width="230"
          height="28"
          fill="#022c22"
          stroke="#10b981"
          strokeWidth="1"
          rx="4"
          opacity="0.9"
        />
        <text
          x="12"
          y="12"
          fill="#34d399"
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          OIL MOBILITY: <tspan fill="#a7f3d0">{mobilityResult?.mobilityDcP ?? 0.0005} D/cP</tspan>
        </text>
        <text
          x="12"
          y="23"
          fill="#64748b"
          fontSize="8"
          fontFamily="monospace"
        >
          VISCOSITY: <tspan fill="#c084fc">{viscosityResult?.estimatedViscosityCp ?? 15000} cP</tspan> | PERM: {inputs?.permeabilityDarcy?.toFixed(1) ?? 2.5} D
        </text>
      </g>
    </g>
  );
};
