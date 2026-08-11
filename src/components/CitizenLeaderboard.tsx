import React, { useState } from 'react';
import { Award, Trophy, Medal, Star, Flame, ShieldCheck, CheckCircle2, Plus, Sparkles, TrendingUp, UserCheck } from 'lucide-react';
import clsx from 'clsx';

export interface CitizenCollaborator {
  id: string;
  name: string;
  points: number;
  reportsCount: number;
  tier: 'Guardián Urbano' | 'Embajador Mochitense' | 'Colaborador Oro' | 'Colaborador Plata' | 'Colaborador Bronce';
  avatar: string;
  recentActivity: string;
  isCurrentUser?: boolean;
}

export const INITIAL_CITIZEN_COLLABORATORS: CitizenCollaborator[] = [
  {
    id: 'col1',
    name: 'Ing. Carlos Zazueta',
    points: 1250,
    reportsCount: 18,
    tier: 'Guardián Urbano',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    recentActivity: 'Reporte de alumbrado verificado en Col. Jiquilpan'
  },
  {
    id: 'col2',
    name: 'Valeria Mendoza',
    points: 980,
    reportsCount: 14,
    tier: 'Embajador Mochitense',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    recentActivity: 'Reportó bacheo reparado en Blvd. Rosales'
  },
  {
    id: 'col3',
    name: 'Mateo Ruiz',
    points: 750,
    reportsCount: 11,
    tier: 'Colaborador Oro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    recentActivity: 'Reportó fuga de agua atendida por JAPAMA'
  },
  {
    id: 'col4',
    name: 'Dra. Sofía Castro',
    points: 520,
    reportsCount: 8,
    tier: 'Colaborador Plata',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    recentActivity: 'Solicitó poda preventiva en Parque Sinaloa'
  },
  {
    id: 'col5',
    name: 'Fernando Beltrán',
    points: 340,
    reportsCount: 5,
    tier: 'Colaborador Bronce',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    recentActivity: 'Reportó contenedor de basura lleno en Centro'
  }
];

interface CitizenLeaderboardProps {
  collaborators: CitizenCollaborator[];
  onOpenReportModal?: () => void;
  ecoMode?: boolean;
}

