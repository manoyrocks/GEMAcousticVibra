# Acoustic Vibra — Vibroacoustic & Sound Frequency Therapy Platform

**Acoustic Vibra** is a clinical-grade vibroacoustic sound therapy application designed for neuro-acoustic entrainment, somatic frequency healing, pain modulation, and deep restorative sleep. It combines precision Web Audio frequency synthesis, multi-modal cymatics visualization, Gemini AI acoustic health consultations, somatic biometric tracking, and hardware bed/transducer integrations into a unified web experience.

---

## 🌟 Key Capabilities & Features

### 1. Curated Vibroacoustic Protocols & Live 5s Previews
- **Clinical Protocol Categories**:
  - **Pain Relief & Muscle Tension**: Low-frequency somatic transducer tones (28 Hz–68 Hz) targeted for myofascial release and joint decompression.
  - **Stress, Anxiety & Vagus Nerve**: 432 Hz harmonic resonance, 528 Hz transformation frequency, and vagal tone acoustic stimulation.
  - **Sleep & Delta Regeneration**: 0.5 Hz–3.5 Hz delta brainwave binaural entrainment paired with 432 Hz warm drones.
  - **Cognitive & Gamma Focus**: 40 Hz gamma oscillations for neuro-protection, microglial stimulation, and deep concentration.
  - **Mood & Somatic Healing**: 639 Hz and 741 Hz Solfeggio frequencies for emotional centering and nervous system balance.
  - **Vibro-Bed & Transducer Mode**: Optimized for tactile bass shakers, tactile sound mats, and multi-channel vibroacoustic furniture.
- **Interactive 5-Second Pattern Preview**: Hover over any session card in the Explore view to view live animated frequency cymatics and listen to a gentle calibrated audio sample before launching.

### 2. Multi-Tone Web Audio Synthesizer Engine
- **Carrier Oscillators**: Pure Sine, Gentle Triangle, Complex Harmonic, Sawtooth, and Square synthesis nodes.
- **Binaural Beat Modulation**: Independent stereo phase offsets generating targeted Delta (1-4 Hz), Theta (4-8 Hz), Alpha (8-13 Hz), Beta (13-30 Hz), and Gamma (30-50 Hz) brainwave entrainment.
- **Isochronic Pulse Modulation**: Rhythmic amplitude modulation for monaural brainwave stimulation without requiring stereo headphones.
- **Ambient Soundscapes**: Layered organic audio textures including Deep Rain, Ocean Swell, Forest Night, Tibetan Singing Bowls, Waterfall, and Cosmic Drone.
- **Haptic Vibration Simulation**: Synchronized tactile vibration using the Navigator Vibration API on supported mobile and tablet devices.

### 3. AI Sound Guru (Gemini 3 Powered)
- **Somatic Intake & Symptom Evaluation**: Enter physical pain points, mental fatigue levels, or sleep difficulties to receive a customized multi-phase frequency prescription.
- **Real-Time Prescription Engine**: Automatically builds multi-step phase cascades tailored to patient goals (e.g., 5-min 174 Hz induction $\rightarrow$ 10-min 528 Hz core $\rightarrow$ 5-min 432 Hz grounding).
- **Interactive Clinical Chat**: Inquire about frequency ranges, transducer placement, safety guidelines, and contraindications with the AI Sound Guru.

### 4. Interactive Cymatics & Fluid Dynamic Visualizers
- **Chladni Plate Geometry**: Geometric nodal resonance equations simulating sand and physical plate vibrations.
- **Lissajous Resonance Patterns**: Phase-locked orthogonal wave geometry displaying frequency ratio interactions.
- **Liquid Water Rings**: Concentric wave ripple simulations modeling sound propagation through cellular water.
- **3D Frequency Oscilloscope**: Real-time spectral and harmonic wave tracing.

### 5. Multi-Phase Custom Session Builder
- Design custom sequential frequency protocols with configurable:
  - Phase duration and carrier frequency (Hz)
  - Waveform selection and binaural beat offset
  - Layered ambient nature sounds and individual volume blends
  - Haptic intensity and tactile pulse rates
- Save, export, and manage custom recipes locally with instantaneous playback.

### 6. Somatic Biometrics & Mood Tracking
- **Pre- and Post-Session Calibrations**: Measure pain levels (1–10 VAS scale), mental stress, mood state, and physical tension before and after each session.
- **Progress & Clinical Metrics**: Track total therapy time, Heart Rate Variability (HRV) recovery trends, cumulative stress reduction percentages, and sleep score improvements.

### 7. Sleep Scheduler & Auto-Wind Down
- Schedule nightly vibroacoustic sleep sessions with target bedtimes and wake alarms.
- One-touch **432 Hz Auto-Wind Down** timer with smooth exponential audio fade-outs to ease transition into restorative sleep.

### 8. Admin, Guardian & Clinician Portal
- **Safety Decibel Caps & Guardrails**: Set hard maximum dB limits and volume restrictions for sensitive listeners.
- **Patient Profile Management**: Switch between patient profiles (e.g., pediatric, geriatric, sensory-sensitive) with stored clinical notes.
- **Hardware, Beds & Transducers**: Configuration guides and channel matrixing for SubPac, Sound Oasis, vibro-loungers, and tactile transducers.
- **Community Protocol Recipes**: Browse and load peer-reviewed protocols from clinical sound therapists.

