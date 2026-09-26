import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ANIMATION_CONFIG } from '../config';
import { useScenarioStore } from '../../../simulation/scenario/scenarioStore';

export type AnimationSpeedMode = 'slow' | 'normal' | 'fast';

export interface AnimationContextType {
  isPlaying: boolean;
  speed: AnimationSpeedMode;
  strokeOffset: number; // Vertical Y offset in pixels (-amplitude to +amplitude)
  walkingBeamAngle: number; // Angle in degrees for surface walking beam rocking
  progress: number; // Continuous time progress scalar (0 to 1 cycle progress)
  activeSpm: number;
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

  let activeSpm = 8.5;
  try {
    const store = useScenarioStore();
    if (store && store.activeScenario && store.activeScenario.inputs) {
      activeSpm = store.activeScenario.inputs.spm;
    }
  } catch {
    // Fallback if rendered outside ScenarioProvider
  }

  // Safely clamp physical SPM between 1.0 and 30.0 SPM
  const clampedSpm = Math.max(1.0, Math.min(30.0, activeSpm));
  // Dynamic stroke cycle duration derived from physical SPM (at nominal 8.5 SPM = 2400ms)
  const baseCycleDurationMs = (8.5 / clampedSpm) * ANIMATION_CONFIG.baseCycleDurationMs;

  const speedMultiplier = ANIMATION_CONFIG.speeds[speed];
  const cycleDurationMs = Math.max(400, Math.min(12000, baseCycleDurationMs / speedMultiplier));
  const amplitude = ANIMATION_CONFIG.visualStrokeAmplitude;

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

      setStrokeOffset(currentOffset);
      setWalkingBeamAngle(currentAngle);
      setProgress(currentProgress);
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

  return (
    <AnimationContext.Provider
      value={{
        isPlaying,
        speed,
        strokeOffset,
        walkingBeamAngle,
        progress,
        activeSpm: clampedSpm,
        play,
        pause,
        reset,
        setSpeed,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};
