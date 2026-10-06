import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { BillboardAd } from '../types/game';
import {
  Megaphone,
  X,
  Sparkles,
  CheckCircle2,
  Palette,
} from 'lucide-react';

export const AdTiles: React.FC = () => {
  const {
    stats,
    billboards,
    selectedBillboard,
    setSelectedBillboard,
    isBillboardModalOpen,
    setIsBillboardModalOpen,
    bookBillboard,
  } = useGame();

  const [activeBb, setActiveBb] = useState<BillboardAd | null>(selectedBillboard || billboards[0]);
  const [businessName, setBusinessName] = useState<string>('');
  const [slogan, setSlogan] = useState<string>('');
  const [bannerColor, setBannerColor] = useState<string>('#10b981');
  const [bannerUrl, setBannerUrl] = useState<string>('');

  const targetBillboard = selectedBillboard || activeBb || billboards[0];

  const presets = [
    { name: "Mama Ronke's Bukka", slogan: 'Hot Jollof Rice & Peppered Chicken at Central Quad!', color: '#f59e0b' },
    { name: 'Titans Tech Hub', slogan: 'MacBook repairs, typing services & high-speed Wi-Fi', color: '#0284c7' },
    { name: 'LU Keke Express', slogan: 'Fastest ₦250 campus rides between Halls & Senate!', color: '#10b981' },
    { name: 'Campus Laundromat', slogan: 'Ironed clothes delivered in 24 hours at Block B', color: '#8b5cf6' },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setBusinessName(p.name);
    setSlogan(p.slogan);
    setBannerColor(p.color);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBillboard) return;

    if (!businessName.trim() || !slogan.trim()) {
      return;
    }

    const success = bookBillboard(
      targetBillboard.id,
      businessName.trim(),
      slogan.trim(),
      bannerUrl.trim() || undefined,
      bannerColor
    );

    if (success) {
      setIsBillboardModalOpen(false);
      setSelectedBillboard(null);
      setBusinessName('');
      setSlogan('');
      setBannerUrl('');
    }
  };

  if (!isBillboardModalOpen) return null;

  const canAfford = stats.balance >= 25000;

  return (
    <div
      onClick={() => {
        setIsBillboardModalOpen(false);
        setSelectedBillboard(null);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200 pointer-events-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-slate-800"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                LU Campus Billboard Advertising
              </h3>
              <p className="text-xs text-slate-500">
                Reach thousands of walking students and shuttle commuters across campus roads
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsBillboardModalOpen(false);
              setSelectedBillboard(null);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billboard Slots Selector Grid */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Road Signboard Stand:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {billboards.map((bb) => {
              const isSelected = targetBillboard.id === bb.id;
              return (
                <button
                  type="button"
                  key={bb.id}
                  onClick={() => {
                    setActiveBb(bb);
                    setSelectedBillboard(bb);
                  }}
                  className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                      : 'bg-slate-50 border-slate-200/90 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {bb.name.split(' ')[1]}
                    </span>
                    {bb.isBooked ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Ad" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" title="Available" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 truncate">
                    {bb.roadName}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md self-start ${
                      bb.isBooked
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bb.isBooked ? 'Active Ad' : 'Available'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Billboard Current State Card */}
        {targetBillboard && targetBillboard.isBooked ? (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Active Advertisement Running on {targetBillboard.roadName}
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">
                Sponsored Stand
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 flex flex-col gap-1">
              <h4 className="text-sm font-black text-slate-900">
                {targetBillboard.businessName}
              </h4>
              <p className="text-xs text-slate-600 italic">
                "{targetBillboard.slogan}"
              </p>
            </div>
            <p className="text-[11px] text-emerald-800">
              Students walking past this location will receive promotional notifications about this brand!
            </p>
          </div>
        ) : null}

        {/* Booking Form (If Available or Updating) */}
        <form onSubmit={handleBook} className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs font-semibold text-slate-600 block">Weekly Campus Rate:</span>
              <span className="text-sm font-black text-emerald-700 font-mono">
                ₦25,000 / Week
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-600 block">Student Wallet:</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                ₦{stats.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Business Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Quick Campus Brand Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200 cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Business Name Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">
              Business / Brand Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mama Ronke's Bukka"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-emerald-500 transition-colors"
            />
          </div>

          {/* Slogan Field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-700">
              Advertising Slogan / Promo Copy *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. The hottest Jollof & Dodo at Central Quad! 10% Fresher Discount."
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-emerald-500 transition-colors"
            />
          </div>

          {/* Color Theme Selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Banner Accent Color:
            </label>
            <div className="flex items-center gap-2">
              {['#10b981', '#0284c7', '#f59e0b', '#ec4899', '#8b5cf6'].map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setBannerColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                    bannerColor === color ? 'scale-125 border-slate-900 shadow-sm' : 'border-white'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsBillboardModalOpen(false);
                setSelectedBillboard(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canAfford || !businessName.trim() || !slogan.trim()}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                canAfford && businessName.trim() && slogan.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Book Billboard (₦25,000 / Wk)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
