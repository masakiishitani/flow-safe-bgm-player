/**
 * Flow-Safe BGM Player — Timer hook
 * Anti-Pomodoro: passive elapsed time display, soft chime at 60min,
 * long fade-out starting at 120min over 5 minutes.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { playBell } from "@/lib/bell";

export type TimerPhase = "idle" | "running" | "fading" | "done";

interface UseTimerOptions {
  onFadeStep: (volume: number) => void; // called every second during fade
  initialVolume: number;
}

interface UseTimerReturn {
  phase: TimerPhase;
  elapsedMinutes: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const CHIME_INTERVAL_MS = 60 * 60 * 1000;    // 60 minutes
const FADE_START_MS = 120 * 60 * 1000;        // 120 minutes
const FADE_DURATION_MS = 5 * 60 * 1000;       // 5 minutes

export function useTimer({ onFadeStep, initialVolume }: UseTimerOptions): UseTimerReturn {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chimeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeVolumeRef = useRef(initialVolume);
  const chimeFiredRef = useRef(false);
  const fadeFiredRef = useRef(false);

  const clearAll = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (chimeRef.current) clearInterval(chimeRef.current);
    if (fadeRef.current) clearInterval(fadeRef.current);
    tickRef.current = null;
    chimeRef.current = null;
    fadeRef.current = null;
  }, []);

  const startFade = useCallback((currentVolume: number) => {
    setPhase("fading");
    fadeVolumeRef.current = currentVolume;
    const steps = FADE_DURATION_MS / 1000; // 300 steps
    const decrement = currentVolume / steps;

    fadeRef.current = setInterval(() => {
      fadeVolumeRef.current = Math.max(0, fadeVolumeRef.current - decrement);
      onFadeStep(Math.round(fadeVolumeRef.current));
      if (fadeVolumeRef.current <= 0) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        setPhase("done");
      }
    }, 1000);
  }, [onFadeStep]);

  const start = useCallback(() => {
    clearAll();
    startTimeRef.current = Date.now();
    chimeFiredRef.current = false;
    fadeFiredRef.current = false;
    setPhase("running");
    setElapsedMinutes(0);

    // Update elapsed minutes display every 60 seconds
    tickRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = Date.now() - startTimeRef.current;
      setElapsedMinutes(Math.floor(elapsed / 60000));

      // Check for chime (60 min)
      if (!chimeFiredRef.current && elapsed >= CHIME_INTERVAL_MS) {
        chimeFiredRef.current = true;
        playBell();
      }

      // Check for fade start (120 min)
      if (!fadeFiredRef.current && elapsed >= FADE_START_MS) {
        fadeFiredRef.current = true;
        clearAll();
        startFade(fadeVolumeRef.current);
      }
    }, 60000);

    // Also check every second for fade trigger accuracy
    const precisionRef = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = Date.now() - startTimeRef.current;
      if (!fadeFiredRef.current && elapsed >= FADE_START_MS) {
        fadeFiredRef.current = true;
        clearInterval(precisionRef);
        clearAll();
        startFade(fadeVolumeRef.current);
      }
    }, 1000);

    // Store precision interval in chimeRef for cleanup
    chimeRef.current = precisionRef;
  }, [clearAll, startFade]);

  const stop = useCallback(() => {
    clearAll();
    setPhase("idle");
    startTimeRef.current = null;
  }, [clearAll]);

  const reset = useCallback(() => {
    clearAll();
    setPhase("idle");
    setElapsedMinutes(0);
    startTimeRef.current = null;
    chimeFiredRef.current = false;
    fadeFiredRef.current = false;
  }, [clearAll]);

  // Sync initial volume ref when prop changes
  useEffect(() => {
    if (phase === "idle") {
      fadeVolumeRef.current = initialVolume;
    }
  }, [initialVolume, phase]);

  // Cleanup on unmount
  useEffect(() => () => clearAll(), [clearAll]);

  return { phase, elapsedMinutes, start, stop, reset };
}
