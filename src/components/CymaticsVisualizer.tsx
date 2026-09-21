import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../services/soundEngine';
import { Maximize2, Minimize2, Sparkles, Activity, Disc, Wind } from 'lucide-react';

export type VisualizerMode = 'cymatics' | 'mandala' | 'pulsar' | 'aurora' | 'oscilloscope';

interface Props {
  frequency: number;
  secondaryFrequency?: number;
  isPlaying: boolean;
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
  const [breathTimer, setBreathTimer] = useState<number>(4);
  const animationFrameId = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

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

    const analyser = soundEngine.getAnalyserNode();
    const bufferLength = analyser ? analyser.frequencyBinCount : 256;
    const dataArray = new Uint8Array(bufferLength);
    const timeArray = new Uint8Array(bufferLength);

    const render = () => {
      phaseRef.current += isPlaying ? 0.025 : 0.005;
      const phase = phaseRef.current;

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        analyser.getByteTimeDomainData(timeArray);
      } else {
        // Subtle simulated idle noise
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.sin(phase + i * 0.05) * 20 + 25;
          timeArray[i] = 128 + Math.sin(phase + i * 0.1) * 8;
        }
      }

      // Calculate average intensity
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      const avgIntensity = sum / bufferLength / 255;
      const effectiveIntensity = isPlaying ? Math.max(0.2, avgIntensity) : 0.1;

      // Clear with dark subtle fade for motion blur
      ctx.fillStyle = 'rgba(10, 15, 29, 0.28)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const minDimension = Math.min(width, height);

      if (mode === 'cymatics') {
        // --- CHLADNI RESONANT NODAL PARTICLES ---
        const n = Math.max(2, Math.min(12, Math.round(frequency / 45)));
        const m = Math.max(1, Math.min(8, Math.round((frequency % 100) / 15) + 1));
        const particleCount = compact ? 220 : 500;
        const maxRadius = minDimension * 0.44;

        ctx.lineWidth = 1.5;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const rBase = (i % 20) / 20;
          
          // Chladni 2D nodal equation: cos(n*theta)*sin(m*pi*r)
          const nodalFactor = Math.cos(n * angle + phase * 0.5) * Math.sin(m * Math.PI * rBase);
          const r = (rBase + nodalFactor * 0.22 * effectiveIntensity) * maxRadius;

          const px = centerX + Math.cos(angle + phase * 0.1) * r;
          const py = centerY + Math.sin(angle + phase * 0.1) * r;

          const alpha = Math.max(0.15, Math.abs(nodalFactor) * effectiveIntensity * 1.5);
          ctx.fillStyle = color;
          ctx.globalAlpha = Math.min(1, alpha);
          ctx.beginPath();
          ctx.arc(px, py, 1.8 + effectiveIntensity * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Central resonant core
        const glowRadius = minDimension * (0.08 + effectiveIntensity * 0.15);
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, `${color}44`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        ctx.fill();

      } else if (mode === 'mandala') {
        // --- SACRED GEOMETRY MANDALA ---
        const petals = Math.max(6, Math.min(24, Math.round(frequency / 35)));
        const maxR = minDimension * 0.42;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;

        for (let ring = 1; ring <= 5; ring++) {
          const ringR = (ring / 5) * maxR * (0.85 + effectiveIntensity * 0.3);
          const ringPhase = phase * (ring % 2 === 0 ? 0.3 : -0.3);

          ctx.beginPath();
          for (let p = 0; p <= petals; p++) {
            const theta = (p / petals) * Math.PI * 2 + ringPhase;
            const wave = Math.sin(theta * 3 + phase * 2) * 12 * effectiveIntensity;
            const px = centerX + Math.cos(theta) * (ringR + wave);
            const py = centerY + Math.sin(theta) * (ringR + wave);

            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();

          // Intersecting sacred circles
          for (let p = 0; p < petals; p += 2) {
            const theta = (p / petals) * Math.PI * 2 + ringPhase;
            const cx = centerX + Math.cos(theta) * ringR * 0.5;
            const cy = centerY + Math.sin(theta) * ringR * 0.5;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR * 0.4, 0, Math.PI * 2);
            ctx.strokeStyle = `${color}33`;
            ctx.stroke();
          }
        }

      } else if (mode === 'pulsar') {
        // --- BIO-RESONANCE CONCENTRIC ACOUSTIC PULSAR ---
        const ringCount = compact ? 6 : 12;
        const maxR = minDimension * 0.48;

        for (let r = 0; r < ringCount; r++) {
          const progress = ((phase * 0.8 + r / ringCount) % 1);
          const currentR = progress * maxR;
          const alpha = (1 - progress) * effectiveIntensity * 1.2;

          ctx.beginPath();
          ctx.arc(centerX, centerY, currentR, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2 + (1 - progress) * 3;
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.stroke();

          // Waveform modulation along perimeter
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.1) {
            const sampleIdx = Math.floor((a / (Math.PI * 2)) * bufferLength);
            const mod = ((dataArray[sampleIdx] || 128) - 128) * 0.15;
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
        // --- BRAINWAVE STATE AURORA WAVES ---
        const layers = 5;
        for (let l = 0; l < layers; l++) {
          const lPhase = phase * (0.5 + l * 0.2);
          const baseY = centerY + (l - 2) * 35;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 15) {
            const normX = x / width;
            const wave1 = Math.sin(normX * 6 + lPhase) * (40 + effectiveIntensity * 50);
            const wave2 = Math.cos(normX * 12 - lPhase * 0.8) * 20;
            const y = baseY + wave1 + wave2;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, baseY - 60, 0, height);
          grad.addColorStop(0, `${color}${Math.floor((0.4 - l * 0.06) * 255).toString(16).padStart(2, '0')}`);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fill();
        }

      } else if (mode === 'oscilloscope') {
        // --- PRECISION FFT & TIME DOMAIN OSCILLOSCOPE ---
        // 1. FFT Frequency Bars at bottom
        const barWidth = (width / bufferLength) * 2.2;
        let barX = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.4);
          ctx.fillStyle = `${color}${Math.floor((dataArray[i] / 255) * 180 + 75).toString(16).padStart(2, '0')}`;
          ctx.fillRect(barX, height - barHeight, barWidth - 1, barHeight);
          barX += barWidth;
        }

        // 2. Time-Domain Oscilloscope Line in center
        ctx.beginPath();
        ctx.lineWidth = 2.5;
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
        <div className="flex items-center space-x-2">
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
