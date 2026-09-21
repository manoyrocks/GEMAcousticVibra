import React, { useState } from 'react';
import { WearableData } from '../types';
import { storage } from '../services/storage';
import { soundEngine } from '../services/soundEngine';
import {
  Watch,
  Vibrate,
  Wifi,
  WifiOff,
  Battery,
  Heart,
  Activity,
  CheckCircle2,
  RefreshCw,
  Zap,
  Volume2,
  Sliders,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const WearableHardwareIntegration: React.FC = () => {
  const [wearable, setWearable] = useState<WearableData>(() => storage.getWearableData());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingHaptics, setIsTestingHaptics] = useState(false);

  // Hardware devices simulated
  const [devices, setDevices] = useState([
    {
      id: 'dev-1',
      name: 'VibroAcoustic Resonance Bed Mk. IV',
      type: 'transducer-mat',
      status: 'Connected (BLE 5.3)',
      battery: 98,
      transducers: 6,
      range: '15 Hz - 250 Hz Low-Pass',
      active: true
    },
    {
      id: 'dev-2',
      name: 'BioFeedback Smart Ring (PPG/HRV)',
      type: 'wearable',
      status: 'Live Streaming',
      battery: 84,
      transducers: 0,
      range: 'Photoplethysmography (250Hz)',
      active: true
    },
    {
      id: 'dev-3',
      name: 'Tactile Vagus Neck Collar Pro',
      type: 'transducer-collar',
      status: 'Ready',
      battery: 100,
      transducers: 2,
      range: '20 Hz - 100 Hz',
      active: false
    }
  ]);

  const handleSyncWearable = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/wearables/sync', { method: 'POST' });
      const data = await res.json();
      if (data.wearable) {
        setWearable(data.wearable);
        storage.saveWearableData(data.wearable);
      }
    } catch (e) {
      console.error('Failed to sync:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestHapticPulse = () => {
    setIsTestingHaptics(true);
    soundEngine.play({
      frequency: 33, // 33 Hz physical resonance tone
      waveform: 'sine',
      volume: 80,
      ambientSound: 'none',
      ambientVolume: 0,
      hapticIntensity: 90
    });

    setTimeout(() => {
      soundEngine.stop();
      setIsTestingHaptics(false);
    }, 3000);
  };

  const toggleDevice = (id: string) => {
    setDevices(prev =>
      prev.map(d => (d.id === id ? { ...d, active: !d.active } : d))
    );
  };

  return (
    <div className="space-y-6" id="wearable-hardware-section">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Hardware & Bio-Transducer Ecosystem</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Wearable Trackers & Vibro Bed Transducers
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Pair your tactile vibration mats, sub-bass transducers, and continuous HRV wearables for live biofeedback loops.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSyncWearable}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center space-x-2 border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Sensors...' : 'Sync Sensor Telemetry'}</span>
          </button>

          <button
            onClick={handleTestHapticPulse}
            disabled={isTestingHaptics}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold flex items-center space-x-2 border border-amber-500/40 transition"
          >
            <Vibrate className="w-4 h-4" />
            <span>{isTestingHaptics ? 'Transducer Firing 33 Hz...' : 'Test 33 Hz Tactile Pulse'}</span>
          </button>
        </div>
      </div>

      {/* Live Biometric Sensor Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Instantaneous Pulse</span>
            <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono flex items-baseline space-x-1.5">
            <span>{Math.round(wearable.currentHeartRate)}</span>
            <span className="text-xs text-slate-400 font-normal">BPM</span>
          </div>
          <span className="text-[11px] text-emerald-400 block font-medium">
            ↓ 6 BPM below resting baseline
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Heart Rate Variability (HRV)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono flex items-baseline space-x-1.5">
            <span>{Math.round(wearable.hrvMs)}</span>
            <span className="text-xs text-slate-400 font-normal">ms (RMSSD)</span>
          </div>
          <span className="text-[11px] text-emerald-400 block font-medium">
            High Parasympathetic Vagal Tone
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Galvanic Stress Score</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono flex items-baseline space-x-1.5">
            <span>{wearable.stressScore}</span>
            <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <span className="text-[11px] text-cyan-400 block font-medium">
            Optimal Rest-and-Digest State
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sleep Recovery Index</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 font-mono flex items-baseline space-x-1.5">
            <span>{wearable.sleepScore}</span>
            <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <span className="text-[11px] text-indigo-300 block font-medium">
            Deep restorative delta phase logged
          </span>
        </div>
      </div>

      {/* Paired Hardware Devices */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
          <Sliders className="w-4 h-4" />
          <span>Paired Vibroacoustic Beds & Wearables</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map(dev => (
            <div
              key={dev.id}
              className={`p-5 rounded-2xl border transition-all ${
                dev.active
                  ? 'bg-slate-950/80 border-cyan-500/40 ring-1 ring-cyan-500/20'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      dev.active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {dev.transducers > 0 ? <Vibrate className="w-5 h-5" /> : <Watch className="w-5 h-5" />}
                  </div>
                  <div>
                    <strong className="text-xs text-white block leading-tight">
                      {dev.name}
                    </strong>
                    <span className="text-[10px] text-slate-400">{dev.status}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleDevice(dev.id)}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    dev.active ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-500 bg-slate-900'
                  }`}
                >
                  {dev.active ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Battery Level:</span>
                  <span className="text-slate-200 font-mono flex items-center space-x-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{dev.battery}%</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transducer Zones:</span>
                  <span className="text-slate-200 font-mono">{dev.transducers} Transducers</span>
                </div>
                <div className="flex justify-between">
                  <span>Frequency Band:</span>
                  <span className="text-cyan-300 text-[11px] font-mono">{dev.range}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
