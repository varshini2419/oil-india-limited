import React from 'react';

interface DigitalTwinGridProps {
  visible: boolean;
  width?: number;
  height?: number;
  majorStep?: number;
  minorStep?: number;
}

export const DigitalTwinGrid: React.FC<DigitalTwinGridProps> = ({
  visible,
  width = 1200,
  height = 900,
  majorStep = 100,
  minorStep = 20,
}) => {
  if (!visible) return null;

  // Generate grid lines
  const minorGridPaths: string[] = [];
  const majorGridPaths: string[] = [];
  const labels: React.ReactNode[] = [];

  // Vertical lines (X-axis)
  for (let x = 0; x <= width; x += minorStep) {
    if (x % majorStep === 0) {
      majorGridPaths.push(`M ${x} 0 L ${x} ${height}`);
      if (x > 0 && x < width) {
        labels.push(
          <text
            key={`x-${x}`}
            x={x + 3}
            y={12}
            fill="#475569"
            fontSize="10"
            fontFamily="monospace"
          >
            X:{x}
          </text>
        );
      }
    } else {
      minorGridPaths.push(`M ${x} 0 L ${x} ${height}`);
    }
  }

  // Horizontal lines (Y-axis / Depth)
  for (let y = 0; y <= height; y += minorStep) {
    if (y % majorStep === 0) {
      majorGridPaths.push(`M 0 ${y} L ${width} ${y}`);
      if (y > 0 && y < height) {
        labels.push(
          <text
            key={`y-${y}`}
            x={5}
            y={y - 4}
            fill="#475569"
            fontSize="10"
            fontFamily="monospace"
          >
            Y:{y}
          </text>
        );
      }
    } else {
      minorGridPaths.push(`M 0 ${y} L ${width} ${y}`);
    }
  }

  return (
    <g className="digital-twin-grid pointer-events-none select-none">
      {/* Minor Grid Lines */}
      <path
        d={minorGridPaths.join(' ')}
        stroke="#1e293b"
        strokeWidth="0.5"
        strokeDasharray="2 2"
        opacity="0.6"
      />

      {/* Major Grid Lines */}
      <path
        d={majorGridPaths.join(' ')}
        stroke="#334155"
        strokeWidth="1"
        opacity="0.8"
      />

      {/* Axis Center Guide Lines */}
      <line
        x1={width / 2}
        y1={0}
        x2={width / 2}
        y2={height}
        stroke="#38bdf8"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.4"
      />

      {/* Zone Separation Guide Lines */}
      {/* Surface / Wellhead Boundary Y=200 */}
      <line
        x1={0}
        y1={200}
        x2={width}
        y2={200}
        stroke="#38bdf8"
        strokeWidth="1"
        strokeDasharray="6 3"
        opacity="0.3"
      />
      <text x={width - 150} y={192} fill="#38bdf8" fontSize="10" fontFamily="monospace" opacity="0.6">
        [ Surface Boundary Y:200 ]
      </text>

      {/* Wellbore / Reservoir Boundary Y=650 */}
      <line
        x1={0}
        y1={650}
        x2={width}
        y2={650}
        stroke="#f59e0b"
        strokeWidth="1"
        strokeDasharray="6 3"
        opacity="0.3"
      />
      <text x={width - 165} y={642} fill="#f59e0b" fontSize="10" fontFamily="monospace" opacity="0.6">
        [ Reservoir Boundary Y:650 ]
      </text>

      {/* Grid Coordinates Labels */}
      <g className="grid-labels">{labels}</g>
    </g>
  );
};
