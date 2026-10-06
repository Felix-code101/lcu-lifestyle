import React from 'react';
import type { Landmark3D, TransitMode } from '../types/game';
import { useGame } from '../context/GameContext';
import {
  X,
  Zap,
  Flame,
  Coins,
  Clock,
  Compass,
  AlertCircle,
  Footprints,
} from 'lucide-react';

interface TransitModalProps {
  landmark: Landmark3D;
  onClose: () => void;
  onSelectTransit: (mode: TransitMode) => void;
}

export const TransitModal: React.FC<TransitModalProps> = ({
  landmark,
  onClose,
  onSelectTransit,
}) => {
  const { stats } = useGame();

  const canTrek = stats.energy >= 20;
  const canBoardKeke = stats.balance >= 250 && stats.energy >= 2;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-auto animate-in slide-in-from-bottom duration-200">
      <div className="p-5 sm:p-6 rounded-3xl bg-white/98 backdrop-blur-2xl border border-slate-200 shadow-2xl text-slate-800 flex flex-col gap-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
              {landmark.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {landmark.name}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200/80">
                  {landmark.category}
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium line-clamp-1">
                {landmark.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Short Destination Overview & Distance */}
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 rounded-xl px-3.5 py-2 border border-slate-100">
          <span className="flex items-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Campus Transit Route</span>
          </span>
          <span className="flex items-center gap-1 font-mono text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Est. ~{landmark.travelMinutes} mins travel</span>
          </span>
        </div>

        {/* Two Interactive Transit Option Cards Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: 🚶 Trek Am (Walking) */}
          <div
            className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
              canTrek
                ? 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-200/90 hover:border-emerald-400 hover:shadow-lg'
                : 'bg-slate-50/80 border-slate-200 opacity-75'
            }`}
          >
            <div>
              {/* Badge & Title */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Free
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 font-mono">
                    ⏱️ 3.1s trek
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-emerald-700">
                  ₦0
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    🚶 Trek Am
                  </h4>
                  <p className="text-[11px] text-slate-500">Walking on foot</p>
                </div>
              </div>

              {/* Effects List */}
              <div className="space-y-1.5 my-3 text-[11px]">
                <div className="flex items-center justify-between text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 font-medium">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-rose-500" /> Energy
                  </span>
                  <span className="font-bold font-mono">-20% ⚡</span>
                </div>
                <div className="flex items-center justify-between text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100 font-medium">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" /> Fitness XP
                  </span>
                  <span className="font-bold font-mono">+15 XP 🔥</span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div>
              <button
                disabled={!canTrek}
                onClick={() => onSelectTransit('trek')}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                  canTrek
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>Start Trekking</span>
              </button>
              {!canTrek && (
                <p className="text-[10px] text-rose-500 text-center mt-1.5 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Too tired! Grab food or rest first</span>
                </p>
              )}
            </div>
          </div>

          {/* Card 2: 🛺 Enter Keke (Tricycle) */}
          <div
            className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
              canBoardKeke
                ? 'bg-gradient-to-b from-white to-amber-50/40 border-amber-200/90 hover:border-amber-400 hover:shadow-lg'
                : 'bg-slate-50/80 border-slate-200 opacity-75'
            }`}
          >
            <div>
              {/* Badge & Title */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                    Fast Transit
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 font-mono">
                    ⚡ 2.5s ride
                  </span>
                </div>
                <span className="text-xs font-black font-mono text-amber-800">
                  ₦250
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center text-base">
                  🛺
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Enter Keke
                  </h4>
                  <p className="text-[11px] text-slate-500">LU Shuttle Tricycle</p>
                </div>
              </div>

              {/* Effects List */}
              <div className="space-y-1.5 my-3 text-[11px]">
                <div className="flex items-center justify-between text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 font-medium">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-600" /> Fare
                  </span>
                  <span className="font-bold font-mono">₦250</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60 font-medium">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> Energy
                  </span>
                  <span className="font-bold font-mono">-2% ⚡</span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div>
              <button
                disabled={!canBoardKeke}
                onClick={() => onSelectTransit('keke')}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 ${
                  canBoardKeke
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-600/20 cursor-pointer font-black'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>Board Keke</span>
              </button>

              {stats.balance < 250 && (
                <p className="text-[10px] text-amber-600 text-center mt-1.5 font-bold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Pocket dry, trek am!</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
