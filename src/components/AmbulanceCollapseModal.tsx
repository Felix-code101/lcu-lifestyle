import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Activity,
  HeartPulse,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const AmbulanceCollapseModal: React.FC = () => {
  const { stats, admitToClinic } = useGame();
  const [flashingRed, setFlashingRed] = useState(true);

  // Siren beacon light toggle effect
  useEffect(() => {
    if (!stats.isCollapsed) return;
    const interval = setInterval(() => {
      setFlashingRed((prev) => !prev);
    }, 450);
    return () => clearInterval(interval);
  }, [stats.isCollapsed]);

  if (!stats.isCollapsed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-auto bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-300">
      {/* Background Emergency Flashing Glows */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-500 opacity-20 ${
          flashingRed
            ? 'bg-radial-gradient from-rose-600 via-transparent to-transparent'
            : 'bg-radial-gradient from-blue-600 via-transparent to-transparent'
        }`}
      />

      {/* Ambulance Modal Card */}
      <div className="relative w-full max-w-lg bg-white border-2 border-rose-500/80 rounded-3xl shadow-2xl overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        {/* Top Emergency Beacon Bar */}
        <div className="p-4 sm:px-6 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs transition-colors duration-300 ${
                flashingRed
                  ? 'bg-rose-600 border-rose-400 text-white shadow-rose-500/50'
                  : 'bg-blue-600 border-blue-400 text-white shadow-blue-500/50'
              }`}
            >
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-rose-800">
                  CRITICAL EXHAUSTION COLLAPSE
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                  Emergency
                </span>
              </div>
              <p className="text-xs text-slate-500">
                LU Emergency Response Unit • Code Blue
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Vitals Monitor Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-rose-200 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
              <span className="text-slate-600 flex items-center gap-1.5 font-bold">
                <HeartPulse className="w-4 h-4 text-rose-600 animate-pulse" />
                VITAL SIGNS MONITOR
              </span>
              <span className="text-rose-600 font-bold animate-pulse">0% ENERGY • CRITICAL</span>
            </div>

            {/* Simulated ECG Rhythm Graphic */}
            <div className="flex items-center justify-between py-2 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Student Name</p>
                <p className="text-slate-800 font-bold">{stats.username || 'Undergraduate'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase">Matriculation</p>
                <p className="text-slate-700 font-semibold">{stats.matricNo}</p>
              </div>
            </div>

            {/* Pulse Line Graphic */}
            <div className="relative h-10 w-full bg-white rounded-xl overflow-hidden flex items-center px-3 border border-slate-200">
              <div className="flex items-center gap-1 w-full text-rose-600 font-bold text-xs select-none overflow-hidden">
                <Activity className="w-6 h-6 animate-pulse shrink-0" />
                <span className="opacity-90 tracking-widest text-[11px] truncate">
                  - - - ⚡ 0% STAMINA DEPLETED ⚡ - - -
                </span>
              </div>
            </div>
          </div>

          {/* Incident Narrative */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1.5 text-slate-700">
            <p className="font-bold text-rose-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Triage Assessment:
            </p>
            <p className="leading-relaxed">
              You blacked out from severe physical exhaustion while moving across campus! The campus security squad alerted the 24/7 University Medical Centre. An emergency ambulance is standing by to evacuate you to the medical ward.
            </p>
          </div>

          {/* Admission Button */}
          <button
            onClick={admitToClinic}
            className="w-full py-4 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-3 transition-all active:scale-98 cursor-pointer"
          >
            <span>🚑 Admit to University Medical Centre Ward</span>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </button>

          {/* Clinic Perk Tip */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Restores +45%⚡ Energy & admits avatar to Medical Centre bed.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
