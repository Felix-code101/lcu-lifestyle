import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CAMPUS_LOCATIONS } from '../data/campusData';
import {
  MapPin,
  Sparkles,
  Zap,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Map,
  Smile,
  Coins,
} from 'lucide-react';

export const LocationActivityBar: React.FC = () => {
  const {
    currentLocation,
    performActivity,
    stats,
    setActiveTab,
    removeShoes,
    wearShoes,
    setIsSermonModalOpen,
    startExamSession,
  } = useGame();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (currentLocation === 'campus_map') return null;

  const currentLocData = CAMPUS_LOCATIONS.find((l) => l.id === currentLocation);
  if (!currentLocData) return null;

  return (
    <div className="absolute top-20 left-4 z-30 pointer-events-auto max-w-sm sm:max-w-md animate-in slide-in-from-left duration-200">
      <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Banner Header */}
        <div className="p-3 sm:px-4 sm:py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide">
                  {currentLocData.name}
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                  {currentLocData.tag}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">
                {currentLocData.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('map')}
              title="Open Campus Map"
              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1 transition-all"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-semibold">Map</span>
            </button>
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Mosque Cultural Norm: Shoe Rack Prompt */}
        {currentLocation === 'mosque' && (
          <div className="px-3.5 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">👞</span>
              <div>
                <p className="text-[11px] font-bold text-emerald-900">
                  {stats.removedShoes ? 'Shoes removed at entrance rack' : 'Entrance Norm: Remove Shoes'}
                </p>
                <p className="text-[10px] text-emerald-700">
                  {stats.removedShoes
                    ? 'Walking clean on prayer carpets'
                    : 'Place footwear on rack before stepping on prayer rugs'}
                </p>
              </div>
            </div>
            {!stats.removedShoes ? (
              <button
                onClick={removeShoes}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all shrink-0"
              >
                Remove Shoes
              </button>
            ) : (
              <button
                onClick={wearShoes}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-semibold transition-all shrink-0 border border-emerald-300"
              >
                Wear Shoes
              </button>
            )}
          </div>
        )}

        {/* Sermon / Khutbah Leadership Action Button for Chapel & Mosque */}
        {(currentLocation === 'chapel' || currentLocation === 'mosque') && (
          <div className="px-3.5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                {currentLocation === 'chapel' ? 'Sunday Chapel Pulpit' : "Friday Minbar Khutbah"}
              </p>
              <p className="text-[10px] text-slate-500">
                {currentLocation === 'chapel'
                  ? 'Lead the service, preach sermon & bless congregation'
                  : "Address the Jama'ah with inspiring spiritual advice"}
              </p>
            </div>
            <button
              onClick={() => setIsSermonModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all shrink-0"
            >
              {currentLocation === 'chapel' ? 'Preach Sermon' : 'Deliver Khutbah'}
            </button>
          </div>
        )}

        {/* Lecture Theatre: Semester Exam Hall Trigger */}
        {currentLocation === 'lecture_theatre' && (
          <div className="px-3.5 py-2.5 bg-blue-50 border-b border-blue-200 flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                Semester Examination Hall
              </p>
              <p className="text-[10px] text-slate-500">
                Sit for SEN 302 exam (Write legitimately or sneak expo cheat notes)
              </p>
            </div>
            <button
              onClick={startExamSession}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all shrink-0 active:scale-95"
            >
              Take Exam
            </button>
          </div>
        )}

        {/* Activities List */}
        {isExpanded && (
          <div className="p-3 sm:p-3.5 space-y-2 bg-slate-50/70 max-h-[260px] overflow-y-auto">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Available Campus Activities</span>
            </div>

            {currentLocData.activities.map((act) => {
              const isLockedByRank = act.requiredRank ? stats.spiritualRank < act.requiredRank : false;
              const hasEnergy = act.energyCost === 0 || stats.energy >= act.energyCost;
              const hasCash = act.cashCost === 0 || stats.balance >= act.cashCost;
              const canDo = !isLockedByRank && hasEnergy && hasCash;

              return (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900">
                        {act.title}
                      </h4>
                      {act.requiredRank && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          stats.spiritualRank >= act.requiredRank
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          Rank {act.requiredRank}+
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{act.description}</p>
                    {/* Cost & reward badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                      {act.energyCost > 0 && (
                        <span className="text-amber-700 flex items-center gap-0.5 font-bold">
                          <Zap className="w-2.5 h-2.5" /> -{act.energyCost}⚡
                        </span>
                      )}
                      {act.energyGain && act.energyGain > 0 && (
                        <span className="text-emerald-700 flex items-center gap-0.5 font-bold">
                          <Zap className="w-2.5 h-2.5" /> +{act.energyGain}⚡
                        </span>
                      )}
                      {act.cashCost > 0 && (
                        <span className="text-amber-800 flex items-center gap-0.5 font-bold">
                          <Coins className="w-2.5 h-2.5" /> -₦{act.cashCost.toLocaleString()}
                        </span>
                      )}
                      {act.cashGain && act.cashGain > 0 && (
                        <span className="text-emerald-700 flex items-center gap-0.5 font-bold">
                          <Coins className="w-2.5 h-2.5" /> +₦{act.cashGain.toLocaleString()}
                        </span>
                      )}
                      {act.pietyGain && act.pietyGain > 0 && (
                        <span className="text-amber-800 flex items-center gap-0.5 font-bold">
                          <Sparkles className="w-2.5 h-2.5" /> +{act.pietyGain} Piety
                        </span>
                      )}
                      {act.cgpaGain > 0 && (
                        <span className="text-blue-700 flex items-center gap-0.5 font-bold">
                          <GraduationCap className="w-2.5 h-2.5" /> +{act.cgpaGain} CGPA
                        </span>
                      )}
                      {act.moodGain > 0 && (
                        <span className="text-pink-700 flex items-center gap-0.5 font-bold">
                          <Smile className="w-2.5 h-2.5" /> +{act.moodGain}%
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={!canDo}
                    onClick={() => performActivity(act)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      canDo
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    {isLockedByRank ? 'Rank Lock' : !hasEnergy ? 'Need ⚡' : !hasCash ? 'Need ₦' : 'Start'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
