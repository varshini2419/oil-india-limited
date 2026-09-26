import React from 'react';
import { useAnimation } from './AnimationController';
import { WELL_LAYOUT_CONFIG } from '../config';

export const SuckerRodAnimation: React.FC = () => {
  const { strokeOffset } = useAnimation();
  const { suckerRodX, suckerRodTopY, suckerRodBottomY, suckerRodWidth } = WELL_LAYOUT_CONFIG;

  // Render dynamic animated sucker rod string overlaid over neutral position
  return (
    <g
      id="anim-sucker-rod"
      className="sucker-rod-animation-group"
      transform={`translate(0, ${strokeOffset})`}
    >
      {/* Dynamic Sucker Rod Highlighting Line */}
      <line
        x1={suckerRodX}
        y1={suckerRodTopY - 10}
        x2={suckerRodX}
        y2={suckerRodBottomY}
        stroke="#38bdf8"
        strokeWidth={suckerRodWidth + 1}
        opacity="0.9"
      />

      {/* Dynamic Polish Rod Bridle Connector Top */}
      <circle cx={suckerRodX} cy={suckerRodTopY - 10} r="4" fill="#38bdf8" />
    </g>
  );
};
