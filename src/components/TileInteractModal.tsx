import React from 'react';
import { useGame, AVAILABLE_SHOP_ITEMS } from '../context/GameContext';
import type { RoomItem, ShopItem } from '../types/game';
import {
  RotateCw,
  Trash2,
  Sparkles,
  Bed,
  Laptop,
  Utensils,
  Droplets,
  Fan,
  X,
  PlusCircle,
  Coins,
  Package,
} from 'lucide-react';

interface TileInteractModalProps {
  tileCoord: { x: number; z: number } | null;
  selectedItem: RoomItem | null;
  onClose: () => void;
  onRotateItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

export const TileInteractModal: React.FC<TileInteractModalProps> = ({
  tileCoord,
  selectedItem,
  onClose,
  onRotateItem,
  onRemoveItem,
}) => {
  const { addItemToRoom, spendBalance, stats, performActivity, addToast } = useGame();

  if (!tileCoord) return null;

  // Handle interacting with an existing item
  const handleItemAction = (item: RoomItem) => {
    switch (item.type) {
      case 'bunk_bed':
      case 'bed':
        performActivity({
          id: 'sleep_bed',
          title: 'Rest on Hostel Bunk Bed',
          description: 'Take a restorative sleep in your room.',
          energyCost: 0,
          cashCost: 0,
          cgpaGain: 0,
          moodGain: 20,
          energyGain: 35,
          durationMinutes: 45,
        });
        break;

      case 'desk':
        performActivity({
          id: 'desk_study',
          title: 'Study at Wooden Desk',
          description: 'Read faculty handouts and lecture slides.',
          energyCost: 15,
          cashCost: 0,
          cgpaGain: 0.05,
          moodGain: -2,
          durationMinutes: 60,
        });
        break;

      case 'laptop_and_books':
        performActivity({
          id: 'laptop_cram',
          title: 'Study Session on Laptop',
          description: 'Solve past questions and submit assignments.',
          energyCost: 20,
          cashCost: 0,
          cgpaGain: 0.07,
          moodGain: -3,
          durationMinutes: 75,
        });
        break;

      case 'cooler':
        performActivity({
          id: 'drink_cooler',
          title: 'Grab Chilled Drink from Cooler',
          description: 'Enjoy a refreshing beverage from the food cooler.',
          energyCost: 0,
          cashCost: 0,
          cgpaGain: 0,
          moodGain: 15,
          energyGain: 15,
          durationMinutes: 10,
        });
        break;

      case 'water_gallon':
        performActivity({
          id: 'refill_water',
          title: 'Hydrate with Fresh Water',
          description: 'Drink crisp water from the dispenser gallon.',
          energyCost: 0,
          cashCost: 0,
          cgpaGain: 0,
          moodGain: 10,
          energyGain: 12,
          durationMinutes: 5,
        });
        break;

      case 'fan':
        performActivity({
          id: 'enjoy_fan',
          title: 'Turn on Desk Fan Breeze',
          description: 'Cool down with the oscillating fan breeze.',
          energyCost: 0,
          cashCost: 0,
          cgpaGain: 0,
          moodGain: 20,
          energyGain: 5,
          durationMinutes: 15,
        });
        break;

      case 'chair':
        performActivity({
          id: 'sit_relax',
          title: 'Sit & Rest on Plastic Chair',
          description: 'Relax your legs after walking from the faculty.',
          energyCost: 0,
          cashCost: 0,
          cgpaGain: 0,
          moodGain: 10,
          energyGain: 10,
          durationMinutes: 20,
        });
        break;

      case 'waste_bin':
        addToast('Waste bin emptied! Hostel room is clean and tidy.', 'success');
        break;

      default:
        addToast(`Interacted with ${item.name}!`, 'info');
        break;
    }
    onClose();
  };

  // Place a shop item directly onto this clicked tile
  const handlePlaceNewItem = (shopItem: ShopItem) => {
    if (stats.balance < shopItem.price) {
      addToast(`⚠️ Insufficient funds! Needs ₦${shopItem.price.toLocaleString()}`, 'warning');
      return;
    }

    const ok = spendBalance(shopItem.price);
    if (ok) {
      addItemToRoom({
        name: shopItem.name,
        type: shopItem.type,
        x: tileCoord.x,
        z: tileCoord.z,
        rotation: 0,
        color: shopItem.color,
      });
      addToast(`Placed ${shopItem.name} at (${tileCoord.x}, ${tileCoord.z})!`, 'success');
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 text-slate-800 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {selectedItem ? (
          /* Case A: Interacting with an existing placed object */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
                {selectedItem.type.includes('bed') ? (
                  <Bed className="w-6 h-6" />
                ) : selectedItem.type.includes('laptop') ? (
                  <Laptop className="w-6 h-6" />
                ) : selectedItem.type.includes('cooler') ? (
                  <Utensils className="w-6 h-6" />
                ) : selectedItem.type.includes('water') ? (
                  <Droplets className="w-6 h-6" />
                ) : selectedItem.type.includes('fan') ? (
                  <Fan className="w-6 h-6" />
                ) : (
                  <Package className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {selectedItem.name}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Tile Position: ({selectedItem.x.toFixed(1)}, {selectedItem.z.toFixed(1)})
                </span>
              </div>
            </div>

            {/* Quick Interact Action Button */}
            <button
              onClick={() => handleItemAction(selectedItem)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md hover:shadow-lg transition-all text-sm mb-3 group"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
              <span>Use / Interact with Item</span>
            </button>

            {/* Rotation and Remove Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onRotateItem(selectedItem.id)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate (90°)</span>
              </button>

              <button
                onClick={() => {
                  onRemoveItem(selectedItem.id);
                  onClose();
                }}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Item</span>
              </button>
            </div>
          </div>
        ) : (
          /* Case B: Clicking an empty tile on the 18x18 grid */
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Place Furniture on Grid
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Coordinates: ({tileCoord.x.toFixed(1)}, {tileCoord.z.toFixed(1)})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Select an authentic LU hostel asset to place onto this floor tile:
            </p>

            <div className="max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-1 mb-3">
              {AVAILABLE_SHOP_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        ₦{item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlaceNewItem(item)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-xs transition-all"
                  >
                    <Coins className="w-3 h-3" />
                    <span>Place</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
