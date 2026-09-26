import { useState, useEffect, useRef, useCallback } from 'react';

export interface VoiceNarrationState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  activeSectionIndex: number | null; // 0: What, 1: Why, 2: Parameters, 3: Effect
}

export function useVoiceNarration() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);

  const sectionsRef = useRef<string[]>([]);
  const currentIdxRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveSectionIndex(null);
    sectionsRef.current = [];
    currentIdxRef.current = 0;
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const speakSections = useCallback((sections: string[]) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Always stop existing narration stream first
    window.speechSynthesis.cancel();

    sectionsRef.current = sections;
    currentIdxRef.current = 0;
    setIsSpeaking(true);
    setIsPaused(false);

    const speakNext = () => {
      const idx = currentIdxRef.current;
      if (idx >= sectionsRef.current.length) {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveSectionIndex(null);
        return;
      }

      setActiveSectionIndex(idx);

      const utterance = new SpeechSynthesisUtterance(sectionsRef.current[idx]);
      utterance.rate = 1.0; // Clear natural pace
      utterance.pitch = 1.0;

      utterance.onend = () => {
        currentIdxRef.current += 1;
        speakNext();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        currentIdxRef.current += 1;
        speakNext();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    activeSectionIndex,
    speakSections,
    pause,
    resume,
    stop
  };
}
