import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  FileText,
  Scale,
  AlertTriangle,
  Eye,
  CheckCircle,
  X,
  Zap,
  GraduationCap,
  Gavel,
  Sparkles,
} from 'lucide-react';

export const ExamTribunalModal: React.FC = () => {
  const {
    stats,
    isExamModalOpen,
    setIsExamModalOpen,
    isTribunalModalOpen,
    setIsTribunalModalOpen,
    submitExamLegitimate,
    sneakExpoCheat,
    submitTribunalDefense,
  } = useGame();

  const [examResult, setExamResult] = useState<{
    score: number;
    grade: string;
    cgpaChange: number;
  } | null>(null);

  const [tribunalVerdict, setTribunalVerdict] = useState<{
    verdict: 'guilty' | 'probation' | 'acquitted';
    penaltyDesc: string;
  } | null>(null);

  const isModalOpen = isExamModalOpen || isTribunalModalOpen;
  if (!isModalOpen) return null;

  const isTribunal = isTribunalModalOpen;

  const handleLegitimateSubmit = () => {
    const res = submitExamLegitimate();
    setExamResult(res);
  };

  const handleSneakExpo = () => {
    sneakExpoCheat();
  };

  const handleDefenseSubmit = (strategy: 'innocent' | 'confess' | 'blame_roommate' | 'medical_exemption') => {
    const res = submitTribunalDefense(strategy);
    setTribunalVerdict(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/30 backdrop-blur-xs pointer-events-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:px-6 sm:py-5 flex items-center justify-between bg-slate-50 border-b border-slate-200 text-slate-900">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${
              isTribunal ? 'bg-rose-100 border-rose-300 text-rose-600' : 'bg-blue-100 border-blue-300 text-blue-600'
            }`}>
              {isTribunal ? <Scale className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  {isTribunal
                    ? 'LU Examination Malpractice & Disciplinary Tribunal'
                    : 'Semester Final Examination Session'}
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    isTribunal ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {isTribunal ? 'Hearing In Session' : 'Exam Hall 04'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isTribunal
                  ? 'Presided over by Dean of Student Affairs, HOD, and Chief Security Officer'
                  : 'Faculty of Basic & Applied Sciences • 2 Hours Duration'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsExamModalOpen(false);
              setIsTribunalModalOpen(false);
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {!isTribunal ? (
            /* --- EXAM SESSION VIEW --- */
            <>
              {/* Exam Hall Context */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Course Assessment
                    </h3>
                    <p className="text-sm font-black text-slate-900">
                      SEN 302: Software Engineering Quality Assurance & Testing
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400">Candidate Matric No</p>
                    <p className="text-xs font-mono font-bold text-slate-800">{stats.matricNo}</p>
                  </div>
                </div>

                {/* Invigilator Alertness Meter */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Eye className="w-4 h-4 text-slate-500" />
                      Invigilator Alertness & Vigilance
                    </span>
                    <span
                      className={`font-mono ${
                        stats.invigilatorAlertness >= 70
                          ? 'text-rose-600'
                          : stats.invigilatorAlertness >= 40
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {stats.invigilatorAlertness}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        stats.invigilatorAlertness >= 70
                          ? 'bg-rose-600'
                          : stats.invigilatorAlertness >= 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${stats.invigilatorAlertness}%` }}
                    />
                  </div>
                  {stats.invigilatorAlertness >= 65 && (
                    <p className="text-[10px] text-rose-600 font-semibold animate-pulse">
                      ⚠️ Invigilator is pacing down your row! Sneaking another glance is extremely risky!
                    </p>
                  )}
                </div>
              </div>

              {/* Two Gameplay Paths */}
              {!examResult && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Write Legitimately */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Write Legitimately</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Rely strictly on your personal knowledge points ({stats.knowledge} KP) and revision.
                        Zero risk of exam malpractice or tribunal summons.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-500">
                        <span className="flex items-center gap-0.5">
                          <Zap className="w-3 h-3 text-amber-500" /> -25⚡ Energy
                        </span>
                        <span className="text-emerald-600 font-bold">100% Safe</span>
                      </div>
                    </div>
                    <button
                      onClick={handleLegitimateSubmit}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      Submit Honest Paper
                    </button>
                  </div>

                  {/* Option 2: Sneak in Expo Cheat Notes */}
                  <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Sneak "Expo" Cheat Notes</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Slide out handwritten cheat notes from under your calculator. Boosts exam score,
                        but spikes the Invigilator's Alertness meter. If it hits 100%, you get caught!
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-500">
                        <span className="text-emerald-600 font-bold">+Score Boost</span>
                        <span className="text-rose-600 font-bold">+30% Alertness</span>
                      </div>
                    </div>
                    <button
                      onClick={handleSneakExpo}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      Peek at Expo Cheat Sheet
                    </button>
                  </div>
                </div>
              )}

              {/* Exam Submitted Result */}
              {examResult && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Examination Script Successfully Submitted!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Your answer booklet was accepted by the chief invigilator without incident.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 py-2 font-mono">
                    <span className="text-sm font-black text-emerald-800">
                      Score: {examResult.score}%
                    </span>
                    <span className="text-sm font-black text-blue-700">
                      Grade: {examResult.grade}
                    </span>
                    <span className="text-sm font-black text-emerald-700">
                      CGPA: +{examResult.cgpaChange}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsExamModalOpen(false);
                      setExamResult(null);
                    }}
                    className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Exit Exam Hall
                  </button>
                </div>
              )}
            </>
          ) : (
            /* --- DISCIPLINARY TRIBUNAL VIEW --- */
            <>
              {/* Tribunal Hearing Header & Evidence */}
              <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Disciplinary Hearing for Academic Malpractice / Misconduct
                    </h3>
                    <p className="text-xs text-slate-500">
                      Case File: LU/SDC/2026/089 • Respondent: {stats.matricNo}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Exhibits Tendered by Faculty Invigilation Board:
                  </p>
                  <p className="text-[11px] text-slate-700 italic">
                    "Confiscated micro-notes with handwritten algorithms and signed Malpractice Docket by Chief Invigilator."
                  </p>
                </div>
              </div>

              {/* Panel Defense Selection */}
              {!tribunalVerdict ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-slate-500" />
                    Select Your Defense Strategy Before The Tribunal Panel:
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Strategy 1: Plead Innocent */}
                    <button
                      onClick={() => handleDefenseSubmit('innocent')}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 text-left transition-all hover:shadow-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          1. Plead Innocent on Technicality (Legalistic Defense)
                        </span>
                        <span className="text-[10px] font-bold text-amber-600">High Risk • 20% Acquittal Chance</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        "The papers on the floor did not belong to me! I was framed by adjacent seat arrangement!"
                      </p>
                    </button>

                    {/* Strategy 2: Confess Remorsefully */}
                    <button
                      onClick={() => handleDefenseSubmit('confess')}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 text-left transition-all hover:shadow-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          2. Confess Remorsefully with Genuine Apologies (Leniency Plea)
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">Leniency • Avoids Full Suspension</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        "I am deeply sorry, members of the panel. The academic pressure broke me. I beg for mercy and community service."
                      </p>
                    </button>

                    {/* Strategy 3: Blame Roommate */}
                    <button
                      onClick={() => handleDefenseSubmit('blame_roommate')}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 text-left transition-all hover:shadow-xs group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          3. Blame Roommate & Feign Ignorance
                        </span>
                        <span className="text-[10px] font-bold text-rose-600">Outrage • Maximum Penalty</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        "It was my roommate who packed those notes into my pencil pouch without my knowledge!"
                      </p>
                    </button>

                    {/* Strategy 4: Present Official Medical Exemption Note */}
                    {stats.hasMedicalExemptionNote && (
                      <button
                        onClick={() => handleDefenseSubmit('medical_exemption')}
                        className="p-3.5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-500 hover:border-emerald-600 hover:bg-emerald-100/90 text-left transition-all hover:shadow-md group animate-in fade-in"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            4. Present Official LU Medical Centre Exemption Note (Hospital Certified)
                          </span>
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                            100% Guaranteed Acquittal
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-medium mt-1">
                          "Honorable Panel members, I was suffering from acute medical distress. Here is my official signed & stamped Exemption Docket from Chief Nursing Officer Funke."
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Verdict Ruling Callout */
                <div
                  className={`p-5 rounded-2xl border text-center space-y-3 animate-in zoom-in-95 duration-200 ${
                    tribunalVerdict.verdict === 'acquitted'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : tribunalVerdict.verdict === 'probation'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-md bg-white border">
                    <Gavel
                      className={`w-6 h-6 ${
                        tribunalVerdict.verdict === 'acquitted'
                          ? 'text-emerald-600'
                          : tribunalVerdict.verdict === 'probation'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-black">
                      OFFICIAL TRIBUNAL VERDICT: {tribunalVerdict.verdict.toUpperCase()}
                    </h4>
                    <p className="text-xs mt-1.5 leading-relaxed font-medium">
                      {tribunalVerdict.penaltyDesc}
                    </p>
                  </div>
                  {stats.isSuspended && (
                    <div className="p-2.5 bg-rose-100/80 border border-rose-300 rounded-xl text-xs font-bold text-rose-900">
                      ⛔ University Suspension Active: {stats.suspensionDaysRemaining} in-game day(s). Restricted to hostel!
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsTribunalModalOpen(false);
                      setTribunalVerdict(null);
                    }}
                    className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Acknowledge Ruling & Dismiss
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
