import {
  MoodLog,
  VibroSession,
  CommunityPost,
  WearableData,
  HardwareProfile,
  ThemeId,
  SleepScheduleConfig,
  AdminPatientProfile,
  AdminSettings
} from '../types';
import { PRESET_SESSIONS } from '../data/presetSessions';

const STORAGE_KEYS = {
  MOOD_LOGS: 'acoustic_vibra_mood_logs',
  CUSTOM_SESSIONS: 'acoustic_vibra_custom_sessions',
  SAVED_FREQUENCIES: 'acoustic_vibra_saved_freqs',
  COMMUNITY_POSTS: 'acoustic_vibra_community_posts',
  WEARABLE_DATA: 'acoustic_vibra_wearable_data',
  USER_PREFERENCES: 'acoustic_vibra_user_prefs',
  HARDWARE_PROFILE: 'acoustic_vibra_hardware_profile',
  ADMIN_SETTINGS: 'acoustic_vibra_admin_settings',
  ADMIN_PROFILES: 'acoustic_vibra_admin_profiles'
};

const INITIAL_MOOD_LOGS: MoodLog[] = [
  {
    id: 'log-1',
    sessionId: 'session-cellular-pain',
    sessionTitle: 'Deep Cellular Pain Relief & Somatic Reset',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    preMood: {
      valence: 4,
      stressLevel: 8,
      painLevel: 7,
      energyLevel: 3,
      primaryEmotion: 'Fatigued & Aching'
    },
    postMood: {
      valence: 8,
      stressLevel: 3,
      painLevel: 2,
      energyLevel: 6,
      primaryEmotion: 'Restored & Relaxed'
    },
    heartRateBefore: 84,
    heartRateAfter: 64,
    hrvBefore: 38,
    hrvAfter: 68,
    notes: 'Significant tension release in lumbar spine after 432 Hz phase.'
  },
  {
    id: 'log-2',
    sessionId: 'session-anxiety-dissolution',
    sessionTitle: 'Vagus Nerve & Acute Anxiety Dissolution',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    preMood: {
      valence: 3,
      stressLevel: 9,
      painLevel: 4,
      energyLevel: 5,
      primaryEmotion: 'Overwhelmed & Anxious'
    },
    postMood: {
      valence: 7,
      stressLevel: 2,
      painLevel: 1,
      energyLevel: 7,
      primaryEmotion: 'Grounded & Centered'
    },
    heartRateBefore: 92,
    heartRateAfter: 68,
    hrvBefore: 31,
    hrvAfter: 72,
    notes: 'The 432.4 Hz harmonic slowed my heart flutter almost immediately.'
  },
  {
    id: 'log-3',
    sessionId: 'session-delta-sleep',
    sessionTitle: 'Delta Deep NREM Sleep Immersion',
    timestamp: new Date(Date.now() - 86400000 * 0.4).toISOString(),
    preMood: {
      valence: 5,
      stressLevel: 7,
      painLevel: 3,
      energyLevel: 2,
      primaryEmotion: 'Restless & Insomniac'
    },
    postMood: {
      valence: 9,
      stressLevel: 1,
      painLevel: 1,
      energyLevel: 8,
      primaryEmotion: 'Deeply Serene & Sleepy'
    },
    heartRateBefore: 78,
    heartRateAfter: 58,
    hrvBefore: 45,
    hrvAfter: 82,
    notes: 'Slept for 7.5 hours uninterrupted with 22% deep sleep phase.'
  }
];

const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: {
      id: 'u-1',
      name: 'Dr. Sarah Lin, MD',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      badge: 'Integrative Neuro-Physiologist'
    },
    createdAt: '2 hours ago',
    title: 'Clinical Protocol: Combining 432.4 Hz with Diaphragmatic Breath for Vagus Activation',
    content: 'In our clinical trials with 48 patients suffering from somatic anxiety, applying 432.4 Hz vibroacoustic resonance while pacing exhalations to 6 seconds increased parasympathetic vagal index by 44% in under 12 minutes. Highly recommend pairing with the bio-pulsar visualizer.',
    category: 'Clinical Research',
    tags: ['432.4 Hz', 'Vagus Nerve', 'Clinical VAT', 'HRV'],
    likes: 142,
    isLiked: false,
    commentsCount: 23,
    sharedRecipe: PRESET_SESSIONS[1]
  },
  {
    id: 'post-2',
    author: {
      id: 'u-2',
      name: 'Julian Thorne',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: 'Sound Bed Practitioner'
    },
    createdAt: '5 hours ago',
    title: 'Sub-bass 33Hz + 66Hz on tactile transducer mat for lower back stiffness',
    content: 'Just ran a 25min Scandinavian sweep session on my acoustic vibration table. The muscular fasciculations in my lumbar spine ceased completely around minute 14. For anyone using tactile chairs, keep the master transducer boost around +4dB for optimum resonance.',
    category: 'Hardware & Vibro Beds',
    tags: ['33 Hz', '66 Hz', 'Vibroacoustic Bed', 'Fascia Release'],
    likes: 89,
    isLiked: true,
    commentsCount: 14,
    sharedRecipe: PRESET_SESSIONS[4]
  },
  {
    id: 'post-3',
    author: {
      id: 'u-3',
      name: 'Maya Patel',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      badge: 'Meditation Guide'
    },
    createdAt: '1 day ago',
    title: '528 Hz + 6.0 Hz Theta for Deep Creative Breakthroughs',
    content: 'Whenever I hit a creative wall during writing, I immerse in the 528 Hz Solfeggio tone with a 6 Hz Theta binaural beat. Within 15 minutes, my mind shifts into effortless associative flow. The sacred mandala visualizer is hypnotic and calming.',
    category: 'Pain Management',
    tags: ['528 Hz', 'Theta 6Hz', 'Cymatics', 'Flow State'],
    likes: 64,
    isLiked: false,
    commentsCount: 9,
    sharedRecipe: PRESET_SESSIONS[2]
  }
];

