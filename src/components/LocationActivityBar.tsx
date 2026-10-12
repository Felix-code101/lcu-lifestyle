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
    setIsShortCoursesModalOpen,
    setIsStudentPortalModalOpen,
  } = useGame();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (currentLocation === 'campus_map') return null;

  const currentLocData = CAMPUS_LOCATIONS.find((l) => l.id === currentLocation);
  if (!currentLocData) return null;

  const nextLevelNumber =
    stats.currentLevel === 100 ? 200 : stats.currentLevel === 200 ? 300 : stats.currentLevel === 300 ? 400 : 400;
  const isFinalYear = stats.currentLevel >= 400;
  const classesAttended = stats.classesAttended || 0;
  const examPrep =
    stats.examPrep ?? Math.min(100, Math.round((classesAttended / 3) * 100));

  // =========================================================================
  // 1. Sleek Dark Blue Collegiate Academic Card (Lecture Theatre)
  // =========================================================================
  const renderAcademicCard = (isMobileModal: boolean) => (
    <div className="flex flex-col p-4 sm:p-5 space-y-3.5 text-white">
      {/* Card Header & Badges */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Top Left: Yellow pill chip with graduation cap icon: 🎓 LCU */}
          <span className="px-2.5 py-1 rounded-full bg-amber-300 text-slate-950 text-xs font-black tracking-wide flex items-center gap-1 shadow-xs shrink-0">
            <span>🎓</span>
            <span>LCU</span>
          </span>
          <div className="min-w-0">
            {/* Active user's registered department in white bold text */}
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate leading-tight">
              {stats.department || 'Computer Science'}
            </h3>
            {/* Subtitle: 100L · Semester 1 · CGPA 0.00 */}
            <p className="text-xs text-blue-200 font-medium mt-0.5">
              {stats.currentLevel || 100}L · Semester {stats.currentSemester || 1} · CGPA{' '}
              {stats.cgpa !== null ? stats.cgpa.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('map')}
            title="Open Campus Map"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Map</span>
          </button>
          {isMobileModal ? (
            <button
              onClick={() => setIsExpanded(false)}
              title="Close Panel"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Exam Progress Indicator */}
      <div className="space-y-1.5 pt-0.5">
        {/* Thin rounded progress bar with a subtle golden/yellow fill */}
        <div className="w-full bg-blue-950/90 rounded-full h-2 overflow-hidden border border-blue-700/60 shadow-inner">
          <div
            className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${Math.min(100, Math.max(0, examPrep))}%` }}
          />
        </div>

        {/* Status text beneath: Exam prep [X]% · classes [attended]/3 · Attend [3 - attended] more lectures or tutorials first 📝 */}
        <p className="text-[11px] sm:text-xs text-blue-200 font-medium leading-relaxed">
          {classesAttended >= 3 ? (
            <span className="text-emerald-300 font-semibold flex items-center gap-1">
              Exam prep {examPrep}% · classes 3/3 · Clearance ready! You can now sit for the semester examination. 🎓
            </span>
          ) : (
            <span>
              Exam prep {examPrep}% · classes {classesAttended}/3 · Attend {3 - classesAttended} more lecture
              {3 - classesAttended > 1 ? 's' : ''} or tutorial
              {3 - classesAttended > 1 ? 's' : ''} first 📝
            </span>
          )}
        </p>
      </div>

      {/* Clearance Ready Direct Examination Trigger Banner */}
      {classesAttended >= 3 && !stats.isLongVacation && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/40 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-200 truncate">
                Clearance ready! You can now sit for the semester examination.
              </p>
              <p className="text-[10px] text-white/80">Approved by Faculty Dean</p>
            </div>
          </div>
          <button
            onClick={startExamSession}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            Sit Exam ➔
          </button>
        </div>
      )}

      {/* Annual Long Vacation Holiday Banner */}
      {stats.isLongVacation && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🏖️</span>
            <div>
              <p className="text-xs font-bold text-amber-200 leading-tight">
                Annual Long Vacation Active (July – October)
              </p>
              <p className="text-[10px] text-blue-200">
                Lectures on break. Hustle holiday gigs, then resume next session.
              </p>
            </div>
          </div>
          <button
            onClick={resumeNextSession}
            className="w-full py-1.5 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
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

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* Left Button: 🖥️ Student portal */}
        <button
          onClick={() => setIsStudentPortalModalOpen(true)}
          className="bg-white/10 hover:bg-white/20 text-white rounded-2xl py-2.5 px-3 sm:px-4 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer border border-white/10"
        >
          <span>🖥️</span>
          <span>Student portal</span>
        </button>

        {/* Right Button: 🎓 Short Courses */}
        <button
          onClick={() => setIsShortCoursesModalOpen(true)}
          className="bg-amber-300 hover:bg-amber-400 text-slate-900 rounded-2xl py-2.5 px-3 sm:px-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span>🎓</span>
          <span>Short Courses</span>
        </button>
      </div>

      {/* Departmental Tutoring Hustle Gig */}
      <div className="pt-0.5">
        <button
          disabled={stats.energy < 18}
          onClick={() => {
            const act = currentLocData.activities.find((a) => a.id === 'tutor_100l');
            if (act) performActivity(act);
          }}
          className="w-full py-2 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-200 hover:text-white text-xs flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">💼</span>
            <span className="font-semibold text-white">Tutor 100L Students</span>
            <span className="text-[10px] text-amber-300 font-mono">+₦3,500</span>
          </div>
          <span className="text-[10px] text-rose-300 font-mono">-18⚡</span>
        </button>
      </div>
    </div>
  );

  // =========================================================================
  // 2. Sleek Dark Collegiate Container for Other Campus Locations
  // =========================================================================
  const renderLocationCard = (isMobileModal: boolean) => (
    <div className="flex flex-col max-h-[75vh] sm:max-h-none overflow-hidden text-white">
      {/* Banner Header */}
      <div className="p-3 sm:px-4 sm:py-3.5 bg-blue-950/60 border-b border-blue-500/20 flex items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                {currentLocation === 'home_hostel'
                  ? (stats.gender === 'female' ? "Queen's Hall (Female Wing)" : "Emerald Hall (Male Wing)")
                  : currentLocData.name}
              </h3>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-400/30 text-amber-300 font-mono shrink-0">
                {currentLocation === 'home_hostel'
                  ? (stats.gender === 'female' ? 'Female Wing' : 'Male Wing')
                  : currentLocData.tag}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-blue-200 font-medium truncate">
              {currentLocation === 'home_hostel'
                ? stats.gender === 'female'
                  ? "Queen's Hall • Female Wing • Room 108"
                  : 'Emerald Hall • Male Wing • Room 204'
                : currentLocData.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('map')}
            title="Open Campus Map"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-blue-200 hover:text-white text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Map</span>
          </button>
          {isMobileModal ? (
            <button
              onClick={() => setIsExpanded(false)}
              title="Close Panel"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors cursor-pointer"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mosque Cultural Norm: Shoe Rack Prompt */}
      {currentLocation === 'mosque' && (
        <div className="px-3 py-2 bg-blue-900/40 border-b border-blue-500/20 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm">👞</span>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-white truncate">
                {stats.removedShoes ? 'Shoes removed at rack' : 'Entrance: Remove Shoes'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-blue-200 truncate">
                {stats.removedShoes
                  ? 'Walking on clean prayer rugs'
                  : 'Place footwear on rack before stepping in'}
              </p>
            </div>
          </div>
          {!stats.removedShoes ? (
            <button
              onClick={removeShoes}
              className="px-2.5 py-1 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-950 text-[11px] font-bold shadow-xs transition-all shrink-0 cursor-pointer"
            >
              Remove Shoes
            </button>
          ) : (
            <button
              onClick={wearShoes}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 text-[10px] font-semibold transition-all shrink-0 border border-white/10 cursor-pointer"
            >
              Wear Shoes
            </button>
          )}
        </div>
      )}

      {/* Sermon / Khutbah Leadership Action Button for Chapel & Mosque */}
      {(currentLocation === 'chapel' || currentLocation === 'mosque') && (
        <div className="px-3 py-2 bg-amber-500/15 border-b border-amber-400/20 flex items-center justify-between gap-2 shrink-0">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {currentLocation === 'chapel' ? 'Sunday Chapel Pulpit' : 'Friday Minbar Khutbah'}
            </p>
            <p className="text-[9px] sm:text-[10px] text-blue-200">
              {currentLocation === 'chapel'
                ? 'Lead service & preach sermon'
                : "Address the Jama'ah with sermon"}
            </p>
          </div>
          <button
            onClick={() => setIsSermonModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            {currentLocation === 'chapel' ? 'Preach Sermon' : 'Deliver Khutbah'}
          </button>
        </div>
      )}

      {/* Activities List */}
      {(isExpanded || isMobileModal) && (
        <div className="p-3 space-y-2 bg-blue-950/30 overflow-y-auto max-h-[50vh] sm:max-h-[320px]">
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-300 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Available Activities ({currentLocData.activities.length})</span>
          </div>

          {currentLocData.activities.map((act) => {
            const isLockedByRank = act.requiredRank ? stats.spiritualRank < act.requiredRank : false;
            const isExamLocked = act.isExam ? (stats.isLongVacation || (stats.classesAttended || 0) < 3) : false;
            const hasEnergy = act.energyCost === 0 || stats.energy >= act.energyCost;
            const hasCash = act.cashCost === 0 || stats.balance >= act.cashCost;
            const isDocLocked =
              stats.isRegistered &&
              !stats.documentation_completed &&
              act.id !== 'drink_water' &&
              act.id !== 'quick_nap';
            const canDo = !isLockedByRank && !isExamLocked && hasEnergy && hasCash && !isDocLocked;

            return (
              <div
                key={act.id}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-[11px] sm:text-xs font-bold text-white">
                      {act.title}
                    </h4>
                    {isDocLocked && (
                      <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Clearance Req.
                      </span>
                    )}
                    {act.isCoursework && (
                      <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-blue-400/20 text-blue-200 border border-blue-400/30">
                        +1 Attended
                      </span>
                    )}
                    {act.isHolidayHustle && (
                      <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Hustle 💼
                      </span>
                    )}
                    {act.requiredRank && (
                      <span
                        className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-semibold ${
                          stats.spiritualRank >= act.requiredRank
                            ? 'bg-blue-400/20 text-blue-200 border border-blue-400/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        Rank {act.requiredRank}+
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-blue-200/80 line-clamp-1">{act.description}</p>
                  {/* Cost & reward badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[9px] sm:text-[10px] font-mono">
                    {act.energyCost > 0 && (
                      <span className="text-rose-300 flex items-center gap-0.5 font-bold">
                        <Zap className="w-2.5 h-2.5" /> -{act.energyCost}⚡
                      </span>
                    )}
                    {act.energyGain && act.energyGain > 0 && (
                      <span className="text-emerald-300 flex items-center gap-0.5 font-bold">
                        <Zap className="w-2.5 h-2.5" /> +{act.energyGain}⚡
                      </span>
                    )}
                    {act.cashCost > 0 && (
                      <span className="text-rose-300 flex items-center gap-0.5 font-bold">
                        <Coins className="w-2.5 h-2.5" /> -₦{act.cashCost.toLocaleString()}
                      </span>
                    )}
                    {act.cashGain && act.cashGain > 0 && (
                      <span className="text-amber-300 flex items-center gap-0.5 font-bold">
                        <Coins className="w-2.5 h-2.5" /> +₦{act.cashGain.toLocaleString()}
                      </span>
                    )}
                    {act.pietyGain && act.pietyGain > 0 && (
                      <span className="text-amber-300 flex items-center gap-0.5 font-bold">
                        <Sparkles className="w-2.5 h-2.5" /> +{act.pietyGain} Piety
                      </span>
                    )}
                    {act.cgpaGain > 0 && (
                      <span className="text-blue-300 flex items-center gap-0.5 font-bold">
                        <GraduationCap className="w-2.5 h-2.5" /> +{act.cgpaGain} CGPA
                      </span>
                    )}
                    {act.moodGain > 0 && (
                      <span className="text-pink-300 flex items-center gap-0.5 font-bold">
                        <Smile className="w-2.5 h-2.5" /> +{act.moodGain}%
                      </span>
                    )}
                  </div>
                </div>

                <button
                  disabled={!canDo && !isDocLocked}
                  onClick={() => performActivity(act)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    isDocLocked
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs active:scale-95'
                      : canDo
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs active:scale-95'
                      : 'bg-white/5 text-slate-400 cursor-not-allowed border border-white/10'
                  }`}
                >
                  {isDocLocked
                    ? 'Clearance Req.'
                    : isExamLocked
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
      {/* 1. DESKTOP VIEW: Sleek Dark Blue Collegiate Academic Card Docked on Right */}
      {/* ========================================================================= */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="hidden sm:block fixed top-24 right-4 z-20 pointer-events-auto w-80 lg:w-96 animate-in slide-in-from-right duration-200"
      >
        <div className="rounded-3xl bg-gradient-to-b from-[#0b1739] via-[#0d225c] to-[#0a1538] border border-blue-400/30 shadow-2xl overflow-hidden text-white backdrop-blur-xl">
          {currentLocation === 'lecture_theatre'
            ? renderAcademicCard(false)
            : renderLocationCard(false)}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE VIEW: Center View Collegiate Modal with Backdrop Dimming        */}
      {/* ========================================================================= */}
      {isExpanded ? (
        <div
          onClick={() => setIsExpanded(false)}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 pb-24 sm:hidden pointer-events-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0b1739] via-[#0d225c] to-[#0a1538] border border-blue-400/30 shadow-2xl overflow-hidden flex flex-col max-h-[82vh] text-white animate-in zoom-in-95 duration-150"
          >
            {currentLocation === 'lecture_theatre'
              ? renderAcademicCard(true)
              : renderLocationCard(true)}
          </div>
        </div>
      ) : (
        /* Minimized Mobile Action Pill Docked above Bottom Nav */
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30 sm:hidden pointer-events-auto"
        >
          <button
            onClick={() => setIsExpanded(true)}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="px-4 py-2 rounded-full bg-[#0b1739]/95 backdrop-blur-md border border-blue-400/40 shadow-xl text-xs font-bold text-white flex items-center gap-2 active:scale-95 transition-transform cursor-pointer"
          >
            {currentLocation === 'lecture_theatre' ? (
              <>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black">
                  🎓 LCU
                </span>
                <span className="truncate max-w-[130px]">{stats.department || 'Academic Card'}</span>
                <span className="font-mono text-amber-300">({classesAttended}/3)</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{currentLocData.name} ({currentLocData.activities.length} Actions)</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};
