import React, { useState } from 'react';
import { DigitalTwinCanvas } from './DigitalTwinCanvas';
import { DigitalTwinLegend } from './DigitalTwinLegend';
import { DEFAULT_TWIN_CONFIG } from './config';
import {
  AnimationProvider,
  useAnimation,
  type AnimationSpeedMode,
} from './animations';
import { Grid, ZoomIn, ZoomOut, RotateCcw, Eye, Play, Pause, RotateCcw as ResetIcon } from 'lucide-react';

const ViewportToolbar: React.FC<{
  gridVisible: boolean;
  onToggleGrid: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}> = ({ gridVisible, onToggleGrid, zoom, onZoomIn, onZoomOut, onResetZoom }) => {
  const { isPlaying, speed, play, pause, reset, setSpeed, activeSpm } = useAnimation();

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
      {/* Title & Animation Playback Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 mr-1">
          <Eye className="w-4 h-4 text-sky-400" />
          <span className="font-bold hidden sm:inline">2D SCHEMATIC VIEWPORT</span>
        </div>

        {/* Play / Pause / Reset Control Group */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800">
          {!isPlaying ? (
            <button
              onClick={play}
              aria-label="Play Digital Twin animation"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition-colors shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY</span>
            </button>
          ) : (
            <button
              onClick={pause}
              aria-label="Pause Digital Twin animation"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold transition-colors shadow"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE</span>
            </button>
          )}

          <button
            onClick={reset}
            aria-label="Reset Digital Twin animation"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors border border-slate-700"
            title="Reset Animation Positions"
          >
            <ResetIcon className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>

        {/* Active Physical SPM Badge */}
        <div className="px-2.5 py-1 bg-sky-950/60 border border-sky-800/80 rounded text-[11px] font-bold text-sky-300 font-mono">
          {activeSpm} SPM
        </div>

        {/* Animation Speed Selector (Visual multiplier overlay) */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
          <span className="text-[11px] hidden md:inline">Speed Multiplier:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(e.target.value as AnimationSpeedMode)}
            aria-label="Animation speed"
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="slow">SLOW (0.5x)</option>
            <option value="normal">NORMAL (1.0x)</option>
            <option value="fast">FAST (2.0x)</option>
          </select>
        </div>

        {/* Animation Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono border bg-slate-950 border-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span className={isPlaying ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
            Animation: {isPlaying ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Viewport View Controls (Grid & Zoom) */}
      <div className="flex items-center gap-2 font-mono text-xs">
        {/* Grid Toggle Button */}
        <button
          onClick={onToggleGrid}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] border transition-colors ${
            gridVisible
              ? 'bg-sky-950/60 text-sky-300 border-sky-800/80 font-semibold'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid: {gridVisible ? 'ON' : 'OFF'}</span>
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={onZoomOut}
          disabled={zoom <= DEFAULT_TWIN_CONFIG.minZoom}
          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Percentage Display */}
        <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 min-w-[55px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        {/* Zoom In Button */}
        <button
          onClick={onZoomIn}
          disabled={zoom >= DEFAULT_TWIN_CONFIG.maxZoom}
          className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Reset Zoom Button */}
        <button
          onClick={onResetZoom}
          className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const DigitalTwinViewport: React.FC = () => {
  const [gridVisible, setGridVisible] = useState(DEFAULT_TWIN_CONFIG.gridVisible);
  const [zoom, setZoom] = useState(DEFAULT_TWIN_CONFIG.defaultZoom);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, DEFAULT_TWIN_CONFIG.maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, DEFAULT_TWIN_CONFIG.minZoom));
  };

  const handleResetZoom = () => {
    setZoom(DEFAULT_TWIN_CONFIG.defaultZoom);
  };

  return (
    <AnimationProvider>
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-2xl">
        {/* Viewport Control Bar Header */}
        <ViewportToolbar
          gridVisible={gridVisible}
          onToggleGrid={() => setGridVisible(!gridVisible)}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />

        {/* Main SVG Render Area */}
        <div className="relative flex-1 min-h-[480px]">
          <DigitalTwinCanvas gridVisible={gridVisible} zoom={zoom} />
        </div>

        {/* Viewport Footer Bar & Legend */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <DigitalTwinLegend gridVisible={gridVisible} />
        </div>
      </div>
    </AnimationProvider>
  );
};
