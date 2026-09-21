import React, { useState } from 'react';
import { FrequencyItem, VibroSession, SoundRecommendation } from '../types';
import { FREQUENCIES_LIBRARY } from '../data/frequencies';
import {
  Sparkles,
  Bot,
  Send,
  Play,
  Heart,
  Activity,
  Zap,
  CheckCircle2,
  Brain,
  Sliders,
  HelpCircle,
  MessageSquareText,
  Stethoscope
} from 'lucide-react';

interface Props {
  onLaunchRecommendedSession: (session: VibroSession) => void;
}

export const AiConsultant: React.FC<Props> = ({ onLaunchRecommendedSession }) => {
  const [activeTab, setActiveTab] = useState<'prescription' | 'chat'>('prescription');

  // Prescription Form State
  const [userGoal, setUserGoal] = useState('Anxiety Relief & Vagal Nerve Reset');
  const [symptoms, setSymptoms] = useState('Upper shoulder tension, racing thoughts before sleep');
  const [stressLevel, setStressLevel] = useState<number>(8);
  const [painLevel, setPainLevel] = useState<number>(5);
  const [sleepQuality, setSleepQuality] = useState('Fragmented (waking up tired)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<SoundRecommendation | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; time: string }>
  >([
    {
      role: 'assistant',
      text: 'Hello! I am Dr. Aris Thorne, Lead Sound Architect & Clinical Sound Therapist at Acoustic Vibra. How is your nervous system feeling today, and what therapeutic outcome are you seeking?',
      time: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleGeneratePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userGoal,
          symptoms,
          stressLevel,
          painLevel,
          sleepQuality
        })
      });

      const data = await res.json();
      if (data.recommendation) {
        // Hydrate frequency items
        const freqIds: string[] = data.recommendation.recommendedFrequencyIds || ['freq-432-pain', 'freq-528-transformation'];
        const matchedFrequencies = freqIds
          .map(id => FREQUENCIES_LIBRARY.find(f => f.id === id || f.name.includes(id)))
          .filter(Boolean) as FrequencyItem[];

        const finalFrequencies = matchedFrequencies.length > 0 ? matchedFrequencies : [FREQUENCIES_LIBRARY[0], FREQUENCIES_LIBRARY[2]];

        setRecommendation({
          recommendedFrequencies: finalFrequencies,
          suggestedDurationMinutes: data.recommendation.suggestedDurationMinutes || 20,
          rationale: data.recommendation.rationale || 'Acoustic resonance induces vagal stabilization.',
          targetFocus: data.recommendation.targetFocus || 'Somatic Rest & Neural Deceleration',
          recommendedAmbience: data.recommendation.recommendedAmbience || 'ocean',
          binauralBeatTarget: data.recommendation.binauralBeatTarget || 6.0,
          clinicalNote: data.recommendation.clinicalNote || 'Hydrate with clean water and use over-ear headphones.'
        });
      }
    } catch (err) {
      console.error('Failed to get recommendation:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userText = inputMessage;
    setInputMessage('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [...prev, { role: 'user', text: userText, time: now }]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: chatMessages.map(m => ({ role: m.role, content: m.text }))
        })
      });

      const data = await res.json();
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'I recommend resting with 432 Hz and slow diaphragmatic breathing.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Vibroacoustic sound therapy utilizes resonant acoustic waveforms (e.g., 432 Hz, 528 Hz, 174 Hz) to balance the autonomic nervous system and restore cellular coherence.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const launchPrescription = () => {
    if (!recommendation) return;

    const session: VibroSession = {
      id: `ai-prescribed-${Date.now()}`,
      title: `AI Prescribed: ${recommendation.targetFocus}`,
      subtitle: `${recommendation.recommendedFrequencies.map(f => `${f.frequency}Hz`).join(' + ')} Resonance Protocol`,
      description: recommendation.rationale,
      category: 'AI Prescribed Protocol',
      durationMinutes: recommendation.suggestedDurationMinutes,
      difficulty: 'Beginner',
      targetGoals: [recommendation.targetFocus, 'HRV Optimization', 'Somatic Alignment'],
      voiceGuidance: true,
      coverGradient: 'from-cyan-600 via-teal-600 to-indigo-950',
      author: 'Acoustic Vibra AI Guru',
      rating: 5.0,
      guidedScript: [
        `Welcome to your personalized ${recommendation.targetFocus} session.`,
        `Phase 1 introduces ${recommendation.recommendedFrequencies[0]?.name || '432 Hz'} to induce somatic ease.`,
        recommendation.clinicalNote
      ],
      phases: recommendation.recommendedFrequencies.map((f, idx) => ({
        id: `p-${idx}`,
        name: `Phase ${idx + 1}: ${f.name.split('—')[0]} (${f.frequency} Hz)`,
        durationSeconds: Math.floor((recommendation.suggestedDurationMinutes * 60) / recommendation.recommendedFrequencies.length),
        frequencyId: f.id,
        frequencyHz: f.frequency,
        binauralBeatHz: recommendation.binauralBeatTarget,
        waveform: f.waveform,
        ambientSound: (recommendation.recommendedAmbience as any) || 'ocean',
        ambientVolume: 35,
        hapticIntensity: 50
      }))
    };

    onLaunchRecommendedSession(session);
  };

  return (
    <div className="space-y-6" id="ai-consultant-section">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>Clinical AI Neuro-Acoustic Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            AI Sound Guru & Prescription Engine
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Powered by Gemini AI to evaluate symptoms, stress biometrics, and prescribe personalized vibroacoustic protocols.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('prescription')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'prescription'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Prescription Engine</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'chat'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Guru Consultation</span>
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'prescription' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Parameters Form (6 cols) */}
          <form
            onSubmit={handleGeneratePrescription}
            className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Symptom & Well-Being Calibration</span>
            </h3>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Primary Goal / Outcome
              </label>
              <input
                type="text"
                value={userGoal}
                onChange={e => setUserGoal(e.target.value)}
                placeholder="e.g. Relieve acute anxiety and calm somatic tremor"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Specific Physical Tension / Pain Points
              </label>
              <input
                type="text"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="e.g. Lumbar spine stiffness, chronic neck tightness"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Stress Index</span>
                  <span className="text-rose-400 font-bold font-mono">{stressLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={e => setStressLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Pain Level</span>
                  <span className="text-amber-400 font-bold font-mono">{painLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={painLevel}
                  onChange={e => setPainLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1">
                Recent Sleep Quality
              </label>
              <select
                value={sleepQuality}
                onChange={e => setSleepQuality(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Restful & Deep (7+ hours)">Restful & Deep (7+ hours)</option>
                <option value="Fragmented (waking up tired)">Fragmented (waking up tired)</option>
                <option value="Insomnia / Difficulty falling asleep">Insomnia / Difficulty falling asleep</option>
                <option value="Severe exhaustion & mental fatigue">Severe exhaustion & mental fatigue</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'AI Synthesizing Frequency Prescription...' : 'Generate AI Prescription'}</span>
            </button>
          </form>

          {/* Output Prescription Card (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            {recommendation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Personalized Protocol Generated
                    </span>
                    <h4 className="text-lg font-bold text-white leading-tight">
                      {recommendation.targetFocus}
                    </h4>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold">
                    {recommendation.suggestedDurationMinutes} Min
                  </div>
                </div>

                {/* Recommended Frequency Badges */}
                <div>
                  <span className="text-xs text-slate-400 block mb-2 font-medium">
                    Prescribed Acoustic Frequencies:
                  </span>
                  <div className="space-y-2">
                    {recommendation.recommendedFrequencies.map(f => (
                      <div
                        key={f.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-950 font-bold text-xs"
                            style={{ backgroundColor: f.color }}
                          >
                            {f.frequency < 20 ? f.frequency : Math.round(f.frequency)}
                          </span>
                          <div>
                            <strong className="text-white block">{f.name}</strong>
                            <span className="text-[11px] text-slate-400">{f.targetBodyArea}</span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                          {f.categoryLabel.split('&')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rationale & Clinical Advice */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div>
                    <strong className="text-cyan-300 block mb-0.5">Scientific Rationale:</strong>
                    <p className="text-slate-300 leading-relaxed">{recommendation.rationale}</p>
                  </div>
                  <div>
                    <strong className="text-indigo-300 block mb-0.5">Clinical Application Note:</strong>
                    <p className="text-slate-400">{recommendation.clinicalNote}</p>
                  </div>
                </div>

                <button
                  onClick={launchPrescription}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/25 transition flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch AI Prescribed Session</span>
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Brain className="w-7 h-7" />
                </div>
                <h4 className="text-base font-semibold text-white">
                  Ready to Calibrate Your Biofield
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Fill out your current symptoms and stress levels on the left. Gemini AI will calculate the ideal resonant harmonic suite for your body.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Clinical Doctor Chat Consultation */
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col h-[520px]">
          {/* Chat message history */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {msg.role === 'user' ? 'YOU' : 'GURU'}
                </div>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-200 border border-slate-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className="block text-[10px] text-slate-500 mt-1 text-right">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center space-x-2 text-xs text-cyan-400 p-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Dr. Thorne is analyzing acoustic frequency literature...</span>
              </div>
            )}
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask about frequencies, vibro beds, binaural beats, vagal tone..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={isChatLoading || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition disabled:opacity-50 flex items-center space-x-1"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
