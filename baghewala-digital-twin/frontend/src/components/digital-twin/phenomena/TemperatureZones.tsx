import React from 'react';
import { useScenarioStore } from '../../../simulation/scenario';

interface TemperatureZonesProps {
  temperatureState?: string;
}

export const TemperatureZones: React.FC<TemperatureZonesProps> = () => {
  const { committedSimulationResult } = useScenarioStore();
  const thermalResult = committedSimulationResult.thermal;

  const {
    baselineReservoirTemperatureC,
    predictedReservoirTemperatureC,
    temperatureChangeC,
    thermalState,
    confidence,
    modelType,
  } = thermalResult;

  const changeText = temperatureChangeC >= 0 ? `+${temperatureChangeC}°C` : `${temperatureChangeC}°C`;

  // Thermal state color map
  const stateColors: Record<string, string> = {
    COOL: '#38bdf8',
    BASELINE: '#94a3b8',
    WARMING: '#f59e0b',
    HOT: '#f97316',
    HIGH_THERMAL_RESPONSE: '#ef4444',
  };

  const stateColor = stateColors[thermalState] || '#f59e0b';

  return (
    <g id="component-temperature-zones" className="temperature-zones-group">
      {/* Thermal Model Readout Panel */}
      <g transform="translate(930, 740)">
        <rect
          x="0"
          y="0"
          width="240"
          height="125"
          fill="#090d16"
          stroke="#1e293b"
          strokeWidth="1.5"
          rx="6"
          opacity="0.95"
        />

        {/* Panel Header */}
        <text
          x="12"
          y="18"
          fill="#38bdf8"
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
        >
          MODELED THERMAL RESPONSE
        </text>

        {/* Baseline & Modeled Values */}
        <text x="12" y="38" fill="#64748b" fontSize="9" fontFamily="monospace">
          BASELINE: <tspan fill="#e2e8f0" fontWeight="bold">{baselineReservoirTemperatureC}°C</tspan>
        </text>

        <text x="12" y="54" fill="#64748b" fontSize="9" fontFamily="monospace">
          MODELED: <tspan fill="#f87171" fontWeight="bold">{predictedReservoirTemperatureC}°C</tspan>
          <tspan fill={temperatureChangeC > 0 ? '#34d399' : '#94a3b8'} fontWeight="bold"> ({changeText})</tspan>
        </text>

        {/* State Badge */}
        <text x="12" y="72" fill="#64748b" fontSize="9" fontFamily="monospace">
          THERMAL STATE: <tspan fill={stateColor} fontWeight="bold">{thermalState.replace('_', ' ')}</tspan>
        </text>

        {/* Model Type */}
        <text x="12" y="88" fill="#64748b" fontSize="8" fontFamily="monospace">
          MODEL: <tspan fill="#94a3b8">{modelType}</tspan>
        </text>

        {/* Confidence */}
        <text x="12" y="104" fill="#64748b" fontSize="8" fontFamily="monospace">
          CONFIDENCE: <tspan fill={confidence === 'HIGH' ? '#34d399' : confidence === 'MEDIUM' ? '#fbbf24' : '#f87171'} fontWeight="bold">{confidence}</tspan>
          <tspan fill="#475569"> [MODELED / PREDICTED]</tspan>
        </text>
      </g>
    </g>
  );
};
