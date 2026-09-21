import React, { useState, useEffect } from 'react';
import { AmbientSoundType } from '../types';
import { AMBIENT_SOUNDSCAPES, AmbientSoundscape } from '../data/soundscapes';
import { soundscapeLoader, SoundscapeCacheState } from '../services/soundscapeLoader';
import { soundEngine } from '../services/soundEngine';
import {
  CloudRain,
  Trees,
  Waves,
  Droplets,
  Wind,
  Moon,
  Flame,
  Activity,
  Sparkles,
  Radio,
  Bell,
  Orbit,
  Volume2,
  VolumeX,
  Volume1,
  Sliders,
  Check,
  Zap,
  Info,
  Download,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface Props {
  selectedSound: AmbientSoundType;
  volume: number;
  onSelectSound: (sound: AmbientSoundType) => void;
  onVolumeChange: (vol: number) => void;
  compact?: boolean;
  className?: string;
}

const ICONS_MAP: Record<string, React.FC<{ className?: string }>> = {
  CloudRain,
  Trees,
  Waves,
  Droplets,
  Wind,
  Moon,
  Flame,
  Activity,
  Sparkles,
  Radio,
  Bell,
  Orbit
};

export const SoundscapeSelector: React.FC<Props> = ({
  selectedSound,
  volume,
  onSelectSound,
  onVolumeChange,
  compact = false,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hoveredSound, setHoveredSound] = useState<AmbientSoundscape | null>(null);
  const [cacheStates, setCacheStates] = useState<Record<AmbientSoundType, SoundscapeCacheState>>(() =>
    soundscapeLoader.getAllStates()
  );
  const [isPreloadingAll, setIsPreloadingAll] = useState(false);

  useEffect(() => {
    const unsubscribe = soundscapeLoader.subscribe(states => {
      setCacheStates({ ...states });
    });
    return () => unsubscribe();
  }, []);

  const handlePreloadAll = async () => {
    setIsPreloadingAll(true);
    const ctx = soundEngine.getAudioContext() || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    try {
      await soundscapeLoader.preloadAll(ctx);
    } finally {
      setIsPreloadingAll(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Soundscapes' },
    { id: 'nature', label: 'Nature & Biophilic' },
    { id: 'noise', label: 'Color Noise Masking' },
    { id: 'sacred', label: 'Sacred & Acoustic' },
    { id: 'atmospheric', label: 'Atmospheric' }
  ];

  const filteredSoundscapes = AMBIENT_SOUNDSCAPES.filter(
    s => activeCategory === 'all' || s.category === activeCategory
  );

  const currentSoundscapeObj = AMBIENT_SOUNDSCAPES.find(s => s.id === selectedSound);

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Compact View for Session Builder or Sidebars */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ambient Nature Layer</span>
          </span>
          <div className="flex items-center space-x-2">
            {selectedSound !== 'none' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono flex items-center space-x-1 border border-emerald-500/30">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Phase-Locked</span>
              </span>
            )}
            <span className="font-mono text-indigo-300">
              {selectedSound === 'none' ? 'Muted' : `${volume}%`}
            </span>
          </div>
        </div>

        {/* Quick select grid */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => onSelectSound('none')}
            className={`px-2 py-1.5 text-xs rounded-lg border font-medium transition flex items-center justify-center space-x-1 ${
              selectedSound === 'none'
                ? 'bg-slate-800 text-slate-200 border-slate-600'
                : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:text-slate-300'
            }`}
          >
            <VolumeX className="w-3 h-3" />
            <span>Off</span>
          </button>

          {AMBIENT_SOUNDSCAPES.slice(0, 11).map(s => {
            const IconComponent = ICONS_MAP[s.icon] || Sparkles;
            const isSelected = selectedSound === s.id;
            const cacheStatus = cacheStates[s.id]?.status;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSound(s.id)}
                title={`${s.name} - ${s.tagline}`}
                className={`relative px-2 py-1.5 text-xs rounded-lg border font-medium transition flex items-center justify-center space-x-1 truncate ${
                  isSelected
                    ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 shadow-sm shadow-indigo-500/20 font-semibold'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <IconComponent className="w-3 h-3 shrink-0" />
                <span className="truncate">{s.name.split(' ')[0]}</span>
                {cacheStatus === 'loading' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>

        {selectedSound !== 'none' && (
          <div className="pt-1">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={e => onVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} id="ambient-soundscape-suite">
      {/* Category Pills & Buffer Preload Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectSound('none')}
            className={`px-3 py-1.5 text-xs rounded-xl border font-medium transition flex items-center space-x-1.5 shrink-0 ${
              selectedSound === 'none'
                ? 'bg-slate-800 text-slate-200 border-slate-600'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute</span>
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition border ${
                activeCategory === cat.id
                  ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/60'
                  : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Audio Buffer Preload / Cache Status Action */}
        <button
          type="button"
          onClick={handlePreloadAll}
          disabled={isPreloadingAll}
          className="self-end sm:self-auto text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-indigo-300 hover:border-indigo-500/40 flex items-center space-x-1.5 transition disabled:opacity-50"
          title="Preload all lossless nature buffers into browser RAM for instant 0ms latency playback"
        >
          {isPreloadingAll ? (
            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
          ) : (
            <Download className="w-3 h-3 text-indigo-400" />
          )}
          <span>{isPreloadingAll ? 'Pre-Buffering Lossless Bank...' : 'Preload Hi-Res Audio Bank'}</span>
        </button>
      </div>

      {/* Grid of Soundscape Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {filteredSoundscapes.map(s => {
          const IconComponent = ICONS_MAP[s.icon] || Sparkles;
          const isSelected = selectedSound === s.id;
          const cacheState = cacheStates[s.id];
          const isCached = cacheState?.status === 'loaded';

          return (
            <div
              key={s.id}
              onClick={() => onSelectSound(s.id)}
              onMouseEnter={() => setHoveredSound(s)}
              onMouseLeave={() => setHoveredSound(null)}
              className={`relative group cursor-pointer p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${s.color} text-white shadow-sm`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex items-center space-x-1">
                    {isCached && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-mono">
                        RAM
                      </span>
                    )}

                    {isSelected ? (
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 capitalize">
                        {s.category}
                      </span>
                    )}
                  </div>
                </div>

                <h4
                  className={`text-xs font-bold leading-tight line-clamp-1 ${
                    isSelected ? 'text-indigo-200' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {s.name}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {s.tagline}
                </p>
              </div>

              {/* Sound wave activity indicator when selected */}
              {isSelected && (
                <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-indigo-800/40">
                  <div className="flex items-center space-x-0.5">
                    <span className="h-2 w-0.5 bg-indigo-400 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-3.5 w-0.5 bg-indigo-400 rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2.5 w-0.5 bg-indigo-400 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="h-4 w-0.5 bg-indigo-400 rounded animate-bounce" style={{ animationDelay: '100ms' }} />
                    <span className="h-2 w-0.5 bg-indigo-400 rounded animate-bounce" style={{ animationDelay: '250ms' }} />
                    <span className="text-[10px] font-mono text-indigo-300 ml-1.5 font-medium">Synced</span>
                  </div>
                  <span className="text-[9px] font-mono text-indigo-400/80">0ms Drift</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Soundscape Control Bar & Acoustic Profile */}
      {selectedSound !== 'none' && currentSoundscapeObj && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentSoundscapeObj.color} text-white shadow-md`}
            >
              {React.createElement(ICONS_MAP[currentSoundscapeObj.icon] || Sparkles, {
                className: 'w-4 h-4'
              })}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100">{currentSoundscapeObj.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                  {currentSoundscapeObj.acousticProfile.split('+')[0]}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono">
                  Lossless 48kHz Loop
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {currentSoundscapeObj.description}
              </p>
            </div>
          </div>

          {/* Dedicated Volume Slider */}
          <div className="flex items-center space-x-3 min-w-[200px] shrink-0">
            <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Layer Volume</span>
                <span className="font-mono text-indigo-300 font-semibold">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={e => onVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
