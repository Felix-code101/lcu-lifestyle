import React from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, CheckCircle2, X, Gift } from 'lucide-react';

export const QuestsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { quests, claimQuest } = useGame();

  return (
    <div className="flex flex-col h-full text-slate-800">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Student Academic Goals & Milestones</h3>
            <p className="text-xs text-slate-500">Complete semester achievements to claim cash allowances</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
        {quests.map((quest) => {
          const isReadyToClaim = !quest.completed && quest.progress >= quest.maxProgress;
          const progressPercent = Math.min(
            100,
            Math.round((quest.progress / quest.maxProgress) * 100)
          );

          return (
            <div
              key={quest.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                quest.completed
                  ? 'bg-slate-50 border-slate-200 opacity-70'
                  : isReadyToClaim
                  ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {quest.completed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    <span>{quest.title}</span>
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Progress: {quest.progress} / {quest.maxProgress} ({progressPercent}%)
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold">
                  <span>+₦{quest.reward.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    quest.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                {quest.completed ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                  </span>
                ) : isReadyToClaim ? (
                  <button
                    onClick={() => claimQuest(quest.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 animate-bounce"
                  >
                    <Gift className="w-3.5 h-3.5" /> Claim ₦{quest.reward.toLocaleString()}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-mono">In Progress</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
