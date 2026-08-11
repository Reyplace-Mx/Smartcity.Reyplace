import React, { useState, useEffect } from 'react';
import { 
  Globe, X, Camera, MapPin, Compass, Navigation, Store, Layers, 
  Radio, Sparkles, Sun, Flame, Eye, RefreshCw, Cpu, Activity, ShieldCheck, Download
} from 'lucide-react';
import clsx from 'clsx';

interface ExternalMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat?: number;
  lng?: number;
  placeName?: string;
  onApplySatelliteLayerTo3D?: (layerId: 'rgb' | 'ndvi' | 'thermal' | 'topography' | 'night') => void;
}

export interface SatelliteMode {
  id: 'rgb' | 'ndvi' | 'thermal' | 'topography' | 'night';
  name: string;
  satellite: string;
  spectrum: string;
  description: string;
  badge: string;
  color: string;
  mapTypeParam: string;
}

export const SATELLITE_MODES: SatelliteMode[] = [
  {
    id: 'rgb',
    name: 'Óptica / Satelital RGB HD',
    satellite: 'Sentinel-2A / Landsat 9',
    spectrum: 'Bandas B2, B3, B4 (Visibles)',
    description: 'Ortomosaico satelital fotorrealista de alta resolución de las avenidas Leyva, Rosales, Valdez y Cerro de la Memoria.',
    badge: 'Fotorrealista HD',
    color: 'from-sky-500 to-blue-600',
    mapTypeParam: 'k' // Satellite in Google Maps embed
  },
  {
    id: 'ndvi',
    name: 'Vegetación (Infrarrojo NDVI)',
    satellite: 'Sentinel-2B MSI',
    spectrum: 'Infrarrojo Cercano (NIR / Red Edge B8)',
    description: 'Resalta la biomasa verde del Jardín Botánico Benjamín Francis Johnston, agricultura del Valle del Fuerte y flora urbana.',
    badge: 'Análisis Vegetal',
    color: 'from-emerald-500 to-green-600',
    mapTypeParam: 'k'
  },
  {
    id: 'thermal',
    name: 'Mapa Térmico Infrarrojo',
    satellite: 'Landsat 9 TIRS-2',
    spectrum: 'Infrarrojo Térmico 10.6 µm',
    description: 'Análisis de la isla de calor urbana en asfalto de bulevares principales, techos de naves industriales y microclimas.',
    badge: 'Isla de Calor',
    color: 'from-amber-500 to-rose-600',
    mapTypeParam: 'k'
  },
  {
    id: 'topography',
    name: 'Radar Topográfico SAR',
    satellite: 'Copernicus Sentinel-1 SAR',
    spectrum: 'Banda C Radar C-SAR',
    description: 'Modelo digital de elevación (DEM) del relieve del Cerro de la Memoria, canales de riego y costa hacia Topolobampo.',
    badge: 'Relieve & Elevación',
    color: 'from-cyan-500 to-indigo-600',
    mapTypeParam: 'p' // Terrain in Google Maps embed
  },
  {
    id: 'night',
    name: 'Luces Nocturnas & Red Eléctrica',
    satellite: 'Suomi NPP VIIRS',
    spectrum: 'Banda Día/Noche DNB',
    description: 'Escaneo de densidad luminosa de alumbrado público, zonas comerciales y tráfico vehicular en bulevares nocturnos.',
    badge: 'Emisión Luminosa',
    color: 'from-purple-500 to-amber-500',
    mapTypeParam: 'k'
  }
];

