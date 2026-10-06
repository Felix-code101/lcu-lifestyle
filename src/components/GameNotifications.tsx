import React from 'react';
import { useGame } from '../context/GameContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const GameNotifications: React.FC = () => {
  const { toasts, removeToast } = useGame();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
      {toasts.map((toast) => {
        let borderClass = 'border-indigo-500/50 bg-slate-900/90 text-slate-100';
        let icon = <Info className="w-4 h-4 text-indigo-400 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/50 bg-slate-900/90 text-emerald-200';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-slate-900/90 text-amber-200';
          icon = <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-md border shadow-xl transition-all animate-in slide-in-from-right duration-200 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
