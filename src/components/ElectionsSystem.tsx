import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Vote,
  X,
  Award,
  CheckCircle,
  AlertTriangle,
  Megaphone,
  FileText,
  Utensils,
  TrendingUp,
  Users,
  Trophy,
  Coins,
  Zap,
} from 'lucide-react';

export const ElectionsSystem: React.FC = () => {
  const {
    stats,
    isElectionsModalOpen,
    setIsElectionsModalOpen,
    registerSugNomination,
    runCampaignActivity,
    holdElectionVoteTally,
    addToast,
  } = useGame();

  const [activeSpeechStep, setActiveSpeechStep] = useState<boolean>(false);
  const [electionResult, setElectionResult] = useState<{
    won: boolean;
    playerVotes: number;
    rivalVotes: number;
    totalVotes: number;
  } | null>(null);
  const [isTallying, setIsTallying] = useState<boolean>(false);

  if (!isElectionsModalOpen) return null;

  const meetsCgpa = stats.cgpa >= 3.0;
  const meetsDiscipline = stats.disciplinaryStrikes === 0 && !stats.isSuspended;
  const meetsFunds = stats.balance >= 100000;
  const canRegister = meetsCgpa && meetsDiscipline && meetsFunds && !stats.isSugCandidate;

  const speechChoices = [
    {
      title: 'The Student Welfare Manifesto',
      quote:
        '"Under my presidency, no student will read in the dark! 24/7 solar light in reading rooms and subsidized cafeteria meal vouchers for all!"',
      impact: 24,
      reaction: '🔥 Hostels erupt: "Greatest Nigerian Students!! Aluta Continua!"',
    },
    {
      title: 'Academic Excellence & Zero Hidden Fees',
      quote:
        '"We demand complete transparency in faculty departmental dues, timely release of Continuous Assessment scores, and zero extortion!"',
      impact: 22,
      reaction: '👏 Students cheer: "Truth! Na this kind president we need!"',
    },
    {
      title: 'Campus Shuttle Transportation Overhaul',
      quote:
        '"No more waiting 40 minutes under Ibadan sun for keke tricycles! We will introduce dedicated campus electric shuttle buses!"',
      impact: 26,
      reaction: '🛺 Commuters scream in excitement: "Carry us go there, Mr. President!"',
    },
  ];

  const handleDeliverSpeech = (choiceIndex: number) => {
    const choice = speechChoices[choiceIndex];
    const success = runCampaignActivity('speech', choice.impact);
    if (success) {
      addToast(choice.reaction, 'success');
      setActiveSpeechStep(false);
    }
  };

  const handleTriggerVoteTally = () => {
    setIsTallying(true);
    setTimeout(() => {
      const res = holdElectionVoteTally();
      setElectionResult(res);
      setIsTallying(false);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:px-6 sm:py-5 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-300 text-emerald-700 shadow-xs">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Liids University (LU) SUG Presidential Race
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase tracking-wider">
                  LUIEC Certified
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Independent Electoral Commission • Session Presidential Election
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsElectionsModalOpen(false)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/60">
          {/* Presidential Victory Banner if Won */}
          {stats.hasWonSugElection && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-200 shrink-0" />
                <div>
                  <h3 className="text-sm font-black tracking-wide">
                    OFFICIALLY ELECTED: SUG PRESIDENT ({stats.matricNo})
                  </h3>
                  <p className="text-xs text-amber-100">
                    Liids University 35th Executive Council President. Executive allowance disbursed!
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-white/20 font-bold text-xs shrink-0">
                In Office 👑
              </span>
            </div>
          )}

          {/* Section 1: Candidate Eligibility Checklist */}
          {!stats.isSugCandidate && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Electoral Screening & Eligibility Criteria
                </h3>
                <span className="text-xs font-bold text-slate-500">LUIEC Form 01</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Nomination Fee */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    meetsFunds
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-rose-50/50 border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700">Nomination Fee</span>
                    {meetsFunds ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <p className="text-base font-black text-slate-900 font-mono">₦100,000</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Balance: ₦{stats.balance.toLocaleString()}
                  </p>
                </div>

                {/* 2. CGPA Benchmark */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    meetsCgpa
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-rose-50/50 border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700">CGPA Requirement</span>
                    {meetsCgpa ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <p className="text-base font-black text-slate-900 font-mono">
                    {stats.cgpa.toFixed(2)} / 5.00
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Minimum 3.0 required</p>
                </div>

                {/* 3. Disciplinary Record */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    meetsDiscipline
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-rose-50/50 border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700">Disciplinary Record</span>
                    {meetsDiscipline ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <p className="text-base font-black text-slate-900 font-mono">
                    {stats.disciplinaryStrikes} Strike(s)
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {stats.isSuspended ? 'Suspended!' : 'Clean sheet required'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Screening verified by Dean of Student Affairs. Non-refundable fee.
                </p>
                <button
                  disabled={!canRegister}
                  onClick={registerSugNomination}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                    canRegister
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Pay ₦100k & Register Candidacy
                </button>
              </div>
            </div>
          )}

          {/* Section 2: Campaign War Room (When Certified) */}
          {stats.isSugCandidate && (
            <div className="space-y-5">
              {/* Candidate Campaign Dashboard */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Campaign War Chest & Student Popularity
                    </h3>
                    <p className="text-xs text-slate-500">
                      Mobilize votes across male, female hostels, and faculty auditoriums
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      War Chest Spent: ₦{stats.campaignFundsSpent.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Popularity Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Student Popularity Rating</span>
                    <span className="text-emerald-600 font-mono">{stats.campaignPopularity}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${stats.campaignPopularity}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Fliers: {stats.fliersPrinted}</span>
                    <span>Small Chops: {stats.chopsShared} packs</span>
                    <span>Speeches: {stats.speechesDelivered}</span>
                  </div>
                </div>
              </div>

              {/* Campaign Actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                  Available Campaign Mobilization Tactics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Action 1: Fliers */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Print Campaign Fliers</h5>
                      <p className="text-[11px] text-slate-500">
                        Post glossy campaign posters in halls and bulletin boards.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] font-mono">
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          <Coins className="w-3 h-3" /> ₦15,000
                        </span>
                        <span className="text-emerald-600 font-bold">+14% Votes</span>
                        <span className="text-slate-500 flex items-center gap-0.5">
                          <Zap className="w-3 h-3" /> -8⚡
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => runCampaignActivity('fliers')}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      Print & Post
                    </button>
                  </div>

                  {/* Action 2: Small Chops */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Share Small Chops</h5>
                      <p className="text-[11px] text-slate-500">
                        Distribute samosas, spring rolls & drinks in common rooms.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] font-mono">
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          <Coins className="w-3 h-3" /> ₦30,000
                        </span>
                        <span className="text-emerald-600 font-bold">+24% Votes</span>
                        <span className="text-slate-500 flex items-center gap-0.5">
                          <Zap className="w-3 h-3" /> -10⚡
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => runCampaignActivity('chops')}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      Share Refreshments
                    </button>
                  </div>

                  {/* Action 3: Amphitheatre Speech */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-900">Freedom Lawn Rally</h5>
                      <p className="text-[11px] text-slate-500">
                        Mount the stage and deliver a rousing manifesto address.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] font-mono">
                        <span className="text-emerald-600 font-bold">₦0 Cost</span>
                        <span className="text-emerald-600 font-bold">+20-26% Votes</span>
                        <span className="text-slate-500 flex items-center gap-0.5">
                          <Zap className="w-3 h-3" /> -15⚡
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveSpeechStep(true)}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      Give Speech
                    </button>
                  </div>
                </div>
              </div>

              {/* Freedom Lawn Rally Speech Modal Overlay */}
              {activeSpeechStep && (
                <div className="p-5 rounded-2xl bg-purple-50/80 border-2 border-purple-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase text-purple-900">
                      Select Your Campaign Speech Theme:
                    </h5>
                    <button
                      onClick={() => setActiveSpeechStep(false)}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-2">
                    {speechChoices.map((sp, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDeliverSpeech(idx)}
                        className="w-full p-3 rounded-xl bg-white border border-purple-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition-all"
                      >
                        <p className="text-xs font-bold text-slate-900">{sp.title}</p>
                        <p className="text-[11px] text-slate-600 italic mt-0.5">{sp.quote}</p>
                        <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">
                          Estimated Impact: +{sp.impact}% Student Popularity
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitors & Election Day Event */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    Current Election Opinion Polls (1,200 Sampled Students)
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Live Polling
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{stats.matricNo} (You)</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {stats.campaignPopularity}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${stats.campaignPopularity}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Rt. Hon. Segun (Faculty of Law Rep)</span>
                      <span className="font-mono text-slate-500">42%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: '42%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Comrade Ifeanyi (Aluta Engineering Wing)</span>
                      <span className="font-mono text-slate-500">33%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: '33%' }} />
                    </div>
                  </div>
                </div>

                {/* Voting Tally Action */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Ready for Election Day?</p>
                    <p className="text-[11px] text-slate-500">
                      Tally ballot boxes across all campus faculties to decide the winner.
                    </p>
                  </div>
                  <button
                    disabled={isTallying}
                    onClick={handleTriggerVoteTally}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Vote className="w-4 h-4" />
                    <span>{isTallying ? 'Tallying Ballots...' : 'Commence Election Voting'}</span>
                  </button>
                </div>

                {/* Election Results Callout */}
                {electionResult && (
                  <div
                    className={`p-4 rounded-xl border text-center space-y-2 animate-in zoom-in-95 duration-200 ${
                      electionResult.won
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {electionResult.won ? (
                        <Trophy className="w-6 h-6 text-amber-500" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                      )}
                      <h4 className="font-black text-sm">
                        {electionResult.won
                          ? 'ELECTORAL COMMISSION DECLARATION: WINNER!'
                          : 'POLL RESULTS: DEFEATED'}
                      </h4>
                    </div>
                    <p className="text-xs">
                      You polled <strong>{electionResult.playerVotes.toLocaleString()} votes</strong>{' '}
                      out of {electionResult.totalVotes.toLocaleString()} total ballots cast (Runner-up:{' '}
                      {electionResult.rivalVotes.toLocaleString()} votes).
                    </p>
                    {electionResult.won && (
                      <p className="text-[11px] font-bold text-emerald-700">
                        🎉 Earned Official Title: <strong>SUG President</strong> (+₦50,000 executive stipend)!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
