import React, { useState } from 'react';
import { X, ChevronRight, Box, Bell, ChevronLeft, CheckCircle2, Sparkles, Heart, Eye, Camera, Compass, Navigation, Zap } from 'lucide-react';
import clsx from 'clsx';

interface WalkthroughOverlayProps {
  onComplete: () => void;
  onSetCameraPreset?: (preset: 'drone' | 'street' | 'zenith' | 'horizon') => void;
  onSelectTab?: (tab: 'directorio' | 'red' | 'academia' | 'servicios' | 'favoritos') => void;
}

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: '¡Bienvenido al Gemelo Digital de Los Mochis 3D!',
    subtitle: 'Navegación Inmersiva Completa',
    description: 'Sustituimos bocetos 2D estáticos por un gemelo digital 3D vivo de Los Mochis, Sinaloa. Arrastra para rotar la ciudad, usa la rueda para zoom e inclina para cambiar el ángulo orbital.',
    icon: <Box className="w-8 h-8 text-amber-400" />,
    preset: 'drone' as const,
    tab: 'directorio' as const,
    badge: 'Gemelo Digital 3D'
  },
  {
    id: 'nanite-rtx',
    title: 'Geometría Nanite & Trazado de Rayos RTX',
    subtitle: 'Precisión Arquitectónica Real',
    description: 'Impulsado por algoritmos estilo Unreal Engine 5 y Cesium. Disfruta de 1.85 millones de micro-polígonos en fachadas, persianas solares, oclusión ambiental RTAO y sombras suaves en tiempo real.',
    icon: <Sparkles className="w-8 h-8 text-sky-400" />,
    preset: 'horizon' as const,
    tab: 'directorio' as const,
    badge: 'Nanite & RTX'
  },
  {
    id: 'viewpoints',
    title: 'Perspectivas Ilimitadas (Dron, Peatón, Zenital)',
    subtitle: 'Vistas Dinámicas desde Cualquier Ángulo',
    description: 'Alterna al instante entre vista Dron Orbital, Peatón a Nivel de Calle, Aérea Zenital y Panorama 360°. Explora comercios y avenidas principales como Leyva, Valdez y Gabriel Leyva.',
    icon: <Camera className="w-8 h-8 text-emerald-400" />,
    preset: 'street' as const,
    tab: 'directorio' as const,
    badge: 'Perspectivas 360°'
  },
  {
    id: 'favorites-proximity',
    title: 'Directorio, Radio de Proximidad & Favoritos',
    subtitle: 'Acceso Rápido y Notificaciones Push',
    description: 'Ajusta el radio de búsqueda (1 km - 15 km), filtra comercios abiertos y guarda tus locales favoritos con un solo clic para consulta rápida en la nueva pestaña Favoritos.',
    icon: <Heart className="w-8 h-8 text-rose-400 fill-rose-500/20" />,
    preset: 'zenith' as const,
    tab: 'favoritos' as const,
    badge: 'Favoritos & Proximidad'
  },
  {
    id: 'ciudadania',
    title: 'Participación Ciudadana & Ciudad Inteligente',
    subtitle: 'Red Mochitense & Capacitación',
    description: 'Reporta fallas urbanas en tiempo real, consulta avisos del municipio y accede a cursos de inclusión digital para adultos mayores. ¡Aprovecha la plataforma digital de Los Mochis!',
    icon: <CheckCircle2 className="w-8 h-8 text-amber-400" />,
    preset: 'drone' as const,
    tab: 'red' as const,
    badge: 'Los Mochis Conectado'
  }
];

export default function WalkthroughOverlay({
  onComplete,
  onSetCameraPreset,
  onSelectTab,
}: WalkthroughOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      const nextStep = TOUR_STEPS[nextStepIndex];
      if (onSetCameraPreset && nextStep.preset) {
        onSetCameraPreset(nextStep.preset);
      }
      if (onSelectTab && nextStep.tab) {
        onSelectTab(nextStep.tab);
      }
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      const prevStep = TOUR_STEPS[prevStepIndex];
      if (onSetCameraPreset && prevStep.preset) {
        onSetCameraPreset(prevStep.preset);
      }
      if (onSelectTab && prevStep.tab) {
        onSelectTab(prevStep.tab);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
      {/* Backdrop overlay with blur */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md pointer-events-auto transition-opacity"
        onClick={onComplete}
      />

      {/* Main Guided Tour Card */}
      <div className="relative bg-slate-900/95 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 pointer-events-auto flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onComplete}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          title="Saltar Tour Guiado"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Header Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            Tour Guiado • Paso {currentStep + 1} de {TOUR_STEPS.length}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {step.badge}
          </span>
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-inner shrink-0">
            {step.icon}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {step.title}
            </h3>
            <p className="text-xs font-semibold text-amber-400/90 mt-0.5">
              {step.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-normal">
          {step.description}
        </div>

        {/* Step Progress Dots */}
        <div className="flex justify-center items-center gap-2 my-1">
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStep(i);
                if (onSetCameraPreset && s.preset) onSetCameraPreset(s.preset);
                if (onSelectTab && s.tab) onSelectTab(s.tab);
              }}
              className={clsx(
                "h-2 rounded-full transition-all duration-300",
                i === currentStep ? "bg-amber-400 w-8" : "bg-slate-800 hover:bg-slate-700 w-2"
              )}
              title={`Paso ${i + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Navigation Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={clsx(
              "px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition border",
              currentStep === 0
                ? "opacity-30 border-transparent text-slate-600 cursor-not-allowed"
                : "text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white border-slate-700"
            )}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onComplete}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 font-semibold transition"
            >
              Saltar
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              {currentStep < TOUR_STEPS.length - 1 ? (
                <>Siguiente <ChevronRight className="w-4 h-4" /></>
              ) : (
                '¡Comenzar Experiencia!'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
