import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Square, Volume2, VolumeX, RotateCw, Sparkles, MapPin, Radio, ShieldCheck, AlertCircle, Compass, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Place } from '../data';
import clsx from 'clsx';

interface AutoTourBannerProps {
  places: Place[];
  currentIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectPlace: (index: number) => void;
  speedSec: number;
  onChangeSpeed: (speed: number) => void;
  autoRotate: boolean;
  onToggleRotate: () => void;
  narrate: boolean;
  onToggleNarrate: () => void;
}

export const AutoTourBanner: React.FC<AutoTourBannerProps> = ({
  places,
  currentIndex,
  isPlaying,
  onPlayPause,
  onStop,
  onNext,
  onPrev,
  onSelectPlace,
  speedSec,
  onChangeSpeed,
  autoRotate,
  onToggleRotate,
  narrate,
  onToggleNarrate,
}) => {
  const currentPlace = places[currentIndex];
  const [timeLeft, setTimeLeft] = useState(speedSec);

  // Timer countdown for tour auto-advance
  useEffect(() => {
    if (!isPlaying) {
      setTimeLeft(speedSec);
      return;
    }

    setTimeLeft(speedSec);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onNext();
          return speedSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, speedSec, onNext]);

  // Speech Synthesis Narration
  useEffect(() => {
    if (!narrate || !currentPlace || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop prior speech
    const textToRead = `Parada ${currentIndex + 1}. ${currentPlace.name}. ${currentPlace.category}. ${currentPlace.smartFeature || currentPlace.description}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-MX';
    utterance.rate = 1.0;
    
    // Select Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentIndex, narrate, currentPlace]);

  if (!currentPlace) return null;

  const progressPercent = ((speedSec - timeLeft) / speedSec) * 100;

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-3xl bg-slate-900/90 backdrop-blur-xl border border-indigo-500/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      {/* Top Progress bar */}
      <div className="h-1.5 w-full bg-slate-800 relative overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          style={{ width: `${progressPercent}%` }}
          transition={{ ease: 'linear', duration: 0.9 }}
        />
      </div>

      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Stop Info */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center font-black text-indigo-300 text-lg shadow-lg">
              {currentIndex + 1}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Tour Smart City ({currentIndex + 1}/{places.length})
              </span>
              {currentPlace.digitalPresence ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Digital
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" /> Brecha Digital
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white truncate leading-tight mt-0.5">
              {currentPlace.name}
            </h3>

            <p className="text-xs text-indigo-200/80 truncate font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400 shrink-0" />
              {currentPlace.smartFeature || currentPlace.description}
            </p>
          </div>
        </div>

        {/* Center/Right: Interactive Controls */}
        <div className="flex items-center gap-2 shrink-0 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <button
            onClick={onPrev}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayPause}
            className={clsx(
              "p-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-lg",
              isPlaying
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            )}
            title={isPlaying ? "Pausar" : "Iniciar"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
              {isPlaying ? `${timeLeft}s` : "Reanudar"}
            </span>
          </button>

          <button
            onClick={onNext}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Siguiente"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 my-auto" />

          {/* Auto Rotate Toggle */}
          <button
            onClick={onToggleRotate}
            className={clsx(
              "p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold",
              autoRotate
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            )}
            title="Rotación 360° Panorama"
          >
            <RotateCw className={clsx("w-4 h-4", autoRotate && "animate-spin")} style={{ animationDuration: '8s' }} />
            <span className="hidden lg:inline">360°</span>
          </button>

          {/* Narration Voice Toggle */}
          <button
            onClick={onToggleNarrate}
            className={clsx(
              "p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold",
              narrate
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            )}
            title="Narrador de Voz IA"
          >
            {narrate ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Speed Selector */}
          <select
            value={speedSec}
            onChange={(e) => onChangeSpeed(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value={5}>5s/parada</option>
            <option value={8}>8s/parada</option>
            <option value={12}>12s/parada</option>
          </select>

          <div className="h-4 w-px bg-slate-800 my-auto" />

          {/* Stop Tour */}
          <button
            onClick={onStop}
            className="p-2 text-red-400 hover:bg-red-950/50 hover:text-red-300 rounded-lg transition-colors"
            title="Salir del Modo Demostración"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
