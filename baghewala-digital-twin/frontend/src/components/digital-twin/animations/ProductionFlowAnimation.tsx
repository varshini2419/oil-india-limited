import React from 'react';
import { useAnimation } from './AnimationController';
import { WELL_LAYOUT_CONFIG } from '../config';
import { useScenarioStore } from '../../../simulation/scenario/scenarioStore';

export const ProductionFlowAnimation: React.FC = () => {
  const { isPlaying, progress } = useAnimation();
  const { wellCenterX, surfaceY, pumpTopY } = WELL_LAYOUT_CONFIG;
  const flowX = wellCenterX + 20;

  let estimatedProductionBopd = 0.69;
  let waterCutPercent = 20.0;

  try {
    const store = useScenarioStore();
    if (store && store.committedSimulationResult) {
      estimatedProductionBopd = store.committedSimulationResult.production.estimatedProductionBopd;
      waterCutPercent = store.committedSimulationResult.inputs.waterCutPercent;
    }
  } catch {
    // Fallback if rendered outside ScenarioProvider
  }

  if (!isPlaying) return null;

  // Map calculated production (0.1 to 5.0+ BOPD) to particle count (2 to 12)
  const count = Math.max(2, Math.min(12, Math.round(2 + (estimatedProductionBopd / 0.35))));
  const waterFraction = Math.max(0, Math.min(1.0, waterCutPercent / 100.0));

  const particles = Array.from({ length: count }, (_, idx) => {
    const offset = idx / count;
    const p = (progress + offset) % 1;
    const y = pumpTopY - p * (pumpTopY - (surfaceY - 60));
    // Determine whether this particle represents water cut or oil fraction
    const isWater = (idx / count) < waterFraction;
    return {
      x: flowX,
      y,
      opacity: p < 0.1 ? p * 10 : (1 - p),
      isWater,
    };
  });

  return (
    <g id="anim-production-flow" className="production-flow-animation-group pointer-events-none">
      {particles.map((pt, idx) => (
        <circle
          key={`prod-anim-${idx}`}
          cx={pt.x}
          cy={pt.y}
          r="4.5"
          fill={pt.isWater ? '#38bdf8' : '#fbbf24'}
          stroke={pt.isWater ? '#0284c7' : '#d97706'}
          strokeWidth="1"
          opacity={pt.opacity * 0.95}
        />
      ))}
    </g>
  );
};
