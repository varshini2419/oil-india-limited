import React from 'react';
import { WELL_LAYOUT_CONFIG } from '../config';
import { useScenarioStore } from '../../../simulation/scenario';

interface ProductionFlowPathProps {
  productionIntensity?: number; // Future simulation compatibility prop
}

export const ProductionFlowPath: React.FC<ProductionFlowPathProps> = () => {
  const { wellCenterX, surfaceY, pumpTopY } = WELL_LAYOUT_CONFIG;
  const { committedSimulationResult, isStale } = useScenarioStore();
  const productionRate = committedSimulationResult.production.estimatedProductionBopd;
  const flowIntensity = Math.max(0.25, Math.min(1, productionRate / 3));
  // Tubing inner flowline X coordinate (slightly offset right of sucker rod)
  const flowX = wellCenterX + 20;

  return (
    <g id="component-production-flow-path" className="production-flow-group" opacity={isStale ? 0.45 : flowIntensity}>
      <defs>
        {/* Static Arrow Marker for Production Upflow */}
        <marker
          id="production-upflow-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 9 L 5 0 L 10 9 z" fill="#38bdf8" />
        </marker>
        <marker
          id="production-rightflow-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
        </marker>
      </defs>

      {/* Upward Production Tubing Flow Path (STATIC) */}
      <line
        x1={flowX}
        y1={pumpTopY - 10}
        x2={flowX}
        y2={surfaceY - 60}
        stroke="#38bdf8"
        strokeWidth={1.5 + flowIntensity * 2}
        strokeDasharray="6 4"
        markerEnd="url(#production-upflow-arrow)"
      />

      {/* Static Arrow Indicators along Tubing String */}
      <path
        d={`M ${flowX} 600 L ${flowX} 580`}
        stroke="#38bdf8"
        strokeWidth={2 + flowIntensity * 2}
        markerEnd="url(#production-upflow-arrow)"
      />
      <path
        d={`M ${flowX} 450 L ${flowX} 430`}
        stroke="#38bdf8"
        strokeWidth={2 + flowIntensity * 2}
        markerEnd="url(#production-upflow-arrow)"
      />
      <path
        d={`M ${flowX} 300 L ${flowX} 280`}
        stroke="#38bdf8"
        strokeWidth={2 + flowIntensity * 2}
        markerEnd="url(#production-upflow-arrow)"
      />

      {/* Surface Production Flowline Exit Path (STATIC) */}
      <path
        d={`M ${wellCenterX + 50} ${surfaceY - 60} L ${wellCenterX + 150} ${surfaceY - 60} L ${wellCenterX + 150} ${surfaceY - 20}`}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={2 + flowIntensity * 2}
        strokeDasharray="6 4"
        markerEnd="url(#production-rightflow-arrow)"
      />

      {/* PRODUCTION FLOW Label & Leader Line */}
      <g className="production-flow-label">
        <line
          x1={flowX}
          y1={360}
          x2={flowX - 180}
          y2={360}
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle cx={flowX} cy={360} r="3" fill="#38bdf8" />
        <rect
          x={flowX - 310}
          y={346}
          width={130}
          height={26}
          fill="#0f172a"
          stroke="#38bdf8"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={flowX - 245}
          y={363}
          fill="#7dd3fc"
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          PRODUCTION FLOW
        </text>
      </g>
    </g>
  );
};
