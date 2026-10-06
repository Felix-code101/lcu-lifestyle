import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { GameLocation } from '../types/game';
import {
  Wifi,
  Battery,
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
  Vote,
  ShoppingBag,
  CreditCard,
  Crown,
  Backpack,
  Ticket,
} from 'lucide-react';

type AppId = 'home' | 'bank' | 'chow' | 'gigs' | 'messages' | 'portal' | 'shuttle';

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  avatar: string;
  time: string;
  unread: boolean;
  messages: {
    from: 'npc' | 'player';
    text: string;
    timestamp: string;
  }[];
  quickReplies: {
    label: string;
    responseText: string;
    rewardDesc: string;
    action: () => void;
  }[];
}

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

export const CampusPhone: React.FC = () => {
  const {
    stats,
    addBalance,
    spendBalance,
    navigateToLocation,
    addToast,
    setIsPhoneOpen,
    performActivity,
    setIsElectionsModalOpen,
    setIsHustleModalOpen,
    setIsBettingModalOpen,
    takeLapoLoan,
    repayLapoLoan,
  } = useGame();

  const [activeApp, setActiveApp] = useState<AppId>('home');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Allowance cooldown simulation
  const [allowanceClaimed, setAllowanceClaimed] = useState<boolean>(false);
  const [duesPaid, setDuesPaid] = useState<boolean>(false);

  // Completed gig IDs
  const [completedGigs, setCompletedGigs] = useState<string[]>([]);

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

  // Chat Threads
  const [chatThreads, setChatThreads] = useState<ChatMessage[]>([
    {
      id: 'c1',
      sender: 'Femi (Roommate)',
      role: 'Hostel Room 204',
      avatar: '🧑‍🤝‍🧑',
      time: '10:14 AM',
      unread: true,
      messages: [
        {
          from: 'npc',
          text: 'Bro abeg, hunger wan kill person here o! As you dey come hostel, carry cold soft drink and gala come na!',
          timestamp: '10:14 AM',
        },
      ],
      quickReplies: [
        {
          label: '🥤 Buy Gala & Drink for Femi (-₦500)',
          responseText: 'No wahala Femi, I don buy Gala and chilled malt for you. Coming up!',
          rewardDesc: '+15 Mood • Friendship Boost',
          action: () => {
            if (spendBalance(500)) {
              addToast('Femi: "Ah God bless you my guy! You be true roommate!"', 'success');
            }
          },
        },
        {
          label: '😴 "Stand up go cafeteria yourself bro!"',
          responseText: 'Guy stand up and exercise your legs to the Bukka haha!',
          rewardDesc: '+5 Mood',
          action: () => {
            addToast('Femi: "Chai, wicked roommate! Okay I go manage biscuit!"', 'info');
          },
        },
      ],
    },
    {
      id: 'c2',
      sender: 'Tolu (Course Rep)',
      role: 'Software Eng 300L',
      avatar: '📢',
      time: '09:45 AM',
      unread: true,
      messages: [
        {
          from: 'npc',
          text: 'Attention 300L: Software Architecture lecture has been moved to Faculty Complex Hall 3 by 12:00 PM. Prof says everyone must present their system diagram!',
          timestamp: '09:45 AM',
        },
      ],
      quickReplies: [
        {
          label: '📖 "Noted Rep! Cramming my system diagram now"',
          responseText: 'Got it Tolu, reviewing UML microservices diagrams now. Thanks for update!',
          rewardDesc: '+25 Knowledge • +10 XP',
          action: () => {
            performActivity({
              id: 'cram_diagram',
              title: 'Crammed UML Diagrams',
              description: 'Prepared for the lecture change',
              energyCost: 5,
              cashCost: 0,
              cgpaGain: 0.02,
              moodGain: 5,
              durationMinutes: 15,
            });
          },
        },
        {
          label: '👍 "Confirmed Cap, see you at Hall 3"',
          responseText: 'Noted, see you guys there on time.',
          rewardDesc: '+10 XP',
          action: () => {
            addToast('Course Rep: "See you in class, First Class scholar!"', 'info');
          },
        },
      ],
    },
    {
      id: 'c3',
      sender: 'Mama Ronke',
      role: 'Main Cafeteria Food Vendor',
      avatar: '🍲',
      time: 'Yesterday',
      unread: false,
      messages: [
        {
          from: 'npc',
          text: 'My pikin! Fresh hot party Jollof and goat meat just come down from fire. Come fast before your classmates finish am o!',
          timestamp: 'Yesterday',
        },
      ],
      quickReplies: [
        {
          label: '😋 "Reserve sweet goat meat for me Mama!"',
          responseText: 'Mama Ronke, abeg save the biggest goat meat for me, I dey come soon!',
          rewardDesc: '+10 Mood',
          action: () => {
            addToast('Mama Ronke: "I don keep am for inside hot warmer for you!"', 'success');
          },
        },
      ],
    },
    {
      id: 'c4',
      sender: 'Dr. Adeleke',
      role: 'Faculty Academic Adviser',
      avatar: '👨‍🏫',
      time: 'Yesterday',
      unread: false,
      messages: [
        {
          from: 'npc',
          text: 'Adebayo, your term paper on Distributed Consensus algorithms was impressive. Consistent academic rigor will secure your First-Class Honours graduation.',
          timestamp: 'Yesterday',
        },
      ],
      quickReplies: [
        {
          label: '🙇 "Thank you Sir! Working hard for 5.0 CGPA"',
          responseText: 'Thank you very much Dr. Adeleke! I will remain focused and diligent.',
          rewardDesc: '+35 XP • +0.02 CGPA',
          action: () => {
            performActivity({
              id: 'honours_prep',
              title: 'Honours Mentorship Acknowledged',
              description: 'Received commendation from faculty',
              energyCost: 0,
              cashCost: 0,
              cgpaGain: 0.02,
              moodGain: 20,
              durationMinutes: 5,
            });
          },
        },
      ],
    },
  ]);

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

  // Perform Gig handler
  const handleCompleteGig = (gig: GigItem) => {
    if (completedGigs.includes(gig.id)) {
      addToast('✅ You already completed this gig today!', 'info');
      return;
    }

    if (stats.energy < gig.energyCost) {
      addToast(`❌ Too exhausted! Need ${gig.energyCost}⚡ energy. Grab lunch or rest first.`, 'warning');
      return;
    }

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

    addBalance(gig.payout);
    setCompletedGigs((prev) => [...prev, gig.id]);
    addToast(`💼 Gig finished: Received +₦${gig.payout.toLocaleString()} into student bank!`, 'success');
  };

  // Handle Quick Chat Reply
  const handleReplyChat = (threadId: string, replyIndex: number) => {
    const thread = chatThreads.find((t) => t.id === threadId);
    if (!thread) return;

    const reply = thread.quickReplies[replyIndex];
    if (!reply) return;

    // Execute reply action
    reply.action();

    // Update conversation in state
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            unread: false,
            messages: [
              ...t.messages,
              {
                from: 'player',
                text: reply.responseText,
                timestamp: formatTime(stats.inGameHours, stats.inGameMinutes),
              },
            ],
            // Remove the replied option
            quickReplies: t.quickReplies.filter((_, idx) => idx !== replyIndex),
          };
        }
        return t;
      })
    );
  };

  // Campus Shuttle Fast-Travel
  const campusShuttleDestinations: { id: GameLocation; name: string; tag: string; icon: string }[] = [
    { id: 'home_hostel', name: 'Student Hostel Complex', tag: 'Dorms & Rooms', icon: '🏠' },
    { id: 'campus_map', name: 'Campus 3D Birds-Eye Map', tag: 'Aerial Overview', icon: '🗺️' },
    { id: 'cafeteria', name: 'Main Cafeteria & Bukka', tag: 'Food & Hangout', icon: '🍲' },
    { id: 'lecture_theatre', name: 'Faculty Lecture Theatre', tag: 'FBSS Classes', icon: '🏛️' },
    { id: 'library', name: 'University Central Library', tag: 'Quiet Study & Cram', icon: '📖' },
    { id: 'sports_arena', name: 'LU Sports Arena', tag: 'Football & Fitness', icon: '⚽' },
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

  const totalUnreadMessages = chatThreads.filter((t) => t.unread).length;
  const availableGigsCount = campusGigs.filter((g) => !completedGigs.includes(g.id)).length;

  return (
    <>
      {/* Dimmed backdrop allowing click-outside to close */}
      <div
        onClick={() => setIsPhoneOpen(false)}
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] transition-opacity"
      />

      {/* Modern Smartphone Frame (Clean Silver / Matte White Theme) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-20 sm:bottom-24 right-3 sm:right-8 z-50 w-[94vw] sm:w-[350px] max-w-[360px] h-[640px] max-h-[82vh] rounded-[46px] bg-slate-100 border-[9px] border-slate-300 shadow-2xl shadow-slate-900/25 ring-1 ring-slate-400/40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300 pointer-events-auto"
      >
        {/* Dynamic Island / Top Notch (Sleek Graphite/Silver Accent) */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-28 h-5 rounded-full bg-slate-800/90 flex items-center justify-between px-3 shadow-inner ring-1 ring-slate-600/30 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-500/80" />
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 animate-pulse" />
        </div>

        {/* Status Bar (Dark Charcoal Typography for High Contrast) */}
        <div className="relative z-40 flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-bold text-slate-800 select-none">
          <span>{formatTime(stats.inGameHours, stats.inGameMinutes)}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-600 font-mono">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-slate-700 font-semibold">98%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
            </div>
          </div>
        </div>

        {/* Phone Content Screen Container with Clean Light Wallpaper */}
        <div className="relative flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-sky-50 via-white to-amber-50 text-slate-800">
          {/* Subtle Ambient Wallpaper Glow */}
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* ============================================================== */}
          {/* APP SCREEN 1: HOME SCREEN (4-Column App Grid & Widgets) */}
          {/* ============================================================== */}
          {activeApp === 'home' && (
            <div className="flex-1 flex flex-col justify-between p-4 pb-2 overflow-y-auto animate-in fade-in duration-200">
              {/* Top Student Hub Widget (Pure White Card) */}
              <div className="mt-2 p-3.5 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-sm shadow">
                      🎓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold tracking-tight text-slate-900">LU Student Hub</h4>
                      <p className="text-[10px] text-slate-500">Ibadan Campus • Sunny 31°C</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-semibold">Student Wallet</span>
                    <span className="text-xs font-extrabold text-amber-600">₦{stats.balance.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-semibold">Academic CGPA</span>
                    <span className="text-xs font-extrabold text-emerald-600">{stats.cgpa.toFixed(2)} / 5.00</span>
                  </div>
                </div>
              </div>

              {/* 4-Column App Grid (Sharp Icons on Bright Background) */}
              <div className="my-auto py-4 grid grid-cols-4 gap-y-4 gap-x-2 text-center">
                {/* 1. Bank App */}
                <button
                  onClick={() => setActiveApp('bank')}
                  className="group flex flex-col items-center gap-1.5 focus:outline-hidden"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 border border-purple-200/50 group-hover:scale-105 active:scale-95 transition-transform">
                    <Landmark className="w-6 h-6 text-purple-100" />
                    {!allowanceClaimed && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-black flex items-center justify-center text-white border-2 border-white animate-bounce shadow-sm">
                        ₦
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">Bank</span>
                </button>

                {/* 2. Campus Chow Delivery */}
                <button
                  onClick={() => setActiveApp('chow')}
                  className="group flex flex-col items-center gap-1.5 focus:outline-hidden"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 border border-orange-200/50 group-hover:scale-105 active:scale-95 transition-transform">
                    <UtensilsCrossed className="w-6 h-6 text-orange-100" />
                    <span className="absolute -top-1 -right-1 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white border-2 border-white shadow-sm">
                      HOT
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">Chow</span>
                </button>

                {/* 3. Student Gigs */}
                <button
                  onClick={() => setActiveApp('gigs')}
                  className="group flex flex-col items-center gap-1.5 focus:outline-hidden"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-cyan-200/50 group-hover:scale-105 active:scale-95 transition-transform">
                    <Briefcase className="w-6 h-6 text-cyan-100" />
                    {availableGigsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 flex items-center justify-center border-2 border-white shadow-sm">
                        {availableGigsCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">Gigs</span>
                </button>

                {/* 4. Messages App */}
                <button
                  onClick={() => setActiveApp('messages')}
                  className="group flex flex-col items-center gap-1.5 focus:outline-hidden"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 border border-emerald-200/50 group-hover:scale-105 active:scale-95 transition-transform">
                    <MessageSquare className="w-6 h-6 text-emerald-100" />
                    {totalUnreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm">
                        {totalUnreadMessages}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">Chat</span>
                </button>

                {/* 5. LU Portal */}
                <button
                  onClick={() => setActiveApp('portal')}
                  className="group flex flex-col items-center gap-1.5 focus:outline-hidden"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 border border-rose-200/50 group-hover:scale-105 active:scale-95 transition-transform">
                    <GraduationCap className="w-6 h-6 text-rose-100" />
                    <span className="absolute -top-1 -right-1 px-1 rounded-full bg-emerald-600 text-[8px] font-black text-white border-2 border-white shadow-sm">
                      5.0
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">Portal</span>
                </button>

                {/* 6. Shuttle Fast-Travel */}
                <button
                  onClick={() => setActiveApp('shuttle')}
                  className="group flex flex-col items-center gap-1.5 focus:outline-hidden"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 border border-yellow-200/50 group-hover:scale-105 active:scale-95 transition-transform">
                    <Car className="w-6 h-6 text-slate-950" />
                    <span className="absolute -top-1 -right-1 px-1 rounded-full bg-blue-600 text-[8px] font-bold text-white border-2 border-white shadow-sm">
                      200₦
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">Shuttle</span>
                </button>

                {/* 7. SUG Election App */}
                <button
                  onClick={() => {
                    setIsPhoneOpen(false);
                    setIsElectionsModalOpen(true);
                  }}
                  className="group flex flex-col items-center gap-1.5 focus:outline-hidden"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 border border-teal-200/50 group-hover:scale-105 active:scale-95 transition-transform">
                    <Vote className="w-6 h-6 text-yellow-300" />
                    {stats.isSugCandidate && (
                      <span className="absolute -top-1 -right-1 px-1 rounded-full bg-amber-400 text-[8px] font-black text-slate-950 border-2 border-white shadow-sm">
                        CAND
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">SUG Race</span>
                </button>

                {/* 8. Student Hustles App */}
                <button
                  onClick={() => {
                    setIsPhoneOpen(false);
                    setIsHustleModalOpen(true);
                  }}
                  className="group flex flex-col items-center gap-1.5 focus:outline-hidden"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 border border-amber-200/50 group-hover:scale-105 active:scale-95 transition-transform">
                    <ShoppingBag className="w-6 h-6 text-white" />
                    {stats.smallChopsStock > 0 && (
                      <span className="absolute -top-1 -right-1 px-1 rounded-full bg-emerald-500 text-[8px] font-bold text-white border-2 border-white shadow-sm">
                        {stats.smallChopsStock}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">Hustles</span>
                </button>

                {/* 9. Campus Bet App */}
                <button
                  onClick={() => {
                    setIsPhoneOpen(false);
                    setIsBettingModalOpen(true);
                  }}
                  className="group flex flex-col items-center gap-1.5 focus:outline-hidden"
                >
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 border border-emerald-200/50 group-hover:scale-105 active:scale-95 transition-transform">
                    <Ticket className="w-6 h-6 text-yellow-300" />
                    <span className="absolute -top-1 -right-1 px-1 rounded-full bg-rose-500 text-[8px] font-black text-white border-2 border-white shadow-sm">
                      1X2
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 tracking-tight">CampusBet</span>
                </button>
              </div>

              {/* Bottom Quick Launch Dock on Phone (Glassy White Pill) */}
              <div className="p-2.5 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/90 flex items-center justify-around shadow-sm">
                <button
                  onClick={() => setActiveApp('bank')}
                  className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-purple-600 transition-colors shadow-2xs"
                  title="Bank"
                >
                  <Landmark className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveApp('chow')}
                  className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-orange-600 transition-colors shadow-2xs"
                  title="Campus Chow"
                >
                  <UtensilsCrossed className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveApp('messages')}
                  className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-emerald-600 transition-colors shadow-2xs"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveApp('portal')}
                  className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-rose-600 transition-colors shadow-2xs"
                  title="Portal"
                >
                  <GraduationCap className="w-5 h-5" />
                </button>
              </div>
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
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">Transfer to Femi (Roommate)</span>
                        <span className="text-[10px] text-slate-500">₦1,000 • +15 Mood</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (spendBalance(1000)) {
                          addToast('Femi received ₦1,000! "Thanks boss, you be life saver!"', 'success');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-xs active:scale-95"
                    >
                      Send
                    </button>
                  </div>
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
                {campusGigs.map((gig) => {
                  const isDone = completedGigs.includes(gig.id);
                  return (
                    <div
                      key={gig.id}
                      className={`p-3.5 rounded-2xl border transition-all shadow-xs ${
                        isDone
                          ? 'bg-slate-100/90 border-slate-200 opacity-60'
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
                          onClick={() => handleCompleteGig(gig)}
                          disabled={isDone}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold shadow-xs ${
                            isDone
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95'
                          }`}
                        >
                          {isDone ? 'Completed' : 'Accept Gig'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* APP SCREEN 5: MESSAGES (Campus NPC Chat Threads) */}
          {/* ============================================================== */}
          {activeApp === 'messages' && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
              {/* App Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/95 border-b border-slate-200">
                <button
                  onClick={() => {
                    if (selectedChatId) setSelectedChatId(null);
                    else setActiveApp('home');
                  }}
                  className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {selectedChatId ? 'Inbox' : 'Back'}
                </button>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedChatId
                    ? chatThreads.find((t) => t.id === selectedChatId)?.sender
                    : 'Campus Messages'}
                </span>
                <span className="w-6" />
              </div>

              {/* Chat Inbox View */}
              {!selectedChatId && (
                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                  {chatThreads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => {
                        setSelectedChatId(thread.id);
                        // Mark as read
                        setChatThreads((prev) =>
                          prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t))
                        );
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 flex items-center gap-3 transition-colors shadow-xs"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-xl shrink-0">
                        {thread.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-bold text-slate-900 text-[11px] truncate">{thread.sender}</h4>
                          <span className="text-[9px] text-slate-400">{thread.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {thread.messages[thread.messages.length - 1]?.text}
                        </p>
                      </div>
                      {thread.unread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-200 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Individual Active Chat Conversation */}
              {selectedChatId && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden p-3 text-xs bg-slate-50/60">
                  {/* Messages Bubble History */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {chatThreads
                      .find((t) => t.id === selectedChatId)
                      ?.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col ${m.from === 'player' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl shadow-xs ${
                              m.from === 'player'
                                ? 'bg-emerald-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80'
                            }`}
                          >
                            <p className="text-[11px] leading-relaxed">{m.text}</p>
                            <span className={`text-[8px] mt-1 block text-right ${m.from === 'player' ? 'text-white/70' : 'text-slate-400'}`}>
                              {m.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Interactive Quick Reply Choices */}
                  <div className="pt-2 border-t border-slate-200 space-y-1.5 shrink-0 bg-white p-2.5 rounded-t-2xl shadow-xs">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 block px-1 font-bold">
                      Quick Responses:
                    </span>
                    {chatThreads.find((t) => t.id === selectedChatId)?.quickReplies.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic px-1">Chat caught up for now.</p>
                    ) : (
                      chatThreads
                        .find((t) => t.id === selectedChatId)
                        ?.quickReplies.map((reply, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => handleReplyChat(selectedChatId, rIdx)}
                            className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 flex items-center justify-between text-[10px] text-slate-800 transition-all active:scale-95"
                          >
                            <span className="font-semibold">{reply.label}</span>
                            <span className="text-[9px] text-emerald-600 font-bold">{reply.rewardDesc}</span>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
                      <p className="text-[9px] text-white/80">{stats.department} • 300 Level</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <span className="text-[8px] uppercase tracking-wider text-white/70 block">Cumulative GPA</span>
                      <span className="text-base font-black text-emerald-300">{stats.cgpa.toFixed(2)}</span>
                    </div>
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <span className="text-[8px] uppercase tracking-wider text-white/70 block">Honours Status</span>
                      <span className="text-[10px] font-bold text-amber-300">
                        {stats.cgpa >= 4.5 ? 'First Class 🏅' : stats.cgpa >= 3.5 ? 'Second Class Upper' : 'Second Class Lower'}
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
          {/* BOTTOM HOME-INDICATOR BAR (Soft Grey) */}
          {/* ============================================================== */}
          <div className="relative z-40 py-2.5 flex items-center justify-center">
            <button
              onClick={() => {
                if (activeApp !== 'home') {
                  setActiveApp('home');
                } else {
                  setIsPhoneOpen(false);
                }
              }}
              title={activeApp !== 'home' ? 'Return to Home Screen' : 'Close Phone'}
              className="w-32 h-1 rounded-full bg-slate-400 hover:bg-slate-500 active:bg-slate-600 transition-all hover:scale-105 active:scale-95"
            />
          </div>
        </div>
      </div>
    </>
  );
};
