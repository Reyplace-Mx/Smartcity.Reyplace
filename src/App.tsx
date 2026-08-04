/// <reference types="vite/client" />
import { useState, useRef, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { 
  Search, MapPin, Building2, Store, Stethoscope, ChevronRight, AlertTriangle, 
  MonitorSmartphone, X, Bell, Navigation, Settings2, CheckCircle2, HardDrive, 
  Sparkles, Layers, Play, Radio, Cpu, Wind, Activity, Wifi, ShieldCheck, Zap,
  MessageSquare, Move3d, Box, Bot
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PLACES, Place, PlaceType, CitizenReport, INITIAL_CITIZEN_REPORTS } from './data';
import { HOLOGRAPHIC_STYLE } from './MapStyle';
import { Directions } from './Directions';
import { AuthButton } from './components/AuthButton';
import { DriveFiles } from './components/DriveFiles';
import { GeminiAssistant } from './components/GeminiAssistant';
import { AutoTourBanner } from './components/AutoTourBanner';
import { SmartCityLayersModal } from './components/SmartCityLayersModal';
import { CitizenReportModal } from './components/CitizenReportModal';
import { SmartAnalyticsPanel } from './components/SmartAnalyticsPanel';
import { DeckGLOverlay, WebGL3DSettings } from './components/DeckGLOverlay';
import { WebGL3DControls } from './components/WebGL3DControls';

function MapController({ tilt }: { tilt: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setTilt(tilt);
    }
  }, [map, tilt]);
  return null;
}

// Los Mochis coordinates
const DEFAULT_CENTER = { lat: 25.7928, lng: -108.9902 };

// Mock Notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'event', title: '¡Nodo Wi-Fi Activado!', message: 'Se ha instalado conectividad libre 1Gbps en Plazuela 27 de Septiembre', time: 'Hace 5 min', read: false },
  { id: 2, type: 'promo', title: 'Nuevo Negocio Digitalizado', message: 'Café de la Ciudad ya cuenta con pago NFC y catálogo QR.', time: 'Hace 1 hora', read: false },
  { id: 3, type: 'alert', title: 'Reporte Atendido', message: 'Servicios Públicos de Ahome ha reparado la luminaria IoT en Degollado.', time: 'Hace 2 horas', read: true },
];

function getIconForType(type: PlaceType) {
  switch (type) {
    case 'plaza': return <MapPin className="w-5 h-5" />;
    case 'business': return <Store className="w-5 h-5" />;
    case 'office': return <Building2 className="w-5 h-5" />;
    case 'clinic': return <Stethoscope className="w-5 h-5" />;
    case 'culture': return <Sparkles className="w-5 h-5" />;
    default: return <MapPin className="w-5 h-5" />;
  }
}

