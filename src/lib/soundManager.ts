// ============================================================================
// Sound & Audio Manager Utility for Liids University (LU) Lifestyle
// Handles BGM (Lo-fi Campus ambient audio) and crisp synthesized SFX via Web Audio API.
// ============================================================================

export interface AudioSettings {
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  bgmVolume: number;
  sfxVolume: number;
}

const STORAGE_KEY = 'lcu_audio_settings';

const DEFAULT_SETTINGS: AudioSettings = {
  bgmEnabled: true,
  sfxEnabled: true,
  bgmVolume: 0.35,
  sfxVolume: 0.5,
};

type Listener = (settings: AudioSettings) => void;

class SoundManager {
  private settings: AudioSettings = { ...DEFAULT_SETTINGS };
  private listeners: Set<Listener> = new Set();
  private audioCtx: AudioContext | null = null;
  private bgmAudioElement: HTMLAudioElement | null = null;
  private bgmGainNode: GainNode | null = null;
  private isBgmPlaying = false;
  private synthBgmInterval: any = null;
  private unlocked = false;

  constructor() {
    this.loadSettings();
    this.setupAutoplayUnlock();
  }

  // --------------------------------------------------------------------------
  // Settings Management & Persistence
  // --------------------------------------------------------------------------
  private loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = {
          bgmEnabled: typeof parsed.bgmEnabled === 'boolean' ? parsed.bgmEnabled : DEFAULT_SETTINGS.bgmEnabled,
          sfxEnabled: typeof parsed.sfxEnabled === 'boolean' ? parsed.sfxEnabled : DEFAULT_SETTINGS.sfxEnabled,
          bgmVolume: typeof parsed.bgmVolume === 'number' ? Math.max(0, Math.min(1, parsed.bgmVolume)) : DEFAULT_SETTINGS.bgmVolume,
          sfxVolume: typeof parsed.sfxVolume === 'number' ? Math.max(0, Math.min(1, parsed.sfxVolume)) : DEFAULT_SETTINGS.sfxVolume,
        };
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();

