import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../services/soundEngine';
import { Maximize2, Minimize2, Sparkles, Activity, Disc, Wind } from 'lucide-react';

export type VisualizerMode = 'cymatics' | 'mandala' | 'pulsar' | 'aurora' | 'oscilloscope';

interface Props {
  frequency: number;
  secondaryFrequency?: number;
  isPlaying: boolean;
  /**
   * Real-time audio volume / output intensity (accepts 0-1 normalized or 0-100 percentage).
   * Directly controls visual particle density and nodal excitation in synchronization with soundEngine.
   */
  intensity?: number;
  color?: string;
  showControls?: boolean;
  compact?: boolean;
  className?: string;
  breathingGuide?: boolean;
}

export const CymaticsVisualizer: React.FC<Props> = ({
  frequency,
  secondaryFrequency,
  isPlaying,
  intensity,
  color = '#06b6d4',
  showControls = true,
  compact = false,
  className = '',
  breathingGuide = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('cymatics');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [liveStats, setLiveStats] = useState<{ particleCount: number; intensityPct: number }>({
    particleCount: compact ? 180 : 420,
    intensityPct: isPlaying ? 65 : 15
  });

  const animationFrameId = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const intensityPropRef = useRef<number | undefined>(intensity);
  const smoothedIntensityRef = useRef<number>(0.45);
  const frameCounterRef = useRef<number>(0);

  // Keep intensity prop ref synchronized without resetting canvas loop
  useEffect(() => {
    intensityPropRef.current = intensity;
  }, [intensity]);

  // Subscribe to master volume changes in soundEngine for immediate responsiveness
  const [masterVol, setMasterVol] = useState<number>(() => soundEngine.getMasterVolume());
  useEffect(() => {
    return soundEngine.subscribeMasterVolume(vol => {
      setMasterVol(vol);
    });
  }, []);
  const masterVolRef = useRef<number>(masterVol);
  useEffect(() => {
    masterVolRef.current = masterVol;
  }, [masterVol]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Breathing guide timer loop
  useEffect(() => {
    if (!breathingGuide || !isPlaying) return;
    const interval = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        if (prev === 'Exhale') return 'Rest';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [breathingGuide, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let dataArray = new Uint8Array(256);
    let timeArray = new Uint8Array(256);

    const render = () => {
      const analyser = soundEngine.getAnalyserNode();
      const bufferLength = analyser ? analyser.frequencyBinCount : 256;
      if (dataArray.length !== bufferLength) {
        dataArray = new Uint8Array(bufferLength);
        timeArray = new Uint8Array(bufferLength);
      }

      // Normalize optional external intensity prop (supports 0-1 or 0-100 scale)
      const rawPropIntensity = intensityPropRef.current;
      const normalizedPropIntensity =
        rawPropIntensity !== undefined
          ? Math.max(0, Math.min(1, rawPropIntensity > 1 ? rawPropIntensity / 100 : rawPropIntensity))
          : undefined;

      // Measure real-time audio volume from Web Audio AnalyserNode & soundEngine
      let analyserSignalIntensity = 0;
      const enginePlaying = soundEngine.getIsPlaying();

      if (analyser && isPlaying && enginePlaying) {
        analyser.getByteFrequencyData(dataArray);
        analyser.getByteTimeDomainData(timeArray);

        // Compute both spectral energy and time-domain RMS for responsive volume tracking
        let freqSum = 0;
        let rmsSum = 0;
        for (let i = 0; i < bufferLength; i++) {
          freqSum += dataArray[i];
          const sample = (timeArray[i] - 128) / 128;
          rmsSum += sample * sample;
        }
        const avgFreq = freqSum / bufferLength / 255;
        const rms = Math.sqrt(rmsSum / bufferLength);
        const engineIntensity = soundEngine.getOutputIntensity();

        analyserSignalIntensity = Math.min(
          1,
          Math.max(avgFreq * 1.35, rms * 2.2, engineIntensity)
        );
      } else {
        // Simulated harmonic oscillation when previewing visually or idle
        const simScale = isPlaying ? (normalizedPropIntensity ?? Math.max(0.25, masterVolRef.current / 80)) : 0.15;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.min(255, (Math.sin(phaseRef.current + i * 0.05) * 28 + 38) * simScale * 1.4);
          timeArray[i] = 128 + Math.sin(phaseRef.current * 2 + i * 0.12) * 24 * simScale;
        }
        analyserSignalIntensity = simScale;
      }

      // Combine prop intensity and real-time audio analyser volume
      let targetIntensity: number;
      if (!isPlaying) {
        targetIntensity = normalizedPropIntensity !== undefined ? normalizedPropIntensity * 0.25 : 0.12;
      } else if (normalizedPropIntensity !== undefined) {
        // Blend explicit intensity prop with live audio RMS modulation for organic responsiveness
        targetIntensity =
          analyser && enginePlaying
            ? normalizedPropIntensity * 0.65 + analyserSignalIntensity * 0.35
            : normalizedPropIntensity;
      } else {
        targetIntensity = Math.max(0.15, analyserSignalIntensity);
      }

      // Smooth intensity transitions (exponential moving average) to avoid visual jarring
      smoothedIntensityRef.current += (targetIntensity - smoothedIntensityRef.current) * 0.14;
      const effectiveIntensity = Math.max(0.08, Math.min(1, smoothedIntensityRef.current));

      phaseRef.current += isPlaying ? 0.015 + effectiveIntensity * 0.028 : 0.005;
      const phase = phaseRef.current;

      // Map real-time intensity directly to visual particle density
      const minParticles = compact ? 75 : 150;
      const maxParticles = compact ? 440 : 960;
      const dynamicParticleCount = Math.round(
        minParticles + Math.pow(effectiveIntensity, 1.05) * (maxParticles - minParticles)
      );

      // Periodically sync HUD telemetry (every 12 frames ~5x/sec) to avoid React re-render overhead
      frameCounterRef.current += 1;
      if (frameCounterRef.current % 12 === 0) {
        setLiveStats({
          particleCount: dynamicParticleCount,
          intensityPct: Math.round(effectiveIntensity * 100)
        });
      }

      // Clear with dark subtle fade for motion blur
      ctx.fillStyle = 'rgba(10, 15, 29, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const minDimension = Math.min(width, height);

      if (mode === 'cymatics') {
        // --- CHLADNI RESONANT NODAL PARTICLES (DENSITY MAPPED TO REAL-TIME AUDIO VOLUME) ---
        const n = Math.max(2, Math.min(12, Math.round(frequency / 45)));
        const m = Math.max(1, Math.min(8, Math.round((frequency % 100) / 15) + 1));
        const radialShells = Math.max(12, Math.round(14 + effectiveIntensity * 22));
        const maxRadius = minDimension * (0.38 + effectiveIntensity * 0.08);

        ctx.lineWidth = 1.5;
        for (let i = 0; i < dynamicParticleCount; i++) {
          // Golden-angle + harmonic distribution for natural cymatic sand dispersion
          const angle = (i / dynamicParticleCount) * Math.PI * 2 + (i % 7) * 0.04;
          const rBase = ((i % radialShells) + 0.5) / radialShells;

          // Chladni 2D nodal equation: cos(n*theta)*sin(m*pi*r)
          const nodalFactor = Math.cos(n * angle + phase * 0.5) * Math.sin(m * Math.PI * rBase);
          const harmonicFactor = secondaryFrequency
            ? Math.sin(Math.max(2, Math.round(secondaryFrequency / 60)) * angle - phase * 0.35) * 0.08
            : 0;

          const r =
            (rBase + (nodalFactor * 0.24 + harmonicFactor) * effectiveIntensity) * maxRadius;

          const px = centerX + Math.cos(angle + phase * 0.1) * r;
          const py = centerY + Math.sin(angle + phase * 0.1) * r;

          const alpha = Math.max(0.16, Math.abs(nodalFactor) * (0.45 + effectiveIntensity * 1.15));
          ctx.fillStyle = color;
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.beginPath();
          const particleRadius = 1.3 + effectiveIntensity * 2.4 + (i % 3 === 0 ? 0.4 : 0);
          ctx.arc(px, py, particleRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Central resonant core
        const glowRadius = minDimension * (0.07 + effectiveIntensity * 0.16);
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, `${color}44`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

      } else if (mode === 'mandala') {
        // --- SACRED GEOMETRY MANDALA WITH VOLUME-RESPONSIVE NODAL PARTICLES ---
        const petals = Math.max(6, Math.min(24, Math.round(frequency / 35)));
        const maxR = minDimension * 0.42;
        const ringLayers = Math.max(3, Math.round(3 + effectiveIntensity * 4));

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2 + effectiveIntensity * 1.0;

        for (let ring = 1; ring <= ringLayers; ring++) {
          const ringR = (ring / ringLayers) * maxR * (0.82 + effectiveIntensity * 0.32);
          const ringPhase = phase * (ring % 2 === 0 ? 0.3 : -0.3);

          ctx.beginPath();
          for (let p = 0; p <= petals; p++) {
            const theta = (p / petals) * Math.PI * 2 + ringPhase;
            const wave = Math.sin(theta * 3 + phase * 2) * 14 * effectiveIntensity;
            const px = centerX + Math.cos(theta) * (ringR + wave);
            const py = centerY + Math.sin(theta) * (ringR + wave);

            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();

          // Intersecting sacred circles & nodal energy particles
          for (let p = 0; p < petals; p += 2) {
            const theta = (p / petals) * Math.PI * 2 + ringPhase;
            const cx = centerX + Math.cos(theta) * ringR * 0.5;
            const cy = centerY + Math.sin(theta) * ringR * 0.5;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR * 0.4, 0, Math.PI * 2);
            ctx.strokeStyle = `${color}33`;
            ctx.stroke();

            // Volume-driven harmonic vertex particles
            if (effectiveIntensity > 0.2) {
              ctx.fillStyle = color;
              ctx.globalAlpha = Math.min(0.9, effectiveIntensity * 0.9);
              ctx.beginPath();
              ctx.arc(cx, cy, 1.5 + effectiveIntensity * 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
        }

      } else if (mode === 'pulsar') {
        // --- BIO-RESONANCE CONCENTRIC ACOUSTIC PULSAR ---
        const baseRings = compact ? 4 : 7;
        const maxExtraRings = compact ? 5 : 9;
        const ringCount = baseRings + Math.round(effectiveIntensity * maxExtraRings);
        const maxR = minDimension * 0.48;

        for (let r = 0; r < ringCount; r++) {
          const progress = ((phase * 0.8 + r / ringCount) % 1);
          const currentR = progress * maxR;
          const alpha = (1 - progress) * (0.35 + effectiveIntensity * 0.95);

          ctx.beginPath();
          ctx.arc(centerX, centerY, currentR, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5 + (1 - progress) * 3 * effectiveIntensity;
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.stroke();

          // Waveform modulation along perimeter
          ctx.beginPath();
          const step = Math.max(0.05, 0.14 - effectiveIntensity * 0.07);
          for (let a = 0; a <= Math.PI * 2; a += step) {
            const sampleIdx = Math.floor((a / (Math.PI * 2)) * bufferLength);
            const mod = ((dataArray[sampleIdx] || 128) - 128) * 0.18 * effectiveIntensity;
            const px = centerX + Math.cos(a) * (currentR + mod);
            const py = centerY + Math.sin(a) * (currentR + mod);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = `${color}88`;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

      } else if (mode === 'aurora') {
        // --- BRAINWAVE STATE AURORA WAVES & HARMONIC FIELD PARTICLES ---
        const layers = Math.max(4, Math.round(3 + effectiveIntensity * 4));
        for (let l = 0; l < layers; l++) {
          const lPhase = phase * (0.5 + l * 0.2);
          const baseY = centerY + (l - layers / 2) * 30;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 15) {
            const normX = x / width;
            const wave1 = Math.sin(normX * 6 + lPhase) * (28 + effectiveIntensity * 62);
            const wave2 = Math.cos(normX * 12 - lPhase * 0.8) * (12 + effectiveIntensity * 18);
            const y = baseY + wave1 + wave2;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, baseY - 60, 0, height);
          const layerAlpha = Math.max(0.08, Math.min(0.65, (0.45 - l * 0.05) * (0.5 + effectiveIntensity * 0.7)));
          grad.addColorStop(0, `${color}${Math.floor(layerAlpha * 255).toString(16).padStart(2, '0')}`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Volume-scaled floating bio-resonance particles across the aurora
        const auroraParticles = Math.round(dynamicParticleCount * 0.18);
        ctx.fillStyle = color;
        for (let p = 0; p < auroraParticles; p++) {
          const px = ((p * 97 + phase * 40) % width);
          const py = centerY + Math.sin(phase * 0.8 + p * 0.7) * (height * 0.35);
          ctx.globalAlpha = Math.min(0.85, 0.2 + effectiveIntensity * 0.65);
          ctx.beginPath();
          ctx.arc(px, py, 1.2 + effectiveIntensity * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

      } else if (mode === 'oscilloscope') {
        // --- PRECISION FFT & TIME DOMAIN OSCILLOSCOPE ---
        // 1. FFT Frequency Bars at bottom
        const barWidth = (width / bufferLength) * 2.2;
        let barX = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.45) * (0.4 + effectiveIntensity * 0.8);
          ctx.fillStyle = `${color}${Math.floor((dataArray[i] / 255) * 180 + 75).toString(16).padStart(2, '0')}`;
          ctx.fillRect(barX, height - barHeight, barWidth - 1, barHeight);
          barX += barWidth;
        }

        // 2. Time-Domain Oscilloscope Line in center
        ctx.beginPath();
        ctx.lineWidth = 2.0 + effectiveIntensity * 1.5;
        ctx.strokeStyle = '#ffffff';
        const sliceWidth = width / bufferLength;
        let ox = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = timeArray[i] / 128.0;
          const oy = (v * height) / 2.2;
          if (i === 0) ctx.moveTo(ox, oy);
          else ctx.lineTo(ox, oy);
          ox += sliceWidth;
        }
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      resizeObserver.disconnect();
    };
  }, [frequency, secondaryFrequency, isPlaying, color, mode, compact]);

  return (
    <div
      ref={containerRef}
      id="cymatics-visualizer-container"
      className={`relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl flex flex-col justify-between ${className}`}
      style={{ minHeight: compact ? '220px' : '360px' }}
    >
      {/* Visualizer Canvas */}
      <canvas
        ref={canvasRef}
        id="cymatics-canvas"
        className="absolute inset-0 w-full h-full block cursor-pointer"
        onClick={() => {
          // cycle mode on click
          const modes: VisualizerMode[] = ['cymatics', 'mandala', 'pulsar', 'aurora', 'oscilloscope'];
          const next = modes[(modes.indexOf(mode) + 1) % modes.length];
          setMode(next);
        }}
      />

      {/* Top Overlay HUD */}
      <div className="relative z-10 flex items-center justify-between p-3.5 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
            <span
              className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}
            />
            <span className="text-xs font-medium text-slate-200">
              {frequency >= 1000 ? `${(frequency / 1000).toFixed(2)} kHz` : `${frequency.toFixed(1)} Hz`}
            </span>
            {secondaryFrequency && (
              <span className="text-xs text-cyan-400">
                / {secondaryFrequency.toFixed(1)} Hz
              </span>
            )}
          </div>

          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/40">
            {mode.toUpperCase()}
          </span>

          {/* Real-Time Particle Density & Audio Intensity Telemetry */}
          <div
            className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-[10px] font-mono text-cyan-300"
            title="Real-time particle density mapped from audio output volume"
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>{liveStats.particleCount} pts</span>
            <span className="text-cyan-500/60">•</span>
            <span>{liveStats.intensityPct}% Vol</span>
          </div>
        </div>

        {showControls && (
          <div className="flex items-center space-x-1.5">
            {/* Mode selector pills */}
            <div className="hidden sm:flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
              {(['cymatics', 'mandala', 'pulsar', 'aurora', 'oscilloscope'] as VisualizerMode[]).map(m => (
                <button
                  key={m}
                  id={`vis-mode-${m}`}
                  onClick={() => setMode(m)}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium transition-all ${
                    mode === m
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            <button
              id="vis-fullscreen-toggle"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Zen Mode'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Central Breathing Guide Indicator (If Enabled) */}
      {breathingGuide && isPlaying && (
        <div className="relative z-10 mx-auto my-auto flex flex-col items-center justify-center pointer-events-none">
          <div
            className={`w-28 h-28 rounded-full border-2 border-cyan-400/80 flex flex-col items-center justify-center transition-all duration-3000 backdrop-blur-sm bg-cyan-950/20 shadow-[0_0_30px_rgba(6,182,212,0.3)] ${
              breathPhase === 'Inhale'
                ? 'scale-125 border-cyan-300'
                : breathPhase === 'Hold'
                ? 'scale-125 border-indigo-300 shadow-[0_0_40px_rgba(99,102,241,0.5)]'
                : breathPhase === 'Exhale'
                ? 'scale-90 border-teal-400 opacity-80'
                : 'scale-95 border-slate-400 opacity-60'
            }`}
          >
            <Wind className="w-5 h-5 text-cyan-300 mb-0.5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              {breathPhase}
            </span>
            <span className="text-[10px] text-cyan-400/80">4s Pace</span>
          </div>
        </div>
      )}

      {/* Bottom status bar */}
      <div className="relative z-10 flex items-center justify-between px-3.5 py-2 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent text-[11px] text-slate-400">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vibroacoustic Resonant Waveform Engine</span>
        </span>
        <span className="hidden sm:inline text-slate-500">
          Click visualizer to cycle geometry modes
        </span>
      </div>
    </div>
  );
};
