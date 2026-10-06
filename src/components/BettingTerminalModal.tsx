import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { MatchFixture, BetSelection, ActiveBetSlip } from '../types/game';
import {
  X,
  Zap,
  Ticket,
  Clock,
  History,
  Trash2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const INITIAL_FIXTURES: MatchFixture[] = [
  {
    id: 'fix_1',
    homeTeam: 'LU Titans',
    awayTeam: 'UI Pioneers',
    competition: 'Ibadan Varsity Derby',
    odds: { home: 1.85, draw: 3.40, away: 4.20 },
    kickoff: 'Today 16:00',
  },
  {
    id: 'fix_2',
    homeTeam: 'FBSS Dynamos',
    awayTeam: 'Law Jurists',
    competition: 'Inter-Faculty Dean Cup',
    odds: { home: 2.10, draw: 3.10, away: 3.50 },
    kickoff: 'Today 17:30',
  },
  {
    id: 'fix_3',
    homeTeam: 'Computing Hackers',
    awayTeam: 'Engineering Spartans',
    competition: 'Tech Clash Trophy',
    odds: { home: 2.45, draw: 3.25, away: 2.75 },
    kickoff: 'Today 18:00',
  },
  {
    id: 'fix_4',
    homeTeam: 'Mass Comm Broadcasters',
    awayTeam: 'Nursing Angels',
    competition: 'Campus Premier League',
    odds: { home: 1.95, draw: 3.30, away: 3.80 },
    kickoff: 'Today 19:15',
  },
  {
    id: 'fix_5',
    homeTeam: 'Postgraduate Scholars',
    awayTeam: 'Science Panthers',
    competition: 'Varsity Invitational',
    odds: { home: 2.20, draw: 3.00, away: 3.20 },
    kickoff: 'Today 20:30',
  },
  {
    id: 'fix_6',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    competition: 'Premier League Showcase',
    odds: { home: 1.90, draw: 3.60, away: 3.90 },
    kickoff: 'Tonight 20:00',
  },
  {
    id: 'fix_7',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    competition: 'El Clasico Viewing Party',
    odds: { home: 2.15, draw: 3.50, away: 2.95 },
    kickoff: 'Tonight 21:00',
  },
];

export const BettingTerminalModal: React.FC = () => {
  const {
    stats,
    isBettingModalOpen,
    setIsBettingModalOpen,
    placeBetSlip,
    activeBetSlips,
    addToast,
    settleBetSlip,
  } = useGame();

  // Active Tab: 'fixtures' | 'live_simulation' | 'history'
  const [activeTab, setActiveTab] = useState<'fixtures' | 'live_simulation' | 'history'>('fixtures');

  // Available Fixtures
  const [fixtures] = useState<MatchFixture[]>(INITIAL_FIXTURES);

  // Active selections on the user's bet slip
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState<number>(500);

  // Live Rapid Match Simulation State
  const [simulatingSlip, setSimulatingSlip] = useState<ActiveBetSlip | null>(null);
  const [simMinute, setSimMinute] = useState<number>(0);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simScores, setSimScores] = useState<Record<string, { home: number; away: number }>>({});
  const [commentaryLog, setCommentaryLog] = useState<string[]>([]);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);
  const [simWon, setSimWon] = useState<boolean>(false);

  if (!isBettingModalOpen) return null;

  // Toggle pick selection for a fixture
  const handleTogglePick = (fixture: MatchFixture, pick: '1' | 'X' | '2') => {
    const existing = selections.find((s) => s.fixtureId === fixture.id);

    // If clicking same pick, remove it
    if (existing && existing.pick === pick) {
      setSelections((prev) => prev.filter((s) => s.fixtureId !== fixture.id));
      return;
    }

    const oddsVal = pick === '1' ? fixture.odds.home : pick === 'X' ? fixture.odds.draw : fixture.odds.away;
    const pickLabel =
      pick === '1'
        ? `${fixture.homeTeam} to Win`
        : pick === 'X'
        ? 'Draw Match'
        : `${fixture.awayTeam} to Win`;

    const newSelection: BetSelection = {
      fixtureId: fixture.id,
      matchTitle: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      pick,
      odds: oddsVal,
      pickLabel,
    };

    setSelections((prev) => {
      const filtered = prev.filter((s) => s.fixtureId !== fixture.id);
      return [...filtered, newSelection];
    });
  };

  // Total Accumulator Odds Calculation
  const totalOdds =
    selections.length > 0
      ? Number(selections.reduce((acc, curr) => acc * curr.odds, 1).toFixed(2))
      : 1.0;

  const potentialPayout = Math.round(stake * totalOdds);

  // Place Ticket & Initiate Rapid Simulation
  const handlePlaceTicket = () => {
    if (selections.length === 0) {
      addToast('❌ Select at least 1 match odd to build your accumulator!', 'warning');
      return;
    }

    if (stats.balance < stake) {
      addToast(`❌ Insufficient funds for ₦${stake.toLocaleString()} stake!`, 'warning');
      return;
    }

    const createdSlip = placeBetSlip(selections, stake, totalOdds, potentialPayout);
    if (!createdSlip) return;

    // Switch directly to live simulation screen
    setActiveTab('live_simulation');
    startRapidMatchSimulation(createdSlip);
  };

  // Execute rapid 10-second match simulation with dynamic clock & commentary
  const startRapidMatchSimulation = (slip: ActiveBetSlip) => {
    setSimulatingSlip(slip);
    setSimMinute(0);
    setSimProgress(0);
    setSimulationComplete(false);
    setCommentaryLog([`📢 Whistle blows! ${slip.selections.length} matches kicked off across stadiums!`]);

    // Initialize scores
    const initialScores: Record<string, { home: number; away: number }> = {};
    slip.selections.forEach((s) => {
      initialScores[s.fixtureId] = { home: 0, away: 0 };
    });
    setSimScores(initialScores);

    let minute = 0;
    const intervalTime = 120; // 120ms tick ~ 10 seconds total

    const interval = setInterval(() => {
      minute += 2;
      setSimMinute(minute);
      setSimProgress(Math.min(100, (minute / 90) * 100));

      // Random goal event during simulation ticks
      if (minute % 14 === 0 && Math.random() < 0.7) {
        const randomSel = slip.selections[Math.floor(Math.random() * slip.selections.length)];
        const isHomeGoal = Math.random() < 0.55;

        setSimScores((prev) => {
          const current = prev[randomSel.fixtureId] || { home: 0, away: 0 };
          const updated = {
            ...prev,
            [randomSel.fixtureId]: {
              home: isHomeGoal ? current.home + 1 : current.home,
              away: !isHomeGoal ? current.away + 1 : current.away,
            },
          };

          const scorerText = isHomeGoal
            ? `⚽ GOAL! ${randomSel.matchTitle.split(' vs ')[0]} breaks the deadlock!`
            : `⚽ GOAL! ${randomSel.matchTitle.split(' vs ')[1]} fires into the net!`;

          setCommentaryLog((cPrev) => [
            `[${minute}'] ${scorerText}`,
            ...cPrev.slice(0, 5),
          ]);

          return updated;
        });
      }

      // Conclude Match at 90 minutes
      if (minute >= 90) {
        clearInterval(interval);
        setSimulationComplete(true);

        // Evaluate whether the player's bet won or lost
        setSimScores((finalScores) => {
          let allCorrect = true;

          slip.selections.forEach((sel) => {
            const sc = finalScores[sel.fixtureId] || { home: 0, away: 0 };
            const actualOutcome = sc.home > sc.away ? '1' : sc.home === sc.away ? 'X' : '2';
            if (actualOutcome !== sel.pick) {
              allCorrect = false;
            }
          });

          // If random odds check grants win (for exciting gameplay balance: 40% win chance if close)
          if (!allCorrect && Math.random() < 0.25) {
            allCorrect = true;
          }

          setSimWon(allCorrect);
          settleBetSlip(slip.id, allCorrect, slip.potentialPayout);

          // Update final commentary
          setCommentaryLog((prev) => [
            allCorrect
              ? `🎉 FULL TIME! All accumulator legs hit! You won ₦${slip.potentialPayout.toLocaleString()}!`
              : `💔 FULL TIME! Heartbreak on the accumulator ticket. Better luck next game!`,
            ...prev,
          ]);

          return finalScores;
        });
      }
    }, intervalTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-auto bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white border-2 border-emerald-500/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-800 animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center text-xl shadow-xs">
              🎰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  LU Campus Bet & Booking Center
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                  Instant Wallet Payouts
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inter-Faculty Derbies & Top European Fixtures • Verified 1X2 Odds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right font-mono">
              <span className="text-[10px] text-slate-500 uppercase">Student Wallet</span>
              <span className="text-sm font-black text-emerald-700">
                ₦{stats.balance.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setIsBettingModalOpen(false)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold px-4">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'fixtures'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Today's Fixtures ({fixtures.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('live_simulation')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'live_simulation'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Live Match Simulator {simulatingSlip ? '🔴 LIVE' : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Bet Slip History ({activeBetSlips.length})</span>
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {/* TAB 1: TODAY'S FIXTURES & BET SLIP BUILDING */}
          {activeTab === 'fixtures' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Fixtures List (2 Columns on large) */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Match Fixtures</span>
                  <span className="font-mono text-[11px] text-emerald-700">1: Home • X: Draw • 2: Away</span>
                </div>

                <div className="space-y-2.5">
                  {fixtures.map((fix) => {
                    const currentPick = selections.find((s) => s.fixtureId === fix.id)?.pick;

                    return (
                      <div
                        key={fix.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        {/* Match Info */}
                        <div className="space-y-0.5 min-w-[180px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono">
                            {fix.competition} • {fix.kickoff}
                          </span>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <span>{fix.homeTeam}</span>
                            <span className="text-[10px] text-slate-400 font-bold">vs</span>
                            <span>{fix.awayTeam}</span>
                          </div>
                        </div>

                        {/* 1X2 Odds Buttons */}
                        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                          {/* 1 (Home Win) */}
                          <button
                            onClick={() => handleTogglePick(fix, '1')}
                            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center cursor-pointer border ${
                              currentPick === '1'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span className="text-[9px] uppercase opacity-75">1</span>
                            <span className="font-black">{fix.odds.home.toFixed(2)}</span>
                          </button>

                          {/* X (Draw) */}
                          <button
                            onClick={() => handleTogglePick(fix, 'X')}
                            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center cursor-pointer border ${
                              currentPick === 'X'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span className="text-[9px] uppercase opacity-75">X</span>
                            <span className="font-black">{fix.odds.draw.toFixed(2)}</span>
                          </button>

                          {/* 2 (Away Win) */}
                          <button
                            onClick={() => handleTogglePick(fix, '2')}
                            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center cursor-pointer border ${
                              currentPick === '2'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span className="text-[9px] uppercase opacity-75">2</span>
                            <span className="font-black">{fix.odds.away.toFixed(2)}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bet Slip Drawer (Right Column) */}
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-white border-2 border-emerald-500/50 shadow-md space-y-4">
                  {/* Bet Slip Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-sm font-black text-slate-900">Your Bet Slip</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                        {selections.length} {selections.length === 1 ? 'Single' : 'ACCA'}
                      </span>
                    </div>

                    {selections.length > 0 && (
                      <button
                        onClick={() => setSelections([])}
                        title="Clear Slip"
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Selections List */}
                  {selections.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                      <Ticket className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                      <p>Select odds from the fixtures on the left to build your accumulator slip.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selections.map((sel) => (
                        <div
                          key={sel.fixtureId}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900 text-[11px] truncate max-w-[160px]">
                              {sel.matchTitle}
                            </p>
                            <p className="text-[10px] text-emerald-700 font-semibold">
                              Pick: {sel.pickLabel}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-amber-700">
                              {sel.odds.toFixed(2)}x
                            </span>
                            <button
                              onClick={() =>
                                setSelections((prev) =>
                                  prev.filter((s) => s.fixtureId !== sel.fixtureId)
                                )
                              }
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Odds & Calculations Summary */}
                  <div className="pt-2 border-t border-slate-200 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Total Odds:</span>
                      <span className="font-black text-amber-700 text-sm">{totalOdds}x</span>
                    </div>

                    {/* Stake Chips Selection */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">
                        Select Stake Wager
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[200, 500, 1000, 2000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setStake(amt)}
                            className={`py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                              stake === amt
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          >
                            ₦{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-emerald-800">
                      <span className="font-sans font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                        Potential Win:
                      </span>
                      <span className="font-black text-base text-emerald-700">
                        ₦{potentialPayout.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Book Bet Slip Button */}
                  <button
                    disabled={selections.length === 0}
                    onClick={handlePlaceTicket}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <span>PLACE BET & SIMULATE LIVE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE RAPID MATCH SIMULATION */}
          {activeTab === 'live_simulation' && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              {!simulatingSlip ? (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
                  <h3 className="text-base font-bold text-slate-900">No Match Currently In Simulation</h3>
                  <p className="text-xs text-slate-500">
                    Go to Today's Fixtures, build an accumulator ticket, and place your wager to trigger live match simulation.
                  </p>
                  <button
                    onClick={() => setActiveTab('fixtures')}
                    className="py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                  >
                    Browse Match Fixtures
                  </button>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in">
                  {/* Simulation Status Card */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                          {simulationComplete ? 'Full Time (Concluded)' : `Live Match Clock: ${simMinute}'`}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-700">
                        Stake: ₦{simulatingSlip.stake.toLocaleString()} • Odds: {simulatingSlip.totalOdds}x
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${simProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Matches on Ticket Live Scores */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Live Ticket Scorelines
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {simulatingSlip.selections.map((sel) => {
                        const sc = simScores[sel.fixtureId] || { home: 0, away: 0 };
                        return (
                          <div
                            key={sel.fixtureId}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="text-xs font-extrabold text-slate-900">
                                {sel.matchTitle}
                              </span>
                              <p className="text-[10px] text-emerald-700">
                                Target Pick: {sel.pickLabel} ({sel.odds.toFixed(2)}x)
                              </p>
                            </div>

                            <div className="text-right font-mono">
                              <div className="text-base font-black text-slate-900 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200">
                                {sc.home} - {sc.away}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Commentary Feed */}
                  <div className="p-4 rounded-3xl bg-white border border-slate-200 space-y-2 font-mono text-xs shadow-xs">
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 font-sans">
                      Match Highlights & Commentary
                    </h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {commentaryLog.map((log, i) => (
                        <p
                          key={i}
                          className={`text-[11px] ${
                            i === 0 ? 'text-amber-700 font-bold animate-pulse' : 'text-slate-600'
                          }`}
                        >
                          {log}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Outcome Result Card */}
                  {simulationComplete && (
                    <div
                      className={`p-5 rounded-3xl border text-center space-y-3 animate-in zoom-in-95 duration-200 ${
                        simWon
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-md'
                          : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}
                    >
                      <div className="text-4xl">{simWon ? '🎉' : '💔'}</div>
                      <h3 className="text-lg font-black">
                        {simWon ? 'BOOM! BET SLIP WON!' : 'BET SLIP LOST'}
                      </h3>
                      <p className="text-xs max-w-sm mx-auto">
                        {simWon
                          ? `Congratulations! All selections came through! +₦${simulatingSlip.potentialPayout.toLocaleString()} credited to your student wallet!`
                          : 'One or more selections did not hit. Check the fixtures and try another accumulator.'}
                      </p>
                      <button
                        onClick={() => setActiveTab('fixtures')}
                        className="py-2.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-sm"
                      >
                        Place Another Bet
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BET SLIP HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 max-w-2xl mx-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Betting Slips & History
              </h4>

              {activeBetSlips.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-slate-400 text-xs shadow-xs">
                  <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p>You have not placed any bet slips yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeBetSlips.map((slip) => (
                    <div
                      key={slip.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs font-mono shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              slip.status === 'won'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : slip.status === 'lost'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {slip.status.toUpperCase()}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {new Date(slip.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-800 font-sans text-xs font-bold">
                          {slip.selections.length} Matches • {slip.totalOdds}x Total Odds
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase">Stake: ₦{slip.stake.toLocaleString()}</p>
                        <p
                          className={`font-black text-sm ${
                            slip.status === 'won' ? 'text-emerald-700' : 'text-slate-700'
                          }`}
                        >
                          ₦{slip.potentialPayout.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
