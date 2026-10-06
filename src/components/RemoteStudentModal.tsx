import React from 'react';
import type { RemotePlayer } from '../types/game';
import { useGame } from '../context/GameContext';
import {
  Crown,
  Backpack,
  X,
  Send,
  MapPin,
  Smile,
} from 'lucide-react';

interface RemoteStudentModalProps {
  player: RemotePlayer;
  onClose: () => void;
}

export const RemoteStudentModal: React.FC<RemoteStudentModalProps> = ({ player, onClose }) => {
  const { spendBalance, addToast } = useGame();

  const handleWave = () => {
    addToast(`👋 You waved hello to ${player.username}! They noticed you!`, 'success');
  };

  const handleSendGift = () => {
    if (spendBalance(1000)) {
      addToast(`🎁 Sent ₦1,000 cash gift to ${player.username}!`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Student Avatar & Status */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-2xl font-black text-white shadow-md border border-emerald-400">
              {player.username.charAt(0)}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900 tracking-tight">{player.username}</h3>
          <span className="text-xs text-slate-500 font-mono mt-0.5">{player.matricNo}</span>

          {/* Socioeconomic Badge */}
          <div className="mt-2">
            {player.status === 'nepo' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                👑 Nepo Baby (Silver Spoon)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black">
                <Backpack className="w-3.5 h-3.5 text-emerald-600" />
                🎒 Lapo Hustler (Self-Made)
              </span>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="my-4 space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Department</span>
            <span className="font-bold text-slate-900 text-right truncate max-w-[170px]">
              {player.department}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
            <span className="text-slate-500">Academic Standing</span>
            <span className="font-bold text-emerald-700">{player.level}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
            <span className="text-slate-500">Current Location</span>
            <span className="font-bold text-amber-700 capitalize flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-600" />
              {player.location.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={handleWave}
            className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-slate-200"
          >
            <Smile className="w-4 h-4 text-amber-600" />
            <span>Wave 👋</span>
          </button>
          <button
            onClick={handleSendGift}
            className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send ₦1,000</span>
          </button>
        </div>
      </div>
    </div>
  );
};
