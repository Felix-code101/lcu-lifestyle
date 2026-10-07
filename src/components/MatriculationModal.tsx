import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import type { SocioeconomicStatus } from '../types/game';
import { getRegisteredStudents, saveRegisteredStudent, registerStudentToDatabase } from '../lib/supabase';
import {
  GraduationCap,
  Crown,
  Backpack,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Dices,
  Coins,
  Zap,
  TrendingUp,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export const LU_DEPARTMENTS = [
  { faculty: 'Faculty of Basic Medical & Applied Sciences', name: 'Software Engineering' },
  { faculty: 'Faculty of Basic Medical & Applied Sciences', name: 'Computer Science' },
  { faculty: 'Faculty of Basic Medical & Applied Sciences', name: 'Cyber Security' },
  { faculty: 'Faculty of Basic Medical & Applied Sciences', name: 'Nursing Science' },
  { faculty: 'Faculty of Basic Medical & Applied Sciences', name: 'Medical Laboratory Science' },
  { faculty: 'Faculty of Law', name: 'Private & Property Law' },
  { faculty: 'Faculty of Law', name: 'Public & International Law' },
  { faculty: 'Faculty of Social & Management Sciences', name: 'Mass Communication' },
  { faculty: 'Faculty of Social & Management Sciences', name: 'Business Administration' },
  { faculty: 'Faculty of Social & Management Sciences', name: 'Accounting & Finance' },
  { faculty: 'Faculty of Social & Management Sciences', name: 'Economics' },
  { faculty: 'Faculty of Social & Management Sciences', name: 'International Relations' },
];

export const MatriculationModal: React.FC = () => {
  const { stats, registerStudentProfile, addToast } = useGame();

  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('Software Engineering');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  // Status Roll Animation State
  const [isRolling, setIsRolling] = useState(false);
  const [rollingCandidate, setRollingCandidate] = useState<SocioeconomicStatus>('lapo');
  const [rollResult, setRollResult] = useState<SocioeconomicStatus | null>(null);
  const [generatedMatricNo, setGeneratedMatricNo] = useState('');

  // Generate random Matric No preview
  useEffect(() => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setGeneratedMatricNo(`LU/24/${randomDigits}`);
  }, []);

  // If already registered, do not render
  if (stats.isRegistered) {
    return null;
  }

  const handleStartRoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = username.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your full student name or matriculation alias.');
      return;
    }
    if (trimmed.length < 3) {
      setErrorMsg('Student username must be at least 3 characters long.');
      return;
    }

    setIsChecking(true);
    try {
      const existingStudents = await getRegisteredStudents();
      const isDuplicate = existingStudents.some(
        (s) => s.username.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        setErrorMsg(`The student name "${trimmed}" is already registered. Please choose a unique name.`);
        setIsChecking(false);
        return;
      }
    } catch {
      // ignore
    }
    setIsChecking(false);

    // Begin Suspenseful Socioeconomic Roll
    setIsRolling(true);

    // 15% probability for 'nepo', 85% for 'lapo'
    const outcome: SocioeconomicStatus = Math.random() < 0.15 ? 'nepo' : 'lapo';

    // Rapid toggle animation for 2.4 seconds
    let toggleCount = 0;
    const interval = setInterval(() => {
      setRollingCandidate((prev) => (prev === 'nepo' ? 'lapo' : 'nepo'));
      toggleCount++;
      if (toggleCount >= 18) {
        clearInterval(interval);
        setRollingCandidate(outcome);
        setRollResult(outcome);
        setIsRolling(false);
      }
    }, 110);
  };

  const handleFinalizeMatriculation = async () => {
    if (!rollResult) return;

    const matricNo = generatedMatricNo;
    const studentId = `student_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const initialBalance = rollResult === 'nepo' ? 250000 : 15000;
    const initialMood = rollResult === 'nepo' ? 100 : 85;

    // Explicitly upsert student to Supabase backend
    await registerStudentToDatabase({
      matricNo,
      fullName: username.trim(),
      department,
      level: '100 Level (Fresher)',
      status: rollResult === 'nepo' ? 'Nepo Baby' : 'Lapo Hustler',
      cash: initialBalance,
      classesAttended: 0,
    });

    // Save to backend / local registry database
    await saveRegisteredStudent({
      id: studentId,
      username: username.trim(),
      matricNo,
      department,
      level: '100 Level (Fresher)',
      status: rollResult,
      balance: initialBalance,
      cgpa: null, // Freshers spawn with pending CGPA
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isOnline: true,
    });

    // Update GameContext state
    registerStudentProfile({
      username: username.trim(),
      matricNo,
      department,
      status: rollResult,
      balance: initialBalance,
      mood: initialMood,
    });

    if (rollResult === 'nepo') {
      addToast(`👑 Welcome to Liids University, Scholar! You rolled NEPO BABY status with ₦250,000!`, 'success');
    } else {
      addToast(`🎒 Welcome to Liids University, Hustler! You rolled LAPO status with micro-loan access and hustle boosts!`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl my-auto rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-300">
        {/* Decorative Top Accent Banner */}
        <div className="h-3 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-slate-200">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md border border-emerald-400 mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Liids University (LU), Ibadan
          </h2>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mt-0.5">
            2024/2025 Matriculation Ceremony & Fresher Onboarding
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            "Excellence & Innovation" • Register your student identity and roll your socioeconomic campus fate.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!rollResult && !isRolling && (
            <form onSubmit={handleStartRoll} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Student Name / Alias <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="e.g. Adebayo Adeleke or Bolanle_Dev"
                  disabled={isChecking}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                {errorMsg && (
                  <p className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </div>

              {/* Department & Level Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Academic Level (Fixed Fresher) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Academic Level
                  </label>
                  <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-emerald-800 flex items-center justify-between">
                    <span>100 Level (Fresher)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Standard
                    </span>
                  </div>
                </div>

                {/* Generated Matric No */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Matric Number (Assigned)
                  </label>
                  <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-sm font-bold text-amber-800 flex items-center justify-between">
                    <span>{generatedMatricNo}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Faculty & Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
                  >
                    {LU_DEPARTMENTS.map((dept) => (
                      <option key={dept.name} value={dept.name} className="bg-white text-slate-900">
                        {dept.name} ({dept.faculty.replace('Faculty of ', '')})
                      </option>
                    ))}
                  </select>
                  <Building className="absolute right-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Socioeconomic Status Information Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <HelpCircle className="w-4 h-4" />
                  <span>Socioeconomic Status Fate Roll (15% Nepo / 85% Lapo)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="font-bold text-amber-800 flex items-center gap-1">
                      👑 15% Nepo Baby
                    </span>
                    <p className="text-slate-600 mt-0.5">
                      Starts with ₦250,000, 100% mood, slow hunger/energy drain.
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      🎒 85% Lapo Hustler
                    </span>
                    <p className="text-slate-600 mt-0.5">
                      Starts with ₦15,000, ₦10k micro-loan access, +50% hustle bonuses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChecking}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Dices className="w-5 h-5 text-amber-300" />
                <span>Sign Matriculation Register & Roll Fate</span>
              </button>
            </form>
          )}

          {/* Rolling Animation */}
          {isRolling && (
            <div className="py-8 text-center space-y-5 animate-in fade-in">
              <div className="inline-flex p-4 rounded-3xl bg-slate-50 border border-slate-200 shadow-md relative">
                {rollingCandidate === 'nepo' ? (
                  <div className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 border border-amber-300 flex items-center justify-center shadow-xs">
                      <Crown className="w-10 h-10 animate-bounce" />
                    </div>
                    <span className="text-base font-black text-amber-800 tracking-wider">
                      👑 NEPO BABY (15%)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center shadow-xs">
                      <Backpack className="w-10 h-10 animate-bounce" />
                    </div>
                    <span className="text-base font-black text-emerald-800 tracking-wider">
                      🎒 LAPO HUSTLER (85%)
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 animate-pulse">
                  Rolling Socioeconomic Fate...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Checking campus pedigree and student bursary background
                </p>
              </div>
            </div>
          )}

          {/* Roll Result Revealed Card */}
          {rollResult && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-400">
              {rollResult === 'nepo' ? (
                /* NEPO BABY REVEAL */
                <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 shadow-xl text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-2xl animate-spin" style={{ animationDuration: '6s' }}>
                    ✨
                  </div>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md mb-3 border border-amber-300">
                    <Crown className="w-10 h-10" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black tracking-widest uppercase mb-1">
                    👑 NEPO BABY ASSIGNED (Top 15%)
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Silver Spoon & Chauffeur Privilege
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Your parents sent you to Liids University with heavy backing. The bursary receipts are cleared, your fridge will never be empty, and money is not an obstacle.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs">
                    <div className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center gap-2.5 shadow-xs">
                      <Coins className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Starting Cash</span>
                        <span className="font-extrabold text-amber-700 font-mono">₦250,000</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center gap-2.5 shadow-xs">
                      <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Metabolism</span>
                        <span className="font-extrabold text-amber-700">-50% Stamina Drain</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* LAPO HUSTLER REVEAL */
                <div className="p-5 rounded-3xl bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-300 shadow-xl text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-2xl">
                    🔥
                  </div>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md mb-3 border border-emerald-300">
                    <Backpack className="w-10 h-10" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black tracking-widest uppercase mb-1">
                    🎒 LAPO HUSTLER ASSIGNED (85%)
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Grit, Ambition & Campus Hustle
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Self-reliant student! You know how to stretch naira, balance coursework, run student gigs, and tap into micro-loans when times get tough.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs">
                    <div className="p-3 rounded-2xl bg-white border border-emerald-200 flex items-center gap-2.5 shadow-xs">
                      <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Emergency Credit</span>
                        <span className="font-extrabold text-emerald-700 font-mono">₦10,000 Micro-Loan</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-emerald-200 flex items-center gap-2.5 shadow-xs">
                      <TrendingUp className="w-5 h-5 text-teal-600 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Hustle Bonus</span>
                        <span className="font-extrabold text-emerald-700">+50% XP & Profit</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Student Summary Pill */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Matriculated As</span>
                  <span className="font-bold text-slate-900">{username}</span>
                  <span className="text-slate-500 ml-1.5 font-mono text-[11px]">({generatedMatricNo})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Department</span>
                  <span className="font-bold text-emerald-700">{department}</span>
                </div>
              </div>

              {/* Enter Campus Button */}
              <button
                onClick={handleFinalizeMatriculation}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Enter Liids University Campus Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
