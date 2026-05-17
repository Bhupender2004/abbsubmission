// =============================================================================
// useAlarmSound.js — Web Audio API Alarm Sound System
// =============================================================================
// Critical (Red)  → 880Hz high-pitch beeping (fast interval)
// Warning (Orange) → 440Hz lower-pitch beeping (slow interval)
// Info (Green)    → No sound
//
// Silence: blocked when active alarms > 10
// =============================================================================

import { useRef, useCallback, useEffect, useState } from 'react';

const CRITICAL_FREQ = 880;
const WARNING_FREQ = 440;
const CRITICAL_INTERVAL = 800;
const WARNING_INTERVAL = 1500;
const BEEP_DURATION = 250;
const SILENCE_THRESHOLD = 10;

export function useAlarmSound(activeAlarms = []) {
  const audioCtxRef = useRef(null);
  const criticalTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const userActivatedRef = useRef(false);
  const [isSilenced, setIsSilenced] = useState(false);
  const [silenceBlocked, setSilenceBlocked] = useState(false);
  const [soundActive, setSoundActive] = useState(false);

  const criticalCount = activeAlarms.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlarms.filter(a => a.severity === 'warning').length;
  const totalActive = activeAlarms.length;

  // Ensure AudioContext exists and is resumed
  const ensureCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play a single beep
  const playBeep = useCallback((frequency, duration = BEEP_DURATION, volume = 0.25) => {
    try {
      const ctx = ensureCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = frequency > 600 ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
      gain.gain.setValueAtTime(volume, ctx.currentTime + (duration / 1000) * 0.6);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000 + 0.05);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [ensureCtx]);

  // Stop all interval timers
  const stopAllSounds = useCallback(() => {
    if (criticalTimerRef.current) {
      clearInterval(criticalTimerRef.current);
      criticalTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    setSoundActive(false);
  }, []);

  // Start the beeping loops
  const startSounds = useCallback(() => {
    if (!userActivatedRef.current) return;
    stopAllSounds();

    if (criticalCount > 0) {
      playBeep(CRITICAL_FREQ, BEEP_DURATION, 0.3);
      criticalTimerRef.current = setInterval(() => {
        playBeep(CRITICAL_FREQ, BEEP_DURATION, 0.3);
      }, CRITICAL_INTERVAL);
      setSoundActive(true);
    }

    if (warningCount > 0) {
      setTimeout(() => {
        playBeep(WARNING_FREQ, BEEP_DURATION, 0.15);
      }, 300);
      warningTimerRef.current = setInterval(() => {
        playBeep(WARNING_FREQ, BEEP_DURATION, 0.15);
      }, WARNING_INTERVAL);
      setSoundActive(true);
    }
  }, [criticalCount, warningCount, playBeep, stopAllSounds]);

  // Activate audio on first user interaction (browser requirement)
  const activateAudio = useCallback(() => {
    if (userActivatedRef.current) return;
    userActivatedRef.current = true;
    ensureCtx();
    // Play a brief silent tone to unlock audio
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.01);
    } catch (e) {}
    // Now start real sounds if not silenced
    if (!isSilenced && (criticalCount > 0 || warningCount > 0)) {
      startSounds();
    }
  }, [ensureCtx, isSilenced, criticalCount, warningCount, startSounds]);

  // Listen for first user click/keypress to activate audio
  useEffect(() => {
    const handler = () => activateAudio();
    document.addEventListener('click', handler, { once: false });
    document.addEventListener('keydown', handler, { once: false });
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [activateAudio]);

  // React to alarm changes
  useEffect(() => {
    if (!userActivatedRef.current) return;
    if (isSilenced) {
      stopAllSounds();
      return;
    }
    if (criticalCount > 0 || warningCount > 0) {
      startSounds();
    } else {
      stopAllSounds();
    }
    // Don't include startSounds/stopAllSounds in deps to avoid re-trigger loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criticalCount, warningCount, isSilenced]);

  // Silence handler
  const silenceAlarms = useCallback(() => {
    if (totalActive > SILENCE_THRESHOLD) {
      setSilenceBlocked(true);
      setTimeout(() => setSilenceBlocked(false), 4000);
      return false;
    }
    stopAllSounds();
    setIsSilenced(true);
    return true;
  }, [totalActive, stopAllSounds]);

  const unsilence = useCallback(() => {
    setIsSilenced(false);
  }, []);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (criticalTimerRef.current) clearInterval(criticalTimerRef.current);
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return {
    isSilenced,
    silenceBlocked,
    silenceAlarms,
    unsilence,
    soundActive,
    totalActive,
    canSilence: totalActive <= SILENCE_THRESHOLD,
    SILENCE_THRESHOLD,
    activateAudio,
  };
}
