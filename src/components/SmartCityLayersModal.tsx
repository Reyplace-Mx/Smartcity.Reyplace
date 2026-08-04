import React from 'react';
import { X, Wifi, Wind, Zap, Radio, ShieldCheck, Activity, Cpu, Lightbulb, Car } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_SENSORS, SmartSensor } from '../data';

interface SmartCityLayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayers: string[];
  onToggleLayer: (layerId: string) => void;
}

export const SmartCityLayersModal: React.FC<SmartCityLayersModalProps> = ({
  isOpen,
  onClose,
  activeLayers,
  onToggleLayer,
}) => {
  if (!isOpen) return null;

  const layers = [
    { id: 'wifi', name: 'Wi-Fi Público 1Gbps', icon: Wifi, color: 'text-sky-400', desc: '42 Puntos de conexión libre en espacios públicos' },
    { id: 'aqi', name: 'Calidad del Aire (AQI)', icon: Wind, color: 'text-emerald-400', desc: 'Monitoreo ambiental continuo y partículas PM2.5' },
    { id: 'traffic', name: 'Semáforos e IoT Tráfico', icon: Activity, color: 'text-yellow-400', desc: 'Optimización adaptativa de flujo vehicular' },
    { id: 'energy', name: 'Generación Solar Urbana', icon: Zap, color: 'text-amber-400', desc: 'Paneles en edificios gubernamentales y escuelas' },
    { id: 'lighting', name: 'Alumbrado LED Telegestionado', icon: Lightbulb, color: 'text-indigo-400', desc: 'Control de intensidad adaptativo por movimiento' },
    { id: 'ev', name: 'Estaciones de Carga EV', icon: Car, color: 'text-teal-400', desc: 'Electrolineras municipales de carga rápida' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Capas de Infraestructura Smart City</h2>
              <p className="text-xs text-slate-400">Monitoreo en tiempo real de sensores e IoT urbano en Los Mochis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Layer toggles */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              Capas Activas en Mapa y Street View
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {layers.map((layer) => {
                const Icon = layer.icon;
                const isActive = activeLayers.includes(layer.id);
                return (
                  <button
                    key={layer.id}
                    onClick={() => onToggleLayer(layer.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      isActive
                        ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{layer.name}</span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">{layer.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensors Live Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
              Telemetría de Sensores IoT en Vivo
            </h3>
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60">
              {MOCK_SENSORS.map((sensor) => (
                <div key={sensor.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <p className="font-bold text-slate-200">{sensor.name}</p>
                      <p className="text-[10px] text-slate-400">{sensor.locationName}</p>
                    </div>
                  </div>
                  <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/50 font-bold">
                    {sensor.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Protocolo LoRaWAN & 5G Activos
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            Aceptar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
