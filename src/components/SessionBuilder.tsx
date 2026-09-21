import React, { useState } from 'react';
import { VibroSession, SessionPhase, FrequencyItem, AmbientSoundType } from '../types';
import { FREQUENCIES_LIBRARY } from '../data/frequencies';
import { AMBIENT_SOUNDSCAPES } from '../data/soundscapes';
import { soundEngine } from '../services/soundEngine';
import { storage } from '../services/storage';
import {
  Plus,
  Trash2,
  Play,
  Square,
  Save,
  Sliders,
  Sparkles,
  Layers,
  Clock,
  Volume2,
  Vibrate,
  ArrowRight,
  HelpCircle,
  Trees
} from 'lucide-react';

interface Props {
  onSessionCreated: (session: VibroSession) => void;
  onCancel: () => void;
}

export const SessionBuilder: React.FC<Props> = ({ onSessionCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personalized Protocol');
  const [targetGoals, setTargetGoals] = useState('Deep Relaxation, Cortisol Reduction');
  const [voiceGuidance, setVoiceGuidance] = useState(true);

  // Phases list
  const [phases, setPhases] = useState<SessionPhase[]>([
    {
      id: 'custom-p1',
      name: 'Phase 1: Warmup & Alpha Deceleration',
      durationSeconds: 300, // 5 min
      frequencyId: 'freq-alpha-calm',
      frequencyHz: 432,
      binauralBeatHz: 10.0,
      waveform: 'binaural',
      ambientSound: 'ocean',
      ambientVolume: 35,
      hapticIntensity: 40
    },
    {
      id: 'custom-p2',
      name: 'Phase 2: Cellular Transformation (528 Hz)',
      durationSeconds: 600, // 10 min
      frequencyId: 'freq-528-transformation',
      frequencyHz: 528,
      binauralBeatHz: 6.0,
      waveform: 'sine',
      ambientSound: 'bowls',
      ambientVolume: 40,
      hapticIntensity: 55
    }
  ]);

  const [previewingPhaseId, setPreviewingPhaseId] = useState<string | null>(null);

  const addPhase = () => {
    const nextIdx = phases.length + 1;
    const newPhase: SessionPhase = {
      id: `custom-p${Date.now()}`,
      name: `Phase ${nextIdx}: Harmonic Integration`,
      durationSeconds: 300,
      frequencyId: 'freq-432-pain',
      frequencyHz: 432,
      waveform: 'sine',
      ambientSound: 'rain',
      ambientVolume: 30,
      hapticIntensity: 50
    };
    setPhases([...phases, newPhase]);
  };

  const removePhase = (id: string) => {
    if (phases.length <= 1) return;
    setPhases(phases.filter(p => p.id !== id));
  };

  const updatePhase = (id: string, updates: Partial<SessionPhase>) => {
    setPhases(phases.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handlePreviewPhase = (phase: SessionPhase) => {
    if (previewingPhaseId === phase.id) {
      soundEngine.stop();
      setPreviewingPhaseId(null);
    } else {
      soundEngine.play({
        frequency: phase.frequencyHz,
        binauralBeat: phase.binauralBeatHz,
        waveform: phase.waveform,
        volume: 75,
        ambientSound: phase.ambientSound,
        ambientVolume: phase.ambientVolume,
        hapticIntensity: phase.hapticIntensity
      });
      setPreviewingPhaseId(phase.id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.stop();

    const totalSeconds = phases.reduce((acc, p) => acc + p.durationSeconds, 0);
    const durationMinutes = Math.round(totalSeconds / 60);

    const newSession: VibroSession = {
      id: `custom-session-${Date.now()}`,
      title: title || 'Custom Vibroacoustic Protocol',
      subtitle: subtitle || `${phases.length}-Stage Harmonic Frequency Cascade`,
      description: description || 'User-architected personalized sound and tactile session.',
      category: category,
      durationMinutes: Math.max(1, durationMinutes),
      phases: phases,
      difficulty: 'Intermediate',
      targetGoals: targetGoals.split(',').map(g => g.trim()).filter(Boolean),
      voiceGuidance: voiceGuidance,
      coverGradient: 'from-cyan-600 via-indigo-600 to-purple-900',
      isCustom: true,
      author: 'You (Personal Architect)',
      rating: 5.0,
      playsCount: 1,
      guidedScript: phases.map(
        p => `Transitioning into ${p.name}. Synchronize your breath with the ${p.frequencyHz} Hz harmonic wave.`
      )
    };

    storage.saveCustomSession(newSession);
    onSessionCreated(newSession);
  };

  return (
    <div className="space-y-6" id="session-builder-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Sound Architecture Studio</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Custom Vibroacoustic Session Builder
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Craft multi-phase therapeutic protocols with precision frequency synthesis, binaural beats, and transducer waveforms.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            id="save-custom-session-btn"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save & Launch Protocol</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Session Metadata Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Protocol Overview & Goals
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Session Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Nightly Vagal Rest & Fascia Release"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Subtitle / Core Tones
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="e.g. 432 Hz + 528 Hz Dual Solfeggio"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Therapy Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="Pain Relief & Somatic">Pain Relief & Somatic</option>
                <option value="Stress & Anxiety">Stress & Anxiety</option>
                <option value="Sleep & Recovery">Sleep & Recovery</option>
                <option value="Mood & Emotional Healing">Mood & Emotional Healing</option>
                <option value="Cognitive & Brainwave">Cognitive & Brainwave</option>
                <option value="Vibro-Bed & Transducer">Vibro-Bed & Transducer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Target Goals (comma separated)
              </label>
              <input
                type="text"
                value={targetGoals}
                onChange={e => setTargetGoals(e.target.value)}
                placeholder="e.g. Vagus Tone, Sleep Onset, Lumbar Relief"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>
        </div>

        {/* Phase Timeline Builder */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>2. Multi-Phase Sequence ({phases.length} Phases)</span>
            </h3>

            <button
              type="button"
              onClick={addPhase}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center space-x-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Phase</span>
            </button>
          </div>

          <div className="space-y-4">
            {phases.map((phase, idx) => {
              const isPreviewing = previewingPhaseId === phase.id;
              return (
                <div
                  key={phase.id}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 space-y-4 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={phase.name}
                        onChange={e => updatePhase(phase.id, { name: e.target.value })}
                        className="bg-transparent font-semibold text-white text-sm border-b border-dashed border-slate-700 focus:border-cyan-400 focus:outline-none px-1"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handlePreviewPhase(phase)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                          isPreviewing
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                        }`}
                      >
                        {isPreviewing ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                        <span>{isPreviewing ? 'Stop' : 'Audition'}</span>
                      </button>

                      {phases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhase(phase.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Preset Frequency Picker or Custom Hz */}
                    <div>
                      <label className="block text-slate-400 mb-1">Preset Frequency</label>
                      <select
                        value={phase.frequencyId}
                        onChange={e => {
                          const found = FREQUENCIES_LIBRARY.find(f => f.id === e.target.value);
                          if (found) {
                            updatePhase(phase.id, {
                              frequencyId: found.id,
                              frequencyHz: found.frequency,
                              binauralBeatHz: found.binauralBeat,
                              waveform: found.waveform
                            });
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                      >
                        {FREQUENCIES_LIBRARY.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.frequency} Hz — {f.name.split('—')[0]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Frequency Hz Input */}
                    <div>
                      <label className="block text-slate-400 mb-1">Frequency (Hz)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={phase.frequencyHz}
                        onChange={e => updatePhase(phase.id, { frequencyHz: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    {/* Binaural Beat Offset */}
                    <div>
                      <label className="block text-slate-400 mb-1">Binaural Beat (Hz Diff)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={phase.binauralBeatHz || 0}
                        onChange={e => updatePhase(phase.id, { binauralBeatHz: Number(e.target.value) })}
                        placeholder="0 for pure tone"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    {/* Duration in Minutes */}
                    <div>
                      <label className="block text-slate-400 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={Math.round(phase.durationSeconds / 60)}
                        onChange={e => updatePhase(phase.id, { durationSeconds: Number(e.target.value) * 60 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Ambient Layer & Haptics for phase */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-900">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 flex items-center space-x-1">
                        <Trees className="w-3 h-3 text-indigo-400" />
                        <span>Ambient Soundscape</span>
                      </label>
                      <select
                        value={phase.ambientSound}
                        onChange={e => updatePhase(phase.id, { ambientSound: e.target.value as AmbientSoundType })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                      >
                        <option value="none">None (Pure Frequency)</option>
                        <optgroup label="Nature & Biophilic">
                          {AMBIENT_SOUNDSCAPES.filter(s => s.category === 'nature').map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Masking Color Noises">
                          {AMBIENT_SOUNDSCAPES.filter(s => s.category === 'noise').map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Sacred & Atmospheric">
                          {AMBIENT_SOUNDSCAPES.filter(s => s.category === 'sacred' || s.category === 'atmospheric').map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Ambient Volume</span>
                        <span className="text-indigo-400 font-mono">{phase.ambientVolume || 30}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={phase.ambientVolume || 30}
                        onChange={e => updatePhase(phase.id, { ambientVolume: Number(e.target.value) })}
                        disabled={phase.ambientSound === 'none'}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400 disabled:opacity-30"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Vibro-Transducer Haptics</span>
                        <span className="text-amber-400 font-mono">{phase.hapticIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={phase.hapticIntensity}
                        onChange={e => updatePhase(phase.id, { hapticIntensity: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/25 transition flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Save & Start Session</span>
          </button>
        </div>
      </form>
    </div>
  );
};
