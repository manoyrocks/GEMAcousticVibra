import React, { useState, useEffect } from 'react';
import {
  AdminRole,
  AdminPatientProfile,
  AdminSettings,
  FrequencyItem,
  VibroSession
} from '../types';
import { storage } from '../services/storage';
import { AiConsultant } from './AiConsultant';
import { FrequencyLibrary } from './FrequencyLibrary';
import { CommunityForum } from './CommunityForum';
import { WearableHardwareIntegration } from './WearableHardwareIntegration';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Users,
  Cpu,
  Sliders,
  UserCheck,
  Lock,
  Unlock,
  Volume2,
  Clock,
  Heart,
  Plus,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Info,
  Sparkles,
  Layers,
  Bed,
  Activity,
  FileText,
  UserPlus,
  Bot,
  Stethoscope
} from 'lucide-react';

export type AdminSubTab = 'safety' | 'doctor' | 'library' | 'community' | 'hardware';

interface Props {
  initialSubTab?: AdminSubTab;
  onStartSessionWithFrequency: (freq: FrequencyItem) => void;
  onImportSession: (session: VibroSession) => void;
}

export const AdminGuardianPortal: React.FC<Props> = ({
  initialSubTab = 'safety',
  onStartSessionWithFrequency,
  onImportSession
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [settings, setSettings] = useState<AdminSettings>(() => storage.getAdminSettings());
  const [profiles, setProfiles] = useState<AdminPatientProfile[]>(() => storage.getAdminProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(
    () => storage.getAdminSettings().activeProfileId || 'profile-1'
  );

  // PIN Lock Verification State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!storage.getAdminSettings().pinProtectionEnabled);

  // New/Edit Profile Modal
  const [editingProfile, setEditingProfile] = useState<AdminPatientProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateSettings = (updates: Partial<AdminSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    storage.saveAdminSettings(updated);
    showToast('Admin settings updated');
  };

  const handleUpdateActiveProfile = (updates: Partial<AdminPatientProfile>) => {
    const updatedProfiles = profiles.map(p =>
      p.id === activeProfileId ? { ...p, ...updates } : p
    );
    setProfiles(updatedProfiles);
    storage.saveAdminProfiles(updatedProfiles);
    showToast('Patient profile parameters saved');
  };

  const handleSaveProfile = (profile: AdminPatientProfile) => {
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    let updated: AdminPatientProfile[];
    if (existingIndex >= 0) {
      updated = [...profiles];
      updated[existingIndex] = profile;
    } else {
      updated = [...profiles, profile];
    }
    setProfiles(updated);
    storage.saveAdminProfiles(updated);
    setIsProfileModalOpen(false);
    setEditingProfile(null);
    showToast(`Profile "${profile.name}" saved`);
  };

  const handleUnlockWithPin = () => {
    if (pinInput === settings.pinCode) {
      setIsUnlocked(true);
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError(false);
      showToast('Guardian access verified');
    } else {
      setPinError(true);
    }
  };

  return (
    <div id="admin-guardian-portal" className="space-y-6">
      {/* Top Banner & Supervisory Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/40 p-5 md:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950/60">
              <Shield className="w-7 h-7 text-indigo-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Guardian & Clinical Oversight
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Safe Frequency Guard Active
                </span>
                {activeProfile?.sensoryShieldActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                    Sensory Shielding ON
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Admin, Guardian & Clinician Portal
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Centralized supervisory management for parents, caregivers, and therapists. Configure safe acoustic output limits, oversee patient profiles, manage the sound frequency repository, community clinical recipes, and connected vibro-beds.
              </p>
            </div>
          </div>

          {/* Role Switcher & PIN Protection Status */}
          <div className="flex items-center space-x-3 self-start lg:self-center bg-slate-950/80 p-2.5 rounded-2xl border border-indigo-900/40 shrink-0">
            {/* Role Selector */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Active Perspective
              </span>
              <select
                value={settings.activeRole}
                onChange={(e) => handleUpdateSettings({ activeRole: e.target.value as AdminRole })}
                className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                aria-label="Active Admin Role"
              >
                <option value="parent">Parent / Family Guardian</option>
                <option value="clinician">Licensed Clinician / Therapist</option>
                <option value="guardian">Caregiver / Specialist</option>
                <option value="admin">System Acoustic Administrator</option>
              </select>
            </div>

            {/* Lock / Unlock Toggle */}
            <div className="border-l border-slate-800 pl-3">
              <button
                type="button"
                onClick={() => {
                  if (settings.pinProtectionEnabled) {
                    if (isUnlocked) {
                      setIsUnlocked(false);
                      showToast('Guardian module locked');
                    } else {
                      setIsPinModalOpen(true);
                    }
                  } else {
                    handleUpdateSettings({ pinProtectionEnabled: true });
                  }
                }}
                className={`p-2 rounded-xl border transition flex items-center justify-center ${
                  settings.pinProtectionEnabled && !isUnlocked
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title={settings.pinProtectionEnabled ? (isUnlocked ? 'Lock Settings' : 'Unlock Settings') : 'Enable PIN Protection'}
              >
                {settings.pinProtectionEnabled ? (
                  isUnlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Module Navigation Bar */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-indigo-950/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'safety', label: 'Safety & Patient Profiles', icon: Sliders, desc: 'Guardrails, Decibels & Profiles' },
            { id: 'doctor', label: 'AI Sound Guru', icon: Bot, desc: 'Clinical Frequency Prescriptions' },
            { id: 'library', label: 'Frequency Library', icon: Radio, desc: 'Acoustic Tones & Generators' },
            { id: 'community', label: 'Community & Clinical Recipes', icon: Users, desc: 'Shared Protocols' },
            { id: 'hardware', label: 'Hardware, Beds & Mats', icon: Cpu, desc: 'Transducers & Vibro-Beds' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-subtab-${tab.id}`}
                onClick={() => setActiveSubTab(tab.id as AdminSubTab)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition shrink-0 ${
                  isActive
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/50'
                    : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-semibold shadow-2xl border border-indigo-400 flex items-center space-x-2 animate-in slide-in-from-bottom-3">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SUB-VIEW 1: SAFETY & CAREGIVER CONTROLS */}
      {activeSubTab === 'safety' && (
        <div className="space-y-6">
          {/* Managed Patient / Family Member Profiles Selector Bar */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Managed Profiles
                </span>
                <h3 className="text-base font-bold text-white">
                  Active Patient / Family Member Configuration
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingProfile({
                    id: `profile-${Date.now()}`,
                    name: 'New Family Member',
                    relationship: 'Child / Family',
                    ageGroup: 'Child',
                    conditionFocus: 'Calming & Stress Relief',
                    maxSplDb: 74,
                    maxSessionMinutes: 30,
                    allowedCategories: ['Circadian Sleep & Wind-Down', 'Stress & Anxiety Relief'],
                    sensoryShieldActive: true,
                    assignedBedHardwareId: 'vibro-bed',
                    caregiverNotes: '',
                    activePrescriptionsCount: 1
                  });
                  setIsProfileModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Profile</span>
              </button>
            </div>

            {/* Profile Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {profiles.map((prof) => {
                const isSelected = prof.id === activeProfileId;
                return (
                  <div
                    key={prof.id}
                    onClick={() => {
                      setActiveProfileId(prof.id);
                      handleUpdateSettings({ activeProfileId: prof.id });
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {prof.relationship} • {prof.ageGroup}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white">{prof.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{prof.conditionFocus}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Max: <strong className="text-indigo-300">{prof.maxSplDb} dB</strong></span>
                      <span>Cap: <strong className="text-indigo-300">{prof.maxSessionMinutes}m</strong></span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProfile(prof);
                          setIsProfileModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Edit Profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Profile Safety Guardrails & Sound Limiter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Guardrail 1: Decibel & SPL Ceiling */}
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">Safe SPL Decibel Ceiling</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/50">
                  {activeProfile?.maxSplDb || 75} dB SPL
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Prevents accidental acoustic over-amplification. World Health Organization safe listening threshold for sensitive ears.
              </p>

              <input
                type="range"
                min="60"
                max="85"
                step="1"
                value={activeProfile?.maxSplDb || 75}
                onChange={(e) => handleUpdateActiveProfile({ maxSplDb: Number(e.target.value) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                aria-label="Decibel Ceiling Slider"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>60 dB (Gentle Whisper)</span>
                <span>72 dB (Pediatric Safe)</span>
                <span>85 dB (Max Limit)</span>
              </div>
            </div>

            {/* Guardrail 2: Maximum Session Duration Cap */}
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">Session Duration Cap</span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-800/50">
                  {activeProfile?.maxSessionMinutes || 30} Min Max
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically winds down the session after the maximum time limit to prevent sensory fatigue or overstimulation.
              </p>

              <div className="grid grid-cols-4 gap-1.5">
                {[15, 25, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleUpdateActiveProfile({ maxSessionMinutes: mins })}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                      activeProfile?.maxSessionMinutes === mins
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Guardrail 3: Infrasound Guard & Sensory Shield */}
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 space-y-4 md:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">Sensory & Frequency Filters</span>
                </div>
              </div>

              {/* Sensory Shield Switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Sensory Shield (Anti-Overload)</span>
                  <span className="text-[10px] text-slate-400">Forces smooth 3-second acoustic ramp-up</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateActiveProfile({ sensoryShieldActive: !activeProfile?.sensoryShieldActive })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    activeProfile?.sensoryShieldActive ? 'bg-purple-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition ${
                      activeProfile?.sensoryShieldActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Infrasound Filter Switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-200 block">Infrasound Guard (&lt; 20 Hz)</span>
                  <span className="text-[10px] text-slate-400">Blocks unverified high-amplitude resonance</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateSettings({ preventInfrasoundUnder20Hz: !settings.preventInfrasoundUnder20Hz })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    settings.preventInfrasoundUnder20Hz ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition ${
                      settings.preventInfrasoundUnder20Hz ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Caregiver Clinical Notes & Assigned Prescriptions */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Caregiver & Clinician Notes for {activeProfile?.name}
                </h3>
              </div>
              <span className="text-xs text-slate-400">Auto-saved to patient record</span>
            </div>

            <textarea
              rows={3}
              value={activeProfile?.caregiverNotes || ''}
              onChange={(e) => handleUpdateActiveProfile({ caregiverNotes: e.target.value })}
              placeholder="Enter patient observations, favorite calming frequencies, somatic reactions, or therapist instructions..."
              className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: NESTED AI SOUND GURU & CLINICAL PRESCRIPTIONS */}
      {activeSubTab === 'doctor' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-950/80 border border-indigo-900/30 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>
                <strong>AI Sound Guru & Clinical Prescriptions:</strong> Somatic intake and customized sound frequency protocols tailored for <strong>{activeProfile?.name}</strong>.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/40">
              Profile: {activeProfile?.name} ({activeProfile?.ageGroup})
            </span>
          </div>

          <AiConsultant
            onLaunchRecommendedSession={onImportSession}
          />
        </div>
      )}

      {/* SUB-VIEW 3: NESTED FREQUENCY LIBRARY */}
      {activeSubTab === 'library' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-950/80 border border-indigo-900/30 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>
                <strong>Admin Frequency Calibrator:</strong> Full access to Solfeggio, Brainwave, Schumann Resonance and tactile haptic generators.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/40">
              Output Guard: {activeProfile?.maxSplDb || 75} dB Max
            </span>
          </div>

          <FrequencyLibrary
            onStartSessionWithFrequency={onStartSessionWithFrequency}
          />
        </div>
      )}

      {/* SUB-VIEW 3: NESTED COMMUNITY & CLINICAL PROTOCOLS */}
      {activeSubTab === 'community' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-950/80 border border-indigo-900/30 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>
                <strong>Clinical & Peer Protocol Hub:</strong> Review, import, and share verified sound therapy workflows with patient tags.
              </span>
            </div>
          </div>

          <CommunityForum
            onImportSession={onImportSession}
          />
        </div>
      )}

      {/* SUB-VIEW 4: NESTED HARDWARE, BEDS & MATS */}
      {activeSubTab === 'hardware' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-950/80 border border-indigo-900/30 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Bed className="w-4 h-4 text-indigo-400" />
              <span>
                <strong>Acoustic Beds & Hardware Controller:</strong> Manage tactile mattress pads, lounge beds, bone-conduction transducers, and biometric sensors.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/40">
              Assigned Bed: Vibro-Acoustic Water/Air Bed
            </span>
          </div>

          <WearableHardwareIntegration />
        </div>
      )}

      {/* PIN Unlock Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-300">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Guardian PIN Verification</h3>
              <p className="text-xs text-slate-400">
                Enter your 4-digit caregiver PIN (default is 1234) to unlock protected controls.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter PIN"
                className="w-full text-center tracking-widest text-lg font-mono font-bold py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              {pinError && (
                <p className="text-[11px] text-rose-400 text-center font-medium">
                  Incorrect PIN code. Please retry.
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnlockWithPin}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20"
              >
                Verify & Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Profile Modal */}
      {isProfileModalOpen && editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Configure Patient / Family Profile
              </h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Name / Identifier</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Relationship / Role</label>
                  <input
                    type="text"
                    value={editingProfile.relationship}
                    onChange={(e) => setEditingProfile({ ...editingProfile, relationship: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Age Group</label>
                  <select
                    value={editingProfile.ageGroup}
                    onChange={(e) => setEditingProfile({ ...editingProfile, ageGroup: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                  >
                    <option value="Child">Child</option>
                    <option value="Teen">Teen</option>
                    <option value="Adult">Adult</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Condition / Therapeutic Focus</label>
                <input
                  type="text"
                  value={editingProfile.conditionFocus}
                  onChange={(e) => setEditingProfile({ ...editingProfile, conditionFocus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Max Safe Decibels (dB SPL)</label>
                  <input
                    type="number"
                    min="60"
                    max="85"
                    value={editingProfile.maxSplDb}
                    onChange={(e) => setEditingProfile({ ...editingProfile, maxSplDb: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Max Session Time (Mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={editingProfile.maxSessionMinutes}
                    onChange={(e) => setEditingProfile({ ...editingProfile, maxSessionMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveProfile(editingProfile)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
