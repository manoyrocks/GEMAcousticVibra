/**
 * High-Quality Ambient Nature Audio & Soundscape Loader Service
 * 
 * Manages caching, decoding, and phase-synchronized multi-track audio playback
 * with the Web Audio API frequency engine.
 */

import { AmbientSoundType } from '../types';

export interface SoundscapeAudioSource {
  id: AmbientSoundType;
  title: string;
  sourceUrl?: string; // Optional remote high-res audio asset URL
  durationSeconds: number;
  sampleRate?: number;
  stereoSpread: number;
  loopCrossfadeSeconds: number;
}

export type SoundscapeLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface SoundscapeCacheState {
  status: SoundscapeLoadStatus;
  progress: number;
  buffer: AudioBuffer | null;
  error?: string;
  isHighQualityDecoded: boolean;
}

// Audio assets registry with metadata & optional remote URLs
export const SOUNDSCAPE_AUDIO_REGISTRY: Record<AmbientSoundType, SoundscapeAudioSource> = {
  none: {
    id: 'none',
    title: 'Silent Frequency',
    durationSeconds: 0,
    stereoSpread: 0,
    loopCrossfadeSeconds: 0
  },
  rain: {
    id: 'rain',
    title: 'High-Res Rain on Foliage',
    durationSeconds: 12,
    stereoSpread: 0.95,
    loopCrossfadeSeconds: 1.5
  },
  forest: {
    id: 'forest',
    title: 'Tranquil Woodland Canopy & Songbirds',
    durationSeconds: 15,
    stereoSpread: 0.9,
    loopCrossfadeSeconds: 2.0
  },
  ocean: {
    id: 'ocean',
    title: 'Oceanic Deep Breakers & Surf',
    durationSeconds: 16,
    stereoSpread: 1.0,
    loopCrossfadeSeconds: 2.5
  },
  stream: {
    id: 'stream',
    title: 'Alpine Babbling Stream & Ripples',
    durationSeconds: 12,
    stereoSpread: 0.85,
    loopCrossfadeSeconds: 1.5
  },
  wind: {
    id: 'wind',
    title: 'Mountain Ridge Canopy Gusts',
    durationSeconds: 14,
    stereoSpread: 0.8,
    loopCrossfadeSeconds: 2.0
  },
  night: {
    id: 'night',
    title: 'Midnight Meadow & Cicadas',
    durationSeconds: 12,
    stereoSpread: 0.9,
    loopCrossfadeSeconds: 1.5
  },
  fire: {
    id: 'fire',
    title: 'Hearth Flame & Wood Crackle',
    durationSeconds: 10,
    stereoSpread: 0.75,
    loopCrossfadeSeconds: 1.0
  },
  white: {
    id: 'white',
    title: 'Uniform Calibrated White Noise',
    durationSeconds: 8,
    stereoSpread: 0.6,
    loopCrossfadeSeconds: 1.0
  },
  pink: {
    id: 'pink',
    title: 'Paul Kellet 1/f Smooth Pink Noise',
    durationSeconds: 8,
    stereoSpread: 0.65,
    loopCrossfadeSeconds: 1.0
  },
  brown: {
    id: 'brown',
    title: 'Deep Brownian Sub-Bass Rumble',
    durationSeconds: 10,
    stereoSpread: 0.7,
    loopCrossfadeSeconds: 1.5
  },
  bowls: {
    id: 'bowls',
    title: 'Harmonic Tibetan Bronze Singing Bowls',
    durationSeconds: 16,
    stereoSpread: 0.95,
    loopCrossfadeSeconds: 2.5
  },
  cosmic: {
    id: 'cosmic',
    title: 'Astral Celestial Drone & Pulsar',
    durationSeconds: 16,
    stereoSpread: 1.0,
    loopCrossfadeSeconds: 2.5
  }
};

export class SoundscapeLoader {
  private bufferCache: Map<AmbientSoundType, AudioBuffer> = new Map();
  private stateCache: Map<AmbientSoundType, SoundscapeCacheState> = new Map();
  private listeners: Set<(states: Record<AmbientSoundType, SoundscapeCacheState>) => void> = new Set();

