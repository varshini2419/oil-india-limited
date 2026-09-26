import React from 'react';
import { useAnimation } from './AnimationController';
import { WELL_LAYOUT_CONFIG } from '../config';

export const PumpingUnitAnimation: React.FC = () => {
  const { walkingBeamAngle } = useAnimation();
  const { wellCenterX, surfaceY } = WELL_LAYOUT_CONFIG;
  // Fulcrum point (Samson Post top)
  const fulcrumX = wellCenterX - 300;
  const fulcrumY = surfaceY - 110;

  return (
    <g id="anim-pumping-unit" className="pumping-unit-animation-group">
      {/* Dynamic Rocking Beam & Horsehead Assembly */}
      <g transform={`rotate(${walkingBeamAngle}, ${fulcrumX}, ${fulcrumY})`}>
        {/* Dynamic Beam Line Highlight */}
        <line
          x1={fulcrumX - 20}
          y1={fulcrumY}
          x2={wellCenterX - 30}
          y2={fulcrumY}
          stroke="#38bdf8"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Dynamic Horsehead Arc Highlight */}
        <path
          d={`M ${wellCenterX - 30} ${fulcrumY} Q ${wellCenterX} ${fulcrumY + 10} ${wellCenterX} ${fulcrumY + 30}`}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="8"
          opacity="0.9"
        />
      </g>
    </g>
  );
};
