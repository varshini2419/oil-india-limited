import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';

export const HeavyOilZone: React.FC = () => {
  const { wellCenterX, heavyOilTopY, heavyOilBottomY, casingWidth } = WELL_LAYOUT_CONFIG;
  const leftX = wellCenterX - casingWidth / 2 - 16;
  const rightX = wellCenterX + casingWidth / 2 + 16;

  // Generate static oil droplet particle coordinates (STATIC ONLY - NO MOVEMENT)
  const oilDropletsLeft: { x: number; y: number }[] = [];
  const oilDropletsRight: { x: number; y: number }[] = [];

  // Left reservoir oil zone (X: 100 to leftX)
  for (let x = 120; x < leftX - 20; x += 45) {
    for (let y = heavyOilTopY + 20; y < heavyOilBottomY - 10; y += 30) {
      oilDropletsLeft.push({ x: x + ((y % 20) === 0 ? 10 : 0), y });
    }
  }

  // Right reservoir oil zone (X: rightX + 20 to 1080)
  for (let x = rightX + 30; x < 1080; x += 45) {
    for (let y = heavyOilTopY + 20; y < heavyOilBottomY - 10; y += 30) {
      oilDropletsRight.push({ x: x + ((y % 20) === 0 ? 10 : 0), y });
    }
  }

  return (
    <g id="component-heavy-oil-zone" className="heavy-oil-zone-group">
      {/* Heavy-Oil Saturation Layer Bounds - Left */}
      <rect
        x={80}
        y={heavyOilTopY}
        width={leftX - 80}
        height={heavyOilBottomY - heavyOilTopY}
        fill="#451a03"
        opacity="0.6"
        stroke="#9a3412"
        strokeWidth="1.5"
        rx="6"
      />

      {/* Heavy-Oil Saturation Layer Bounds - Right */}
      <rect
        x={rightX}
        y={heavyOilTopY}
        width={1120 - rightX}
        height={heavyOilBottomY - heavyOilTopY}
        fill="#451a03"
        opacity="0.6"
        stroke="#9a3412"
        strokeWidth="1.5"
        rx="6"
      />

      {/* Static Oil Droplet Pattern - Left */}
      {oilDropletsLeft.map((d, idx) => (
        <circle
          key={`oil-l-${idx}`}
          cx={d.x}
          cy={d.y}
          r="4.5"
          fill="#020617"
          stroke="#d97706"
          strokeWidth="1.5"
        />
      ))}

      {/* Static Oil Droplet Pattern - Right */}
      {oilDropletsRight.map((d, idx) => (
        <circle
          key={`oil-r-${idx}`}
          cx={d.x}
          cy={d.y}
          r="4.5"
          fill="#020617"
          stroke="#d97706"
          strokeWidth="1.5"
        />
      ))}

      {/* HEAVY-OIL ZONE Label & Leader Line */}
      <g className="heavy-oil-label">
        <line
          x1={rightX + 80}
          y1={heavyOilTopY + 50}
          x2={rightX + 240}
          y2={heavyOilTopY + 50}
          stroke="#f97316"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={rightX + 80} cy={heavyOilTopY + 50} r="3" fill="#f97316" />
        <rect
          x={rightX + 240}
          y={heavyOilTopY + 34}
          width={150}
          height={30}
          fill="#0f172a"
          stroke="#f97316"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={rightX + 315}
          y={heavyOilTopY + 53}
          fill="#fdba74"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          HEAVY-OIL ZONE
        </text>
      </g>

      {/* Static Oil Representation Legend Note */}
      <text
        x={95}
        y={heavyOilBottomY - 12}
        fill="#fdba74"
        fontSize="9"
        fontFamily="monospace"
      >
        Heavy Oil — Conceptual Representation
      </text>
    </g>
  );
};
