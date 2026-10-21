import React, { useState, useEffect, useRef } from 'react';
import { VibroSession, SessionPhase } from '../types';
import { soundEngine } from '../services/soundEngine';
import { storage } from '../services/storage';
import {
  Play,
  Clock,
  Eye,
  X,
  Volume2,
  Sparkles,
  Radio,
  Activity,
  Zap,
  CheckCircle2,
  Maximize2,
  Heart
} from 'lucide-react';

interface Props {
  session: VibroSession;
  isPreviewing: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (sessionId: string) => void;
  onTogglePreview: (sessionId: string | null) => void;
  onInitiateSession: (session: VibroSession) => void;
}

export const SessionCard: React.FC<Props> = ({
  session,
  isPreviewing,
  isFavorite: propIsFavorite,
  onToggleFavorite,
  onTogglePreview,
  onInitiateSession
}) => {
  const [internalIsFavorite, setInternalIsFavorite] = useState<boolean>(() =>
    typeof propIsFavorite === 'boolean' ? propIsFavorite : storage.isFavoriteSession(session.id)
  );
  const [previewRemainingMs, setPreviewRemainingMs] = useState<number>(5000);
  const [hasCompletedPreview, setHasCompletedPreview] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Keep internal favorite state in sync with prop and storage events
  useEffect(() => {
    if (typeof propIsFavorite === 'boolean') {
      setInternalIsFavorite(propIsFavorite);
    }
  }, [propIsFavorite]);

  useEffect(() => {
    const handleFavoritesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setInternalIsFavorite(customEvent.detail.includes(session.id));
      } else {
        setInternalIsFavorite(storage.isFavoriteSession(session.id));
      }
    };

    window.addEventListener('acoustic_vibra_favorites_updated', handleFavoritesUpdated);
    return () => {
      window.removeEventListener('acoustic_vibra_favorites_updated', handleFavoritesUpdated);
    };
  }, [session.id]);

  const isFavorited = typeof propIsFavorite === 'boolean' ? propIsFavorite : internalIsFavorite;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleFavorite) {
      onToggleFavorite(session.id);
    } else {
      const updated = storage.toggleFavoriteSession(session.id);
      setInternalIsFavorite(updated.includes(session.id));
    }
  };

  const primaryPhase: SessionPhase = session.phases[0] || {
    id: 'p1',
    name: 'Harmonic Induction',
    durationSeconds: 300,
    frequencyId: 'f1',
    frequencyHz: 432,
    waveform: 'sine',
    ambientSound: 'none',
    ambientVolume: 20,
    hapticIntensity: 40
  };

  // Preview timer & Audio playback effect
  useEffect(() => {
    if (!isPreviewing) {
      setPreviewRemainingMs(5000);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    setHasCompletedPreview(false);
    startTimeRef.current = Date.now();
    const DURATION_MS = 5000;

    // Start gentle 5-second acoustic sound pattern
    try {
      soundEngine.play({
        frequency: primaryPhase.frequencyHz,
        secondaryFrequency: primaryPhase.binauralBeatHz ? primaryPhase.frequencyHz + primaryPhase.binauralBeatHz : undefined,
        binauralBeat: primaryPhase.binauralBeatHz,
        waveform: primaryPhase.waveform,
        volume: 45, // Soft comfortable preview volume
        ambientSound: primaryPhase.ambientSound || 'none',
        ambientVolume: Math.min(25, primaryPhase.ambientVolume || 20),
        hapticIntensity: primaryPhase.hapticIntensity ? Math.min(30, primaryPhase.hapticIntensity) : 25
      });
    } catch {
      // Audio fallback if browser requires touch
    }

    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, DURATION_MS - elapsed);
      setPreviewRemainingMs(remaining);

      if (remaining <= 0) {
        clearInterval(timerInterval);
        soundEngine.stop();
        onTogglePreview(null);
        setHasCompletedPreview(true);
      }
    }, 50);

    return () => {
      clearInterval(timerInterval);
      if (soundEngine.getIsPlaying()) {
        soundEngine.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPreviewing, primaryPhase, onTogglePreview]);

  // Frequency Pattern Canvas Animation Loop
  useEffect(() => {
    if (!isPreviewing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseFreq = primaryPhase.frequencyHz || 432;
    const binauralBeat = primaryPhase.binauralBeatHz || 0;
    const waveform = primaryPhase.waveform || 'sine';

    const render = () => {
      phaseRef.current += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Background subtle gradient grid
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, width / 2);
      bgGrad.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
      bgGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.4)');
      bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Grid resonance rings
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.lineWidth = 1;
      for (let r = 20; r < Math.min(width, height) / 2; r += 24) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r + Math.sin(phaseRef.current + r) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw multi-layered frequency pattern based on Hz range
      const harmonicOrder = Math.max(3, Math.min(12, Math.round(baseFreq / 50)));
      const points = 180;

      // Layer 1: Geometric Cymatic Resonant Polygon / Flower
      ctx.beginPath();
      ctx.lineWidth = 2;
      const cymaticGrad = ctx.createLinearGradient(0, 0, width, height);
      cymaticGrad.addColorStop(0, '#22d3ee');
      cymaticGrad.addColorStop(0.5, '#818cf8');
      cymaticGrad.addColorStop(1, '#ec4899');
      ctx.strokeStyle = cymaticGrad;

      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * Math.PI * 2;
        const radiusOffset =
          Math.sin(theta * harmonicOrder + phaseRef.current * 1.5) * 16 +
          Math.cos(theta * 2 - phaseRef.current) * 8 +
          (binauralBeat > 0 ? Math.sin(theta * 4 + phaseRef.current * 3) * 6 : 0);

        const r = Math.min(centerX, centerY) * 0.58 + radiusOffset;
        const x = centerX + Math.cos(theta) * r;
        const y = centerY + Math.sin(theta) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Layer 2: Real-time Oscillating Waveform trace across center
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;

      const waveCount = waveform === 'triangle' ? 5 : waveform === 'harmonic' ? 8 : 4;
      for (let x = 0; x < width; x += 2) {
        const normX = (x / width) * Math.PI * 2 * waveCount;
        let yOffset = Math.sin(normX + phaseRef.current * 2) * 22;

        if (waveform === 'triangle') {
          yOffset = (Math.asin(Math.sin(normX + phaseRef.current * 2)) / (Math.PI / 2)) * 22;
        } else if (waveform === 'harmonic') {
          yOffset =
            (Math.sin(normX + phaseRef.current * 2) +
              0.5 * Math.sin(normX * 2 + phaseRef.current * 3) +
              0.25 * Math.sin(normX * 3 + phaseRef.current * 4)) *
            16;
        }

        const y = centerY + yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Center glowing pulse node
      const pulseSize = 6 + Math.sin(phaseRef.current * 3) * 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPreviewing, primaryPhase]);

  const handleStartPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePreview(isPreviewing ? null : session.id);
  };

  const handleStopPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.stop();
    onTogglePreview(null);
  };

  const progressPercent = ((5000 - previewRemainingMs) / 5000) * 100;
  const secondsLeft = (previewRemainingMs / 1000).toFixed(1);

  return (
    <div
      id={`session-card-${session.id}`}
      className={`group relative flex flex-col justify-between p-6 rounded-2xl transition-all duration-300 ease-out border overflow-hidden ${
        isPreviewing
          ? 'bg-slate-900 border-cyan-400/80 shadow-2xl shadow-cyan-950/60 ring-2 ring-cyan-500/30 -translate-y-1.5'
          : 'bg-slate-900/60 border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900/95 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-950/40'
      }`}
    >
      {/* Background Hover Aura Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Section */}
      <div className="relative z-10">
        {/* Top Row: Category, Duration, Quick Preview & Bookmark Heart Button */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 truncate max-w-[130px] sm:max-w-none">
            {session.category}
          </span>

          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* Bookmark Heart Button */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              id={`bookmark-btn-${session.id}`}
              className={`p-1.5 rounded-full transition-all duration-300 border flex items-center justify-center ${
                isFavorited
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-sm shadow-rose-500/20 hover:bg-rose-500/30 hover:scale-110'
                  : 'bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border-slate-700/80 hover:border-rose-500/40 hover:scale-105 opacity-80 group-hover:opacity-100'
              }`}
              title={isFavorited ? 'Remove from Favorites' : 'Bookmark to Favorites'}
              aria-label={isFavorited ? 'Remove from Favorites' : 'Bookmark to Favorites'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all duration-200 ${
                  isFavorited ? 'fill-rose-500 text-rose-500 scale-105' : 'text-slate-400 hover:text-rose-400'
                }`}
              />
            </button>

            {/* Subtle Hover-Revealed Preview Button */}
            <button
              type="button"
              onClick={handleStartPreview}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1.5 transition-all duration-300 border ${
                isPreviewing
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800/80 hover:bg-cyan-500/20 text-cyan-300 border-slate-700/80 hover:border-cyan-500/50 shadow-sm opacity-80 group-hover:opacity-100 group-hover:scale-105'
              }`}
              title={isPreviewing ? 'Stop 5-Second Preview' : 'Preview 5-second frequency pattern snippet'}
            >
              {isPreviewing ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-pulse text-slate-950" />
                  <span>{secondsLeft}s</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                  <span>Preview</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-1 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{session.durationMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Title and Subtitle */}
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
          {session.title}
        </h3>
        <p className="text-xs text-cyan-200/70 mb-2 font-medium">
          {session.subtitle}
        </p>

        {/* 5-SECOND ACTIVE PREVIEW OVERLAY / SNIPPET */}
        {isPreviewing ? (
          <div className="my-3 p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-2.5 animate-in zoom-in-95 duration-200 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  5s Pattern Preview
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                  {secondsLeft}s remaining
                </span>
                <button
                  type="button"
                  onClick={handleStopPreview}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Close preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Cymatics Frequency Canvas */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={280}
                height={120}
                className="w-full h-28 object-contain"
              />

              {/* Overlay badges for telemetry */}
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-none text-[9px] font-mono text-cyan-200/90">
                <span className="bg-slate-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-slate-800">
                  {primaryPhase.frequencyHz} Hz {primaryPhase.waveform.toUpperCase()}
                </span>
                {primaryPhase.binauralBeatHz && (
                  <span className="bg-slate-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded border border-slate-800">
                    +{primaryPhase.binauralBeatHz} Hz Binaural
                  </span>
                )}
              </div>
            </div>

            {/* 5s Countdown Progress Line */}
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-indigo-400 h-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Phase: <strong className="text-slate-200">{primaryPhase.name}</strong></span>
              <span className="text-cyan-300 font-medium">Harmonic Synthesizer Active</span>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {session.description}
            </p>

            {/* Phases Overview */}
            <div className="space-y-1.5 mb-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 group-hover:border-slate-700/80 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Phase Cascade ({session.phases.length} Phases):
                </span>
                {hasCompletedPreview && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Previewed
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 flex-wrap gap-y-1">
                {session.phases.map((p) => (
                  <span
                    key={p.id}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono group-hover:border-cyan-900/50 transition-colors"
                  >
                    {p.frequencyHz}Hz
                  </span>
                ))}
              </div>
            </div>

            {/* Target Goals */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {session.targetGoals.slice(0, 3).map(g => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800"
                >
                  {g}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
        <span className="text-xs text-slate-400">
          By <strong className="text-slate-300">{session.author || 'Clinical Specialist'}</strong>
        </span>

        <div className="flex items-center space-x-2">
          {!isPreviewing && (
            <button
              type="button"
              onClick={handleStartPreview}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition hover:border-cyan-500/40"
              title="Preview 5-second frequency pattern"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isPreviewing) {
                soundEngine.stop();
                onTogglePreview(null);
              }
              onInitiateSession(session);
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 transition group-hover:shadow-cyan-500/30 group-hover:scale-[1.02]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
