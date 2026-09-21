import React, { useState, useEffect } from 'react';
import { SleepScheduleConfig, VibroSession, AmbientSoundType } from '../types';
import { sleepScheduleService } from '../services/sleepScheduleService';
import {
  Moon,
  Clock,
  Volume2,
  Sparkles,
  Sliders,
  Play,
  Check,
  CheckCircle2,
  Calendar,
  Waves,
  Vibrate,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface Props {
  onStartSession: (session: VibroSession) => void;
  className?: string;
}

const BEDTIME_PRESETS = [
  { label: '9:30 PM', time: '21:30' },
  { label: '10:00 PM', time: '22:00' },
  { label: '10:30 PM', time: '22:30' },
  { label: '11:00 PM', time: '23:00' },
  { label: '11:30 PM', time: '23:30' },
  { label: '12:00 AM', time: '00:00' }
];

const AMBIENT_OPTIONS: { id: AmbientSoundType; label: string; desc: string }[] = [
  { id: 'night', label: 'Night Meadow & Crickets', desc: 'Calming summer night ambiance' },
  { id: 'cosmic', label: 'Cosmic Deep Drone', desc: 'Space-like soothing harmonic drone' },
  { id: 'rain', label: 'Gentle Rain on Canopy', desc: 'Rhythmic soft raindrops' },
  { id: 'ocean', label: 'Twilight Ocean Tide', desc: 'Slow rolling rhythmic sea waves' },
  { id: 'brown', label: 'Warm Brown Noise', desc: 'Deep low-frequency mask for racing thoughts' },
  { id: 'bowls', label: 'Tibetan Sleep Bowls', desc: 'Resonant harmonic bell washes' },
  { id: 'none', label: 'Pure 432 Hz Tone Only', desc: 'Clean unmodulated acoustic tone' }
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SleepSchedulerCard: React.FC<Props> = ({ onStartSession, className = '' }) => {
  const [config, setConfig] = useState<SleepScheduleConfig>(() => sleepScheduleService.getConfig());
  const [triggerInfo, setTriggerInfo] = useState(() => sleepScheduleService.getNextTriggerInfo());
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Subscribe to service updates and countdown timer
  useEffect(() => {
    const unsub = sleepScheduleService.subscribe((newCfg) => {
      setConfig(newCfg);
      setTriggerInfo(sleepScheduleService.getNextTriggerInfo());
    });

    const interval = setInterval(() => {
      setTriggerInfo(sleepScheduleService.getNextTriggerInfo());
    }, 15000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleUpdate = (updates: Partial<SleepScheduleConfig>) => {
    const updated = sleepScheduleService.updateConfig(updates);
    setConfig(updated);
    setTriggerInfo(sleepScheduleService.getNextTriggerInfo());
    
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleDayToggle = (dayIndex: number) => {
    let newDays = [...config.daysOfWeek];
    if (newDays.includes(dayIndex)) {
      if (newDays.length > 1) {
        newDays = newDays.filter(d => d !== dayIndex);
      }
    } else {
      newDays.push(dayIndex);
      newDays.sort((a, b) => a - b);
    }
    handleUpdate({ daysOfWeek: newDays });
  };

  const handleStartNow = () => {
    const session = sleepScheduleService.launchSleepSessionNow();
    onStartSession(session);
  };

  return (
    <div
      id="sleep-scheduler-card"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 shadow-xl p-5 md:p-7 space-y-6 ${className}`}
    >
      {/* Top Header & Enable Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-950/60 pb-5">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950/50">
            <Moon className="w-6 h-6 text-indigo-300 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Circadian Rhythm Optimization
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                432 Hz Miracle Tone
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Sleep Scheduler & Auto-Wind Down
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Automatically triggers a calming 432 Hz vibroacoustic session with Delta brainwave pulses, gradually fading to silence as you fall asleep.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-indigo-900/50">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200 block">
              {config.enabled ? 'Auto-Trigger Active' : 'Schedule Paused'}
            </span>
            <span className="text-[10px] text-slate-400">
              {config.enabled ? 'Armed for bedtime' : 'Manual start only'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleUpdate({ enabled: !config.enabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              config.enabled ? 'bg-indigo-500' : 'bg-slate-800'
            }`}
            aria-label="Toggle Sleep Scheduler"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                config.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Live Trigger Status Banner */}
      <div className={`p-4 rounded-2xl border transition ${
        config.enabled
          ? 'bg-indigo-950/40 border-indigo-800/50 text-indigo-200'
          : 'bg-slate-950/60 border-slate-800 text-slate-400'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <Clock className={`w-4 h-4 shrink-0 ${config.enabled ? 'text-indigo-400' : 'text-slate-500'}`} />
            <div>
              {config.enabled ? (
                <span>
                  Next Wind-Down triggers at <strong>{triggerInfo.targetTimeFormatted}</strong> ({config.windDownLeadMinutes > 0 ? `${config.windDownLeadMinutes}m before ${config.bedtime}` : 'at bedtime'})
                </span>
              ) : (
                <span>Schedule is currently paused. Use "Launch Now" below for immediate 432 Hz wind-down.</span>
              )}
            </div>
          </div>

          {config.enabled && (
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded-lg border border-indigo-700/50 font-semibold">
                Countdown: {triggerInfo.countdownFormatted}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping" />
                ARMED
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Bedtime & Lead Time */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Target Bedtime
            </span>
            <span className="text-xs font-mono text-indigo-300 font-semibold">
              {config.bedtime}
            </span>
          </div>

          {/* Time Picker */}
          <input
            type="time"
            value={config.bedtime}
            onChange={(e) => handleUpdate({ bedtime: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
            aria-label="Target Bedtime"
          />

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {BEDTIME_PRESETS.map((preset) => (
              <button
                key={preset.time}
                type="button"
                onClick={() => handleUpdate({ bedtime: preset.time })}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-center transition ${
                  config.bedtime === preset.time
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Wind-Down Lead Time */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Wind-Down Lead Time</span>
              <span className="text-indigo-400 font-mono text-xs">{config.windDownLeadMinutes} min before</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[0, 15, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleUpdate({ windDownLeadMinutes: mins })}
                  className={`py-1 rounded-lg text-[10px] font-semibold border transition ${
                    config.windDownLeadMinutes === mins
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mins === 0 ? 'Exact' : `-${mins}m`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Duration & Gradual Fade-to-Silence Window */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Duration & Auto-Fade
            </span>
            <span className="text-xs font-mono text-indigo-300 font-semibold">
              {config.durationMinutes} Min Session
            </span>
          </div>

          {/* Total Session Duration */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Total Sleep Session Length</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[30, 45, 60, 90].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => handleUpdate({ durationMinutes: dur })}
                  className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                    config.durationMinutes === dur
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>

          {/* Gradual Volume Fade-Out Window */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Waves className="w-3 h-3 text-indigo-400" />
                Gradual Fade-Out Window
              </span>
              <span className="text-indigo-400 font-mono text-xs font-semibold">
                Last {config.fadeDurationMinutes}m
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {[10, 15, 20, 30].map((fadeMins) => (
                <button
                  key={fadeMins}
                  type="button"
                  onClick={() => handleUpdate({ fadeDurationMinutes: fadeMins })}
                  className={`py-1 rounded-lg text-[10px] font-semibold border transition ${
                    config.fadeDurationMinutes === fadeMins
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fadeMins} min
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 leading-snug pt-0.5">
              Sound attenuation smoothly tapers to 0 dB over the final {config.fadeDurationMinutes} minutes to avoid waking you up.
            </p>
          </div>
        </div>

        {/* 3. Brainwave Delta & Ambient Sound Pairing */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Sleep Soundscape & Delta
            </span>
            <span className="text-xs font-mono text-cyan-300">
              432 Hz + {config.deltaBinauralHz} Hz
            </span>
          </div>

          {/* Ambient Soundscape Select */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Layered Sleep Soundscape</label>
            <select
              value={config.ambientSound}
              onChange={(e) => handleUpdate({ ambientSound: e.target.value as AmbientSoundType })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              aria-label="Sleep Ambient Soundscape"
            >
              {AMBIENT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Delta Entrainment Beat */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Delta Brainwave Frequency</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { hz: 1.5, label: '1.5 Hz Deep' },
                { hz: 2.5, label: '2.5 Hz Rest' },
                { hz: 3.5, label: '3.5 Hz Theta' }
              ].map((binaural) => (
                <button
                  key={binaural.hz}
                  type="button"
                  onClick={() => handleUpdate({ deltaBinauralHz: binaural.hz })}
                  className={`py-1 rounded-lg text-[10px] font-semibold border transition ${
                    config.deltaBinauralHz === binaural.hz
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {binaural.label}
                </button>
              ))}
            </div>
          </div>

          {/* Haptic Pillow / Mattress Intensity */}
          <div className="pt-1.5 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Vibrate className="w-3 h-3 text-indigo-400" />
                Vibrotactile Mat Intensity
              </span>
              <span className="text-indigo-400 font-mono text-[11px] font-bold">
                {config.hapticIntensity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.hapticIntensity}
              onChange={(e) => handleUpdate({ hapticIntensity: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              aria-label="Vibrotactile Mat Intensity"
            />
          </div>
        </div>
      </div>

      {/* Days of the Week Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-indigo-950/60">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold">Active Schedule Days:</span>
        </div>

        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          {DAYS.map((day, idx) => {
            const isSelected = config.daysOfWeek.includes(idx);
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-bold border transition flex items-center justify-center ${
                  isSelected
                    ? 'bg-indigo-500/25 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                title={`Toggle ${day}`}
              >
                {day[0]}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={() => handleUpdate({ daysOfWeek: [0, 1, 2, 3, 4, 5, 6] })}
            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            All Nights
          </button>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-indigo-950/60">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Continuous DSP Sound Engine • Zero abrupt sound cuts</span>
          {showSavedToast && (
            <span className="text-emerald-400 font-medium animate-in fade-in">
              • Schedule Saved!
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleStartNow}
            id="launch-sleep-session-now-btn"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition"
          >
            <Moon className="w-4 h-4 fill-current" />
            <span>Launch 432 Hz Sleep Wind-Down Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
