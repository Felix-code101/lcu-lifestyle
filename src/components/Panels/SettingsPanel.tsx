import React from 'react';
import { useGame, ROOM_THEMES } from '../../context/GameContext';
import { Settings, X, Palette, SunMoon, Camera } from 'lucide-react';

export const SettingsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    theme,
    setTheme,
    dayNightCycle,
    setDayNightCycle,
    triggerResetCamera,
  } = useGame();

  return (
    <div className="flex flex-col h-full text-slate-800">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700 border border-cyan-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Display & Controls</h3>
            <p className="text-xs text-slate-500">Configure visual themes and isometric rendering</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
        {/* Room Theme Section */}
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 mb-2.5">
            <Palette className="w-3.5 h-3.5 text-indigo-600" /> Room Aesthetic & Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROOM_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  theme.id === t.id
                    ? 'bg-indigo-50 border-indigo-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{t.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Preset palette</div>
                </div>
                <div
                  className="w-4 h-4 rounded-full border border-slate-300"
                  style={{ backgroundColor: t.floorColor }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-slate-200 space-y-2.5">
          {/* Dynamic Day/Night Cycle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <SunMoon className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-xs font-bold text-slate-900">Dynamic Day/Night Lighting</div>
                <div className="text-[10px] text-slate-500">Shift sunlight, shadows, and ambiance over time</div>
              </div>
            </div>
            <button
              onClick={() => setDayNightCycle((p) => !p)}
              className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                dayNightCycle ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  dayNightCycle ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Camera Reset */}
        <div className="pt-2 border-t border-slate-200">
          <button
            onClick={() => {
              triggerResetCamera();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-all active:scale-98 border border-slate-200"
          >
            <Camera className="w-4 h-4 text-cyan-600" />
            <span>Reset Orthographic Isometric Camera</span>
          </button>
        </div>
      </div>
    </div>
  );
};