export default function App() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'map' | 'streetview'>('map');
  const [sidebarTab, setSidebarTab] = useState<'directory' | 'routes' | 'drive' | 'asistente'>('asistente');
  const [originId, setOriginId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('user_gmaps_api_key') || '';
  });
  const apiKey = customApiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const isValidApiKey = Boolean(apiKey && apiKey.trim().length > 10 && (apiKey.startsWith('AIza') || apiKey.length > 20));
  const [apiKeyError, setApiKeyError] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyInputValue, setKeyInputValue] = useState(apiKey);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Auto Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [tourSpeedSec, setTourSpeedSec] = useState(8);
  const [tourAutoRotate, setTourAutoRotate] = useState(true);
  const [tourNarrate, setTourNarrate] = useState(true);

  // Smart City Modals State
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);
  const [activeLayers, setActiveLayers] = useState<string[]>(['wifi', 'aqi', 'traffic', 'lighting']);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);

  // WebGL 3D Deck.gl State
  const [webglEnabled, setWebglEnabled] = useState(true);
  const [isWebglControlsOpen, setIsWebglControlsOpen] = useState(false);
  const [mapTilt, setMapTilt] = useState(45);
  const [webglSettings, setWebglSettings] = useState<WebGL3DSettings>({
    showColumns: true,
    showArcs: true,
    showHexagons: true,
    columnHeightScale: 3,
    arcWidth: 3,
  });

  const featuredPlaces = MOCK_PLACES.filter(p => p.featured || p.digitalPresence);

  useEffect(() => {
    (window as any).gm_authFailure = () => {
      setApiKeyError(true);
    };
  }, []);

  const selectedPlace = MOCK_PLACES.find((p) => p.id === selectedPlaceId);
  const isAnalog = selectedPlace && !selectedPlace.digitalPresence;

  const originPlace = MOCK_PLACES.find(p => p.id === originId);
  const destinationPlace = MOCK_PLACES.find(p => p.id === destinationId);

  // Auto Tour Actions
  const handleStartTour = () => {
    setIsTourActive(true);
    setIsTourPlaying(true);
    setTourIndex(0);
    setMapMode('streetview');
    if (featuredPlaces.length > 0) {
      setSelectedPlaceId(featuredPlaces[0].id);
    }
  };

  const handleStopTour = () => {
    setIsTourActive(false);
    setIsTourPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleNextTourStop = () => {
    const nextIdx = (tourIndex + 1) % featuredPlaces.length;
    setTourIndex(nextIdx);
    setSelectedPlaceId(featuredPlaces[nextIdx].id);
  };

  const handlePrevTourStop = () => {
    const prevIdx = (tourIndex - 1 + featuredPlaces.length) % featuredPlaces.length;
    setTourIndex(prevIdx);
    setSelectedPlaceId(featuredPlaces[prevIdx].id);
  };

  // Citizen Report Handlers
  const handleAddCitizenReport = (newReportData: Omit<CitizenReport, 'id' | 'date' | 'upvotes'>) => {
    const newReport: CitizenReport = {
      ...newReportData,
      id: `r-${Date.now()}`,
      date: 'Justo ahora',
      upvotes: 1,
    };
    setCitizenReports([newReport, ...citizenReports]);
  };

  const handleUpvoteReport = (id: string) => {
    setCitizenReports(
      citizenReports.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredPlaces = MOCK_PLACES.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Header Navigation */}
      <nav className="h-16 px-4 lg:px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-sm tracking-tighter">
            LM
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Mochis <span className="text-indigo-400 font-semibold">Smart City</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                Hub 360°
              </span>
            </h1>
          </div>
        </div>

        {/* Center Quick Action Bar */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={handleStartTour}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 tracking-wide animate-pulse"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Modo Demostración
          </button>

          <button
            onClick={() => setIsWebglControlsOpen(!isWebglControlsOpen)}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border",
              isWebglControlsOpen || webglEnabled
                ? "bg-purple-950/60 text-purple-300 border-purple-500/50 shadow-md"
                : "text-slate-300 border-transparent hover:bg-slate-800"
            )}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> WebGL 3D
          </button>

          <button
            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5",
              isAnalyticsOpen ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40" : "text-slate-300 hover:text-white hover:bg-slate-800"
            )}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Panel Telemetría (Recharts)
          </button>

          <button
            onClick={() => setIsLayersOpen(true)}
            className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Capas IoT
          </button>

          <button
            onClick={() => setIsReportsOpen(true)}
            className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Reportes Ciudadanos
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex bg-slate-800/80 rounded-full px-3.5 py-1 text-xs border border-slate-700 items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Sector:</span>
            <span className="font-semibold text-slate-200">Centro Histórico & Valle</span>
          </div>

          <div className="flex gap-3 items-center">
            {/* Notifications Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-full transition-colors"
                title="Notificaciones Smart City"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-50">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <h3 className="font-bold text-sm text-slate-200">Notificaciones Urbanas</h3>
                    <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">Marcar leídas</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif.id} className={clsx("p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors", !notif.read && "bg-indigo-900/10")}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-indigo-400">{notif.title}</span>
                          <span className="text-[10px] text-slate-500">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <AuthButton onAuthChange={setAccessToken} />
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Left Sidebar: Search and List */}
        <motion.aside 
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shrink-0 shadow-2xl"
        >
          <div className="flex border-b border-slate-800 bg-slate-950/40">
            <button 
              onClick={() => setSidebarTab('directory')}
              className={clsx("flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors", sidebarTab === 'directory' ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-900/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50")}
            >
              Directorio
            </button>
            <button 
              onClick={() => setSidebarTab('routes')}
              className={clsx("flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors flex flex-col items-center justify-center gap-0.5", sidebarTab === 'routes' ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-900/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50")}
            >
              <Navigation className="w-3.5 h-3.5" /> Rutas
            </button>
            <button 
              onClick={() => setSidebarTab('drive')}
              className={clsx("flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors flex flex-col items-center justify-center gap-0.5", sidebarTab === 'drive' ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-900/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50")}
            >
              <HardDrive className="w-3.5 h-3.5" /> Drive
            </button>
            <button 
              onClick={() => setSidebarTab('asistente')}
              className={clsx("flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors flex flex-col items-center justify-center gap-0.5", sidebarTab === 'asistente' ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-900/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50")}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" /> Emmanai
            </button>
          </div>

          {sidebarTab === 'directory' ? (
            <>
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar lugares o sensores..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Modo Demostración Rápido:</span>
                  <button
                    onClick={handleStartTour}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" /> Iniciar Tour
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredPlaces.map((place) => {
                  const isSelected = selectedPlaceId === place.id;
                  const analog = !place.digitalPresence;
                  
                  return (
                    <button
                      key={place.id}
                      onClick={() => {
                        setSelectedPlaceId(place.id);
                        setMapMode('streetview');
                      }}
                      className={clsx(
                        "w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3",
                        isSelected
                          ? "bg-indigo-900/20 border-indigo-500 shadow-lg shadow-indigo-500/10"
                          : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700",
                        analog && !isSelected && "opacity-70"
                      )}
                    >
                      <div className={clsx(
                        "p-2.5 rounded-xl shrink-0 border",
                        isSelected ? "bg-indigo-600 text-white border-indigo-400" :
                        analog ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-indigo-950 text-indigo-400 border-indigo-800"
                      )}>
                        {getIconForType(place.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className={clsx(
                            "text-xs font-bold truncate",
                            isSelected ? "text-indigo-200" : (analog ? "text-slate-400" : "text-slate-200")
                          )}>
                            {place.name}
                          </h3>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate mt-0.5">
                          {place.category}
                        </p>
                        {place.smartFeature && (
                          <p className="text-[10px] text-indigo-300/80 truncate font-mono mt-0.5">
                            ⚡ {place.smartFeature}
                          </p>
                        )}
                      </div>
                      {analog ? (
                        <div className="w-2 h-2 rounded-full bg-slate-600 shrink-0" title="Analógico"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Verificado Digital"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : sidebarTab === 'routes' ? (
            <div className="flex-1 flex flex-col">
              <div className="p-5 border-b border-slate-800 bg-slate-900">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Planificador de Rutas Inteligente</h3>
                
                <div className="space-y-4 relative">
                  {/* Origin */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Origen</label>
                    <select 
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-indigo-500 outline-none"
                      value={originId || ''}
                      onChange={(e) => setOriginId(e.target.value)}
                    >
                      <option value="">Selecciona origen...</option>
                      {MOCK_PLACES.map(p => (
                        <option key={`orig-${p.id}`} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="absolute left-4 top-8 bottom-4 w-px bg-slate-700 -z-10"></div>

                  {/* Destination */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Destino</label>
                    <select 
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-indigo-500 outline-none"
                      value={destinationId || ''}
                      onChange={(e) => setDestinationId(e.target.value)}
                    >
                      <option value="">Selecciona destino...</option>
                      {MOCK_PLACES.map(p => (
                        <option key={`dest-${p.id}`} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  disabled={!originId || !destinationId}
                  onClick={() => setMapMode('map')}
                  className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                >
                  Calcular Ruta Smart
                </button>
              </div>

              {originId && destinationId && (
                <div className="p-5 flex-1 bg-slate-950/30">
                  <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">Ruta Optimizada</span>
                    </div>
                    <p className="text-xs text-indigo-300 leading-relaxed mb-4">
                      Sigue la ruta en el mapa. Puedes explorar las paradas clave en Street View 360°.
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedPlaceId(destinationId);
                        setMapMode('streetview');
                      }}
                      className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold rounded-lg transition-all"
                    >
                      VER DESTINO EN 360°
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : sidebarTab === 'drive' ? (
            <DriveFiles accessToken={accessToken} />
          ) : (
            <GeminiAssistant selectedPlace={selectedPlace} />
          )}
        </motion.aside>

        {/* Main Map Viewport */}
        <main className="flex-1 relative bg-slate-950 overflow-hidden">
          {/* Floating Banner when Auto Tour is Active */}
              <AnimatePresence>
                {isTourActive && (
                  <AutoTourBanner
                    places={featuredPlaces}
                    currentIndex={tourIndex}
                    isPlaying={isTourPlaying}
                    onPlayPause={() => setIsTourPlaying(!isTourPlaying)}
                    onStop={handleStopTour}
                    onNext={handleNextTourStop}
                    onPrev={handlePrevTourStop}
                    onSelectPlace={(idx) => {
                      setTourIndex(idx);
                      setSelectedPlaceId(featuredPlaces[idx].id);
                    }}
                    speedSec={tourSpeedSec}
                    onChangeSpeed={setTourSpeedSec}
                    autoRotate={tourAutoRotate}
                    onToggleRotate={() => setTourAutoRotate(!tourAutoRotate)}
                    narrate={tourNarrate}
                    onToggleNarrate={() => setTourNarrate(!tourNarrate)}
                  />
                )}
              </AnimatePresence>

              {/* Top Control Overlay */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                <div className="flex bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-1 border border-slate-700">
                  <button
                    onClick={() => setMapMode('map')}
                    className={clsx(
                      "px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all",
                      mapMode === 'map' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    )}
                  >
                    Mapa 2D
                  </button>
                  <button
                    onClick={() => setMapMode('streetview')}
                    disabled={!selectedPlaceId}
                    className={clsx(
                      "px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                      mapMode === 'streetview' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    )}
                  >
                    Street View 360°
                  </button>
                </div>

                {!isTourActive && (
                  <button
                    onClick={handleStartTour}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl shadow-xl border border-indigo-400/30 flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Recorrido Automático 360°
                  </button>
                )}

                <button
                  onClick={() => setIsWebglControlsOpen(!isWebglControlsOpen)}
                  className={clsx(
                    "px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-2xl border flex items-center gap-1.5 transition-all cursor-pointer",
                    webglEnabled ? "border-purple-500/70 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]" : "border-slate-700 text-slate-300"
                  )}
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-400" /> Deck.gl 3D WebGL
                </button>

                <button
                  onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                  className="px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Gráficos Recharts
                </button>

                <button
                  onClick={() => setIsLayersOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Capas Smart ({activeLayers.length})
                </button>

                <button
                  onClick={() => setIsReportsOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Reportes ({citizenReports.length})
                </button>

                <button
                  onClick={() => setIsKeyModalOpen(true)}
                  className={clsx(
                    "px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-xs font-bold rounded-2xl border flex items-center gap-1.5 transition-all cursor-pointer",
                    apiKey ? "border-emerald-500/50 text-emerald-300" : "border-amber-500/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse"
                  )}
                  title="Configurar Google Maps API Key"
                >
                  <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                  {apiKey ? "API Key Activa" : "Configurar API Key"}
                </button>
              </div>

              {/* Bottom Smart City KPI Metrics Bar */}
              <button
                onClick={() => setIsAnalyticsOpen(true)}
                title="Haz clic para abrir el panel flotante de Recharts"
                className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/80 hover:border-indigo-500/50 shadow-2xl text-xs font-medium text-slate-300 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <span>AQI: <strong className="text-emerald-300">34 (Excelente)</strong></span>
                </div>
                <div className="h-3 w-px bg-slate-700" />
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-sky-400" />
                  <span>Wi-Fi Libre: <strong className="text-sky-300">1 Gbps (42 Nodos)</strong></span>
                </div>
                <div className="h-3 w-px bg-slate-700" />
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  <span>Tráfico Smart: <strong className="text-yellow-300">88% Fluido</strong></span>
                </div>
                <div className="h-3 w-px bg-slate-700" />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Digitalización: <strong className="text-indigo-300">68% Verificado</strong></span>
                </div>
              </button>

              {/* Map and Street View Wrappers */}
              <AnimatePresence mode="wait">
                {mapMode === 'map' ? (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    {isValidApiKey && !apiKeyError ? (
                      <APIProvider apiKey={apiKey} onLoad={() => setApiKeyError(false)} onError={() => setApiKeyError(true)}>
                        <Map
                          defaultCenter={DEFAULT_CENTER}
                          defaultZoom={15}
                          mapId="DEMO_MAP_ID"
                          disableDefaultUI={true}
                          styles={HOLOGRAPHIC_STYLE}
                          className="w-full h-full"
                        >
                          <MapController tilt={mapTilt} />
                          <DeckGLOverlay enabled={webglEnabled && !apiKeyError} settings={webglSettings} />

                          {MOCK_PLACES.map((place) => (
                            <AdvancedMarker
                              key={place.id}
                              position={{ lat: place.lat, lng: place.lng }}
                              onClick={() => {
                                setSelectedPlaceId(place.id);
                                setMapMode('streetview');
                              }}
                            >
                              <Pin 
                                background={!place.digitalPresence ? '#475569' : '#6366f1'}
                                borderColor={!place.digitalPresence ? '#1e293b' : '#3730a3'}
                                glyphColor="#ffffff"
                              />
                            </AdvancedMarker>
                          ))}
                          
                          {originPlace && destinationPlace && sidebarTab === 'routes' && (
                            <Directions 
                              origin={{ lat: originPlace.lat, lng: originPlace.lng }} 
                              destination={{ lat: destinationPlace.lat, lng: destinationPlace.lng }} 
                            />
                          )}
                        </Map>
                      </APIProvider>
                    ) : (
                      <InteractiveHolographicMap
                        places={MOCK_PLACES}
                        selectedPlaceId={selectedPlaceId}
                        onSelectPlace={(id) => setSelectedPlaceId(id)}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="streetview"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className={clsx(
                      "absolute inset-0 bg-slate-950",
                      isAnalog && "grayscale contrast-125 brightness-90 sepia-[.1]"
                    )}
                  >
                    {selectedPlace && (
                      <StreetViewWrapper 
                        lat={selectedPlace.lat} 
                        lng={selectedPlace.lng}
                        heading={selectedPlace.heading}
                        pitch={selectedPlace.pitch}
                        autoRotate={isTourActive && tourAutoRotate}
                        placeName={selectedPlace.name}
                      />
                    )}
                    {isAnalog && (
                      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] z-20" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
        </main>

        {/* Right Inspector Panel */}
        <AnimatePresence mode="wait">
          <motion.aside 
            key={selectedPlace ? 'place' : 'empty'}
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 bg-slate-950 p-6 flex flex-col gap-6 z-10 shrink-0 overflow-y-auto border-l border-slate-800"
          >
            {!selectedPlace ? (
              <>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                    Estado de Digitalización Urbana
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-indigo-500/30">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-indigo-400">68%</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight font-bold">Presencia Digital Activa</span>
                      </div>
                      <div className="w-10 h-10 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin" style={{ animationDuration: '10s' }}></div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-400">32%</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight font-bold">En Brecha / Por Transformar</span>
                      </div>
                      <div className="w-10 h-10 rounded-full border-4 border-slate-600 border-t-transparent"></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 rounded-2xl border border-indigo-500/30">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Recorrido Automático 360°
                  </h3>
                  <p className="text-xs text-indigo-200/80 mb-3 leading-relaxed">
                    Recorre secuencialmente todos los hitos y negocios destacados en Street View con narración inteligente.
                  </p>
                  <button 
                    onClick={handleStartTour}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Iniciar Demo
                  </button>
                </div>

                <div className="flex-1">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Simbología Smart City</h2>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                      <span className="text-slate-300">Negocio / Espacio Digitalizado</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                      <span className="text-slate-400 italic">En Blanco y Negro (Brecha Digital)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                      <span className="text-slate-300">Nodo Wi-Fi / Sensor Activo</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {isAnalog ? (
                  <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded">
                        ALERTA: BRECHA DIGITAL
                      </span>
                      <button onClick={() => setSelectedPlaceId(null)} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 leading-tight mb-2">{selectedPlace.name}</h3>
                    <p className="text-slate-400 text-xs mb-4">{selectedPlace.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Google Maps: Ficha Incompleta
                      </div>
                      <div className="flex items-center gap-2 text-xs text-amber-400">
                        <MonitorSmartphone className="w-4 h-4" />
                        Presencia Web & QR: No detectado
                      </div>
                    </div>

                    <button className="w-full py-3 bg-white text-slate-950 text-xs font-bold rounded-xl hover:bg-indigo-400 transition-all uppercase tracking-wider shadow-lg shadow-white/10">
                      Activar Transición Digital
                    </button>
                  </div>
                ) : (
                  <div className="bg-indigo-900/20 rounded-2xl p-5 border border-indigo-500/30 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/30">
                        VERIFICADO SMART CITY
                      </span>
                      <button onClick={() => setSelectedPlaceId(null)} className="text-indigo-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-2">{selectedPlace.name}</h3>
                    <p className="text-indigo-200/70 text-xs mb-4">{selectedPlace.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-xs text-indigo-300">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        Google Maps: Optimizado 100%
                      </div>
                      <div className="flex items-center gap-2 text-xs text-indigo-300">
                        <MonitorSmartphone className="w-4 h-4 text-indigo-400" />
                        Presencia Web & QR: Activos
                      </div>
                      {selectedPlace.smartFeature && (
                        <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          {selectedPlace.smartFeature}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-auto">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Nodos Cercanos</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900 h-16 rounded-xl border border-slate-800 p-2 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] text-slate-500">Parque</span>
                      <span className="text-[11px] font-medium text-slate-300">Sinaloa</span>
                    </div>
                    <div className="bg-slate-900 h-16 rounded-xl border border-slate-800 p-2 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] text-slate-500">Cerro de la</span>
                      <span className="text-[11px] font-medium text-slate-300">Memoria</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </AnimatePresence>
      </div>

      {/* Smart City Modals */}
      <SmartCityLayersModal
        isOpen={isLayersOpen}
        onClose={() => setIsLayersOpen(false)}
        activeLayers={activeLayers}
        onToggleLayer={(id) => {
          setActiveLayers(
            activeLayers.includes(id)
              ? activeLayers.filter((l) => l !== id)
              : [...activeLayers, id]
          );
        }}
      />

      <CitizenReportModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        reports={citizenReports}
        onSubmitReport={handleAddCitizenReport}
        onUpvote={handleUpvoteReport}
      />

      <SmartAnalyticsPanel
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <WebGL3DControls
        isOpen={isWebglControlsOpen}
        onClose={() => setIsWebglControlsOpen(false)}
        webglEnabled={webglEnabled}
        onToggleWebgl={setWebglEnabled}
        settings={webglSettings}
        onUpdateSettings={setWebglSettings}
        onTiltCamera={setMapTilt}
      />

      {/* API Key Configuration Modal */}
      <AnimatePresence>
        {isKeyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-slate-100"
            >
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Google Maps API Key</h3>
                  <p className="text-xs text-slate-400">VITE_GOOGLE_MAPS_API_KEY</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Pega tu clave de API de Google Maps para habilitar la vista completa sin marcas de agua de desarrollo. También puedes guardarla en tus secretos de la aplicación o en el archivo .env.
              </p>

              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  value={keyInputValue}
                  onChange={(e) => setKeyInputValue(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      localStorage.setItem('user_gmaps_api_key', keyInputValue.trim());
                      setCustomApiKey(keyInputValue.trim());
                      setIsKeyModalOpen(false);
                      setApiKeyError(false);
                    }}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg"
                  >
                    Guardar y Aplicar
                  </button>

                  {customApiKey && (
                    <button
                      onClick={() => {
                        localStorage.removeItem('user_gmaps_api_key');
                        setCustomApiKey('');
                        setKeyInputValue('');
                        setIsKeyModalOpen(false);
                      }}
                      className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 transition-colors"
                    >
                      Borrar
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-normal">
                💡 <strong>Modo Interactivo Habilitado:</strong> Puedes explorar el mapa 2D, capas WebGL 3D, Street View 360°, asistentes y reportes sin bloqueos.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Status */}
      <footer className="h-8 px-6 bg-indigo-600 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-100 z-20 shrink-0">
        <div className="flex gap-4 md:gap-6">
          <span className="hidden sm:inline">Status: Plataforma Urbana Los Mochis Smart City</span>
          <span className="sm:hidden">Smart City Hub</span>
          <span>Región: Noroeste MX</span>
        </div>
        <div className="flex gap-3 md:gap-4 items-center">
          <span className="opacity-80 italic hidden md:inline">Socio Digital: Ayuntamiento de Ahome</span>
          <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]"></div>
        </div>
      </footer>
    </div>
  );
}

function InteractiveHolographicMap({
  places,
  selectedPlaceId,
  onSelectPlace,
}: {
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (id: string) => void;
}) {
  return (
    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      {/* Background grid scanlines */}
      <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

      {/* Radar Circles */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-indigo-500/20 animate-[spin_25s_linear_infinite]" />
      <div className="absolute w-[400px] h-[400px] rounded-full border border-indigo-500/30" />
      <div className="absolute w-[200px] h-[200px] rounded-full border border-indigo-500/40" />

      {/* Vector Street Lines */}
      <svg className="absolute inset-0 w-full h-full stroke-indigo-500/25 stroke-[1.5] fill-none pointer-events-none">
        <path d="M 100 200 L 1100 200 M 100 400 L 1100 400 M 100 600 L 1100 600" strokeDasharray="4 4" />
        <path d="M 250 50 L 250 850 M 500 50 L 500 850 M 750 50 L 750 850" strokeDasharray="4 4" />
        <path d="M 200 100 Q 500 400 850 700" className="stroke-indigo-400/40 stroke-2" />
      </svg>

      {/* Interactive Map Nodes (Places) */}
      <div className="relative w-full max-w-4xl h-[550px]">
        {places.map((place) => {
          const minLat = 25.765;
          const maxLat = 25.815;
          const minLng = -109.005;
          const maxLng = -108.970;

          const topPercent = 100 - ((place.lat - minLat) / (maxLat - minLat)) * 100;
          const leftPercent = ((place.lng - minLng) / (maxLng - minLng)) * 100;

          const isSelected = place.id === selectedPlaceId;

          return (
            <button
              key={place.id}
              onClick={() => onSelectPlace(place.id)}
              style={{
                top: `${Math.max(10, Math.min(88, topPercent))}%`,
                left: `${Math.max(10, Math.min(88, leftPercent))}%`,
              }}
              className={clsx(
                "absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all z-10 focus:outline-none",
                isSelected && "z-30 scale-125"
              )}
            >
              {/* Pulsing ring */}
              <div className={clsx(
                "absolute -inset-2.5 rounded-full opacity-75 animate-ping",
                isSelected ? "bg-indigo-500" : "bg-emerald-500/40"
              )} />

              {/* Pin icon */}
              <div className={clsx(
                "relative p-2.5 rounded-2xl border flex items-center justify-center shadow-2xl backdrop-blur-md transition-all",
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.8)]"
                  : "bg-slate-900/90 text-indigo-400 border-slate-700 hover:border-indigo-500 hover:scale-110"
              )}>
                <MapPin className="w-4 h-4" />
              </div>

              {/* Label */}
              <div className={clsx(
                "absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-xl border pointer-events-none transition-all",
                isSelected
                  ? "bg-indigo-900 text-white border-indigo-400 opacity-100"
                  : "bg-slate-900/90 text-slate-300 border-slate-700 opacity-80 group-hover:opacity-100"
              )}>
                {place.name}
              </div>
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-2xl text-[11px] text-slate-300 font-mono flex items-center gap-2 shadow-2xl">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        Mapa Holográfico Interactivo • Los Mochis Smart City
      </div>
    </div>
  );
}

function StreetViewWrapper({ 
  lat, 
  lng, 
  heading, 
  pitch,
  autoRotate = false,
  placeName,
}: { 
  lat: number; 
  lng: number; 
  heading: number; 
  pitch: number;
  autoRotate?: boolean;
  placeName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pano, setPano] = useState<google.maps.StreetViewPanorama | null>(null);
  const [isGmapsAvailable, setIsGmapsAvailable] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === 'undefined' || !window.google || !window.google.maps) {
      setIsGmapsAvailable(false);
      return;
    }

    try {
      const panorama = new window.google.maps.StreetViewPanorama(containerRef.current, {
        position: { lat, lng },
        pov: { heading, pitch },
        zoom: 1,
        addressControl: false,
        showRoadLabels: false,
        linksControl: true,
        panControl: true,
        enableCloseButton: false,
      });
      
      setPano(panorama);
    } catch (err) {
      console.warn('StreetViewPanorama init caught:', err);
      setIsGmapsAvailable(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    if (pano) {
      try {
        pano.setPosition({ lat, lng });
        pano.setPov({ heading, pitch });
      } catch (e) {}
    }
  }, [lat, lng, heading, pitch, pano]);

  // Smooth rotation animation loop when autoRotate is active
  useEffect(() => {
    if (!pano || !autoRotate) return;

    let currentHeading = heading;
    const interval = setInterval(() => {
      currentHeading = (currentHeading + 0.3) % 360;
      try {
        pano.setPov({ heading: currentHeading, pitch });
      } catch (e) {}
    }, 60);

    return () => clearInterval(interval);
  }, [pano, autoRotate, heading, pitch]);

  if (!isGmapsAvailable) {
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 max-w-md bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl w-fit mx-auto mb-3">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Street View 360° — {placeName || 'Los Mochis'}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Coordenadas: {lat.toFixed(4)}, {lng.toFixed(4)} • Orientación {heading}°
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs font-mono text-indigo-300 space-y-1 mb-4">
            <div>📍 Ubicación: Los Mochis, Sinaloa</div>
            <div>⚡ Estatus IoT: Monitoreo En Vivo</div>
            <div>📡 Red Smart City: Transmisión 1Gbps</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Ingresa tu Google Maps API Key para activar la transmisión de Street View 360° interactiva con cámara panorámica.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
