// A simple service to play sounds using the Web Audio API

let audioContext: AudioContext | null = null;

// Lazily create and get the AudioContext
const getAudioContext = (): AudioContext | null => {
  if (typeof window !== 'undefined' && !audioContext) {
    // Standard AudioContext or fallback for older webkit browsers
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Plays a rich, celebratory fanfare sound effect resembling a brass ensemble.
 * This is used for significant achievements, like completing the entire path.
 */
export const playSuccessSound = () => {
  const context = getAudioContext();
  if (!context) return;

  // Browsers may suspend the AudioContext until a user gesture.
  // We attempt to resume it here.
  if (context.state === 'suspended') {
    context.resume();
  }

  // Helper function to play a single musical note with a brassy, chorus effect.
  const playNote = (frequency: number, startTime: number, duration: number) => {
    // We create multiple oscillators for each note to simulate an ensemble.
    const oscillatorCount = 3;
    const detuneValues = [-7, 0, 7]; // Detune in cents for a thicker sound.

    for (let i = 0; i < oscillatorCount; i++) {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const filter = context.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(context.destination);

        // A sawtooth wave provides rich harmonics, essential for a brass sound.
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.detune.setValueAtTime(detuneValues[i], startTime);

        // A low-pass filter with an envelope shapes the raw wave into a brass-like tone.
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(frequency * 1.5, startTime);
        filter.Q.setValueAtTime(2, startTime);

        // Create the brassy "wah" attack by quickly sweeping the filter frequency.
        filter.frequency.linearRampToValueAtTime(frequency * 3, startTime + 0.05);
        filter.frequency.linearRampToValueAtTime(frequency * 1.2, startTime + duration);

        // A volume envelope gives the note its shape: a sharp attack and gentle decay.
        // The overall gain is reduced to prevent clipping when multiple oscillators play.
        const attackTime = 0.01;
        const decayTime = 0.1;
        const sustainLevel = 0.6;
        const noteVolume = 0.3 / oscillatorCount;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(noteVolume, startTime + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(noteVolume * sustainLevel, startTime + attackTime + decayTime);
        gainNode.gain.setValueAtTime(noteVolume * sustainLevel, startTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
  };

  // Helper to play multiple notes at once, forming a chord.
  const playChord = (frequencies: number[], startTime: number, duration: number) => {
    frequencies.forEach(freq => playNote(freq, startTime, duration));
  };
  
  const now = context.currentTime;
  const short_duration = 0.15;
  const long_duration = 0.4;

  // A triumphant fanfare using major chords: C, G, then a final C.
  // C Major Chord (C5, E5, G5)
  playChord([523.25, 659.25, 783.99], now, short_duration);
  // G Major Chord (G5, B5, D6)
  playChord([783.99, 987.77, 1174.66], now + short_duration + 0.05, short_duration);
  // Final C Major Chord (C6, E6, G6)
  playChord([1046.50, 1318.51, 1567.98], now + short_duration * 2 + 0.1, long_duration);
};