export default function CitizenLeaderboard({
  collaborators,
  onOpenReportModal,
  ecoMode
}: CitizenLeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'mes' | 'historico'>('mes');

  // Sort collaborators by points descending
  const sorted = [...collaborators].sort((a, b) => b.points - a.points);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const getTierBadge = (tier: CitizenCollaborator['tier']) => {
    switch (tier) {
      case 'Guardián Urbano':
        return { label: '🏆 Guardián Urbano', color: 'bg-amber-500 text-slate-950 font-black border-amber-400' };
      case 'Embajador Mochitense':
        return { label: '🥇 Embajador', color: 'bg-amber-100 text-amber-900 font-extrabold border-amber-300' };
      case 'Colaborador Oro':
        return { label: '🥈 Colaborador Oro', color: 'bg-slate-100 text-slate-800 font-bold border-slate-300' };
      case 'Colaborador Plata':
        return { label: '🥉 Colaborador Plata', color: 'bg-orange-100 text-orange-900 font-bold border-orange-300' };
      default:
        return { label: '🎗️ Bronce', color: 'bg-slate-100 text-slate-700 font-medium border-slate-200' };
    }
  };

  return (
    <div className={clsx(
      "w-full rounded-2xl border transition-all overflow-hidden p-4 sm:p-5 space-y-4",
      ecoMode
        ? "bg-slate-950 border-slate-800 text-white"
        : "bg-slate-900 border-amber-500/30 text-white shadow-xl shadow-amber-500/5"
    )}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Ranking Ciudadanos Colaboradores
              </h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Los Mochis
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gana puntos y medallas digitales por cada reporte verificado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 align-self-start sm:align-self-auto">
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Sumar Puntos (+50 pts)</span>
            </button>
          )}
        </div>
      </div>

      {/* Points Rules Banner */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-black font-mono">+50 pts</span>
          <span className="text-[10px] text-slate-400">Por crear reporte urbano</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-black font-mono">+100 pts</span>
          <span className="text-[10px] text-slate-400">Cuando municipio resuelve</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sky-400 font-black font-mono">🏆 Medalla</span>
          <span className="text-[10px] text-slate-400">Al llegar a 500 puntos</span>
        </div>
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-2 items-end">
          {/* #2 Place */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center space-y-1.5 flex flex-col items-center relative">
            <span className="absolute -top-2.5 bg-slate-800 text-slate-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700">
              🥈 #2
            </span>
            <img
              src={top3[1].avatar}
              alt={top3[1].name}
              className="w-11 h-11 rounded-full object-cover border-2 border-slate-400 mt-1 shadow-md"
            />
            <span className="font-extrabold text-xs text-white truncate max-w-full block">
              {top3[1].name}
            </span>
            <span className="text-amber-400 font-mono font-black text-xs block">
              {top3[1].points} pts
            </span>
            <span className="text-[9px] text-slate-400 block font-medium">
              {top3[1].reportsCount} reportes
            </span>
          </div>

          {/* #1 Place (Gold Crown) */}
          <div className="bg-gradient-to-b from-amber-500/20 via-slate-950 to-slate-950 border-2 border-amber-500 rounded-2xl p-3.5 text-center space-y-1.5 flex flex-col items-center relative shadow-lg shadow-amber-500/10 -translate-y-1">
            <span className="absolute -top-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400 flex items-center gap-1 shadow-md">
              👑 #1
            </span>
            <img
              src={top3[0].avatar}
              alt={top3[0].name}
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 mt-1 shadow-md"
            />
            <span className="font-black text-xs text-amber-200 truncate max-w-full block">
              {top3[0].name}
            </span>
            <span className="text-amber-400 font-mono font-black text-sm block">
              {top3[0].points} pts
            </span>
            <span className="text-[10px] text-amber-300/80 block font-bold">
              {top3[0].reportsCount} reportes
            </span>
          </div>

          {/* #3 Place */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center space-y-1.5 flex flex-col items-center relative">
            <span className="absolute -top-2.5 bg-slate-800 text-orange-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700">
              🥉 #3
            </span>
            <img
              src={top3[2].avatar}
              alt={top3[2].name}
              className="w-11 h-11 rounded-full object-cover border-2 border-orange-400 mt-1 shadow-md"
            />
            <span className="font-extrabold text-xs text-white truncate max-w-full block">
              {top3[2].name}
            </span>
            <span className="text-amber-400 font-mono font-black text-xs block">
              {top3[2].points} pts
            </span>
            <span className="text-[9px] text-slate-400 block font-medium">
              {top3[2].reportsCount} reportes
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard Table / Rest of Members */}
      <div className="space-y-2 pt-2">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Tabla de Posiciones Completa
        </h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {sorted.map((col, idx) => {
            const badge = getTierBadge(col.tier);
            return (
              <div
                key={col.id}
                className={clsx(
                  "p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs",
                  col.isCurrentUser
                    ? "bg-amber-500/15 border-amber-500/50 text-white"
                    : "bg-slate-950/80 border-slate-800 text-slate-200 hover:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-black text-slate-400 w-5 text-center shrink-0">
                    #{idx + 1}
                  </span>
                  <img
                    src={col.avatar}
                    alt={col.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white truncate text-xs block">
                        {col.name}
                      </span>
                      {col.isCurrentUser && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                          TÚ
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {col.recentActivity}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-right">
                  <div>
                    <span className="font-mono font-black text-amber-400 text-xs block">
                      {col.points} pts
                    </span>
                    <span className="text-[9px] text-slate-400 block font-medium">
                      {col.reportsCount} reportes
                    </span>
                  </div>
                  <span className={clsx("text-[9px] px-2 py-0.5 rounded-md border", badge.color)}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
