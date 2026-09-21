import React, { useState } from 'react';
import { MoodLog, VibroSession, WearableData } from '../types';
import { storage } from '../services/storage';
import {
  Smile,
  Frown,
  Meh,
  Activity,
  Heart,
  TrendingDown,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Sliders,
  Zap,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Props {
  session?: VibroSession;
  isPostSession?: boolean;
  preMoodData?: MoodLog['preMood'];
  onComplete: (log: MoodLog) => void;
  onCancel?: () => void;
}

const EMOTIONS = [
  { label: 'Deeply Calm', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  { label: 'Anxious / Overwhelmed', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { label: 'Exhausted & Fatigued', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { label: 'Grounded & Centered', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { label: 'Tense / Stressed', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { label: 'Physical Pain / Aching', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
  { label: 'Lucid & Focused', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { label: 'Uplifted & Joyful', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
];

export const MoodTracker: React.FC<Props> = ({
  session,
  isPostSession = false,
  preMoodData,
  onComplete,
  onCancel
}) => {
  const wearable: WearableData = storage.getWearableData();

  // Ratings
  const [valence, setValence] = useState<number>(isPostSession ? 8 : 4);
  const [stressLevel, setStressLevel] = useState<number>(isPostSession ? 2 : 7);
  const [painLevel, setPainLevel] = useState<number>(isPostSession ? 2 : 5);
  const [energyLevel, setEnergyLevel] = useState<number>(isPostSession ? 7 : 3);
  const [primaryEmotion, setPrimaryEmotion] = useState<string>(
    isPostSession ? 'Deeply Calm' : 'Tense / Stressed'
  );
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const moodData = {
      valence,
      stressLevel,
      painLevel,
      energyLevel,
      primaryEmotion
    };

    if (isPostSession && preMoodData) {
      const fullLog: MoodLog = {
        id: `log-${Date.now()}`,
        sessionId: session?.id,
        sessionTitle: session?.title || 'Custom Vibroacoustic Therapy',
        timestamp: new Date().toISOString(),
        preMood: preMoodData,
        postMood: moodData,
        heartRateBefore: wearable.baselineHeartRate,
        heartRateAfter: Math.round(wearable.currentHeartRate),
        hrvBefore: wearable.hrvMs - 20,
        hrvAfter: Math.round(wearable.hrvMs),
        notes: notes || undefined
      };
      storage.saveMoodLog(fullLog);
      onComplete(fullLog);
    } else {
      const preLog: MoodLog = {
        id: `pre-${Date.now()}`,
        sessionId: session?.id,
        sessionTitle: session?.title || 'Pre-Therapy Check-in',
        timestamp: new Date().toISOString(),
        preMood: moodData
      };
      onComplete(preLog);
    }
  };

  // Deltas for post session
  const stressDelta = preMoodData ? preMoodData.stressLevel - stressLevel : 0;
  const painDelta = preMoodData ? preMoodData.painLevel - painLevel : 0;
  const valenceDelta = preMoodData ? valence - preMoodData.valence : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        id="mood-tracker-modal"
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 my-auto"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPostSession ? 'Post-Session Resonance Review' : 'Pre-Session Mood Calibration'}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isPostSession ? 'How does your body feel now?' : 'How are you feeling right now?'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {isPostSession
              ? 'Tracking changes helps machine learning fine-tune your personalized frequency recipes.'
              : 'Calibrate your starting baseline for accurate relaxation delta measurements.'}
          </p>
        </div>

        {/* Post Session Delta Callout (If Post) */}
        {isPostSession && preMoodData && (
          <div className="mb-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 grid grid-cols-3 gap-3 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60">
              <span className="text-[11px] text-slate-400 block">Stress Reduction</span>
              <div className="text-lg font-bold text-emerald-400 flex items-center justify-center space-x-1">
                <TrendingDown className="w-4 h-4" />
                <span>-{Math.max(0, stressDelta * 10)}%</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60">
              <span className="text-[11px] text-slate-400 block">Pain Relief</span>
              <div className="text-lg font-bold text-cyan-400 flex items-center justify-center space-x-1">
                <TrendingDown className="w-4 h-4" />
                <span>-{Math.max(0, painDelta * 10)}%</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60">
              <span className="text-[11px] text-slate-400 block">Mood Valence</span>
              <div className="text-lg font-bold text-pink-400 flex items-center justify-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>+{Math.max(0, valenceDelta * 10)}%</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Primary Emotion Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Dominant Emotion State
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EMOTIONS.map(emo => (
                <button
                  type="button"
                  key={emo.label}
                  onClick={() => setPrimaryEmotion(emo.label)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition ${
                    primaryEmotion === emo.label
                      ? `${emo.color} ring-2 ring-cyan-500/50`
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {emo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            {/* Stress Level */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Stress & Tension Level</span>
                <span className="text-rose-400 font-bold font-mono">{stressLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={e => setStressLevel(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Pain / Somatic Tension Level */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Physical Pain / Body Soreness</span>
                <span className="text-amber-400 font-bold font-mono">{painLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={painLevel}
                onChange={e => setPainLevel(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Overall Well-Being Valence */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Overall Serenity & Mood Valence</span>
                <span className="text-cyan-400 font-bold font-mono">{valence} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={valence}
                onChange={e => setValence(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Optional notes */}
          {isPostSession && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Session Reflections & Somatic Sensations (Optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Noticed warm tingling along my spine, feeling lighter and centered..."
                rows={2}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
              >
                Skip Check-in
              </button>
            )}

            <button
              type="submit"
              id="submit-mood-btn"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/25 transition flex items-center space-x-2"
            >
              <span>{isPostSession ? 'Save & Review Analytics' : 'Begin Vibroacoustic Therapy'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