    // React to changes
    if (partial.bgmEnabled !== undefined || partial.bgmVolume !== undefined) {
      if (this.settings.bgmEnabled && this.settings.bgmVolume > 0) {
        if (!this.isBgmPlaying && this.unlocked) {
          this.startBgm();
        } else {
          this.syncBgmVolume();
        }
      } else {
        this.stopBgm();
      }
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSettings());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const current = this.getSettings();
    this.listeners.forEach((l) => l(current));
  }

  // --------------------------------------------------------------------------
  // AudioContext & Autoplay Policy Handling
  // --------------------------------------------------------------------------
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private setupAutoplayUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.unlocked = true;
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }

      if (this.settings.bgmEnabled && !this.isBgmPlaying) {
        this.startBgm();
      }

      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: false });
    window.addEventListener('keydown', unlock, { once: false });
    window.addEventListener('touchstart', unlock, { once: false });
  }

  // --------------------------------------------------------------------------
  // Background Music (BGM): File Player + Procedural Lo-fi Synth Fallback
  // --------------------------------------------------------------------------
  public startBgm() {
    if (!this.settings.bgmEnabled || this.isBgmPlaying) return;

    // 1. Try playing external audio file if available
    try {
      if (!this.bgmAudioElement) {
        const audio = new Audio('/audio/bgm-campus.mp3');
        audio.loop = true;
        audio.volume = this.settings.bgmVolume;
        this.bgmAudioElement = audio;

        audio.addEventListener('error', () => {
          // File not present or 404, fallback to procedural ambient lo-fi synth
          this.bgmAudioElement = null;
          this.startProceduralLoFiBgm();
        });
      }

      const playPromise = this.bgmAudioElement.play();
      if (playPromise) {
        playPromise
          .then(() => {
            this.isBgmPlaying = true;
          })
          .catch(() => {
            // Autoplay blocked or missing file; fallback to procedural synth
            this.startProceduralLoFiBgm();
          });
      }
    } catch {
      this.startProceduralLoFiBgm();
    }
  }

  private startProceduralLoFiBgm() {
    if (this.synthBgmInterval || !this.settings.bgmEnabled) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.isBgmPlaying = true;

    // Master BGM Gain Node
    if (!this.bgmGainNode) {
      this.bgmGainNode = ctx.createGain();
      this.bgmGainNode.connect(ctx.destination);
    }
    this.bgmGainNode.gain.setValueAtTime(this.settings.bgmVolume * 0.45, ctx.currentTime);

    // Warm, mellow Lo-Fi electric piano chords progression
    // Dm9 -> G13 -> Cmaj9 -> Am9
    const chords = [
      [146.83, 220.0, 261.63, 329.63, 392.0], // Dm9 (D3, A3, C4, E4, G4)
      [98.0, 196.0, 246.94, 329.63, 369.99],  // G13 (G2, G3, B3, E4, F#4)
      [130.81, 196.0, 246.94, 329.63, 392.0], // Cmaj9 (C3, G3, B3, E4, G4)
      [110.0, 220.0, 261.63, 329.63, 392.0],  // Am9 (A2, A3, C4, E4, G4)
    ];

    let chordIndex = 0;

    const playChordStep = () => {
      if (!this.isBgmPlaying || !this.settings.bgmEnabled) return;
      const currentCtx = this.getAudioContext();
      if (!currentCtx || !this.bgmGainNode) return;

      const chord = chords[chordIndex % chords.length];
      chordIndex++;

      const now = currentCtx.currentTime;
      const duration = 4.2;

      const masterGain = this.bgmGainNode;

      chord.forEach((freq, i) => {
        const osc = currentCtx.createOscillator();
        const noteGain = currentCtx.createGain();
        const filter = currentCtx.createBiquadFilter();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Low-pass filter for cozy warm lo-fi tape sound
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(580 + Math.random() * 80, now);
        filter.Q.setValueAtTime(1.2, now);

        // Gentle Rhodes / electric piano envelope
        const maxGain = (0.045 / (i + 1)) * (this.settings.bgmVolume * 1.2);
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(maxGain, now + 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + i * 0.04);
        osc.stop(now + duration + 0.1);
      });
    };

    // Play first chord immediately
    playChordStep();
    // Loop chord progression every 4.2 seconds
    this.synthBgmInterval = setInterval(playChordStep, 4200);
  }

  public stopBgm() {
    this.isBgmPlaying = false;

    if (this.bgmAudioElement) {
      try {
        this.bgmAudioElement.pause();
        this.bgmAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
    }

    if (this.synthBgmInterval) {
      clearInterval(this.synthBgmInterval);
      this.synthBgmInterval = null;
    }

    if (this.bgmGainNode && this.audioCtx) {
      this.bgmGainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
  }

  private syncBgmVolume() {
    if (this.bgmAudioElement) {
      this.bgmAudioElement.volume = this.settings.bgmVolume;
    }
    if (this.bgmGainNode && this.audioCtx) {
      this.bgmGainNode.gain.setValueAtTime(this.settings.bgmVolume * 0.45, this.audioCtx.currentTime);
    }
  }

  // --------------------------------------------------------------------------
  // Crisp Synthesized Sound Effects (SFX)
  // --------------------------------------------------------------------------

  // 1. Light UI click / pop sound
  public playClick() {
    if (!this.settings.sfxEnabled || this.settings.sfxVolume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

      const vol = this.settings.sfxVolume * 0.3;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  // 2. Money received / Transfer / Top-up: Cash register / coin drop ("cha-ching")
  public playMoney() {
    if (!this.settings.sfxEnabled || this.settings.sfxVolume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = this.settings.sfxVolume * 0.35;

      // Two quick metallic chime bell tones
      const tones = [987.77, 1318.51, 1567.98]; // B5 -> E6 -> G6

      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(vol, now + idx * 0.07 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } catch {
      // ignore
    }
  }

  // 3. Lecture / Study completed: Pencil writing or pleasant chime sound
  public playStudy() {
    if (!this.settings.sfxEnabled || this.settings.sfxVolume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = this.settings.sfxVolume * 0.35;

      // Ascending pleasant chord arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(vol, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.55);
      });
    } catch {
      // ignore
    }
  }

  // 4. Furniture placed: Gentle wooden placement thud
  public playPlace() {
    if (!this.settings.sfxEnabled || this.settings.sfxVolume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = this.settings.sfxVolume * 0.45;

      // Low wooden thud sound
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // ignore
    }
  }

  // 5. Error / Locked action: Soft dull buzz / negative bump
  public playError() {
    if (!this.settings.sfxEnabled || this.settings.sfxVolume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = this.settings.sfxVolume * 0.28;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.08);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();

import { useState, useEffect } from 'react';

export function useAudioSettings() {
  const [settings, setSettings] = useState<AudioSettings>(soundManager.getSettings());

  useEffect(() => {
    return soundManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });
  }, []);

  return {
    settings,
    updateSettings: (partial: Partial<AudioSettings>) => soundManager.updateSettings(partial),
    toggleBgm: () => soundManager.updateSettings({ bgmEnabled: !settings.bgmEnabled }),
    toggleSfx: () => soundManager.updateSettings({ sfxEnabled: !settings.sfxEnabled }),
    setBgmVolume: (bgmVolume: number) => soundManager.updateSettings({ bgmVolume }),
    setSfxVolume: (sfxVolume: number) => soundManager.updateSettings({ sfxVolume }),
  };
}

export const useSoundStore = useAudioSettings;
