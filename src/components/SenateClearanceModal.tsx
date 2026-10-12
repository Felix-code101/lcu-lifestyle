import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';
import {
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  GraduationCap,
  Sparkles,
  AlertCircle,
  FileCheck,
  Award,
} from 'lucide-react';

export const SenateClearanceModal: React.FC = () => {
  const {
    stats,
    spendBalance,
    addBalance,
    isSenateClearanceModalOpen,
    setIsSenateClearanceModalOpen,
    completeSenateDocumentation,
    addToast,
  } = useGame();

  const [step, setStep] = useState<1 | 2 | 3>(
    stats.acceptance_fee_paid ? 2 : 1
  );

  // Step 1: Acceptance fee payment
  const ACCEPTANCE_FEE = 30000;
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Step 2: Documentation form
  const [jambRegNo, setJambRegNo] = useState(
    `2024/JAMB/LU/${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [jambScore, setJambScore] = useState<number>(275);

  // Dynamic faculty subject presets for 5 WAEC credits
  const getInitialFacultySubjects = () => {
    const dept = stats.department || '';
    if (dept.includes('Medicine') || dept.includes('Nursing') || dept.includes('Medical')) {
      return {
        sub3: 'Biology',
        sub4: 'Chemistry',
        sub5: 'Physics',
      };
    }
    if (dept.includes('Computer') || dept.includes('Software') || dept.includes('Engineering')) {
      return {
        sub3: 'Physics',
        sub4: 'Chemistry',
        sub5: 'Further Mathematics',
      };
    }
    if (dept.includes('Law')) {
      return {
        sub3: 'Literature in English',
        sub4: 'Government',
        sub5: 'Christian / Islamic Religious Studies',
      };
    }
    if (dept.includes('Accounting') || dept.includes('Economics') || dept.includes('Business')) {
      return {
        sub3: 'Economics',
        sub4: 'Financial Accounting',
        sub5: 'Commerce',
      };
    }
    return {
      sub3: 'Biology',
      sub4: 'Economics',
      sub5: 'Government',
    };
  };

  const initialSubjects = getInitialFacultySubjects();

  const [waecResults, setWaecResults] = useState<Record<string, { subject: string; grade: string }>>({
    sub1: { subject: 'English Language', grade: 'A1' },
    sub2: { subject: 'General Mathematics', grade: 'B2' },
    sub3: { subject: initialSubjects.sub3, grade: 'A1' },
    sub4: { subject: initialSubjects.sub4, grade: 'B3' },
    sub5: { subject: initialSubjects.sub5, grade: 'B2' },
  });

  const [isSubmittingClearance, setIsSubmittingClearance] = useState(false);

  if (!isSenateClearanceModalOpen) return null;

  const handlePayAcceptanceFee = () => {
    if (stats.balance < ACCEPTANCE_FEE) {
      addToast(
        `❌ Insufficient funds! You need ₦${ACCEPTANCE_FEE.toLocaleString()} to pay your acceptance fee. Claim the student grant below.`,
        'warning'
      );
      return;
    }

    setIsProcessingPayment(true);
    setTimeout(async () => {
      const ok = spendBalance(ACCEPTANCE_FEE);
      if (ok) {
        addToast('🏛️ Acceptance Fee paid successfully! Proceeding to Academic Documentation.', 'success');
        setStep(2);
      }
      setIsProcessingPayment(false);
    }, 400);
  };

  const handleClaimGrant = () => {
    addBalance(35000);
    addToast('🎉 ₦35,000 Fresher Acceptance Grant credited to student wallet!', 'success');
  };

  const handleSubmitDocumentation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (jambScore < 180 || jambScore > 400) {
      addToast('❌ JAMB score must be between 180 and 400.', 'warning');
      return;
    }

    setIsSubmittingClearance(true);

    const waecSelections: Record<string, string> = {};
    Object.values(waecResults).forEach((val) => {
      waecSelections[val.subject] = val.grade;
    });

    try {
      if (supabase && stats.matricNo) {
        await supabase
          .from('students')
          .update({
            acceptance_fee_paid: true,
            documentation_completed: true,
            jamb_score: Number(jambScore),
            waec_results: waecSelections,
          })
          .eq('matric_no', stats.matricNo);
      }

      await completeSenateDocumentation({
        jambScore: Number(jambScore),
        waecSelections,
      });

      addToast(
        '🎓 Documentation Verified! You are now officially cleared as a bona fide student.',
        'success'
      );
      setIsSenateClearanceModalOpen(false);
    } catch (err) {
      console.error('Clearance submission error:', err);
      addToast('Verification updated locally with honours clearance!', 'info');
      setIsSenateClearanceModalOpen(false);
    } finally {
      setIsSubmittingClearance(false);
    }
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => setIsSenateClearanceModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pb-24 sm:pb-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-4 sm:p-6 rounded-3xl bg-white border border-blue-200 shadow-2xl text-slate-800 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-blue-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-blue-900 tracking-tight">
                  Senate Building Clearance Portal
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 uppercase">
                  Registry
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-700 font-medium">
                Academic Secretariat • Fresher Documentation & Acceptance Clearance
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSenateClearanceModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`p-2 rounded-xl text-left border transition-all ${
              step === 1
                ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                : stats.acceptance_fee_paid
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="text-[9px] uppercase font-bold tracking-wider text-blue-600 flex items-center gap-1">
              {stats.acceptance_fee_paid && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              <span>Step 1</span>
            </div>
            <div className="text-xs font-black truncate">Acceptance Fee</div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (stats.acceptance_fee_paid) setStep(2);
            }}
            disabled={!stats.acceptance_fee_paid}
            className={`p-2 rounded-xl text-left border transition-all ${
              step === 2
                ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                : stats.documentation_completed
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="text-[9px] uppercase font-bold tracking-wider text-blue-600 flex items-center gap-1">
              {stats.documentation_completed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              <span>Step 2</span>
            </div>
            <div className="text-xs font-black truncate">JAMB & WAEC</div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (stats.acceptance_fee_paid) setStep(3);
            }}
            disabled={!stats.acceptance_fee_paid}
            className={`p-2 rounded-xl text-left border transition-all ${
              step === 3
                ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                : stats.documentation_completed
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <div className="text-[9px] uppercase font-bold tracking-wider text-blue-600">Step 3</div>
            <div className="text-xs font-black truncate">Verification</div>
          </button>
        </div>

        {/* STEP 1: ACCEPTANCE FEE PAYMENT */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-slate-700 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Statutory University Acceptance Fee (Fresher Session)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                All admitted scholars of Liids University (LU) must remit the mandatory acceptance fee of <strong>₦30,000</strong> to the Central Registry & Bursary to confirm their departmental admission slot.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Your Current Wallet Balance:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                ₦{stats.balance.toLocaleString()}
              </span>
            </div>

            {stats.balance < ACCEPTANCE_FEE && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span className="text-[11px] font-semibold">Need funds for acceptance fee?</span>
                </div>
                <button
                  type="button"
                  onClick={handleClaimGrant}
                  className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shrink-0 cursor-pointer shadow-xs"
                >
                  Claim Grant (+₦35,000)
                </button>
              </div>
            )}

            <div className="pt-2">
              {stats.acceptance_fee_paid ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Acceptance Fee Cleared & Stamped by Bursary!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Proceed to Academic Documentation (Step 2) →
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handlePayAcceptanceFee}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isProcessingPayment ? 'Processing Payment...' : 'Pay ₦30,000 Acceptance Fee'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: ACADEMIC DOCUMENTATION FORM */}
        {step === 2 && (
          <form onSubmit={() => setStep(3)} className="space-y-4">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-slate-700 text-xs space-y-1">
              <span className="font-bold text-blue-900 block">
                Academic Credentials Submission: {stats.department}
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Provide your accredited UTME JAMB results and verified 5 O-Level credit grades required for matriculation in the <strong>{stats.faculty || 'University Faculty'}</strong>.
              </p>
            </div>

            {/* Input 1: JAMB Registration & Score */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                1. JAMB UTME Examination Score & Registration
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium block mb-0.5">Registration No:</span>
                  <input
                    type="text"
                    value={jambRegNo}
                    onChange={(e) => setJambRegNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    placeholder="2024/JAMB/LU/4891"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] text-slate-500 font-medium">JAMB Score (180 - 400):</span>
                    <span className="text-[11px] font-extrabold text-blue-700 font-mono">{jambScore}/400</span>
                  </div>
                  <input
                    type="number"
                    min={180}
                    max={400}
                    value={jambScore}
                    onChange={(e) => setJambScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Input 2: WAEC Result Upload / Selection (5 Core Subjects) */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  2. WAEC O-Level 5 Core Subject Credits
                </label>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  5 Credits Required
                </span>
              </div>

              <div className="space-y-1.5">
                {Object.entries(waecResults).map(([key, data]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-800 text-[11px] truncate flex-1">
                      {data.subject}
                    </span>
                    <select
                      value={data.grade}
                      onChange={(e) =>
                        setWaecResults((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], grade: e.target.value },
                        }))
                      }
                      className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-blue-900 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                    >
                      {['A1', 'B2', 'B3', 'C4', 'C5', 'C6'].map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Review Clearance Slip</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CLEARANCE CONFIRMATION */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-blue-400/30 pb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-300" />
                  <div>
                    <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold block">
                      Liids University Registry
                    </span>
                    <h4 className="text-xs font-black">Official Candidate Clearance Slip</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono font-bold">
                    VERIFIED CANDIDATE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-blue-300 block">Candidate Name:</span>
                  <span className="font-bold text-white truncate block">@{stats.username || 'Scholar'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-300 block">Matriculation No:</span>
                  <span className="font-mono font-bold text-blue-200 block">{stats.matricNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-300 block">Department:</span>
                  <span className="font-bold text-white truncate block">{stats.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-300 block">JAMB Score:</span>
                  <span className="font-mono font-bold text-amber-300 block">{jambScore}/400</span>
                </div>
              </div>

              <div className="pt-1 border-t border-blue-400/30">
                <span className="text-[10px] text-blue-300 block mb-1">WAEC Verified Grades:</span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(waecResults).map((item) => (
                    <span
                      key={item.subject}
                      className="px-2 py-0.5 rounded-md bg-blue-800/80 text-[10px] font-mono text-blue-100 border border-blue-700"
                    >
                      {item.subject.slice(0, 10)}: <strong className="text-white">{item.grade}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                By verifying, you gain full university privileges: unrestricted lecture theatre attendance, hostel customization, and student union activities.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Edit Form
              </button>
              <button
                type="button"
                disabled={isSubmittingClearance}
                onClick={handleSubmitDocumentation}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingClearance ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying with Academic Registry...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Submit & Confirm Official Matriculation 🎓</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
