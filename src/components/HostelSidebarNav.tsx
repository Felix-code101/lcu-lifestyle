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
      className={`absolute top-20 left-4 z-20 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-80' : 'w-12'
      }`}
    >
      {/* Floating Panel Container */}
      <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl overflow-hidden text-slate-800 transition-all">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
          className="absolute top-3.5 right-3 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-600 transition-colors z-10"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {isOpen ? (
          <div className="p-4 flex flex-col gap-3.5 max-h-[82vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-2.5 pr-8">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                  Hostel Life Hub
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  Liids University (LU) • Ibadan
                </span>
              </div>
            </div>

            {/* Prompt / Welcome Banner (as in image_19.png) */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200/80 shadow-sm text-xs leading-relaxed text-slate-700">
              <div className="flex items-start gap-2 mb-1 text-blue-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Visit Campus Locations</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Welcome to Liids University Hostel Life. Visit locations like the Cafeteria or Faculty to
                earn CGPA, recharge energy, and build your student career!
              </p>
            </div>

            {/* Quick Hostel Actions (If at hostel) */}
            {isHostel && (
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
                  Hostel Room Actions
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={handleHostelNap}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-center group"
                  >
                    <Bed className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-700">Sleep</span>
                    <span className="text-[9px] text-emerald-600 font-mono">+30⚡</span>
                  </button>

                  <button
                    onClick={handleHostelStudy}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all text-center group"
                  >
                    <Laptop className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-700">Study</span>
                    <span className="text-[9px] text-blue-600 font-mono">+CGPA</span>
                  </button>

                  <button
                    onClick={handleDrinkWater}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 transition-all text-center group"
                  >
                    <Droplets className="w-4 h-4 text-cyan-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-700">Hydrate</span>
                    <span className="text-[9px] text-cyan-600 font-mono">+12⚡</span>
                  </button>
                </div>
              </div>
            )}

            {/* Campus Travel Cards */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
                <span>Fast Travel Destinations</span>
                <span className="text-emerald-600 font-mono">Current: {stats.energy}⚡</span>
              </div>

              {/* 3D Campus Map Quick Tile */}
              <button
                onClick={() => navigateToLocation('campus_map')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight">3D Isometric Campus Map</div>
                    <div className="text-[10px] text-emerald-100">Explore all 17 LU landmarks</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-100 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Campus Locations List */}
              {CAMPUS_LOCATIONS.filter((l) => l.id !== 'campus_map' && l.id !== currentLocation).map(
                (loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        {getLocationIcon(loc.id)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{loc.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
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
                      className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 rounded-lg shadow-xs transition-colors"
                    >
                      Visit
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          /* Collapsed Icon Bar */
          <div className="py-4 flex flex-col items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
              title="Open Campus Navigator"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateToLocation('campus_map')}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              title="3D Campus Map"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
