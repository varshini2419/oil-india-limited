import React from 'react';
import { useAnimation } from './AnimationController';
import { WELL_LAYOUT_CONFIG } from '../config';

export const SteamFlowAnimation: React.FC = () => {
  const { isPlaying, progress } = useAnimation();
  const { wellCenterX, surfaceY, casingWidth } = WELL_LAYOUT_CONFIG;
  const leftAnnulusX = wellCenterX - casingWidth / 2 + 25;

  if (!isPlaying) return null;

  // 6 steam particles descending (surfaceY -> 690)
  const particles = [0, 0.16, 0.33, 0.5, 0.66, 0.83].map((offset) => {
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
          r="4"
          fill="#fca5a5"
          stroke="#ef4444"
          strokeWidth="1"
          opacity={pt.opacity * 0.9}
        />
      ))}
    </g>
  );
};
