import React from 'react';
import { Box, Sparkles, Building2, MapPin, Eye, Star } from 'lucide-react';

export function MapSkeleton() {
  return (
    <div className="w-full h-full min-h-[480px] bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between p-6">
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-shimmer pointer-events-none" />

      {/* Grid line pattern simulation */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header Controls Skeleton */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 animate-pulse flex items-center justify-center text-amber-500/40">
            <Box className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <div className="w-44 h-4 bg-slate-800 rounded-lg animate-pulse" />
            <div className="w-28 h-3 bg-slate-800/60 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-8 bg-slate-800 rounded-xl animate-pulse" />
          <div className="w-28 h-8 bg-slate-800/80 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Central Simulated 3D Building Nodes Skeleton */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-4 py-12 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-center animate-glow-pulse">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin duration-3000" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-ping" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-amber-300">Cargando Mapa 3D e Infraestructura Urbana...</h4>
          <p className="text-xs text-slate-400 mt-1">Generando capas de negocios digitalizados en Los Mochis</p>
        </div>
      </div>

      {/* Floating Node Markers Skeleton */}
      <div className="absolute top-1/4 left-1/5 w-16 h-8 bg-slate-900/90 border border-slate-700/80 rounded-full animate-bounce space-x-2 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-8 h-2 bg-slate-700 rounded" />
      </div>
      <div className="absolute bottom-1/3 right-1/4 w-20 h-8 bg-slate-900/90 border border-slate-700/80 rounded-full animate-pulse flex items-center justify-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-sky-400" />
        <div className="w-10 h-2 bg-slate-700 rounded" />
      </div>

      {/* Bottom Control Bar Skeleton */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-4">
        <div className="w-32 h-6 bg-slate-800/80 rounded-lg animate-pulse" />
        <div className="w-48 h-6 bg-slate-800/60 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export function BusinessCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col">
          {/* Image Placeholder */}
          <div className="h-44 bg-slate-200 relative">
            <div className="absolute top-3 left-3 w-20 h-6 bg-slate-300 rounded-lg" />
            <div className="absolute top-3 right-3 w-16 h-6 bg-slate-300 rounded-full" />
          </div>

          {/* Body Placeholder */}
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="w-3/4 h-5 bg-slate-200 rounded" />
                <div className="w-10 h-4 bg-slate-200 rounded" />
              </div>
              <div className="w-full h-3 bg-slate-200 rounded" />
              <div className="w-2/3 h-3 bg-slate-200 rounded" />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="w-24 h-4 bg-slate-200 rounded" />
              <div className="w-20 h-7 bg-slate-300 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
