import React from 'react';
import { PHENOMENA_LAYOUT_CONFIG } from '../config';
import { useScenarioStore } from '../../../simulation/scenario';

interface ThermalZoneProps {
  thermalIntensity?: number;
}

export const ThermalZone: React.FC<ThermalZoneProps> = () => {
  const { thermalResult } = useScenarioStore();
  const { thermalZoneCenterX, thermalZoneCenterY, thermalZoneRadiusX, thermalZoneRadiusY } =
    PHENOMENA_LAYOUT_CONFIG;

  const influence = thermalResult ? thermalResult.thermalInfluenceC : 0;
  // Scale plume size from 0.8x (baseline/cool) up to 1.7x (high heat)
  const scaleMultiplier = Math.max(0.8, Math.min(1.7, 1.0 + (influence / 50.0)));
  const rx = thermalZoneRadiusX * scaleMultiplier;
  const ry = thermalZoneRadiusY * scaleMultiplier;

  return (
    <g id="component-thermal-zone" className="thermal-zone-group transition-all duration-500 ease-out">
      <defs>
        {/* Radial Gradient for Thermal Influence Zone */}
        <radialGradient id="thermal-plume-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity={Math.min(0.8, 0.35 + influence / 100)} />
          <stop offset="45%" stopColor="#f97316" stopOpacity={Math.min(0.6, 0.20 + influence / 120)} />
          <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Heated Plume Area */}
      <ellipse
        cx={thermalZoneCenterX}
        cy={thermalZoneCenterY}
        rx={rx}
        ry={ry}
        fill="url(#thermal-plume-gradient)"
        stroke="#f97316"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.9"
        className="transition-all duration-500 ease-out"
      />

      {/* Inner High Heat Steam Soak Core */}
      <ellipse
        cx={thermalZoneCenterX}
        cy={thermalZoneCenterY - 10}
        rx={rx * 0.45}
        ry={ry * 0.55}
        fill="#ef4444"
        opacity={Math.min(0.6, 0.2 + influence / 150)}
        stroke="#ef4444"
        strokeWidth="1"
        strokeDasharray="3 3"
        className="transition-all duration-500 ease-out"
      />

      {/* THERMAL INFLUENCE ZONE Label & Leader Box */}
      <g className="thermal-zone-label">
        <line
          x1={thermalZoneCenterX - 180}
          y1={thermalZoneCenterY - 40}
          x2={thermalZoneCenterX - 280}
          y2={thermalZoneCenterY - 95}
          stroke="#f97316"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        <rect
          x={thermalZoneCenterX - 430}
          y={thermalZoneCenterY - 120}
          width="150"
          height="46"
          fill="#0f172a"
          stroke="#f97316"
          strokeWidth="1"
          rx="4"
          opacity="0.9"
        />

        <text
          x={thermalZoneCenterX - 420}
          y={thermalZoneCenterY - 102}
          fill="#f97316"
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
        >
          THERMAL ZONE ({thermalResult?.thermalState.replace('_', ' ') || 'BASELINE'})
        </text>

        <text
          x={thermalZoneCenterX - 420}
          y={thermalZoneCenterY - 86}
          fill="#cbd5e1"
          fontSize="9"
          fontFamily="monospace"
        >
          Delta: +{influence}°C ({thermalResult?.predictedReservoirTemperatureC}°C)
        </text>
      </g>
    </g>
  );
};
