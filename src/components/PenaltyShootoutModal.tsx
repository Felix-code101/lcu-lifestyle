import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import {
  Trophy,
  X,
  Target,
  Zap,
  Shield,
  Flame,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

type TargetZone = 'top_left' | 'top_right' | 'low_left' | 'low_right';

interface ShotRecord {
  round: number;
  playerScored: boolean;
  playerZone: TargetZone;
  aiKeeperZone: TargetZone;
  aiScored: boolean;
  aiZone: TargetZone;
  playerKeeperZone: TargetZone;
}

const ZONE_LABELS: Record<TargetZone, { label: string; desc: string }> = {
  top_left: { label: 'Top Left', desc: 'Upper 90 Curler' },
  top_right: { label: 'Top Right', desc: 'Top Corner Rocket' },
  low_left: { label: 'Low Left', desc: 'Driven Grasscutter' },
  low_right: { label: 'Low Right', desc: 'Bottom Corner Inside Post' },
};

export const PenaltyShootoutModal: React.FC = () => {
  const {
    stats,
    isPenaltyModalOpen,
    setIsPenaltyModalOpen,
    completePenaltyShootout,
    addToast,
  } = useGame();

  // Game Phase: 'stake_selection' | 'attacking' | 'defending' | 'round_result' | 'match_over'
  const [phase, setPhase] = useState<'stake_selection' | 'attacking' | 'defending' | 'round_result' | 'match_over'>('stake_selection');

  // Match State
  const [stake, setStake] = useState<number>(2000);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [history, setHistory] = useState<ShotRecord[]>([]);

  // Attacking Phase Inputs
  const [selectedAttackZone, setSelectedAttackZone] = useState<TargetZone>('top_right');
  const [power, setPower] = useState<number>(80);
  const [isChargingPower, setIsChargingPower] = useState<boolean>(true);
  const powerDirectionRef = useRef<number>(1);

  // Defending Phase Inputs
  const [selectedDefenseZone, setSelectedDefenseZone] = useState<TargetZone>('top_right');

  // Animation State
  const [isShotAnimating, setIsShotAnimating] = useState<boolean>(false);
  const [animationMessage, setAnimationMessage] = useState<string>('');
  const [lastRoundEvent, setLastRoundEvent] = useState<{
    type: 'attack' | 'defense';
    scored: boolean;
    zone: TargetZone;
    keeperZone: TargetZone;
    commentary: string;
  } | null>(null);

  // Dynamic Power Meter Oscillation (Sweet Spot: 70% - 90%)
  useEffect(() => {
    if (phase !== 'attacking' || !isChargingPower) return;
    const interval = setInterval(() => {
      setPower((prev) => {
        let next = prev + powerDirectionRef.current * 4;
        if (next >= 100) {
          next = 100;
          powerDirectionRef.current = -1;
        } else if (next <= 30) {
          next = 30;
          powerDirectionRef.current = 1;
        }
        return next;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [phase, isChargingPower]);

  if (!isPenaltyModalOpen) return null;

  // Start the Shootout Duel
  const handleStartMatch = () => {
    if (stats.balance < stake) {
      addToast(`❌ Insufficient student funds for ₦${stake.toLocaleString()} stake!`, 'warning');
      return;
    }
    if (stats.energy < 15) {
      addToast('❌ Too fatigued for high-stakes penalties! Need at least 15⚡ Energy.', 'warning');
      return;
    }

    setPlayerScore(0);
    setAiScore(0);
    setCurrentRound(1);
    setHistory([]);
    setPhase('attacking');
    setIsChargingPower(true);
    setLastRoundEvent(null);
  };

  // Execute Player's Penalty Kick
  const handleExecuteKick = () => {
    if (isShotAnimating) return;
    setIsChargingPower(false);
    setIsShotAnimating(true);
    setAnimationMessage('Striker runs up to the spot...');

    // AI Goalkeeper Dive Logic
    const zones: TargetZone[] = ['top_left', 'top_right', 'low_left', 'low_right'];
    // 35% chance keeper guesses correctly, or randomized
    const keeperDive = Math.random() < 0.35 ? selectedAttackZone : zones[Math.floor(Math.random() * zones.length)];

    setTimeout(() => {
      let scored = false;
      let commentary = '';

      // Overpowered penalty risk
      if (power >= 96) {
        scored = false;
        commentary = '🚀 OVER THE CROSSBAR! Blasted with too much adrenaline!';
      } else if (keeperDive === selectedAttackZone) {
        // Keeper went the right way!
        if (power >= 78 && Math.random() < 0.4) {
          scored = true;
          commentary = '⚽ GOAL! Powered through the keeper’s gloves into the roof of the net!';
        } else {
          scored = false;
          commentary = '🧤 SPECTACULAR SAVE! Varsity keeper Tobi guessed right and parried it clear!';
        }
      } else {
        // Keeper went wrong way
        scored = true;
        commentary = `⚽ GOOOOOAL! Sent keeper the wrong way into ${ZONE_LABELS[selectedAttackZone].label}!`;
      }

      const newPlayerScore = scored ? playerScore + 1 : playerScore;
      setPlayerScore(newPlayerScore);
      setAnimationMessage(commentary);

      setLastRoundEvent({
        type: 'attack',
        scored,
        zone: selectedAttackZone,
        keeperZone: keeperDive,
        commentary,
      });

      // After attack completes, transition to defending phase
      setTimeout(() => {
        setIsShotAnimating(false);
        setAnimationMessage('');
        setPhase('defending');
      }, 2200);
    }, 1200);
  };

  // Execute Goalkeeper Dive (Defending)
  const handleExecuteDive = () => {
    if (isShotAnimating) return;
    setIsShotAnimating(true);
    setAnimationMessage('Tobi strikes the ball towards your net...');

    const zones: TargetZone[] = ['top_left', 'top_right', 'low_left', 'low_right'];
    const aiTargetZone = zones[Math.floor(Math.random() * zones.length)];

    setTimeout(() => {
      let aiScored = false;
      let commentary = '';

      if (selectedDefenseZone === aiTargetZone) {
        // Player guessed AI's shot!
        aiScored = false;
        commentary = '🧤 WHAT A SAVE! You anticipated the trajectory and denied the varsity striker!';
      } else {
        // AI scores
        aiScored = true;
        commentary = `⚽ HE SCORES! Tobi fired clinical into ${ZONE_LABELS[aiTargetZone].label}!`;
      }

      const newAiScore = aiScored ? aiScore + 1 : aiScore;
      setAiScore(newAiScore);
      setAnimationMessage(commentary);

      // Record this round
      const roundRecord: ShotRecord = {
        round: currentRound,
        playerScored: lastRoundEvent?.scored ?? false,
        playerZone: lastRoundEvent?.zone ?? 'top_right',
        aiKeeperZone: lastRoundEvent?.keeperZone ?? 'top_left',
        aiScored,
        aiZone: aiTargetZone,
        playerKeeperZone: selectedDefenseZone,
      };

      setHistory((prev) => [...prev, roundRecord]);

      setTimeout(() => {
        setIsShotAnimating(false);
        setAnimationMessage('');

        // Check if shootout should conclude or move to next round
        const nextRound = currentRound + 1;

        // If completed 3 rounds (or sudden death resolution)
        if (currentRound >= 3) {
          if (playerScore !== newAiScore) {
            // Match is decided!
            finalizeMatch(playerScore > newAiScore);
            return;
          }
          // Sudden death if tied after 3 rounds
          setCurrentRound(nextRound);
          setPhase('attacking');
          setIsChargingPower(true);
          addToast('⚖️ Scores Tied! Moving into Sudden Death Rounds!', 'info');
        } else {
          setCurrentRound(nextRound);
          setPhase('attacking');
          setIsChargingPower(true);
        }
      }, 2200);
    }, 1200);
  };

  // Finalize the Match
  const finalizeMatch = (playerWon: boolean) => {
    setPhase('match_over');
    completePenaltyShootout(playerWon, stake);
  };

  const handleClose = () => {
    setIsPenaltyModalOpen(false);
    setPhase('stake_selection');
  };

  const isPlayerWinner = playerScore > aiScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-auto bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-800 animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center text-xl shadow-xs">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  1v1 Varsity Penalty Shootout
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                  Best of 3
                </span>
              </div>
              <p className="text-xs text-slate-500">
                LU Arena Turf • Challenger vs Tobi "The Wall"
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* SCREEN 1: STAKE & CHALLENGE SELECTION */}
          {phase === 'stake_selection' && (
            <div className="space-y-6">
              {/* Opponent Card */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-3xl flex items-center justify-center shadow-xs border border-amber-300 shrink-0">
                  🧤
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">Tobi "The Wall"</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Titans 1st-Choice
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "Step up to the 12-yard spot! Best of 3 strikes. Score more than me or forfeit your stake!"
                  </p>
                </div>
              </div>

              {/* Stake Chips Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Enter Your Wager Stake</span>
                  <span className="text-emerald-700 font-mono">
                    Wallet: ₦{stats.balance.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[1000, 2000, 5000, 10000, 20000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setStake(amt)}
                      className={`py-2.5 px-1 rounded-2xl font-mono text-xs font-black transition-all cursor-pointer border ${
                        stake === amt
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      ₦{amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Potential Rewards Breakdown */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Match Stake:</span>
                  <span className="font-bold font-mono text-slate-900">₦{stake.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t border-emerald-200 pt-1.5">
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    Victory Payout (2x):
                  </span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    ₦{(stake * 2).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-emerald-200 pt-1.5 text-slate-600">
                  <span>Fitness & Mood Rewards:</span>
                  <span className="font-bold text-teal-700">+30 Fitness XP • +25 Mood</span>
                </div>
              </div>

              {/* Kickoff Button */}
              <button
                onClick={handleStartMatch}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <span>⚽ Kickoff 1v1 Penalty Duel</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* SCREEN 2 & 3: ACTIVE SHOOTOUT (ATTACKING & DEFENDING) */}
          {(phase === 'attacking' || phase === 'defending') && (
            <div className="space-y-4">
              {/* Scoreboard Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-xs">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase">You (Striker)</p>
                  <p className="text-lg font-black text-emerald-700">{playerScore}</p>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {currentRound > 3 ? `SUDDEN DEATH (R${currentRound})` : `ROUND ${currentRound} OF 3`}
                  </span>
                  {history.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                      {history.map((h, i) => (
                        <span key={i} title={`R${h.round}: You ${h.playerScored ? '⚽' : '❌'} | AI ${h.aiScored ? '⚽' : '❌'}`}>
                          {h.playerScored ? '🟢' : '🔴'}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-[11px] text-amber-700 font-bold mt-0.5">
                    ₦{(stake * 2).toLocaleString()} Stake Prize
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Tobi (Keeper)</p>
                  <p className="text-lg font-black text-rose-600">{aiScore}</p>
                </div>
              </div>

              {/* Turn Banner */}
              <div
                className={`p-2.5 rounded-2xl text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 ${
                  phase === 'attacking'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                }`}
              >
                {phase === 'attacking' ? (
                  <>
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span>Phase 1: ATTACKING — Select Corner & Unleash Kick</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span>Phase 2: DEFENDING — Predict Shot & Dive to Save</span>
                  </>
                )}
              </div>

              {/* Goal Visual Frame with 4 Target Corners */}
              <div className="relative w-full h-52 sm:h-56 bg-gradient-to-b from-emerald-800 via-emerald-700 to-green-800 rounded-3xl border-4 border-white shadow-lg p-4 flex flex-col justify-between overflow-hidden">
                {/* Net Texture Overlay */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                    backgroundSize: '16px 16px',
                  }}
                />

                {/* Goalkeeper Position Graphic in Goal Center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`w-20 h-24 rounded-2xl flex flex-col items-center justify-center text-4xl shadow-md transition-all duration-300 ${
                      isShotAnimating
                        ? 'scale-125 rotate-6'
                        : 'animate-pulse'
                    }`}
                  >
                    {phase === 'attacking' ? '🧤' : '🧍'}
                  </div>
                </div>

                {/* Top Row Targets (Top Left & Top Right) */}
                <div className="flex items-center justify-between z-10">
                  {/* Top Left */}
                  <button
                    disabled={isShotAnimating}
                    onClick={() =>
                      phase === 'attacking'
                        ? setSelectedAttackZone('top_left')
                        : setSelectedDefenseZone('top_left')
                    }
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer backdrop-blur-md flex flex-col items-center ${
                      (phase === 'attacking' ? selectedAttackZone : selectedDefenseZone) === 'top_left'
                        ? 'bg-amber-400 text-slate-950 border-white shadow-lg scale-105'
                        : 'bg-white/80 hover:bg-white text-slate-900 border-white/60'
                    }`}
                  >
                    <span className="text-xs font-black">Top Left</span>
                    <span className="text-[10px] opacity-80">Upper 90</span>
                  </button>

                  {/* Top Right */}
                  <button
                    disabled={isShotAnimating}
                    onClick={() =>
                      phase === 'attacking'
                        ? setSelectedAttackZone('top_right')
                        : setSelectedDefenseZone('top_right')
                    }
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer backdrop-blur-md flex flex-col items-center ${
                      (phase === 'attacking' ? selectedAttackZone : selectedDefenseZone) === 'top_right'
                        ? 'bg-amber-400 text-slate-950 border-white shadow-lg scale-105'
                        : 'bg-white/80 hover:bg-white text-slate-900 border-white/60'
                    }`}
                  >
                    <span className="text-xs font-black">Top Right</span>
                    <span className="text-[10px] opacity-80">Top Rocket</span>
                  </button>
                </div>

                {/* Bottom Row Targets (Low Left & Low Right) */}
                <div className="flex items-center justify-between z-10">
                  {/* Low Left */}
                  <button
                    disabled={isShotAnimating}
                    onClick={() =>
                      phase === 'attacking'
                        ? setSelectedAttackZone('low_left')
                        : setSelectedDefenseZone('low_left')
                    }
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer backdrop-blur-md flex flex-col items-center ${
                      (phase === 'attacking' ? selectedAttackZone : selectedDefenseZone) === 'low_left'
                        ? 'bg-amber-400 text-slate-950 border-white shadow-lg scale-105'
                        : 'bg-white/80 hover:bg-white text-slate-900 border-white/60'
                    }`}
                  >
                    <span className="text-xs font-black">Low Left</span>
                    <span className="text-[10px] opacity-80">Grasscutter</span>
                  </button>

                  {/* Low Right */}
                  <button
                    disabled={isShotAnimating}
                    onClick={() =>
                      phase === 'attacking'
                        ? setSelectedAttackZone('low_right')
                        : setSelectedDefenseZone('low_right')
                    }
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer backdrop-blur-md flex flex-col items-center ${
                      (phase === 'attacking' ? selectedAttackZone : selectedDefenseZone) === 'low_right'
                        ? 'bg-amber-400 text-slate-950 border-white shadow-lg scale-105'
                        : 'bg-white/80 hover:bg-white text-slate-900 border-white/60'
                    }`}
                  >
                    <span className="text-xs font-black">Low Right</span>
                    <span className="text-[10px] opacity-80">Inside Post</span>
                  </button>
                </div>
              </div>

              {/* Attacking: Power Meter Slider */}
              {phase === 'attacking' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Shot Power: {power}%
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        power >= 95
                          ? 'bg-rose-100 text-rose-800'
                          : power >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {power >= 95 ? '⚠️ Risk Overbar' : power >= 75 ? '⚡ Sweet Spot' : 'Safe Low'}
                    </span>
                  </div>

                  {/* Power Bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300">
                    <div
                      className={`h-full rounded-full transition-all duration-75 ${
                        power >= 95
                          ? 'bg-rose-500'
                          : power >= 75
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${power}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Shoot / Dive Button */}
              {phase === 'attacking' ? (
                <button
                  disabled={isShotAnimating}
                  onClick={handleExecuteKick}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span>UNLEASH STRIKE ({ZONE_LABELS[selectedAttackZone].label})</span>
                </button>
              ) : (
                <button
                  disabled={isShotAnimating}
                  onClick={handleExecuteDive}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  <Shield className="w-5 h-5" />
                  <span>DIVE AS KEEPER ({ZONE_LABELS[selectedDefenseZone].label})</span>
                </button>
              )}

              {/* Live Commentary Callout */}
              {animationMessage && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center text-xs font-bold text-amber-900 animate-in fade-in">
                  {animationMessage}
                </div>
              )}
            </div>
          )}

          {/* SCREEN 4: MATCH CONCLUDED (VICTORY / DEFEAT) */}
          {phase === 'match_over' && (
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
              <div
                className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-md border ${
                  isPlayerWinner
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-rose-500 text-white border-rose-400'
                }`}
              >
                {isPlayerWinner ? '🏆' : '💔'}
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {isPlayerWinner ? 'PENALTY SHOOTOUT CHAMPION!' : 'DEFEATED IN THE SHOOTOUT'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isPlayerWinner
                    ? `You outclassed Tobi "The Wall" with a clinical ${playerScore}-${aiScore} victory!`
                    : `Varsity keeper Tobi prevailed ${aiScore}-${playerScore}. Regroup and challenge him again!`}
                </p>
              </div>

              {/* Final Score Badge */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 max-w-sm mx-auto font-mono">
                <div className="text-xs text-slate-500 mb-1">Final Scoreline</div>
                <div className="text-3xl font-black text-slate-900">
                  <span className="text-emerald-700">{playerScore}</span>
                  <span className="text-slate-400 mx-2">-</span>
                  <span className="text-rose-600">{aiScore}</span>
                </div>
              </div>

              {/* Payout & Effects Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Stake:</span>
                  <span className="font-mono font-bold text-slate-900">₦{stake.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                  <span className="font-bold text-slate-700">Wallet Outcome:</span>
                  <span
                    className={`font-mono font-black text-sm ${
                      isPlayerWinner ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {isPlayerWinner
                      ? `+₦${(stake * 2).toLocaleString()} Won!`
                      : `-₦${stake.toLocaleString()} Lost`}
                  </span>
                </div>
                {isPlayerWinner && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-teal-700 font-bold">
                    <span>Performance Perks:</span>
                    <span>+30 Fitness XP • +25 Mood</span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartMatch}
                  className="w-1/2 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Rematch</span>
                </button>
                <button
                  onClick={handleClose}
                  className="w-1/2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Exit to Arena
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
