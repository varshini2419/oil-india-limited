import React from 'react';
import { useAnimation } from './AnimationController';
import { WELL_LAYOUT_CONFIG } from '../config';

export const ProductionFlowAnimation: React.FC = () => {
  const { isPlaying, progress } = useAnimation();
  const { wellCenterX, surfaceY, pumpTopY } = WELL_LAYOUT_CONFIG;
  const flowX = wellCenterX + 20;

  if (!isPlaying) return null;

  // 6 particles rising along tubing (pumpTopY -> surfaceY - 60)
  const particles = [0, 0.16, 0.33, 0.5, 0.66, 0.83].map((offset) => {
    const p = (progress + offset) % 1;
    const y = pumpTopY - p * (pumpTopY - (surfaceY - 60));
    return { x: flowX, y, opacity: p < 0.1 ? p * 10 : (1 - p) };
  });

  return (
    <g id="anim-production-flow" className="production-flow-animation-group pointer-events-none">
      {particles.map((pt, idx) => (
        <circle
          key={`prod-anim-${idx}`}
          cx={pt.x}
          cy={pt.y}
          r="4.5"
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="1"
          opacity={pt.opacity * 0.95}
        />
      ))}
    </g>
  );
};
