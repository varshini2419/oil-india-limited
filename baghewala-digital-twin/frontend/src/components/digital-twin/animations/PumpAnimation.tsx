import React from 'react';
import { useAnimation } from './AnimationController';
import { WELL_LAYOUT_CONFIG } from '../config';

export const PumpAnimation: React.FC = () => {
  const { strokeOffset } = useAnimation();
  const { wellCenterX, pumpTopY } = WELL_LAYOUT_CONFIG;

  return (
    <g
      id="anim-downhole-pump"
      className="pump-animation-group"
      transform={`translate(0, ${strokeOffset})`}
    >
      {/* Dynamic Plunger Body Highlight */}
      <rect
        x={wellCenterX - 21}
        y={pumpTopY + 12}
        width={42}
        height={28}
        fill="#38bdf8"
        opacity="0.85"
        rx="2"
      />

      {/* Traveling Valve Ball Motion Highlight */}
      <circle cx={wellCenterX} cy={pumpTopY + 22} r="5.5" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" />
    </g>
  );
};
