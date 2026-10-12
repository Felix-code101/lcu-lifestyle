import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CAMPUS_LOCATIONS } from '../data/campusData';
import {
  MapPin,
  Sparkles,
  Zap,
  GraduationCap,
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
    resumeNextSession,
    setIsShortCoursesModalOpen,
    setIsStudentPortalModalOpen,
  } = useGame();

  // Collapsible Accordion / Minimize Toggle state
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Keep private room view (home_hostel) and campus map completely clean and unobstructed
  if (currentLocation === 'campus_map' || currentLocation === 'home_hostel') return null;

  const currentLocData = CAMPUS_LOCATIONS.find((l) => l.id === currentLocation);
  if (!currentLocData) return null;

  const nextLevelNumber =
    stats.currentLevel === 100 ? 200 : stats.currentLevel === 200 ? 300 : stats.currentLevel === 300 ? 400 : 400;
  const isFinalYear = stats.currentLevel >= 400;
  const classesAttended = stats.classesAttended || 0;
  const examPrep =
    stats.examPrep ?? Math.min(100, Math.round((classesAttended / 3) * 100));

  // =========================================================================
  // 1. Refined Light Academic Card (Lecture Theatre)
  // =========================================================================
  const renderAcademicCard = () => (
    <div className="flex flex-col text-slate-800 transition-all duration-300 ease-in-out">
      {/* Top Header Row (Always visible) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          {/* Badge: 🎓 LCU (light amber badge) */}
          <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
            🎓 LCU
          </span>
          <div className="min-w-0">
            {/* Title: [Department Name] */}
            <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">
              {stats.department || 'Mass Communication'}
            </h3>
            {/* Subtitle: 100L · Semester 1 · CGPA... */}
            <p className="text-slate-500 font-medium text-xs truncate">
              {stats.currentLevel || 100}L · Semester {stats.currentSemester || 1} · CGPA{' '}
              {stats.cgpa !== null ? stats.cgpa.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Top Right Controls: Map + Accordion Chevron Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('map')}
            title="Campus Map"
            className="p-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            Map
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand card' : 'Collapse card'}
            title={collapsed ? 'Expand card' : 'Collapse card'}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer flex items-center justify-center w-7 h-7"
          >
            <span className="text-sm font-bold block">{collapsed ? '⌄' : '⌃'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {!collapsed && (
        <div className="mt-2 space-y-3 transition-all duration-300 ease-in-out">
          {/* Exam Progress Indicator */}
          <div className="space-y-1.5">
            {/* Thin rounded progress bar with golden/yellow fill */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, examPrep))}%` }}
              />
            </div>

            {/* Status note */}
            <p className="text-slate-600 text-xs">
              {classesAttended >= 3 ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
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
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-900 truncate">
                    Clearance ready! You can now sit for the semester examination.
                  </p>
                  <p className="text-[10px] text-slate-500">Approved by Faculty Dean</p>
                </div>
              </div>
              <button
                onClick={startExamSession}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                Sit Exam ➔
              </button>
            </div>
          )}

          {/* Annual Long Vacation Holiday Banner */}
          {stats.isLongVacation && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5 text-amber-900">
              <div className="flex items-center gap-2">
                <span className="text-base">🏖️</span>
                <div>
                  <p className="text-xs font-bold text-amber-950 leading-tight">
                    Annual Long Vacation Active (July – October)
                  </p>
                  <p className="text-[10px] text-amber-800">
                    Lectures on break. Hustle holiday gigs, then resume next session.
                  </p>
                </div>
              </div>
              <button
                onClick={resumeNextSession}
                className="w-full py-1.5 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
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
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            {/* Left Button: 🖥️ Student portal */}
            <button
              onClick={() => setIsStudentPortalModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 rounded-xl py-2.5 px-3 text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span>🖥️</span>
              <span>Student portal</span>
            </button>

            {/* Right Button: 🎓 Short Courses */}
            <button
              onClick={() => setIsShortCoursesModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md rounded-xl py-2.5 px-3 text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span>🎓</span>
              <span>Short Courses</span>
            </button>
          </div>

          {/* Activity pill: Tutor 100L Students */}
          <div className="pt-0.5">
            <button
              disabled={stats.energy < 18}
              onClick={() => {
                const act = currentLocData.activities.find((a) => a.id === 'tutor_100l');
                if (act) performActivity(act);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">💼</span>
                <span className="font-semibold text-slate-900">Tutor 100L Students</span>
                <span className="text-[10px] text-amber-700 font-mono font-bold">+₦3,500</span>
              </div>
              <span className="text-[10px] text-rose-600 font-mono font-bold">-18⚡</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // =========================================================================
  // 2. Refined Light Container for Other Campus Locations
  // =========================================================================
  const renderLocationCard = () => (
    <div className="flex flex-col text-slate-800 transition-all duration-300 ease-in-out">
      {/* Banner Header (Always visible) */}
      <div className="p-3 sm:px-4 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide truncate">
                {currentLocData.name}
              </h3>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-blue-800 font-mono shrink-0">
                {currentLocData.tag}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
              {currentLocData.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('map')}
            title="Campus Map"
            className="p-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            Map
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand card' : 'Collapse card'}
            title={collapsed ? 'Expand card' : 'Collapse card'}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer flex items-center justify-center w-7 h-7"
          >
            <span className="text-sm font-bold block">{collapsed ? '⌄' : '⌃'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Body */}
      {!collapsed && (
        <div className="flex flex-col transition-all duration-300 ease-in-out">
          {/* Mosque Cultural Norm: Shoe Rack Prompt */}
          {currentLocation === 'mosque' && (
            <div className="px-3 py-2 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm">👞</span>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-bold text-blue-900 truncate">
                    {stats.removedShoes ? 'Shoes removed at rack' : 'Entrance: Remove Shoes'}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-blue-700 truncate">
                    {stats.removedShoes
                      ? 'Walking on clean prayer rugs'
                      : 'Place footwear on rack before stepping in'}
                  </p>
                </div>
              </div>
              {!stats.removedShoes ? (
                <button
                  onClick={removeShoes}
                  className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  Remove Shoes
                </button>
              ) : (
                <button
                  onClick={wearShoes}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-all shrink-0 border border-slate-200 cursor-pointer"
                >
                  Wear Shoes
                </button>
              )}
            </div>
          )}

          {/* Sermon / Khutbah Leadership Action Button for Chapel & Mosque */}
          {(currentLocation === 'chapel' || currentLocation === 'mosque') && (
            <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 shrink-0">
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
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] sm:text-xs font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
              >
                {currentLocation === 'chapel' ? 'Preach Sermon' : 'Deliver Khutbah'}
              </button>
            </div>
          )}

          {/* Activities List */}
          <div className="p-3 space-y-2 bg-slate-50/50 overflow-y-auto max-h-[48vh] sm:max-h-[300px]">
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
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
                  className="p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-[11px] sm:text-xs font-bold text-slate-900">
                        {act.title}
                      </h4>
                      {isDocLocked && (
                        <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Clearance Req.
                        </span>
                      )}
                      {act.isCoursework && (
                        <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          +1 Attended
                        </span>
                      )}
                      {act.isHolidayHustle && (
                        <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Hustle 💼
                        </span>
                      )}
                      {act.requiredRank && (
                        <span
                          className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-semibold ${
                            stats.spiritualRank >= act.requiredRank
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
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
                        <span className="text-blue-700 flex items-center gap-0.5 font-bold">
                          <Zap className="w-2.5 h-2.5" /> +{act.energyGain}⚡
                        </span>
                      )}
                      {act.cashCost > 0 && (
                        <span className="text-amber-800 flex items-center gap-0.5 font-bold">
                          <Coins className="w-2.5 h-2.5" /> -₦{act.cashCost.toLocaleString()}
                        </span>
                      )}
                      {act.cashGain && act.cashGain > 0 && (
                        <span className="text-blue-700 flex items-center gap-0.5 font-bold">
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
                    disabled={!canDo && !isDocLocked}
                    onClick={() => performActivity(act)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                      isDocLocked
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs active:scale-95'
                        : canDo
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xs active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
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
        </div>
      )}
    </div>
  );

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-slate-200 text-slate-800 transition-all duration-300 ease-in-out">
        {currentLocation === 'lecture_theatre'
          ? renderAcademicCard()
          : renderLocationCard()}
      </div>
    </div>
  );
};
