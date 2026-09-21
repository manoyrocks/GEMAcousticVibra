import { AmbientSoundType } from '../types';

export interface AmbientSoundscape {
  id: AmbientSoundType;
  name: string;
  tagline: string;
  category: 'nature' | 'noise' | 'atmospheric' | 'sacred';
  categoryLabel: string;
  description: string;
  benefits: string[];
  color: string;
  icon: string;
  acousticProfile: string;
}

export const AMBIENT_SOUNDSCAPES: AmbientSoundscape[] = [
  {
    id: 'rain',
    name: 'Gentle Rain on Foliage',
    tagline: 'Soft precipitation and organic droplet scatter',
    category: 'nature',
    categoryLabel: 'Nature Soundscape',
    description: 'Continuous soothing rainfall synthesized with pink-noise spectral filtering and micro-droplet resonant impulses to quiet an overactive default mode network.',
    benefits: ['Stress reduction', 'Masks sharp household noises', 'Promotes alpha relaxation'],
    color: 'from-blue-500 to-cyan-700',
    icon: 'CloudRain',
    acousticProfile: 'Pink-weighted 1200Hz Low-Pass + Resonant Droplet Pulses'
  },
  {
    id: 'forest',
    name: 'Tranquil Woodland & Birds',
    tagline: 'Whispering pine canopy and distant melodic chirps',
    category: 'nature',
    categoryLabel: 'Nature Soundscape',
    description: 'Gentle breeze rustling through tree canopies paired with randomized, calming harmonic birdsong frequencies designed for grounding and restorative presence.',
    benefits: ['Cortisol lowering', 'Natural biophilic calming', 'Somatic centering'],
    color: 'from-emerald-500 to-teal-800',
    icon: 'Trees',
    acousticProfile: 'Dual Bandpass 2.4kHz + Procedural Modulated Chirp Envelopes'
  },
  {
    id: 'ocean',
    name: 'Oceanic Tidal Swell',
    tagline: 'Slow rolling coastal breakers and soft surf backwash',
    category: 'nature',
    categoryLabel: 'Nature Soundscape',
    description: 'Deep brownian noise modulated with an 8.5-second tidal breath cycle, mirroring the rhythm of deep restorative diaphragmatic breathing.',
    benefits: ['Respiratory synchronization', 'Deep vagal stimulation', 'Insomnia relief'],
    color: 'from-cyan-500 to-blue-800',
    icon: 'Waves',
    acousticProfile: '0.12Hz LFO Brown Noise Modulation + Dynamic Filter Sweep'
  },
  {
    id: 'stream',
    name: 'Babbling Mountain Creek',
    tagline: 'Crisp fresh water flowing over smooth river stones',
    category: 'nature',
    categoryLabel: 'Nature Soundscape',
    description: 'Dynamic multi-filter liquid resonance capturing the natural stochastic turbulence and gentle bubbling rhythm of a secluded alpine stream.',
    benefits: ['Focus enhancement', 'Mental chatter clearance', 'Somatic flow state'],
    color: 'from-teal-400 to-cyan-800',
    icon: 'Droplets',
    acousticProfile: 'Dual Asynchronous LFO (0.35Hz/0.85Hz) + Resonant Liquid Bandpass'
  },
  {
    id: 'wind',
    name: 'Mountain Breeze & Canopy',
    tagline: 'Soft gusting wind through alpine ridges',
    category: 'nature',
    categoryLabel: 'Nature Soundscape',
    description: 'Warm, low-frequency atmospheric wind swells with subtle sweeping turbulence, creating an enveloping sense of spaciousness and deep release.',
    benefits: ['Expansive relaxation', 'Headache & tension easing', 'Anxiety diffusion'],
    color: 'from-sky-500 to-indigo-800',
    icon: 'Wind',
    acousticProfile: 'Swept 350Hz-850Hz Bandpass + Non-linear Gust Automation'
  },
  {
    id: 'night',
    name: 'Midnight Meadow & Crickets',
    tagline: 'Nocturnal summer breeze and rhythmic cicada chorus',
    category: 'nature',
    categoryLabel: 'Nature Soundscape',
    description: 'Subtle high-frequency harmonic chirps nestled within a calm evening breeze, anchoring the nervous system into preparation for slow-wave sleep.',
    benefits: ['NREM sleep induction', 'Tinnitus frequency blending', 'Emotional grounding'],
    color: 'from-indigo-500 to-slate-900',
    icon: 'Moon',
    acousticProfile: '4.5kHz Rhythmic Duty Modulator + Warm Pink Underlay'
  },
  {
    id: 'fire',
    name: 'Warm Hearth & Crackling Ember',
    tagline: 'Comforting campfire warmth and subtle ember snaps',
    category: 'nature',
    categoryLabel: 'Nature Soundscape',
    description: 'Warm low-end hearth warmth coupled with procedural micro-burst crackle transients, evoking deep primal safety and comforting physical relaxation.',
    benefits: ['Somatic safety feeling', 'Physical warmth perception', 'Deep calm'],
    color: 'from-amber-500 to-orange-800',
    icon: 'Flame',
    acousticProfile: 'Low-pass Brown Base + Stochastic High-Q Transient Impulses'
  },
  {
    id: 'white',
    name: 'Pure Calibrated White Noise',
    tagline: 'Equal-energy full audible spectrum for sound masking',
    category: 'noise',
    categoryLabel: 'Color Noise',
    description: 'Uniform spectral distribution across all audible frequencies. Highly effective at masking unpredictable external acoustic interruptions.',
    benefits: ['Acoustic masking', 'Cognitive boundary setting', 'Tinnitus relief'],
    color: 'from-slate-400 to-zinc-700',
    icon: 'Activity',
    acousticProfile: 'Flat Spectrum Uniform Random (20Hz - 20,000Hz)'
  },
  {
    id: 'pink',
    name: 'Smooth Pink Noise (1/f)',
    tagline: 'Balanced natural acoustic roll-off (-3dB/octave)',
    category: 'noise',
    categoryLabel: 'Color Noise',
    description: 'Calibrated 1/f noise curve matching human cochlear perception. Clinically validated to enhance slow-wave brain rhythms and deep restorative sleep.',
    benefits: ['Slow-wave sleep enhancement', 'ADHD focus stabilization', 'Gentle soothing'],
    color: 'from-pink-500 to-rose-800',
    icon: 'Sparkles',
    acousticProfile: 'Paul Kellet 3-Pole Filter (-3dB/Octave 1/f slope)'
  },
  {
    id: 'brown',
    name: 'Deep Brown Noise (1/f²)',
    tagline: 'Low-frequency heavy rumble (-6dB/octave)',
    category: 'noise',
    categoryLabel: 'Color Noise',
    description: 'Heavy Brownian motion accumulator with powerful low-end energy, ideal for vibroacoustic bed transducers, deep somatic grounding, and quieting racing thoughts.',
    benefits: ['Deepest mental quieting', 'Sub-bass transducer resonance', 'Rapid sleep transition'],
    color: 'from-amber-700 to-stone-900',
    icon: 'Radio',
    acousticProfile: 'Brownian Accumulator (-6dB/Octave 1/f² slope)'
  },
  {
    id: 'bowls',
    name: 'Tibetan Singing Bowls',
    tagline: 'Harmonic bronze overtone chime resonances',
    category: 'sacred',
    categoryLabel: 'Sacred Acoustic',
    description: 'Resonant harmonic bell overtones centered around 432 Hz and 528 Hz with slow rotational acoustic beating for meditative centering.',
    benefits: ['Meditation deepening', 'Chakra alignment', 'Mindful stillness'],
    color: 'from-yellow-500 to-amber-700',
    icon: 'Bell',
    acousticProfile: 'Multi-harmonic Bandpass Stack (216Hz/432Hz/648Hz, Q=14)'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Astral Drone',
    tagline: 'Ultra-low celestial pulsation and astral drone',
    category: 'atmospheric',
    categoryLabel: 'Atmospheric',
    description: 'Deep spatial sub-frequency drone with subtle harmonic phasing, creating a vast psychoacoustic field for expansive transcendental meditation.',
    benefits: ['Expanded consciousness', 'Spiritual centering', 'Out-of-body ease'],
    color: 'from-violet-600 to-purple-950',
    icon: 'Orbit',
    acousticProfile: 'Sub-bass 55Hz Foundation + Slow Phase Modulated Notch'
  }
];
