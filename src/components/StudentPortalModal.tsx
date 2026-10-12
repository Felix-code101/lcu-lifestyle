import React from 'react';
import { useGame } from '../context/GameContext';
import { getFacultyForDepartment } from '../data/departmentsData';
import {
  GraduationCap,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface StudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { stats, setIsShortCoursesModalOpen } = useGame();

  if (!isOpen) return null;

  const faculty = getFacultyForDepartment(stats.department);
  const classesAttended = stats.classesAttended || 0;
  const examPrep =
    stats.examPrep ?? Math.min(100, Math.round((classesAttended / 3) * 100));

  const isCleared = classesAttended >= 3;

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
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#0b1b4f] via-[#0d225c] to-[#0a1740] border border-blue-400/30 shadow-2xl overflow-hidden text-white pointer-events-auto animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-blue-500/20 bg-blue-950/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xl shrink-0">
              🏛️
            </div>
            <div className="min-w-0">
              <span className="px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                LCU Student Information Portal
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Academic Clearance & Records
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Digital Student Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-tr from-blue-950/90 to-indigo-900/60 border border-blue-400/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-md">
                  👨‍🎓
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {stats.username || 'Student Scholar'}
                  </h3>
                  <p className="text-xs text-amber-300 font-mono font-semibold">
                    {stats.matricNo || 'LU/24/0981'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-blue-300 block uppercase tracking-wider">
                  Status
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Enrolled
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/25 rounded-xl p-2.5">
                <span className="text-[10px] text-blue-300 block">Department</span>
                <span className="font-bold text-white truncate block">
                  {stats.department || 'Computer Science'}
                </span>
              </div>
              <div className="bg-black/25 rounded-xl p-2.5">
                <span className="text-[10px] text-blue-300 block">Faculty</span>
                <span className="font-bold text-white truncate block">
                  {faculty || 'Computing & IT'}
                </span>
              </div>
              <div className="bg-black/25 rounded-xl p-2.5">
                <span className="text-[10px] text-blue-300 block">Academic Level</span>
                <span className="font-bold text-amber-300">
                  {stats.academicLevel || `${stats.currentLevel || 100} Level`}
                </span>
              </div>
              <div className="bg-black/25 rounded-xl p-2.5">
                <span className="text-[10px] text-blue-300 block">Active Semester</span>
                <span className="font-bold text-white">
                  Semester {stats.currentSemester || 1}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Standing & CGPA */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[9px] uppercase tracking-wider text-blue-300 block">
                Cumulative CGPA
              </span>
              <span className="text-lg font-black text-amber-300 font-mono">
                {stats.cgpa !== null ? stats.cgpa.toFixed(2) : '0.00'}
              </span>
              <span className="text-[9px] text-blue-200 block">
                {stats.cgpa === null ? 'Pending 1st Exam' : 'Official Grade'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[9px] uppercase tracking-wider text-blue-300 block">
                Exam Preparation
              </span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {examPrep}%
              </span>
              <span className="text-[9px] text-blue-200 block">Syllabus Covered</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[9px] uppercase tracking-wider text-blue-300 block">
                Course Attendance
              </span>
              <span
                className={`text-lg font-black font-mono ${
                  isCleared ? 'text-emerald-300' : 'text-blue-200'
                }`}
              >
                {classesAttended}/3
              </span>
              <span className="text-[9px] text-blue-200 block">
                {isCleared ? 'Cleared ✓' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Examination Clearance Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
              isCleared
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
                : 'bg-amber-500/15 border-amber-400/30 text-amber-200'
            }`}
          >
            {isCleared ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight">
                {isCleared
                  ? 'Examination Clearance Approved for Semester Hall'
                  : `Pending Course Clearance: ${3 - classesAttended} More Lecture(s) Required`}
              </p>
              <p className="text-[11px] opacity-80 leading-snug">
                {isCleared
                  ? 'Candidate is officially permitted into the semester assessment hall.'
                  : 'Attend departmental short courses or faculty lectures to secure clearance.'}
              </p>
            </div>
          </div>

          {/* Official Registry Notice */}
          <div className="p-3 rounded-2xl bg-black/20 border border-white/5 space-y-1 text-xs text-blue-200">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>University Examination Regulations</span>
            </div>
            <p className="text-[11px] text-blue-300 leading-relaxed">
              Examination malpractice carries severe penalties including CGPA deductions and disciplinary tribunal referral. Maintain standard academic integrity across all assessments.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-blue-950/70 border-t border-blue-500/20 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-blue-300 font-mono">
            Liids University Academic Portal v2.4
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                setIsShortCoursesModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 hover:text-white border border-blue-400/40 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Short Courses</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm"
            >
              Close Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
