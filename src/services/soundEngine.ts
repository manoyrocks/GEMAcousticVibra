/**
 * Acoustic Vibra Web Audio DSP Engine
 * Provides high-precision frequency synthesis, binaural beat generators,
 * isochronic pulse modulators, procedural ambient soundscapes,
 * real-time FFT audio analysis, and mobile tactile transducer emulation.
 */

import { AmbientSoundType } from '../types';
import { soundscapeLoader } from './soundscapeLoader';
import { storage } from './storage';

export interface PlaybackOptions {
  frequency: number;
  secondaryFrequency?: number;
  binauralBeat?: number;
  waveform?: 'sine' | 'triangle' | 'binaural' | 'isochronic' | 'harmonic';
  volume?: number; // 0 to 100
  ambientSound?: AmbientSoundType;
  ambientVolume?: number; // 0 to 100
  hapticIntensity?: number; // 0 to 100
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private toneGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Active oscillators & nodes for main tone
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private oscHarmonics: OscillatorNode[] = [];
  private lfoNode: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Ambient sound nodes and timers
  private ambientSources: AudioNode[] = [];
  private ambientOscillators: OscillatorNode[] = [];
  private ambientIntervalIds: number[] = [];

  // Haptic timer
  private hapticIntervalId: number | null = null;
  private isPlaying: boolean = false;
  private currentOptions: PlaybackOptions = {
    frequency: 432,
    waveform: 'sine',
    volume: 75,
    ambientSound: 'none',
    ambientVolume: 30,
    hapticIntensity: 50
  };

  // Master volume state (default 70%)
  private masterVolume: number = 70;
  private preMuteVolume: number = 70;
  private masterVolumeListeners: Set<(volume: number) => void> = new Set();

  constructor() {
    // Read persisted volume if available, defaulting to 70%
    if (typeof window !== 'undefined') {
      try {
        this.masterVolume = storage.getMasterVolume();
        this.preMuteVolume = this.masterVolume > 0 ? this.masterVolume : 70;
      } catch {
        this.masterVolume = 70;
        this.preMuteVolume = 70;
      }
    }
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master output node calibrated to masterVolume (default 70% = 0.70 gain)
      this.masterGain = this.ctx.createGain();
      const initialGain = Math.max(0, Math.min(1, this.masterVolume / 100));
      this.masterGain.gain.setValueAtTime(initialGain, this.ctx.currentTime);

      // Analyser for real-time Cymatics & FFT
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.85;

      // Tone branch gain
      this.toneGain = this.ctx.createGain();
      this.toneGain.gain.setValueAtTime(0.75, this.ctx.currentTime);

      // Ambient branch gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      // Routing
      this.toneGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyser;
  }

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentOptions(): PlaybackOptions {
    return { ...this.currentOptions };
  }

  /**
   * Start generating vibroacoustic frequencies
   */
  public play(options: PlaybackOptions) {
    const ctx = this.initContext();
    this.stopTone(); // Clean previous tone
    this.currentOptions = { ...options };
    this.isPlaying = true;

    const now = ctx.currentTime;
    const freq = Math.max(1, options.frequency);
    const targetVolume = (options.volume !== undefined ? options.volume : 75) / 100;
    
    if (this.toneGain) {
      this.toneGain.gain.cancelScheduledValues(now);
      this.toneGain.gain.setValueAtTime(0.0001, now);
      this.toneGain.gain.linearRampToValueAtTime(targetVolume, now + 0.15);
    }

    const waveformType = options.waveform || 'sine';

    if (waveformType === 'binaural' && options.binauralBeat) {
      this.setupBinaural(freq, options.binauralBeat);
    } else if (waveformType === 'isochronic' && options.binauralBeat) {
      this.setupIsochronic(freq, options.binauralBeat);
    } else if (waveformType === 'harmonic') {
      this.setupHarmonicStack(freq, options.secondaryFrequency);
    } else {
      // Standard Pure Tone (Sine or Triangle)
      this.setupSingleTone(freq, waveformType === 'triangle' ? 'triangle' : 'sine');
    }

    // Configure ambient soundscape
    this.setupAmbientSound(options.ambientSound || 'none', options.ambientVolume ?? 30);

    // Trigger haptic pulsing
    this.startHapticFeedback(freq, options.hapticIntensity ?? 50);
  }

