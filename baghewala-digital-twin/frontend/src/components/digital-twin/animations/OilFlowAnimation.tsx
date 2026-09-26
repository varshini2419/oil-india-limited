import React from 'react';
import { useAnimation } from './AnimationController';
import { WELL_LAYOUT_CONFIG } from '../config';

export const OilFlowAnimation: React.FC = () => {
  const { isPlaying, progress } = useAnimation();
  const { wellCenterX, casingWidth } = WELL_LAYOUT_CONFIG;
  const leftCasingX = wellCenterX - casingWidth / 2;
  const rightCasingX = wellCenterX + casingWidth / 2;

  if (!isPlaying) return null;

  // Lightweight particle interpolation (8 particles total)
  // Left reservoir inflow particles
  const leftParticles = [0, 0.25, 0.5, 0.75].map((offset) => {
    const p = (progress + offset) % 1;
    // Interpolate along curve (220, 750) -> (leftCasingX, 725)
    const x = 220 + p * (leftCasingX - 220);
    const y = 750 - Math.sin(p * Math.PI) * 20 - p * 25;
    return { x, y, opacity: p < 0.1 ? p * 10 : (1 - p) };
  });

  // Right reservoir inflow particles
  const rightParticles = [0.125, 0.375, 0.625, 0.875].map((offset) => {
    const p = (progress + offset) % 1;
    // Interpolate along curve (980, 750) -> (rightCasingX, 725)
    const x = 980 - p * (980 - rightCasingX);
    const y = 750 - Math.sin(p * Math.PI) * 20 - p * 25;
    return { x, y, opacity: p < 0.1 ? p * 10 : (1 - p) };
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
          opacity={pt.opacity * 0.9}
        />
      ))}

      {rightParticles.map((pt, idx) => (
        <circle
          key={`oil-anim-r-${idx}`}
          cx={pt.x}
          cy={pt.y}
          r="4"
          fill="#fbbf24"
          opacity={pt.opacity * 0.9}
        />
      ))}
    </g>
  );
};
