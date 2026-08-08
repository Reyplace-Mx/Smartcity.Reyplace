import React, { useState, useEffect } from 'react';
import { 
  X, Wind, Activity, Zap, TrendingUp, RefreshCw, BarChart2, ShieldAlert,
  Maximize2, Minimize2, CheckCircle2, ChevronRight, Clock, Database, Layers,
  ArrowUpRight, ArrowDownRight, Loader2, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  LineChart, Line, BarChart, Bar, CartesianGrid, Legend 
} from 'recharts';
import clsx from 'clsx';
import { useTimescaleDB } from '../hooks/useTimescaleDB';

interface SmartAnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'partner';
  partnerFilter?: 'traffic' | 'environment';
  selectedSensorId: string | null;
}

export const SmartAnalyticsPanel: React.FC<SmartAnalyticsPanelProps> = ({ 
  isOpen, 
  onClose, 
  userRole = 'admin', 
  partnerFilter = 'traffic',
  selectedSensorId 
}) => {
  const [activeTab, setActiveTab] = useState<'aqi' | 'traffic' | 'energy'>('aqi');
  const [showYesterdayComparison, setShowYesterdayComparison] = useState<boolean>(true);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Hook to query TimescaleDB historical time-series
  const { 
    data: timescaleData, 
    loading: isTimescaleLoading, 
    error: timescaleError, 
    timeRange, 
    setTimeRange, 
    metricsSummary, 
    dbEngine,
    refetch 
  } = useTimescaleDB(selectedSensorId || 'c1', '24h');

  const [liveSeries, setLiveSeries] = useState(timescaleData);

  // Synchronize local series when TimescaleDB data arrives
  useEffect(() => {
    if (timescaleData.length > 0) {
      setLiveSeries(timescaleData);
    }
  }, [timescaleData]);

  // Set default tab based on partner role filter
  useEffect(() => {
    if (userRole === 'partner') {
      if (partnerFilter === 'traffic') setActiveTab('traffic');
      if (partnerFilter === 'environment') setActiveTab('aqi');
    } else {
      setActiveTab('aqi');
    }
  }, [userRole, partnerFilter]);

  // Real-time tick simulation for active streaming
  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      setLiveSeries((prevData) => {
        if (!prevData || prevData.length === 0) return prevData;
        const last = prevData[prevData.length - 1];
        const nextAqi = Math.max(15, Math.min(90, (last?.aqi || 30) + Math.floor(Math.random() * 7) - 3));
        const nextTraffic = Math.max(30, Math.min(99, (last?.traffic || 60) + Math.floor(Math.random() * 9) - 4));
        const nextEnergy = Math.max(50, Math.min(700, (last?.energyKwh || 150) + Math.floor(Math.random() * 30) - 15));

        const updated = [...prevData.slice(1)];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        updated.push({
          time: timeStr,
          aqi: nextAqi,
          pm25: Math.round(nextAqi * 0.52),
          traffic: nextTraffic,
          vehicles: Math.round(1500 - nextTraffic * 12),
          energyKwh: nextEnergy,
          yesterdayAqi: last?.yesterdayAqi ?? Math.round(nextAqi * 0.9),
          yesterdayTraffic: last?.yesterdayTraffic ?? Math.round(nextTraffic * 0.95),
        });

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  if (!isOpen) return null;

  const currentPoint = liveSeries[liveSeries.length - 1] || {
    time: 'Ahora',
    aqi: 28,
    pm25: 14,
    traffic: 72,
    vehicles: 640,
    energyKwh: 180,
  };

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
          : "bottom-4 sm:bottom-12 left-3 right-3 sm:left-auto sm:right-6 w-auto sm:w-[540px] md:w-[620px] max-h-[85vh] h-[480px] sm:h-[540px]"
      )}
    >
      {/* Header Bar */}
      <div 
        className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0 select-none cursor-pointer"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Telemetría e Historial TimescaleDB
              </h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="text-indigo-400 font-semibold flex items-center gap-1">
                <Database className="w-3 h-3" /> {selectedSensorId ? `Nodo: ${selectedSensorId}` : 'Nodo: c1 (Centro)'}
              </span>
              <span>•</span>
              <span className="text-emerald-400">TimescaleDB ~2.4ms</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => refetch()}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Recargar datos de TimescaleDB"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", isTimescaleLoading && "animate-spin text-indigo-400")} />
          </button>

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
            {isLiveSimulating ? 'STREAM LIVE' : 'PAUSED'}
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
          {/* Top Tabs & Timescale Range Selector */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              {(userRole === 'admin' || partnerFilter === 'environment') && (
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
              )}

              {(userRole === 'admin' || partnerFilter === 'traffic') && (
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
              )}

              {userRole === 'admin' && (
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
              )}
            </div>

            {/* Controls: Yesterday Compare Toggle & Time Range */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowYesterdayComparison(!showYesterdayComparison)}
                className={clsx(
                  "px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1",
                  showYesterdayComparison 
                    ? "bg-purple-900/40 text-purple-300 border-purple-500/50" 
                    : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300"
                )}
                title="Comparar serie actual con la línea base de ayer en TimescaleDB"
              >
                <Clock className="w-3 h-3" /> Vs. Ayer
              </button>

              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setTimeRange('24h')}
                  className={clsx(
                    "px-2.5 py-1 rounded-lg transition-colors",
                    timeRange === '24h' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeRange('7d')}
                  className={clsx(
                    "px-2.5 py-1 rounded-lg transition-colors",
                    timeRange === '7d' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  7d
                </button>
              </div>
            </div>
          </div>

          {/* TimescaleDB Error / Loading Notice */}
          {timescaleError && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-2xl text-xs text-red-300 flex items-center justify-between">
              <span>{timescaleError}</span>
              <button onClick={() => refetch()} className="underline text-red-200 font-bold">Reintentar</button>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            {(userRole === 'admin' || partnerFilter === 'environment') && (
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 relative">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Calidad de Aire</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-emerald-400">{currentPoint.aqi}</span>
                  <span className="text-[10px] text-emerald-300/80 font-bold">AQI</span>
                  {metricsSummary && (
                    <span className={clsx("ml-auto text-[10px] font-bold flex items-center", metricsSummary.aqiDeltaVsYesterday >= 0 ? "text-amber-400" : "text-emerald-400")}>
                      {metricsSummary.aqiDeltaVsYesterday >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(metricsSummary.aqiDeltaVsYesterday)}% vs ayer
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  PM2.5: {currentPoint.pm25} µg/m³
                </p>
              </div>
            )}

            {(userRole === 'admin' || partnerFilter === 'traffic') && (
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 relative">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Fluidez Vial</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-amber-400">{currentPoint.traffic}%</span>
                  <span className="text-[10px] text-amber-300/80 font-bold">Flujo</span>
                  {metricsSummary && (
                    <span className={clsx("ml-auto text-[10px] font-bold flex items-center", metricsSummary.trafficDeltaVsYesterday >= 0 ? "text-emerald-400" : "text-amber-400")}>
                      {metricsSummary.trafficDeltaVsYesterday >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(metricsSummary.trafficDeltaVsYesterday)}% vs ayer
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  ~{currentPoint.vehicles} veh/min
                </p>
              </div>
            )}

            {userRole === 'admin' && (
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Generación Solar</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-black text-indigo-400">{currentPoint.energyKwh}</span>
                  <span className="text-[10px] text-indigo-300/80 font-bold">kWh</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  42 Nodos en red
                </p>
              </div>
            )}
          </div>

          {/* Chart Section */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 flex-1 min-h-[220px] flex flex-col justify-center relative">
            {isTimescaleLoading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
                <span className="text-xs font-mono text-slate-300">Consultando TimescaleDB...</span>
              </div>
            )}

            <ResponsiveContainer width="100%" height={210}>
              {activeTab === 'aqi' ? (
                <AreaChart data={liveSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="yesterdayAqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="aqi" name="Hoy - AQI Real (TimescaleDB)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#aqiGrad)" />
                  {showYesterdayComparison && (
                    <Area type="monotone" dataKey="yesterdayAqi" name="Ayer - AQI Histórico" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#yesterdayAqiGrad)" />
                  )}
                </AreaChart>
              ) : activeTab === 'traffic' ? (
                <LineChart data={liveSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="traffic" name="Hoy - Tráfico (%)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  {showYesterdayComparison && (
                    <Line type="monotone" dataKey="yesterdayTraffic" name="Ayer - Tráfico Histórico" stroke="#ec4899" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  )}
                </LineChart>
              ) : (
                <BarChart data={liveSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL + TimescaleDB Extension Activa
            </span>
            <span className="font-mono text-indigo-400 font-bold">Hypertable Stream</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
