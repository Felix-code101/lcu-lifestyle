import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import type { RemotePlayer } from '../types/game';
import {
  Vote,
  Gamepad2,
  Scroll,
  Mic2,
  Map,
  Home,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const StudentUnionScene: React.FC<{ remotePlayers: RemotePlayer[] }> = ({ remotePlayers }) => {
  const {
    stats,
    navigateToLocation,
    performActivity,
    setIsElectionsModalOpen,
    addToast,
  } = useGame();

  useEffect(() => {
    addToast('📍 Arrived at Student Union Building (SUB Lounge & Parliament)', 'info');
  }, [addToast]);

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-4 sm:p-8 pt-20 pb-28 text-slate-800">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/90 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-rose-500/25 border border-rose-300">
              🎭
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Student Union Building (SUB)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold border border-rose-200">
                  Student Affairs & Lounge
                </span>
                {stats.hasWonSugElection && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                    👑 SUG President Office
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                The vibrant heartbeat of campus democracy, student parliament debates, recreation arcade, and student advocacy.
              </p>
            </div>
          </div>

          {/* Quick Exit Navigation Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateToLocation('campus_map')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Map className="w-4 h-4 text-emerald-600" />
              <span>Campus 3D Map</span>
            </button>
            <button
              onClick={() => navigateToLocation('home_hostel')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Hostel Room</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Hub Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: 🗳️ SRC Parliament Chamber */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:border-rose-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Vote className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  SUG Politics
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                SRC Parliament Chamber & Senate Rallies
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Step onto the parliamentary floor to inspect election campaign rallies, track voter polls, view candidate manifestos, and submit campus budget bills.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {stats.isSugCandidate ? '🏆 Active Candidate' : '🗳️ Registered Voter'}
              </span>
              <button
                onClick={() => setIsElectionsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Enter Elections Portal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: 🎮 Indoor Recreation Arcade & Table Tennis */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Recreation Lounge
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Indoor Arcade & Ayo Olopon Arena
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Take a break from grueling coursework. Challenge fellow Liids students to intense Table Tennis matches, PlayStation FIFA tournaments, or traditional Ayo Olopon.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700">
                +25 Mood • -10⚡ Energy • ₦200
              </span>
              <button
                onClick={() => {
                  if (stats.balance < 200) {
                    addToast('❌ Need ₦200 for arcade token!', 'warning');
                    return;
                  }
                  performActivity({
                    id: 'sub_arcade_game',
                    title: 'Played Games at SUB Lounge',
                    description: 'Played arcade games and Table Tennis with classmates',
                    energyCost: 10,
                    cashCost: 200,
                    cgpaGain: 0,
                    moodGain: 25,
                    durationMinutes: 30,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Play Games (₦200)</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: 📜 Student Welfare & Grievance Desk */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Scroll className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Advocacy
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Student Welfare & Grievance Desk
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Submit official student petitions concerning hostel electricity supply, cafeteria price controls, or student disciplinary representation.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700">
                +15 Mood • +0.02 CGPA • -5⚡ Energy
              </span>
              <button
                onClick={() => {
                  performActivity({
                    id: 'sub_welfare_petition',
                    title: 'Submitted Student Welfare Petition',
                    description: 'Engaged the Student Affairs officer on hostel welfare',
                    energyCost: 5,
                    cashCost: 0,
                    cgpaGain: 0.02,
                    moodGain: 15,
                    durationMinutes: 20,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Submit Petition</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: 🎤 Outdoor Amphitheatre & Open-Mic */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-lg hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Mic2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Amphitheatre
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                SUB Amphitheatre Open-Mic & Rallies
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Join the crowd under the stars for student comedy nights, rap battles, acoustic jam sessions, and fiery election manifesto debates.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700">
                +20 Mood • -10⚡ Energy
              </span>
              <button
                onClick={() => {
                  performActivity({
                    id: 'sub_openmic_rally',
                    title: 'Attended SUB Amphitheatre Open-Mic',
                    description: 'Watched lively student comedy and political debate',
                    energyCost: 10,
                    cashCost: 0,
                    cgpaGain: 0,
                    moodGain: 20,
                    durationMinutes: 40,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Join Open-Mic</span>
                <Award className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Remote Students Online in the SUB Lounge */}
        <div className="p-5 rounded-3xl bg-white/90 border border-slate-200/90 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Students in SUB Lounge ({remotePlayers.length + 1})
              </h4>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Live Campus Peer Network
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Player badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900">You ({stats.matricNo})</span>
              <span className="text-[10px] text-emerald-700 font-medium">Lvl {stats.level}</span>
            </div>

            {/* Remote players */}
            {remotePlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-bold text-slate-800">{p.matricNo}</span>
                <span className="text-[10px] text-slate-500">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
