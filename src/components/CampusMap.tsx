import React from 'react';
import { useGame } from '../context/GameContext';
import { CAMPUS_LOCATIONS } from '../data/campusData';
import type { GameLocation } from '../types/game';
import {
  Building2,
  UtensilsCrossed,
  BookOpen,
  GraduationCap,
  Trophy,
  Zap,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
  Home,
  CheckCircle2,
} from 'lucide-react';

export const CampusMap: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { currentLocation, navigateToLocation, stats } = useGame();

  const getLocationIcon = (id: GameLocation) => {
    switch (id) {
      case 'home_hostel':
        return <Home className="w-5 h-5 text-emerald-600" />;
      case 'lecture_theatre':
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'cafeteria':
        return <UtensilsCrossed className="w-5 h-5 text-amber-600" />;
      case 'library':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'sports_arena':
        return <Trophy className="w-5 h-5 text-pink-600" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleTravel = (id: GameLocation) => {
    navigateToLocation(id);
    if (onClose) onClose();
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto p-4 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-2xl text-slate-800 animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 border border-emerald-500">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-wide">
                Liids University (LU) Campus Map
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                Ibadan Campus
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive navigation guide • Select a department or facility to travel
            </p>
          </div>
        </div>

        {/* Current Student Travel Readiness HUD */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500">Energy:</span>
            <span
              className={`font-bold ${
                stats.energy < 20 ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {stats.energy} / {stats.maxEnergy}⚡
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700">
              {stats.inGameHours.toString().padStart(2, '0')}:
              {stats.inGameMinutes.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Stylized Visual Campus Blueprint Diagram */}
      <div className="relative mb-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 p-5 overflow-hidden">
        {/* Liids University Landmark Waypoints Map Layout */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CAMPUS_LOCATIONS.map((loc) => {
            const isCurrent = currentLocation === loc.id;
            const canAfford = stats.energy >= loc.energyCost;

            return (
              <div
                key={loc.id}
                onClick={() => !isCurrent && canAfford && handleTravel(loc.id)}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : canAfford
                    ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                    : 'bg-slate-100/60 border-slate-200/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  {/* Top Bar with Icon and Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shadow-xs">
                        {getLocationIcon(loc.id)}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {loc.tag}
                      </span>
                    </div>

                    {isCurrent ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Here Now
                      </span>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                        <span className="flex items-center gap-0.5 text-amber-600">
                          <Zap className="w-3 h-3" /> -{loc.energyCost}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> {loc.travelMinutes}m
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {loc.name}
                  </h3>
                  <div className="text-[11px] text-emerald-700 font-medium mb-1.5">
                    {loc.subtitle}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {loc.description}
                  </p>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {loc.activities.length} Activities available
                  </div>

                  {isCurrent ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onClose) onClose();
                      }}
                      className="px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-semibold hover:bg-emerald-200 transition-colors"
                    >
                      View Space
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canAfford) handleTravel(loc.id);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:scale-95'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <span>{canAfford ? 'Travel Here' : 'Low Energy'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* University Campus Overview Note */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>
            Tip: Visiting the <strong className="text-slate-800">Cafeteria</strong> or sleeping in your <strong className="text-slate-800">Hostel</strong> restores student energy.
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-colors"
          >
            Close Map
          </button>
        )}
      </div>
    </div>
  );
};
