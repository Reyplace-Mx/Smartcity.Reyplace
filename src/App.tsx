/// <reference types="vite/client" />
import { useState, useRef, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Search, MapPin, Building2, Store, Stethoscope, ChevronRight, AlertTriangle, MonitorSmartphone, X, Bell, Navigation, Settings2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { MOCK_PLACES, Place, PlaceType } from './data';
import { HOLOGRAPHIC_STYLE } from './MapStyle';
import { Directions } from './Directions';

// Los Mochis coordinates
const DEFAULT_CENTER = { lat: 25.7928, lng: -108.9902 };

// Mock Notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'event', title: '¡Evento Digital!', message: 'Workshop de e-commerce en Centro Histórico', time: 'Hace 5 min', read: false },
  { id: 2, type: 'promo', title: 'Nuevo Negocio Digitalizado', message: 'Abarrotes La Esquina ya tiene presencia online con menú interactivo.', time: 'Hace 1 hora', read: false },
  { id: 3, type: 'alert', title: 'Actualización de Tráfico', message: 'Ruta alterna sugerida en Av. Obregón por obras.', time: 'Hace 2 horas', read: true },
];

function getIconForType(type: PlaceType) {
  switch (type) {
    case 'plaza': return <MapPin className="w-5 h-5" />;
    case 'business': return <Store className="w-5 h-5" />;
    case 'office': return <Building2 className="w-5 h-5" />;
    case 'clinic': return <Stethoscope className="w-5 h-5" />;
    default: return <MapPin className="w-5 h-5" />;
  }
}

