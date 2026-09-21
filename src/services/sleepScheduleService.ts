import { SleepScheduleConfig, VibroSession, AmbientSoundType } from '../types';
import { storage } from './storage';

export function createSleepVibroSession(config: SleepScheduleConfig): VibroSession {
  const totalDuration = config.durationMinutes || 45;
  const fadeMinutes = Math.min(config.fadeDurationMinutes || 15, Math.floor(totalDuration * 0.5));
  
  // Phase 1: Alpha-Theta Descent (First 35% of session)
  const phase1DurationSec = Math.round((totalDuration * 0.35) * 60);
  
  // Phase 2: Deep Delta Somatic Induction (Middle 40% of session)
  const phase2DurationSec = Math.round((totalDuration * 0.40) * 60);
  
  // Phase 3: Gradual Volume Fade-Out (Final 25% of session = fadeMinutes)
  const phase3DurationSec = Math.max(60, (totalDuration * 60) - (phase1DurationSec + phase2DurationSec));

  return {
    id: `sleep-session-${Date.now()}`,
    title: '432 Hz Circadian Sleep Wind-Down',
    subtitle: `Automated ${totalDuration}-minute restorative sleep protocol with gradual volume fade`,
    description: `Scientifically calibrated 432 Hz natural miracle tone infused with ${config.deltaBinauralHz} Hz Delta brainwave pulses. Automatically and smoothly fades to silence over the final ${fadeMinutes} minutes to usher in uninterrupted restorative sleep.`,
    category: 'Circadian Sleep & Wind-Down',
    durationMinutes: totalDuration,
    isSleepSession: true,
    fadeOutMinutes: fadeMinutes,
    difficulty: 'Beginner',
    targetGoals: [
      'Deep Delta Brainwave Induction',
      'Vagus Nerve Downregulation',
      'Zero-Awakening Gradual Volume Fade',
      '432 Hz Harmonic Relaxation'
    ],
    voiceGuidance: false,
    coverGradient: 'from-indigo-950 via-slate-900 to-purple-950',
    phases: [
      {
        id: 'sleep-phase-1',
        name: 'Phase 1: Alpha-to-Theta Somatic Slowdown',
        durationSeconds: phase1DurationSec,
        frequencyId: 'freq-432',
        frequencyHz: 432,
        binauralBeatHz: 4.0, // Theta 4.0Hz transition
        waveform: 'sine',
        ambientSound: config.ambientSound || 'night',
        ambientVolume: config.ambientVolume || 35,
        hapticIntensity: config.hapticIntensity || 25
      },
      {
        id: 'sleep-phase-2',
        name: 'Phase 2: Deep Delta Brainwave Entrainment',
        durationSeconds: phase2DurationSec,
        frequencyId: 'freq-432-delta',
        frequencyHz: 432,
        binauralBeatHz: config.deltaBinauralHz || 2.5, // Deep Delta 2.5Hz
        waveform: 'sine',
        ambientSound: config.ambientSound || 'night',
        ambientVolume: Math.round((config.ambientVolume || 35) * 0.85),
        hapticIntensity: Math.round((config.hapticIntensity || 25) * 0.7)
      },
      {
        id: 'sleep-phase-3',
        name: `Phase 3: Subconscious Slumber & Gradual ${fadeMinutes}m Fade-Out`,
        durationSeconds: phase3DurationSec,
        frequencyId: 'freq-432-fade',
        frequencyHz: 432,
        binauralBeatHz: 1.5, // Deepest Slow-Wave Sleep 1.5Hz
        waveform: 'sine',
        ambientSound: config.ambientSound || 'night',
        ambientVolume: Math.round((config.ambientVolume || 35) * 0.6),
        hapticIntensity: Math.round((config.hapticIntensity || 25) * 0.4)
      }
    ]
  };
}

class SleepScheduleService {
  private config: SleepScheduleConfig;
  private listeners: Set<(config: SleepScheduleConfig) => void> = new Set();
  private triggerListeners: Set<(session: VibroSession) => void> = new Set();
  private checkInterval: number | null = null;

  constructor() {
    this.config = storage.getSleepSchedule();
    this.startBackgroundMonitor();
  }

  public getConfig(): SleepScheduleConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SleepScheduleConfig>): SleepScheduleConfig {
    this.config = { ...this.config, ...newConfig };
    storage.saveSleepSchedule(this.config);
    this.notifyListeners();
    return this.config;
  }

  public subscribe(callback: (config: SleepScheduleConfig) => void): () => void {
    this.listeners.add(callback);
    callback(this.config);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public onAutoTrigger(callback: (session: VibroSession) => void): () => void {
    this.triggerListeners.add(callback);
    return () => {
      this.triggerListeners.delete(callback);
    };
  }

  public launchSleepSessionNow(): VibroSession {
    const session = createSleepVibroSession(this.config);
    return session;
  }

  public getNextTriggerInfo(): {
    targetTimeFormatted: string;
    countdownFormatted: string;
    isSoon: boolean;
    minutesUntil: number;
  } {
    if (!this.config.enabled) {
      return {
        targetTimeFormatted: '--',
        countdownFormatted: 'Disabled',
        isSoon: false,
        minutesUntil: Infinity
      };
    }

    const now = new Date();
    const [bedHour, bedMin] = this.config.bedtime.split(':').map(Number);
    const leadMin = this.config.windDownLeadMinutes || 0;

    // Calculate target trigger time for today
    const target = new Date(now);
    target.setHours(bedHour, bedMin - leadMin, 0, 0);

    // If target has passed today, target tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const diffMs = target.getTime() - now.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    let countdownFormatted = '';
    if (hours > 0) {
      countdownFormatted = `${hours}h ${mins}m`;
    } else {
      countdownFormatted = `${mins}m`;
    }

    // Format target display (e.g., 10:15 PM)
    const targetTimeFormatted = target.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });

    return {
      targetTimeFormatted,
      countdownFormatted,
      isSoon: totalMinutes <= 30,
      minutesUntil: totalMinutes
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.config);
      } catch { /* noop */ }
    });
  }

  private startBackgroundMonitor() {
    if (typeof window === 'undefined') return;
    if (this.checkInterval) clearInterval(this.checkInterval);

    // Check clock every 10 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkScheduledTrigger();
    }, 10000);
  }

  private checkScheduledTrigger() {
    if (!this.config.enabled) return;

    const now = new Date();
    const currentDay = now.getDay();
    if (!this.config.daysOfWeek.includes(currentDay)) return;

    const [bedHour, bedMin] = this.config.bedtime.split(':').map(Number);
    const leadMin = this.config.windDownLeadMinutes || 0;

    const triggerDate = new Date(now);
    triggerDate.setHours(bedHour, bedMin - leadMin, 0, 0);

    const nowTime = now.getTime();
    const triggerTime = triggerDate.getTime();
    
    // If we are within +/- 45 seconds of the scheduled trigger minute
    const isMatchingMinute = Math.abs(nowTime - triggerTime) < 45000;
    const todayDateStr = now.toISOString().split('T')[0];

    if (isMatchingMinute && this.config.lastTriggeredDate !== todayDateStr) {
      this.config.lastTriggeredDate = todayDateStr;
      storage.saveSleepSchedule(this.config);

      const session = createSleepVibroSession(this.config);
      this.triggerListeners.forEach(listener => {
        try {
          listener(session);
        } catch { /* noop */ }
      });
    }
  }
}

export const sleepScheduleService = new SleepScheduleService();
