import React, { useState, useEffect } from 'react';
import { 
  X, Wind, Activity, Zap, TrendingUp, RefreshCw, BarChart2, ShieldAlert,
  Maximize2, Minimize2, CheckCircle2, ChevronRight, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  LineChart, Line, BarChart, Bar, CartesianGrid, Legend 
} from 'recharts';
import clsx from 'clsx';

interface SmartAnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'partner';
  partnerFilter?: 'traffic' | 'environment';
}

// Initial 24h Mock Data for AQI & Traffic
const generateInitialAnalytics = () => [
  { time: '00:00', aqi: 22, pm25: 12, traffic: 95, vehicles: 120, energyKwh: 40 },
  { time: '03:00', aqi: 18, pm25: 9, traffic: 98, vehicles: 60, energyKwh: 30 },
  { time: '06:00', aqi: 28, pm25: 15, traffic: 82, vehicles: 450, energyKwh: 120 },
  { time: '09:00', aqi: 42, pm25: 24, traffic: 68, vehicles: 1100, energyKwh: 380 },
  { time: '12:00', aqi: 36, pm25: 20, traffic: 75, vehicles: 920, energyKwh: 540 },
  { time: '15:00', aqi: 34, pm25: 18, traffic: 72, vehicles: 880, energyKwh: 610 },
  { time: '18:00', aqi: 48, pm25: 28, traffic: 62, vehicles: 1250, energyKwh: 420 },
  { time: '21:00', aqi: 31, pm25: 16, traffic: 88, vehicles: 390, energyKwh: 180 },
];

export const SmartAnalyticsPanel: React.FC<SmartAnalyticsPanelProps> = ({ isOpen, onClose, userRole = 'admin', partnerFilter = 'traffic' }) => {
  const [data, setData] = useState(generateInitialAnalytics());
  const [activeTab, setActiveTab] = useState<'aqi' | 'traffic' | 'energy'>('aqi');
  
  // Set default tab based on role
  useEffect(() => {
    if (userRole === 'partner') {
      if (partnerFilter === 'traffic') setActiveTab('traffic');
      if (partnerFilter === 'environment') setActiveTab('aqi');
    } else {
      setActiveTab('aqi');
    }
  }, [userRole, partnerFilter]);

  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Live simulation tick to mimic real-time sensor streams
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setData((prevData) => {
        const last = prevData[prevData.length - 1];
        const nextAqi = Math.max(15, Math.min(80, last.aqi + Math.floor(Math.random() * 7) - 3));
        const nextTraffic = Math.max(50, Math.min(99, last.traffic + Math.floor(Math.random() * 9) - 4));
        const nextEnergy = Math.max(50, Math.min(700, last.energyKwh + Math.floor(Math.random() * 30) - 15));

        const updated = [...prevData.slice(1)];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        updated.push({
          time: timeStr,
          aqi: nextAqi,
          pm25: Math.round(nextAqi * 0.55),
          traffic: nextTraffic,
          vehicles: Math.round(1500 - nextTraffic * 12),
          energyKwh: nextEnergy,
        });

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  if (!isOpen) return null;

  const currentPoint = data[data.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={clsx(
        "fixed z-40 bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/40 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col transition-all duration-300",
        isMinimized
          ? "bottom-12 right-6 w-80 h-16 cursor-pointer"
          : "bottom-12 right-4 sm:right-6 w-[94vw] sm:w-[540px] md:w-[620px] max-h-[85vh] h-[520px]"
      )}
    >
      {/* Header Bar */}
      <div 
        className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0 select-none cursor-pointer"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Telemetría Smart City Los Mochis</h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              IoT Stream: {isLiveSimulating ? 'Sincronizado en Vivo' : 'Pausado'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsLiveSimulating(!isLiveSimulating)}
            className={clsx(
              "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border",
              isLiveSimulating
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            )}
            title="Pausar / Reanudar flujo en vivo"
          >
            <RefreshCw className={clsx("w-3 h-3", isLiveSimulating && "animate-spin")} style={{ animationDuration: '4s' }} />
            {isLiveSimulating ? 'LIVE' : 'PAUSED'}
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 flex-1 flex flex-col overflow-y-auto space-y-4">
          {/* Top Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveTab('aqi')}
                className={clsx(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  activeTab === 'aqi'
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Wind className="w-3.5 h-3.5" /> Aire (AQI)
              </button>

              <button
                onClick={() => setActiveTab('traffic')}
                className={clsx(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  activeTab === 'traffic'
                    ? "bg-amber-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Activity className="w-3.5 h-3.5" /> Tráfico
              </button>

              <button
                onClick={() => setActiveTab('energy')}
                className={clsx(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                  activeTab === 'energy'
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Zap className="w-3.5 h-3.5" /> Energía
              </button>
            </div>

            {/* Time Range Selector */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold">
              <button
                onClick={() => setTimeRange('24h')}
                className={clsx(
                  "px-2.5 py-1 rounded-lg transition-colors",
                  timeRange === '24h' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                24 Horas
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={clsx(
                  "px-2.5 py-1 rounded-lg transition-colors",
                  timeRange === '7d' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                7 Días
              </button>
            </div>
          </div>

          {/* Quick Metrics Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Calidad de Aire</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-emerald-400">{currentPoint.aqi}</span>
                <span className="text-[10px] text-emerald-300/80 font-bold">AQI</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                PM2.5: {currentPoint.pm25} µg/m³
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Fluidez Vial</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-amber-400">{currentPoint.traffic}%</span>
                <span className="text-[10px] text-amber-300/80 font-bold">Normal</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                ~{currentPoint.vehicles} veh/min
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Generación Solar</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-indigo-400">{currentPoint.energyKwh}</span>
                <span className="text-[10px] text-indigo-300/80 font-bold">kWh</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                42 Nodos limpios
              </p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 flex-1 min-h-[220px] flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={210}>
              {activeTab === 'aqi' ? (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="pm25Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="aqi" name="Índice AQI Global" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#aqiGrad)" />
                  <Area type="monotone" dataKey="pm25" name="Partículas PM2.5" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#pm25Grad)" />
                </AreaChart>
              ) : activeTab === 'traffic' ? (
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="traffic" name="Fluidez Vehicular (%)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : (
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="energyKwh" name="Generación Solar (kWh)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sensores LoRaWAN Verificados por IMPLAN Ahome
            </span>
            <span className="font-mono text-indigo-400 font-bold">100% Online</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
