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
  X,
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
    resumeNextSession,
  } = useGame();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (currentLocation === 'campus_map') return null;

  const currentLocData = CAMPUS_LOCATIONS.find((l) => l.id === currentLocation);
  if (!currentLocData) return null;

  const nextLevelNumber =
    stats.currentLevel === 100 ? 200 : stats.currentLevel === 200 ? 300 : stats.currentLevel === 300 ? 400 : 400;
  const isFinalYear = stats.currentLevel >= 400;

  // Render Inner Content for both Desktop Dock & Mobile Modal
  const renderCardContent = (isMobileModal: boolean) => (
    <div className="flex flex-col max-h-[75vh] sm:max-h-none overflow-hidden">
      {/* Banner Header */}
      <div className="p-2.5 sm:px-4 sm:py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide truncate">
                {currentLocData.name}
              </h3>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono shrink-0">
                {currentLocData.tag}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium truncate">
              {currentLocData.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('map')}
            title="Open Campus Map"
            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Map</span>
          </button>
          {isMobileModal ? (
            <button
              onClick={() => setIsExpanded(false)}
              title="Close Panel"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Annual Long Vacation Holiday Banner */}
      {stats.isLongVacation && (
        <div className="p-2.5 sm:p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 space-y-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base">🏖️</span>
            <div>
              <p className="text-[11px] sm:text-xs font-black text-amber-950">
                Annual Long Vacation Active (July – October)
              </p>
              <p className="text-[10px] sm:text-[11px] text-amber-800 leading-tight">
                Lectures are on break. Hustle holiday gigs, then resume next session.
              </p>
            </div>
          </div>
          <button
            onClick={resumeNextSession}
            className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-[11px] sm:text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>
              {isFinalYear
                ? 'Matriculate to Convocation (October)'
                : `Resume Academic Session · Enter ${nextLevelNumber}L`}
            </span>
          </button>
        </div>
      )}

      {/* Mosque Cultural Norm: Shoe Rack Prompt */}
      {currentLocation === 'mosque' && (
        <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm">👞</span>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-emerald-900 truncate">
                {stats.removedShoes ? 'Shoes removed at rack' : 'Entrance: Remove Shoes'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-emerald-700 truncate">
                {stats.removedShoes
                  ? 'Walking on clean prayer rugs'
                  : 'Place footwear on rack before stepping in'}
              </p>
            </div>
          </div>
          {!stats.removedShoes ? (
            <button
              onClick={removeShoes}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              Remove Shoes
            </button>
          ) : (
            <button
              onClick={wearShoes}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-semibold transition-all shrink-0 border border-emerald-300 cursor-pointer"
            >
              Wear Shoes
            </button>
          )}
        </div>
      )}

      {/* Sermon / Khutbah Leadership Action Button for Chapel & Mosque */}
      {(currentLocation === 'chapel' || currentLocation === 'mosque') && (
        <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 shrink-0">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {currentLocation === 'chapel' ? 'Sunday Chapel Pulpit' : 'Friday Minbar Khutbah'}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-500">
              {currentLocation === 'chapel'
                ? 'Lead service & preach sermon'
                : "Address the Jama'ah with sermon"}
            </p>
          </div>
          <button
            onClick={() => setIsSermonModalOpen(true)}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[11px] sm:text-xs font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            {currentLocation === 'chapel' ? 'Preach Sermon' : 'Deliver Khutbah'}
          </button>
        </div>
      )}

      {/* Lecture Theatre: Semester Exam Hall Trigger */}
      {currentLocation === 'lecture_theatre' && (
        <div className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-blue-50 border-b border-blue-200 flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <p className="text-[10px] sm:text-[11px] font-bold text-blue-900">
                Semester Exam Hall
              </p>
              {stats.isLongVacation ? (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                  Closed
                </span>
              ) : (stats.classesAttended || 0) >= 3 ? (
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Cleared ✓
                </span>
              ) : (
                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                  Locked ({stats.classesAttended || 0}/3)
                </span>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">
              {stats.isLongVacation
                ? 'Halls closed during break.'
                : (stats.classesAttended || 0) >= 3
                ? 'Cleared for exams! Sit for paper.'
                : `Need 3 classes attended (${stats.classesAttended || 0}/3).`}
            </p>
          </div>
          <button
            disabled={stats.isLongVacation || (stats.classesAttended || 0) < 3}
            onClick={startExamSession}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-2xs transition-all shrink-0 active:scale-95 cursor-pointer ${
              !stats.isLongVacation && (stats.classesAttended || 0) >= 3
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            {stats.isLongVacation
              ? 'On Break'
              : (stats.classesAttended || 0) >= 3
              ? 'Take Exam'
              : `Need 3 (${stats.classesAttended || 0}/3)`}
          </button>
        </div>
      )}

      {/* Activities List (Scrollable container with compact padding) */}
      {(isExpanded || isMobileModal) && (
        <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2 bg-slate-50/70 overflow-y-auto max-h-[50vh] sm:max-h-[320px]">
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Available Activities ({currentLocData.activities.length})</span>
          </div>

          {currentLocData.activities.map((act) => {
            const isLockedByRank = act.requiredRank ? stats.spiritualRank < act.requiredRank : false;
            const isExamLocked = act.isExam ? (stats.isLongVacation || (stats.classesAttended || 0) < 3) : false;
            const hasEnergy = act.energyCost === 0 || stats.energy >= act.energyCost;
            const hasCash = act.cashCost === 0 || stats.balance >= act.cashCost;
            const canDo = !isLockedByRank && !isExamLocked && hasEnergy && hasCash;

            return (
              <div
                key={act.id}
                className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-[11px] sm:text-xs font-bold text-slate-900">
                      {act.title}
                    </h4>
                    {act.isCoursework && (
                      <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        +1 Attended
                      </span>
                    )}
                    {act.isHolidayHustle && (
                      <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Hustle 💼
                      </span>
                    )}
                    {act.isExam && (
                      <span
                        className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold border ${
                          stats.isLongVacation
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : (stats.classesAttended || 0) >= 3
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}
                      >
                        {stats.isLongVacation
                          ? 'Vacation'
                          : (stats.classesAttended || 0) >= 3
                          ? 'Ready ✓'
                          : `Locked (${stats.classesAttended || 0}/3)`}
                      </span>
                    )}
                    {act.requiredRank && (
                      <span
                        className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-semibold ${
                          stats.spiritualRank >= act.requiredRank
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}
                      >
                        Rank {act.requiredRank}+
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">{act.description}</p>
                  {/* Cost & reward badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[9px] sm:text-[10px] font-mono">
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
                  className={`shrink-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    canDo
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs active:scale-95'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {isExamLocked
                    ? stats.isLongVacation
                      ? 'On Vacation'
                      : 'Need 3 Classes'
                    : isLockedByRank
                    ? 'Rank Lock'
                    : !hasEnergy
                    ? 'Need ⚡'
                    : !hasCash
                    ? 'Need ₦'
                    : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW: Cleanly docked card on Top-Right (z-20, no collision)   */}
      {/* ========================================================================= */}
      <div className="hidden sm:block fixed top-24 right-4 z-20 pointer-events-auto w-80 lg:w-96 animate-in slide-in-from-right duration-200">
        <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl overflow-hidden">
          {renderCardContent(false)}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW: Center View Active Action Modal with Backdrop Dimming    */}
      {/* ========================================================================= */}
      {isExpanded ? (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 pb-24 sm:hidden pointer-events-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white/98 backdrop-blur-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[78vh] animate-in zoom-in-95 duration-150"
          >
            {renderCardContent(true)}
          </div>
        </div>
      ) : (
        /* Minimized Mobile Action Pill Docked above Bottom Nav */
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 sm:hidden pointer-events-auto">
          <button
            onClick={() => setIsExpanded(true)}
            className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentLocData.name} ({currentLocData.activities.length} Actions)</span>
          </button>
        </div>
      )}
    </>
  );
};