export default function ExternalMapsModal({
  isOpen,
  onClose,
  lat = 25.7933,
  lng = -108.9959,
  placeName = 'Los Mochis, Sinaloa',
  onApplySatelliteLayerTo3D
}: ExternalMapsModalProps) {
  const [activeMode, setActiveMode] = useState<SatelliteMode>(SATELLITE_MODES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [satelliteTelemetry, setSatelliteTelemetry] = useState({
    altitudeKm: 786,
    orbitPass: 'Pase Orbital #14,892',
    cloudCover: '2.4%',
    spatialRes: '10m / px',
    sensorTemp: '-18.4 °C'
  });
  const [appliedTo3D, setAppliedTo3D] = useState(false);

  if (!isOpen) return null;

  const currentMode = activeMode;
  const encodedQuery = encodeURIComponent(placeName);

  // External URLs
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const gearthUrl = `https://earth.google.com/web/search/${lat},${lng}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodedQuery}&ll=${lat},${lng}`;
  const bingMapsUrl = `https://www.bing.com/maps?cp=${lat}~${lng}&lvl=16`;
  const gstreetViewUrl = `https://www.google.com/maps/@${lat},${lng},3a,75y,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192`;
  const gbusinessUrl = `https://business.google.com/search?q=${encodedQuery}`;

  const handleStartSatelliteScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setAppliedTo3D(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setScanProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setSatelliteTelemetry({
          altitudeKm: 786 + Math.floor(Math.random() * 5),
          orbitPass: `Pase Orbital #${14890 + Math.floor(Math.random() * 20)}`,
          cloudCover: `${(Math.random() * 3).toFixed(1)}%`,
          spatialRes: '10m / px',
          sensorTemp: `${(-18 - Math.random() * 2).toFixed(1)} °C`
        });
      }
    }, 150);
  };

  const handleApplyTo3D = () => {
    if (onApplySatelliteLayerTo3D) {
      onApplySatelliteLayerTo3D(activeMode.id);
      setAppliedTo3D(true);
      setTimeout(() => setAppliedTo3D(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[110] flex items-center justify-center p-3 sm:p-5 pointer-events-auto">
      <div className="bg-slate-900 border-2 border-sky-500/40 w-full max-w-5xl h-[92vh] rounded-3xl p-5 shadow-2xl relative flex flex-col justify-between overflow-hidden text-white animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 border border-sky-500/40 text-sky-400 rounded-2xl shadow-inner">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Escáner Satelital Multiespectral de Los Mochis
                </h3>
                <span className="text-[10px] font-mono font-extrabold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                  SINALOA, MÉXICO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Análisis de Espectros Satelitales, Cobertura Vegetal, Temperatura Térmica y Relieve Topográfico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartSatelliteScan}
              disabled={isScanning}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-sky-500/20 active:scale-95"
            >
              <RefreshCw className={clsx("w-3.5 h-3.5", isScanning && "animate-spin")} />
              {isScanning ? 'Escaneando Capas...' : 'Ejecutar Escaneo Satelital'}
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              title="Cerrar Visor Satelital"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Satellite Spectrum Mode Selector Pills */}
        <div className="py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none border-b border-slate-800">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5 text-sky-400" /> Capa Satelital:
          </span>
          {SATELLITE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode);
                handleStartSatelliteScan();
              }}
              className={clsx(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border",
                activeMode.id === mode.id
                  ? "bg-slate-800 text-white border-sky-400 shadow-md shadow-sky-500/20"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              )}
            >
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${mode.color}`} />
              <span>{mode.name}</span>
            </button>
          ))}
        </div>

        {/* Satellite Scanning Status & Telemetry Bar */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 my-2 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sky-300 font-bold">
              <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>Satélite: {currentMode.satellite}</span>
            </div>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:inline">{currentMode.spectrum}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Alt: <strong className="text-emerald-400">{satelliteTelemetry.altitudeKm} km</strong></span>
            <span>Res: <strong className="text-amber-400">{satelliteTelemetry.spatialRes}</strong></span>
            <span>Nubes: <strong className="text-sky-400">{satelliteTelemetry.cloudCover}</strong></span>
            <span className="hidden sm:inline">Pase: <strong className="text-slate-200">{satelliteTelemetry.orbitPass}</strong></span>
          </div>
        </div>

        {/* Interactive Map Embed Container with Scan Laser Overlay */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative shadow-inner group">
          
          {/* Animated Scanning Laser Effect when Scanning */}
          {isScanning && (
            <div className="absolute inset-0 z-30 pointer-events-none bg-sky-950/40 backdrop-blur-[2px] flex flex-col justify-between p-6">
              <div className="w-full h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 shadow-lg shadow-sky-400 animate-pulse" />
              <div className="bg-slate-950/90 border border-sky-500/40 p-4 rounded-2xl max-w-xs mx-auto text-center space-y-2">
                <Activity className="w-6 h-6 text-sky-400 animate-spin mx-auto" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Procesando Espectro {currentMode.name}
                </h4>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-400 transition-all duration-200"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-sky-300 font-bold block">
                  Capturando datos multiespectrales {scanProgress}%
                </span>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 shadow-lg shadow-sky-400 animate-pulse" />
            </div>
          )}

          {/* Special Visual Filters for Spectral Modes */}
          <div className={clsx(
            "absolute inset-0 pointer-events-none z-10 transition-all duration-500 mix-blend-overlay",
            activeMode.id === 'ndvi' && "bg-emerald-600/30",
            activeMode.id === 'thermal' && "bg-gradient-to-tr from-amber-600/30 via-rose-600/30 to-purple-600/30",
            activeMode.id === 'topography' && "bg-cyan-600/20 border-2 border-cyan-400/30",
            activeMode.id === 'night' && "bg-slate-950/50 mix-blend-color-burn"
          )} />

          <iframe
            title={`Satélite Los Mochis - ${currentMode.name}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=15&t=${currentMode.mapTypeParam}&output=embed`}
          />

          {/* Floating Badge Overlay */}
          <div className="absolute top-4 left-4 z-20 bg-slate-950/90 border border-slate-800 p-3 rounded-2xl backdrop-blur-md max-w-xs space-y-1">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${currentMode.color} text-white`}>
              {currentMode.badge}
            </span>
            <p className="text-xs text-slate-200 leading-snug pt-1 font-medium">
              {currentMode.description}
            </p>
          </div>

          {/* Floating Action to Apply to 3D Twin */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={handleApplyTo3D}
              className={clsx(
                "px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-xl border backdrop-blur-md",
                appliedTo3D
                  ? "bg-emerald-500 text-slate-950 border-emerald-400"
                  : "bg-slate-950/90 hover:bg-slate-900 text-sky-300 border-sky-500/40 hover:scale-105"
              )}
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              {appliedTo3D ? '¡Capa Sincronizada con Maqueta 3D!' : 'Aplicar Capa a Maqueta 3D'}
            </button>
          </div>
        </div>

        {/* External Platform Launchers */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Coordenadas: {lat.toFixed(4)}° N, {lng.toFixed(4)}° W ({placeName})</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={gstreetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition text-[11px] shadow-md shadow-blue-600/30"
            >
              <Camera className="w-3.5 h-3.5" /> Google Street View
            </a>
            <a
              href={gearthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition text-[11px] shadow-md shadow-emerald-600/30"
            >
              <Globe className="w-3.5 h-3.5" /> Google Earth 3D
            </a>
            <a
              href={gbusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg flex items-center gap-1.5 transition text-[11px] border border-slate-700"
            >
              <Store className="w-3.5 h-3.5" /> Google Business
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg flex items-center gap-1.5 transition text-[11px] border border-slate-700"
            >
              <Compass className="w-3.5 h-3.5 text-slate-400" /> Apple Maps
            </a>
            <a
              href={bingMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-lg flex items-center gap-1.5 transition text-[11px] border border-slate-700"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Bing Maps
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
