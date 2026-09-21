import { ThemeId, ThemeConfig } from '../types';
import { storage } from './storage';

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: 'slate',
    name: 'Slate Dark',
    tagline: 'Deep Space Studio Canvas',
    category: 'dark',
    description: 'Classic low-light dark mode with cosmic obsidian backgrounds and vibrant cyan/indigo frequency accents.',
    colors: {
      previewBg: '#020617',
      previewCard: '#0f172a',
      previewAccent: '#06b6d4',
      previewText: '#f8fafc',
      previewBorder: '#1e293b'
    }
  },
  {
    id: 'deep-earth',
    name: 'Deep Earth',
    tagline: 'High-Contrast Warm Earth',
    category: 'light',
    description: 'High-contrast alternative light mode with warm terracotta, raw ochre, and deep espresso typography for maximum daylight legibility.',
    colors: {
      previewBg: '#f7f2eb',
      previewCard: '#ffffff',
      previewAccent: '#c25928',
      previewText: '#2c1e14',
      previewBorder: '#d9cca3'
    }
  },
  {
    id: 'very-light',
    name: 'Very Light',
    tagline: 'Crisp Minimalist Arctic',
    category: 'light',
    description: 'Pure, high-clarity minimalist light mode with snow-white card surfaces, crisp slate typography, and royal sapphire accents.',
    colors: {
      previewBg: '#f8fafc',
      previewCard: '#ffffff',
      previewAccent: '#0284c7',
      previewText: '#0f172a',
      previewBorder: '#e2e8f0'
    }
  },
  {
    id: 'light-green',
    name: 'Light Green',
    tagline: 'Botanical Sage & Matcha',
    category: 'light',
    description: 'Biophilic wellness palette with soothing eucalyptus, matcha green, and emerald accents fostering organic restoration.',
    colors: {
      previewBg: '#f2f7f2',
      previewCard: '#ffffff',
      previewAccent: '#059669',
      previewText: '#132e1b',
      previewBorder: '#cde0cd'
    }
  },
  {
    id: 'pinkish',
    name: 'Pinkish',
    tagline: 'Rose Quartz & Blush',
    category: 'light',
    description: 'Gentle heart-harmonic palette with soft rose quartz, blush canvas, and warm coral-magenta twilight accents.',
    colors: {
      previewBg: '#faf4f6',
      previewCard: '#ffffff',
      previewAccent: '#db2777',
      previewText: '#2d1220',
      previewBorder: '#e8d1dc'
    }
  },
  {
    id: 'autism-calm',
    name: 'Autism Calm',
    tagline: 'Sensory-Friendly Low-Glare',
    category: 'sensory-accessible',
    autismFriendly: true,
    description: 'Specially calibrated neurodivergent palette. Uses anti-glare matte periwinkle-slate, muted lavender accents, and reduced optical strain to avoid sensory overload.',
    colors: {
      previewBg: '#eef2f6',
      previewCard: '#ffffff',
      previewAccent: '#6366f1',
      previewText: '#1e293b',
      previewBorder: '#c8d7e6'
    }
  }
];

class ThemeManager {
  private currentTheme: ThemeId = 'slate';
  private listeners: Set<(theme: ThemeId) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentTheme = storage.getTheme();
      this.applyThemeToDOM(this.currentTheme);
    }
  }

  public getTheme(): ThemeId {
    return this.currentTheme;
  }

  public getThemeConfig(id?: ThemeId): ThemeConfig {
    const targetId = id || this.currentTheme;
    return THEMES_LIST.find(t => t.id === targetId) || THEMES_LIST[0];
  }

  public setTheme(themeId: ThemeId): void {
    if (this.currentTheme === themeId) return;
    this.currentTheme = themeId;
    this.applyThemeToDOM(themeId);
    storage.saveTheme(themeId);

    this.listeners.forEach(listener => {
      try {
        listener(themeId);
      } catch { /* noop */ }
    });
  }

  public subscribe(callback: (theme: ThemeId) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentTheme);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private applyThemeToDOM(themeId: ThemeId) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', themeId);
    
    // Set theme class on body as well
    document.body.className = `theme-${themeId}`;

    // Apply sensory calm reductions if autism mode is active
    if (themeId === 'autism-calm') {
      root.classList.add('sensory-calm-active');
    } else {
      root.classList.remove('sensory-calm-active');
    }
  }
}

export const themeManager = new ThemeManager();
