import React from 'react';
import { useAnimation } from './AnimationController';
import { WELL_LAYOUT_CONFIG } from '../config';
import { useScenarioStore } from '../../../simulation/scenario/scenarioStore';

export const SteamFlowAnimation: React.FC = () => {
  const { isPlaying, progress } = useAnimation();
  const { wellCenterX, surfaceY, casingWidth } = WELL_LAYOUT_CONFIG;
  const leftAnnulusX = wellCenterX - casingWidth / 2 + 25;

  let steamRateTpd = 50.0;
  let steamQualityPercent = 75.0;

  try {
    const store = useScenarioStore();
    if (store && store.committedSimulationResult) {
      steamRateTpd = store.committedSimulationResult.inputs.steamInjectionRateTpd;
      steamQualityPercent = store.committedSimulationResult.inputs.steamQualityPercent;
    }
  } catch {
    // Fallback if rendered outside ScenarioProvider
  }

  if (!isPlaying || steamRateTpd <= 0) return null;

  // Map steam rate (0 to 150 TPD) to particle count (2 to 12)
  const count = Math.max(2, Math.min(12, Math.round(2 + (steamRateTpd / 15.0))));
  const radius = 3.0 + (steamQualityPercent / 100.0) * 2.0;

  const particles = Array.from({ length: count }, (_, idx) => {
    const offset = idx / count;
    const p = (progress + offset) % 1;
    const y = surfaceY + p * (690 - surfaceY);
    return { x: leftAnnulusX, y, opacity: p < 0.1 ? p * 10 : (1 - p) };
  });

  return (
    <g id="anim-steam-flow" className="steam-flow-animation-group pointer-events-none">
      {particles.map((pt, idx) => (
        <circle
          key={`steam-anim-${idx}`}
          cx={pt.x}
          cy={pt.y}
          r={radius}
          fill="#fca5a5"
          stroke="#ef4444"
          strokeWidth="1"
          opacity={pt.opacity * 0.9}
        />
      ))}
    </g>
  );
};
