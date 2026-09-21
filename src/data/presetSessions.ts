import { VibroSession } from '../types';

export const PRESET_SESSIONS: VibroSession[] = [
  {
    id: 'session-cellular-pain',
    title: 'Deep Cellular Pain Relief & Somatic Reset',
    subtitle: '174 Hz Anesthetic Tone & 432 Hz Natural Harmonics',
    description: 'A clinically structured 3-phase vibroacoustic protocol designed to block physical pain pathways, release muscular tension, and encourage deep mitochondrial cell recovery.',
    category: 'Pain Relief',
    durationMinutes: 20,
    difficulty: 'Beginner',
    targetGoals: ['Pain Reduction', 'Fascia Release', 'Nervous System Soothing', 'Muscle Recovery'],
    voiceGuidance: true,
    coverGradient: 'from-cyan-600 via-blue-600 to-indigo-900',
    author: 'Dr. Elena Rostova & Dr. Aris Thorne',
    rating: 4.95,
    playsCount: 14820,
    guidedScript: [
      'Welcome to your Cellular Pain Relief session. Allow your body to settle deeply into your resting surface.',
      'Phase 1 introduces the 174 Hz foundation frequency, sending soothing micro-vibrations through tense muscle fibers and joints.',
      'As we transition into 432 Hz, feel your natural breathing rhythm deepen and slow down.',
      'In our final phase at 528 Hz, embrace the restorative vibration stimulating cellular vitality and physical renewal.'
    ],
    phases: [
      {
        id: 'p1',
        name: 'Phase 1: Anesthetic Foundation (174 Hz)',
        durationSeconds: 360,
        frequencyId: 'freq-174-foundation',
        frequencyHz: 174,
        waveform: 'sine',
        ambientSound: 'ocean',
        ambientVolume: 35,
        hapticIntensity: 65
      },
      {
        id: 'p2',
        name: 'Phase 2: Somatic Unwinding (432 Hz)',
        durationSeconds: 480,
        frequencyId: 'freq-432-pain',
        frequencyHz: 432,
        waveform: 'sine',
        ambientSound: 'bowls',
        ambientVolume: 40,
        hapticIntensity: 50
      },
      {
        id: 'p3',
        name: 'Phase 3: Cellular Regeneration (528 Hz)',
        durationSeconds: 360,
        frequencyId: 'freq-528-transformation',
        frequencyHz: 528,
        waveform: 'sine',
        ambientSound: 'rain',
        ambientVolume: 30,
        hapticIntensity: 45
      }
    ]
  },
  {
    id: 'session-anxiety-dissolution',
    title: 'Vagus Nerve & Acute Anxiety Dissolution',
    subtitle: '432.4 Hz Resonance + 100 Hz Neural Centering',
    description: 'Quickly breaks the sympathetic fight-or-flight panic cycle by acoustically stimulating vagal parasympathetic tone and steadying heart rate variability.',
    category: 'Stress & Anxiety',
    durationMinutes: 15,
    difficulty: 'Beginner',
    targetGoals: ['Panic Relief', 'Vagal Tone', 'Lowering Heart Rate', 'Mental Calm'],
    voiceGuidance: true,
    coverGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    author: 'Acoustic Vibra Clinical Lab',
    rating: 4.98,
    playsCount: 28400,
    guidedScript: [
      'Find a comfortable posture. Rest your hands gently on your diaphragm.',
      'The 432.4 Hz resonance harmonizes your respiratory center. Breathe in for 4 counts, hold for 2, and exhale for 6.',
      'Feel the low 100 Hz neural tone quiet repetitive thought spirals and anchor your nervous system.',
      'Your mind is safe, your body is anchored in calm.'
    ],
    phases: [
      {
        id: 'p1',
        name: 'Phase 1: Diaphragmatic Calming (432.4 Hz)',
        durationSeconds: 300,
        frequencyId: 'freq-432-4-resonance',
        frequencyHz: 432.4,
        waveform: 'sine',
        ambientSound: 'rain',
        ambientVolume: 40,
        hapticIntensity: 40
      },
      {
        id: 'p2',
        name: 'Phase 2: Synaptic Quieting (100 Hz)',
        durationSeconds: 360,
        frequencyId: 'freq-100-neural',
        frequencyHz: 100,
        waveform: 'sine',
        ambientSound: 'forest',
        ambientVolume: 35,
        hapticIntensity: 55
      },
      {
        id: 'p3',
        name: 'Phase 3: Alpha State Integration (10 Hz Beat)',
        durationSeconds: 240,
        frequencyId: 'freq-alpha-calm',
        frequencyHz: 432,
        binauralBeatHz: 10.0,
        waveform: 'binaural',
        ambientSound: 'cosmic',
        ambientVolume: 25,
        hapticIntensity: 30
      }
    ]
  },
  {
    id: 'session-delta-sleep',
    title: 'Delta Deep NREM Sleep Immersion',
    subtitle: '2.5 Hz Delta Entrainment & 7.83 Hz Earth Schumann',
    description: 'An immersive sonic sleep journey engineered to transition a busy daytime brain through relaxed Theta states directly into restorative slow-wave Stage 3 NREM sleep.',
    category: 'Sleep & Recovery',
    durationMinutes: 30,
    difficulty: 'Deep Healing',
    targetGoals: ['Insomnia Relief', 'Slow-Wave Sleep', 'Growth Hormone Release', 'Circadian Reset'],
    voiceGuidance: true,
    coverGradient: 'from-indigo-900 via-purple-900 to-slate-950',
    author: 'Sleep Science Institute',
    rating: 4.96,
    playsCount: 39120,
    guidedScript: [
      'Dim all ambient lights. Allow your eyes to close gently.',
      'We begin with Theta 6.0 Hz to bridge the gap between wakefulness and dream space.',
      'Now sinking deeper into 2.5 Hz Delta slow-waves. Feel your physical weight melting into the bed.',
      'Rest in the harmonic cradle of Earth’s 7.83 Hz Schumann resonance as you slip into deep restorative slumber.'
    ],
    phases: [
      {
        id: 'p1',
        name: 'Phase 1: Twilight Transition (Theta 6.0 Hz)',
        durationSeconds: 480,
        frequencyId: 'freq-theta-meditation',
        frequencyHz: 528,
        binauralBeatHz: 6.0,
        waveform: 'binaural',
        ambientSound: 'rain',
        ambientVolume: 45,
        hapticIntensity: 25
      },
      {
        id: 'p2',
        name: 'Phase 2: Delta Slow-Wave Entrainment (2.5 Hz)',
        durationSeconds: 780,
        frequencyId: 'freq-delta-sleep',
        frequencyHz: 432,
        binauralBeatHz: 2.5,
        waveform: 'binaural',
        ambientSound: 'cosmic',
        ambientVolume: 35,
        hapticIntensity: 20
      },
      {
        id: 'p3',
        name: 'Phase 3: Schumann Grounding Field (7.83 Hz)',
        durationSeconds: 540,
        frequencyId: 'freq-schumann-fundamental',
        frequencyHz: 136.1,
        binauralBeatHz: 7.83,
        waveform: 'binaural',
        ambientSound: 'ocean',
        ambientVolume: 40,
        hapticIntensity: 30
      }
    ]
  },
  {
    id: 'session-heart-harmony',
    title: 'Heart-Brain Coherence & Emotional Release',
    subtitle: '396 Hz Root Release + 639 Hz Interpersonal Harmony',
    description: 'Dissolves somatic emotional holding patterns, grief, and unexpressed resentment while elevating cardiovascular coherence and baseline empathy.',
    category: 'Mood & Emotional Healing',
    durationMinutes: 20,
    difficulty: 'Intermediate',
    targetGoals: ['Emotional Balance', 'Releasing Grief', 'Heart Coherence', 'Positive Mood'],
    voiceGuidance: true,
    coverGradient: 'from-pink-600 via-rose-700 to-purple-950',
    author: 'Lyra Vance & Dr. Elena Rostova',
    rating: 4.93,
    playsCount: 19800,
    guidedScript: [
      'Place your right hand over your heart center.',
      'Phase 1 gently vibrates at 396 Hz to loosen subconscious tightness and unexpressed grief in the lower body.',
      'Phase 2 opens into 639 Hz, circulating warmth and connection through your chest cavity and thymus.',
      'Feel complete forgiveness, gratitude, and emotional lightness radiating through every cell.'
    ],
    phases: [
      {
        id: 'p1',
        name: 'Phase 1: Releasing Root Contraction (396 Hz)',
        durationSeconds: 420,
        frequencyId: 'freq-396-liberation',
        frequencyHz: 396,
        waveform: 'sine',
        ambientSound: 'bowls',
        ambientVolume: 40,
        hapticIntensity: 45
      },
      {
        id: 'p2',
        name: 'Phase 2: Heart Harmonic Resonance (639 Hz)',
        durationSeconds: 480,
        frequencyId: 'freq-639-connection',
        frequencyHz: 639,
        waveform: 'sine',
        ambientSound: 'forest',
        ambientVolume: 35,
        hapticIntensity: 40
      },
      {
        id: 'p3',
        name: 'Phase 3: Intuitive Awakening & Integration (852 Hz)',
        durationSeconds: 300,
        frequencyId: 'freq-852-anxiety',
        frequencyHz: 852,
        waveform: 'sine',
        ambientSound: 'cosmic',
        ambientVolume: 30,
        hapticIntensity: 30
      }
    ]
  },
  {
    id: 'session-scandinavian-vat-sweep',
    title: 'Scandinavian Whole-Body Vibroacoustic Mat Sweep',
    subtitle: '33 Hz - 66 Hz - 110 Hz Sub-Bass Transducer Protocol',
    description: 'Designed specifically for vibroacoustic sound beds, acoustic chairs, tactile vests, and subwoofer systems. Delivers deep mechanical fluid massage to skeletal and myofascial systems.',
    category: 'Somatic & Transducer',
    durationMinutes: 25,
    difficulty: 'Deep Healing',
    targetGoals: ['Whole Body Lymphatic Drain', 'Fibromyalgia Relief', 'Spine Mobilization', 'Deep Neuromuscular Reset'],
    voiceGuidance: false,
    coverGradient: 'from-amber-600 via-orange-700 to-stone-950',
    author: 'Alfred Pischinger Sound Institute',
    rating: 4.97,
    playsCount: 22100,
    guidedScript: [
      'Connect your vibroacoustic bed, mat, or high-definition headphones.',
      'Low sub-bass acoustic waveforms will now sweep through your physical body.',
      'Allow every joint, tendon, and vertebral disc to oscillate freely with the physical resonance.'
    ],
    phases: [
      {
        id: 'p1',
        name: 'Phase 1: Pelvic & Sacral Low-End Wave (33 Hz)',
        durationSeconds: 480,
        frequencyId: 'freq-tactile-33',
        frequencyHz: 33,
        waveform: 'harmonic',
        ambientSound: 'bowls',
        ambientVolume: 25,
        hapticIntensity: 85
      },
      {
        id: 'p2',
        name: 'Phase 2: Thoracic Vagal Sweep (66 Hz)',
        durationSeconds: 540,
        frequencyId: 'freq-tactile-66',
        frequencyHz: 66,
        waveform: 'harmonic',
        ambientSound: 'ocean',
        ambientVolume: 30,
        hapticIntensity: 75
      },
      {
        id: 'p3',
        name: 'Phase 3: Harmonic Cascade (11-22-33-44-88 Hz)',
        durationSeconds: 480,
        frequencyId: 'freq-tactile-harmonic-suite',
        frequencyHz: 44,
        waveform: 'harmonic',
        ambientSound: 'cosmic',
        ambientVolume: 35,
        hapticIntensity: 90
      }
    ]
  },
  {
    id: 'session-gamma-flow',
    title: 'Gamma 40Hz Cognitive Awakening & Flow State',
    subtitle: '10 Hz Alpha Warm-up to 40 Hz Gamma Peak Synthesis',
    description: 'Stimulates microglial brain cleansing, heightened sensory binding, and ultra-sharp executive focus. Ideal for morning preparation or intensive creative sprints.',
    category: 'Cognitive & Focus',
    durationMinutes: 15,
    difficulty: 'Intermediate',
    targetGoals: ['Peak Focus', 'Cognitive Energy', 'Brain Cleanse', 'Flow State'],
    voiceGuidance: true,
    coverGradient: 'from-violet-600 via-fuchsia-700 to-indigo-950',
    author: 'Marcus Sterling & Kai Tanaka',
    rating: 4.91,
    playsCount: 15400,
    guidedScript: [
      'Take three rapid deep breaths in through your nose, exhaling with power.',
      'We warm up the cortical networks with 10 Hz Alpha flow.',
      'Now shifting into 40 Hz Gamma wave synchrony. Feel mental fog dissolve into razor-sharp lucidity.'
    ],
    phases: [
      {
        id: 'p1',
        name: 'Phase 1: Alpha Primer (10 Hz Beat)',
        durationSeconds: 300,
        frequencyId: 'freq-alpha-calm',
        frequencyHz: 432,
        binauralBeatHz: 10.0,
        waveform: 'binaural',
        ambientSound: 'none',
        ambientVolume: 0,
        hapticIntensity: 30
      },
      {
        id: 'p2',
        name: 'Phase 2: Gamma Peak Synthesis (40 Hz Beat)',
        durationSeconds: 600,
        frequencyId: 'freq-gamma-synthesis',
        frequencyHz: 432,
        binauralBeatHz: 40.0,
        waveform: 'binaural',
        ambientSound: 'cosmic',
        ambientVolume: 20,
        hapticIntensity: 45
      }
    ]
  }
];