  private setupSingleTone(frequency: number, type: OscillatorType) {
    if (!this.ctx || !this.toneGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    osc.connect(this.toneGain);
    osc.start();
    this.oscLeft = osc;
  }

  private setupBinaural(carrierFreq: number, beatFreq: number) {
    if (!this.ctx || !this.toneGain) return;
    const now = this.ctx.currentTime;

    const leftFreq = carrierFreq;
    const rightFreq = carrierFreq + beatFreq;

    // Left channel
    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(leftFreq, now);

    const panL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panL) {
      panL.pan.setValueAtTime(-1.0, now);
      oscL.connect(panL);
      panL.connect(this.toneGain);
    } else {
      oscL.connect(this.toneGain);
    }
    oscL.start();
    this.oscLeft = oscL;

    // Right channel
    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(rightFreq, now);

    const panR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panR) {
      panR.pan.setValueAtTime(1.0, now);
      oscR.connect(panR);
      panR.connect(this.toneGain);
    } else {
      oscR.connect(this.toneGain);
    }
    oscR.start();
    this.oscRight = oscR;
  }

  private setupIsochronic(frequency: number, pulseRateHz: number) {
    if (!this.ctx || !this.toneGain) return;
    const now = this.ctx.currentTime;

    // Base tone oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    // Pulse modulation gain
    const pulseGain = this.ctx.createGain();
    pulseGain.gain.setValueAtTime(0.5, now);

    // LFO to modulate volume at pulse rate
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(pulseRateHz, now);

    const lfoDepth = this.ctx.createGain();
    lfoDepth.gain.setValueAtTime(0.5, now);

    lfo.connect(lfoDepth);
    lfoDepth.connect(pulseGain.gain);

    osc.connect(pulseGain);
    pulseGain.connect(this.toneGain);

    osc.start();
    lfo.start();

    this.oscLeft = osc;
    this.lfoNode = lfo;
    this.lfoGain = lfoDepth;
  }

  private setupHarmonicStack(baseFreq: number, secondaryFreq?: number) {
    if (!this.ctx || !this.toneGain) return;
    const now = this.ctx.currentTime;

    // Build warm tactile overtone chord: 1x, 2x, 3x harmonic multipliers
    const multipliers = [1, 2, 3, 0.5];
    const gains = [0.6, 0.25, 0.15, 0.4];

    multipliers.forEach((mult, index) => {
      if (!this.ctx || !this.toneGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * mult, now);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gains[index] || 0.2, now);

      osc.connect(g);
      g.connect(this.toneGain);
      osc.start();
      this.oscHarmonics.push(osc);
    });

    if (secondaryFreq) {
      const secOsc = this.ctx.createOscillator();
      secOsc.type = 'sine';
      secOsc.frequency.setValueAtTime(secondaryFreq, now);
      secOsc.connect(this.toneGain);
      secOsc.start();
      this.oscHarmonics.push(secOsc);
    }
  }

  /**
   * High-Fidelity Nature Audio Soundscape Player Synchronized with Frequency Engine
   */
  private async setupAmbientSound(ambientType: AmbientSoundType, volumePercent: number) {
    if (!this.ctx || !this.ambientGain) return;
    this.stopAmbient();

    if (ambientType === 'none' || volumePercent <= 0) {
      return;
    }

    const now = this.ctx.currentTime;
    const targetVol = (volumePercent / 100) * 0.45;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(0.0001, now);
    this.ambientGain.gain.linearRampToValueAtTime(targetVol, now + 0.2);

    // Check if buffer is already in soundscapeLoader memory cache
    const cachedBuffer = soundscapeLoader.getBuffer(ambientType);
    if (cachedBuffer) {
      this.playAmbientBuffer(cachedBuffer, ambientType);
      return;
    }

    // Otherwise asynchronously load/decode high-res buffer and launch synchronously
    try {
      const buffer = await soundscapeLoader.loadSoundscape(ambientType, this.ctx);
      if (buffer && this.isPlaying && this.currentOptions.ambientSound === ambientType) {
        this.playAmbientBuffer(buffer, ambientType);
      }
    } catch {
      // Fallback to legacy noise synthesis if loader fails
      this.fallbackProceduralAmbient(ambientType);
    }
  }

  private playAmbientBuffer(buffer: AudioBuffer, type: AmbientSoundType) {
    if (!this.ctx || !this.ambientGain || !this.isPlaying) return;
    
    // Stop any running ambient sources
    this.stopAmbient();

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Route through subtle high-precision acoustic filter for warm biophilic response
    const toneFilter = this.ctx.createBiquadFilter();
    toneFilter.type = 'lowpass';
    toneFilter.frequency.setValueAtTime(type === 'brown' ? 800 : 16000, this.ctx.currentTime);

    src.connect(toneFilter);
    toneFilter.connect(this.ambientGain);

    // Synchronous phase-locked start with carrier oscillators
    const startTime = this.ctx.currentTime;
    src.start(startTime);

    this.ambientSources.push(src, toneFilter);
  }

  private fallbackProceduralAmbient(ambientType: AmbientSoundType) {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(this.ambientGain);
    src.start(now);
    this.ambientSources.push(src);
  }

  /**
   * Tactile Haptic Feedback Pulse (Mobile & Transducer Emulation)
   */
  private startHapticFeedback(frequency: number, intensity: number) {
    if (this.hapticIntervalId) {
      clearInterval(this.hapticIntervalId);
      this.hapticIntervalId = null;
    }

    if (intensity <= 0 || typeof navigator === 'undefined' || !navigator.vibrate) {
      return;
    }

    // Low frequencies trigger rhythmic haptic impulses
    const pulseDuration = Math.min(60, Math.max(15, Math.round(intensity * 0.5)));
    const intervalMs = frequency < 20 ? 1000 / Math.max(1, frequency) : 3000;

    try {
      navigator.vibrate(pulseDuration);
      this.hapticIntervalId = window.setInterval(() => {
        if (this.isPlaying && navigator.vibrate) {
          navigator.vibrate(pulseDuration);
        }
      }, intervalMs);
    } catch {
      // Ignore if browser restricts vibration
    }
  }

  /**
   * Master Volume Control (0% to 100%, defaults to 70%)
   */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMasterVolume(volumePercent: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(volumePercent)));
    this.masterVolume = clamped;
    if (clamped > 0) {
      this.preMuteVolume = clamped;
    }

    if (this.ctx && this.masterGain) {
      const targetGain = clamped / 100;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }

    try {
      storage.saveMasterVolume(clamped);
    } catch { /* noop */ }

    // Notify UI listeners
    this.masterVolumeListeners.forEach(listener => {
      try {
        listener(this.masterVolume);
      } catch { /* noop */ }
    });
  }

  public toggleMuteMaster(): number {
    if (this.masterVolume > 0) {
      this.preMuteVolume = this.masterVolume;
      this.setMasterVolume(0);
      return 0;
    } else {
      const restored = this.preMuteVolume > 0 ? this.preMuteVolume : 70;
      this.setMasterVolume(restored);
      return restored;
    }
  }

  public subscribeMasterVolume(callback: (volume: number) => void): () => void {
    this.masterVolumeListeners.add(callback);
    callback(this.masterVolume);
    return () => {
      this.masterVolumeListeners.delete(callback);
    };
  }

  public setToneVolume(volumePercent: number) {
    this.currentOptions.volume = volumePercent;
    if (this.ctx && this.toneGain) {
      const target = (volumePercent / 100);
      this.toneGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  public setAmbientVolume(volumePercent: number) {
    this.currentOptions.ambientVolume = volumePercent;
    if (this.ctx && this.ambientGain) {
      const target = (volumePercent / 100) * 0.45;
      this.ambientGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  public setAmbientSound(ambientType: AmbientSoundType, volumePercent?: number) {
    this.currentOptions.ambientSound = ambientType;
    if (volumePercent !== undefined) {
      this.currentOptions.ambientVolume = volumePercent;
    }
    if (this.isPlaying) {
      this.setupAmbientSound(ambientType, this.currentOptions.ambientVolume ?? 30);
    }
  }

  public setFrequency(frequency: number, secondaryFrequency?: number, binauralBeat?: number) {
    this.currentOptions.frequency = frequency;
    if (secondaryFrequency) this.currentOptions.secondaryFrequency = secondaryFrequency;
    if (binauralBeat) this.currentOptions.binauralBeat = binauralBeat;

    if (this.isPlaying) {
      // Re-trigger smoothly
      this.play(this.currentOptions);
    }
  }

  /**
   * Spoken Voice Guidance Cues using Web Speech API
   */
  public speakGuidance(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slow, soothing tempo
      utterance.pitch = 0.95; // Warm soothing pitch
      utterance.volume = 0.8;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Serena') || v.name.includes('Samantha')));
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  }

  private stopTone() {
    const now = this.ctx ? this.ctx.currentTime : 0;
    if (this.toneGain && this.ctx) {
      this.toneGain.gain.setValueAtTime(0.0001, now);
    }

    if (this.oscLeft) {
      try { this.oscLeft.stop(); this.oscLeft.disconnect(); } catch { /* noop */ }
      this.oscLeft = null;
    }
    if (this.oscRight) {
      try { this.oscRight.stop(); this.oscRight.disconnect(); } catch { /* noop */ }
      this.oscRight = null;
    }
    if (this.lfoNode) {
      try { this.lfoNode.stop(); this.lfoNode.disconnect(); } catch { /* noop */ }
      this.lfoNode = null;
    }
    if (this.lfoGain) {
      try { this.lfoGain.disconnect(); } catch { /* noop */ }
      this.lfoGain = null;
    }

    this.oscHarmonics.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch { /* noop */ }
    });
    this.oscHarmonics = [];
  }

  private stopAmbient() {
    this.ambientIntervalIds.forEach(id => clearInterval(id));
    this.ambientIntervalIds = [];

    this.ambientOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch { /* noop */ }
    });
    this.ambientOscillators = [];

    this.ambientSources.forEach(node => {
      try {
        if ('stop' in node && typeof (node as AudioBufferSourceNode).stop === 'function') {
          (node as AudioBufferSourceNode).stop();
        }
        node.disconnect();
      } catch { /* noop */ }
    });
    this.ambientSources = [];
  }

  public stop() {
    this.isPlaying = false;
    this.stopTone();
    this.stopAmbient();

    if (this.hapticIntervalId) {
      clearInterval(this.hapticIntervalId);
      this.hapticIntervalId = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();