---

## 🏗️ Architecture & Technology Stack

```
├── server.ts                    # Express backend proxying Google Gemini API calls
├── src/
│   ├── components/              # Modular UI & Visualization Components
│   │   ├── ActiveSessionPlayer.tsx   # Fullscreen session player & biofeedback controls
│   │   ├── AdminGuardianPortal.tsx   # Safety guardrails, patient profiles & hardware
│   │   ├── AiConsultant.tsx          # AI Sound Guru symptom intake & chat consultation
│   │   ├── AnalyticsDashboard.tsx    # Biometrics, HRV trends & pain relief tracking
│   │   ├── CommunityForum.tsx        # Clinical community protocols and discussion
│   │   ├── CymaticsVisualizer.tsx    # Canvas-based Chladni, Lissajous & fluid visuals
│   │   ├── DocumentationModal.tsx    # In-app user manual & clinical guide
│   │   ├── FrequencyLibrary.tsx      # Comprehensive Solfeggio & brainwave frequency database
│   │   ├── MasterVolumeControl.tsx   # Global gain controller with safety limiting
│   │   ├── MoodTracker.tsx           # Pre/post session calibration check-in modals
│   │   ├── SessionBuilder.tsx        # Multi-phase protocol composer
│   │   ├── SessionCard.tsx           # Session card with hover animations & 5s preview
│   │   ├── SleepSchedulerCard.tsx    # Nightly bedtime automation & 432 Hz wind-down
│   │   ├── SoundscapeSelector.tsx    # Layered ambient audio selector
│   │   ├── ThemeToggle.tsx           # Dark/Light/Twilight acoustic themes
│   │   └── WearableHardwareIntegration.tsx # Vibroacoustic hardware & wearable setup
│   ├── services/
│   │   ├── sleepScheduleService.ts   # LocalStorage & notification bedtime service
│   │   ├── soundEngine.ts            # Web Audio API multi-oscillator synthesizer engine
│   │   ├── soundscapeLoader.ts       # Ambient synthesized noise and drone generator
│   │   ├── storage.ts                # Client-side session and biometrics persistence
│   │   └── themeManager.ts           # Acoustic color palette management
│   ├── data/
│   │   ├── frequencies.ts            # Clinical frequency reference data
│   │   ├── presetSessions.ts         # Pre-configured vibroacoustic protocol catalogue
│   │   └── soundscapes.ts            # Ambient soundscape definitions
│   ├── types.ts                      # Shared TypeScript data models and interfaces
│   ├── App.tsx                       # Main application shell & tab routing
│   └── main.tsx                      # React DOM entrypoint
```

---

## 🔬 Frequency Reference Chart

| Frequency | Type | Primary Clinical Application |
| :--- | :--- | :--- |
| **0.5 – 3.5 Hz** | Delta Brainwave | Deep dreamless sleep, cellular restoration, HGH release |
| **4.0 – 7.5 Hz** | Theta Brainwave | Deep meditation, somatic trauma release, hypnagogic state |
| **8.0 – 12.0 Hz** | Alpha Brainwave | Calm alertness, vagus nerve stimulation, flow state |
| **40.0 Hz** | Gamma Wave | Microglial activation, memory recall, cognitive performance |
| **40 – 68 Hz** | Vibroacoustic (VAT) | Myofascial pain reduction, joint mobility, fibromyalgia relief |
| **174 Hz** | Solfeggio | Natural anaesthetic, physical pain relief, grounding |
| **285 Hz** | Solfeggio | Tissue regeneration, cellular healing, somatic repair |
| **396 Hz** | Solfeggio | Liberating guilt and fear, root chakra stabilization |
| **417 Hz** | Solfeggio | Undoing negative situations, emotional resilience |
| **432 Hz** | Harmonic Standard | Nervous system down-regulation, mathematical natural resonance |
| **528 Hz** | Solfeggio | Transformation, DNA resonance, deep autonomic balance |
| **639 Hz** | Solfeggio | Interpersonal connection, relationship healing, empathy |
| **741 Hz** | Solfeggio | Detoxification, intuitive clarity, cognitive cleansing |
| **852 Hz** | Solfeggio | Returning to spiritual order, third eye stimulation |
| **963 Hz** | Solfeggio | Pineal activation, transcendent peace, crown chakra alignment |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- Modern web browser with Web Audio API support (Chrome, Edge, Safari, Firefox)

### Environment Variables
Configure your `.env` file for Gemini AI features:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation & Local Development
```bash
# Install dependencies
npm install

# Start the full-stack dev server (Express + Vite)
npm run dev
```
The application will be running at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```

---

## 🛡️ Safety & Clinical Guidelines
1. **Volume Levels**: Always keep volume at a comfortable listening level. Sound frequency therapy does not require loud volume to produce somatic or brainwave entrainment benefits.
2. **Epilepsy / Seizure Sensitivity**: Individuals with photosensitive or audio-frequency triggered epilepsy should consult their physician before using isochronic pulses or intense visual cymatics.
3. **Pacemakers & Implants**: If utilizing high-power vibroacoustic furniture or tactile transducers, keep transducers at least 6 inches away from active cardiac pacemakers.
