import React, { useState, useEffect } from 'react';
import { MapPin, Heart, Eye, X, Bell, Sparkles, Navigation, Volume2, VolumeX, Radio, AlertTriangle, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { Place, CitizenReport } from '../data';

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000); // Distance in meters
}

interface ProximityNotificationToastProps {
  places: Place[];
  citizenReports?: CitizenReport[];
  userGpsPosition?: { lat: number; lng: number } | null;
  onSelectPlace: (place: Place) => void;
  onSelectCitizenReport?: (report: CitizenReport) => void;
  favoritesIds: string[];
  onToggleFavorite: (placeId: string) => void;
  ecoMode?: boolean;
}

interface NotificationItem {
  id: string;
  type: 'place' | 'citizen_report';
  place?: Place;
  report?: CitizenReport;
  distanceMeters: number;
  time: string;
  promoText?: string;
}

export default function ProximityNotificationToast({
  places,
  citizenReports = [],
  userGpsPosition,
  onSelectPlace,
  onSelectCitizenReport,
  favoritesIds,
  onToggleFavorite,
  ecoMode = false,
}: ProximityNotificationToastProps) {
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [notificationHistoryCount, setNotificationHistoryCount] = useState(0);

  // Check proximity for active citizen reports (< 500 meters)
  useEffect(() => {
    if (!userGpsPosition || !citizenReports || citizenReports.length === 0) return;

    // Find reports within 500 meters
    const nearbyReports = citizenReports
      .map(r => ({
        report: r,
        distMeters: getDistanceMeters(userGpsPosition.lat, userGpsPosition.lng, r.lat, r.lng)
      }))
      .filter(item => item.distMeters <= 500 && item.report.status !== 'resuelto')
      .sort((a, b) => a.distMeters - b.distMeters);

    if (nearbyReports.length > 0) {
      const closest = nearbyReports[0];
      const item: NotificationItem = {
        id: `report-alert-${closest.report.id}-${Date.now()}`,
        type: 'citizen_report',
        report: closest.report,
        distanceMeters: closest.distMeters,
        time: 'En tiempo real (GPS)'
      };

      setActiveNotification(item);
      setNotificationHistoryCount(prev => prev + 1);

      const timer = setTimeout(() => {
        setActiveNotification(prev => (prev?.id === item.id ? null : prev));
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [userGpsPosition, citizenReports]);

  // Promos and descriptions for simulated commercial proximity alerts
  const PROMO_TEXTS = [
    '¡Descuento del 15% en consumo mostrando tu App Digital!',
    'Punto destacado con presencia digital Pro en Los Mochis.',
    'Horario extendido y atención directa por WhatsApp.',
    'Certificado en la Maqueta 3D Oficial de Los Mochis.',
    'Zona médica e infraestructura de atención especializada.'
  ];

  // Trigger simulated proximity alert (commercial or report)
  const triggerSimulatedProximityAlert = () => {
    // Alternate or prioritize report alert if available
    const activeReports = citizenReports.filter(r => r.status !== 'resuelto');
    const shouldShowReport = activeReports.length > 0 && Math.random() > 0.4;

    if (shouldShowReport) {
      const randomReport = activeReports[Math.floor(Math.random() * activeReports.length)];
      const randomDist = Math.floor(Math.random() * 320) + 80; // 80m - 400m (<500m)

      const item: NotificationItem = {
        id: `notif-report-${Date.now()}`,
        type: 'citizen_report',
        report: randomReport,
        distanceMeters: randomDist,
        time: 'Hace 1 min'
      };

      setActiveNotification(item);
      setNotificationHistoryCount(prev => prev + 1);

      const timer = setTimeout(() => {
        setActiveNotification(prev => (prev?.id === item.id ? null : prev));
      }, 10000);

      return () => clearTimeout(timer);
    }

    if (!places || places.length === 0) return;
    const digitalPlaces = places.filter(p => p.digitalPresence);
    const pool = digitalPlaces.length > 0 ? digitalPlaces : places;
    const randomPlace = pool[Math.floor(Math.random() * pool.length)];
    const randomDistance = Math.floor(Math.random() * 250) + 40; // 40m - 290m
    const promo = PROMO_TEXTS[Math.floor(Math.random() * PROMO_TEXTS.length)];

    const item: NotificationItem = {
      id: `notif-place-${Date.now()}`,
      type: 'place',
      place: randomPlace,
      distanceMeters: randomDistance,
      time: 'Justo ahora',
      promoText: promo,
    };

    setActiveNotification(item);
    setNotificationHistoryCount(prev => prev + 1);

    const timer = setTimeout(() => {
      setActiveNotification(prev => (prev?.id === item.id ? null : prev));
    }, 10000);

    return () => clearTimeout(timer);
  };

  // Periodic commercial/GPS alerts unless ecoMode is active
  useEffect(() => {
    if (ecoMode) return;

    const initialTimer = setTimeout(() => {
      triggerSimulatedProximityAlert();
    }, 5000);

    const interval = setInterval(() => {
      triggerSimulatedProximityAlert();
    }, 28000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [places, citizenReports, ecoMode]);

  if (!activeNotification) {
    return (
      <div className="fixed bottom-4 right-4 z-40 pointer-events-auto flex items-center gap-2">
        <button
          onClick={triggerSimulatedProximityAlert}
          className="bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/40 p-2.5 rounded-2xl shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-2 transition hover:scale-105 active:scale-95 group"
          title="Simular alerta GPS de proximidad (<500m)"
        >
          <div className="relative">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline">Simular Alerta GPS (&lt;500m)</span>
          {notificationHistoryCount > 0 && (
            <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-amber-500/30">
              {notificationHistoryCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Render Citizen Report Proximity Alert Toast (< 500m)
  if (activeNotification.type === 'citizen_report' && activeNotification.report) {
    const { report, distanceMeters } = activeNotification;

    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[92vw] pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div className="bg-slate-950/95 backdrop-blur-2xl border-2 border-rose-500/60 rounded-2xl p-4 shadow-2xl shadow-rose-500/20 text-white relative overflow-hidden">
          {/* Glowing Ambient Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 animate-pulse" />

          {/* Header Badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-rose-500/40">
                <AlertTriangle className="w-3 h-3 text-rose-400 animate-bounce" />
                Incidencia Cercana (&lt;500m)
              </span>
              <span className="text-[10px] font-mono text-rose-400 font-black flex items-center gap-0.5 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                <Navigation className="w-2.5 h-2.5" /> a {distanceMeters}m
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                title={isMuted ? 'Activar sonido de alerta' : 'Silenciar alertas'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-rose-400" />}
              </button>
              <button
                onClick={() => setActiveNotification(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                title="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report Detail */}
          <div className="flex items-start gap-3 my-2">
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400 shrink-0 shadow-inner">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-bold uppercase text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  {report.categoryLabel}
                </span>
                <span className="text-[9px] font-mono text-slate-400">#{report.trackingId}</span>
              </div>
              <h4 className="font-bold text-white text-sm truncate leading-snug">
                {report.location}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                "{report.description}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
            {onSelectCitizenReport && (
              <button
                onClick={() => {
                  onSelectCitizenReport(report);
                  setActiveNotification(null);
                }}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-md shadow-rose-500/20 active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                Atender en Canal Ciudadano
              </button>
            )}
            <button
              onClick={() => setActiveNotification(null)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Ignorar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Commercial Place Proximity Alert Toast
  const { place, distanceMeters, promoText } = activeNotification;
  const isFav = place ? favoritesIds.includes(place.id) : false;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[92vw] pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-950/95 backdrop-blur-2xl border-2 border-amber-500/50 rounded-2xl p-4 shadow-2xl shadow-amber-500/10 text-white relative overflow-hidden">
        {/* Glowing Ambient Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-sky-400 animate-pulse" />

        {/* Header Badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-500/30">
              <Bell className="w-3 h-3 text-amber-400 animate-bounce" />
              Notificación de Proximidad
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-extrabold flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <Navigation className="w-2.5 h-2.5" /> a {distanceMeters}m
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              title={isMuted ? 'Activar sonido de alerta' : 'Silenciar alertas'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>
            <button
              onClick={() => setActiveNotification(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Place Card Detail */}
        {place && (
          <div className="flex items-start gap-3 my-2">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-amber-400 shrink-0 shadow-inner">
              <MapPin className="w-5 h-5 text-amber-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-sm truncate leading-snug">
                {place.name}
              </h4>
              <p className="text-[11px] text-amber-300/90 font-medium truncate mt-0.5">
                {place.category} • {place.address || 'Los Mochis, Sin.'}
              </p>
              {promoText && (
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed bg-slate-900/80 p-1.5 rounded-lg border border-slate-800/80">
                  ✨ {promoText}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {place && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                onSelectPlace(place);
                setActiveNotification(null);
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver en Mapa 3D
            </button>

            <button
              onClick={() => onToggleFavorite(place.id)}
              className={clsx(
                "p-2 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1",
                isFav
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
              )}
              title={isFav ? "Quitar de Favoritos" : "Guardar en Favoritos"}
            >
              <Heart className={clsx("w-4 h-4", isFav && "fill-rose-500 text-rose-500")} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

