import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { CampusNPC, NPCOption } from '../types/game';
import { MessageSquare, Sparkles, X, ArrowRight } from 'lucide-react';

interface NPCDialogueModalProps {
  npc: CampusNPC;
  onClose: () => void;
}

export const NPCDialogueModal: React.FC<NPCDialogueModalProps> = ({ npc, onClose }) => {
  const { stats, spendBalance, addBalance, performActivity, addToast } = useGame();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [npcResponse, setNpcResponse] = useState<string | null>(null);

  const displayedSpeech = npcResponse || npc.dialogueLines[currentLineIndex] || npc.dialogueIntro;

  const handleNextSpeech = () => {
    setNpcResponse(null);
    if (currentLineIndex < npc.dialogueLines.length - 1) {
      setCurrentLineIndex((prev) => prev + 1);
    } else {
      setCurrentLineIndex(0);
    }
  };

  const handleSelectOption = (option: NPCOption) => {
    // Check cash requirement
    if (option.cost && option.cost > 0) {
      if (stats.balance < option.cost) {
        addToast(`❌ Not enough cash! Requires ₦${option.cost.toLocaleString()}`, 'warning');
        return;
      }
      spendBalance(option.cost);
    }

    // Check energy requirement
    if (option.energyCost && option.energyCost > 0) {
      if (stats.energy < option.energyCost) {
        addToast(`❌ Too tired! Requires ${option.energyCost}⚡ energy`, 'warning');
        return;
      }
    }

    // Apply activity/effects
    performActivity({
      id: option.id,
      title: `${npc.name}: ${option.label}`,
      description: option.responseMessage,
      energyCost: option.energyCost || 0,
      cashCost: 0, // already deducted if cost was present
      cgpaGain: option.cgpaGain || 0,
      moodGain: option.moodGain || 0,
      energyGain: option.energyGain,
      durationMinutes: option.durationMinutes || 15,
    });

    if (option.cashGain) {
      addBalance(option.cashGain);
    }

    setNpcResponse(option.responseMessage);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-end justify-center pb-6 sm:pb-8 px-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 text-slate-800 animate-in slide-from-bottom-6 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* NPC Header */}
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-400/40 flex items-center justify-center text-2xl shadow-md shrink-0">
            {npc.avatarIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">{npc.name}</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                {npc.role}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">LU Campus Interaction</span>
          </div>
        </div>

        {/* Speech Bubble */}
        <div
          onClick={handleNextSpeech}
          className="cursor-pointer p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 text-sm sm:text-base leading-relaxed text-slate-800 mb-4 transition-colors relative group"
        >
          <div className="flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
            <p className="italic font-medium">"{displayedSpeech}"</p>
          </div>
          <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 group-hover:text-emerald-600 font-mono flex items-center gap-1 transition-colors">
            Click speech for more <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>

        {/* Action Options */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
            Interactive Choices
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {npc.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                className="flex flex-col justify-between p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white hover:from-emerald-50 hover:to-teal-50 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 leading-tight">
                    {opt.label}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-600 font-semibold">
                  {opt.rewardText}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
