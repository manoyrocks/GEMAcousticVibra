import React, { useState, useEffect } from 'react';
import { VibroSession, FrequencyItem, MoodLog } from './types';
import { PRESET_SESSIONS } from './data/presetSessions';
import { FREQUENCIES_LIBRARY } from './data/frequencies';
import { storage } from './services/storage';
import { soundEngine } from './services/soundEngine';

import { ActiveSessionPlayer } from './components/ActiveSessionPlayer';
import { MoodTracker } from './components/MoodTracker';
import { SessionBuilder } from './components/SessionBuilder';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CymaticsVisualizer } from './components/CymaticsVisualizer';
import { MasterVolumeControl } from './components/MasterVolumeControl';
import { ThemeToggle } from './components/ThemeToggle';
import { SleepSchedulerCard } from './components/SleepSchedulerCard';
import { sleepScheduleService } from './services/sleepScheduleService';
import { AdminGuardianPortal, AdminSubTab } from './components/AdminGuardianPortal';
import { SessionCard } from './components/SessionCard';
import { DocumentationModal } from './components/DocumentationModal';
import { PWAInstallButton } from './components/PWAInstallButton';

import {
  Radio,
  Play,
  Sparkles,
  Sliders,
  Bot,
  BarChart3,
  Users,
  Cpu,
  Plus,
  Clock,
  Zap,
  Heart,
  Volume2,
  Bookmark,
  Layers,
  Search,
  CheckCircle2,
  ChevronRight,
  Shield,
  Activity,
  Menu,
  X,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'explore' | 'ai-doctor' | 'builder' | 'analytics' | 'admin' | 'library' | 'community' | 'hardware'
  >('explore');
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('safety');
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Active Session & Player State
  const [activeSession, setActiveSession] = useState<VibroSession | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Mood Tracker Modal State
  const [moodModalState, setMoodModalState] = useState<{
    isOpen: boolean;
    isPostSession: boolean;
    session?: VibroSession;
    preMoodData?: MoodLog['preMood'];
  }>({
    isOpen: false,
    isPostSession: false
  });

  // Custom sessions saved
  const [customSessions, setCustomSessions] = useState<VibroSession[]>(() =>
    storage.getCustomSessions()
  );

  // Search & Filter in Explore
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewingSessionId, setPreviewingSessionId] = useState<string | null>(null);

  // Filtered preset & custom sessions
  const allSessions = [...customSessions, ...PRESET_SESSIONS];
  const filteredSessions = allSessions.filter(s => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return s.isCustom;
    return s.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Listen for auto-triggered sleep sessions at scheduled bedtime
  useEffect(() => {
    const unsub = sleepScheduleService.onAutoTrigger((sleepSession) => {
      setActiveSession(sleepSession);
      setIsPlayerOpen(true);
    });
    return unsub;
  }, []);

  // Direct start for sleep sessions (smooth friction-free bedtime flow)
  const handleStartSleepSession = (session: VibroSession) => {
    if (previewingSessionId) {
      soundEngine.stop();
      setPreviewingSessionId(null);
    }
    setActiveSession(session);
    setIsPlayerOpen(true);
  };

  // Handler: Start a session with pre-mood calibration check
  const handleInitiateSession = (session: VibroSession) => {
    if (previewingSessionId) {
      soundEngine.stop();
      setPreviewingSessionId(null);
    }
    // Open Pre-session check-in
    setMoodModalState({
      isOpen: true,
      isPostSession: false,
      session: session
    });
  };

  // Handler: Pre-mood check completed -> Launch active player
  const handlePreMoodComplete = (log: MoodLog) => {
    const sessionToStart = moodModalState.session || PRESET_SESSIONS[0];
    setMoodModalState(prev => ({
      ...prev,
      isOpen: false,
      preMoodData: log.preMood
    }));
    setActiveSession(sessionToStart);
    setIsPlayerOpen(true);
  };

  // Handler: Active session completed -> Open post-session check-in
  const handleSessionFinished = (session: VibroSession, elapsedSeconds: number) => {
    setIsPlayerOpen(false);
    setMoodModalState({
      isOpen: true,
      isPostSession: true,
      session: session,
      preMoodData: moodModalState.preMoodData
    });
  };

  // Handler: Post-mood check completed
  const handlePostMoodComplete = (fullLog: MoodLog) => {
    setMoodModalState({ isOpen: false, isPostSession: false });
    // Switch to analytics to celebrate the progress
    setCurrentTab('analytics');
  };

  // Handler: Start quick frequency therapy
  const handleStartFrequencySession = (freq: FrequencyItem) => {
    const quickSession: VibroSession = {
      id: `freq-quick-${Date.now()}`,
      title: `${freq.name.split('—')[0]} Resonance`,
      subtitle: `${freq.frequency} Hz • ${freq.targetBodyArea}`,
      description: freq.description,
      category: freq.categoryLabel,
      durationMinutes: freq.recommendedDurationMinutes,
      difficulty: 'Beginner',
      targetGoals: freq.benefits.slice(0, 3),
      voiceGuidance: true,
      coverGradient: 'from-cyan-600 via-teal-700 to-slate-950',
      author: 'Acoustic Vibra Library',
      rating: 5.0,
      phases: [
        {
          id: 'q-p1',
          name: `${freq.frequency} Hz Pure Resonance`,
          durationSeconds: freq.recommendedDurationMinutes * 60,
          frequencyId: freq.id,
          frequencyHz: freq.frequency,
          binauralBeatHz: freq.binauralBeat,
          waveform: freq.waveform,
          ambientSound: 'ocean',
          ambientVolume: 30,
          hapticIntensity: 50
        }
      ]
    };
    handleInitiateSession(quickSession);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentTab('explore')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Acoustic Vibra
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Vibroacoustic & Sound Frequency Therapy
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'explore', label: 'Sessions', icon: Play },
              { id: 'builder', label: 'Custom Builder', icon: Plus },
              { id: 'analytics', label: 'Biometrics', icon: BarChart3 },
              { id: 'admin', label: 'Admin & Guardians', icon: Shield, badge: 'Caregiver' }
            ].map(item => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id ||
                (item.id === 'admin' && ['admin', 'ai-doctor', 'library', 'community', 'hardware'].includes(currentTab));
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    if (item.id === 'admin') {
                      setAdminSubTab('safety');
                      setCurrentTab('admin');
                    } else {
                      setCurrentTab(item.id as any);
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle, Master Volume, PWA Install & Quick Action Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-2">
            <ThemeToggle variant="header" />
            <MasterVolumeControl variant="header" />
            <PWAInstallButton variant="header" />

            <button
              onClick={() => setIsDocsOpen(true)}
              className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 text-xs font-semibold transition"
              title="Open Clinical Documentation & Manual"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Docs</span>
            </button>

            <button
              onClick={() => handleInitiateSession(PRESET_SESSIONS[0])}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Quick 432 Hz Calm</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 py-3 bg-slate-950 border-b border-slate-800 space-y-2.5">
            {/* Mobile Theme Toggle */}
            <ThemeToggle variant="drawer" />

            {/* Mobile Master Volume */}
            <MasterVolumeControl variant="drawer" />

            {/* Mobile PWA Install */}
            <PWAInstallButton variant="drawer" />

            <div className="pt-1 space-y-1">
              {[
                { id: 'explore', label: 'Therapy Sessions', icon: Play },
                { id: 'builder', label: 'Session Builder', icon: Plus },
                { id: 'analytics', label: 'Biometrics & Mood Tracking', icon: BarChart3 },
                { id: 'admin', label: 'Admin, Guardians & Clinicians', icon: Shield, sub: 'safety' }
              ].map(item => {
                const Icon = item.icon;
                const isActive =
                  currentTab === item.id ||
                  (item.id === 'admin' && ['admin', 'ai-doctor', 'library', 'community', 'hardware'].includes(currentTab));
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'admin') {
                        setAdminSubTab('safety');
                        setCurrentTab('admin');
                      } else {
                        setCurrentTab(item.id as any);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 text-left transition ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setIsDocsOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 text-left transition text-cyan-300 hover:bg-slate-900 border border-slate-800/80"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Clinical Docs & User Manual</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: EXPLORE / SESSIONS DASHBOARD */}
        {currentTab === 'explore' && (
          <div className="space-y-8" id="explore-view">
            {/* Hero Featured Vibroacoustic Protocol */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Clinical Vibroacoustic Preset of the Day</span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {PRESET_SESSIONS[0].title}
                  </h1>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    {PRESET_SESSIONS[0].description}
                  </p>

                  {/* Goal Badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {PRESET_SESSIONS[0].targetGoals.map(goal => (
                      <span
                        key={goal}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950/80 text-cyan-300 border border-cyan-900/50"
                      >
                        ✓ {goal}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-3 pt-3">
                    <button
                      onClick={() => handleInitiateSession(PRESET_SESSIONS[0])}
                      id="hero-start-session-btn"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Therapy ({PRESET_SESSIONS[0].durationMinutes} Min)</span>
                    </button>

                    <button
                      onClick={() => setCurrentTab('ai-doctor')}
                      className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
                    >
                      <Bot className="w-4 h-4 text-cyan-400" />
                      <span>Ask AI Sound Guru</span>
                    </button>
                  </div>
                </div>

                {/* Hero Visualizer Preview */}
                <div className="lg:col-span-5">
                  <CymaticsVisualizer
                    frequency={432}
                    secondaryFrequency={442}
                    isPlaying={true}
                    compact={true}
                    showControls={false}
                    className="w-full h-64 shadow-xl"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Pills & Curated Protocols */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Curated Vibroacoustic Protocols
                  </h2>
                  <p className="text-xs text-slate-400">
                    Scientifically engineered sound cascades with multi-zone transducer mappings.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('builder')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Build Custom Protocol</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'all', label: 'All Protocols' },
                  { id: 'pain', label: 'Pain Relief & Somatic' },
                  { id: 'stress', label: 'Stress & Anxiety' },
                  { id: 'sleep', label: 'Sleep & Delta Waves' },
                  { id: 'mood', label: 'Mood & Emotional Healing' },
                  { id: 'brainwave', label: 'Cognitive & Brainwave' },
                  { id: 'vibro', label: 'Vibro-Bed & Transducers' },
                  { id: 'custom', label: `My Custom (${customSessions.length})` }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-medium border transition ${
                      selectedCategory === c.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Sessions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isPreviewing={previewingSessionId === session.id}
                    onTogglePreview={setPreviewingSessionId}
                    onInitiateSession={handleInitiateSession}
                  />
                ))}
              </div>
            </div>

            {/* Sleep Scheduler & 432 Hz Auto-Wind Down Card (At Bottom) */}
            <SleepSchedulerCard onStartSession={handleStartSleepSession} />
          </div>
        )}

        {/* VIEW 2: CUSTOM SESSION BUILDER */}
        {currentTab === 'builder' && (
          <SessionBuilder
            onSessionCreated={session => {
              setCustomSessions(storage.getCustomSessions());
              handleInitiateSession(session);
            }}
            onCancel={() => setCurrentTab('explore')}
          />
        )}

        {/* VIEW 3: BIOMETRIC ANALYTICS & PROGRESS */}
        {currentTab === 'analytics' && <AnalyticsDashboard />}

        {/* VIEW 4: ADMIN, GUARDIAN & CLINICIAN PORTAL (HOUSES AI SOUND GURU, FREQUENCY LIBRARY, COMMUNITY, HARDWARE & BEDS, AND SAFETY CONTROLS) */}
        {(currentTab === 'admin' ||
          currentTab === 'ai-doctor' ||
          currentTab === 'library' ||
          currentTab === 'community' ||
          currentTab === 'hardware') && (
          <AdminGuardianPortal
            initialSubTab={
              currentTab === 'ai-doctor'
                ? 'doctor'
                : currentTab === 'library'
                ? 'library'
                : currentTab === 'community'
                ? 'community'
                : currentTab === 'hardware'
                ? 'hardware'
                : adminSubTab
            }
            onStartSessionWithFrequency={handleStartFrequencySession}
            onImportSession={handleInitiateSession}
          />
        )}
      </main>

      {/* ACTIVE FULL-SCREEN IMMERSIVE SESSION PLAYER */}
      {isPlayerOpen && activeSession && (
        <ActiveSessionPlayer
          session={activeSession}
          onFinishSession={handleSessionFinished}
          onClose={() => setIsPlayerOpen(false)}
        />
      )}

      {/* PRE & POST SESSION MOOD TRACKING MODAL */}
      {moodModalState.isOpen && (
        <MoodTracker
          session={moodModalState.session}
          isPostSession={moodModalState.isPostSession}
          preMoodData={moodModalState.preMoodData}
          onComplete={log => {
            if (moodModalState.isPostSession) {
              handlePostMoodComplete(log);
            } else {
              handlePreMoodComplete(log);
            }
          }}
          onCancel={() => {
            if (!moodModalState.isPostSession) {
              // Start session anyway
              const s = moodModalState.session || PRESET_SESSIONS[0];
              setMoodModalState({ isOpen: false, isPostSession: false });
              setActiveSession(s);
              setIsPlayerOpen(true);
            } else {
              setMoodModalState({ isOpen: false, isPostSession: false });
            }
          }}
        />
      )}

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">Acoustic Vibra</span>
            <span>— Precision Vibroacoustic Therapy Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-4 flex items-center gap-1 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Clinical Manual & Documentation</span>
            </button>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline">Grounded in neuro-acoustics & bio-resonance research.</span>
          </div>
        </div>
      </footer>

      {/* Interactive In-App Documentation Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
