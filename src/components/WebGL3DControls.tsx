import React from 'react';
import { 
  Box, Cpu, Layers, Sliders, Eye, Compass, Zap, Flame, Move3d, Sparkles, X, ChevronDown, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { WebGL3DSettings } from './DeckGLOverlay';

interface WebGL3DControlsProps {
  isOpen: boolean;
  onClose: () => void;
  webglEnabled: boolean;
  onToggleWebgl: (enabled: boolean) => void;
  settings: WebGL3DSettings;
  onUpdateSettings: (newSettings: WebGL3DSettings) => void;
  onTiltCamera: (tilt: number) => void;
}

export const WebGL3DControls: React.FC<WebGL3DControlsProps> = ({
  isOpen,
  onClose,
  webglEnabled,
  onToggleWebgl,
  settings,
  onUpdateSettings,
  onTiltCamera,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="fixed top-20 right-4 sm:right-8 z-40 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden text-slate-100"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-950 to-purple-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl shadow-md text-white">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              Superposición WebGL 3D <span className="text-[9px] px-2 py-0.5 bg-indigo-500/30 text-indigo-300 font-bold rounded-md border border-indigo-500/40">Deck.gl</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">GPU Hardware Accelerated</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Main GPU Switch */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-2xl border border-indigo-500/30">
          <div className="flex items-center gap-3">
            <Move3d className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-xs font-bold text-white block">Motor 3D Deck.gl</span>
              <span className="text-[10px] text-slate-400">Procesamiento directo en GPU</span>
            </div>
          </div>

          <button
            onClick={() => {
              const next = !webglEnabled;
              onToggleWebgl(next);
              if (next) onTiltCamera(60); // Auto-tilt to 60 deg to reveal 3D depth
            }}
            className={clsx(
              "w-12 h-6 rounded-full p-1 transition-colors relative flex items-center",
              webglEnabled ? "bg-indigo-600 justify-end" : "bg-slate-800 justify-start"
            )}
          >
            <motion.div
              layout
              className="w-4 h-4 rounded-full bg-white shadow-md"
            />
          </button>
        </div>

        {webglEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            {/* Camera Tilt Quick Presets */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-400" /> Inclinación de Cámara 3D (Pitch)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onTiltCamera(0)}
                  className="py-1.5 bg-slate-950 hover:bg-slate-800 text-xs font-semibold rounded-xl border border-slate-800 text-slate-300 transition-all"
                >
                  Plano (0°)
                </button>
                <button
                  onClick={() => onTiltCamera(45)}
                  className="py-1.5 bg-indigo-900/30 hover:bg-indigo-900/50 text-xs font-semibold rounded-xl border border-indigo-500/40 text-indigo-200 transition-all"
                >
                  3D Medio (45°)
                </button>
                <button
                  onClick={() => onTiltCamera(65)}
                  className="py-1.5 bg-purple-900/40 hover:bg-purple-900/60 text-xs font-semibold rounded-xl border border-purple-500/50 text-purple-200 transition-all font-bold"
                >
                  3D Máximo (65°)
                </button>
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Capas WebGL Activas
              </label>

              {/* Column Layer Toggle */}
              <button
                onClick={() => onUpdateSettings({ ...settings, showColumns: !settings.showColumns })}
                className={clsx(
                  "w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between",
                  settings.showColumns
                    ? "bg-indigo-950/40 border-indigo-500/60 text-white"
                    : "bg-slate-950/50 border-slate-800 text-slate-400"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 bg-emerald-400 rounded-sm shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <div>
                    <span className="text-xs font-bold block">Columnas 3D de Contaminación / AQI</span>
                    <span className="text-[10px] text-slate-400">Extrusión en metros según índice IoT</span>
                  </div>
                </div>
                {settings.showColumns && <Check className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Arc Layer Toggle */}
              <button
                onClick={() => onUpdateSettings({ ...settings, showArcs: !settings.showArcs })}
                className={clsx(
                  "w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between",
                  settings.showArcs
                    ? "bg-indigo-950/40 border-indigo-500/60 text-white"
                    : "bg-slate-950/50 border-slate-800 text-slate-400"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <div>
                    <span className="text-xs font-bold block">Arcos 3D de Flujo Digital / Tránsito</span>
                    <span className="text-[10px] text-slate-400">Curvas voladoras entre nodos urbanos</span>
                  </div>
                </div>
                {settings.showArcs && <Check className="w-4 h-4 text-indigo-400" />}
              </button>

              {/* Hexagon Layer Toggle */}
              <button
                onClick={() => onUpdateSettings({ ...settings, showHexagons: !settings.showHexagons })}
                className={clsx(
                  "w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between",
                  settings.showHexagons
                    ? "bg-indigo-950/40 border-indigo-500/60 text-white"
                    : "bg-slate-950/50 border-slate-800 text-slate-400"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 bg-amber-400 rounded-sm shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <div>
                    <span className="text-xs font-bold block">Mapa de Calor Hexagonal 3D</span>
                    <span className="text-[10px] text-slate-400">Agregación volumétrica de densidad</span>
                  </div>
                </div>
                {settings.showHexagons && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            </div>

            {/* Scale Controls */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Escala de Altura (Columnas):</span>
                  <span className="font-mono text-indigo-400 font-bold">{settings.columnHeightScale}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={settings.columnHeightScale}
                  onChange={(e) => onUpdateSettings({ ...settings, columnHeightScale: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Grosor de Arcos 3D:</span>
                  <span className="font-mono text-indigo-400 font-bold">{settings.arcWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={settings.arcWidth}
                  onChange={(e) => onUpdateSettings({ ...settings, arcWidth: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
