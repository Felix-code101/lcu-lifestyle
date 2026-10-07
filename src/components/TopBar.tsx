import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Coins,
  Clock,
  Sun,
  Moon,
  Sunset,
  RotateCcw,
  Plus,
  GraduationCap,
  Zap,
  Smile,
  Sparkles,
  Flame,
  Scale,
  ShieldAlert,
  Crown,
  Backpack,
  SlidersHorizontal,
  Home,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    stats,
    addBalance,
    triggerResetCamera,
    dayNightCycle,
    setDayNightCycle,
    setIsTribunalModalOpen,
  } = useGame();

  const [showMobileStats, setShowMobileStats] = useState<boolean>(true);

  const xpPercent = Math.min(100, Math.round((stats.xp / stats.maxXp) * 100));
  const fitnessXpPercent = Math.min(
    100,
    Math.round((stats.fitnessXp / (stats.fitnessMaxXp || 50)) * 100)
  );

  // Determine time-of-day icon
  const getTimeIcon = () => {
    const h = stats.inGameHours;
    if (h >= 6 && h < 18) return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    if (h >= 18 && h < 21) return <Sunset className="w-3.5 h-3.5 text-orange-500" />;
    return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
  };

  const formattedHours = stats.inGameHours.toString().padStart(2, '0');
  const formattedMinutes = stats.inGameMinutes.toString().padStart(2, '0');

  // CGPA Class categorization
  const getCgpaClass = (cgpa: number | null) => {
    if (cgpa === null) return { label: 'Pending', color: 'text-slate-600 bg-slate-100 border-slate-300' };
    if (cgpa >= 4.5) return { label: '1st Class', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (cgpa >= 3.5) return { label: '2nd Upper', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (cgpa >= 2.4) return { label: '2nd Lower', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    if (cgpa >= 1.5) return { label: '3rd Class', color: 'text-orange-700 bg-orange-100 border-orange-300' };
    return { label: 'Pass / Retake', color: 'text-rose-700 bg-rose-100 border-rose-300' };
  };

  const cgpaClass = getCgpaClass(stats.cgpa);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP BAR (Fixed, top: 0, z-index: 30) - Student Header & Cash Pill     */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="w-full px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Student Identity Pill (Level, Matric No, Status) */}
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Student ID Avatar & Academic Level */}
            <div className="flex items-center gap-2 px-2 sm:px-2.5 py-1 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs shrink-0">
              <div className="relative">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-[11px] sm:text-xs shadow-xs border border-emerald-400/40">
                  LU
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <span className="w-0.5 h-0.5 rounded-full bg-white"></span>
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-900 tracking-wide truncate max-w-[80px] sm:max-w-none">
                    {stats.academicLevel || `LU ${stats.currentLevel || 100}L`}
                  </span>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-semibold">
                    {stats.matricNo}
                  </span>
                </div>
                {/* XP mini bar */}
                <div className="w-16 sm:w-20 h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Socioeconomic Status Badge (Nepo Baby vs Lapo Hustler) */}
            {stats.status === 'nepo' ? (
              <div
                title="👑 Nepo Baby: ₦250k Starting Allowance, High Mood, -50% Energy Drain on all activities"
                className="flex items-center gap-1 px-2 py-1 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-xs text-[10px] sm:text-xs font-black shrink-0"
              >
                <Crown className="w-3 h-3 text-amber-500" />
                <span className="hidden xs:inline">Nepo Baby</span>
                <span className="xs:hidden">Nepo</span>
              </div>
            ) : (
              <div
                title="🎒 Lapo Hustler: ₦10,000 Micro-Loan Access, +50% Bonus Profit & XP on Small Chops & Gigs"
                className="flex items-center gap-1 px-2 py-1 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-xs text-[10px] sm:text-xs font-black shrink-0"
              >
                <Backpack className="w-3 h-3 text-emerald-600" />
                <span className="hidden xs:inline">Lapo Hustler</span>
                <span className="xs:hidden">Lapo</span>
              </div>
            )}

            {/* Disciplinary Strikes / Suspension Alert (if active) */}
            {stats.isSuspended && (
              <button
                onClick={() => setIsTribunalModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-xs animate-pulse text-[10px] font-bold shrink-0"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Suspended</span>
              </button>
            )}

            {stats.disciplinaryStrikes > 0 && !stats.isSuspended && (
              <button
                onClick={() => setIsTribunalModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold shrink-0"
              >
                <Scale className="w-3 h-3 text-rose-600" />
                <span>{stats.disciplinaryStrikes}/3</span>
              </button>
            )}
          </div>

          {/* Right: Cash Pill, Mobile Stats Toggle & Reset Camera */}
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cash Pill */}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200 shrink-0">
                <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider hidden sm:block">Cash</span>
                <span className="text-[11px] sm:text-xs font-extrabold text-amber-700 font-mono">
                  ₦{stats.balance.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => addBalance(5000)}
                title="Claim Monthly Pocket Money (+₦5,000)"
                className="ml-0.5 p-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 transition-transform active:scale-90"
              >
                <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            </div>

            {/* Mobile Stats Rail Toggle Button */}
            <button
              onClick={() => setShowMobileStats((prev) => !prev)}
              title={showMobileStats ? 'Hide Vitals Drawer' : 'Show Vitals Drawer'}
              className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all active:scale-95 cursor-pointer ${
                showMobileStats
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Reset Camera Button */}
            <button
              onClick={triggerResetCamera}
              title="Reset Camera to Isometric Angle"
              className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. STATS ROW (Fixed, z-index: 20) - Compact Single Flex Row & Group Badges */}
      {/* ========================================================================= */}
      {showMobileStats && (
        <div className="fixed top-[46px] sm:top-[52px] left-0 right-0 z-20 pointer-events-none transition-all duration-200">
          <div className="w-full pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 overflow-x-auto no-scrollbar bg-slate-50/95 sm:bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-xs text-slate-800">
            {/* Energy / Stamina Stat Pill */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0">
              <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0">
                <Zap className="w-3 h-3" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 hidden sm:inline">Energy</span>
                <span
                  className={`text-[11px] font-extrabold font-mono ${
                    stats.energy < 25 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {stats.energy}%
                </span>
                <div className="w-10 sm:w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      stats.energy < 25
                        ? 'bg-rose-500'
                        : stats.energy < 50
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${stats.energy}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Fitness Level & XP Stat Pill */}
            <div
              title={`Fitness Level ${stats.fitnessLevel} (${stats.fitnessXp}/${stats.fitnessMaxXp} XP)`}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0"
            >
              <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200 shrink-0">
                <Flame className="w-3 h-3" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-orange-700 font-mono">
                  Lvl {stats.fitnessLevel}
                </span>
                <div className="w-8 sm:w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                    style={{ width: `${fitnessXpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* In-Game University Clock & Day Widget */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0">
              <div className="flex items-center gap-1">
                {getTimeIcon()}
                <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-800 tracking-wide">
                  {formattedHours}:{formattedMinutes}
                </span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Day {stats.day}</span>
              </div>
              <button
                onClick={() => setDayNightCycle((prev) => !prev)}
                title={dayNightCycle ? 'Dynamic Sky: Active' : 'Static Lighting: Active'}
                className={`px-1 py-0.2 rounded text-[9px] font-mono border transition-colors cursor-pointer ${
                  dayNightCycle
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                {dayNightCycle ? 'Auto' : 'Fixed'}
              </button>
            </div>

            {/* CGPA / Knowledge Pill */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0">
              <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shrink-0">
                <GraduationCap className="w-3 h-3" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline">CGPA</span>
                <span className="text-[11px] font-extrabold text-blue-800 font-mono">
                  {stats.cgpa !== null ? stats.cgpa.toFixed(2) : 'Pending'}
                </span>
                <span className={`text-[9px] px-1 py-0.1 rounded font-bold border ${cgpaClass.color}`}>
                  {cgpaClass.label}
                </span>
              </div>
            </div>

            {/* Academic Session Calendar & Attendance Pill */}
            <div
              title={
                stats.isLongVacation
                  ? 'Annual Long Vacation (July – October). Lecture rooms are closed. Holiday hustles active.'
                  : `${stats.currentLevel || 100}L Semester ${stats.currentSemester || 1}. Complete 3 lectures/tutorials to unlock Semester Exam!`
              }
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0"
            >
              <span className="text-xs">
                {stats.isLongVacation ? '🏖️' : '📅'}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-bold border ${
                    stats.isLongVacation
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {stats.isLongVacation
                    ? 'Long Vac (Jul–Oct)'
                    : `${stats.currentLevel || 100}L · Sem ${stats.currentSemester || 1}`}
                </span>
                {!stats.isLongVacation && (
                  <span
                    className={`text-[9px] sm:text-[10px] font-mono ${
                      (stats.classesAttended || 0) >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-600'
                    }`}
                  >
                    ({stats.classesAttended || 0}/3)
                  </span>
                )}
              </div>
            </div>

            {/* Room Assignment Badge */}
            <div
              title="Assigned Student Dormitory: Emerald Hall Room 204"
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0 text-slate-700"
            >
              <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[10px] font-bold tracking-tight">Room 204</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold hidden sm:inline">
                Emerald Hall
              </span>
            </div>

            {/* Mood Stat */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0">
              <Smile className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span className="text-[10px] font-extrabold text-pink-700 font-mono">
                {stats.mood}%
              </span>
            </div>

            {/* Spiritual Piety Stat (if > 0) */}
            {stats.piety > 0 && (
              <div
                title={`Spiritual Progression: ${stats.spiritualTitle} (Rank ${stats.spiritualRank}/3)`}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[10px] font-extrabold text-amber-700 font-mono">
                  {stats.piety} Pts
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  R{stats.spiritualRank}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
