import React, { useState, useEffect } from 'react';
import { useGame, ROOM_THEMES } from '../context/GameContext';
import type { GameLocation } from '../types/game';
import {
  Landmark,
  UtensilsCrossed,
  Briefcase,
  MessageSquare,
  GraduationCap,
  Car,
  ChevronLeft,
  Send,
  Award,
  BookOpen,
  Gift,
  CreditCard,
  Crown,
  Backpack,
  Sparkles,
  Map,
  Palette,
  Compass,
  Check,
  SunMoon,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Settings,
  Clock,
  Phone,
  Gamepad2,
  Users,
  X,
} from 'lucide-react';
import { CampusChatApp } from './CampusChatApp';
import { MessagesApp } from './MessagesApp';
import type { RemotePlayer } from '../types/game';
import { soundManager, useAudioSettings } from '../lib/soundManager';
import { supabase } from '../lib/supabase';

type AppId = 'home' | 'bank' | 'chow' | 'gigs' | 'messages' | 'portal' | 'shuttle' | 'maps' | 'settings' | 'buzz';

interface FoodItem {
  id: string;
  name: string;
  tag: string;
  price: number;
  energyGain: number;
  moodGain: number;
  icon: string;
  desc: string;
}

interface GigItem {
  id: string;
  title: string;
  client: string;
  payout: number;
  energyCost: number;
  knowledgeGain: number;
  moodGain?: number;
  cgpaGain?: number;
  desc: string;
}

interface CampusPhoneProps {
  allOnlinePlayers?: RemotePlayer[];
}

