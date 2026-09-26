import React from 'react';
import { useAnimation } from './AnimationController';
import { PHENOMENA_LAYOUT_CONFIG } from '../config';
import { useScenarioStore } from '../../../simulation/scenario/scenarioStore';

export const ThermalPropagationAnimation: React.FC = () => {
  const { isPlaying, progress } = useAnimation();
  const { thermalZoneCenterX, thermalZoneCenterY, thermalZoneRadiusX, thermalZoneRadiusY } =
    PHENOMENA_LAYOUT_CONFIG;

  let influenceC = 0;
  let predictedTempC = 48.0;

  try {
    const store = useScenarioStore();
    if (store && store.thermalResult) {
      influenceC = store.thermalResult.thermalInfluenceC;
      predictedTempC = store.thermalResult.predictedReservoirTemperatureC;
    }
  } catch {
    // Fallback if rendered outside ScenarioProvider
  }

  if (!isPlaying) return null;

  // Scale thermal front radius based on physics thermal influence (+0°C -> 0.75x, +30°C -> 1.5x)
  const thermalScale = Math.max(0.5, Math.min(2.0, 0.75 + influenceC / 35.0));

  // Pulse oscillation on top of physics-derived radius
  const pulseFactor = 1.0 + Math.sin(progress * 2 * Math.PI) * 0.035;
  const opacityFactor = Math.min(0.85, 0.35 + Math.sin(progress * 2 * Math.PI) * 0.15 + influenceC / 100.0);

  const rx = thermalZoneRadiusX * thermalScale * pulseFactor;
  const ry = thermalZoneRadiusY * thermalScale * pulseFactor;

  const strokeColor = predictedTempC >= 75 ? '#ef4444' : predictedTempC >= 55 ? '#f97316' : '#38bdf8';

  return (
    <g id="anim-thermal-propagation" className="thermal-propagation-group pointer-events-none">
      {/* Outer Thermal Front Outline */}
      <ellipse
        cx={thermalZoneCenterX}
        cy={thermalZoneCenterY}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeDasharray="4 4"
        opacity={opacityFactor}
      />

      {/* Inner High-Heat Plume Center */}
      <ellipse
        cx={thermalZoneCenterX}
        cy={thermalZoneCenterY}
        rx={rx * 0.5}
        ry={ry * 0.5}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeDasharray="2 2"
        opacity={opacityFactor * 0.7}
      />
    </g>
  );
};
