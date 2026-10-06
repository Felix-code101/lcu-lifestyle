import React from 'react';
import { useGame, AVAILABLE_SHOP_ITEMS } from '../../context/GameContext';
import type { ShopItem } from '../../types/game';
import { Hammer, X, Plus } from 'lucide-react';

export const BuildPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { stats, selectedPlacingItem, setSelectedPlacingItem } = useGame();

  const handleSelectItem = (item: ShopItem) => {
    if (stats.balance < item.price) return;
    setSelectedPlacingItem(item);
    onClose();
  };

  return (
    <div className="flex flex-col h-full text-slate-800">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Furnish & Customize Venue</h3>
            <p className="text-xs text-slate-500">Select an item to place onto the 3D room grid</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[380px] pr-1">
        {AVAILABLE_SHOP_ITEMS.map((item) => {
          const canAfford = stats.balance >= item.price;
          const isSelected = selectedPlacingItem?.id === item.id;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    {item.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{item.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs font-mono font-bold text-amber-700">
                  ₦{item.price.toLocaleString()}
                </span>
                <button
                  disabled={!canAfford}
                  onClick={() => handleSelectItem(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    canAfford
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{canAfford ? 'Place on Grid' : 'Need Funds'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
