import React, { useState, useEffect, useRef } from 'react';
import { VibroSession, SessionPhase, WearableData, AmbientSoundType } from '../types';
import { soundEngine } from '../services/soundEngine';
import { storage } from '../services/storage';
import { AMBIENT_SOUNDSCAPES } from '../data/soundscapes';
import { SoundscapeSelector } from './SoundscapeSelector';
import { CymaticsVisualizer } from './CymaticsVisualizer';
import { MasterVolumeControl } from './MasterVolumeControl';
import { ThemeToggle } from './ThemeToggle';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Vibrate,
  Wind,
  Heart,
  Activity,
  Sparkles,
  Sliders,
  CheckCircle,
  X,
  Volume1,
  MessageSquare,
  Trees,
  Layers,
  Moon
} from 'lucide-react';

interface Props {
  session: VibroSession;
  onFinishSession: (session: VibroSession, elapsedSeconds: number) => void;
  onClose: () => void;
}

export const ActiveSessionPlayer: React.FC<Props> = ({
  session,
  onFinishSession,
  onClose
}) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedTotalSeconds, setElapsedTotalSeconds] = useState(0);
  const [phaseSecondsRemaining, setPhaseSecondsRemaining] = useState(
    session.phases[0]?.durationSeconds || 600
  );

  // Audio Mixer State
  const [masterVolume, setMasterVolume] = useState<number>(() => soundEngine.getMasterVolume());
  const [toneVolume, setToneVolume] = useState(75);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>(
    session.phases[0]?.ambientSound || 'none'
  );
  const [ambientVolume, setAmbientVolume] = useState(
    session.phases[0]?.ambientVolume || 30
  );
  const [hapticIntensity, setHapticIntensity] = useState(
    session.phases[0]?.hapticIntensity || 50
  );
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(
    session.voiceGuidance
  );
  const [breathingGuideActive, setBreathingGuideActive] = useState(true);
  const [soundscapeDrawerOpen, setSoundscapeDrawerOpen] = useState(false);

  // Subscribe to master volume changes from soundEngine
  useEffect(() => {
    return soundEngine.subscribeMasterVolume(vol => {
      setMasterVolume(vol);
    });
  }, []);

  // Wearables Live State
  const [wearable, setWearable] = useState<WearableData>(() =>
    storage.getWearableData()
  );

  const currentPhase: SessionPhase = session.phases[currentPhaseIndex] || session.phases[0];
  const timerRef = useRef<number | null>(null);

  const totalSessionSeconds = session.phases.reduce(
    (acc, p) => acc + p.durationSeconds,
    0
  );

  // Compute real-time audio intensity (0.0 to 1.0) reflecting master, tone, ambient, and sleep fade levels
  const sleepFadeRatio = (() => {
    if (!session.isSleepSession) return 1;
    const remainingTotalSeconds = Math.max(0, totalSessionSeconds - elapsedTotalSeconds);
    const fadeDurationSeconds = (session.fadeOutMinutes || 15) * 60;
    if (remainingTotalSeconds <= fadeDurationSeconds) {
      return Math.max(0, remainingTotalSeconds / fadeDurationSeconds);
    }
    return 1;
  })();

  const effectiveMasterRatio = Math.min(1, masterVolume / 80);
  const effectiveToneRatio = (toneVolume / 100) * sleepFadeRatio;
  const effectiveAmbientRatio =
    ambientSound !== 'none' ? (ambientVolume / 100) * sleepFadeRatio : 0;
  const audioIntensity = isPlaying
    ? Math.min(1, (effectiveToneRatio * 0.8 + effectiveAmbientRatio * 0.35) * effectiveMasterRatio)
    : 0.1;

  // Start sound when phase changes or play state updates
  useEffect(() => {
    if (isPlaying && currentPhase) {
      soundEngine.play({
        frequency: currentPhase.frequencyHz,
        binauralBeat: currentPhase.binauralBeatHz,
        waveform: currentPhase.waveform,
        volume: toneVolume,
        ambientSound: ambientSound,
        ambientVolume: ambientVolume,
        hapticIntensity: hapticIntensity
      });

      // Voice guidance trigger
      if (voiceGuidanceEnabled && session.guidedScript && session.guidedScript[currentPhaseIndex]) {
        soundEngine.speakGuidance(session.guidedScript[currentPhaseIndex]);
      }
    } else {
      soundEngine.stop();
    }

    return () => {
      soundEngine.stop();
    };
  }, [currentPhaseIndex, isPlaying]);

  // Handle volume adjustments dynamically (with gradual sleep fade-out if active)
  useEffect(() => {
    if (session.isSleepSession) {
      const remainingTotalSeconds = Math.max(0, totalSessionSeconds - elapsedTotalSeconds);
      const fadeDurationSeconds = (session.fadeOutMinutes || 15) * 60;
      if (remainingTotalSeconds <= fadeDurationSeconds) {
        const fadeRatio = Math.max(0, remainingTotalSeconds / fadeDurationSeconds);
        soundEngine.setToneVolume(Math.round(toneVolume * fadeRatio));
        return;
      }
    }
    soundEngine.setToneVolume(toneVolume);
  }, [toneVolume, elapsedTotalSeconds, session.isSleepSession, session.fadeOutMinutes, totalSessionSeconds]);

  useEffect(() => {
    if (session.isSleepSession) {
      const remainingTotalSeconds = Math.max(0, totalSessionSeconds - elapsedTotalSeconds);
      const fadeDurationSeconds = (session.fadeOutMinutes || 15) * 60;
      if (remainingTotalSeconds <= fadeDurationSeconds) {
        const fadeRatio = Math.max(0, remainingTotalSeconds / fadeDurationSeconds);
        soundEngine.setAmbientVolume(Math.round(ambientVolume * fadeRatio));
        return;
      }
    }
    soundEngine.setAmbientVolume(ambientVolume);
  }, [ambientVolume, elapsedTotalSeconds, session.isSleepSession, session.fadeOutMinutes, totalSessionSeconds]);

  // Dynamic ambient soundscape change without retriggering tone
  const handleAmbientSoundChange = (newSound: AmbientSoundType) => {
    setAmbientSound(newSound);
    soundEngine.setAmbientSound(newSound, ambientVolume);
  };

  const handleAmbientVolumeChange = (newVolume: number) => {
    setAmbientVolume(newVolume);
    soundEngine.setAmbientVolume(newVolume);
  };

  // Main countdown & biometric timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setElapsedTotalSeconds(prev => prev + 1);

      // Biofeedback relaxation trend over time
      setWearable(prev => {
        const hrTarget = Math.max(56, prev.baselineHeartRate - 8);
        const newHr = prev.currentHeartRate > hrTarget ? prev.currentHeartRate - 0.2 : prev.currentHeartRate;
        const newHrv = Math.min(95, prev.hrvMs + 0.3);
        const newStress = Math.max(12, prev.stressScore - 0.4);
        return {
          ...prev,
          currentHeartRate: Math.round(newHr * 10) / 10,
          hrvMs: Math.round(newHrv * 10) / 10,
          stressScore: Math.round(newStress)
        };
      });

      setPhaseSecondsRemaining(prev => {
        if (prev <= 1) {
          // Advance to next phase
          if (currentPhaseIndex < session.phases.length - 1) {
            const nextIdx = currentPhaseIndex + 1;
            setCurrentPhaseIndex(nextIdx);
            return session.phases[nextIdx].durationSeconds;
          } else {
            // Completed all phases
            completeSession();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentPhaseIndex, session.phases]);

  const completeSession = () => {
    setIsPlaying(false);
    soundEngine.stop();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch { /* noop */ }
    onFinishSession(session, elapsedTotalSeconds);
  };

  const handleSkipPhase = () => {
    if (currentPhaseIndex < session.phases.length - 1) {
      const nextIdx = currentPhaseIndex + 1;
      setCurrentPhaseIndex(nextIdx);
      setPhaseSecondsRemaining(session.phases[nextIdx].durationSeconds);
    } else {
      completeSession();
    }
  };

  const handleRestart = () => {
    setCurrentPhaseIndex(0);
    setElapsedTotalSeconds(0);
    setPhaseSecondsRemaining(session.phases[0].durationSeconds);
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeSoundscapeData = AMBIENT_SOUNDSCAPES.find(s => s.id === ambientSound);

  return (
    <div
      id="active-session-modal"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Active Vibroacoustic Session • {session.category}
            </span>
            <h1 className="text-lg font-bold text-white leading-tight">
              {session.title}
            </h1>
          </div>
        </div>

        {/* Wearable Real-time Live Widget */}
        <div className="hidden md:flex items-center space-x-4 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs text-rose-400">
            <Heart className="w-4 h-4 animate-pulse" />
            <span className="font-semibold">{Math.round(wearable.currentHeartRate)} BPM</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
            <Activity className="w-4 h-4" />
            <span>HRV: <strong>{Math.round(wearable.hrvMs)} ms</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="text-xs text-slate-400">
            Stress: <strong className="text-cyan-300">{wearable.stressScore}/100</strong>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle variant="header" />
          <button
            onClick={() => {
              soundEngine.stop();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Exit Session"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visualizer & Phase Progression (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Cymatics Visualizer */}
          <CymaticsVisualizer
            frequency={currentPhase.frequencyHz}
            secondaryFrequency={currentPhase.binauralBeatHz ? currentPhase.frequencyHz + currentPhase.binauralBeatHz : undefined}
            isPlaying={isPlaying}
            intensity={audioIntensity}
            breathingGuide={breathingGuideActive}
            className="w-full h-[380px] md:h-[440px]"
          />

          {/* Phase Progression Timeline */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300">
                Phase {currentPhaseIndex + 1} of {session.phases.length}: {currentPhase.name}
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {formatTime(phaseSecondsRemaining)} remaining in phase
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${session.phases.length}, minmax(0, 1fr))` }}>
              {session.phases.map((p, idx) => {
                const isPassed = idx < currentPhaseIndex;
                const isCurrent = idx === currentPhaseIndex;
                const percent = isPassed
                  ? 100
                  : isCurrent
                  ? ((p.durationSeconds - phaseSecondsRemaining) / p.durationSeconds) * 100
                  : 0;

                return (
                  <div key={p.id} className="space-y-1">
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className={`block text-[10px] truncate ${isCurrent ? 'text-cyan-300 font-semibold' : 'text-slate-500'}`}>
                      {p.name.split(':')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spoken Guidance Prompt (If applicable) */}
          {session.guidedScript && session.guidedScript[currentPhaseIndex] && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start space-x-3 text-xs text-indigo-200">
              <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-indigo-300 mb-0.5">Clinical Voice Cue:</strong>
                <p className="italic">"{session.guidedScript[currentPhaseIndex]}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Audio & Tactile Mixer & Session Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Session Timer Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
            <div className="text-4xl md:text-5xl font-extrabold font-mono tracking-wider text-white">
              {formatTime(elapsedTotalSeconds)}
              <span className="text-slate-500 text-xl font-normal ml-2">
                / {formatTime(totalSessionSeconds)}
              </span>
            </div>

            {session.isSleepSession && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 text-xs font-medium">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>432Hz Sleep Fade Active ({session.fadeOutMinutes || 15}m Fade-to-Silence)</span>
              </div>
            )}

            {/* Playback Transport Controls */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={handleRestart}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Restart Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                id="session-play-pause-btn"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSkipPhase}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Skip to Next Phase"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={completeSession}
                className="px-4 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-bold transition flex items-center space-x-1.5"
                title="Finish & Save Session"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete</span>
              </button>
            </div>
          </div>

          {/* Multi-Channel Sound & Transducer Mixer */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4" />
                <span>Acoustic & Tactile Mixer</span>
              </h3>
              <span className="text-[11px] text-slate-400">Zero-Latency DSP</span>
            </div>

            {/* Master Stage Volume Control (Default 70%) */}
            <MasterVolumeControl variant="mixer" />

            {/* 1. Primary Frequency Channel */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  Primary Tone Channel ({currentPhase.frequencyHz} Hz)
                </span>
                <span className="text-cyan-400 font-mono">{toneVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={toneVolume}
                onChange={e => setToneVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* 2. Ambient Soundscape Selection & Layering */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
                  <Trees className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ambient Nature Soundscape</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSoundscapeDrawerOpen(!soundscapeDrawerOpen)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 transition"
                >
                  <span>{soundscapeDrawerOpen ? 'Collapse Suite' : 'Expand Catalog'}</span>
                  <Layers className="w-3 h-3" />
                </button>
              </div>

              {/* Soundscape Selector with full nature and noise library */}
              <SoundscapeSelector
                selectedSound={ambientSound}
                volume={ambientVolume}
                onSelectSound={handleAmbientSoundChange}
                onVolumeChange={handleAmbientVolumeChange}
                compact={!soundscapeDrawerOpen}
              />
            </div>

            {/* 3. Vibroacoustic Transducer & Haptic Intensity */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                  <Vibrate className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vibro-Tactile Transducer Force</span>
                </span>
                <span className="text-amber-400 font-mono">{hapticIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hapticIntensity}
                onChange={e => setHapticIntensity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Extra Session Feature Toggles */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={breathingGuideActive}
                  onChange={e => setBreathingGuideActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700"
                />
                <span>Visual Breathing Circle</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceGuidanceEnabled}
                  onChange={e => setVoiceGuidanceEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-700"
                />
                <span>Voice Guidance Cues</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

