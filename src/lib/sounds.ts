// Web Audio API to generate sounds without external assets

// Singleton AudioContext
let audioCtx: AudioContext | null = null;

const getCtx = () => {
    if (!audioCtx) {
        const CtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (CtxClass) {
            audioCtx = new CtxClass();
        }
    }
    return audioCtx;
};

// --- SOUND EFFECTS ---

/**
 * Play a magical "Success" chime (Arpeggio: C5, E5, G5, C6)
 * Best for: Quest Completion, Item Get
 */
export const playSuccessSound = () => {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    // C Major Arpeggio frequencies
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sine waves sound smooth and magical
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + (i * 0.04);
        const duration = 0.4;

        // Envelope
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    });
};

/**
 * Play a cute "Pop" sound
 * Best for: Button clicks, Toggles
 */
export const playTapSound = () => {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1); // Pitch drop

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
};

/**
 * Play a "Fanfare" sound
 * Best for: Level Up, Big Reward
 */
export const playFanfareSound = () => {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    // C Major Chord fanfare style
    // Triplet start
    const melody = [
        { freq: 523.25, time: 0, dur: 0.15 }, // C5
        { freq: 523.25, time: 0.15, dur: 0.15 }, // C5
        { freq: 523.25, time: 0.3, dur: 0.15 }, // C5
        { freq: 659.25, time: 0.45, dur: 0.4 }, // E5 (Long)
        { freq: 783.99, time: 0.85, dur: 0.6 }, // G5 (Longer)
        { freq: 1046.50, time: 1.45, dur: 1.0 }, // C6 (Final)
    ];

    melody.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth'; // Brighter sound for fanfare
        osc.frequency.value = freq;

        // More complex envelope for brass-like sound
        const t = now + time;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.05); // Attack
        gain.gain.setValueAtTime(0.06, t + dur * 0.8); // Sustain
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur); // Release

        // Lowpass filter to make it less harsh
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + dur);
    });
};

/**
 * Play a "Error" or "Undo" sound
 * Best for: Cancel, Delete
 */
export const playErrorSound = () => {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.15);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
};
