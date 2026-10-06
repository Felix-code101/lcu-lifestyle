import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Briefcase,
  Skull,
  Coins,
  Zap,
  Package,
  ShoppingBag,
  Laptop,
  AlertTriangle,
  ShieldAlert,
  X,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface ProjectGig {
  id: string;
  title: string;
  client: string;
  payout: number;
  energyCost: number;
  knowledgeGain: number;
  tag: string;
}

export const HustleCrimeModal: React.FC = () => {
  const {
    stats,
    isHustleModalOpen,
    setIsHustleModalOpen,
    buySmallChopsWholesale,
    sellSmallChopsRetail,
    takeProjectGig,
    attemptTheft,
    setIsTribunalModalOpen,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'hustle' | 'crime'>('hustle');
  const [theftResult, setTheftResult] = useState<{
    success: boolean;
    cashStolen: number;
    caught: boolean;
    location: string;
  } | null>(null);

  if (!isHustleModalOpen) return null;

  const projectGigs: ProjectGig[] = [
    {
      id: 'g1',
      title: 'Fullstack React & Python Capstone System',
      client: 'Kunle (400L Software Eng)',
      payout: 14000,
      energyCost: 28,
      knowledgeGain: 85,
      tag: 'Coding Gig',
    },
    {
      id: 'g2',
      title: 'SPSS Statistics & Regression Thesis Analysis',
      client: 'Dr. Cynthia (Postgrad Researcher)',
      payout: 11500,
      energyCost: 24,
      knowledgeGain: 70,
      tag: 'Data Analysis',
    },
    {
      id: 'g3',
      title: 'Moot Court Legal Defense Brief & Citations',
      client: 'Barrister Tunde (Faculty of Law)',
      payout: 9000,
      energyCost: 18,
      knowledgeGain: 55,
      tag: 'Legal Research',
    },
    {
      id: 'g4',
      title: 'Pitch Deck & Business Model Canvas Slides',
      client: 'Busayo (Economics Dept)',
      payout: 6500,
      energyCost: 14,
      knowledgeGain: 40,
      tag: 'Slide Design',
    },
  ];

  const theftTargets = [
    {
      id: 't1',
      name: 'Hostel Common Room Lounge',
      desc: 'Pickpocket unattended envelopes and loose wallets on reading tables.',
      risk: 28,
      rewardRange: '₦3,000 - ₦7,500',
    },
    {
      id: 't2',
      name: 'Faculty Exam Printing Office',
      desc: 'Sneak behind the clerk counter while staff are on lunch break.',
      risk: 42,
      rewardRange: '₦8,000 - ₦18,000',
    },
    {
      id: 't3',
      name: 'Deanery Cash Box & Staff Safe',
      desc: 'Unsupervised bursary counter in the Senate administrative wing.',
      risk: 58,
      rewardRange: '₦15,000 - ₦28,000',
    },
  ];

  const handleExecuteTheft = (target: { name: string; risk: number }) => {
    const res = attemptTheft(target.name);
    setTheftResult({
      success: res.success,
      cashStolen: res.cashStolen,
      caught: res.caught,
      location: target.name,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/30 backdrop-blur-xs pointer-events-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:px-6 sm:py-5 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-300 text-amber-700 shadow-xs">
              {activeTab === 'hustle' ? (
                <Briefcase className="w-5 h-5 text-amber-600" />
              ) : (
                <Skull className="w-5 h-5 text-rose-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Student Hustles & Underworld Operations
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    activeTab === 'hustle'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {activeTab === 'hustle' ? 'Legal Street Smarts' : 'High Risk & Security Heat'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Make extra campus naira to fund your accommodation, studies, or political war chest.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsHustleModalOpen(false)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('hustle');
              setTheftResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'hustle'
                ? 'border-amber-500 bg-white text-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4 text-amber-500" />
            <span>Honest Student Hustles (Small Chops & Gigs)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('crime');
              setTheftResult(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
              activeTab === 'crime'
                ? 'border-rose-500 bg-white text-slate-900 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Skull className="w-4 h-4 text-rose-500" />
            <span>Campus Underworld & Pickpocketing</span>
            {stats.disciplinaryStrikes > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 text-rose-700 font-bold rounded-full">
                {stats.disciplinaryStrikes} Strike(s)
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {activeTab === 'hustle' ? (
            <>
              {/* Hustle Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Hustle Revenue
                    </p>
                    <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                      ₦{stats.hustleEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Small Chops Stock
                    </p>
                    <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                      {stats.smallChopsStock} Pack(s)
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Package className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Retail Margin per Pack
                    </p>
                    <p className="text-lg font-black text-emerald-600 font-mono mt-0.5">
                      +₦3,500 Profit
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* 1. Small Chops Vending Business */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-500" />
                      Hostel Small Chops Enterprise
                    </h3>
                    <p className="text-xs text-slate-500">
                      Buy wholesale packs (spring rolls, samosa, puff-puff) & sell retail in rooms
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                    ₦3,000 buy ➔ ₦6,500 sell
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Wholesale Purchase */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Restock Wholesale Packs (Bukka Bakery)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ₦3,000 per wholesale pack of 10 freshly fried pastries.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => buySmallChopsWholesale(1)}
                        className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                      >
                        Buy 1 Pack (-₦3,000)
                      </button>
                      <button
                        onClick={() => buySmallChopsWholesale(5)}
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                      >
                        Buy 5 Packs (-₦15,000)
                      </button>
                    </div>
                  </div>

                  {/* Retail Selling */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Hawk Retail in Hostels & Auditoriums
                      </p>
                      <p className="text-[11px] text-emerald-800/80">
                        Sell at ₦6,500 per pack to hungry students (-5⚡ energy per pack).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={stats.smallChopsStock < 1}
                        onClick={() => sellSmallChopsRetail(1)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          stats.smallChopsStock >= 1
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Sell 1 Pack (+₦6,500)
                      </button>
                      <button
                        disabled={stats.smallChopsStock < 3}
                        onClick={() => sellSmallChopsRetail(3)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          stats.smallChopsStock >= 3
                            ? 'bg-emerald-700 hover:bg-emerald-600 text-white active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Sell 3 Packs (+₦19,500)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Coursework Project & Freelance Gigs */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-blue-600" />
                      Student Freelance Project Gigs
                    </h3>
                    <p className="text-xs text-slate-500">
                      Complete coding, legal briefs, and statistical assignments for clients
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    ₦5,000 - ₦15,000 Payouts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projectGigs.map((g) => (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 flex flex-col justify-between gap-2.5 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {g.tag}
                          </span>
                          <span className="text-xs font-black text-emerald-600 font-mono">
                            +₦{g.payout.toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">{g.title}</h4>
                        <p className="text-[10px] text-slate-500">Client: {g.client}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] font-mono">
                        <span className="text-slate-500 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" /> -{g.energyCost}⚡
                        </span>
                        <span className="text-blue-600 font-bold">+{g.knowledgeGain} KP</span>
                        <button
                          onClick={() => takeProjectGig(g.title, g.payout, g.energyCost, g.knowledgeGain)}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-95"
                        >
                          Deliver Gig
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* TAB 2: Crime & Campus Security System */
            <div className="space-y-5">
              {/* Security Heat & Disciplinary Strike Alert */}
              <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Campus Security Vigilance & Disciplinary Record
                      </h3>
                      <p className="text-xs text-slate-500">
                        LU Security Patrol actively polices common areas. 3 strikes triggers the Tribunal!
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 font-mono">
                      {stats.disciplinaryStrikes} / 3 Strikes
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      stats.disciplinaryStrikes === 0
                        ? 'bg-emerald-500 w-0'
                        : stats.disciplinaryStrikes === 1
                        ? 'bg-amber-500 w-1/3'
                        : stats.disciplinaryStrikes === 2
                        ? 'bg-orange-500 w-2/3'
                        : 'bg-rose-600 w-full'
                    }`}
                  />
                </div>

                {stats.disciplinaryStrikes >= 2 && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-semibold flex items-center justify-between">
                    <span>⚠️ Extreme Warning: 1 more strike triggers an immediate Disciplinary Tribunal summons!</span>
                    <button
                      onClick={() => setIsTribunalModalOpen(true)}
                      className="text-[11px] underline font-bold text-rose-900"
                    >
                      View Tribunal
                    </button>
                  </div>
                )}
              </div>

              {/* Crime Targets */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Skull className="w-4 h-4 text-rose-500" />
                  High-Risk Infiltration Targets
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {theftTargets.map((tgt) => (
                    <div
                      key={tgt.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-rose-300 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            {tgt.risk}% Detection Risk
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-600">
                            {tgt.rewardRange}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 mt-1">{tgt.name}</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{tgt.desc}</p>
                      </div>

                      <button
                        onClick={() => handleExecuteTheft(tgt)}
                        className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        Attempt Stealth Theft
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Theft Result Callout */}
              {theftResult && (
                <div
                  className={`p-4 rounded-2xl border text-center space-y-2 animate-in zoom-in-95 duration-200 ${
                    theftResult.caught
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {theftResult.caught ? (
                      <AlertTriangle className="w-6 h-6 text-rose-600" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-emerald-600" />
                    )}
                    <h4 className="font-black text-sm">
                      {theftResult.caught
                        ? 'SECURITY INTERCEPTION: BUSTED!'
                        : 'CLEAN ESCAPE WITH LOOT!'}
                    </h4>
                  </div>
                  <p className="text-xs">
                    {theftResult.caught
                      ? `Campus guards cornered you at ${theftResult.location}! Loot confiscated, bail fine docked, and strike recorded.`
                      : `You quietly slipped away from ${theftResult.location} with ₦${theftResult.cashStolen.toLocaleString()} cash!`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
