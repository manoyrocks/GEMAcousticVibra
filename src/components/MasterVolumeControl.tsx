import React, { useState, useEffect } from 'react';
import { soundEngine } from '../services/soundEngine';
import { Volume2, Volume1, VolumeX, Sliders } from 'lucide-react';

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

  useEffect(() => {
    const unsubscribe = soundEngine.subscribeMasterVolume((vol) => {
      setMasterVolume(vol);
    });
    return () => unsubscribe();
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    soundEngine.setMasterVolume(newVol);
  };

  const handleToggleMute = () => {
    soundEngine.toggleMuteMaster();
  };

  const isMuted = masterVolume === 0;

  // Icon component based on level
  const VolumeIcon = isMuted ? VolumeX : masterVolume < 40 ? Volume1 : Volume2;

  if (variant === 'mixer') {
    return (
      <div className={`p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-2 ${className}`} id="master-volume-mixer-control">
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
                Primary Master Stage (Default 70%)
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

        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            aria-label="Master Volume Slider"
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <span>0% (Mute)</span>
          <span className="text-cyan-400/80">70% Calibrated</span>
          <span>100% Max</span>
        </div>
      </div>
    );
  }

  if (variant === 'drawer') {
    return (
      <div className={`px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 ${className}`} id="master-volume-drawer-control">
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
            <span className="text-slate-300 font-medium text-xs">Master Volume</span>
          </div>
          <span className="text-cyan-400 font-mono font-semibold text-xs">{masterVolume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={masterVolume}
          onChange={handleVolumeChange}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          aria-label="Mobile Master Volume Slider"
        />
      </div>
    );
  }

  // Header / Top navigation bar variant
  return (
    <div
      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition shadow-inner ${className}`}
      id="master-volume-header-control"
      title={`Master Volume: ${masterVolume}% (Default 70%)`}
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
          max="100"
          value={masterVolume}
          onChange={handleVolumeChange}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          aria-label="Master Output Volume"
        />
      </div>

      <span className="text-[11px] font-mono font-semibold text-cyan-300 w-7 text-right">
        {masterVolume}%
      </span>
    </div>
  );
};
