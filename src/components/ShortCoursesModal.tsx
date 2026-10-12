import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import {
  getCurriculumTrackForDepartment,
  type ShortCourseLesson,
} from '../data/coursesData';
import { X, Check, Lock, Award, ChevronLeft, ArrowRight, BookOpen, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundManager } from '../lib/soundManager';
import { supabase } from '../lib/supabase';

interface ShortCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FlowStep = 'overview' | 'notes' | 'quiz' | 'result';

export const ShortCoursesModal: React.FC<ShortCoursesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { stats, setStats, takeCourseLecture, spendBalance, addToast } = useGame();

  const [flowStep, setFlowStep] = useState<FlowStep>('overview');
  const [selectedLesson, setSelectedLesson] = useState<ShortCourseLesson | null>(null);

  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);

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

  // Daily limit check: 1 course per day
  const getTodayDateString = () => new Date().toISOString().slice(0, 10);
  const [lessonsCompletedToday, setLessonsCompletedToday] = useState<number>(() => {
    try {
      const savedDate = localStorage.getItem(`lu_last_lesson_date_${stats.matricNo || 'default'}`);
      const savedCount = localStorage.getItem(`lu_lessons_today_count_${stats.matricNo || 'default'}`);
      if (savedDate === getTodayDateString()) {
        return savedCount ? parseInt(savedCount, 10) : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });

  // Keep state synced with stats
  useEffect(() => {
    if (stats.completedLessonIds && stats.completedLessonIds.length > 0) {
      setCompletedLessonIds(stats.completedLessonIds);
    }
  }, [stats.completedLessonIds]);

  // Reset flow when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setFlowStep('overview');
      setSelectedLesson(null);
      setCurrentQIndex(0);
      setSelectedOptionIndex(null);
      setQuizScore(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const track = getCurriculumTrackForDepartment(stats.department);
  const lessons = track.lessons;

  // Determine current active unlocked lesson (first lesson not yet completed)
  const currentLessonIndex = lessons.findIndex((l) => !completedLessonIds.includes(l.id));
  const allCompleted = currentLessonIndex === -1;
  const nextUnlockedLesson: ShortCourseLesson | undefined = !allCompleted
    ? lessons[currentLessonIndex]
    : undefined;

  const activeLesson = selectedLesson || nextUnlockedLesson || lessons[0];
  const isDailyLimitReached = lessonsCompletedToday >= 1;

  // Handle Initiating Lesson & Paying ₦2,000 Compulsory Fee
  const handleStartLesson = async (lesson: ShortCourseLesson) => {
    if (isDailyLimitReached) {
      soundManager.playError();
      addToast("That's your 1 class for today. Come back tomorrow for more 📅", 'warning');
      return;
    }

    if (stats.isLongVacation) {
      soundManager.playError();
      addToast(
        '🏖️ Annual Long Vacation Active! Lecture theatres are closed. Hustle holiday gigs, then resume next session.',
        'warning'
      );
      return;
    }

    // Compulsory Fee Check: ₦2,000
    const compulsoryFee = 2000;
    if (stats.balance < compulsoryFee) {
      soundManager.playError();
      addToast(
        `❌ Insufficient funds! You need ₦${compulsoryFee.toLocaleString()} to register for this lesson. Top up your wallet or do gigs in your phone!`,
        'warning'
      );
      return;
    }

    if (stats.energy < lesson.energyCost) {
      soundManager.playError();
      addToast(
        `⚡ Low Energy! You need ${lesson.energyCost}⚡ energy to attend this lesson. Rest or eat in cafeteria first!`,
        'warning'
      );
      return;
    }

    // Call Supabase RPC to record starting departmental lesson
    try {
      if (supabase && stats.matricNo) {
        await supabase.rpc('start_department_lesson', {
          student_matric: stats.matricNo,
          lesson_id: lesson.id,
          fee_amount: compulsoryFee,
        });
      }
    } catch (err) {
      console.warn('Supabase start_department_lesson RPC fallback:', err);
    }

    // Deduct the ₦2,000 immediately from user cash balance
    if (!spendBalance(compulsoryFee)) {
      return;
    }

    soundManager.playMoney();
    setSelectedLesson(lesson);
    setFlowStep('notes');
  };

  // Begin Quiz
  const handleTakeQuiz = () => {
    setFlowStep('quiz');
    setCurrentQIndex(0);
    setSelectedOptionIndex(null);
    setQuizScore(0);
  };

  // Select Quiz Option
  const handleSelectOption = (optionIndex: number) => {
    if (selectedOptionIndex !== null) return; // Prevent changing after selection
    setSelectedOptionIndex(optionIndex);

    const currentQuiz = activeLesson.quiz[currentQIndex];
    const isCorrect = optionIndex === currentQuiz.correctIndex;

    if (isCorrect) {
      soundManager.playClick();
      setQuizScore((prev) => prev + 1);
    } else {
      soundManager.playError();
    }
  };

  // Next Question or Finish Quiz
  const handleNextQuestion = () => {
    if (currentQIndex < activeLesson.quiz.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      // Finished all 5 questions
      handleFinishQuiz();
    }
  };

  // Complete Quiz & Handle Celebration / Rewards
  const handleFinishQuiz = () => {
    setFlowStep('result');

    const finalScore = quizScore;
    const isPassed = finalScore >= 3;

    if (isPassed) {
      soundManager.playStudy();

      // Mark lesson as completed
      const nextCompleted = Array.from(new Set([...completedLessonIds, activeLesson.id]));
      setCompletedLessonIds(nextCompleted);

      // Record daily completion
      const today = getTodayDateString();
      setLessonsCompletedToday(1);
      try {
        localStorage.setItem(`lu_last_lesson_date_${stats.matricNo || 'default'}`, today);
        localStorage.setItem(`lu_lessons_today_count_${stats.matricNo || 'default'}`, '1');
      } catch {
        // ignore
      }

      // Grant lecture rewards
      takeCourseLecture({
        id: activeLesson.id,
        code: activeLesson.code,
        title: activeLesson.title,
        facultyGroup: track.departmentKey as any,
        examPrepGain: activeLesson.examPrepGain,
        energyCost: activeLesson.energyCost,
        xpGain: activeLesson.xpGain,
        description: activeLesson.description,
      });

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
        }, 500);
      }
    } else {
      soundManager.playError();
    }
  };

  // ==========================================================================
  // RENDER STEP 1: LESSON NOTES VIEW
  // ==========================================================================
  if (flowStep === 'notes' && activeLesson) {
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
          {/* Header with Back and Close */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              onClick={() => setFlowStep('overview')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Lessons</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lesson Header & Badge */}
          <div className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">
                LESSON {activeLesson.lessonNumber} OF 5
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {activeLesson.code}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {activeLesson.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {activeLesson.description}
            </p>
          </div>

          {/* Lesson Overview Notes Body */}
          <div className="space-y-3 py-2 flex-1">
            <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Lecture Study Notes
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed list-disc list-outside pl-4">
                {activeLesson.overviewNotes.map((note, idx) => (
                  <li key={idx} className="pl-1">
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Summary Tip Box */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Exam Preparation:</strong> Read these notes carefully. You will be asked{' '}
                <strong>5 questions</strong> tailored specifically to your department. Scoring at
                least 3 of 5 unlocks your lesson certification progress!
              </p>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="mt-auto pt-4 border-t border-slate-100">
            <button
              onClick={handleTakeQuiz}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Take the quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-slate-400 text-[11px] text-center mt-2">
              Must score at least 3 of 5 right to pass. No wahala if you miss: retry after cooldown.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER STEP 2: 5-QUESTION DEPARTMENT QUIZ
  // ==========================================================================
  if (flowStep === 'quiz' && activeLesson) {
    const currentQ = activeLesson.quiz[currentQIndex];
    const totalQ = activeLesson.quiz.length;
    const isSelected = selectedOptionIndex !== null;

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
          {/* Header & Question Counter */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                Question {currentQIndex + 1} of {totalQ}
              </span>
              <span className="text-xs font-mono font-medium text-slate-400">
                {activeLesson.code} Quiz
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / totalQ) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="py-4">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options (3 Options: A, B, C) */}
          <div className="space-y-2.5 flex-1 pb-3">
            {currentQ.options.map((option, idx) => {
              const isOptionSelected = selectedOptionIndex === idx;
              const isOptionCorrect = idx === currentQ.correctIndex;

              let cardStyle =
                'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-800';
              let radioStyle = 'border-slate-300 bg-white text-transparent';

              if (isSelected) {
                if (isOptionCorrect) {
                  cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
                  radioStyle = 'border-emerald-500 bg-emerald-500 text-white';
                } else if (isOptionSelected && !isOptionCorrect) {
                  cardStyle = 'bg-rose-50 border-rose-500 text-rose-950';
                  radioStyle = 'border-rose-500 bg-rose-500 text-white';
                } else {
                  cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isSelected}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${cardStyle}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${radioStyle}`}
                  >
                    {option.label}
                  </div>
                  <div className="flex-1 text-xs leading-relaxed">
                    <span className="font-semibold mr-1.5">{option.label}.</span>
                    <span>{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Instant Feedback Banner */}
          {isSelected && (
            <div
              className={`p-3.5 rounded-2xl mb-4 text-xs animate-in fade-in duration-200 border ${
                selectedOptionIndex === currentQ.correctIndex
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {selectedOptionIndex === currentQ.correctIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {selectedOptionIndex === currentQ.correctIndex
                      ? '✅ Correct!'
                      : '❌ Incorrect'}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Navigation */}
          <div className="mt-auto pt-3 border-t border-slate-100">
            <button
              onClick={handleNextQuestion}
              disabled={!isSelected}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                {currentQIndex < totalQ - 1 ? 'Next question' : 'See your result'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER STEP 3: RESULT CELEBRATION & PROGRESS UPDATE
  // ==========================================================================
  if (flowStep === 'result' && activeLesson) {
    const isPassed = quizScore >= 3;

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
          className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col text-center pointer-events-auto animate-in zoom-in-95 duration-150"
        >
          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Celebration / Status Icon */}
          <div className="flex justify-center pt-2 pb-3">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-md border ${
                isPassed
                  ? 'bg-amber-50 border-amber-200 animate-bounce'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              {isPassed ? '🎉' : '📚'}
            </div>
          </div>

          {/* Title & Score Summary */}
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isPassed ? 'Lesson Completed!' : 'Needs Review'}
          </h2>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            You scored <span className="text-blue-600 font-bold">{quizScore} of 5</span> right
          </p>

          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {isPassed
              ? `Congratulations! You successfully mastered ${activeLesson.title} in ${track.careerTitle}.`
              : 'You need at least 3 of 5 right to pass this module. Review the lesson notes and try again.'}
          </p>

          {/* Reward Badges (if passed) */}
          {isPassed && (
            <div className="flex items-center justify-center gap-2 flex-wrap py-4">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold shadow-2xs">
                +{activeLesson.examPrepGain}% Exam Prep
              </span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-3 py-1 rounded-full font-bold shadow-2xs">
                +{activeLesson.xpGain} XP
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1 rounded-full font-bold shadow-2xs flex items-center gap-1">
                <span>💡</span> Learnt Something New
              </span>
            </div>
          )}

          {/* Daily Limit Lock Banner */}
          {isPassed && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 font-medium mb-4">
              📅 That's your 1 class for today. Come back tomorrow for more 📅
            </div>
          )}

          {/* Bottom Action CTA */}
          <div className="mt-auto pt-3 border-t border-slate-100">
            {isPassed ? (
              <button
                onClick={() => setFlowStep('overview')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition active:scale-[0.99] cursor-pointer"
              >
                Back to Curriculum Overview
              </button>
            ) : (
              <button
                onClick={() => setFlowStep('notes')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition active:scale-[0.99] cursor-pointer"
              >
                Review Notes & Retry ➔
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER STEP 0: MAIN CURRICULUM OVERVIEW & LESSON LIST
  // ==========================================================================
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
                          <span>Next: Read lesson & take quiz</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            (₦2,000 fee · -{lesson.energyCost}⚡)
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
          ) : isDailyLimitReached ? (
            <div className="w-full bg-amber-50 border border-amber-300 text-amber-900 font-bold py-3.5 px-4 rounded-2xl shadow-xs text-center text-xs">
              That's your 1 class for today. Come back tomorrow for more 📅
            </div>
          ) : (
            <button
              onClick={() => nextUnlockedLesson && handleStartLesson(nextUnlockedLesson)}
              disabled={
                stats.energy < (nextUnlockedLesson?.energyCost || 10) ||
                stats.isLongVacation ||
                stats.balance < 2000
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                Read Lesson {nextUnlockedLesson?.lessonNumber || 1} & Take Quiz · ₦2,000
              </span>
            </button>
          )}

          <p className="text-slate-400 text-xs text-center mt-2.5">
            {isDailyLimitReached
              ? 'Daily course limit reached. Use campus library or cafeteria while waiting for tomorrow.'
              : '₦2,000 compulsory departmental registration fee deducted upon opening lesson notes.'}
          </p>
        </div>
      </div>
    </div>
  );
};