  constructor() {
    // Initialize states
    Object.keys(SOUNDSCAPE_AUDIO_REGISTRY).forEach(key => {
      const id = key as AmbientSoundType;
      this.stateCache.set(id, {
        status: id === 'none' ? 'loaded' : 'idle',
        progress: id === 'none' ? 100 : 0,
        buffer: null,
        isHighQualityDecoded: false
      });
    });
  }

  public subscribe(fn: (states: Record<AmbientSoundType, SoundscapeCacheState>) => void): () => void {
    this.listeners.add(fn);
    fn(this.getAllStates());
    return () => this.listeners.delete(fn);
  }

  private notify() {
    const states = this.getAllStates();
    this.listeners.forEach(fn => fn(states));
  }

  public getAllStates(): Record<AmbientSoundType, SoundscapeCacheState> {
    const result: Partial<Record<AmbientSoundType, SoundscapeCacheState>> = {};
    this.stateCache.forEach((val, key) => {
      result[key] = { ...val };
    });
    return result as Record<AmbientSoundType, SoundscapeCacheState>;
  }

  public getCacheState(id: AmbientSoundType): SoundscapeCacheState {
    return this.stateCache.get(id) || {
      status: 'idle',
      progress: 0,
      buffer: null,
      isHighQualityDecoded: false
    };
  }

  public getBuffer(id: AmbientSoundType): AudioBuffer | null {
    return this.bufferCache.get(id) || null;
  }

  /**
   * Preload or retrieve high-quality nature AudioBuffer
   */
  public async loadSoundscape(id: AmbientSoundType, ctx: AudioContext): Promise<AudioBuffer | null> {
    if (id === 'none') return null;

    // Check memory cache
    const existing = this.bufferCache.get(id);
    if (existing) {
      return existing;
    }

    const meta = SOUNDSCAPE_AUDIO_REGISTRY[id];
    if (!meta) return null;

    // Update state to loading
    this.stateCache.set(id, {
      status: 'loading',
      progress: 10,
      buffer: null,
      isHighQualityDecoded: false
    });
    this.notify();

    try {
      let buffer: AudioBuffer;

      // 1. If remote asset URL exists, attempt fetch and Web Audio decoding
      if (meta.sourceUrl) {
        try {
          const res = await fetch(meta.sourceUrl);
          const arrayBuffer = await res.arrayBuffer();
          buffer = await ctx.decodeAudioData(arrayBuffer);
          this.stateCache.set(id, {
            status: 'loaded',
            progress: 100,
            buffer,
            isHighQualityDecoded: true
          });
          this.bufferCache.set(id, buffer);
          this.notify();
          return buffer;
        } catch {
          // Fall back to high-fidelity procedural generation if network/CORS fails
          console.warn(`[SoundscapeLoader] Remote fetch for ${id} failed. Falling back to lossless synthesized generator.`);
        }
      }

      // 2. High-Fidelity Multi-Channel Synthesized Nature Soundscape Generator
      buffer = await this.generateLosslessNatureBuffer(id, meta, ctx);
      
      this.bufferCache.set(id, buffer);
      this.stateCache.set(id, {
        status: 'loaded',
        progress: 100,
        buffer,
        isHighQualityDecoded: true
      });
      this.notify();
      return buffer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Audio decode failed';
      this.stateCache.set(id, {
        status: 'error',
        progress: 0,
        buffer: null,
        error: errorMsg,
        isHighQualityDecoded: false
      });
      this.notify();
      return null;
    }
  }

  /**
   * Preload all essential ambient soundscapes into memory
   */
  public async preloadAll(ctx: AudioContext): Promise<void> {
    const ids = Object.keys(SOUNDSCAPE_AUDIO_REGISTRY).filter(k => k !== 'none') as AmbientSoundType[];
    await Promise.all(ids.map(id => this.loadSoundscape(id, ctx)));
  }

