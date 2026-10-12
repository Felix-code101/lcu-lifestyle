import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import {
  getCurriculumTrackForDepartment,
  type ShortCourseLesson,
} from '../data/coursesData';
import { X, Check, Lock, Award } from 'lucide-react';

interface ShortCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortCoursesModal: React.FC<ShortCoursesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { stats, setStats, takeCourseLecture, addToast } = useGame();

  // Load completed lesson IDs from stats or localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    if (stats.completedLessonIds && stats.completedLessonIds.length > 0) {
      return stats.completedLessonIds;
    }
    try {
      const saved = localStorage.getItem(`lu_completed_lessons_${stats.matricNo || 'default'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep state synced with stats
  useEffect(() => {
    if (stats.completedLessonIds && stats.completedLessonIds.length > 0) {
      setCompletedLessonIds(stats.completedLessonIds);
    }
  }, [stats.completedLessonIds]);

  if (!isOpen) return null;

  const track = getCurriculumTrackForDepartment(stats.department);
  const lessons = track.lessons;

  // Determine current active unlocked lesson (first lesson not yet completed)
  const currentLessonIndex = lessons.findIndex((l) => !completedLessonIds.includes(l.id));
  const allCompleted = currentLessonIndex === -1;
  const currentLesson: ShortCourseLesson | undefined = !allCompleted
    ? lessons[currentLessonIndex]
    : undefined;

  const handleAttendLesson = () => {
    if (!currentLesson) return;

    if (stats.isLongVacation) {
      addToast(
        '🏖️ Annual Long Vacation Active! Lecture theatres are closed. Hustle holiday gigs, then resume next session.',
        'warning'
      );
      return;
    }

    if (stats.energy < currentLesson.energyCost) {
      addToast(
        `⚡ Low Energy! You need ${currentLesson.energyCost}⚡ energy to attend this lesson. Rest or eat in cafeteria first!`,
        'warning'
      );
      return;
    }

    const success = takeCourseLecture({
      id: currentLesson.id,
      code: currentLesson.code,
      title: currentLesson.title,
      facultyGroup: track.departmentKey as any,
      examPrepGain: currentLesson.examPrepGain,
      energyCost: currentLesson.energyCost,
      xpGain: currentLesson.xpGain,
      description: currentLesson.description,
    });

    if (success) {
      const nextCompleted = [...completedLessonIds, currentLesson.id];
      setCompletedLessonIds(nextCompleted);

      // Persist in stats & localStorage
      setStats((prev) => {
        const next = {
          ...prev,
          completedLessonIds: nextCompleted,
        };
        try {
          localStorage.setItem('lu_player_profile', JSON.stringify(next));
          localStorage.setItem(
            `lu_completed_lessons_${prev.matricNo || 'default'}`,
            JSON.stringify(nextCompleted)
          );
        } catch {
          // ignore
        }
        return next;
      });

      if (nextCompleted.length === lessons.length) {
        setTimeout(() => {
          addToast(
            `🎓 Outstanding! You completed all 5 lessons in ${track.careerTitle} and earned your official LCU Departmental Certificate! (+15% CGPA Boost)`,
            'success'
          );
        }, 300);
      }
    }
  };

  return (
    <div
      onClick={onClose}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs pointer-events-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col pointer-events-auto animate-in zoom-in-95 duration-150"
      >
        {/* Header with Close Button */}
        <div className="flex items-start justify-between gap-3 pb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
              {track.avatarIcon}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {track.careerTitle}
              </h2>
              <p className="text-slate-500 font-medium text-xs mt-0.5 leading-relaxed">
                {track.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Perk Pill Chips Beneath Header */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 pb-3">
          {track.perks.map((perk, i) => (
            <span
              key={i}
              className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1 rounded-full font-medium shadow-2xs"
            >
              {perk}
            </span>
          ))}
        </div>

        {/* Completion Perk Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 mb-4 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <span className="text-base shrink-0">🎓</span>
            <p className="font-medium leading-relaxed">
              <strong>Finish all 5 lessons:</strong> An official LCU Departmental Certificate on
              your student profile, +15% CGPA boost on exams, and unlocked career opportunities.
            </p>
          </div>
        </div>

        {/* Lesson List Section */}
        <div className="space-y-2.5 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="uppercase font-bold text-slate-400 text-xs tracking-wider">
              LESSONS
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {completedLessonIds.filter((id) => lessons.some((l) => l.id === id)).length} /{' '}
              {lessons.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isCurrent = !allCompleted && currentLessonIndex === idx;

              if (isCompleted) {
                return (
                  <div
                    key={lesson.id}
                    className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-emerald-500 text-white font-bold w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm truncate leading-tight">
                          {lesson.title}
                        </h4>
                        <p className="text-emerald-700 font-medium text-xs mt-0.5">
                          Completed ✅
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md shrink-0 border border-emerald-200">
                      {lesson.code}
                    </span>
                  </div>
                );
              }

              if (isCurrent) {
                return (
                  <div
                    key={lesson.id}
                    className="bg-blue-50/60 border border-blue-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-blue-600 text-white font-bold w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        {lesson.lessonNumber}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate leading-tight">
                          {lesson.title}
                        </h4>
                        <p className="text-blue-600 font-medium text-xs mt-0.5 flex items-center gap-1">
                          <span>Next: attend the class</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            (15 min · -{lesson.energyCost}⚡)
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md shrink-0 border border-blue-200">
                      {lesson.code}
                    </span>
                  </div>
                );
              }

              // Locked Lesson
              return (
                <div
                  key={lesson.id}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-3 opacity-60 transition-all select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-slate-100 text-slate-400 font-bold w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                      {lesson.lessonNumber}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-slate-400 text-sm truncate leading-tight">
                        {lesson.title}
                      </h4>
                      <p className="text-slate-400 font-medium text-xs mt-0.5 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>After the lesson before</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                    {lesson.code}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Sticky Action Button & Helper Note */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          {allCompleted ? (
            <div className="w-full bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2">
              <Award className="w-5 h-5 text-amber-300" />
              <span>All 5 Lessons Completed 🎓 (Certificate Earned)</span>
            </div>
          ) : (
            <button
              onClick={handleAttendLesson}
              disabled={stats.energy < (currentLesson?.energyCost || 10) || stats.isLongVacation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                Attend Lesson {currentLesson?.lessonNumber || 1} · {currentLesson?.durationMinutes || 15} min · -{currentLesson?.energyCost || 10} ⚡ Energy
              </span>
            </button>
          )}

          <p className="text-slate-400 text-xs text-center mt-2.5">
            Your student sits the lecture in the theatre; lecture notes and exam prep unlock upon
            completion.
          </p>
        </div>
      </div>
    </div>
  );
};
