import React from 'react';
import { useGame } from '../../context/GameContext';
import { Package, Trash2, X } from 'lucide-react';

export const InventoryPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { roomItems, removeItemFromRoom } = useGame();

  return (
    <div className="flex flex-col h-full text-slate-800">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Room Objects ({roomItems.length})</h3>
            <p className="text-xs text-slate-500">View and manage all items placed in the room</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {roomItems.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">Your room is currently empty!</p>
          <p className="text-xs mt-1 text-slate-500">Use the Build or Shop tab to furnish the room.</p>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
          {roomItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  <div className="text-[11px] font-mono text-slate-500">
                    Pos: ({item.x.toFixed(1)}, {item.z.toFixed(1)})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeItemFromRoom(item.id)}
                  title="Remove Item from Room"
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