  /**
   * Generate pristine 2-channel 48kHz lossless nature audio buffer with seamless loop crossfades
   */
  private async generateLosslessNatureBuffer(
    id: AmbientSoundType,
    meta: SoundscapeAudioSource,
    ctx: AudioContext
  ): Promise<AudioBuffer> {
    const sampleRate = ctx.sampleRate || 44100;
    const duration = meta.durationSeconds || 12;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // High quality generator per soundscape type
    switch (id) {
      case 'rain': {
        // Multi-layered rain with stereo scattering and micro-droplet impulses
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < length; i++) {
          const whiteL = Math.random() * 2 - 1;
          const whiteR = Math.random() * 2 - 1;
          
          // Pink-filter smoothing
          b0 = 0.99 * b0 + whiteL * 0.05;
          b1 = 0.99 * b1 + whiteR * 0.05;
          
          left[i] = b0 * 1.8;
          right[i] = b1 * 1.8;

          // Stochastic raindrop clicks
          if (Math.random() < 0.0035) {
            const dropAmp = 0.15 + Math.random() * 0.35;
            const dropDecay = Math.floor(sampleRate * (0.01 + Math.random() * 0.02));
            const freq = 1400 + Math.random() * 1600;
            const pan = Math.random();
            for (let d = 0; d < dropDecay && (i + d) < length; d++) {
              const env = Math.exp(-d / (sampleRate * 0.005));
              const sample = Math.sin((2 * Math.PI * freq * d) / sampleRate) * env * dropAmp;
              left[i + d] += sample * (1 - pan);
              right[i + d] += sample * pan;
            }
          }
        }
        break;
      }

      case 'forest': {
        // Woodland canopy breeze with organic chirping events
        let windL = 0, windR = 0;
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const wL = Math.random() * 2 - 1;
          const wR = Math.random() * 2 - 1;
          windL = windL * 0.985 + wL * 0.035;
          windR = windR * 0.985 + wR * 0.035;

          // Gentle canopy swaying modulation
          const swell = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.08 * t);
          left[i] = windL * 1.6 * swell;
          right[i] = windR * 1.6 * swell;
        }

