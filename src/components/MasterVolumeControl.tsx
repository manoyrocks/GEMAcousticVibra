import React, { useState, useEffect } from 'react';
import { soundEngine } from '../services/soundEngine';
import { Volume2, Volume1, VolumeX, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  variant?: 'header' | 'mixer' | 'compact' | 'drawer';
  className?: string;
  showLabel?: boolean;
}

export const MasterVolumeControl: React.FC<Props> = ({
  variant = 'header',
  className = '',
  showLabel = true
}) => {
  const [masterVolume, setMasterVolume] = useState<number>(() => soundEngine.getMasterVolume());
  const [isNormalized, setIsNormalized] = useState<boolean>(() => soundEngine.getIsNormalizationEnabled());

  useEffect(() => {
    const unsubVolume = soundEngine.subscribeMasterVolume((vol) => {
      setMasterVolume(vol);
    });
    const unsubNorm = soundEngine.subscribeNormalization((enabled) => {
      setIsNormalized(enabled);
    });
    return () => {
      unsubVolume();
      unsubNorm();
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    soundEngine.setMasterVolume(newVol);
  };

  const handleToggleMute = () => {
    soundEngine.toggleMuteMaster();
  };

  const handleToggleNormalization = () => {
    soundEngine.setNormalizationEnabled(!isNormalized);
  };

  const isMuted = masterVolume === 0;

  // Icon component based on level
  const VolumeIcon = isMuted ? VolumeX : masterVolume < 40 ? Volume1 : Volume2;

  if (variant === 'mixer') {
    return (
      <div className={`p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-3 ${className}`} id="master-volume-mixer-control">
        {/* Master Stage Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg border transition ${
                isMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
              }`}
              title={isMuted ? 'Unmute Master Audio' : 'Mute Master Audio'}
              aria-label="Toggle Master Audio Mute"
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            <div>
              <span className="text-slate-200 font-semibold block text-xs">
                Master Output Volume
              </span>
              <span className="text-[10px] text-slate-400">
                Primary Master Stage (Default 33%, Max 80%)
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isMuted ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MUTED
              </span>
            ) : null}
            <span className="text-cyan-400 font-mono font-bold text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {masterVolume}%
            </span>
          </div>
        </div>

        {/* Master Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="80"
            value={masterVolume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            aria-label="Master Volume Slider"
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>0% (Mute)</span>
          <span className="text-cyan-400/80">33% Default</span>
          <span>80% Max Limit</span>
        </div>

        {/* Smart Volume Normalization & Anti-Spike Auto-Leveler Sub-panel */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded-md border ${
              isNormalized
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-semibold text-slate-200">
                  Auto Volume Normalization
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                  isNormalized
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isNormalized ? 'Active' : 'Off'}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Psychoacoustic ISO 226 auto-leveler balances frequencies & prevents abrupt volume jumps
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleNormalization}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isNormalized ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={isNormalized}
            title={isNormalized ? 'Disable Auto Normalization' : 'Enable Auto Normalization'}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isNormalized ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className={`px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 ${className}`} id="master-volume-drawer-control">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-1 rounded-md border ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-slate-800 text-cyan-300 border-slate-700'
              }`}
            >
              <VolumeIcon className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300 font-medium text-xs">Master Volume (Max 80%)</span>
          </div>
          <span className="text-cyan-400 font-mono font-semibold text-xs">{masterVolume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="80"
          value={masterVolume}
          onChange={handleVolumeChange}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          aria-label="Mobile Master Volume Slider"
        />

        {/* Drawer Normalization Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
          <span className="text-slate-400 flex items-center space-x-1">
            <ShieldCheck className={`w-3 h-3 ${isNormalized ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Volume Normalization</span>
          </span>
          <button
            type="button"
            onClick={handleToggleNormalization}
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition border ${
              isNormalized
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isNormalized ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    );
  }

  // Header / Top navigation bar variant
  return (
    <div
      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition shadow-inner ${className}`}
      id="master-volume-header-control"
      title={`Master Volume: ${masterVolume}% (Max 80%) ${isNormalized ? '• Auto-Balanced' : ''}`}
    >
      <button
        type="button"
        onClick={handleToggleMute}
        className={`p-1 rounded-lg transition ${
          isMuted
            ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
            : 'text-slate-400 hover:text-cyan-300'
        }`}
        title={isMuted ? 'Unmute Master Volume' : 'Mute Master Volume'}
        aria-label="Toggle Master Audio Mute"
      >
        <VolumeIcon className="w-3.5 h-3.5" />
      </button>

      {showLabel && (
        <span className="hidden xl:inline text-[11px] font-medium text-slate-400 whitespace-nowrap">
          Master
        </span>
      )}

      <div className="w-16 sm:w-20 md:w-24 flex items-center">
        <input
          type="range"
          min="0"
          max="80"
          value={masterVolume}
          onChange={handleVolumeChange}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          aria-label="Master Output Volume"
        />
      </div>

      <span className="text-[11px] font-mono font-semibold text-cyan-300 w-7 text-right">
        {masterVolume}%
      </span>

      {/* Auto-Normalization Quick Shield Status Toggle */}
      <button
        type="button"
        onClick={handleToggleNormalization}
        className={`p-1 rounded-md transition ${
          isNormalized
            ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10'
            : 'text-slate-500 hover:text-slate-300'
        }`}
        title={isNormalized ? 'Auto Volume Normalization: Active (Prevents loud jumps)' : 'Auto Volume Normalization: Disabled'}
        aria-label="Toggle Auto Volume Normalization"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
