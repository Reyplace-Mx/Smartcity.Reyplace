/// <reference types="vite/client" />
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useApiIsLoaded, useMap } from '@vis.gl/react-google-maps';
import { 
  Search, MapPin, Building2, Store, Stethoscope, ChevronRight, AlertTriangle, 
  MonitorSmartphone, Star, Bell, Calendar, GraduationCap, Map as MapIcon, 
  PlayCircle, MessageSquare, Send, X, CheckCircle2, Clock, Sparkles, Phone, 
  Globe, ExternalLink, ChevronLeft, MessageCircle, Eye, Box, Zap, Plus, ShieldCheck, Menu, Navigation, Compass, Sliders, Share2,
  BarChart3, TrendingUp, Accessibility, Glasses, Download, FileText, PieChart as PieChartIcon, RefreshCw, Heart, Camera, Cpu
} from 'lucide-react';
import { 
  ComposedChart, BarChart, Bar, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { 
  MOCK_PLACES, MOCK_NEWS, MOCK_COURSES, INITIAL_CITIZEN_REPORTS, 
  Place, PlaceType, CitizenReport 
} from './data';
import ThreeDMap from './components/ThreeDMap';
import BlenderModelViewerModal from './components/BlenderModelViewerModal';
import ExternalMapsModal from './components/ExternalMapsModal';
import RegisterBusinessModal from './components/RegisterBusinessModal';
import CourseRegistrationModal from './components/CourseRegistrationModal';
import NewCitizenReportModal from './components/NewCitizenReportModal';
import AlertsConfigModal from './components/AlertsConfigModal';
import { MapSkeleton, BusinessCardsSkeleton } from './components/SkeletonLoader';
import WalkthroughOverlay from './components/WalkthroughOverlay';
import WeatherWidget from './components/WeatherWidget';
import CitizenLeaderboard, { INITIAL_CITIZEN_COLLABORATORS, CitizenCollaborator } from './components/CitizenLeaderboard';
import ProximityNotificationToast from './components/ProximityNotificationToast';
import EmmanAiSandboxModal from './components/EmmanAiSandboxModal';

// Los Mochis default coordinates
const DEFAULT_CENTER = { lat: 25.7928, lng: -108.9902 };

function isPlaceOpenNow(schedule?: string): boolean {
  if (!schedule) return false;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0-6, 0 is Sunday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour + currentMinute / 60;
  
  const lowerSchedule = schedule.toLowerCase();
  
  if (lowerSchedule.includes('24 horas') || lowerSchedule.includes('24 hrs') || lowerSchedule.includes('24 horas')) {
    return true;
  }
  
  let isDayOpen = false;
  if (lowerSchedule.includes('todos los días') || lowerSchedule.includes('lunes a domingo') || lowerSchedule.includes('toda la semana')) {
    isDayOpen = true;
  } else if (lowerSchedule.includes('lunes a sábado')) {
    isDayOpen = currentDay >= 1 && currentDay <= 6;
  } else if (lowerSchedule.includes('lunes a viernes')) {
    isDayOpen = currentDay >= 1 && currentDay <= 5;
  } else if (lowerSchedule.includes('martes a domingo')) {
    isDayOpen = currentDay !== 1;
  }
  
  if (!isDayOpen) return false;
  
  const timeMatch = lowerSchedule.match(/(\d+):(\d+)\s*(am|pm)\s*-\s*(\d+):(\d+)\s*(am|pm)/);
  if (timeMatch) {
    let [, startH, startM, startAmPm, endH, endM, endAmPm] = timeMatch;
    
    let startHour = parseInt(startH);
    if (startAmPm === 'pm' && startHour < 12) startHour += 12;
    if (startAmPm === 'am' && startHour === 12) startHour = 0;
    const startTime = startHour + parseInt(startM) / 60;
    
    let endHour = parseInt(endH);
    if (endAmPm === 'pm' && endHour < 12) endHour += 12;
    if (endAmPm === 'am' && endHour === 12) endHour = 0;
    const endTime = endHour + parseInt(endM) / 60;
    
    return currentTime >= startTime && currentTime <= endTime;
  }
  
  return true;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

function getIconForType(type: PlaceType) {
  switch (type) {
    case 'plaza': return <MapPin className="w-5 h-5" />;
    case 'business': return <Store className="w-5 h-5" />;
    case 'office': return <Building2 className="w-5 h-5" />;
    case 'clinic': return <Stethoscope className="w-5 h-5" />;
    default: return <MapPin className="w-5 h-5" />;
  }
}

function MapCameraPan({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, zoom]);
  return null;
}

export default function App() {
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [detailModalPlace, setDetailModalPlace] = useState<Place | null>(null);
  const [mapMode, setMapMode] = useState<'map' | 'streetview'>('map');
  const [activeTab, setActiveTab] = useState<'directorio' | 'mapa3d' | 'red' | 'academia' | 'servicios' | 'favoritos'>('mapa3d');
  const [hasAuthError, setHasAuthError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(15);
  const [isOpenNowFilter, setIsOpenNowFilter] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Favorites state backed by localStorage
  const [favoritesIds, setFavoritesIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('los_mochis_favorites');
      return saved ? JSON.parse(saved) : ['place-1', 'place-3'];
    } catch {
      return ['place-1', 'place-3'];
    }
  });

  const toggleFavorite = (placeId: string) => {
    setFavoritesIds(prev => {
      const updated = prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId];
      try {
        localStorage.setItem('los_mochis_favorites', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save favorites:', e);
      }
      return updated;
    });
  };

  // Modals & Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertsConfigModalOpen, setIsAlertsConfigModalOpen] = useState(false);
  const [blenderStudioPlace, setBlenderStudioPlace] = useState<Place | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [isExternalMapsOpen, setIsExternalMapsOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDefaultPlan, setRegisterDefaultPlan] = useState('Pro');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isEmmanAiSandboxOpen, setIsEmmanAiSandboxOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  const handleReloadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  // Camera transition state
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(15);

  // Eco Mode & Citizen Collaborators State
  const [ecoMode, setEcoMode] = useState(false);
  const [citizenCollaborators, setCitizenCollaborators] = useState<CitizenCollaborator[]>(INITIAL_CITIZEN_COLLABORATORS);

  // Citizen Reports State
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);

  // Walkthrough State
  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    return localStorage.getItem('lm_walkthrough_seen') !== 'true';
  });

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    localStorage.setItem('lm_walkthrough_seen', 'true');
  };

  const apiKey =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  useEffect(() => {
    // @ts-ignore
    window.gm_authFailure = () => {
      setHasAuthError(true);
    };
  }, []);

  const isValidGoogleMapsKey = (key: string) => {
    if (!key) return false;
    const k = key.trim();
    if (k === '' || k === 'YOUR_API_KEY' || k === 'undefined' || k === 'null' || k.includes('MY_') || k.includes('YOUR_')) return false;
    // Valid Google Maps API keys MUST start with 'AIza' and be at least 25 characters long
    if (!k.startsWith('AIza') || k.length < 25) return false;
    return true;
  };

  const selectedPlace = places.find((p) => p.id === selectedPlaceId);
  const isAnalog = selectedPlace && !selectedPlace.digitalPresence;
  const showApiKeyWarning = !isValidGoogleMapsKey(apiKey) || hasAuthError;

  const digitizedCount = places.filter(p => p.digitalPresence).length;
  const totalPlaces = places.length;
  const digitalizationPercentage = Math.round((digitizedCount / totalPlaces) * 100);

  const handleDigitalize = (id: string) => {
    setPlaces(prev => prev.map(p => p.id === id ? { ...p, digitalPresence: true } : p));
  };

  const handleSelectPlace = (place: Place) => {
    setSelectedPlaceId(place.id);
    setMapCenter({ lat: place.lat, lng: place.lng });
    setMapZoom(16);

    const updatedViews = (place.views || 0) + 1;
    setPlaces(prev => prev.map(p => 
      p.id === place.id ? { ...p, views: updatedViews } : p
    ));
    
    setDetailModalPlace(prev => {
      if (prev && prev.id === place.id) {
        return { ...prev, views: updatedViews };
      }
      return prev;
    });
  };

  const handleAddReview = (placeId: string, author: string, rating: number, text: string) => {
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        const newReview = { id: `r-${Date.now()}`, author, rating, text };
        const updatedReviews = [newReview, ...(p.reviews || [])];
        return { ...p, reviews: updatedReviews };
      }
      return p;
    }));

    if (detailModalPlace && detailModalPlace.id === placeId) {
      setDetailModalPlace(prev => prev ? {
        ...prev,
        reviews: [{ id: `r-${Date.now()}`, author, rating, text }, ...(prev.reviews || [])]
      } : null);
    }
  };

  const handleAddCitizenReport = (repData: Omit<CitizenReport, 'id' | 'date' | 'status' | 'statusLabel' | 'trackingId'>) => {
    const trackingNum = Math.floor(1000 + Math.random() * 9000);
    const newRep: CitizenReport = {
      ...repData,
      id: `rep-${Date.now()}`,
      date: 'Justo ahora',
      status: 'recibido',
      statusLabel: 'Recibido',
      trackingId: `LM-2026-${trackingNum}`
    };
    setCitizenReports(prev => [newRep, ...prev]);

    // Award +50 points to user in Citizen Collaborators Leaderboard
    setCitizenCollaborators(prev => {
      const userAuthorName = repData.citizenName || 'Tú (Ciudadano Mochitense)';
      const userIndex = prev.findIndex(c => c.isCurrentUser || c.name === userAuthorName);
      
      if (userIndex >= 0) {
        const updated = [...prev];
        const currentPoints = updated[userIndex].points + 50;
        const currentReports = updated[userIndex].reportsCount + 1;
        
        let newTier = updated[userIndex].tier;
        if (currentPoints >= 1000) newTier = 'Guardián Urbano';
        else if (currentPoints >= 800) newTier = 'Embajador Mochitense';
        else if (currentPoints >= 500) newTier = 'Colaborador Oro';
        else if (currentPoints >= 300) newTier = 'Colaborador Plata';

        updated[userIndex] = {
          ...updated[userIndex],
          points: currentPoints,
          reportsCount: currentReports,
          tier: newTier,
          recentActivity: `Reportó ${repData.category} en ${repData.location}`
        };
        return updated;
      } else {
        const newCol: CitizenCollaborator = {
          id: `user-${Date.now()}`,
          name: userAuthorName,
          points: 50,
          reportsCount: 1,
          tier: 'Colaborador Bronce',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          recentActivity: `Reportó ${repData.category} en ${repData.location}`,
          isCurrentUser: true
        };
        return [newCol, ...prev];
      }
    });
  };

  const filteredPlaces = places.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const dist = getDistanceKm(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, p.lat, p.lng);
    const matchesRadius = dist <= maxRadiusKm;
    
    const matchesOpenNow = isOpenNowFilter ? isPlaceOpenNow(p.schedule) : true;

    return matchesSearch && matchesRadius && matchesOpenNow;
  });

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Mobile Top Header Bar */}
      <header className="lg:hidden bg-slate-900 text-white px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
            aria-label="Abrir Menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold leading-tight">Los Mochis</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Ciudad Digital</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WeatherWidget ecoMode={ecoMode} />
          
          <button
            onClick={() => setEcoMode(!ecoMode)}
            className={clsx(
              "p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border",
              ecoMode
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            )}
            title={ecoMode ? "Modo Eco Activo" : "Activar Modo Eco"}
          >
            <Zap className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 hidden sm:inline">
            {digitalizationPercentage}% Digital
          </span>
          <button
            onClick={() => {
              setRegisterDefaultPlan('Pro');
              setIsRegisterOpen(true);
            }}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" /> +Sumar
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 overflow-hidden">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-400">Menú Ciudadano</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Sidebar Content inside Mobile Drawer */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Los Mochis</h2>
                    <p className="text-xs font-medium text-slate-400 mt-0.5 uppercase tracking-widest">
                      Ciudad Digital
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {digitalizationPercentage}% Digital
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/60">
                  <div className="flex justify-between items-center text-[10px] mb-1 text-slate-300 font-medium">
                    <span>Progreso de Digitalización</span>
                    <span className="font-mono text-amber-400">{digitizedCount} / {totalPlaces}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_#eab308]"
                      style={{ width: `${digitalizationPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3 bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => { setActiveTab('mapa3d'); setIsMobileMenuOpen(false); }}
                    className={clsx(
                      "flex-1 min-w-[30%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[10px] font-bold rounded-lg transition-all",
                      activeTab === 'mapa3d' ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white"
                    )}
                  >
                    <Box className="w-3 h-3 text-amber-950" />
                    Mapa 3D
                  </button>
                  <button
                    onClick={() => setActiveTab('directorio')}
                    className={clsx(
                      "flex-1 min-w-[30%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[10px] font-semibold rounded-lg transition-all",
                      activeTab === 'directorio' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <MapIcon className="w-3 h-3" />
                    Directorio
                  </button>
                  <button
                    onClick={() => setActiveTab('red')}
                    className={clsx(
                      "flex-1 min-w-[30%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[10px] font-semibold rounded-lg transition-all",
                      activeTab === 'red' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Bell className="w-3 h-3" />
                    Red
                  </button>
                  <button
                    onClick={() => setActiveTab('academia')}
                    className={clsx(
                      "flex-1 min-w-[30%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[10px] font-semibold rounded-lg transition-all",
                      activeTab === 'academia' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <GraduationCap className="w-3 h-3 text-emerald-400" />
                    Adultos
                  </button>
                  <button
                    onClick={() => setActiveTab('servicios')}
                    className={clsx(
                      "flex-1 min-w-[30%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[10px] font-semibold rounded-lg transition-all",
                      activeTab === 'servicios' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Planes Pro
                  </button>
                </div>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {activeTab === 'directorio' && (
                  <div className="space-y-2 mb-2">
                    <div className="relative bg-white">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Buscar lugares..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-100 border-transparent rounded-lg text-xs focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>

                    {/* Proximity Selector in Mobile Drawer */}
                    <div className="bg-slate-900 text-white p-3 rounded-xl space-y-2 border border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <Navigation className="w-3.5 h-3.5" /> Radio de Proximidad
                        </span>
                        <span className="font-mono text-amber-300 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Hasta {maxRadiusKm} km
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="0.5"
                        value={maxRadiusKm}
                        onChange={(e) => setMaxRadiusKm(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <div className="flex gap-1">
                        {[1, 3, 5, 10, 15].map((r) => (
                          <button
                            key={r}
                            onClick={() => setMaxRadiusKm(r)}
                            className={clsx(
                              "flex-1 py-0.5 rounded text-[9px] font-bold border transition",
                              maxRadiusKm === r
                                ? "bg-amber-500 text-slate-950 border-amber-400"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            )}
                          >
                            {r} km
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Toggle Abiertos Mobile */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl mt-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-emerald-100 text-emerald-600">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-slate-900 block">Solo Abiertos Ahora</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsOpenNowFilter(!isOpenNowFilter)}
                        className={clsx(
                          "w-9 h-5 rounded-full p-0.5 transition-colors relative shadow-inner flex items-center shrink-0",
                          isOpenNowFilter ? "bg-emerald-500" : "bg-slate-300"
                        )}
                      >
                        <div className={clsx(
                          "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                          isOpenNowFilter ? "translate-x-4" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'directorio' && filteredPlaces.map((place) => {
                  const dist = getDistanceKm(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, place.lat, place.lng);
                  return (
                    <div
                      key={`m-${place.id}`}
                      onClick={() => {
                        handleSelectPlace(place);
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-3 bg-white rounded-xl border border-slate-200 text-xs hover:border-amber-400 cursor-pointer flex items-center justify-between gap-2"
                    >
                      <div className="truncate pr-1">
                        <span className="font-bold text-slate-900 block truncate">{place.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-500">{place.category}</span>
                          <span className="text-[9px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-mono border border-slate-200">📍 {dist} km</span>
                        </div>
                      </div>
                      {place.digitalPresence ? (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                          Pro
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                          Pendiente
                        </span>
                      )}
                    </div>
                  );
                })}

                {activeTab === 'red' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900 text-xs">Noticias Recientes</h4>
                    {MOCK_NEWS.map(n => (
                      <div key={`m-n-${n.id}`} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[9px] font-bold text-amber-600 uppercase">{n.type}</span>
                        <h5 className="font-bold text-slate-900 text-xs leading-tight">{n.title}</h5>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'academia' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900">Capacitación Adultos</h4>
                    {MOCK_COURSES.map(c => (
                      <div key={`m-c-${c.id}`} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{c.title}</h5>
                          <span className="text-[10px] text-slate-500">{c.duration}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCourseTitle(c.title);
                            setIsCourseModalOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                        >
                          Inscribirme
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'servicios' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-1">
                      <span className="text-[9px] font-bold text-amber-800 uppercase">Plan Pro</span>
                      <h5 className="font-bold text-slate-900">$4,999 MXN</h5>
                      <p className="text-[10px] text-slate-600">Modelado 3D, Google Maps y Presencia Digital Completa.</p>
                      <button
                        onClick={() => {
                          setRegisterDefaultPlan('Pro');
                          setIsRegisterOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full mt-2 py-1.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs"
                      >
                        Contratar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-96 bg-white border-r border-slate-200 shadow-xl z-10 flex-col h-full relative shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Los Mochis</h1>
              <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">
                Ciudad Digital
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {digitalizationPercentage}% Digital
              </span>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEmmanAiSandboxOpen(true)}
                  className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition flex items-center gap-1 shadow-sm"
                  title="Abrir Sandbox Aislado EmmanAi.Smart"
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-[11px]">EmmanAi.Smart</span>
                </button>

                <button
                  onClick={() => setEcoMode(!ecoMode)}
                  className={clsx(
                    "px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border",
                    ecoMode
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                  )}
                  title={ecoMode ? "Modo Eco Activo" : "Activar Modo Eco"}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{ecoMode ? "Eco" : "Eco"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Weather Widget for Los Mochis */}
          <div className="mt-3">
            <WeatherWidget ecoMode={ecoMode} />
          </div>

          {/* Global Progress Bar & Milestone Badges */}
          <div className="mt-4 bg-slate-800/90 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex justify-between items-center text-xs mb-2 text-slate-300 font-medium">
              <span>Progreso de Digitalización</span>
              <span className="font-mono text-amber-400">{digitizedCount} / {totalPlaces} negocios</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_#eab308]"
                style={{ width: `${digitalizationPercentage}%` }}
              />
            </div>
            
            {/* Badges / Milestones */}
            <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-700/50">
              <div className={clsx(
                "flex flex-col items-center p-1.5 rounded-lg border text-[10px] font-semibold text-center transition-all",
                digitalizationPercentage >= 25 ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-slate-900/60 border-slate-800 text-slate-500"
              )}>
                <span>🌱 Semilla</span>
                <span className="text-[9px] opacity-75">25%</span>
              </div>
              <div className={clsx(
                "flex flex-col items-center p-1.5 rounded-lg border text-[10px] font-semibold text-center transition-all",
                digitalizationPercentage >= 60 ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-slate-900/60 border-slate-800 text-slate-500"
              )}>
                <span>⚡ Conectada</span>
                <span className="text-[9px] opacity-75">60%</span>
              </div>
              <div className={clsx(
                "flex flex-col items-center p-1.5 rounded-lg border text-[10px] font-semibold text-center transition-all",
                digitalizationPercentage >= 100 ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-slate-900/60 border-slate-800 text-slate-500"
              )}>
                <span>🏆 100% Pro</span>
                <span className="text-[9px] opacity-75">100%</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-4 bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('mapa3d')}
              className={clsx(
                "flex-1 min-w-[28%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[11px] font-bold rounded-lg transition-all",
                activeTab === 'mapa3d' ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white"
              )}
            >
              <Box className="w-3.5 h-3.5" />
              Maqueta 3D
            </button>
            <button
              onClick={() => setActiveTab('directorio')}
              className={clsx(
                "flex-1 min-w-[28%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all",
                activeTab === 'directorio' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Directorio
            </button>
            <button
              onClick={() => setActiveTab('favoritos')}
              className={clsx(
                "flex-1 min-w-[28%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all relative",
                activeTab === 'favoritos' ? "bg-rose-500 text-white shadow-sm font-bold" : "text-rose-400 hover:text-rose-300"
              )}
            >
              <Heart className={clsx("w-3.5 h-3.5", activeTab === 'favoritos' && "fill-white")} />
              <span>Favoritos</span>
              {favoritesIds.length > 0 && (
                <span className={clsx(
                  "text-[9px] px-1 rounded-full font-mono font-bold",
                  activeTab === 'favoritos' ? "bg-white text-rose-600" : "bg-rose-500/30 text-rose-300"
                )}>
                  {favoritesIds.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('red')}
              className={clsx(
                "flex-1 min-w-[28%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all",
                activeTab === 'red' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Bell className="w-3.5 h-3.5" />
              Red
            </button>
            <button
              onClick={() => setActiveTab('academia')}
              className={clsx(
                "flex-1 min-w-[28%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all",
                activeTab === 'academia' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              Adultos
            </button>
            <button
              onClick={() => setActiveTab('servicios')}
              className={clsx(
                "flex-1 min-w-[28%] flex items-center justify-center gap-1 py-1.5 px-1.5 text-[11px] font-semibold rounded-lg transition-all",
                activeTab === 'servicios' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Planes Pro
            </button>
          </div>

          {/* Quick Action Top Bar Launchers */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setShowWalkthrough(true)}
              className="px-2 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition border border-amber-500/30"
              title="Iniciar Tour Guiado por la Ciudad 3D"
            >
              <Zap className="w-3 h-3 text-amber-400" /> Tour Guiado
            </button>
            <button
              onClick={() => setIsExternalMapsOpen(true)}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition border border-slate-700"
            >
              <Globe className="w-3 h-3 text-sky-400" /> Visor Maps
            </button>
            <button
              onClick={() => {
                setRegisterDefaultPlan('Pro');
                setIsRegisterOpen(true);
              }}
              className="px-2 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition shadow-sm"
            >
              <Plus className="w-3 h-3" /> Digitalizar
            </button>
          </div>
        </div>

        {activeTab === 'directorio' && (
          <div className="p-4 border-b border-slate-100 space-y-3 bg-white z-10">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar lugares..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {/* Proximity Radius Selector Panel */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl space-y-2.5 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">Radio de Proximidad</span>
                    <span className="text-[10px] text-slate-400">Centro de Los Mochis</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                  {maxRadiusKm} km
                </span>
              </div>

              <div className="space-y-1">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={maxRadiusKm}
                  onChange={(e) => setMaxRadiusKm(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-400 px-0.5">
                  <span>1 km (Centro)</span>
                  <span>5 km</span>
                  <span>10 km</span>
                  <span>15 km (Periferia)</span>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {[1, 3, 5, 10, 15].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMaxRadiusKm(r)}
                    className={clsx(
                      "flex-1 py-1 rounded-lg text-[10px] font-bold transition border",
                      maxRadiusKm === r
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-black"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    )}
                  >
                    {r} km
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1.5 border-t border-slate-800">
                <span>Comercios: <strong className="text-amber-400 font-mono">{filteredPlaces.length}</strong> / {places.length}</span>
                {filteredPlaces.length < places.length && (
                  <button
                    onClick={() => setMaxRadiusKm(15)}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    Ver todos (15 km)
                  </button>
                )}
              </div>
            </div>
            
            {/* Toggle Abiertos */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Solo Abiertos Ahora</span>
                  <span className="text-[10px] text-slate-500">Filtrar por horario</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpenNowFilter(!isOpenNowFilter)}
                className={clsx(
                  "w-10 h-6 rounded-full p-1 transition-colors relative shadow-inner flex items-center shrink-0",
                  isOpenNowFilter ? "bg-emerald-500" : "bg-slate-300"
                )}
              >
                <div className={clsx(
                  "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                  isOpenNowFilter ? "translate-x-4" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.985 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {activeTab === 'directorio' && (
            isLoading ? (
              <BusinessCardsSkeleton />
            ) : (
              filteredPlaces.map((place) => {
                const isSelected = selectedPlaceId === place.id;
                const analog = !place.digitalPresence;
                const dist = getDistanceKm(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, place.lat, place.lng);
                
                return (
                  <div
                    key={place.id}
                    className={clsx(
                      "w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-3 group",
                      isSelected
                        ? analog 
                          ? "bg-slate-900 border-slate-900 text-white shadow-md"
                          : "bg-amber-50 border-amber-300 shadow-sm ring-1 ring-amber-300/60"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm",
                      analog && !isSelected && "grayscale opacity-80"
                    )}
                  >
                    <div 
                      onClick={() => handleSelectPlace(place)}
                      className="flex items-start gap-3.5 cursor-pointer"
                    >
                      <div className={clsx(
                        "p-2 rounded-lg shrink-0 transition-colors",
                        isSelected && analog ? "bg-slate-800 text-slate-300" :
                        isSelected && !analog ? "bg-amber-500 text-slate-950 font-bold" :
                        "bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800"
                      )}>
                        {getIconForType(place.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className={clsx(
                            "font-semibold truncate text-sm",
                            isSelected && analog ? "text-white" : "text-slate-900"
                          )}>
                            {place.name}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={clsx(
                              "text-[9px] px-1.5 py-0.5 rounded font-mono font-medium border",
                              isSelected && analog 
                                ? "bg-slate-800 text-amber-300 border-slate-700" 
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            )}>
                              📍 {dist} km
                            </span>
                            {!analog ? (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                                Pro
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={clsx(
                          "text-xs mt-0.5 truncate",
                          isSelected && analog ? "text-slate-400" : "text-slate-500"
                        )}>
                          {place.category}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const avgRating = place.reviews?.length > 0
                              ? place.reviews.reduce((acc, r) => acc + r.rating, 0) / place.reviews.length
                              : 0;
                            const fill = i < Math.round(avgRating);
                            return (
                              <Star 
                                key={i} 
                                className={clsx(
                                  "w-3 h-3",
                                  fill ? "text-amber-400 fill-amber-400" : (analog ? "text-slate-600" : "text-slate-300")
                                )} 
                              />
                            );
                          })}
                          <span className={clsx("text-xs ml-1 font-medium", analog ? "text-slate-400" : "text-slate-500")}>
                            {place.reviews?.length > 0 ? `(${place.reviews.length})` : '(0)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Explore & Street View Action Bar */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleSelectPlace(place);
                          setDetailModalPlace(place);
                        }}
                        className="flex-1 text-xs font-bold py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        Explorar Ficha
                      </button>

                      <button
                        onClick={() => {
                          handleSelectPlace(place);
                          setMapMode('streetview');
                        }}
                        className="text-xs font-semibold py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 transition-colors flex items-center gap-1"
                      >
                        <MonitorSmartphone className="w-3.5 h-3.5" />
                        360°
                      </button>

                      <button
                        onClick={() => toggleFavorite(place.id)}
                        className={clsx(
                          "p-1.5 rounded-lg border transition-all shrink-0",
                          favoritesIds.includes(place.id)
                            ? "bg-rose-50 text-rose-500 border-rose-200"
                            : "bg-slate-100 text-slate-400 border-slate-200 hover:text-rose-500"
                        )}
                        title={favoritesIds.includes(place.id) ? "Quitar de Favoritos" : "Guardar en Favoritos"}
                      >
                        <Heart className={clsx("w-4 h-4", favoritesIds.includes(place.id) && "fill-rose-500 text-rose-500")} />
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}

          {activeTab === 'favoritos' && (
            <div className="space-y-3">
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Mis Comercios Favoritos</h3>
                    <p className="text-[10px] text-slate-500">{favoritesIds.length} guardados en Los Mochis</p>
                  </div>
                </div>
                {favoritesIds.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('¿Deseas borrar todos tus favoritos guardados?')) {
                        setFavoritesIds([]);
                        localStorage.removeItem('los_mochis_favorites');
                      }
                    }}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline"
                  >
                    Vaciar Lista
                  </button>
                )}
              </div>

              {favoritesIds.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-100">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Sin Favoritos Guardados</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Haz clic en el ícono de corazón de cualquier negocio en el directorio para guardarlo aquí y acceder rápidamente.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('directorio')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-md"
                  >
                    Explorar Directorio
                  </button>
                </div>
              ) : (
                places.filter(p => favoritesIds.includes(p.id)).map(place => {
                  const dist = getDistanceKm(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, place.lat, place.lng);
                  return (
                    <div
                      key={`fav-${place.id}`}
                      className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col gap-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div 
                          onClick={() => handleSelectPlace(place)}
                          className="flex items-start gap-3 cursor-pointer flex-1 min-w-0"
                        >
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                            {getIconForType(place.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-900 text-sm truncate">{place.name}</h3>
                            <p className="text-xs text-slate-500 truncate">{place.category}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">📍 {dist} km de distancia</span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavorite(place.id)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100 transition shrink-0"
                          title="Quitar de Favoritos"
                        >
                          <Heart className="w-4 h-4 fill-rose-500" />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => {
                            handleSelectPlace(place);
                            setActiveTab('mapa3d');
                          }}
                          className="flex-1 text-xs font-bold py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Box className="w-3.5 h-3.5" />
                          Ver en Maqueta 3D
                        </button>
                        <button
                          onClick={() => {
                            handleSelectPlace(place);
                            setDetailModalPlace(place);
                          }}
                          className="text-xs font-semibold py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ficha
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'red' && (
            <div className="space-y-4">
              {/* Ranking of Collaborating Citizens */}
              <CitizenLeaderboard 
                collaborators={citizenCollaborators} 
                onOpenReportModal={() => setIsNewPostModalOpen(true)}
                ecoMode={ecoMode}
              />

              {/* Citizen Communication Channel Chat */}
              <CitizenChatChannel 
                reports={citizenReports} 
                onAddReport={handleAddCitizenReport} 
                onOpenAlertsConfig={() => setIsAlertsConfigModalOpen(true)}
              />

              {/* News and Alerts */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avisos del Municipio</h4>
                <div className="space-y-2.5">
                  {MOCK_NEWS.map((item) => (
                    <div key={item.id} className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={clsx(
                          "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          item.type === 'alert' ? "bg-red-100 text-red-700" :
                          item.type === 'event' ? "bg-blue-100 text-blue-700" :
                          "bg-emerald-100 text-emerald-700"
                        )}>
                          {item.type === 'alert' ? 'Alerta' : item.type === 'event' ? 'Evento' : 'Noticia'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-xs mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academia' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Inclusión Digital</span>
                <h4 className="text-xs font-bold text-white">Capacitaciones para Adultos Mayores</h4>
                <p className="text-[11px] text-slate-300">Aprende a usar WhatsApp, Google Maps y la banca en línea de forma segura.</p>
              </div>

              {MOCK_COURSES.map((course) => (
                <div key={course.id} className="w-full rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all">
                  <div className="h-32 w-full overflow-hidden relative">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 leading-tight mb-2">{course.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">Impartido por {course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{course.level}</span>
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {course.duration}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourseTitle(course.title);
                          setIsCourseModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
                      >
                        Inscribirme
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'servicios' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 rounded-2xl border border-amber-500/30 text-white space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Digitalización de Locales</span>
                <h3 className="text-sm font-bold text-amber-100">Posiciona tu Comercio en Los Mochis</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Conectamos tu negocio con Google Business, Google Maps, Apple Maps y la Maqueta 3D oficial.
                </p>
              </div>

              {/* Plan Básico */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Plan Básico</span>
                <h4 className="font-bold text-slate-900 text-sm">$2,499 MXN</h4>
                <ul className="text-slate-600 space-y-1 text-[11px]">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Presencia en Mapa 3D</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Google Business Profile</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Enlace a WhatsApp</li>
                </ul>
                <button
                  onClick={() => {
                    setRegisterDefaultPlan('Básico');
                    setIsRegisterOpen(true);
                  }}
                  className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                >
                  Elegir Básico
                </button>
              </div>

              {/* Plan Pro */}
              <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-500 space-y-2 relative">
                <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">RECOMENDADO</span>
                <span className="text-[10px] font-bold text-amber-800 uppercase">Plan Pro</span>
                <h4 className="font-bold text-slate-900 text-sm">$4,999 MXN</h4>
                <ul className="text-slate-700 space-y-1 text-[11px]">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Todo lo del Plan Básico</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Modelo 3D con Neón</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Website Micrositio</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> SEO en Google Maps</li>
                </ul>
                <button
                  onClick={() => {
                    setRegisterDefaultPlan('Pro');
                    setIsRegisterOpen(true);
                  }}
                  className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg transition shadow-md shadow-amber-500/20"
                >
                  Contratar Plan Pro
                </button>
              </div>
            </div>
          )}
          </motion.div>
        </AnimatePresence>

        {/* Action Panel for Analog Businesses */}
        {activeTab === 'directorio' && isAnalog && selectedPlace && (
          <div className="p-6 bg-slate-900 text-white border-t-4 border-amber-500 animate-in slide-in-from-bottom-4 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-lg leading-tight uppercase tracking-wide text-slate-200">Alerta de Modernización</h4>
                <p className="text-xs text-slate-400 mt-1">Negocio sin Presencia Digital</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              {selectedPlace.description}
            </p>
            <button 
              onClick={() => {
                setRegisterDefaultPlan('Pro');
                setIsRegisterOpen(true);
              }}
              className="w-full bg-amber-500 text-slate-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <MonitorSmartphone className="w-4 h-4" />
              Digitalizar con Reyplace Pro
            </button>
          </div>
        )}
      </aside>

      {/* Main Map / 3D Canvas / Street View Area */}
      <main className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
        {/* Top View Mode Switch Controls */}
        <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-20 flex flex-wrap gap-1 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl p-1 sm:p-1.5 border border-slate-800 max-w-[calc(100vw-1.5rem)]">
          <button
            onClick={() => {
              setActiveTab('mapa3d');
              setMapMode('map');
            }}
            className={clsx(
              "px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 sm:gap-2",
              activeTab === 'mapa3d' ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Maqueta 3D</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('directorio');
              setMapMode('map');
            }}
            className={clsx(
              "px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 sm:gap-2",
              activeTab === 'directorio' && mapMode === 'map' ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Maps 2D</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('directorio');
              setMapMode('streetview');
            }}
            disabled={!selectedPlaceId}
            className={clsx(
              "px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 disabled:opacity-40 disabled:cursor-not-allowed",
              activeTab === 'directorio' && mapMode === 'streetview' ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-white"
            )}
          >
            <MonitorSmartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Street View 360°</span>
          </button>
        </div>

        {activeTab === 'mapa3d' ? (
          <div className="w-full h-full relative">
            {isLoading ? (
              <MapSkeleton />
            ) : (
              <ThreeDMap
                places={filteredPlaces}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={(place) => {
                  handleSelectPlace(place);
                  setDetailModalPlace(place);
                }}
                onOpenRegisterModal={(plan) => {
                  if (plan) setRegisterDefaultPlan(plan);
                  setIsRegisterOpen(true);
                }}
                onOpenExternalMapsModal={() => setIsExternalMapsOpen(true)}
                onOpenBlenderStudio={(place) => setBlenderStudioPlace(place)}
                onGoToCitizenRed={() => setActiveTab('red')}
                ecoMode={ecoMode}
                onToggleEcoMode={() => setEcoMode(!ecoMode)}
              />
            )}
          </div>
        ) : showApiKeyWarning ? (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 pt-24 overflow-y-auto">
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]" />
            
            <div className="relative w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col backdrop-blur-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Plataforma Activa • Los Mochis, Sinaloa, México
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Mapa Arquitectónico 3D Interactivo</h2>
                  <p className="text-slate-400 text-sm mt-1">Los negocios analógicos aparecen en tonos grises; los digitalizados brillan con el estándar Reyplace Pro.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_#eab308]" />
                  <span className="text-xs text-slate-300 font-medium">Digitalizado (Brillo activo)</span>
                  <div className="w-3 h-3 rounded-full bg-slate-600 ml-2" />
                  <span className="text-xs text-slate-400 font-medium">Analógico (Gris)</span>
                </div>
              </div>

              {/* City Grid Visualization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredPlaces.map((place) => {
                  const isSelected = selectedPlaceId === place.id;
                  const digital = place.digitalPresence;
                  const dist = getDistanceKm(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, place.lat, place.lng);
                  const avgRating = place.reviews?.length > 0
                    ? place.reviews.reduce((acc, r) => acc + r.rating, 0) / place.reviews.length
                    : 0;

                  return (
                    <div
                      key={place.id}
                      onClick={() => {
                        handleSelectPlace(place);
                        setDetailModalPlace(place);
                      }}
                      className={clsx(
                        "p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between group relative overflow-hidden",
                        isSelected 
                          ? "bg-slate-800 border-amber-400 ring-2 ring-amber-400/50 shadow-xl scale-[1.02]" 
                          : digital 
                            ? "bg-slate-800/80 border-amber-500/40 hover:border-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.1)]" 
                            : "bg-slate-950/70 border-slate-800/80 opacity-80 hover:opacity-100 grayscale hover:grayscale-0"
                      )}
                    >
                      {digital && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none blur-xl group-hover:bg-amber-500/20 transition-all" />
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={clsx(
                            "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                            digital ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-slate-800 text-slate-400"
                          )}>
                            {digital ? 'Digital Pro' : 'Pendiente Digital'}
                          </span>
                          <span className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            📍 {dist} km
                          </span>
                        </div>
                        <h4 className={clsx("font-bold text-base mb-1", digital ? "text-amber-100" : "text-slate-300")}>{place.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{place.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={clsx(
                                "w-3 h-3",
                                i < Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-slate-700"
                              )} 
                            />
                          ))}
                          <span className="text-xs text-slate-400 ml-1 font-mono">({place.reviews?.length || 0})</span>
                        </div>
                        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Ver detalle <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800 gap-2">
                <span>💡 Haga clic en cualquier negocio para explorar su ficha completa, fotos, ubicación y opiniones.</span>
                <span className="font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">Los Mochis, Sinaloa • Ecosistema Reyplace v2.0</span>
              </div>
            </div>
          </div>
        ) : (
          <APIProvider apiKey={apiKey}>
            <div className={clsx(
              "absolute inset-0 transition-opacity duration-500",
              mapMode === 'map' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}>
              <Map
                defaultCenter={DEFAULT_CENTER}
                defaultZoom={15}
                defaultTilt={45}
                defaultHeading={20}
                mapId="DEMO_MAP_ID"
                disableDefaultUI={true}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                <MapCameraPan center={mapCenter} zoom={mapZoom} />

                {places.map((place) => (
                  <AdvancedMarker
                    key={place.id}
                    position={{ lat: place.lat, lng: place.lng }}
                    onClick={() => {
                      handleSelectPlace(place);
                      setDetailModalPlace(place);
                    }}
                  >
                    <div 
                      className="relative group cursor-pointer flex flex-col items-center"
                      onMouseEnter={() => setHoveredMarkerId(place.id)}
                      onMouseLeave={() => setHoveredMarkerId(null)}
                    >
                      {/* Hover Tooltip Popup */}
                      {hoveredMarkerId === place.id && (
                        <div className="absolute bottom-full mb-2 bg-slate-950/95 text-white px-3 py-1.5 rounded-xl border border-amber-500/60 shadow-2xl backdrop-blur-md whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-amber-400 text-xs">{place.name}</span>
                            {place.digitalPresence && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded">
                                PRO
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-300 font-medium">{place.category}</span>
                          <div className="w-2.5 h-2.5 bg-slate-950 border-r border-b border-amber-500/60 rotate-45 -mb-2 mt-0.5" />
                        </div>
                      )}

                      <Pin 
                        background={!place.digitalPresence ? '#94a3b8' : '#eab308'}
                        borderColor={!place.digitalPresence ? '#64748b' : '#a16207'}
                        glyphColor="#ffffff"
                        scale={place.digitalPresence ? 1.2 : 0.9}
                      />
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            </div>

            <div className={clsx(
              "absolute inset-0 transition-opacity duration-500 bg-slate-900",
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
            
            {isAnalog && mapMode === 'streetview' && (
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-20" />
            )}
          </APIProvider>
        )}
      </main>

      {/* Modals Ecosystem */}
      {detailModalPlace && (
        <BusinessDetailModal
          place={detailModalPlace}
          onClose={() => setDetailModalPlace(null)}
          onDigitalize={handleDigitalize}
          onAddReview={handleAddReview}
          onOpenBlenderStudio={(place) => setBlenderStudioPlace(place)}
          favoritesIds={favoritesIds}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {blenderStudioPlace && (
        <BlenderModelViewerModal
          place={blenderStudioPlace}
          onClose={() => setBlenderStudioPlace(null)}
        />
      )}

      <ExternalMapsModal
        isOpen={isExternalMapsOpen}
        onClose={() => setIsExternalMapsOpen(false)}
        lat={selectedPlace ? selectedPlace.lat : DEFAULT_CENTER.lat}
        lng={selectedPlace ? selectedPlace.lng : DEFAULT_CENTER.lng}
        placeName={selectedPlace ? selectedPlace.name : 'Los Mochis, Sinaloa'}
        onApplySatelliteLayerTo3D={() => {
          setActiveTab('mapa3d');
        }}
      />

      <RegisterBusinessModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        defaultPlan={registerDefaultPlan}
        onSuccessDigitalize={(name) => {
          // Toast or handle
        }}
      />

      <CourseRegistrationModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        courseTitle={selectedCourseTitle}
      />

      <NewCitizenReportModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        onSubmitReport={(title, category, description) => {
          handleAddCitizenReport({
            citizenName: 'Ciudadano Registrado',
            category,
            categoryLabel: category.toUpperCase(),
            location: 'Los Mochis, Sin.',
            description: `${title} - ${description}`
          });
        }}
      />

      <AlertsConfigModal
        isOpen={isAlertsConfigModalOpen}
        onClose={() => setIsAlertsConfigModalOpen(false)}
      />

      <EmmanAiSandboxModal
        isOpen={isEmmanAiSandboxOpen}
        onClose={() => setIsEmmanAiSandboxOpen(false)}
        places={places}
        onAddPlace={(newPlace) => setPlaces(prev => [newPlace, ...prev])}
      />

      {showWalkthrough && (
        <WalkthroughOverlay
          onComplete={handleWalkthroughComplete}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      )}

      <ProximityNotificationToast
        places={places}
        onSelectPlace={(place) => {
          handleSelectPlace(place);
          setActiveTab('mapa3d');
        }}
        favoritesIds={favoritesIds}
        onToggleFavorite={toggleFavorite}
        ecoMode={ecoMode}
      />
    </div>
  );
}

function CitizenChatChannel({
  reports,
  onAddReport,
  onOpenAlertsConfig
}: {
  reports: CitizenReport[];
  onAddReport: (rep: Omit<CitizenReport, 'id' | 'date' | 'status' | 'statusLabel' | 'trackingId'>) => void;
  onOpenAlertsConfig?: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<'bacheo' | 'alumbrado' | 'agua' | 'basura' | 'parques' | 'seguridad'>('bacheo');
  const [locationText, setLocationText] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showStatsChart, setShowStatsChart] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'recibido' | 'en_proceso' | 'resuelto'>('todos');

  const categoryLabels = {
    bacheo: '🛣️ Bacheo / Vialidad',
    alumbrado: '💡 Alumbrado Público',
    agua: '💧 Agua y Drenaje',
    basura: '🗑️ Recolección de Basura',
    parques: '🌳 Parques y Árboles',
    seguridad: '🛡️ Seguridad / Reporte'
  };

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    const categoryColors: Record<string, string> = {
      bacheo: '#f59e0b',
      alumbrado: '#3b82f6',
      agua: '#06b6d4',
      basura: '#ef4444',
      parques: '#10b981',
      seguridad: '#8b5cf6'
    };

    const categoryNames: Record<string, string> = {
      bacheo: 'Bacheo / Vialidad',
      alumbrado: 'Alumbrado Público',
      agua: 'Agua y Drenaje',
      basura: 'Recolección Basura',
      parques: 'Parques y Jardines',
      seguridad: 'Seguridad'
    };

    return Object.keys(categoryNames).map(cat => ({
      name: categoryNames[cat],
      value: counts[cat] || (cat === 'bacheo' ? 4 : cat === 'alumbrado' ? 3 : cat === 'agua' ? 2 : 1),
      fill: categoryColors[cat]
    }));
  }, [reports]);

  const topCategory = useMemo(() => {
    if (!categoryStats.length) return null;
    return [...categoryStats].sort((a, b) => b.value - a.value)[0];
  }, [categoryStats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descriptionText.trim() || !locationText.trim()) return;

    onAddReport({
      citizenName: citizenName.trim() || 'Ciudadano Anónimo',
      category: selectedCategory,
      categoryLabel: categoryLabels[selectedCategory],
      location: locationText,
      description: descriptionText
    });

    setLocationText('');
    setDescriptionText('');
    setCitizenName('');
    setShowForm(false);
  };

  const filteredReports = activeFilter === 'todos' 
    ? reports 
    : reports.filter(r => r.status === activeFilter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Canal Ciudadano Los Mochis</h3>
            <p className="text-[11px] text-slate-300">Reporte de infraestructura urbana en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAlertsConfig && (
            <button
              onClick={onOpenAlertsConfig}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Configurar Alertas"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Alertas</span>
            </button>
          )}

          <button
            onClick={() => setShowStatsChart(!showStatsChart)}
            className={clsx(
              "text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 border",
              showStatsChart ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            )}
            title="Ver Estadísticas por Categoría"
          >
            <PieChartIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-md shadow-amber-500/20"
          >
            {showForm ? 'Cerrar' : '+ Crear Reporte'}
          </button>
        </div>
      </div>

      {/* Pie Chart Distribution Section */}
      {showStatsChart && (
        <div className="p-4 bg-slate-950 border-b border-slate-800 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">Distribución por Categoría de Reportes</h4>
                <p className="text-[10px] text-slate-400">Áreas con más necesidades de atención en Los Mochis</p>
              </div>
            </div>
            {topCategory && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                Prioridad: {topCategory.name}
              </span>
            )}
          </div>

          <div className="w-full h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#090d16" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#f59e0b',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* New Report Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-amber-50/50 border-b border-amber-100 space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Nuevo Reporte de Servicio Público
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Categoría del problema</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    "text-[11px] py-1.5 px-2 rounded-lg border text-left font-medium transition-all",
                    selectedCategory === cat
                      ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Ubicación (Ej: Calle Rosales #200)"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-amber-500"
              required
            />
            <input
              type="text"
              placeholder="Tu nombre (opcional)"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-amber-500"
            />
          </div>

          <textarea
            placeholder="Describe el problema en detalle (ej: bache profundo, lámpara apagada, etc)..."
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-amber-500 min-h-[60px]"
            required
          />

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Enviar Reporte al Municipio
          </button>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/80 px-3 py-2 gap-1 overflow-x-auto text-xs">
        {(['todos', 'recibido', 'en_proceso', 'resuelto'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={clsx(
              "px-2.5 py-1 rounded-md capitalize font-medium text-[11px] whitespace-nowrap transition-colors",
              activeFilter === filter
                ? "bg-white text-slate-900 font-bold shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {filter === 'todos' ? 'Todos los Reportes' : filter === 'recibido' ? 'Recibidos' : filter === 'en_proceso' ? 'En Proceso' : 'Resueltos'}
          </button>
        ))}
      </div>

      {/* Feed of Citizen Reports */}
      <div className="p-3 space-y-2.5 max-h-[380px] overflow-y-auto">
        {filteredReports.map((rep) => (
          <div key={rep.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                {rep.categoryLabel}
              </span>
              <span className={clsx(
                "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider",
                rep.status === 'resuelto' ? "bg-emerald-100 text-emerald-800" :
                rep.status === 'en_proceso' ? "bg-amber-100 text-amber-800" :
                "bg-blue-100 text-blue-800"
              )}>
                {rep.statusLabel}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-snug">{rep.description}</p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {rep.location}
              </span>
              <span>folio: {rep.trackingId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessDetailModal({
  place,
  onClose,
  onDigitalize,
  onAddReview,
  onOpenBlenderStudio,
  favoritesIds = [],
  onToggleFavorite
}: {
  place: Place;
  onClose: () => void;
  onDigitalize: (id: string) => void;
  onAddReview: (placeId: string, author: string, rating: number, text: string) => void;
  onOpenBlenderStudio?: (place: Place) => void;
  favoritesIds?: string[];
  onToggleFavorite?: (placeId: string) => void;
}) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Generate 6-month traffic statistics with category average comparison
  const trafficData = useMemo(() => {
    const months = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'];
    const baseViews = place.views || 95;
    const categoryBaseAvg = Math.round(baseViews * 0.72);
    return months.map((month, idx) => {
      const charCode = place.id.charCodeAt(place.id.length - 1) || 65;
      const growthFactor = 0.55 + (idx * 0.12) + ((charCode + idx * 7) % 22) / 100;
      const vistas = Math.round(baseViews * growthFactor);
      const interacciones = Math.round(vistas * 0.36);
      const promedioCategoria = Math.round(categoryBaseAvg * (0.65 + idx * 0.08));
      return { month, vistas, interacciones, promedioCategoria };
    });
  }, [place]);

  const total6MonthViews = useMemo(() => trafficData.reduce((acc, curr) => acc + curr.vistas, 0), [trafficData]);
  const totalInteractions = useMemo(() => trafficData.reduce((acc, curr) => acc + curr.interacciones, 0), [trafficData]);

  const handleExportPDFReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Informe de Tráfico Digital - ${place.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 35px; color: #0f172a; max-width: 850px; margin: 0 auto; background: #fff; }
            .header { border-bottom: 3px solid #f59e0b; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 5px; font-weight: 500; }
            .badge { background: #f59e0b; color: #000; font-weight: 900; padding: 6px 14px; border-radius: 8px; font-size: 12px; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
            .card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 18px; border-radius: 12px; }
            .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px; }
            .card-val { font-size: 28px; font-weight: 900; color: #d97706; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            th { background: #0f172a; color: #fff; font-weight: 800; }
            tr:nth-child(even) { background: #f8fafc; }
            .footer { margin-top: 45px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-size: 11px; color: #64748b; text-align: center; }
            .watermark { font-weight: bold; color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${place.name}</h1>
              <div class="subtitle">Informe de Rendimiento y Tráfico Digital 6 Meses • Smart City Los Mochis</div>
            </div>
            <span class="badge">${place.category}</span>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Vistas Totales de Ficha (6 Meses)</div>
              <div class="card-val">${total6MonthViews.toLocaleString()} vistas</div>
            </div>
            <div class="card">
              <div class="card-title">Interacciones Directas Acumuladas</div>
              <div class="card-val" style="color: #0284c7;">${totalInteractions.toLocaleString()} clicks</div>
            </div>
          </div>

          <h3>Detalle Mensual y Comparativa con Sector Local</h3>
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Vistas Ficha</th>
                <th>Interacciones</th>
                <th>Promedio Competencia</th>
                <th>Desempeño</th>
              </tr>
            </thead>
            <tbody>
              ${trafficData.map(d => `
                <tr>
                  <td><strong>${d.month}</strong></td>
                  <td>${d.vistas}</td>
                  <td>${d.interacciones}</td>
                  <td>${d.promedioCategoria}</td>
                  <td style="color: ${d.vistas >= d.promedioCategoria ? '#16a34a' : '#d97706'}; font-weight: bold;">
                    ${d.vistas >= d.promedioCategoria ? '▲ Supera Promedio (+34%)' : '● Nivel Promedio'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Documento Ejecutivo Oficial emitido por <span class="watermark">Reyplace Smart City Los Mochis</span> • Generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const images = place.images && place.images.length > 0
    ? place.images
    : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'];

  const avgRating = place.reviews?.length > 0
    ? (place.reviews.reduce((acc, r) => acc + r.rating, 0) / place.reviews.length).toFixed(1)
    : '5.0';

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newText.trim()) return;
    onAddReview(place.id, newAuthor, newRating, newText);
    setNewAuthor('');
    setNewText('');
    setShowReviewForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className={clsx(
        "relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto border flex flex-col max-h-[90vh] transition-colors duration-200",
        highContrast ? "bg-black text-white border-yellow-400" : "bg-white text-slate-800 border-slate-200"
      )}>
        {/* Senior Citizens Accessibility Header Bar */}
        <div className={clsx(
          "px-5 py-3 flex items-center justify-between border-b shrink-0 transition-all",
          highContrast ? "bg-yellow-400 text-black border-yellow-500 font-extrabold" : "bg-slate-900 text-slate-200 border-slate-800"
        )}>
          <div className="flex items-center gap-2">
            <Accessibility className={clsx("w-5 h-5", highContrast ? "text-black" : "text-amber-400")} />
            <div>
              <span className={clsx("font-extrabold text-xs sm:text-sm block leading-tight", highContrast && "text-black text-sm")}>
                Accesibilidad y Lectura Fácil
              </span>
              <span className={clsx("text-[10px]", highContrast ? "text-slate-900 font-bold" : "text-slate-400")}>
                Modo optimizado para adultos mayores y baja visión
              </span>
            </div>
          </div>

          <button
            onClick={() => setHighContrast(!highContrast)}
            className={clsx(
              "px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 border shadow-sm shrink-0",
              highContrast 
                ? "bg-black text-yellow-300 border-black hover:bg-zinc-900" 
                : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
            )}
          >
            <Glasses className="w-4 h-4" />
            <span>{highContrast ? "Contraste Normal" : "Activar Contraste Alto"}</span>
          </button>
        </div>

        {/* Header Image / Carousel */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-900 shrink-0">
          <img
            src={images[activeImageIdx]}
            alt={place.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-transform active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md border border-white/10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={clsx(
                      "w-2 h-2 rounded-full transition-all",
                      activeImageIdx === idx ? "bg-amber-400 w-6" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={clsx(
                "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider",
                place.digitalPresence 
                  ? "bg-amber-500 text-slate-950 font-extrabold shadow-[0_0_12px_#eab308]" 
                  : "bg-slate-800 text-slate-300 border border-slate-700"
              )}>
                {place.digitalPresence ? 'Reyplace Pro • Digitalizado' : 'Pendiente de Digitalizar'}
              </span>
              <span className="text-xs text-slate-300 font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                {place.category}
              </span>
              <span className="text-xs text-sky-300 font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {place.views || 1} vistas este mes
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className={clsx(
                "tracking-tight pr-4 font-extrabold",
                highContrast ? "text-3xl sm:text-4xl text-yellow-300" : "text-2xl sm:text-3xl text-white"
              )}>{place.name}</h2>
              
              <div className="flex items-center gap-2 shrink-0">
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(place.id)}
                    className={clsx(
                      "p-2.5 rounded-full backdrop-blur-md border transition-all flex items-center justify-center hover:scale-105 active:scale-95",
                      favoritesIds.includes(place.id)
                        ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30"
                        : "bg-white/10 hover:bg-white/25 text-white border-white/20"
                    )}
                    title={favoritesIds.includes(place.id) ? "Quitar de Favoritos" : "Guardar en Favoritos"}
                  >
                    <Heart className={clsx("w-5 h-5", favoritesIds.includes(place.id) && "fill-white")} />
                  </button>
                )}

                <button
                  onClick={() => {
                    const shareUrl = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
                    const text = `¡Descubre ${place.name} en Los Mochis!\n📍 Ubicación: ${shareUrl}`;
                    if (navigator.share) {
                      navigator.share({ title: place.name, text: text, url: shareUrl }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(text);
                      alert("Enlace copiado al portapapeles");
                    }
                  }}
                  className="bg-white/10 hover:bg-white/25 text-white p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                  title="Compartir"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <p className={clsx(
            "leading-relaxed",
            highContrast ? "text-white font-extrabold text-base sm:text-lg" : "text-slate-600 text-sm"
          )}>
            {place.description}
          </p>

          {/* Quick Info Grid */}
          <div className={clsx(
            "grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl border text-xs transition-colors",
            highContrast ? "bg-zinc-950 border-2 border-yellow-400 text-white text-sm font-bold" : "bg-slate-50 border-slate-200/80 text-slate-800"
          )}>
            {place.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className={clsx("w-5 h-5 shrink-0 mt-0.5", highContrast ? "text-yellow-400" : "text-amber-500")} />
                <div>
                  <span className={clsx("block", highContrast ? "text-yellow-300 font-black text-sm" : "font-semibold text-slate-900")}>Ubicación</span>
                  <span className={highContrast ? "text-white text-sm" : "text-slate-600"}>{place.address}</span>
                </div>
              </div>
            )}
            {place.phone && (
              <div className="flex items-start gap-2.5">
                <Phone className={clsx("w-5 h-5 shrink-0 mt-0.5", highContrast ? "text-yellow-400" : "text-amber-500")} />
                <div>
                  <span className={clsx("block", highContrast ? "text-yellow-300 font-black text-sm" : "font-semibold text-slate-900")}>Teléfono / WhatsApp</span>
                  <a href={`tel:${place.phone}`} className={clsx("font-mono font-bold hover:underline", highContrast ? "text-yellow-300 text-base" : "text-blue-600")}>{place.phone}</a>
                </div>
              </div>
            )}
            {place.schedule && (
              <div className="flex items-start gap-2.5">
                <Clock className={clsx("w-5 h-5 shrink-0 mt-0.5", highContrast ? "text-yellow-400" : "text-amber-500")} />
                <div>
                  <span className={clsx("block", highContrast ? "text-yellow-300 font-black text-sm" : "font-semibold text-slate-900")}>Horario de Atención</span>
                  <span className={highContrast ? "text-white text-sm" : "text-slate-600"}>{place.schedule}</span>
                </div>
              </div>
            )}
            {place.website && (
              <div className="flex items-start gap-2.5">
                <Globe className={clsx("w-5 h-5 shrink-0 mt-0.5", highContrast ? "text-yellow-400" : "text-amber-500")} />
                <div>
                  <span className={clsx("block", highContrast ? "text-yellow-300 font-black text-sm" : "font-semibold text-slate-900")}>Sitio Web Oficial</span>
                  <a href={place.website} target="_blank" rel="noopener noreferrer" className={clsx("font-bold hover:underline flex items-center gap-1", highContrast ? "text-yellow-300 text-sm" : "text-amber-600")}>
                    Visitar portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Section: Traffic & Visibility Statistics Chart */}
          <div className={clsx(
            "p-5 rounded-2xl border space-y-4 transition-colors",
            highContrast ? "bg-zinc-950 border-2 border-yellow-400 text-white" : "bg-slate-900 border-slate-800 text-white"
          )}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className={clsx("p-2 rounded-xl", highContrast ? "bg-yellow-400 text-black" : "bg-amber-500/20 text-amber-400 border border-amber-500/30")}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={clsx("font-extrabold text-sm sm:text-base flex items-center gap-2", highContrast ? "text-yellow-300" : "text-white")}>
                    Estadísticas de Tráfico & Popularidad
                  </h3>
                  <p className="text-xs text-slate-400">Rendimiento mensual acumulado vs competencia local</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDFReport}
                  className={clsx(
                    "text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm border shrink-0",
                    highContrast 
                      ? "bg-yellow-400 text-black border-black font-black hover:bg-yellow-300" 
                      : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                  )}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Informe (PDF)</span>
                </button>
                <span className={clsx(
                  "text-xs px-2.5 py-1 rounded-lg font-bold font-mono self-start sm:self-auto flex items-center gap-1",
                  highContrast ? "bg-yellow-400 text-black" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                )}>
                  <TrendingUp className="w-3.5 h-3.5" /> +34% Crecimiento
                </span>
              </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={clsx("p-3 rounded-xl border", highContrast ? "bg-black border-yellow-400/80" : "bg-slate-800/80 border-slate-700")}>
                <span className="text-[11px] text-slate-400 block font-medium">Vistas Totales (6 Meses)</span>
                <span className={clsx("text-lg sm:text-xl font-black block mt-0.5", highContrast ? "text-yellow-300" : "text-amber-400")}>
                  {total6MonthViews.toLocaleString()}
                </span>
              </div>
              <div className={clsx("p-3 rounded-xl border", highContrast ? "bg-black border-yellow-400/80" : "bg-slate-800/80 border-slate-700")}>
                <span className="text-[11px] text-slate-400 block font-medium">Interacciones Directas</span>
                <span className={clsx("text-lg sm:text-xl font-black block mt-0.5", highContrast ? "text-sky-300" : "text-sky-400")}>
                  {totalInteractions.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Recharts ComposedChart */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 font-semibold block mb-2">Vistas, Clicks y Promedio Competencia (Últimos 6 Meses)</span>
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={highContrast ? "#f59e0b" : "#334155"} opacity={0.25} />
                    <XAxis dataKey="month" stroke={highContrast ? "#fef08a" : "#94a3b8"} fontSize={11} tickLine={false} />
                    <YAxis stroke={highContrast ? "#fef08a" : "#94a3b8"} fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#090d16', 
                        borderColor: '#f59e0b', 
                        borderRadius: '12px', 
                        color: '#fff', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="vistas" name="Vistas de Ficha" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="interacciones" name="Clicks e Interacciones" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="promedioCategoria" name="Promedio Categoría Local" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <p className={clsx("text-[11px] italic p-2.5 rounded-xl border leading-relaxed", highContrast ? "bg-black border-yellow-400 text-yellow-200" : "bg-amber-500/10 border-amber-500/20 text-amber-300")}>
              💡 <strong>Estímulo de Competitividad:</strong> Los negocios con perfil Reyplace Pro y fotos 3D generan hasta +320% más interacciones mensuales que el promedio en Sinaloa.
            </p>
          </div>

          {/* Multi-Map & Platform Ecosystem Integrations */}
          <div className={clsx(
            "p-4 rounded-2xl border space-y-3 transition-colors",
            highContrast ? "bg-zinc-950 border-2 border-yellow-400 text-white" : "bg-slate-900 border-slate-800 text-white"
          )}>
            <div className="flex items-center justify-between">
              <span className={clsx("text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", highContrast ? "text-yellow-300" : "text-amber-400")}>
                <Globe className="w-3.5 h-3.5" />
                Ecosistema de Mapas y Directorios Digitales
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/20">
                Sincronización Multi-Plataforma
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/80 flex items-center gap-2 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                  GM
                </div>
                <div className="truncate">
                  <span className="font-semibold block text-[11px] text-slate-200 group-hover:text-amber-400">Google Maps</span>
                  <span className="text-[9px] text-slate-400">Ver ficha y ruta</span>
                </div>
              </a>

              <a
                href={`https://business.google.com/search?q=${encodeURIComponent(place.name + ' Los Mochis')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/80 flex items-center gap-2 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  GB
                </div>
                <div className="truncate">
                  <span className="font-semibold block text-[11px] text-slate-200 group-hover:text-amber-400">Google Business</span>
                  <span className="text-[9px] text-slate-400">Perfil de Empresa</span>
                </div>
              </a>

              <a
                href={`https://earth.google.com/web/@${place.lat},${place.lng},20a,300d,35y,0h,45t,0r`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/80 flex items-center gap-2 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                  GE
                </div>
                <div className="truncate">
                  <span className="font-semibold block text-[11px] text-slate-200 group-hover:text-amber-400">Google Earth</span>
                  <span className="text-[9px] text-slate-400">Vista 3D Satelital</span>
                </div>
              </a>

              <a
                href={`https://www.bing.com/maps?cp=${place.lat}~${place.lng}&lvl=16`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/80 flex items-center gap-2 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[10px]">
                  MS
                </div>
                <div className="truncate">
                  <span className="font-semibold block text-[11px] text-slate-200 group-hover:text-amber-400">Microsoft Maps</span>
                  <span className="text-[9px] text-slate-400">Bing Cartografía</span>
                </div>
              </a>

              <a
                href={`https://maps.apple.com/?q=${encodeURIComponent(place.name)}&ll=${place.lat},${place.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/80 flex items-center gap-2 transition-all group col-span-2 sm:col-span-1"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-500/20 text-slate-200 flex items-center justify-center font-bold text-[10px]">
                  AP
                </div>
                <div className="truncate">
                  <span className="font-semibold block text-[11px] text-slate-200 group-hover:text-amber-400">Apple Maps</span>
                  <span className="text-[9px] text-slate-400">Ecosistema iOS</span>
                </div>
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onOpenBlenderStudio && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBlenderStudio(place);
                }}
                className={clsx(
                  "flex-1 font-bold py-3 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-2 border shadow-md",
                  highContrast 
                    ? "bg-yellow-400 text-black border-black text-base font-black hover:bg-yellow-300" 
                    : "bg-slate-900 hover:bg-slate-800 text-amber-400 text-sm border-slate-800"
                )}
              >
                <Box className="w-4 h-4 text-amber-400" />
                Estudio 3D Blender
              </button>
            )}

            {place.phone && (
              <a
                href={`https://wa.me/52${place.phone.replace(/\D/g, '')}?text=Hola,%20vi%20su%20negocio%20en%20la%20plataforma%20Smart%20City%20Los%20Mochis`}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  "flex-1 font-bold py-3 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-2 shadow-sm",
                  highContrast 
                    ? "bg-emerald-400 text-black font-black text-base border-2 border-black hover:bg-emerald-300" 
                    : "bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
                )}
              >
                <MessageCircle className="w-4 h-4" />
                Contactar por WhatsApp
              </a>
            )}

            {!place.digitalPresence && (
              <button
                onClick={() => {
                  onDigitalize(place.id);
                  onClose();
                }}
                className={clsx(
                  "flex-1 font-extrabold py-3 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-2 shadow-lg",
                  highContrast 
                    ? "bg-yellow-300 text-black border-2 border-black text-base font-black hover:bg-yellow-200" 
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm shadow-amber-500/20"
                )}
              >
                <Sparkles className="w-4 h-4" />
                Digitalizar Ahora (Reyplace Pro)
              </button>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reseñas de Ciudadanos</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={clsx("w-4 h-4", i < Math.round(Number(avgRating)) ? "fill-amber-400" : "text-slate-300")} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{avgRating} de 5</span>
                  <span className="text-xs text-slate-400">({place.reviews?.length || 0} opiniones)</span>
                </div>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
              >
                {showReviewForm ? 'Cancelar' : '+ Agregar Reseña'}
              </button>
            </div>

            {/* Add Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-amber-500"
                    required
                  />
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-amber-500"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                    <option value={3}>⭐⭐⭐ (3)</option>
                    <option value={2}>⭐⭐ (2)</option>
                    <option value={1}>⭐ (1)</option>
                  </select>
                </div>
                <textarea
                  placeholder="Escribe tu opinión sobre la atención, servicio o instalaciones..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-amber-500 min-h-[70px]"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                >
                  Publicar Reseña
                </button>
              </form>
            )}

            {/* Review Items */}
            <div className="space-y-3">
              {place.reviews && place.reviews.length > 0 ? (
                place.reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 text-xs">{rev.author}</span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={clsx("w-3 h-3", i < rev.rating ? "fill-amber-400" : "text-slate-200")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No hay opiniones registradas aún. Sé el primero en opinar.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StreetViewWrapper({ lat, lng, heading, pitch }: { lat: number, lng: number, heading: number, pitch: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pano, setPano] = useState<google.maps.StreetViewPanorama | null>(null);
  const apiIsLoaded = useApiIsLoaded();

  useEffect(() => {
    if (!apiIsLoaded || !containerRef.current || !window.google || !window.google.maps) return;

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
      console.warn("StreetView init warning:", err);
    }
  }, [apiIsLoaded]);

  useEffect(() => {
    if (pano) {
      try {
        pano.setPosition({ lat, lng });
        pano.setPov({ heading, pitch });
      } catch (err) {
        console.warn("StreetView setPosition warning:", err);
      }
    }
  }, [lat, lng, heading, pitch, pano]);

  return <div ref={containerRef} className="w-full h-full" />;
}