export const CampusPhone: React.FC<CampusPhoneProps> = ({ allOnlinePlayers = [] }) => {
  const {
    stats,
    addBalance,
    spendBalance,
    currentLocation,
    navigateToLocation,
    addToast,
    toasts,
    removeToast,
    setIsPhoneOpen,
    performActivity,
    setIsWardrobeOpen,
    setIsElectionsModalOpen,
    setIsBettingModalOpen,
    theme,
    setTheme,
    dayNightCycle,
    setDayNightCycle,
    triggerResetCamera,
    takeLapoLoan,
    repayLapoLoan,
  } = useGame();

  const { settings: audioSettings, toggleBgm, toggleSfx, setBgmVolume, setSfxVolume } = useAudioSettings();

  const [activeApp, setActiveApp] = useState<AppId>('home');

  // Floating push notification banner state
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  // Esc key listener to smoothly close phone modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPhoneOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPhoneOpen]);

  // Hook notification banner to incoming DMs, peer money transfers, or game alerts
  const latestToast = toasts.length > 0 ? toasts[toasts.length - 1] : null;
  const lastToastIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (latestToast && latestToast.id !== lastToastIdRef.current) {
      lastToastIdRef.current = latestToast.id;
      setBannerDismissed(false);
    }
  }, [latestToast]);

  const bannerIcon = latestToast
    ? latestToast.type === 'success'
      ? '💰'
      : latestToast.type === 'warning'
      ? '⚠️'
      : '📢'
    : '🏛️';

  const bannerTitle = latestToast
    ? latestToast.type === 'success'
      ? 'Campus Credit / Transfer'
      : 'Campus Alert'
    : 'Governor @Wealthynil';

  const bannerSubtitle = latestToast
    ? latestToast.message
    : 'Money speak faster than words';

  // Allowance cooldown simulation
  const [allowanceClaimed, setAllowanceClaimed] = useState<boolean>(false);
  const [duesPaid, setDuesPaid] = useState<boolean>(false);

  // Gig 10-Minute Cooldowns Map (gigId -> expiry timestamp)
  const [gigCooldowns, setGigCooldowns] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('lu_gig_cooldowns');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Live timer tick for MM:SS display
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 5-Second Active Gig Task Countdown State
  const [activeGigTask, setActiveGigTask] = useState<{
    gig: GigItem;
    secondsLeft: number;
  } | null>(null);

  // Helper to format remaining cooldown as MM:SS
  const getRemainingCooldown = (gigId: string): string | null => {
    const expiresAt = gigCooldowns[gigId];
    if (!expiresAt) return null;
    const diff = expiresAt - now;
    if (diff <= 0) return null;
    const totalSec = Math.ceil(diff / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Format time
  const formatTime = (h: number, m: number) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}`;
  };

  // Food Menu Items
  const foodMenu: FoodItem[] = [
    {
      id: 'f1',
      name: 'Smoky Party Jollof & Dodo',
      tag: 'Bestseller',
      price: 1800,
      energyGain: 45,
      moodGain: 25,
      icon: '🍛',
      desc: 'Firewood party jollof served with fried sweet plantain and tender beef.',
    },
    {
      id: 'f2',
      name: 'Ibadan Amala & Gbegiri-Ewedu',
      tag: 'Local Favorite',
      price: 2200,
      energyGain: 55,
      moodGain: 30,
      icon: '🍲',
      desc: 'Steaming hot amala with silky gbegiri, ewedu, and assorted goat meat.',
    },
    {
      id: 'f3',
      name: 'Peppered Beef Suya Platter',
      tag: 'Spicy Grill',
      price: 2000,
      energyGain: 40,
      moodGain: 25,
      icon: '🥩',
      desc: 'Charcoal-grilled spiced beef strips seasoned with yaji pepper and raw onions.',
    },
    {
      id: 'f4',
      name: 'Fried Rice & Crispy Chicken',
      tag: 'Executive',
      price: 2500,
      energyGain: 60,
      moodGain: 35,
      icon: '🍗',
      desc: 'Aromatic fried rice loaded with vegetables and deep fried chicken thigh.',
    },
    {
      id: 'f5',
      name: 'Chilled Zobo & Meatpie',
      tag: 'Quick Refresh',
      price: 1000,
      energyGain: 25,
      moodGain: 20,
      icon: '🥤',
      desc: 'Ice-cold hibiscus drink infused with ginger, paired with a flaky meatpie.',
    },
    {
      id: 'f6',
      name: 'Hostel Special Indomie & Egg',
      tag: 'Comfort Food',
      price: 1400,
      energyGain: 35,
      moodGain: 20,
      icon: '🍜',
      desc: 'Double Indomie noodles stir-fried with pepper, onions, and two fried eggs.',
    },
  ];

  // Campus Freelance Gigs
  const campusGigs: GigItem[] = [
    {
      id: 'g1',
      title: 'Python & Web Tutoring (100L)',
      client: 'FBSS Academic Committee',
      payout: 6500,
      energyCost: 20,
      knowledgeGain: 45,
      moodGain: 10,
      desc: 'Teach freshers basic Python loops, functions, and HTML basics for 1 hour.',
    },
    {
      id: 'g2',
      title: 'Design SUG Election Campaign Posters',
      client: 'Student Union Executives',
      payout: 4500,
      energyCost: 15,
      knowledgeGain: 20,
      moodGain: 25,
      desc: 'Produce crisp social media flyers and banner graphics in Canva / Photoshop.',
    },
    {
      id: 'g3',
      title: 'Library Archive Digital Cataloguing',
      client: 'Chief University Librarian',
      payout: 3800,
      energyCost: 15,
      knowledgeGain: 35,
      desc: 'Sort academic journals and tag new computer science research papers.',
    },
    {
      id: 'g4',
      title: 'Host LU FM Campus Tech Podcast',
      client: 'Mass Comm Radio Hub',
      payout: 5200,
      energyCost: 20,
      knowledgeGain: 25,
      moodGain: 30,
      desc: 'Interview final year tech innovators and discuss campus startup projects.',
    },
    {
      id: 'g5',
      title: 'Faculty Journal Literature Review',
      client: 'Dr. Adeleke (Senior Lecturer)',
      payout: 7500,
      energyCost: 25,
      knowledgeGain: 60,
      cgpaGain: 0.03,
      desc: 'Collate IEEE references and format LaTeX bibliography for publication.',
    },
  ];

  // Order food handler
  const handleOrderFood = (food: FoodItem) => {
    if (stats.balance < food.price) {
      addToast(`❌ Insufficient funds to order ${food.name}! Need ₦${food.price.toLocaleString()}`, 'warning');
      return;
    }

    if (spendBalance(food.price)) {
      performActivity({
        id: `food_delivery_${food.id}`,
        title: `Campus Chow: ${food.name}`,
        description: `Delivered hot to hostel`,
        energyCost: 0,
        energyGain: food.energyGain,
        cashCost: 0, // already spent via spendBalance
        cgpaGain: 0,
        moodGain: food.moodGain,
        durationMinutes: 15,
      });

      addToast(`🛵 Campus Chow delivered "${food.name}"! (+${food.energyGain}⚡, +${food.moodGain} Mood)`, 'success');
    }
  };

  // Handle 5-Second Gig Countdown Progression & Atomic Cash Payout
  useEffect(() => {
    if (!activeGigTask) return;

    if (activeGigTask.secondsLeft > 0) {
      const timer = setTimeout(() => {
        setActiveGigTask((prev) => (prev ? { ...prev, secondsLeft: prev.secondsLeft - 1 } : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // 5-Second Timer Reached 0: Complete gig atomic payout & set 10-minute cooldown
      const targetGig = activeGigTask.gig;
      setActiveGigTask(null);
      finalizeGigPayout(targetGig);
    }
  }, [activeGigTask]);

  const finalizeGigPayout = async (gig: GigItem) => {
    // 1. Perform game activity (energy cost, knowledge/mood/cgpa gain)
    performActivity({
      id: `gig_${gig.id}`,
      title: gig.title,
      description: gig.desc,
      energyCost: gig.energyCost,
      cashCost: 0,
      cgpaGain: gig.cgpaGain || 0,
      moodGain: gig.moodGain || 10,
      durationMinutes: 45,
    });

    // 2. Call Supabase RPC payout_gig_reward
    try {
      if (supabase && stats.matricNo) {
        await supabase.rpc('payout_gig_reward', {
          student_matric: stats.matricNo,
          payout_amount: gig.payout,
        });
      }
    } catch (err) {
      console.warn('Supabase payout_gig_reward RPC fallback:', err);
    }

    // 3. Atomic cash payout into student wallet
    addBalance(gig.payout);
    soundManager.playMoney();
    addToast(`+₦${gig.payout.toLocaleString()} earned and added to wallet!`, 'success');

    // 4. Place gig on strict 10-minute cooldown
    const cooldownTimestamp = Date.now() + 10 * 60 * 1000;
    setGigCooldowns((prev) => {
      const updated = {
        ...prev,
        [gig.id]: cooldownTimestamp,
      };
      try {
        localStorage.setItem('lu_gig_cooldowns', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Start 5-Second Gig Countdown
  const handleStartGig = (gig: GigItem) => {
    const cd = getRemainingCooldown(gig.id);
    if (cd) {
      soundManager.playError();
      addToast(`⏳ This gig is on cooldown! Available again in ${cd}`, 'info');
      return;
    }

    if (stats.energy < gig.energyCost) {
      soundManager.playError();
      addToast(`❌ Too exhausted! Need ${gig.energyCost}⚡ energy. Grab lunch or rest first.`, 'warning');
      return;
    }

    soundManager.playClick();
    setActiveGigTask({
      gig,
      secondsLeft: 5,
    });
  };

  // Campus Landmark Destinations for LU Maps & Fast-Travel
  const allCampusDestinations: { id: GameLocation; name: string; desc: string; icon: string }[] = [
    { id: 'campus_map', name: 'Campus 3D Birds-Eye Map', desc: 'Full aerial grounds, landmarks & roads', icon: '🗺️' },
    { id: 'home_hostel', name: 'Hostel Room & Study', desc: 'Personal living quarters & wardrobe', icon: '🛏️' },
    { id: 'cafeteria', name: 'Main Cafeteria & Bukka', desc: 'Party jollof, amala, snacks & hangout', icon: '🍲' },
    { id: 'lecture_theatre', name: 'Faculty Lecture Theatre', desc: 'Classes, revisions & study discussions', icon: '🏛️' },
    { id: 'library', name: 'University Central Library', desc: 'Quiet research, revision & textbook loans', icon: '📖' },
    { id: 'sports_arena', name: 'LU Sports Arena', desc: 'Football pitch, penalty kicks & sports terminal', icon: '⚽' },
    { id: 'medical_centre', name: 'University Medical Centre', desc: 'Clinical care, multivitamins & rest beds', icon: '🏥' },
    { id: 'guesthouse', name: 'University Guesthouse Suites', desc: 'Executive lounge, luxury lodging & gardens', icon: '🏨' },
    { id: 'lions_hall', name: 'Lions Hall Male Courtyard', desc: 'Undergraduate hall quad, games & debates', icon: '🦁' },
    { id: 'adeline_hall', name: 'Adeline Hall Female Quad', desc: 'Undergraduate hall courtyard & music hub', icon: '🏛️' },
    { id: 'chapel', name: 'Chapel of Grace', desc: 'Sunday worship service & choir fellowship', icon: '⛪' },
    { id: 'mosque', name: 'University Central Mosque', desc: 'Friday Jumu\'ah khutbah & prayer hall', icon: '🕌' },
    { id: 'sub', name: 'Student Union Building (SUB)', desc: 'Parliament debates, recreation arcade & student lounge', icon: '🎭' },
  ];

  // Campus Shuttle Fast-Travel
  const campusShuttleDestinations: { id: GameLocation; name: string; tag: string; icon: string }[] = [
    { id: 'home_hostel', name: 'Student Hostel Complex', tag: 'Dorms & Rooms', icon: '🏠' },
    { id: 'sub', name: 'Student Union Building (SUB)', tag: 'Parliament & Lounge', icon: '🎭' },
    { id: 'campus_map', name: 'Campus 3D Birds-Eye Map', tag: 'Aerial Overview', icon: '🗺️' },
    { id: 'cafeteria', name: 'Main Cafeteria & Bukka', tag: 'Food & Hangout', icon: '🍲' },
    { id: 'lecture_theatre', name: 'Faculty Lecture Theatre', tag: 'FBSS Classes', icon: '🏛️' },
    { id: 'library', name: 'University Central Library', tag: 'Quiet Study & Cram', icon: '📖' },
    { id: 'sports_arena', name: 'LU Sports Arena', tag: 'Football & Fitness', icon: '⚽' },
    { id: 'medical_centre', name: 'Medical Centre & Clinic', tag: 'Healthcare & Bed Rest', icon: '🏥' },
    { id: 'guesthouse', name: 'Executive Guesthouse', tag: 'VIP Suites & Lounge', icon: '🏨' },
    { id: 'lions_hall', name: 'Lions Hall (Male)', tag: 'Hostel Block', icon: '🦁' },
    { id: 'adeline_hall', name: 'Adeline Hall (Female)', tag: 'Hostel Block', icon: '🏛️' },
  ];

  const handleTakeShuttle = (target: GameLocation) => {
    const shuttleFare = 200;
    if (stats.balance < shuttleFare) {
      addToast('❌ Insufficient funds for campus shuttle (₦200 flat fare required)', 'warning');
      return;
    }

    if (spendBalance(shuttleFare)) {
      // Resting inside the shuttle gives +10 stamina so player can always travel
      performActivity({
        id: 'shuttle_ride',
        title: 'LU Shuttle Commute',
        description: 'Comfortable air-conditioned campus shuttle ride',
        energyCost: 0,
        energyGain: 10,
        cashCost: 0,
        cgpaGain: 0,
        moodGain: 5,
        durationMinutes: 5,
      });

      navigateToLocation(target);
      addToast(`🚖 LU Shuttle arrived! Safe trip to ${target}. (-₦200)`, 'success');
      setIsPhoneOpen(false);
    }
  };

  const totalUnreadMessages = 1;
  const availableGigsCount = campusGigs.filter((g) => !gigCooldowns[g.id] || gigCooldowns[g.id] <= now).length;

  return (
    <>
      {/* Dimmed backdrop allowing click-outside to smoothly dismiss */}
      <div
        onClick={() => setIsPhoneOpen(false)}
        className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Scale Down Phone Frame: Centered, padded container */}
      <div
        onClick={() => setIsPhoneOpen(false)}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 pointer-events-none"
      >
        {/* Top Floating Notification Banner (Outside / Above the Phone Chassis) */}
        {!bannerDismissed && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              if (latestToast) {
                if (latestToast.message.includes('₦') || latestToast.message.includes('balance') || latestToast.message.includes('Stipend')) {
                  setActiveApp('bank');
                } else if (latestToast.message.includes('💬') || latestToast.message.includes('message')) {
                  setActiveApp('messages');
                } else {
                  setActiveApp('buzz');
                }
              } else {
                setActiveApp('buzz');
              }
            }}
            className="pointer-events-auto mb-2 w-full max-w-[340px] sm:max-w-[370px] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200/80 flex items-center gap-3 animate-bounce-subtle cursor-pointer hover:bg-white transition-all select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
              {bannerIcon}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{bannerTitle}</p>
              <p className="text-xs text-emerald-600 font-medium truncate">{bannerSubtitle}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (latestToast) {
                  removeToast(latestToast.id);
                }
                setBannerDismissed(true);
              }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Realistic Smartphone Chassis */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto relative w-full max-w-[340px] sm:max-w-[370px] h-[78vh] sm:h-[82vh] max-h-[760px] bg-black rounded-[46px] p-[10px] shadow-2xl border-4 border-slate-800 flex flex-col overflow-hidden transition-transform duration-300 ease-out transform scale-100 animate-in fade-in zoom-in-95"
        >
          {/* Dynamic Island / Top Speaker Notch Pill at the top of the bezel */}
          <div className="w-24 h-5 bg-black rounded-full mx-auto mb-1 shrink-0 flex items-center justify-center gap-2 border border-slate-900/60 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-500/80" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Phone Screen Container with dark gradient wallpaper */}
          <div className="rounded-[38px] flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-900 to-amber-700 relative">
            {/* Status Bar (Top of Phone Screen) */}
            <div
              className={`relative z-40 flex items-center justify-between px-6 pt-2 pb-1 text-[11px] font-bold select-none transition-colors ${
                activeApp === 'home' ? 'text-white' : 'bg-white/95 text-slate-800 border-b border-slate-100'
              }`}
            >
              <span>{activeApp === 'home' ? '9:41' : formatTime(stats.inGameHours, stats.inGameMinutes)}</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-mono tracking-tight ${
                    activeApp === 'home' ? 'text-white/90' : 'text-slate-600'
                  }`}
                >
                  ••• 4G
                </span>
                <div
                  className={`relative w-5 h-2.5 rounded-xs border p-0.5 flex items-center ${
                    activeApp === 'home' ? 'border-white/90' : 'border-slate-700'
                  }`}
                >
                  <div
                    className={`h-full w-3 rounded-2xs ${
                      activeApp === 'home' ? 'bg-white' : 'bg-emerald-600'
                    }`}
                  />
                  <div
                    className={`absolute -right-1 top-0.5 w-0.5 h-1.5 rounded-r-2xs ${
                      activeApp === 'home' ? 'bg-white/90' : 'bg-slate-700'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* APP SCREEN 1: HOMESCREEN UI & WALLPAPER LAYOUT */}
            {/* ============================================================== */}
            {activeApp === 'home' && (
              <div className="flex-1 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
                {/* Widget & Header Area */}
                <div className="px-4 pt-3 pb-2 flex flex-col items-center text-center">
                  <div className="text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
                    {formatTime(stats.inGameHours, stats.inGameMinutes)}
                  </div>
                  <p className="text-xs font-medium text-white/90 mt-1 drop-shadow-xs">
                    Monday 12 October · Ibadan Campus
                  </p>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setDayNightCycle((prev) => !prev);
                    }}
                    className="mt-2.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white text-xs px-3 py-1 rounded-full w-fit backdrop-blur-sm flex items-center gap-1.5 cursor-pointer shadow-xs border border-white/15"
                  >
                    <span>🌙</span>
                    <span>Night mode</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        dayNightCycle ? 'bg-amber-400' : 'bg-white/40'
                      }`}
                    />
                  </button>
                </div>

                {/* 4-Column App Grid */}
                <div className="grid grid-cols-4 gap-y-4 gap-x-2 px-3 py-4 flex-1 content-start">
                  {/* 1. Jobs / Hustles */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('gigs');
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <Briefcase className="w-6 h-6 text-white" />
                      {availableGigsCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                          {availableGigsCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Jobs</span>
                  </button>

                  {/* 2. Messages / DMs */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('messages');
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-blue-500 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <MessageSquare className="w-6 h-6 text-white" />
                      {totalUnreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm">
                          {totalUnreadMessages}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Messages</span>
                  </button>

                  {/* 3. Games */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setIsPhoneOpen(false);
                      setIsBettingModalOpen(true);
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <Gamepad2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Games</span>
                  </button>

                  {/* 4. Meetumo / Social */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('buzz');
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-teal-600 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Meetumo</span>
                  </button>

                  {/* 5. Tickets / Events (P logo with red NEW chip) */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setIsPhoneOpen(false);
                      setIsElectionsModalOpen(true);
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-purple-700 group-hover:scale-105 active:scale-95 transition-transform">
                      <span className="text-2xl font-black font-sans leading-none">P</span>
                      <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-500 text-[8px] font-black text-white border-2 border-white shadow-sm">
                        NEW
                      </span>
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Tickets</span>
                  </button>

                  {/* 6. Settings */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('settings');
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Settings</span>
                  </button>

                  {/* 7. Courses / Academic */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('portal');
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Courses</span>
                  </button>

                  {/* 8. Ride / Shuttle */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('shuttle');
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 shadow-md flex items-center justify-center text-slate-950 group-hover:scale-105 active:scale-95 transition-transform">
                      <Car className="w-6 h-6 text-slate-950" />
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Ride</span>
                  </button>

                  {/* Row 3: Additional campus apps for full feature coverage */}
                  {/* 9. Chow Delivery */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('chow');
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-orange-500 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <UtensilsCrossed className="w-6 h-6 text-white" />
                      <span className="absolute -top-1 -right-1 px-1 rounded-full bg-rose-500 text-[8px] font-bold text-white border border-white shadow-xs">
                        HOT
                      </span>
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Chow</span>
                  </button>

                  {/* 10. Student Bank */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('bank');
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-purple-600 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <Landmark className="w-6 h-6 text-white" />
                      {!allowanceClaimed && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-black flex items-center justify-center text-white border border-white shadow-xs">
                          ₦
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Bank</span>
                  </button>

                  {/* 11. Campus 3D Maps */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('maps');
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-cyan-600 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <Map className="w-6 h-6 text-white" />
                      <span className="absolute -top-1 -right-1 px-1 rounded-full bg-cyan-900 text-[8px] font-black text-white border border-white shadow-xs">
                        3D
                      </span>
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Maps</span>
                  </button>

                  {/* 12. Student Wardrobe */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setIsPhoneOpen(false);
                      setIsWardrobeOpen(true);
                    }}
                    className="group flex flex-col items-center gap-1.5 focus:outline-hidden cursor-pointer"
                  >
                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-pink-600 shadow-md flex items-center justify-center text-white group-hover:scale-105 active:scale-95 transition-transform">
                      <Sparkles className="w-6 h-6 text-amber-200" />
                    </div>
                    <span className="text-[11px] text-white text-center font-medium drop-shadow-sm">Wardrobe</span>
                  </button>
                </div>

                {/* Bottom Dock (Floating App Dock) */}
                <div className="mx-3 mb-3 bg-white/20 backdrop-blur-lg rounded-3xl p-2 grid grid-cols-4 gap-2 border border-white/20">
                  {/* Phone / Dialer */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      addToast('📞 Calling Campus Security Dispatch (Emergency: 0800-LU-CARE)...', 'info');
                    }}
                    className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 flex items-center justify-center text-white shadow-md transition-all cursor-pointer"
                    title="Dialer / Emergency Call"
                  >
                    <Phone className="w-5 h-5" />
                  </button>

                  {/* Bank / Wallet */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('bank');
                    }}
                    className="w-12 h-12 mx-auto rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-95 flex items-center justify-center text-white shadow-md transition-all cursor-pointer"
                    title="Bank / Wallet"
                  >
                    <Landmark className="w-5 h-5" />
                  </button>

                  {/* Messages */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('messages');
                    }}
                    className="relative w-12 h-12 mx-auto rounded-2xl bg-blue-500 hover:bg-blue-400 active:scale-95 flex items-center justify-center text-white shadow-md transition-all cursor-pointer"
                    title="Messages (DMs)"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {totalUnreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center border-2 border-white" />
                    )}
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveApp('settings');
                    }}
                    className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 flex items-center justify-center text-white shadow-md transition-all cursor-pointer"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                {/* Home indicator line at the very bottom */}
                <div
                  className="w-32 h-1 bg-white/80 rounded-full mx-auto mb-1 cursor-pointer hover:bg-white transition-colors"
                  onClick={() => setIsPhoneOpen(false)}
                  title="Close Phone"
                />
              </div>
            )}

          {/* ============================================================== */}
          {/* APP SCREEN 2: BANK APP (LU Kuda Microfinance) */}
          {/* ============================================================== */}
          {activeApp === 'bank' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* App Header (Clean White Header) */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200">
                <button
                  onClick={() => setActiveApp('home')}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-purple-600" />
                  LU Student Bank
                </span>
                <span className="w-6" />
              </div>

              {/* Scrollable Bank Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {/* Virtual Student Debit Card (Crisp Card on Light Background) */}
                <div className="p-4 rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-800 to-purple-900 text-white border border-purple-600/30 shadow-lg shadow-purple-900/20 relative overflow-hidden">
                  <div className="flex items-center justify-between text-purple-200 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider">LU Student Card</span>
                    {stats.status === 'nepo' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-300" />
                        Nepo Platinum
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-black flex items-center gap-1">
                        <Backpack className="w-3 h-3 text-emerald-300" />
                        Lapo Credit Tier
                      </span>
                    )}
                  </div>
                  <div className="mb-3">
                    <span className="text-[10px] text-purple-200/80 block">Current Available Balance</span>
                    <div className="text-xl font-black text-white tracking-tight">
                      ₦{stats.balance.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-purple-200/90 font-mono">
                    <span>{stats.matricNo}</span>
                    <span>EXP: 09/28</span>
                  </div>
                </div>

                {/* Quick Banking Actions (Pure White Cards with Slate Borders) */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                    Student Finance Actions
                  </h4>

                  {/* Lapo Emergency Micro-Loan Banner (for Lapo status) */}
                  {stats.status === 'lapo' && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-[11px]">
                            Lapo Emergency Micro-Loan
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {stats.activeLoanAmount > 0
                              ? `Active Credit: ₦${stats.activeLoanAmount.toLocaleString()}`
                              : '₦10,000 Instant Student Credit'}
                          </span>
                        </div>
                      </div>
                      {stats.activeLoanAmount > 0 ? (
                        <button
                          onClick={repayLapoLoan}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold shadow-xs active:scale-95"
                        >
                          Repay ₦10k
                        </button>
                      ) : (
                        <button
                          onClick={takeLapoLoan}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow-xs active:scale-95"
                        >
                          Borrow ₦10k
                        </button>
                      )}
                    </div>
                  )}

                  {/* 1. Claim Monthly Stipend */}
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">Monthly Student Stipend</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">+₦5,000 Allowance</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (allowanceClaimed) {
                          addToast('Stipend already claimed for this month!', 'info');
                          return;
                        }
                        addBalance(5000);
                        setAllowanceClaimed(true);
                      }}
                      disabled={allowanceClaimed}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xs ${
                        allowanceClaimed
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                      }`}
                    >
                      {allowanceClaimed ? 'Claimed' : 'Claim'}
                    </button>
                  </div>

                  {/* 2. Pay Departmental Dues */}
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">FBSS Departmental Dues</span>
                        <span className="text-[10px] text-slate-500">₦2,000 • +25 XP, +10 Mood</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (duesPaid) {
                          addToast('Departmental dues already settled!', 'info');
                          return;
                        }
                        if (spendBalance(2000)) {
                          setDuesPaid(true);
                          addToast('✅ Faculty dues receipt endorsed by HOD!', 'success');
                        }
                      }}
                      disabled={duesPaid}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xs ${
                        duesPaid
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
                      }`}
                    >
                      {duesPaid ? 'Settled' : 'Pay'}
                    </button>
                  </div>

                  {/* 3. Send Money to Roommate */}
                  {(() => {
                    const rmName = stats.roommateName || (stats.gender === 'female' ? 'Zainab' : 'Femi');
                    const isEvicted = stats.roommateEvicted;
                    return (
                      <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Send className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">Transfer to {rmName} (Roommate)</span>
                            <span className="text-[10px] text-slate-500">
                              {isEvicted ? 'Moved Out • No longer in room' : '₦1,000 • +15 Mood'}
                            </span>
                          </div>
                        </div>
                        <button
                          disabled={isEvicted}
                          onClick={() => {
                            if (isEvicted) return;
                            if (spendBalance(1000)) {
                              addToast(`${rmName} received ₦1,000! "Thanks boss, you be life saver!"`, 'success');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xs active:scale-95 ${
                            isEvicted
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                          }`}
                        >
                          Send
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Recent Transaction History */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                    Recent Transactions
                  </h4>
                  <div className="space-y-1 rounded-2xl bg-white p-2.5 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🍛</span>
                        <div>
                          <span className="font-semibold text-slate-900 block text-[11px]">Bukka Cafeteria</span>
                          <span className="text-[9px] text-slate-400">Food purchase</span>
                        </div>
                      </div>
                      <span className="font-bold text-rose-600">-₦1,500</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">💼</span>
                        <div>
                          <span className="font-semibold text-slate-900 block text-[11px]">Campus Gig Payout</span>
                          <span className="text-[9px] text-slate-400">Tutoring shift</span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600">+₦6,500</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🚖</span>
                        <div>
                          <span className="font-semibold text-slate-900 block text-[11px]">Campus Shuttle</span>
                          <span className="text-[9px] text-slate-400">Main Gate to Hostel</span>
                        </div>
                      </div>
                      <span className="font-bold text-rose-600">-₦200</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* APP SCREEN 3: CAMPUS CHOW (Food Delivery - Chowdeck style) */}
          {/* ============================================================== */}
          {activeApp === 'chow' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* App Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200">
                <button
                  onClick={() => setActiveApp('home')}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
                  Campus Chow Delivery
                </span>
                <span className="w-6" />
              </div>

              {/* Delivery Banner */}
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-extrabold block">⚡ 15-Min Hostel Delivery</span>
                  <span className="text-[10px] text-orange-100">Hot meals delivered straight to your room</span>
                </div>
                <span className="text-xl">🛵</span>
              </div>

              {/* Food Items List (Clean White Cards) */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
                {foodMenu.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/90 flex items-center justify-between gap-3 transition-colors shadow-xs"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-[11px] truncate">{item.name}</h4>
                          <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-700 text-[8px] font-bold shrink-0">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.desc}</p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] font-semibold text-emerald-600">
                          <span>+{item.energyGain}⚡ Energy</span>
                          <span>+{item.moodGain} Mood</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-extrabold text-amber-700 text-xs">₦{item.price.toLocaleString()}</span>
                      <button
                        onClick={() => handleOrderFood(item)}
                        className="px-3 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] shadow-xs active:scale-95 transition-transform"
                      >
                        Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* APP SCREEN 4: STUDENT GIGS (Campus Hustle Freelance) */}
          {/* ============================================================== */}
          {activeApp === 'gigs' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* App Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200">
                <button
                  onClick={() => setActiveApp('home')}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-600" />
                  Campus Hustle Gigs
                </span>
                <span className="w-6" />
              </div>

              {/* Hustle Banner */}
              <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-extrabold block">💼 Student Freelance Board</span>
                  <span className="text-[10px] text-cyan-100">Earn Naira & build experience between lectures</span>
                </div>
                <span className="text-xl">💰</span>
              </div>

              {/* Gigs List (Clean White Cards) */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
                {/* 5-Second Ad / Action Countdown Progress Banner */}
                {activeGigTask && (
                  <div className="p-3.5 bg-gradient-to-r from-cyan-900 via-slate-900 to-cyan-950 text-white rounded-2xl border border-cyan-500/40 shadow-lg animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center animate-spin">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block leading-tight">
                            Completing gig task... {activeGigTask.secondsLeft}s
                          </span>
                          <span className="text-[10px] text-cyan-200 line-clamp-1">
                            {activeGigTask.gig.title}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-700/60">
                        {activeGigTask.secondsLeft}s
                      </span>
                    </div>

                    {/* 5-second progress bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-cyan-900 mt-2">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${((5 - activeGigTask.secondsLeft) / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-cyan-200/80 mt-1.5 font-medium">
                      <span>Submitting client deliverables...</span>
                      <span>Reward: +₦{activeGigTask.gig.payout.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {campusGigs.map((gig) => {
                  const cooldownTimer = getRemainingCooldown(gig.id);
                  const isBusyWithThis = activeGigTask?.gig.id === gig.id;
                  const isBlocked = Boolean(cooldownTimer) || Boolean(activeGigTask);

                  return (
                    <div
                      key={gig.id}
                      className={`p-3.5 rounded-2xl border transition-all shadow-xs ${
                        cooldownTimer
                          ? 'bg-slate-50/90 border-slate-200 opacity-75'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{gig.title}</h4>
                          <span className="text-[10px] text-cyan-700 font-semibold">{gig.client}</span>
                        </div>
                        <span className="text-xs font-extrabold text-amber-700">
                          +₦{gig.payout.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 mb-2">{gig.desc}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-[9px] text-slate-600">
                          <span className="text-rose-600 font-semibold">-{gig.energyCost}⚡ Stamina</span>
                          <span className="text-emerald-700 font-semibold">+{gig.knowledgeGain} Knowledge</span>
                          {gig.cgpaGain && <span className="text-amber-700 font-semibold">+{gig.cgpaGain} CGPA</span>}
                        </div>

                        <button
                          onClick={() => handleStartGig(gig)}
                          disabled={isBlocked}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-xs transition-all ${
                            cooldownTimer
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1 font-mono'
                              : activeGigTask
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95 cursor-pointer'
                          }`}
                        >
                          {cooldownTimer ? (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Available again in {cooldownTimer}
                            </span>
                          ) : isBusyWithThis ? (
                            'In Progress...'
                          ) : (
                            'Accept Gig'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* APP SCREEN 5: MESSAGES (1-on-1 Real-Time DM Chat App)          */}
          {/* ============================================================== */}
          {activeApp === 'messages' && (
            <MessagesApp
              onBackToHome={() => setActiveApp('home')}
              allOnlinePlayers={allOnlinePlayers}
              onOpenCampusBuzz={() => setActiveApp('buzz')}
            />
          )}

          {/* ============================================================== */}
          {/* APP SCREEN 6: LU PORTAL (Academic Records & CGPA) */}
          {/* ============================================================== */}
          {activeApp === 'portal' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* App Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200">
                <button
                  onClick={() => setActiveApp('home')}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
                  LU Student Portal
                </span>
                <span className="w-6" />
              </div>

              {/* Scrollable Portal Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {/* Official Student Digital ID (Navy/Rose Card) */}
                <div className="p-4 rounded-3xl bg-gradient-to-tr from-slate-900 to-rose-950 text-white border border-rose-600/30 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-2xl shadow">
                      👨‍🎓
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm">Student Adebayo</h3>
                      <p className="text-[10px] text-rose-200 font-mono">{stats.matricNo}</p>
                      <p className="text-[9px] text-white/80">{stats.department} • {stats.academicLevel || `${stats.currentLevel || 100} Level`}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <span className="text-[8px] uppercase tracking-wider text-white/70 block">Cumulative GPA</span>
                      <span className="text-base font-black text-emerald-300">
                        {stats.cgpa !== null ? stats.cgpa.toFixed(2) : 'Pending'}
                      </span>
                    </div>
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <span className="text-[8px] uppercase tracking-wider text-white/70 block">Honours Status</span>
                      <span className="text-[10px] font-bold text-amber-300">
                        {stats.cgpa === null
                          ? 'Awaiting 1st Exam'
                          : stats.cgpa >= 4.5
                          ? 'First Class 🏅'
                          : stats.cgpa >= 3.5
                          ? 'Second Class Upper'
                          : stats.cgpa >= 2.4
                          ? 'Second Class Lower'
                          : 'Third Class'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Registered Courses & Grades (Clean White Cards) */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                    First Semester Registered Courses
                  </h4>
                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between text-[11px] shadow-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">SEN 301: Software Architecture</span>
                        <span className="text-[9px] text-slate-500">3 Units • CA: 38/40</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                        A (5.0)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between text-[11px] shadow-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">CSC 305: Operating Systems</span>
                        <span className="text-[9px] text-slate-500">3 Units • CA: 35/40</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                        A (5.0)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between text-[11px] shadow-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">GST 311: Entrepreneurship Studies</span>
                        <span className="text-[9px] text-slate-500">2 Units • CA: 39/40</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                        A (5.0)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Online Study Action */}
                <button
                  onClick={() => {
                    performActivity({
                      id: 'portal_revision',
                      title: 'Reviewed Portal Lecture Materials',
                      description: 'Studied course handouts via online student portal',
                      energyCost: 15,
                      cashCost: 0,
                      cgpaGain: 0.03,
                      moodGain: 10,
                      durationMinutes: 30,
                    });
                  }}
                  className="w-full p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  Study Lecture Handouts (+0.03 CGPA, -15⚡)
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* APP SCREEN 7: SHUTTLE FAST-TRAVEL (LU Shuttle) */}
          {/* ============================================================== */}
          {activeApp === 'shuttle' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* App Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200">
                <button
                  onClick={() => setActiveApp('home')}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-500" />
                  LU Campus Shuttle
                </span>
                <span className="w-6" />
              </div>

              {/* Shuttle Banner */}
              <div className="p-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-extrabold block">🚖 Instant Campus Fast-Travel</span>
                  <span className="text-[10px] text-slate-800">Flat ₦200 Fare • 0 Stamina Drain</span>
                </div>
                <span className="text-xl">⚡</span>
              </div>

              {/* Destination Cards (Clean White Cards) */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2 text-xs">
                {campusShuttleDestinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 flex items-center justify-between transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{dest.icon}</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-[11px]">{dest.name}</h4>
                        <span className="text-[10px] text-amber-700 font-medium">{dest.tag}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTakeShuttle(dest.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                    >
                      Board (₦200)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* APP SCREEN 8: LU MAPS & CAMPUS NAVIGATION */}
          {/* ============================================================== */}
          {activeApp === 'maps' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* App Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200">
                <button
                  onClick={() => setActiveApp('home')}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5 text-emerald-600" />
                  LU Maps & Navigation
                </span>
                <span className="w-6" />
              </div>

              {/* Sub-header Banner */}
              <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-extrabold block">🗺️ 3D Campus Grounds & Transit</span>
                  <span className="text-[10px] text-emerald-100">Live GPS • Direct Walk & Keke Shuttle</span>
                </div>
                <Compass className="w-6 h-6 text-emerald-200" />
              </div>

              {/* Scrollable Map Destinations */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
                {/* 3D Interactive Map Hero Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 border border-emerald-200/80 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Aerial 3D View</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">Interactive Campus 3D Grounds</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Full 3D birds-eye perspective of faculties, halls, cafeteria, and central quad.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {currentLocation === 'campus_map' ? (
                      <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-center text-xs flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Currently Viewing 3D Map
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          navigateToLocation('campus_map');
                          setIsPhoneOpen(false);
                          addToast('🗺️ Switched to Interactive 3D Campus Map', 'info');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Map className="w-4 h-4" />
                        Launch 3D Map View
                      </button>
                    )}
                  </div>
                </div>

                {/* Destinations List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Campus Locations & Fast Transit</span>
                    <span className="text-[10px] text-slate-500">{allCampusDestinations.length} Landmarks</span>
                  </div>
                  <div className="space-y-2">
                    {allCampusDestinations.map((dest) => {
                      const isCurrent = currentLocation === dest.id;
                      return (
                        <div
                          key={dest.id}
                          className={`p-3 rounded-2xl border transition-all shadow-xs ${
                            isCurrent
                              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                              : 'bg-white hover:bg-slate-50 border-slate-200/90'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{dest.icon}</span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-bold text-slate-900 text-xs">{dest.name}</h5>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[9px]">
                                      YOU ARE HERE
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{dest.desc}</p>
                              </div>
                            </div>
                          </div>

                          {!isCurrent && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  navigateToLocation(dest.id);
                                  setIsPhoneOpen(false);
                                  addToast(`🚶 Trekked to ${dest.name}`, 'info');
                                }}
                                className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center gap-1 transition-all active:scale-95"
                              >
                                🚶 Trek (Free)
                              </button>
                              <button
                                onClick={() => handleTakeShuttle(dest.id)}
                                className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] flex items-center justify-center gap-1 transition-all shadow-xs active:scale-95"
                              >
                                <Car className="w-3 h-3" />
                                Keke (₦200)
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* APP SCREEN 9: CAMPUS SETTINGS & THEMES */}
          {/* ============================================================== */}
          {activeApp === 'settings' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* App Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200">
                <button
                  onClick={() => setActiveApp('home')}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-800" />
                  Campus Settings & Themes
                </span>
                <span className="w-6" />
              </div>

              {/* Sub-header Banner */}
              <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-extrabold block">⚙️ System & Display Preferences</span>
                  <span className="text-[10px] text-slate-300">Room Palettes • Lighting Engine • 3D View</span>
                </div>
                <span className="text-xl">🎨</span>
              </div>

              {/* Settings Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
                {/* Audio & Sound Preferences Section */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-violet-100 text-violet-700 border border-violet-200">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">Audio & Sound</h4>
                        <span className="text-[10px] text-slate-500 block">Manage campus BGM and sound cues</span>
                      </div>
                    </div>
                  </div>

                  {/* Background Music (BGM) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {audioSettings.bgmEnabled ? (
                          <Music className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Background Music</span>
                          <span className="text-[10px] text-slate-500 block leading-tight">Play ambient campus tunes</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleBgm();
                          soundManager.playClick();
                        }}
                        className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer flex items-center shrink-0 ${
                          audioSettings.bgmEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                        }`}
                        title="Toggle Background Music"
                      >
                        <span className="w-5.5 h-5.5 rounded-full bg-white shadow-md block" />
                      </button>
                    </div>

                    {/* BGM Volume Slider */}
                    {audioSettings.bgmEnabled && (
                      <div className="flex items-center gap-2 pl-6 pt-1">
                        <span className="text-[10px] font-mono font-bold text-slate-600 w-8">
                          {Math.round(audioSettings.bgmVolume * 100)}%
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={audioSettings.bgmVolume}
                          onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Sound Effects (SFX) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {audioSettings.sfxEnabled ? (
                          <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">Sound Effects</span>
                          <span className="text-[10px] text-slate-500 block leading-tight">UI taps, purchases, and activity cues</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleSfx();
                          soundManager.playClick();
                        }}
                        className={`w-12 h-6.5 rounded-full transition-colors relative p-0.5 cursor-pointer flex items-center shrink-0 ${
                          audioSettings.sfxEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                        }`}
                        title="Toggle Sound Effects"
                      >
                        <span className="w-5.5 h-5.5 rounded-full bg-white shadow-md block" />
                      </button>
                    </div>

                    {/* SFX Volume Slider */}
                    {audioSettings.sfxEnabled && (
                      <div className="flex items-center gap-2 pl-6 pt-1">
                        <span className="text-[10px] font-mono font-bold text-slate-600 w-8">
                          {Math.round(audioSettings.sfxVolume * 100)}%
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={audioSettings.sfxVolume}
                          onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Theme Presets */}
                <div>
                  <div className="mb-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">Room & Campus Themes</span>
                    <span className="text-[10px] text-slate-500">Select lighting and room aesthetic presets</span>
                  </div>

                  <div className="space-y-2">
                    {ROOM_THEMES.map((t) => {
                      const isSelected = theme.name === t.name;
                      return (
                        <button
                          key={t.name}
                          onClick={() => {
                            setTheme(t);
                            addToast(`🎨 Theme changed to ${t.name}`, 'success');
                          }}
                          className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between shadow-xs ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500/50'
                              : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200/90'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Palette color preview swatches */}
                            <div className="flex -space-x-1.5 items-center">
                              <span
                                className="w-5 h-5 rounded-full border-2 border-white shadow-xs inline-block"
                                style={{ backgroundColor: t.floorColor }}
                              />
                              <span
                                className="w-5 h-5 rounded-full border-2 border-white shadow-xs inline-block"
                                style={{ backgroundColor: t.wallColor }}
                              />
                              <span
                                className="w-5 h-5 rounded-full border-2 border-white shadow-xs inline-block"
                                style={{ backgroundColor: t.gridColor }}
                              />
                            </div>
                            <div>
                              <h4 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>{t.name}</h4>
                              <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                {t.name === 'Liids Emerald'
                                  ? 'Signature university emerald & slate'
                                  : t.name === 'Classic White'
                                  ? 'Clean, minimalist daylight white studio'
                                  : t.name === 'Cyberpunk Neon'
                                  ? 'Futuristic neon indigo & magenta'
                                  : t.name === 'Cozy Loft'
                                  ? 'Warm wood, terracotta & sunny ambiance'
                                  : 'Muted slate & architectural gray'}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="px-2 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-xs">
                              <Check className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day / Night Cycle Toggle */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                        <SunMoon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">Dynamic Day / Night Cycle</h4>
                        <span className="text-[10px] text-slate-500 block">Gradual morning, afternoon and twilight lighting</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDayNightCycle(!dayNightCycle);
                        addToast(`🌓 Dynamic lighting ${!dayNightCycle ? 'enabled' : 'disabled'}`, 'info');
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        dayNightCycle ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          dayNightCycle ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Camera Reset */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">Reset 3D Camera</h4>
                        <span className="text-[10px] text-slate-500 block">Re-center camera perspective in current room</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        triggerResetCamera();
                        addToast('🎥 3D Camera reset to default perspective', 'info');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* APP SCREEN 10: LU CAMPUS BUZZ (REAL-TIME MULTIPLAYER CHAT)     */}
          {/* ============================================================== */}
          {activeApp === 'buzz' && (
            <CampusChatApp
              onBack={() => setActiveApp('home')}
              onlinePlayersCount={allOnlinePlayers.length}
            />
          )}

          {/* ============================================================== */}
          {/* BOTTOM HOME-INDICATOR BAR (when inside sub-apps) */}
          {/* ============================================================== */}
          {activeApp !== 'home' && (
            <div className="relative z-40 py-2.5 bg-white/95 border-t border-slate-100 flex items-center justify-center">
              <button
                onClick={() => setActiveApp('home')}
                title="Return to Home Screen"
                className="w-32 h-1 rounded-full bg-slate-400 hover:bg-slate-500 active:bg-slate-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  </>
);
};
