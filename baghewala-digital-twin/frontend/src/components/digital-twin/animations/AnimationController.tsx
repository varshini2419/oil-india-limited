import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ANIMATION_CONFIG } from '../config';
import { useScenarioStore } from '../../../simulation/scenario/scenarioStore';

export type AnimationSpeedMode = 'slow' | 'normal' | 'fast';

export interface AnimationContextType {
  isPlaying: boolean;
  speed: AnimationSpeedMode;
  strokeOffset: number; // Vertical Y offset in pixels (-amplitude to +amplitude)
  strokeAmplitude: number;
  walkingBeamAngle: number; // Angle in degrees for surface walking beam rocking
  progress: number; // Continuous time progress scalar (0 to 1 cycle progress)
  activeSpm: number;
  activeStrokeLength: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: AnimationSpeedMode) => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeedState] = useState<AnimationSpeedMode>('normal');
  const [strokeOffset, setStrokeOffset] = useState<number>(0);
  const [walkingBeamAngle, setWalkingBeamAngle] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  let activeSpm = 8.0;
  let activeStrokeLength = 2.5;

  try {
    const store = useScenarioStore();
    if (store && store.committedSimulationResult && store.committedSimulationResult.inputs) {
      activeSpm = store.committedSimulationResult.inputs.spm;
      activeStrokeLength = store.committedSimulationResult.inputs.strokeLengthMeters;
    }
  } catch {
    // Fallback if rendered outside ScenarioProvider
  }

  // Safely clamp physical SPM between 1.0 and 30.0 SPM
  const clampedSpm = Math.max(1.0, Math.min(30.0, activeSpm));
  // One complete visual stroke follows the committed physical SPM value.
  // Keep the configured speed state for API compatibility, but do not let a
  // presentation multiplier override the operating scenario.
  const cycleDurationMs = Math.max(1000, Math.min(60000, 60000 / clampedSpm));
  // Scale visual stroke displacement amplitude by physical stroke length (nominal 2.5m)
  const amplitude = ANIMATION_CONFIG.visualStrokeAmplitude * (Math.max(0.5, Math.min(5.0, activeStrokeLength)) / 2.5);

  const lastStateUpdateRef = useRef<number>(0);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== null) {
      const deltaTime = time - lastTimeRef.current;
      // Increment harmonic phase angle
      const phaseDelta = (deltaTime / cycleDurationMs) * 2 * Math.PI;
      phaseRef.current = (phaseRef.current + phaseDelta) % (2 * Math.PI);

      // Sinusoidal reciprocating stroke offset (-amplitude to +amplitude)
      const currentOffset = Math.sin(phaseRef.current) * amplitude;
      // Synchronized walking beam rocking angle (-6 deg to +6 deg)
      const currentAngle = Math.sin(phaseRef.current) * 6;
      // Normalized progress (0.0 to 1.0)
      const currentProgress = phaseRef.current / (2 * Math.PI);

      // Throttle React state updates to 30 FPS (~33ms) to maintain smooth motion without React VDOM thrashing
      if (time - lastStateUpdateRef.current >= 30) {
        lastStateUpdateRef.current = time;
        setStrokeOffset(currentOffset);
        setWalkingBeamAngle(currentAngle);
        setProgress(currentProgress);
      }
    }

    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [cycleDurationMs, amplitude]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
      lastTimeRef.current = null;
    }

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isPlaying, animate]);

  const play = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const reset = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setIsPlaying(false);
    phaseRef.current = 0;
    lastTimeRef.current = null;
    setStrokeOffset(0);
    setWalkingBeamAngle(0);
    setProgress(0);
  }, []);

  const setSpeed = useCallback((newSpeed: AnimationSpeedMode) => {
    setSpeedState(newSpeed);
  }, []);

  const contextValue: AnimationContextType = useMemo(
    () => ({
      isPlaying,
      speed,
      strokeOffset,
      strokeAmplitude: amplitude,
      walkingBeamAngle,
      progress,
      activeSpm: clampedSpm,
      activeStrokeLength,
      play,
      pause,
      reset,
      setSpeed,
    }),
    [
      isPlaying,
      speed,
      strokeOffset,
      amplitude,
      walkingBeamAngle,
      progress,
      clampedSpm,
      activeStrokeLength,
      play,
      pause,
      reset,
      setSpeed,
    ]
  );

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};
