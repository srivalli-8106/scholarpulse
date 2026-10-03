import React, { useState, useEffect, useRef } from 'react';
import { Subject, PomodoroMode } from '../types';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Coffee,
  Brain,
  CheckCircle2,
} from 'lucide-react';

interface PomodoroRoomProps {
  currentSubject: Subject;
  studyMinutes: number;
  onSessionComplete: (mins: number) => void;
  pomodoroSeconds: number;
  isPomodoroRunning: boolean;
  onTogglePomodoro: () => void;
  onResetPomodoro: () => void;
  mode: PomodoroMode;
  onChangeMode: (mode: PomodoroMode) => void;
}

export const PomodoroRoom: React.FC<PomodoroRoomProps> = ({
  currentSubject,
  studyMinutes,
  onSessionComplete,
  pomodoroSeconds,
  isPomodoroRunning,
  onTogglePomodoro,
  onResetPomodoro,
  mode,
  onChangeMode,
}) => {
  const [ambientSound, setAmbientSound] = useState<'none' | 'whitenoise' | 'rain'>('none');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<AudioNode | null>(null);

  // Simple Web Audio API noise generator for ambient focus sounds
  const startAmbientNoise = (type: 'whitenoise' | 'rain') => {
    stopAmbientNoise();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate brown / pink filtered noise for soothing rain/whitenoise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'rain') {
          // Brown noise integration
          lastOut = (lastOut + 0.02 * white) / 1.02;
          output[i] = lastOut * 3.5;
        } else {
          // Pink-ish soft noise
          output[i] = white * 0.15;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gain = ctx.createGain();
      gain.gain.value = type === 'rain' ? 0.25 : 0.15;

      whiteNoise.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start(0);

      soundNodeRef.current = whiteNoise;
      setAmbientSound(type);
    } catch (e) {
      console.warn('AudioContext not allowed or supported', e);
    }
  };

  const stopAmbientNoise = () => {
    if (soundNodeRef.current) {
      try {
        (soundNodeRef.current as any).stop?.();
      } catch (e) {}
      soundNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setAmbientSound('none');
  };

  useEffect(() => {
    return () => {
      stopAmbientNoise();
    };
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const totalSec = mode === 'focus' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalSec - pomodoroSeconds) / totalSec) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-inner">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Focus Pomodoro Room</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Deep work intervals dedicated to {currentSubject.name}
            </p>
          </div>
        </div>
      </div>

      {/* Main Focus Clock Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700 relative z-10 text-xs font-bold">
          <button
            onClick={() => onChangeMode('focus')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              mode === 'focus'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Focus (25m)</span>
          </button>
          <button
            onClick={() => onChangeMode('shortBreak')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              mode === 'shortBreak'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Short Break (5m)</span>
          </button>
          <button
            onClick={() => onChangeMode('longBreak')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              mode === 'longBreak'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Long Break (15m)</span>
          </button>
        </div>

        {/* Giant Timer Display with Circular Arc Progress */}
        <div className="relative z-10 my-4">
          <div className="text-6xl sm:text-8xl font-black text-white font-mono tracking-tighter drop-shadow-md">
            {formatTimer(pomodoroSeconds)}
          </div>
          <div className="mt-2 text-xs uppercase tracking-widest text-indigo-400 font-bold">
            {mode === 'focus' ? `Studying ${currentSubject.name}` : 'Resting & Recharging'}
          </div>

          {/* Linear Progress Bar */}
          <div className="w-64 sm:w-80 mx-auto mt-6 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 relative z-10">
          <button
            onClick={onResetPomodoro}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={onTogglePomodoro}
            className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-base font-bold flex items-center gap-3 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            {isPomodoroRunning ? (
              <>
                <Pause className="w-6 h-6" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                <span>Start Studying</span>
              </>
            )}
          </button>
        </div>

        {/* Focus Ambient Sounds Generator */}
        <div className="pt-6 border-t border-slate-800 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Ambient Study Sounds:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => stopAmbientNoise()}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                ambientSound === 'none'
                  ? 'bg-slate-800 text-white border-slate-600 font-bold'
                  : 'border-slate-800 text-slate-500 hover:text-white'
              }`}
            >
              Mute
            </button>
            <button
              onClick={() => startAmbientNoise('rain')}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                ambientSound === 'rain'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm'
                  : 'border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Gentle Rain
            </button>
            <button
              onClick={() => startAmbientNoise('whitenoise')}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                ambientSound === 'whitenoise'
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm'
                  : 'border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Library White Noise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
