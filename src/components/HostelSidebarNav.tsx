import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CAMPUS_LOCATIONS } from '../data/campusData';
import type { GameLocation } from '../types/game';
import {
  Compass,
  MapPin,
  Utensils,
  GraduationCap,
  BookOpen,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Bed,
  Laptop,
  Droplets,
  ExternalLink,
} from 'lucide-react';

export const HostelSidebarNav: React.FC = () => {
  const { currentLocation, navigateToLocation, stats, performActivity, addToast } = useGame();
  const [isOpen, setIsOpen] = useState(true);

  const isHostel = currentLocation === 'home_hostel';

  const getLocationIcon = (id: GameLocation) => {
    switch (id) {
      case 'cafeteria':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'lecture_theatre':
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case 'library':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'sports_arena':
        return <Trophy className="w-4 h-4 text-pink-500" />;
      default:
        return <MapPin className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleVisit = (locId: GameLocation, energyCost: number) => {
    if (stats.energy < energyCost) {
      addToast(`⚠️ Too tired! Need at least ${energyCost}⚡ energy to travel.`, 'warning');
      return;
    }
    navigateToLocation(locId);
  };

  // Quick In-Hostel Activities
  const handleHostelNap = () => {
    performActivity({
      id: 'quick_nap',
      title: 'Power Nap on Bunk Bed',
      description: 'Rest on your hostel bed to recharge stamina.',
      energyCost: 0,
      cashCost: 0,
      cgpaGain: 0,
      moodGain: 15,
      energyGain: 30,
      durationMinutes: 45,
    });
  };

  const handleHostelStudy = () => {
    if (stats.energy < 15) {
      addToast('⚠️ Too exhausted to study. Take a nap first!', 'warning');
      return;
    }
    performActivity({
      id: 'hostel_revision',
      title: 'Study at Student Desk',
      description: 'Review lecture notes and course handouts on your laptop.',
      energyCost: 15,
      cashCost: 0,
      cgpaGain: 0.04,
      moodGain: -2,
      durationMinutes: 60,
    });
  };

  const handleDrinkWater = () => {
    performActivity({
      id: 'drink_water',
      title: 'Hydrate from Cooler & Gallons',
      description: 'Drink chilled fresh water to boost alertness.',
      energyCost: 0,
      cashCost: 0,
      cgpaGain: 0,
      moodGain: 10,
      energyGain: 12,
      durationMinutes: 5,
    });
  };

  return (
    <aside
      className={`fixed top-[92px] sm:top-24 left-2 sm:left-4 z-20 pointer-events-none transition-all duration-300 ease-in-out ${
        isOpen ? 'w-[calc(100vw-1rem)] sm:w-80 max-w-sm' : 'w-10 sm:w-12'
      }`}
    >
      {/* Floating Panel Container */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl overflow-hidden text-slate-800 pointer-events-auto flex flex-col max-h-[calc(100vh-11rem)] sm:max-h-[calc(100vh-8rem)]"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
          className="absolute top-2.5 right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-600 transition-colors z-10 cursor-pointer"
        >
          {isOpen ? <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        {isOpen ? (
          <>
            {/* Header (shrink-0) */}
            <div className="p-2.5 sm:p-3 flex items-center gap-2.5 pr-9 border-b border-slate-100 shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-none truncate">
                  Hostel Life Hub
                </h3>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold truncate block mt-0.5">
                  Liids University (LU) • Ibadan
                </span>
              </div>
            </div>

            {/* Scrollable Container with pb-24 to stop cleanly above bottom nav */}
            <div className="p-2 sm:p-3 flex flex-col gap-2.5 overflow-y-auto pb-24 sm:pb-6 flex-1">
              {/* Prompt / Welcome Banner */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200/80 shadow-2xs text-[11px] leading-relaxed text-slate-700">
                <div className="flex items-start gap-1.5 mb-0.5 text-blue-700 font-bold">
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Visit Campus Locations</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600">
                  Welcome to Liids University Hostel Life. Visit locations like the Cafeteria or Faculty to
                  earn CGPA, recharge energy, and build your student career!
                </p>
              </div>

              {/* Quick Hostel Actions (If at hostel) */}
              {isHostel && (
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
                    Hostel Room Actions
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={handleHostelNap}
                      className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-center group cursor-pointer"
                    >
                      <Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 mb-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Sleep</span>
                      <span className="text-[8px] sm:text-[9px] text-emerald-600 font-mono">+30⚡</span>
                    </button>

                    <button
                      onClick={handleHostelStudy}
                      className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all text-center group cursor-pointer"
                    >
                      <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mb-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Study</span>
                      <span className="text-[8px] sm:text-[9px] text-blue-600 font-mono">+CGPA</span>
                    </button>

                    <button
                      onClick={handleDrinkWater}
                      className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 transition-all text-center group cursor-pointer"
                    >
                      <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 mb-0.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-700">Hydrate</span>
                      <span className="text-[8px] sm:text-[9px] text-cyan-600 font-mono">+12⚡</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Campus Travel Cards */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
                  <span>Fast Travel Destinations</span>
                  <span className="text-emerald-600 font-mono">Current: {stats.energy}⚡</span>
                </div>

                {/* 3D Campus Map Quick Tile */}
                <button
                  onClick={() => navigateToLocation('campus_map')}
                  className="w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] sm:text-xs font-bold leading-tight">3D Isometric Campus Map</div>
                      <div className="text-[9px] sm:text-[10px] text-emerald-100">Explore all 17 LU landmarks</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-100 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Campus Locations List */}
                <div className="space-y-1.5 pt-0.5">
                  {CAMPUS_LOCATIONS.filter((l) => l.id !== 'campus_map' && l.id !== currentLocation).map(
                    (loc) => (
                      <div
                        key={loc.id}
                        className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-all gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0">
                            {getLocationIcon(loc.id)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">{loc.name}</div>
                            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-500 font-mono">
                              <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                                <Zap className="w-2.5 h-2.5" />
                                {loc.energyCost}⚡
                              </span>
                              <span>•</span>
                              <span>{loc.travelMinutes}m travel</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleVisit(loc.id, loc.energyCost)}
                          className="px-2.5 py-1 text-[11px] sm:text-xs font-bold bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
                        >
                          Visit
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Collapsed Icon Bar */
          <div className="py-3 flex flex-col items-center gap-2.5">
            <button
              onClick={() => setIsOpen(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-xs hover:scale-105 transition-transform cursor-pointer"
              title="Open Campus Navigator"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToLocation('campus_map')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Open 3D Campus Map"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