export const storage = {
  getMoodLogs(): MoodLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOOD_LOGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify(INITIAL_MOOD_LOGS));
        return INITIAL_MOOD_LOGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MOOD_LOGS;
    }
  },

  saveMoodLog(log: MoodLog): MoodLog[] {
    const logs = this.getMoodLogs();
    const updated = [log, ...logs];
    localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify(updated));
    return updated;
  },

  getCustomSessions(): VibroSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomSession(session: VibroSession): VibroSession[] {
    const list = this.getCustomSessions();
    const existingIndex = list.findIndex(s => s.id === session.id);
    let updated: VibroSession[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = session;
    } else {
      updated = [session, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SESSIONS, JSON.stringify(updated));
    return updated;
  },

  deleteCustomSession(id: string): VibroSession[] {
    const list = this.getCustomSessions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SESSIONS, JSON.stringify(list));
    return list;
  },

  getAllSessions(): VibroSession[] {
    const custom = this.getCustomSessions();
    return [...PRESET_SESSIONS, ...custom];
  },

  getSavedFrequencyIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_FREQUENCIES);
      return data ? JSON.parse(data) : ['freq-432-pain', 'freq-528-transformation', 'freq-schumann-fundamental'];
    } catch {
      return ['freq-432-pain', 'freq-528-transformation'];
    }
  },

  toggleSaveFrequency(id: string): string[] {
    const saved = this.getSavedFrequencyIds();
    const index = saved.indexOf(id);
    let updated: string[];
    if (index >= 0) {
      updated = saved.filter(item => item !== id);
    } else {
      updated = [...saved, id];
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_FREQUENCIES, JSON.stringify(updated));
    return updated;
  },

  getCommunityPosts(): CommunityPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(INITIAL_COMMUNITY_POSTS));
        return INITIAL_COMMUNITY_POSTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COMMUNITY_POSTS;
    }
  },

  saveCommunityPost(post: CommunityPost): CommunityPost[] {
    const posts = this.getCommunityPosts();
    const updated = [post, ...posts];
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(updated));
    return updated;
  },

  toggleLikePost(postId: string): CommunityPost[] {
    const posts = this.getCommunityPosts().map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
    return posts;
  },

  getWearableData(): WearableData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEARABLE_DATA);
      if (data) return JSON.parse(data);
    } catch { /* noop */ }

    return {
      deviceType: 'Apple Watch',
      isConnected: true,
      lastSynced: 'Just now',
      currentHeartRate: 68,
      baselineHeartRate: 72,
      hrvMs: 64,
      stressScore: 28,
      skinTemperatureVariance: -0.2,
      respiratoryRate: 14,
      dailyRecoveryScore: 88
    };
  },

  saveWearableData(data: WearableData) {
    localStorage.setItem(STORAGE_KEYS.WEARABLE_DATA, JSON.stringify(data));
  },

  getHardwareProfile(): HardwareProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HARDWARE_PROFILE);
      if (data) return JSON.parse(data);
    } catch { /* noop */ }

    return {
      id: 'standard-headphones',
      name: 'Stereo Headphones / Earbuds',
      description: 'Optimized for clean binaural beat delivery and stereo spatial audio.',
      subBassBoost: 0,
      hapticEnabled: true,
      stereoSeparation: 100,
      optimalFrequencyRange: '20 Hz – 20,000 Hz'
    };
  },

  saveHardwareProfile(profile: HardwareProfile) {
    localStorage.setItem(STORAGE_KEYS.HARDWARE_PROFILE, JSON.stringify(profile));
  },

  getMasterVolume(): number {
    try {
      const val = localStorage.getItem('acoustic_vibra_master_volume');
      if (val !== null) {
        const num = Number(val);
        if (!isNaN(num) && num >= 0 && num <= 100) return num;
      }
    } catch { /* noop */ }
    return 70; // Default master volume is strictly 70%
  },

  saveMasterVolume(vol: number): void {
    try {
      const clamped = Math.max(0, Math.min(100, Math.round(vol)));
      localStorage.setItem('acoustic_vibra_master_volume', clamped.toString());
    } catch { /* noop */ }
  },

  getTheme(): ThemeId {
    try {
      const val = localStorage.getItem('acoustic_vibra_active_theme');
      const validThemes: ThemeId[] = ['slate', 'deep-earth', 'very-light', 'light-green', 'pinkish', 'autism-calm'];
      if (val && validThemes.includes(val as ThemeId)) {
        return val as ThemeId;
      }
    } catch { /* noop */ }
    return 'slate'; // Default classic dark mode
  },

  saveTheme(theme: ThemeId): void {
    try {
      localStorage.setItem('acoustic_vibra_active_theme', theme);
    } catch { /* noop */ }
  },

  getSleepSchedule(): SleepScheduleConfig {
    try {
      const val = localStorage.getItem('acoustic_vibra_sleep_schedule');
      if (val) {
        return JSON.parse(val);
      }
    } catch { /* noop */ }
    // Sensible sleep wind-down default
    return {
      enabled: true,
      bedtime: '22:30', // 10:30 PM
      windDownLeadMinutes: 15, // Starts at 10:15 PM
      durationMinutes: 45, // 45-minute deep restorative protocol
      fadeDurationMinutes: 15, // Fades out over final 15 minutes to 0% silence
      frequencyHz: 432, // 432 Hz Natural Miracle Sleep Harmonic
      deltaBinauralHz: 2.5, // 2.5 Hz Restorative Delta Sleep Beat
      ambientSound: 'night', // Night Meadow & Twilight Crickets
      ambientVolume: 35,
      hapticIntensity: 25,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // Every night
    };
  },

  saveSleepSchedule(schedule: SleepScheduleConfig): void {
    try {
      localStorage.setItem('acoustic_vibra_sleep_schedule', JSON.stringify(schedule));
    } catch { /* noop */ }
  },

  getAdminSettings(): AdminSettings {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
      if (val) return JSON.parse(val);
    } catch { /* noop */ }
    return {
      pinProtectionEnabled: false,
      pinCode: '1234',
      activeRole: 'parent',
      activeProfileId: 'profile-1',
      safetyLimiterEnabled: true,
      globalMaxVolumePercent: 80,
      preventInfrasoundUnder20Hz: true,
      lockExploreToAssignedOnly: false
    };
  },

  saveAdminSettings(settings: AdminSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
    } catch { /* noop */ }
  },

  getAdminProfiles(): AdminPatientProfile[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.ADMIN_PROFILES);
      if (val) return JSON.parse(val);
    } catch { /* noop */ }
    return [
      {
        id: 'profile-1',
        name: 'Leo (Child / Sensory Mode)',
        relationship: 'Son / Child',
        ageGroup: 'Child',
        conditionFocus: 'Sensory Sensitivity, Autism Spectrum & Bedtime Calming',
        maxSplDb: 72,
        maxSessionMinutes: 25,
        allowedCategories: ['Circadian Sleep & Wind-Down', 'Stress & Anxiety Relief', 'Vagus Nerve & Somatic Calm'],
        sensoryShieldActive: true,
        assignedBedHardwareId: 'vibro-bed',
        caregiverNotes: 'Responds strongly to 432 Hz and soft rain soundscapes. Keep haptic tactile below 35% on transducer pad.',
        activePrescriptionsCount: 3
      },
      {
        id: 'profile-2',
        name: 'Eleanor (Senior / Chronic Care)',
        relationship: 'Parent / Senior',
        ageGroup: 'Senior',
        conditionFocus: 'Arthritis Pain, Circulation & Restorative Sleep',
        maxSplDb: 78,
        maxSessionMinutes: 45,
        allowedCategories: ['Cellular Pain Relief', 'Circadian Sleep & Wind-Down', 'Vibroacoustic Physical Rehab'],
        sensoryShieldActive: false,
        assignedBedHardwareId: 'vibro-bed',
        caregiverNotes: '528 Hz cellular renewal with 40 Hz gamma session recommended every Tuesday/Thursday.',
        activePrescriptionsCount: 4
      },
      {
        id: 'profile-3',
        name: 'Clinical Patient #104 (Adult)',
        relationship: 'Client / Therapy Patient',
        ageGroup: 'Adult',
        conditionFocus: 'Post-Traumatic Stress Somatic Downregulation',
        maxSplDb: 80,
        maxSessionMinutes: 60,
        allowedCategories: ['All Clinical Prescriptions', 'Trauma Somatic Reset', 'Theta Brainwave Induction'],
        sensoryShieldActive: false,
        assignedBedHardwareId: 'tactile-vest',
        caregiverNotes: 'Clinician monitoring: Vagal tone stabilization using paired 174 Hz + 4 Hz Theta.',
        activePrescriptionsCount: 5
      }
    ];
  },

  saveAdminProfiles(profiles: AdminPatientProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILES, JSON.stringify(profiles));
    } catch { /* noop */ }
  }
};

