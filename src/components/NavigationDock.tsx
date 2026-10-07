import React from 'react';
import { useGame } from '../context/GameContext';
import type { NavTab } from '../types/game';
import {
  Map,
  Home,
  Store,
  Smartphone,
  Hammer,
  Package,
} from 'lucide-react';
import { BuildPanel } from './Panels/BuildPanel';
import { ShopPanel } from './Panels/ShopPanel';
import { QuestsPanel } from './Panels/QuestsPanel';
import { InventoryPanel } from './Panels/InventoryPanel';
import { SettingsPanel } from './Panels/SettingsPanel';

interface TabConfig {
  id: 'home' | 'shop' | 'map' | 'phone' | 'build' | 'inventory';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  glowColor: string;
}

export const NavigationDock: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    roomItems,
    quests,
    currentLocation,
    navigateToLocation,
    isPhoneOpen,
    setIsPhoneOpen,
  } = useGame();

  const unclaimedQuests = quests.filter((q) => !q.completed && q.progress >= q.maxProgress).length;

  const isHomeActive = currentLocation === 'home_hostel' && activeTab === null;
  const isMapActive = currentLocation === 'campus_map' && activeTab === null;

  const tabs: TabConfig[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      glowColor: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'shop',
      label: 'Buy',
      icon: Store,
      glowColor: 'from-amber-500 to-orange-500',
    },
    {
      id: 'map',
      label: 'Map',
      icon: Map,
      glowColor: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'phone',
      label: 'Phone',
      icon: Smartphone,
      badge: unclaimedQuests > 0 ? unclaimedQuests : undefined,
      glowColor: 'from-purple-500 to-pink-500',
    },
    {
      id: 'build',
      label: 'Build',
      icon: Hammer,
      glowColor: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      badge: roomItems.length,
      glowColor: 'from-emerald-500 to-teal-500',
    },
  ];

  const handleTabClick = (tab: TabConfig) => {
    if (tab.id === 'home') {
      navigateToLocation('home_hostel');
      setActiveTab(null);
      setIsPhoneOpen(false);
      return;
    }

    if (tab.id === 'map') {
      navigateToLocation('campus_map');
      setActiveTab(null);
      setIsPhoneOpen(false);
      return;
    }

    if (tab.id === 'phone') {
      setIsPhoneOpen((prev) => !prev);
      setActiveTab(null);
      return;
    }

    // Modal tabs (shop, build, inventory)
    setIsPhoneOpen(false);
    setActiveTab(activeTab === tab.id ? null : (tab.id as NavTab));
  };

  const closePanel = () => setActiveTab(null);

  return (
    <>
      {/* Floating Active Panel Drawer / Modal with Backdrop Dimming (z-50) */}
      {activeTab && activeTab !== 'map' && (
        <div
          onClick={closePanel}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pb-24 sm:pb-6 bg-slate-900/40 backdrop-blur-xs pointer-events-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg p-3 sm:p-6 rounded-3xl bg-white/98 backdrop-blur-2xl border border-slate-200 shadow-2xl max-h-[85vh] flex flex-col transition-all overflow-y-auto"
          >
            {activeTab === 'build' && <BuildPanel onClose={closePanel} />}
            {activeTab === 'shop' && <ShopPanel onClose={closePanel} />}
            {activeTab === 'inventory' && <InventoryPanel onClose={closePanel} />}
            {activeTab === 'quests' && <QuestsPanel onClose={closePanel} />}
            {activeTab === 'settings' && <SettingsPanel onClose={closePanel} />}
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Dock (Fixed, bottom: 0, z-index: 40) */}
      <nav className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-3 z-40 sm:w-auto pointer-events-none flex justify-center">
        <div className="w-full sm:w-auto flex items-center justify-around sm:justify-center gap-0.5 sm:gap-1.5 p-1 sm:p-2 bg-white/95 backdrop-blur-xl border-t sm:border border-slate-200/90 sm:rounded-3xl shadow-2xl pointer-events-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              (tab.id === 'home' && isHomeActive && !isPhoneOpen) ||
              (tab.id === 'map' && isMapActive && !isPhoneOpen) ||
              (tab.id === 'phone' && isPhoneOpen) ||
              (!isPhoneOpen && activeTab === tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`group relative flex flex-col items-center justify-center flex-1 sm:flex-none w-12 sm:w-16 h-12 sm:h-14 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {/* Active glow accent line */}
                {isActive && (
                  <div
                    className={`absolute -top-1 w-6 sm:w-8 h-1 rounded-full bg-gradient-to-r ${tab.glowColor} shadow-xs`}
                  />
                )}

                {/* Badge if available */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute top-1 right-1.5 min-w-[15px] h-3.5 px-0.5 rounded-full bg-emerald-500 text-[9px] font-bold text-white flex items-center justify-center border border-white">
                    {tab.badge}
                  </span>
                )}

                <Icon
                  className={`w-4 sm:w-5 h-4 sm:h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-emerald-600' : ''
                  }`}
                />
                <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5 sm:mt-1 tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
