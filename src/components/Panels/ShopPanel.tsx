import React, { useState } from 'react';
import { useGame, AVAILABLE_SHOP_ITEMS } from '../../context/GameContext';
import { Store, ShoppingBag, X, Sparkles } from 'lucide-react';

export const ShopPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { stats, spendBalance, addItemToRoom, addToast } = useGame();
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', 'Furniture', 'Tech', 'Nature', 'Decor'];

  const filteredItems = AVAILABLE_SHOP_ITEMS.filter((item) =>
    filter === 'All' ? true : item.category === filter
  );

  const handleBuy = (item: (typeof AVAILABLE_SHOP_ITEMS)[0]) => {
    const success = spendBalance(item.price);
    if (success) {
      addItemToRoom({
        name: item.name,
        type: item.type,
        x: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
        rotation: 0,
        color: item.color,
      });
      addToast(`Purchased ${item.name}! Delivered directly into your venue!`, 'success');
    }
  };

  return (
    <div className="flex flex-col h-full text-slate-800">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Campus Store & Market</h3>
            <p className="text-xs text-slate-500">Purchase dorm furniture and decor using student cash</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === cat
                ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[350px] pr-1">
        {filteredItems.map((item) => {
          const canAfford = stats.balance >= item.price;

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-700">
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{item.name}</h4>
                <p className="text-xs text-slate-500 mb-3">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> +{Math.floor(item.price * 0.05)} XP
                </span>
                <button
                  disabled={!canAfford}
                  onClick={() => handleBuy(item)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    canAfford
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{canAfford ? 'Buy & Place' : 'Not Enough ₦'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
