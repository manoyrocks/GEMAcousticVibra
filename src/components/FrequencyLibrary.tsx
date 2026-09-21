import React, { useState, useMemo, useEffect } from 'react';
import { FrequencyItem, AmbientSoundType } from '../types';
import { FREQUENCIES_LIBRARY } from '../data/frequencies';
import { AMBIENT_SOUNDSCAPES } from '../data/soundscapes';
import { soundEngine } from '../services/soundEngine';
import { storage } from '../services/storage';
import { SoundscapeSelector } from './SoundscapeSelector';
import {
  Play,
  Square,
  Search,
  Bookmark,
  BookmarkCheck,
  Info,
  Sliders,
  Sparkles,
  Zap,
  Volume2,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Radio,
  Trees,
  VolumeX
} from 'lucide-react';

interface Props {
  onStartSessionWithFrequency: (freq: FrequencyItem) => void;
  activeFrequencyId?: string;
  isPlayingGlobal?: boolean;
}

export const FrequencyLibrary: React.FC<Props> = ({
  onStartSessionWithFrequency,
  activeFrequencyId,
  isPlayingGlobal = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<FrequencyItem | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(activeFrequencyId || null);
  const [savedIds, setSavedIds] = useState<string[]>(() => storage.getSavedFrequencyIds());
  
  // Ambient Soundscape Audition State
  const [auditionAmbient, setAuditionAmbient] = useState<AmbientSoundType>('none');
  const [auditionAmbientVol, setAuditionAmbientVol] = useState<number>(30);
  const [showAmbientMixer, setShowAmbientMixer] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Frequencies', count: FREQUENCIES_LIBRARY.length },
    { id: 'pain-relief', label: 'Pain & Physical Relief', count: FREQUENCIES_LIBRARY.filter(f => f.category === 'pain-relief').length },
    { id: 'stress-anxiety', label: 'Stress & Anxiety Management', count: FREQUENCIES_LIBRARY.filter(f => f.category === 'stress-anxiety').length },
    { id: 'mood-healing', label: 'Mood & Emotional Healing', count: FREQUENCIES_LIBRARY.filter(f => f.category === 'mood-healing').length },
    { id: 'brainwave', label: 'Brainwave Entrainment', count: FREQUENCIES_LIBRARY.filter(f => f.category === 'brainwave').length },
    { id: 'schumann', label: 'Schumann Earth Pulses', count: FREQUENCIES_LIBRARY.filter(f => f.category === 'schumann').length },
    { id: 'harmonic-tactile', label: 'Tactile Sub-Bass (Vibro-Bed)', count: FREQUENCIES_LIBRARY.filter(f => f.category === 'harmonic-tactile').length },
  ];

  const filteredFrequencies = useMemo(() => {
    return FREQUENCIES_LIBRARY.filter(item => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.targetBodyArea.toLowerCase().includes(query) ||
        item.benefits.some(b => b.toLowerCase().includes(query)) ||
        item.tags.some(t => t.toLowerCase().includes(query));

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storage.toggleSaveFrequency(id);
    setSavedIds(updated);
  };

  const handleQuickPreview = (item: FrequencyItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingId === item.id) {
      soundEngine.stop();
      setPreviewingId(null);
    } else {
      soundEngine.play({
        frequency: item.frequency,
        secondaryFrequency: item.secondaryFrequency,
        binauralBeat: item.binauralBeat,
        waveform: item.waveform,
        volume: 70,
        ambientSound: auditionAmbient,
        ambientVolume: auditionAmbientVol,
        hapticIntensity: 40
      });
      setPreviewingId(item.id);
    }
  };

  // When changing ambient during preview
  const handleAuditionAmbientChange = (sound: AmbientSoundType) => {
    setAuditionAmbient(sound);
    soundEngine.setAmbientSound(sound, auditionAmbientVol);
  };

  const handleAuditionAmbientVolChange = (vol: number) => {
    setAuditionAmbientVol(vol);
    soundEngine.setAmbientVolume(vol);
  };

  return (
    <div className="space-y-6" id="frequency-library-section">
      {/* Top Header & Search Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4" />
            <span>Harmonic Resonance Database</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sound Frequency Library
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Calibrated therapeutic pure tones, Solfeggio harmonics, binaural entrainment, and sub-bass transducers.
          </p>
        </div>

        {/* Search Bar & Nature Ambience Toggle */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="frequency-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search frequencies, benefits..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAmbientMixer(!showAmbientMixer)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition shrink-0 ${
              auditionAmbient !== 'none' || showAmbientMixer
                ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Toggle Ambient Nature Soundscapes"
          >
            <Trees className="w-3.5 h-3.5" />
            <span>{auditionAmbient === 'none' ? 'Layer Ambience' : `Ambience: ${auditionAmbient}`}</span>
          </button>
        </div>
      </div>

      {/* Ambient Soundscapes Audition Panel (Collapsible) */}
      {showAmbientMixer && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trees className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Audition Nature & Masking Soundscapes
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Layers seamlessly underneath any frequency tone you test below
            </span>
          </div>

          <SoundscapeSelector
            selectedSound={auditionAmbient}
            volume={auditionAmbientVol}
            onSelectSound={handleAuditionAmbientChange}
            onVolumeChange={handleAuditionAmbientVolChange}
          />
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            id={`filter-cat-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-2 border ${
              selectedCategory === cat.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCategory === cat.id ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Frequency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFrequencies.map(item => {
          const isSaved = savedIds.includes(item.id);
          const isCurrentlyPreviewing = previewingId === item.id;

          return (
            <div
              key={item.id}
              id={`freq-card-${item.id}`}
              onClick={() => setSelectedFrequency(item)}
              className={`group relative flex flex-col justify-between p-5 rounded-2xl border bg-slate-900/50 backdrop-blur-sm transition-all duration-200 hover:bg-slate-900/90 hover:border-slate-700 cursor-pointer ${
                isCurrentlyPreviewing
                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40 bg-slate-900/90'
                  : 'border-slate-800/80'
              }`}
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-slate-950 shadow-md transition-transform group-hover:scale-105"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.frequency < 20 ? `${item.frequency}` : Math.round(item.frequency)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.categoryLabel}
                      </span>
                      <h3 className="text-base font-semibold text-white leading-tight">
                        {item.name.split('—')[0]}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={e => toggleBookmark(item.id, e)}
                      id={`bookmark-${item.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                      title={isSaved ? 'Remove from Saved' : 'Save Frequency'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={e => handleQuickPreview(item, e)}
                      id={`preview-btn-${item.id}`}
                      className={`p-2 rounded-xl transition ${
                        isCurrentlyPreviewing
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                          : 'bg-slate-800 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300'
                      }`}
                      title={isCurrentlyPreviewing ? 'Stop Preview' : 'Quick Preview Tone'}
                    >
                      {isCurrentlyPreviewing ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Key Target & Tags */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center text-[11px] text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
                    <span className="truncate">Target: <strong className="text-slate-200">{item.targetBodyArea}</strong></span>
                  </div>
                  {item.chakraOrOrgan && (
                    <div className="flex items-center text-[11px] text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 mr-1.5 shrink-0" />
                      <span className="truncate">Chakra / Biofield: <strong className="text-slate-200">{item.chakraOrOrgan}</strong></span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setSelectedFrequency(item)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Clinical Science</span>
                </button>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onStartSessionWithFrequency(item);
                  }}
                  id={`start-session-btn-${item.id}`}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-xs font-semibold border border-cyan-500/30 hover:border-cyan-500 transition-all flex items-center space-x-1"
                >
                  <span>Start Session</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results Fallback */}
      {filteredFrequencies.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <Sliders className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-medium text-slate-300">No frequencies match your criteria</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting another category.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs text-cyan-400 hover:bg-slate-700 transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Detailed Clinical Info Modal */}
      {selectedFrequency && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setSelectedFrequency(null)}
        >
          <div
            className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
            onClick={e => e.stopPropagation()}
            id="frequency-details-modal"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-md"
                  style={{ backgroundColor: selectedFrequency.color }}
                >
                  {selectedFrequency.frequency < 20 ? selectedFrequency.frequency : Math.round(selectedFrequency.frequency)}
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-cyan-400">
                    {selectedFrequency.categoryLabel}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {selectedFrequency.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedFrequency(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              {selectedFrequency.description}
            </p>

            <div className="space-y-4 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Physiological & Mental Benefits</span>
                </h4>
                <ul className="space-y-1.5">
                  {selectedFrequency.benefits.map((b, i) => (
                    <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedFrequency.scientificNotes && (
                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>Clinical Research & VAT Mechanism</span>
                  </h4>
                  <p className="text-xs text-cyan-100/90 leading-relaxed">
                    {selectedFrequency.scientificNotes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-1">Target Anatomy</span>
                  <strong className="text-slate-100">{selectedFrequency.targetBodyArea}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-1">Suggested Duration</span>
                  <strong className="text-slate-100">{selectedFrequency.recommendedDurationMinutes} Minutes</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={e => handleQuickPreview(selectedFrequency, e)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-2 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>{previewingId === selectedFrequency.id ? 'Stop Tone' : 'Audition Tone'}</span>
              </button>

              <button
                onClick={() => {
                  const freq = selectedFrequency;
                  setSelectedFrequency(null);
                  onStartSessionWithFrequency(freq);
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Therapy Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