export default function App() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'map' | 'streetview'>('map');
  const [sidebarTab, setSidebarTab] = useState<'directory' | 'routes'>('directory');
  const [originId, setOriginId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [apiKeyError, setApiKeyError] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    (window as any).gm_authFailure = () => {
      setApiKeyError(true);
    };
  }, []);

  const selectedPlace = MOCK_PLACES.find((p) => p.id === selectedPlaceId);
  const isAnalog = selectedPlace && !selectedPlace.digitalPresence;

  const originPlace = MOCK_PLACES.find(p => p.id === originId);
  const destinationPlace = MOCK_PLACES.find(p => p.id === destinationId);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Header Navigation */}
      <nav className="h-16 px-6 lg:px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">LM</div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Mochis <span className="text-indigo-400">Digital Hub</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex bg-slate-800 rounded-full px-4 py-1.5 text-sm border border-slate-700">
            <span className="text-slate-400">Sector:</span>
            <span className="ml-2 font-medium text-slate-200">Centro Histórico</span>
          </div>
          <div className="flex gap-4 items-center">
            {/* Notifications Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-50">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <h3 className="font-bold text-sm text-slate-200">Notificaciones</h3>
                    <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">Marcar leídas</button>
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
                  <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-center">
                    <button className="text-xs text-slate-400 hover:text-indigo-400 flex items-center justify-center gap-2 mx-auto">
                      <Settings2 className="w-3 h-3" /> Configurar Alertas
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
              Digitalizar Mi Negocio
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Left Sidebar: Search and List */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shrink-0">
          <div className="flex border-b border-slate-800">
            <button 
              onClick={() => setSidebarTab('directory')}
              className={clsx("flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors", sidebarTab === 'directory' ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-900/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50")}
            >
              Directorio
            </button>
            <button 
              onClick={() => setSidebarTab('routes')}
              className={clsx("flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2", sidebarTab === 'routes' ? "text-indigo-400 border-b-2 border-indigo-400 bg-indigo-900/10" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50")}
            >
              <Navigation className="w-4 h-4" /> Rutas
            </button>
          </div>

          {sidebarTab === 'directory' ? (
            <>
              <div className="p-5 border-b border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar lugares..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {MOCK_PLACES.map((place) => {
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
                        "w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3",
                        isSelected
                          ? "bg-slate-800/80 border-indigo-500 shadow-md shadow-indigo-500/10"
                          : "bg-transparent border-transparent hover:bg-slate-800/50 hover:border-slate-700",
                        analog && !isSelected && "opacity-60"
                      )}
                    >
                      <div className={clsx(
                        "p-2 rounded-lg shrink-0",
                        isSelected ? "bg-indigo-500/20 text-indigo-400" :
                        analog ? "bg-slate-800 text-slate-400" : "bg-indigo-500/10 text-indigo-400"
                      )}>
                        {getIconForType(place.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={clsx(
                          "text-sm font-semibold truncate",
                          isSelected ? "text-indigo-50" : (analog ? "text-slate-400" : "text-slate-200")
                        )}>
                          {place.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate mt-0.5">
                          {place.category}
                        </p>
                      </div>
                      {analog ? (
                        <div className="w-2 h-2 rounded-full bg-slate-600 shrink-0"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-5 border-b border-slate-800 bg-slate-900">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Planificador de Rutas</h3>
                
                <div className="space-y-4 relative">
                  {/* Origin */}
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Origen</label>
                    <select 
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:border-indigo-500 outline-none"
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
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2 focus:border-indigo-500 outline-none"
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
                  className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                >
                  Calcular Ruta
                </button>
              </div>

              {originId && destinationId && (
                <div className="p-5 flex-1 bg-slate-950/30">
                  <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-bold text-slate-200">Ruta Optimizada</span>
                    </div>
                    <p className="text-xs text-indigo-300 leading-relaxed mb-4">
                      Sigue la ruta marcada en el mapa. Puedes explorar los puntos de interés cercanos utilizando la vista 360° en las paradas clave.
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedPlaceId(destinationId);
                        setMapMode('streetview');
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors"
                    >
                      Ver Destino en 360°
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Main Map Viewport */}
        <main className="flex-1 relative bg-slate-800 overflow-hidden">
          {!apiKey || apiKeyError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-50">
              <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md text-center">
                <MapPin className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Se requiere API Key válida</h2>
                <p className="text-slate-400 mb-6 text-sm">
                  Para ver el mapa y Street View interactivo, necesitas agregar tu VITE_GOOGLE_MAPS_API_KEY en el archivo .env o en los secretos de la aplicación.
                </p>
                <div className="p-4 bg-slate-950 rounded-lg text-left text-xs font-mono text-indigo-300 break-all border border-slate-800">
                  VITE_GOOGLE_MAPS_API_KEY="..."
                </div>
              </div>
            </div>
          ) : (
            <APIProvider apiKey={apiKey} onLoad={() => setApiKeyError(false)} onError={() => setApiKeyError(true)}>
              {/* Floating Controls inside Map */}
              <div className="absolute top-6 left-6 z-10 flex bg-slate-900/80 backdrop-blur-md rounded-lg shadow-xl p-1 border border-slate-700">
                <button
                  onClick={() => setMapMode('map')}
                  className={clsx(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                    mapMode === 'map' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  )}
                >
                  Mapa 2D
                </button>
                <button
                  onClick={() => setMapMode('streetview')}
                  disabled={!selectedPlaceId}
                  className={clsx(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    mapMode === 'streetview' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  )}
                >
                  Street View 360°
                </button>
              </div>

              {/* 2D Map */}
              <div className={clsx(
                "absolute inset-0 transition-opacity duration-500",
                mapMode === 'map' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              )}>
                <Map
                  defaultCenter={DEFAULT_CENTER}
                  defaultZoom={15}
                  mapId="DEMO_MAP_ID"
                  disableDefaultUI={true}
                  styles={HOLOGRAPHIC_STYLE}
                  className="w-full h-full"
                >
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
              </div>

              {/* Street View */}
              <div className={clsx(
                "absolute inset-0 transition-opacity duration-500 bg-slate-950",
                mapMode === 'streetview' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                isAnalog && "grayscale contrast-125 brightness-90 sepia-[.1]"
              )}>
                {selectedPlace && (
                  <StreetViewWrapper 
                    lat={selectedPlace.lat} 
                    lng={selectedPlace.lng}
                    heading={selectedPlace.heading}
                    pitch={selectedPlace.pitch}
                  />
                )}
              </div>
              
              {/* Overlay Vignette for Analog Mode */}
              {isAnalog && mapMode === 'streetview' && (
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] z-20" />
              )}
            </APIProvider>
          )}
        </main>

        {/* Right Inspector Panel */}
        <aside className="w-80 bg-slate-950 p-6 flex flex-col gap-6 z-10 shrink-0 overflow-y-auto border-l border-slate-800">
          {!selectedPlace ? (
            <>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Estado de Digitalización</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-indigo-400">42%</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Presencia Completa</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-400 border-t-transparent"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-slate-400">58%</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Sin Identidad Digital</span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-4 border-slate-600 border-t-transparent"></div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Leyenda del Mapa</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                    <span className="text-sm text-slate-300">Negocio Certificado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                    <span className="text-sm text-slate-400 italic">En Blanco y Negro (Inactivo)</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto p-4 bg-indigo-900/20 rounded-2xl border border-indigo-500/30">
                <p className="text-xs text-indigo-300 mb-3 leading-relaxed">¿Tu negocio aparece en gris en Street View? Mejora tu visibilidad y activa tu color hoy mismo.</p>
                <button className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold rounded-lg transition-all">VER REQUISITOS</button>
              </div>
            </>
          ) : (
            <>
              {isAnalog ? (
                <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded">ALERTA: BRECHA DIGITAL</span>
                    <button onClick={() => setSelectedPlaceId(null)} className="text-slate-500 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 leading-tight mb-2">{selectedPlace.name}</h3>
                  <p className="text-slate-400 text-xs mb-4">{selectedPlace.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <AlertTriangle className="w-4 h-4 text-slate-600" />
                      Google Maps: Ficha Incompleta
                    </div>
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <MonitorSmartphone className="w-4 h-4" />
                      Branding y Web: No detectado
                    </div>
                  </div>

                  <button className="w-full py-3 bg-white text-slate-950 text-xs font-bold rounded-xl hover:bg-indigo-400 transition-all uppercase tracking-wider shadow-lg shadow-white/10">Activar Color Digital</button>
                </div>
              ) : (
                <div className="bg-indigo-900/20 rounded-2xl p-5 border border-indigo-500/30 animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded border border-indigo-500/30">VERIFICADO DIGITALMENTE</span>
                    <button onClick={() => setSelectedPlaceId(null)} className="text-indigo-400 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-2">{selectedPlace.name}</h3>
                  <p className="text-indigo-200/70 text-xs mb-4">{selectedPlace.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-xs text-indigo-300">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      Google Maps: Optimizado
                    </div>
                    <div className="flex items-center gap-2 text-xs text-indigo-300">
                      <MonitorSmartphone className="w-4 h-4 text-indigo-400" />
                      Presencia Web: Activa
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Puntos de Interés Cercanos</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 h-16 rounded-lg border border-slate-800 p-2 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-slate-500">Parque</span>
                    <span className="text-[11px] font-medium text-slate-300">Sinaloa</span>
                  </div>
                  <div className="bg-slate-900 h-16 rounded-lg border border-slate-800 p-2 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-slate-500">Cerro de la</span>
                    <span className="text-[11px] font-medium text-slate-300">Memoria</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Footer Status */}
      <footer className="h-8 px-6 bg-indigo-600 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-100 z-20 shrink-0">
        <div className="flex gap-4 md:gap-6">
          <span className="hidden sm:inline">Status: Exploración Urbana Interactiva</span>
          <span className="sm:hidden">Exploración Urbana</span>
          <span>Región: Noroeste MX</span>
        </div>
        <div className="flex gap-3 md:gap-4 items-center">
          <span className="opacity-75 italic hidden md:inline">Socio Digital: Ayuntamiento de Ahome</span>
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(134,239,172,0.8)]"></div>
        </div>
      </footer>
    </div>
  );
}

function StreetViewWrapper({ lat, lng, heading, pitch }: { lat: number, lng: number, heading: number, pitch: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pano, setPano] = useState<google.maps.StreetViewPanorama | null>(null);

  useEffect(() => {
    if (!containerRef.current || !window.google) return;

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

    return () => {
      // cleanup
    };
  }, []);

  useEffect(() => {
    if (pano) {
      pano.setPosition({ lat, lng });
      pano.setPov({ heading, pitch });
    }
  }, [lat, lng, heading, pitch, pano]);

  return <div ref={containerRef} className="w-full h-full" />;
}