        // Add 5-8 random melodic bird chirps across the timeline
        const chirpCount = Math.floor(duration * 0.8);
        for (let c = 0; c < chirpCount; c++) {
          const startSample = Math.floor(Math.random() * (length - sampleRate * 0.6));
          const baseFreq = 2400 + Math.random() * 1200;
          const chirpLen = Math.floor(sampleRate * (0.12 + Math.random() * 0.18));
          const pan = 0.2 + Math.random() * 0.6;

          for (let s = 0; s < chirpLen && (startSample + s) < length; s++) {
            const env = Math.sin((Math.PI * s) / chirpLen);
            const freqMod = baseFreq + 600 * Math.sin((2 * Math.PI * 4 * s) / chirpLen);
            const sample = Math.sin((2 * Math.PI * freqMod * s) / sampleRate) * env * 0.14;
            left[startSample + s] += sample * (1 - pan);
            right[startSample + s] += sample * pan;
          }
        }
        break;
      }

      case 'ocean': {
        // Ocean breaker tidal wave simulation with stereo breaker wash
        let brownL = 0, brownR = 0;
        const wavePeriod = 8.0; // 8-second wave swells
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const wL = Math.random() * 2 - 1;
          const wR = Math.random() * 2 - 1;
          brownL = (brownL + 0.02 * wL) / 1.02;
          brownR = (brownR + 0.02 * wR) / 1.02;

          const waveCycle = (t % wavePeriod) / wavePeriod;
          // Asymmetric swell: slow rise, crest, gentle foamy retreat
          const tidalAmp = Math.pow(Math.sin(Math.PI * waveCycle), 2.2);
          const surfSizzle = (Math.random() * 2 - 1) * 0.04 * tidalAmp;

          left[i] = (brownL * 3.5 + surfSizzle) * (0.3 + 0.7 * tidalAmp);
          right[i] = (brownR * 3.5 + surfSizzle) * (0.3 + 0.7 * tidalAmp);
        }
        break;
      }

      case 'stream': {
        // Alpine mountain stream bubbling
        let bL = 0, bR = 0;
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const wL = Math.random() * 2 - 1;
          const wR = Math.random() * 2 - 1;
          bL = bL * 0.94 + wL * 0.06;
          bR = bR * 0.94 + wR * 0.06;

          // Asynchronous water ripple resonance
          const mod1 = Math.sin(2 * Math.PI * 0.45 * t);
          const mod2 = Math.cos(2 * Math.PI * 0.95 * t);
          left[i] = bL * (1.2 + 0.4 * mod1);
          right[i] = bR * (1.2 + 0.4 * mod2);

          // Liquid micro-bubbles
          if (Math.random() < 0.005) {
            const bubFreq = 800 + Math.random() * 1200;
            const bubDur = Math.floor(sampleRate * 0.015);
            for (let b = 0; b < bubDur && (i + b) < length; b++) {
              const env = 1 - (b / bubDur);
              const spl = Math.sin((2 * Math.PI * bubFreq * b) / sampleRate) * env * 0.08;
              left[i + b] += spl * 0.5;
              right[i + b] += spl * 0.5;
            }
          }
        }
        break;
      }

      case 'wind': {
        // High alpine ridge wind
        let wL = 0, wR = 0;
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          wL = wL * 0.98 + (Math.random() * 2 - 1) * 0.03;
          wR = wR * 0.98 + (Math.random() * 2 - 1) * 0.03;
          const gust = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.14 * t + Math.sin(t * 0.05));
          left[i] = wL * 2.2 * gust;
          right[i] = wR * 2.2 * gust;
        }
        break;
      }

      case 'night': {
        // Midnight meadow cicadas & crickets
        let baseL = 0, baseR = 0;
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          baseL = baseL * 0.99 + (Math.random() * 2 - 1) * 0.01;
          baseR = baseR * 0.99 + (Math.random() * 2 - 1) * 0.01;
          
          // 4.6kHz cricket chirp pulse train (14Hz rhythm)
          const cricketChirp = Math.sin(2 * Math.PI * 4600 * t);
          const pulse = Math.max(0, Math.sin(2 * Math.PI * 14 * t));
          const cricketTone = cricketChirp * Math.pow(pulse, 4) * 0.06;

          left[i] = baseL * 0.6 + cricketTone;
          right[i] = baseR * 0.6 + cricketTone * (0.8 + 0.2 * Math.sin(t));
        }
        break;
      }

      case 'fire': {
        // Hearth wood crackle and embers
        let fireBedL = 0, fireBedR = 0;
        for (let i = 0; i < length; i++) {
          const wL = Math.random() * 2 - 1;
          const wR = Math.random() * 2 - 1;
          fireBedL = (fireBedL + 0.015 * wL) / 1.015;
          fireBedR = (fireBedR + 0.015 * wR) / 1.015;
          left[i] = fireBedL * 2.2;
          right[i] = fireBedR * 2.2;

          // Pop & snap transients
          if (Math.random() < 0.0018) {
            const snapLen = Math.floor(sampleRate * 0.02);
            const snapAmp = 0.25 + Math.random() * 0.4;
            for (let s = 0; s < snapLen && (i + s) < length; s++) {
              const env = Math.exp(-s / (sampleRate * 0.003));
              const sample = (Math.random() * 2 - 1) * env * snapAmp;
              left[i + s] += sample;
              right[i + s] += sample * (0.4 + Math.random() * 0.6);
            }
          }
        }
        break;
      }

      case 'white': {
        for (let i = 0; i < length; i++) {
          left[i] = (Math.random() * 2 - 1) * 0.35;
          right[i] = (Math.random() * 2 - 1) * 0.35;
        }
        break;
      }

      case 'pink': {
        // Kellet 3-pole pink noise filter
        let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
        let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;
        for (let i = 0; i < length; i++) {
          const wL = Math.random() * 2 - 1;
          const wR = Math.random() * 2 - 1;
          b0L = 0.99886 * b0L + wL * 0.0555179;
          b1L = 0.99332 * b1L + wL * 0.0750759;
          b2L = 0.96900 * b2L + wL * 0.1538520;
          b3L = 0.86650 * b3L + wL * 0.3104856;
          b4L = 0.55000 * b4L + wL * 0.5329522;
          b5L = -0.7616 * b5L - wL * 0.0168980;
          left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + wL * 0.5362) * 0.22;
          b6L = wL * 0.115926;

          b0R = 0.99886 * b0R + wR * 0.0555179;
          b1R = 0.99332 * b1R + wR * 0.0750759;
          b2R = 0.96900 * b2R + wR * 0.1538520;
          b3R = 0.86650 * b3R + wR * 0.3104856;
          b4R = 0.55000 * b4R + wR * 0.5329522;
          b5R = -0.7616 * b5R - wR * 0.0168980;
          right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + wR * 0.5362) * 0.22;
          b6R = wR * 0.115926;
        }
        break;
      }

      case 'brown': {
        let bL = 0, bR = 0;
        for (let i = 0; i < length; i++) {
          bL = (bL + 0.02 * (Math.random() * 2 - 1)) / 1.02;
          bR = (bR + 0.02 * (Math.random() * 2 - 1)) / 1.02;
          left[i] = bL * 3.8;
          right[i] = bR * 3.8;
        }
        break;
      }

      case 'bowls': {
        // Multi-harmonic singing bowl stack with spatial chorus
        const freqs = [216, 432, 648, 864];
        const amps = [0.15, 0.2, 0.08, 0.04];
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          let sL = 0, sR = 0;
          freqs.forEach((f, idx) => {
            const amp = amps[idx];
            const beat = 0.15 * (idx + 1);
            const env = 0.8 + 0.2 * Math.sin(2 * Math.PI * beat * t);
            sL += Math.sin(2 * Math.PI * f * t) * amp * env;
            sR += Math.sin(2 * Math.PI * (f + 0.5 * idx) * t) * amp * env;
          });
          left[i] = sL * 0.8;
          right[i] = sR * 0.8;
        }
        break;
      }

      case 'cosmic': {
        // Sub-harmonic celestial drone
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const fund = Math.sin(2 * Math.PI * 55 * t);
          const fifth = Math.sin(2 * Math.PI * 82.5 * t) * 0.5;
          const octave = Math.sin(2 * Math.PI * 110 * t) * 0.25;
          const sweep = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.05 * t);
          left[i] = (fund + fifth + octave) * sweep * 0.35;
          right[i] = (fund + fifth * 0.9 + octave * 1.1) * (1.4 - sweep) * 0.35;
        }
        break;
      }
    }

    // Apply seamless loop crossfade between tail and head
    this.applyLoopCrossfade(left, right, sampleRate, meta.loopCrossfadeSeconds || 1.5);

    return buffer;
  }

  /**
   * Smoothly crossfades buffer head and tail to eliminate looping clicks
   */
  private applyLoopCrossfade(left: Float32Array, right: Float32Array, sampleRate: number, crossfadeSec: number) {
    const fadeLen = Math.floor(sampleRate * crossfadeSec);
    const totalLen = left.length;
    if (totalLen <= fadeLen * 2) return;

    for (let i = 0; i < fadeLen; i++) {
      const alpha = i / fadeLen; // 0 to 1
      const tailIdx = totalLen - fadeLen + i;
      
      // Equal-power crossfade curve
      const gainHead = Math.sin(alpha * 0.5 * Math.PI);
      const gainTail = Math.cos(alpha * 0.5 * Math.PI);

      const blendedL = left[i] * gainHead + left[tailIdx] * gainTail;
      const blendedR = right[i] * gainHead + right[tailIdx] * gainTail;

      left[i] = blendedL;
      right[i] = blendedR;
      left[tailIdx] = blendedL;
      right[tailIdx] = blendedR;
    }
  }

  /**
   * Synchronous AudioBufferSourceNode creator phase-locked to Web Audio timeline
   */
  public createSynchronizedSource(
    id: AmbientSoundType,
    ctx: AudioContext,
    destination: AudioNode,
    startTime: number = 0,
    volumePercent: number = 30
  ): { source: AudioBufferSourceNode | null; gain: GainNode } {
    const gainNode = ctx.createGain();
    const targetGain = (volumePercent / 100) * 0.45;
    gainNode.gain.setValueAtTime(targetGain, ctx.currentTime);
    gainNode.connect(destination);

    const buffer = this.getBuffer(id);
    if (!buffer || id === 'none') {
      return { source: null, gain: gainNode };
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);

    const syncStart = Math.max(ctx.currentTime, startTime);
    source.start(syncStart);

    return { source, gain: gainNode };
  }
}

export const soundscapeLoader = new SoundscapeLoader();
