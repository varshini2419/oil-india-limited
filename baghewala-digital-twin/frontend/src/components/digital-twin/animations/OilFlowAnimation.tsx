import React from 'react';
import { useAnimation } from './AnimationController';
import { WELL_LAYOUT_CONFIG } from '../config';
import { useScenarioStore } from '../../../simulation/scenario/scenarioStore';

export const OilFlowAnimation: React.FC = () => {
  const { isPlaying, progress } = useAnimation();
  const { wellCenterX, casingWidth } = WELL_LAYOUT_CONFIG;
  const leftCasingX = wellCenterX - casingWidth / 2;
  const rightCasingX = wellCenterX + casingWidth / 2;

  let viscosityCp = 5000;
  let mobilityDcP = 0.0005;

  try {
    const store = useScenarioStore();
    if (store && store.committedSimulationResult) {
      viscosityCp = store.committedSimulationResult.viscosity.estimatedViscosityCp;
      mobilityDcP = store.committedSimulationResult.mobility.mobilityDcP;
    }
  } catch {
    // Fallback if rendered outside ScenarioProvider
  }

  if (!isPlaying) return null;

  // Map oil mobility (0.0001 to 0.002 D/cP) to inflow particle count per side (2 to 6)
  const countPerSide = Math.max(2, Math.min(6, Math.floor(2 + Math.min(4, mobilityDcP * 2500))));
  // Map crude viscosity (500 to 50000 cP) to visual opacity (0.4 to 0.95)
  const baseOpacity = Math.max(0.35, Math.min(0.95, 1.0 - Math.min(0.6, viscosityCp / 80000.0)));

  const leftParticles = Array.from({ length: countPerSide }, (_, idx) => {
    const offset = idx / countPerSide;
    const p = (progress + offset) % 1;
    const x = 220 + p * (leftCasingX - 220);
    const y = 750 - Math.sin(p * Math.PI) * 20 - p * 25;
    return { x, y, opacity: (p < 0.1 ? p * 10 : (1 - p)) * baseOpacity };
  });

  const rightParticles = Array.from({ length: countPerSide }, (_, idx) => {
    const offset = (idx + 0.5) / countPerSide;
    const p = (progress + offset) % 1;
    const x = 980 - p * (980 - rightCasingX);
    const y = 750 - Math.sin(p * Math.PI) * 20 - p * 25;
    return { x, y, opacity: (p < 0.1 ? p * 10 : (1 - p)) * baseOpacity };
  });

  return (
    <g id="anim-oil-flow" className="oil-flow-animation-group pointer-events-none">
      {leftParticles.map((pt, idx) => (
        <circle
          key={`oil-anim-l-${idx}`}
          cx={pt.x}
          cy={pt.y}
          r="4"
          fill="#fbbf24"
          opacity={pt.opacity}
        />
      ))}

      {rightParticles.map((pt, idx) => (
        <circle
          key={`oil-anim-r-${idx}`}
          cx={pt.x}
          cy={pt.y}
          r="4"
          fill="#fbbf24"
          opacity={pt.opacity}
        />
      ))}
    </g>
  );
};
