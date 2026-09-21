import React, { useState, useEffect, useRef } from 'react';
import { ThemeId, ThemeConfig } from '../types';
import { themeManager, THEMES_LIST } from '../services/themeManager';
import {
  Palette,
  Moon,
  Sun,
  Leaf,
  Heart,
  ShieldCheck,
  Check,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

interface Props {
  className?: string;
  variant?: 'header' | 'compact' | 'drawer';
}

const THEME_ICONS: Record<ThemeId, React.FC<{ className?: string }>> = {
  slate: Moon,
  'deep-earth': Sun,
  'very-light': Sparkles,
  'light-green': Leaf,
  pinkish: Heart,
  'autism-calm': ShieldCheck
};

export const ThemeToggle: React.FC<Props> = ({ className = '', variant = 'header' }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => themeManager.getTheme());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = themeManager.subscribe((theme) => {
      setCurrentTheme(theme);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const activeConfig = THEMES_LIST.find(t => t.id === currentTheme) || THEMES_LIST[0];
  const CurrentIcon = THEME_ICONS[currentTheme] || Palette;

  const handleSelectTheme = (themeId: ThemeId) => {
    themeManager.setTheme(themeId);
    setIsOpen(false);
  };

  if (variant === 'drawer') {
    return (
      <div className={`p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 ${className}`} id="theme-toggle-drawer">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">Color Themes & Accessibility</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
            {activeConfig.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {THEMES_LIST.map((theme) => {
            const Icon = THEME_ICONS[theme.id] || Palette;
            const isSelected = currentTheme === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleSelectTheme(theme.id)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-1.5">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px] font-semibold truncate">{theme.name}</span>
                  </div>
                  {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                </div>

                <div className="flex items-center space-x-1">
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: theme.colors.previewBg }}
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: theme.colors.previewAccent }}
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: theme.colors.previewBorder }}
                  />
                </div>

                {theme.autismFriendly && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium self-start">
                    Autism Friendly
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef} id="theme-toggle-header">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Active Theme: ${activeConfig.name} - Click to switch theme`}
        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition shadow-inner group"
      >
        {/* Swatch indicator circle */}
        <div className="relative flex items-center justify-center">
          <div
            className="w-4 h-4 rounded-full border border-white/20 shadow-xs flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: activeConfig.colors.previewBg }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeConfig.colors.previewAccent }}
            />
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1">
          <CurrentIcon className="w-3.5 h-3.5 text-slate-300 group-hover:text-cyan-300 transition" />
          <span className="text-xs font-semibold text-slate-200">
            {activeConfig.name}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-300' : ''
          }`}
        />
      </button>

      {/* Theme Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header Title */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 px-1">
            <div className="flex items-center space-x-1.5">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Select Display Theme</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">6 Styles</span>
          </div>

          {/* Theme List */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
            {THEMES_LIST.map((theme) => {
              const Icon = THEME_ICONS[theme.id] || Palette;
              const isSelected = currentTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  role="menuitem"
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-start justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/80 text-cyan-100 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    {/* Theme Swatch Preview Box */}
                    <div
                      className="w-7 h-7 rounded-lg border border-black/20 flex items-center justify-center shrink-0 mt-0.5 shadow-xs relative overflow-hidden"
                      style={{ backgroundColor: theme.colors.previewBg }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-xs"
                        style={{ backgroundColor: theme.colors.previewAccent }}
                      />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="text-xs font-bold text-slate-100">{theme.name}</span>
                        {theme.autismFriendly && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Sensory Calm
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {theme.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Selected check */}
                  {isSelected && (
                    <div className="p-1 rounded-full bg-cyan-500 text-slate-950 shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Autism & Accessibility Notice */}
          <div className="pt-2 border-t border-slate-800/80 px-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1 text-indigo-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Autism-Friendly Mode ready</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">WCAG AAA</span>
          </div>
        </div>
      )}
    </div>
  );
};
