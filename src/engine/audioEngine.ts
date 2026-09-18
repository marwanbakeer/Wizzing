/**
 * Wizzing Procedural Web Audio Engine
 * 100% synthesized in real-time using the Web Audio API.
 * Timeless, zero external dependencies, ultra-low latency, and iOS-unlocked.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  private isMuted: boolean = false;
  private musicVolume: number = 0.4;
  private sfxVolume: number = 0.6;
  
  private isMusicPlaying: boolean = false;
  private currentStep: number = 0;
  private tempoBpm: number = 132;
  private timerId: number | null = null;

  // Iconic melody note frequencies (E minor / A minor scale)
  private readonly MELODY: { note: number; dur: number }[] = [
    { note: 659.25, dur: 1 }, // E5
    { note: 493.88, dur: 0.5 }, // B4
    { note: 523.25, dur: 0.5 }, // C5
    { note: 587.33, dur: 1 }, // D5
    { note: 523.25, dur: 0.5 }, // C5
    { note: 493.88, dur: 0.5 }, // B4
    { note: 440.00, dur: 1 }, // A4
    { note: 440.00, dur: 0.5 }, // A4
    { note: 523.25, dur: 0.5 }, // C5
    { note: 659.25, dur: 1 }, // E5
    { note: 587.33, dur: 0.5 }, // D5
    { note: 523.25, dur: 0.5 }, // C5
    { note: 493.88, dur: 1.5 }, // B4
    { note: 523.25, dur: 0.5 }, // C5
    { note: 587.33, dur: 1 }, // D5
    { note: 659.25, dur: 1 }, // E5
    { note: 523.25, dur: 1 }, // C5
    { note: 440.00, dur: 1 }, // A4
    { note: 440.00, dur: 1 }, // A4
    { note: 0, dur: 1 },      // Rest
    { note: 587.33, dur: 1.5 }, // D5
    { note: 698.46, dur: 0.5 }, // F5
    { note: 880.00, dur: 1 }, // A5
    { note: 783.99, dur: 0.5 }, // G5
    { note: 698.46, dur: 0.5 }, // F5
    { note: 659.25, dur: 1.5 }, // E5
    { note: 523.25, dur: 0.5 }, // C5
    { note: 659.25, dur: 1 }, // E5
    { note: 587.33, dur: 0.5 }, // D5
    { note: 523.25, dur: 0.5 }, // C5
    { note: 493.88, dur: 1 }, // B4
    { note: 493.88, dur: 0.5 }, // B4
    { note: 523.25, dur: 0.5 }, // C5
    { note: 587.33, dur: 1 }, // D5
    { note: 659.25, dur: 1 }, // E5
    { note: 523.25, dur: 1 }, // C5
    { note: 440.00, dur: 1 }, // A4
    { note: 440.00, dur: 1 }, // A4
  ];

  private readonly BASS_NOTES: number[] = [
    220.00, 164.81, 174.61, 164.81,
    220.00, 164.81, 174.61, 164.81,
    146.83, 174.61, 220.00, 196.00,
    164.81, 220.00, 164.81, 220.00
  ];

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = vol;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = vol;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  public setDangerLevel(danger: number) {
    // Dynamically adjust tempo from 125 BPM up to 165 BPM as blocks rise high
    const targetBpm = Math.round(125 + danger * 40);
    this.tempoBpm = Math.max(120, Math.min(180, targetBpm));
  }

  public startMusic() {
    this.resume();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.currentStep = 0;
    this.scheduleNextNote();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNextNote = () => {
    if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

    const currentNoteData = this.MELODY[this.currentStep % this.MELODY.length];
    const stepDuration = (60 / this.tempoBpm) * currentNoteData.dur * 0.5;

    if (currentNoteData.note > 0) {
      this.playSynthNote(currentNoteData.note, stepDuration * 0.85);
    }

    // Play bass note every 4 beats
    if (this.currentStep % 2 === 0) {
      const bassIdx = Math.floor(this.currentStep / 2) % this.BASS_NOTES.length;
      this.playBassNote(this.BASS_NOTES[bassIdx], stepDuration * 1.5);
    }

    this.currentStep++;
    this.timerId = window.setTimeout(this.scheduleNextNote, stepDuration * 1000);
  };

  private playSynthNote(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const noteGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    // Warm low-pass envelope
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);

    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  private playBassNote(freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq / 2, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  /* --- SFX PROCEDURAL SOUNDS --- */

  public playMove() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playRotate() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.07);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playDrop() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playHold() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.09);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playLineClear(lines: number) {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const count = Math.min(lines, 4);

    for (let i = 0; i < count; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = lines >= 4 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freqs[i], now + i * 0.05);

      gain.gain.setValueAtTime(0.001, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.28, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.26);
    }
  }

  public playWizzFanfare() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Spectacular 4-line Wizzing / Quantum cascade chord
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.35, now + idx * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.52);
    });
  }

  public playGameOver() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const notes = [440, 415.30, 392, 349.23];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.2, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.22);
    });
  }
}

export const audioEngine = new AudioEngine();
