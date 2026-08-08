import React, { useState, useEffect, useRef } from 'react';
import { Place, MOCK_PLACES } from '../data';
import { 
  X, Camera, Compass, Scan, MapPin, Globe, CheckCircle2, AlertTriangle, 
  Layers, ExternalLink, Sparkles, Navigation, Eye, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

interface ARModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace?: (place: Place) => void;
}

export const ARModeOverlay: React.FC<ARModeOverlayProps> = ({ isOpen, onClose, onSelectPlace }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number>(180); // Compass heading (0 - 360)
  const [selectedTag, setSelectedTag] = useState<Place | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'digital' | 'analog'>('all');

  // Initialize camera stream when open
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn('Video play defer:', e));
        }
        setCameraActive(true);
      } else {
        throw new Error('Cámara no compatible en este navegador.');
      }
    } catch (err: any) {
      console.warn('Camera access fallback:', err);
      setCameraError('Acceso a cámara simulado en modo HUD.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  // Filter places
  const filteredPlaces = MOCK_PLACES.filter(p => {
    if (filterMode === 'digital') return p.digitalPresence;
    if (filterMode === 'analog') return !p.digitalPresence;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden text-white"
    >
      {/* Background Camera Feed */}
      <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-105"
          />
        ) : (
          /* Simulated AR Environment Background if no camera device */
          <div className="w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/80 flex flex-col items-center justify-center relative">
            {/* Grid Mesh Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            
            <div className="z-10 text-center space-y-2 p-6 max-w-sm bg-slate-900/80 border border-indigo-500/30 rounded-3xl backdrop-blur-md">
              <Camera className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
              <h3 className="font-bold text-sm text-white">Vista AR de la Ciudad (Simulación)</h3>
              <p className="text-xs text-slate-300">
                {cameraError || "Súper-posiciona marcadores inteligentes sobre el mapa urbano real."}
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/30"
              >
                Activar Cámara Real
              </button>
            </div>
          </div>
        )}

        {/* HUD Surface Grid Overlay Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
      </div>

      {/* Top HUD Controls Header */}
      <div className="relative z-10 p-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Scan className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Realidad Aumentada (AR)
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold rounded-md">
                En Vivo
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">Detección de Coordenadas & Superficie Urbana</p>
          </div>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={clsx("px-2.5 py-1 rounded-xl transition-all text-[10px]", filterMode === 'all' ? "bg-indigo-600 text-white" : "text-slate-400")}
          >
            Todos ({MOCK_PLACES.length})
          </button>
          <button
            onClick={() => setFilterMode('digital')}
            className={clsx("px-2.5 py-1 rounded-xl transition-all text-[10px]", filterMode === 'digital' ? "bg-emerald-600 text-white" : "text-slate-400")}
          >
            Iluminados
          </button>
          <button
            onClick={() => setFilterMode('analog')}
            className={clsx("px-2.5 py-1 rounded-xl transition-all text-[10px]", filterMode === 'analog' ? "bg-slate-700 text-slate-200" : "text-slate-400")}
          >
            Analógicos
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Target Crosshair & Surface Mesh Graphics */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-32 h-32 border border-indigo-500/30 rounded-full flex items-center justify-center relative animate-pulse">
          <div className="w-2 h-2 bg-indigo-400 rounded-full" />
          <div className="absolute w-full h-[1px] bg-indigo-500/20" />
          <div className="absolute h-full w-[1px] bg-indigo-500/20" />
        </div>
      </div>

      {/* Floating 3D AR Business Markers Overlay */}
      <div className="relative z-10 flex-1 p-6 overflow-hidden pointer-events-auto relative">
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pointer-events-auto max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
            {filteredPlaces.map((place, idx) => {
              // Calculate positioning relative to compass heading
              const distanceMeters = Math.floor(120 + (idx * 85) % 450);
              const isSelected = selectedTag?.id === place.id;

              return (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedTag(place)}
                  className={clsx(
                    "p-3 rounded-2xl backdrop-blur-xl border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-2xl relative group",
                    place.digitalPresence
                      ? "bg-slate-900/85 border-emerald-500/50 hover:border-emerald-400 text-white shadow-emerald-950/40"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400 grayscale hover:grayscale-0 shadow-slate-950/80"
                  )}
                >
                  {/* Floating Distance Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={clsx(
                      "px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase border",
                      place.digitalPresence 
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    )}>
                      {place.digitalPresence ? 'Iluminado 🟢' : 'Apagado ⚪'}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/60">
                      📍 {distanceMeters}m
                    </span>
                  </div>

                  {/* Business Title & Details */}
                  <h4 className="font-black text-xs text-white truncate mb-1 flex items-center gap-1.5">
                    {place.name}
                  </h4>
                  <p className="text-[10px] text-slate-300 line-clamp-2 leading-snug">
                    {place.category} — {place.smartFeature || place.description}
                  </p>

                  {/* Direct Actions */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectPlace) onSelectPlace(place);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Inspeccionar
                    </button>

                    {place.digitalPresence && (
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Web Activa
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compass Azimuth Slider Controller */}
      <div className="relative z-10 p-4 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Compass className="w-5 h-5 text-indigo-400 animate-pulse shrink-0" />
          <div className="flex-1 sm:w-64">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span>Orientación Radar: {heading}° N</span>
              <span>100% Campo Visual</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={heading}
              onChange={(e) => setHeading(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            FPS: 60 WebGL
          </span>
          <span>•</span>
          <span>Cámara HD 1080p</span>
        </div>
      </div>
    </motion.div>
  );
};
