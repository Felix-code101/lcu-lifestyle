import React from 'react';
import { useGame } from '../context/GameContext';
import {
  getCoursesForDepartment,
  type ShortCourse,
} from '../data/coursesData';
import {
  GraduationCap,
  X,
  Zap,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Microscope,
  Award,
} from 'lucide-react';

interface ShortCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortCoursesModal: React.FC<ShortCoursesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { stats, takeCourseLecture, startExamSession } = useGame();

  if (!isOpen) return null;

  const { departmentalCourses, generalElectives, categoryTitle } =
    getCoursesForDepartment(stats.department);

  const classesAttended = stats.classesAttended || 0;
  const examPrep =
    stats.examPrep ?? Math.min(100, Math.round((classesAttended / 3) * 100));

  const handleTakeCourse = (course: ShortCourse) => {
    takeCourseLecture(course);
  };

  const handleStartExam = () => {
    onClose();
    startExamSession();
  };

  return (
    <div
      onClick={onClose}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#0a1945] via-[#0d225c] to-[#0a1945] border border-blue-500/40 shadow-2xl overflow-hidden text-white pointer-events-auto animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-blue-500/20 bg-blue-950/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  🎓 LCU Curriculum
                </span>
                <span className="text-xs font-mono text-blue-200">
                  {stats.academicLevel || `${stats.currentLevel || 100} Level`}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate mt-0.5">
                Departmental Short Courses & Micro-Lectures
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Academic Progress Bar & Clearance Status */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-blue-950/40 border-b border-blue-500/20 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-blue-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 font-bold">Exam Preparation:</span>
              <span className="font-mono text-white text-sm">{examPrep}%</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-amber-200">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {stats.energy}⚡ Energy
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg font-bold font-mono ${
                  classesAttended >= 3
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                }`}
              >
                Attendance: {classesAttended}/3 Classes
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-blue-950/80 rounded-full h-2.5 overflow-hidden border border-blue-800/60">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, examPrep))}%` }}
            />
          </div>

          {/* Clearance Announcement Banner */}
          {classesAttended >= 3 ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/25 via-emerald-500/20 to-amber-500/25 border border-amber-400/40 flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0 animate-pulse" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-amber-200 leading-tight">
                    Clearance ready! You can now sit for the semester examination.
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-white/80">
                    3 of 3 coursework requirements approved by the Faculty Dean.
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartExam}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                Sit Exam ➔
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-blue-200 flex items-center gap-1.5">
              <span>📝</span>
              <span>
                Attend {3 - classesAttended} more lecture
                {3 - classesAttended > 1 ? 's' : ''} or tutorial
                {3 - classesAttended > 1 ? 's' : ''} to unlock official Semester Examination clearance!
              </span>
            </p>
          )}
        </div>

        {/* Scrollable Course Cards Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 1: Departmental Core Courses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Departmental Core ({categoryTitle})</span>
              </h3>
              <span className="text-[10px] text-blue-300 font-mono">
                {departmentalCourses.length} Courses Available
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {departmentalCourses.map((course) => {
                const hasEnergy = stats.energy >= course.energyCost;

                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-blue-400/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono font-bold text-[11px]">
                          {course.code}
                        </span>
                        {course.isPractical && (
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-400/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold flex items-center gap-1">
                            <Microscope className="w-3 h-3" />
                            Practical Lab
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {course.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-blue-200/90 leading-relaxed line-clamp-2">
                        {course.description}
                      </p>

                      {/* Micro-Chips for Rewards & Energy Costs */}
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-[10px] font-mono">
                        <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          +{course.examPrepGain}% Exam Prep
                        </span>
                        <span className="text-rose-300 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 flex items-center gap-0.5">
                          <Zap className="w-3 h-3 text-rose-400" />
                          -{course.energyCost}⚡ Energy
                        </span>
                        {course.xpGain && (
                          <span className="text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 flex items-center gap-0.5">
                            <Award className="w-3 h-3 text-purple-400" />
                            +{course.xpGain} XP
                          </span>
                        )}
                        <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          +1 Class Attended
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={!hasEnergy}
                      onClick={() => handleTakeCourse(course)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                        hasEnergy
                          ? 'bg-amber-300 hover:bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      {hasEnergy ? (
                        <>
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{course.isPractical ? 'Take Practical' : 'Take Lecture'}</span>
                        </>
                      ) : (
                        <span>Need ⚡ Energy</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: University General Electives (GST) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>University General Electives (GST)</span>
              </h3>
              <span className="text-[10px] text-blue-300 font-mono">Cross-Departmental</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {generalElectives.map((course) => {
                const hasEnergy = stats.energy >= course.energyCost;

                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-blue-400/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-blue-400/20 text-blue-300 border border-blue-400/30 font-mono font-bold text-[11px]">
                          {course.code}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {course.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-blue-200/90 leading-relaxed line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap pt-1 text-[10px] font-mono">
                        <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          +{course.examPrepGain}% Exam Prep
                        </span>
                        <span className="text-rose-300 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 flex items-center gap-0.5">
                          <Zap className="w-3 h-3 text-rose-400" />
                          -{course.energyCost}⚡ Energy
                        </span>
                        {course.xpGain && (
                          <span className="text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 flex items-center gap-0.5">
                            <Award className="w-3 h-3 text-purple-400" />
                            +{course.xpGain} XP
                          </span>
                        )}
                        <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          +1 Class Attended
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={!hasEnergy}
                      onClick={() => handleTakeCourse(course)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                        hasEnergy
                          ? 'bg-blue-500 hover:bg-blue-400 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      {hasEnergy ? (
                        <>
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Take Lecture</span>
                        </>
                      ) : (
                        <span>Need ⚡ Energy</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-blue-950/70 border-t border-blue-500/20 flex items-center justify-between text-xs text-blue-200">
          <span>
            Registered: <strong className="text-white">{stats.department}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
