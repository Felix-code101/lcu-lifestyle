import React from 'react';
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

  const xpPercent = Math.min(100, Math.round((stats.xp / stats.maxXp) * 100));
  const fitnessXpPercent = Math.min(
    100,
    Math.round((stats.fitnessXp / (stats.fitnessMaxXp || 50)) * 100)
  );

  // Determine time-of-day icon
  const getTimeIcon = () => {
    const h = stats.inGameHours;
    if (h >= 6 && h < 18) return <Sun className="w-4 h-4 text-amber-500" />;
    if (h >= 18 && h < 21) return <Sunset className="w-4 h-4 text-orange-500" />;
    return <Moon className="w-4 h-4 text-indigo-500" />;
  };

  const formattedHours = stats.inGameHours.toString().padStart(2, '0');
  const formattedMinutes = stats.inGameMinutes.toString().padStart(2, '0');

  // CGPA Class categorization
  // CGPA Class categorization
  const getCgpaClass = (cgpa: number | null) => {
    if (cgpa === null) return { label: 'Pending', color: 'text-slate-600 bg-slate-100 border-slate-300' };
    if (cgpa >= 4.5) return { label: '1st Class', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (cgpa >= 3.5) return { label: '2nd Class Upper', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (cgpa >= 2.4) return { label: '2nd Class Lower', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    if (cgpa >= 1.5) return { label: '3rd Class', color: 'text-orange-700 bg-orange-100 border-orange-300' };
    return { label: 'Pass / Retake', color: 'text-rose-700 bg-rose-100 border-rose-300' };
  };

  const cgpaClass = getCgpaClass(stats.cgpa);

  return (
    <header className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex flex-wrap items-center justify-between gap-2.5">
      {/* Left: Liids University Student Profile & Core Vitals (Cash, CGPA, Energy, Fitness, Mood) */}
      <div className="pointer-events-auto flex flex-wrap items-center gap-2">
        {/* Student ID Card */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-sm border border-emerald-400/40">
              LU
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white"></span>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 tracking-wide">
                {stats.academicLevel || `LU ${stats.currentLevel || 100}L`}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-semibold">
                {stats.matricNo}
              </span>
              {stats.hasWonSugElection && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                  👑 SUG President
                </span>
              )}
              {stats.spiritualTitle && stats.spiritualTitle !== 'Student' && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 font-bold">
                  {stats.spiritualTitle}
                </span>
              )}
            </div>
            {/* XP bar */}
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5 border border-slate-200">
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-sm text-xs font-black cursor-help"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Nepo Baby</span>
          </div>
        ) : (
          <div
            title="🎒 Lapo Hustler: ₦10,000 Micro-Loan Access, +50% Bonus Profit & XP on Small Chops & Gigs"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm text-xs font-black cursor-help"
          >
            <Backpack className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lapo Hustler</span>
          </div>
        )}

        {/* Disciplinary Suspension & Strikes Alert Badges */}
        {stats.isSuspended && (
          <button
            onClick={() => setIsTribunalModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-md animate-pulse text-xs font-bold border border-rose-400"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Suspended ({stats.suspensionDaysRemaining}d)</span>
          </button>
        )}

        {stats.disciplinaryStrikes > 0 && !stats.isSuspended && (
          <button
            onClick={() => setIsTribunalModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 shadow-sm text-xs font-bold"
          >
            <Scale className="w-3.5 h-3.5 text-rose-600" />
            <span>{stats.disciplinaryStrikes}/3 Strikes</span>
          </button>
        )}

        {/* Cash / Student Allowance */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
            <Coins className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Cash</span>
            <span className="text-xs font-extrabold text-amber-700 font-mono">
              ₦{stats.balance.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => addBalance(5000)}
            title="Claim Monthly Pocket Money (+₦5,000)"
            className="ml-0.5 p-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-transform active:scale-90"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* CGPA / Academic Knowledge Stat */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">CGPA</span>
              <span className={`text-[9px] px-1 py-0.1 rounded font-bold border ${cgpaClass.color}`}>
                {cgpaClass.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-blue-800 font-mono">
                {stats.cgpa !== null ? stats.cgpa.toFixed(2) : 'Pending'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">({stats.knowledge} KP)</span>
            </div>
          </div>
        </div>

        {/* Academic Session Calendar & Attendance Pill */}
        <div
          title={
            stats.isLongVacation
              ? 'Annual Long Vacation (July – October). Lecture rooms are closed. Holiday hustles active.'
              : `${stats.currentLevel || 100}L Semester ${stats.currentSemester || 1} (${stats.currentSemester === 2 ? 'April – June' : 'November – March'}). Complete 3 lectures/tutorials to unlock Semester Exam!`
          }
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold ${
              stats.isLongVacation
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}
          >
            {stats.isLongVacation ? '🏖️' : '📅'}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Calendar</span>
              <span
                className={`text-[9px] px-1 py-0.1 rounded font-bold border ${
                  stats.isLongVacation
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {stats.isLongVacation
                  ? 'Long Vac (Jul–Oct)'
                  : `${stats.currentLevel || 100}L · Sem ${stats.currentSemester || 1}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {stats.isLongVacation ? (
                <span className="text-[10px] font-semibold text-amber-700">Holiday Hustles Active</span>
              ) : (
                <span
                  className={`text-[10px] font-mono ${
                    (stats.classesAttended || 0) >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-600'
                  }`}
                >
                  Classes: {stats.classesAttended || 0}/3 {(stats.classesAttended || 0) >= 3 ? '✓ (Exam Ready)' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Energy / Stamina Stat */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Energy</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-extrabold font-mono ${
                  stats.energy < 25 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {stats.energy}%
              </span>
              <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
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
        </div>

        {/* Fitness Level & XP Stat */}
        <div
          title={`Fitness Level ${stats.fitnessLevel} (${stats.fitnessXp}/${stats.fitnessMaxXp} XP)\n• Trek am to gain +15 XP per trip\n• Leveling up boosts Max Energy!`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md cursor-help group"
        >
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200 group-hover:scale-110 transition-transform">
            <Flame className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Fitness</span>
              <span className="text-[10px] px-1 py-0.2 rounded font-extrabold bg-orange-100 text-orange-700 border border-orange-200 font-mono">
                Lvl {stats.fitnessLevel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${fitnessXpPercent}%` }}
                />
              </div>
              <span className="text-[9px] text-orange-800 font-mono font-medium">
                {stats.fitnessXp}/{stats.fitnessMaxXp}
              </span>
            </div>
          </div>
        </div>

        {/* Mood Stat */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md">
          <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 border border-pink-200">
            <Smile className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Mood</span>
            <span className="text-xs font-extrabold text-pink-700 font-mono">
              {stats.mood}%
            </span>
          </div>
        </div>

        {/* Spiritual Piety Stat */}
        {stats.piety > 0 && (
          <div
            title={`Spiritual Progression: ${stats.spiritualTitle} (Rank ${stats.spiritualRank}/3)\nPiety: ${stats.piety} Pts\n${
              stats.spiritualRank === 3
                ? 'Max Leadership Rank Unlocked!'
                : stats.spiritualRank === 2
                ? 'Next: Pastor / Alfa at 250 Piety'
                : 'Next: Choir/Usher/Mu\'adhin at 100 Piety'
            }`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md cursor-help"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Piety</span>
                <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  R{stats.spiritualRank}
                </span>
              </div>
              <span className="text-xs font-extrabold text-amber-700 font-mono">
                {stats.piety} Pts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right: In-Game University Clock & Time/Day HUD */}
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md">
          <div className="flex items-center gap-1.5">
            {getTimeIcon()}
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 tracking-widest">
              {formattedHours}:{formattedMinutes}
            </span>
          </div>
          <div className="h-3.5 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Day {stats.day}</span>
          </div>
          <button
            onClick={() => setDayNightCycle((prev) => !prev)}
            title={dayNightCycle ? 'Dynamic Sky: Active' : 'Static Lighting: Active'}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
              dayNightCycle
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            {dayNightCycle ? 'Auto' : 'Fixed'}
          </button>
        </div>

        {/* Small Orthographic Camera Reset Button */}
        <button
          onClick={triggerResetCamera}
          title="Reset Camera to Isometric Angle"
          className="p-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
