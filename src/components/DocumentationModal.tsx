import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Radio,
  Sliders,
  Bot,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
  Volume2,
  CheckCircle2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'frequencies' | 'engine' | 'guru' | 'hardware' | 'safety'>('overview');

  if (!isOpen) return null;

  return (
    <div
      id="documentation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Acoustic Vibra — Clinical & User Manual
              </h2>
              <p className="text-xs text-slate-400">
                Operating guides, frequency standards, cymatics science, and safety parameters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Sidebar Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-56 p-3 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Platform Overview', icon: Radio },
              { id: 'frequencies', label: 'Frequency Standards', icon: Activity },
              { id: 'engine', label: 'Audio & Visualizer', icon: Sliders },
              { id: 'guru', label: 'AI Sound Guru', icon: Bot },
              { id: 'hardware', label: 'Beds & Transducers', icon: Cpu },
              { id: 'safety', label: 'Safety Guardrails', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition text-left whitespace-nowrap md:whitespace-normal ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-300">
            {/* 1. OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40">
                  <h3 className="text-base font-bold text-cyan-300 mb-1">Welcome to Acoustic Vibra</h3>
                  <p className="text-xs text-slate-300">
                    Acoustic Vibra is a full-spectrum vibroacoustic therapy (VAT) environment delivering targeted low-frequency tactile sound, brainwave entrainment, and harmonic Solfeggio tones for clinical relaxation, pain management, and sleep enhancement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-cyan-400" /> Curated Protocols
                    </span>
                    <p className="text-xs text-slate-400">
                      Explore pre-programmed multi-phase acoustic journeys with instant 5-second frequency pattern visual previews.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" /> Custom Protocol Builder
                    </span>
                    <p className="text-xs text-slate-400">
                      Compose multi-phase frequency cascades with customizable carriers, waveforms, binaural beats, and ambient soundscapes.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" /> Biometric Tracking
                    </span>
                    <p className="text-xs text-slate-400">
                      Measure pre- and post-session calibrations, HRV recovery, and VAS pain reductions over time.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-purple-400" /> AI Sound Guru
                    </span>
                    <p className="text-xs text-slate-400">
                      Gemini-powered acoustic symptom diagnosis, custom prescription generation, and interactive clinical consultations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. FREQUENCY STANDARDS */}
            {activeSection === 'frequencies' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-base font-bold text-white">Frequency Reference Table</h3>
                <p className="text-xs text-slate-400">
                  Targeted audio and somatic frequency bands utilized across our therapeutic protocols:
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950/90 text-cyan-300 font-bold uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Band / Tone</th>
                        <th className="py-2.5 px-3">Range (Hz)</th>
                        <th className="py-2.5 px-3">Therapeutic Mechanism</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr className="bg-slate-900/40">
                        <td className="py-2 px-3 font-semibold text-white">Delta Waves</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">0.5 – 3.5 Hz</td>
                        <td className="py-2 px-3 text-slate-300">Deep regenerative sleep, cellular healing, somatic restoration</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-white">Theta Waves</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">4.0 – 7.5 Hz</td>
                        <td className="py-2 px-3 text-slate-300">Deep meditation, vagal down-regulation, emotional clearing</td>
                      </tr>
                      <tr className="bg-slate-900/40">
                        <td className="py-2 px-3 font-semibold text-white">Alpha Waves</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">8.0 – 12.0 Hz</td>
                        <td className="py-2 px-3 text-slate-300">Calm focus, stress relief, cognitive relaxation</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-white">Gamma Waves</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">40.0 Hz</td>
                        <td className="py-2 px-3 text-slate-300">Microglial activation, neuroprotection, mental alertness</td>
                      </tr>
                      <tr className="bg-slate-900/40">
                        <td className="py-2 px-3 font-semibold text-white">Vibroacoustic (VAT)</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">28 – 68 Hz</td>
                        <td className="py-2 px-3 text-slate-300">Myofascial tension release, lymphatic stimulation, pain reduction</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-white">Solfeggio 174 Hz</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">174 Hz</td>
                        <td className="py-2 px-3 text-slate-300">Natural pain relief, body relaxation, grounding</td>
                      </tr>
                      <tr className="bg-slate-900/40">
                        <td className="py-2 px-3 font-semibold text-white">Harmonic 432 Hz</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">432 Hz</td>
                        <td className="py-2 px-3 text-slate-300">Natural harmonic resonance, autonomic nervous system balance</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-white">Solfeggio 528 Hz</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">528 Hz</td>
                        <td className="py-2 px-3 text-slate-300">Transformation frequency, cortisol down-regulation, emotional clarity</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. SYNTHESIZER & VISUALIZER */}
            {activeSection === 'engine' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-base font-bold text-white">Synthesizer & Cymatics Engine</h3>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">
                      Multi-Oscillator Audio Node Architecture
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Our Web Audio synthesizer constructs carrier nodes, stereo panners for precise binaural delta/theta offsets, and gain envelopes with smooth anti-click interpolation (ramping over 0.05s to prevent audio clicks).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                      Cymatics & Wave Physics Visualizer
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Toggle between <strong>Chladni Plate Geometry</strong> (simulating physical sand resonance nodes), <strong>Lissajous Curves</strong> (phase-differential harmonic ratios), and <strong>Fluid Dynamic Water Rings</strong> (simulating acoustic pressure propagation through human tissue).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. AI SOUND GURU */}
            {activeSection === 'guru' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-base font-bold text-white">AI Sound Guru & Prescriptions</h3>
                <p className="text-xs text-slate-400">
                  Powered by Google Gemini models to assist practitioners and users in finding customized frequency regimens.
                </p>

                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-2">
                  <div className="flex items-center space-x-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                    <Bot className="w-4 h-4" />
                    <span>How to use the Guru:</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li><strong>Symptom Intake:</strong> Enter physical symptoms (e.g., lower back stiffness, tension headache) and emotional state to receive a generated multi-phase protocol.</li>
                    <li><strong>Instant Launch:</strong> Click "Launch Generated Prescription" to begin the tailored therapy session immediately.</li>
                    <li><strong>Interactive Guidance:</strong> Ask scientific questions regarding Solfeggio tones, brainwave entrainment, transducer placement, and duration.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 5. HARDWARE & BEDS */}
            {activeSection === 'hardware' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-base font-bold text-white">Vibroacoustic Beds, Mats & Transducers</h3>
                <p className="text-xs text-slate-400">
                  Connect tactile hardware to turn audio frequencies into deep bodily vibrations.
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs font-bold text-cyan-300 block mb-1">Recommended Hardware Types</span>
                    <p className="text-xs text-slate-400">
                      Supports tactile transducers (Dayton Audio, SubPac), vibroacoustic massage tables, sound therapy mats, and high-fidelity open-back stereo headphones.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs font-bold text-cyan-300 block mb-1">Placement Guidelines</span>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      <li><strong>Lumbar / Sacrum:</strong> Low-frequency 40–52 Hz for lower back tension and grounding.</li>
                      <li><strong>Thoracic / Spine:</strong> 52–68 Hz for spinal decompression and nervous system regulation.</li>
                      <li><strong>Headphones:</strong> For stereo binaural beat entrainment (required for delta/theta/gamma binaural synthesis).</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SAFETY */}
            {activeSection === 'safety' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 space-y-2">
                  <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    Clinical Safety Guidelines & Guardrails
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Vibroacoustic sound therapy is a non-invasive complementary modality. Please adhere to the following recommendations:
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Comfortable Volume:</strong> Entrainment is achieved through frequency coherence, not excessive decibel volume. Keep volume below 75 dB SPL.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Cardiac Pacemakers:</strong> Keep high-power magnetic transducers at least 6 inches away from implanted cardiac devices.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Epilepsy & Sensory Sensitivities:</strong> Patients prone to auditory-triggered or photosensitive seizures should consult a physician prior to using rapid isochronic pulses.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Acoustic Vibra v2.4 • Clinical Vibroacoustic Sound Suite</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
