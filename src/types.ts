export interface FrequencyItem {
  id: string;
  name: string;
  frequency: number; // in Hz
  secondaryFrequency?: number; // for binaural or harmonic pairs
  binauralBeat?: number; // difference in Hz
  category: 'pain-relief' | 'stress-anxiety' | 'mood-healing' | 'brainwave' | 'schumann' | 'harmonic-tactile';
  categoryLabel: string;
  waveform: 'sine' | 'triangle' | 'binaural' | 'isochronic' | 'harmonic';
  targetBodyArea: string;
  benefits: string[];
  description: string;
  scientificNotes?: string;
  chakraOrOrgan?: string;
  color: string;
  tags: string[];
  recommendedDurationMinutes: number;
}

export type AmbientSoundType =
  | 'none'
  | 'rain'
  | 'forest'
  | 'ocean'
  | 'stream'
  | 'wind'
  | 'night'
  | 'fire'
  | 'white'
  | 'pink'
  | 'brown'
  | 'bowls'
  | 'cosmic';

export interface SessionPhase {
  id: string;
  name: string;
  durationSeconds: number;
  frequencyId: string;
  frequencyHz: number;
  binauralBeatHz?: number;
  waveform: 'sine' | 'triangle' | 'binaural' | 'isochronic' | 'harmonic';
  ambientSound?: AmbientSoundType;
  ambientVolume: number;
  hapticIntensity: number; // 0 to 100
}

export interface VibroSession {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  durationMinutes: number;
  phases: SessionPhase[];
  difficulty: 'Beginner' | 'Intermediate' | 'Deep Healing';
  targetGoals: string[];
  voiceGuidance: boolean;
  guidedScript?: string[];
  coverGradient: string;
  isCustom?: boolean;
  isSleepSession?: boolean;
  fadeOutMinutes?: number;
  author?: string;
  rating?: number;
  playsCount?: number;
}

export interface SleepScheduleConfig {
  enabled: boolean;
  bedtime: string; // "22:30" (24h format)
  windDownLeadMinutes: number; // e.g. 0, 15, 30, 45 min before bedtime
  durationMinutes: number; // e.g. 30, 45, 60, 90
  fadeDurationMinutes: number; // e.g. 10, 15, 20
  frequencyHz: number; // 432
  deltaBinauralHz: number; // 2.5 Hz delta wave
  ambientSound: AmbientSoundType;
  ambientVolume: number; // 0 to 100
  hapticIntensity: number; // 0 to 100
  daysOfWeek: number[]; // [0,1,2,3,4,5,6] (0 = Sunday)
  lastTriggeredDate?: string; // YYYY-MM-DD
}

export interface MoodLog {
  id: string;
  sessionId?: string;
  sessionTitle?: string;
  timestamp: string;
  preMood: {
    valence: number; // 1 to 10
    stressLevel: number; // 1 to 10
    painLevel: number; // 1 to 10
    energyLevel: number; // 1 to 10
    primaryEmotion: string;
  };
  postMood?: {
    valence: number; // 1 to 10
    stressLevel: number; // 1 to 10
    painLevel: number; // 1 to 10
    energyLevel: number; // 1 to 10
    primaryEmotion: string;
  };
  heartRateBefore?: number;
  heartRateAfter?: number;
  hrvBefore?: number;
  hrvAfter?: number;
  notes?: string;
}

export interface WearableData {
  deviceType: 'Apple Watch' | 'Fitbit Sense' | 'Oura Ring Gen 3' | 'Whoop 4.0' | 'Garmin Venu' | 'Manual Simulator';
  isConnected: boolean;
  lastSynced: string;
  currentHeartRate: number; // bpm
  baselineHeartRate: number;
  hrvMs: number; // ms
  stressScore: number; // 0 to 100
  skinTemperatureVariance: number; // +/- °C
  respiratoryRate: number; // breaths/min
  dailyRecoveryScore: number; // 0 to 100%
  sleepScore?: number;
}

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    badge?: string;
  };
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  sharedRecipe?: VibroSession;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  frequencyTags?: string[];
  likesCount?: number;
}

export interface HardwareProfile {
  id: 'standard-headphones' | 'bone-conduction' | 'vibro-bed' | 'vibro-chair' | 'tactile-vest' | 'subwoofer';
  name: string;
  description: string;
  subBassBoost: number; // dB
  hapticEnabled: boolean;
  stereoSeparation: number; // %
  optimalFrequencyRange: string;
}

export type ThemeId =
  | 'slate'
  | 'deep-earth'
  | 'very-light'
  | 'light-green'
  | 'pinkish'
  | 'autism-calm';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  category: 'dark' | 'light' | 'sensory-accessible';
  description: string;
  autismFriendly?: boolean;
  colors: {
    previewBg: string;
    previewCard: string;
    previewAccent: string;
    previewText: string;
    previewBorder: string;
  };
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialty: string;
  bio: string;
  status: 'active' | 'analyzing' | 'synthesizing';
}

export interface SoundRecommendation {
  recommendedFrequencies: FrequencyItem[];
  suggestedDurationMinutes: number;
  rationale: string;
  targetFocus: string;
  recommendedAmbience: string;
  binauralBeatTarget?: number;
  clinicalNote: string;
}

export type AdminRole = 'parent' | 'guardian' | 'clinician' | 'admin';

export interface AdminPatientProfile {
  id: string;
  name: string;
  relationship: string;
  ageGroup: 'Child' | 'Teen' | 'Adult' | 'Senior';
  conditionFocus: string;
  maxSplDb: number; // e.g. 70, 75, 80 dB safe limit
  maxSessionMinutes: number; // e.g. 20, 30, 45 min limit
  allowedCategories: string[];
  sensoryShieldActive: boolean;
  assignedBedHardwareId: string;
  caregiverNotes: string;
  activePrescriptionsCount: number;
}

export interface AdminSettings {
  pinProtectionEnabled: boolean;
  pinCode: string;
  activeRole: AdminRole;
  activeProfileId: string;
  safetyLimiterEnabled: boolean;
  globalMaxVolumePercent: number;
  preventInfrasoundUnder20Hz: boolean;
  lockExploreToAssignedOnly: boolean;
}
