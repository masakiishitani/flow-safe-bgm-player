/**
 * Flow-Safe BGM Player — Web Audio API bell sound
 * Generates a soft bell tone for the 60-minute soft chime
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/**
 * Play a soft bell tone (sine wave, gentle attack and decay)
 * Duration: ~2 seconds
 */
export function playBell(): void {
  try {
    const ctx = getAudioContext();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Oscillator 1: fundamental
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 2.5);

    // Oscillator 2: harmonic (adds warmth)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now); // E6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 1.8);
  } catch (e) {
    console.warn("Bell sound failed:", e);
  }
}
