import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  Send,
  Lock,
  Home,
  DoorOpen,
  DollarSign,
  HandCoins,
  UtensilsCrossed,
  Smile,
  Bell,
  CheckCheck,
  X,
  CreditCard,
  MoreHorizontal,
  Flame,
  Mic,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useDirectMessages, type DirectMessageMetadata } from '../hooks/useDirectMessages';
import { supabase, getRegisteredStudents, getStudentAccounts } from '../lib/supabase';
import type { RemotePlayer, GameLocation } from '../types/game';

export interface PeerUser {
  matricNo: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  status: 'nepo' | 'lapo';
  department?: string;
  level?: string;
  location?: GameLocation;
  lastMessageSnippet?: string;
  lastMessageTime?: string;
  unread?: boolean;
}

interface MessagesAppProps {
  onBackToHome: () => void;
  allOnlinePlayers?: RemotePlayer[];
  onOpenCampusBuzz?: () => void;
}

export const MessagesApp: React.FC<MessagesAppProps> = ({
  onBackToHome,
  allOnlinePlayers = [],
  onOpenCampusBuzz,
}) => {
  const { stats, spendBalance, currentLocation, navigateToLocation, addToast } =
    useGame();

  // Active Peer for Screen B (null means Screen A: Inbox)
  const [activePeer, setActivePeer] = useState<PeerUser | null>(null);

  // Tabs on Screen A
  const [activeTab, setActiveTab] = useState<'chats' | 'updates'>('chats');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  // Modals inside Screen B
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState<boolean>(false);
  const [sendMoneyAmount, setSendMoneyAmount] = useState<string>('2000');
  const [isRequestMoneyModalOpen, setIsRequestMoneyModalOpen] = useState<boolean>(false);
  const [requestMoneyAmount, setRequestMoneyAmount] = useState<string>('2000');
  const [isBuyFoodModalOpen, setIsBuyFoodModalOpen] = useState<boolean>(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState<boolean>(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState<boolean>(false);

  // Text message input state
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChatUser = useMemo(
    () =>
      activePeer
        ? {
            matric_no: activePeer.matricNo,
            username: activePeer.username,
          }
        : null,
    [activePeer]
  );

  // Direct messages hook for active peer (with live Realtime subscription)
  const { messages, isLoading, sendMessage } = useDirectMessages({
    targetMatric: activePeer?.matricNo || '',
    targetUsername: activePeer?.username || '',
    activeChatUser: activeChatUser || undefined,
  });

  // Base list of seeded peers
  const basePeers: PeerUser[] = useMemo(() => {
    return [
      {
        matricNo: 'LU/24/0007',
        username: 'VeryDarkDude_',
        displayName: 'VeryDarkDude (Campus Vlogger)',
        avatar: '🕶️',
        isOnline: true,
        status: 'lapo',
        department: 'Mass Communication',
        level: '300L',
        location: 'sub',
        lastMessageSnippet: 'You: How far? 🫱🏿',
        lastMessageTime: 'now',
      },
      {
        matricNo: 'LU/24/1104',
        username: 'Chioma_VIP',
        displayName: 'Chioma Okafor',
        avatar: '💅',
        isOnline: true,
        status: 'nepo',
        department: 'Private & Property Law',
        level: '100L',
        location: 'lions_hall',
        lastMessageSnippet: 'Chioma: Free cocktails on me at Lions Hall! 🥂',
        lastMessageTime: '12m',
      },
      {
        matricNo: 'LU/24/0982',
        username: 'Femi_Codes',
        displayName: 'Femi Adeleke (Roommate)',
        avatar: '💻',
        isOnline: true,
        status: 'lapo',
        department: 'Software Engineering',
        level: '100L',
        location: 'home_hostel',
        lastMessageSnippet: 'Femi: Bro carry cold soft drink and gala come! 🥤',
        lastMessageTime: '45m',
        unread: true,
      },
      {
        matricNo: 'LU/24/0521',
        username: 'Tolu_Rep',
        displayName: 'Tolu Davies (Course Rep)',
        avatar: '📢',
        isOnline: false,
        status: 'lapo',
        department: 'Mass Communication',
        level: '100L',
        location: 'home_hostel',
        lastMessageSnippet: 'Tolu: Architecture lecture is Hall 3',
        lastMessageTime: '2h',
      },
      {
        matricNo: 'LU/24/0744',
        username: 'Amina_Health',
        displayName: 'Amina Bello',
        avatar: '🩺',
        isOnline: true,
        status: 'lapo',
        department: 'Nursing Science',
        level: '100L',
        location: 'medical_centre',
        lastMessageSnippet: 'Amina: See you at the clinic later',
        lastMessageTime: '1d',
      },
    ];
  }, []);

  // Track active DM threads for the current student account.
  // Newly created students do NOT appear in the user's inbox until searched or messaged.
  const [activeChatMatrics, setActiveChatMatrics] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(`lu_active_chats_${stats.matricNo || 'default'}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    // Default contact: only Roommate Femi Adeleke so fresh student inbox is clean
    return ['LU/24/0982'];
  });

  const recordActiveChat = useCallback(
    (matricNo: string) => {
      if (!matricNo) return;
      setActiveChatMatrics((prev) => {
        if (prev.includes(matricNo)) return prev;
        const next = [matricNo, ...prev];
        try {
          localStorage.setItem(`lu_active_chats_${stats.matricNo || 'default'}`, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [stats.matricNo]
  );

  // Listen for incoming direct messages across tabs / network to add sender to active chats
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const bc = new BroadcastChannel('lu_direct_messages');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_DM' && event.data.payload) {
          const msg = event.data.payload;
          const recipient = (msg.recipient_matric || msg.recipient_id || '').toLowerCase();
          const myMatric = (stats.matricNo || '').toLowerCase();
          const sender = msg.sender_matric || msg.sender_id;
          if (recipient === myMatric && sender) {
            recordActiveChat(sender);
          }
        }
      };
      return () => {
        bc.close();
      };
    } catch {
      // ignore
    }
  }, [stats.matricNo, recordActiveChat]);

  // Realtime Supabase listener to add new DM conversations to the inbox
  useEffect(() => {
    if (!stats.matricNo || !supabase) return;
    const myMatricClean = stats.matricNo.trim().toLowerCase();

    const channel = supabase
      .channel(`inbox-dms-${myMatricClean.replace(/\//g, '_')}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload: any) => {
          const newMsg = payload.new;
          if (!newMsg) return;
          const recipient = (newMsg.recipient_matric || newMsg.recipient_id || '').trim().toLowerCase();
          const sender = (newMsg.sender_matric || newMsg.sender_id || '').trim();

          if (recipient === myMatricClean && sender.toLowerCase() !== myMatricClean) {
            recordActiveChat(sender);
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [stats.matricNo, recordActiveChat]);

  // Load registered campus students & accounts for directory search
  const [directoryStudents, setDirectoryStudents] = useState<PeerUser[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchDirectory = async () => {
      try {
        const [students, accounts] = await Promise.all([
          getRegisteredStudents(),
          getStudentAccounts(),
        ]);
        if (!isMounted) return;

        const map = new Map<string, PeerUser>();

        // 1. Registered Student Accounts
        accounts.forEach((acc) => {
          if (acc.matricNo === stats.matricNo) return;
          const userTag = acc.username.replace(/\s+/g, '_');
          map.set(acc.matricNo, {
            matricNo: acc.matricNo,
            username: userTag,
            displayName: acc.username,
            avatar:
              acc.gender === 'female'
                ? acc.status === 'nepo'
                  ? '👑'
                  : '🎀'
                : acc.status === 'nepo'
                ? '👑'
                : '🎒',
            isOnline: false,
            status: acc.status === 'nepo' ? 'nepo' : 'lapo',
            department: acc.department,
            level: acc.level,
            lastMessageSnippet: `Say hi to @${userTag}`,
            lastMessageTime: '',
          });
        });

        // 2. Supabase Students table
        students.forEach((stu) => {
          if (stu.matricNo === stats.matricNo) return;
          if (!map.has(stu.matricNo)) {
            const userTag = (stu.username || stu.matricNo).replace(/\s+/g, '_');
            map.set(stu.matricNo, {
              matricNo: stu.matricNo,
              username: userTag,
              displayName: stu.username,
              avatar: stu.status === 'nepo' ? '👑' : '🎒',
              isOnline: stu.isOnline ?? false,
              status: stu.status === 'nepo' ? 'nepo' : 'lapo',
              department: stu.department,
              level: stu.level,
              lastMessageSnippet: `Say hi to @${userTag}`,
              lastMessageTime: '',
            });
          }
        });

        setDirectoryStudents(Array.from(map.values()));
      } catch (err) {
        console.warn('Failed to load campus directory for messages', err);
      }
    };

    fetchDirectory();
    return () => {
      isMounted = false;
    };
  }, [stats.matricNo]);

  // Unified campus directory (base peers + registered students + live multiplayer)
  const allDirectoryPeers: PeerUser[] = useMemo(() => {
    const map = new Map<string, PeerUser>();

    // 1. Base Seed Peers
    basePeers.forEach((p) => {
      if (p.matricNo !== stats.matricNo) {
        map.set(p.matricNo, { ...p });
      }
    });

    // 2. Registered Student Accounts & DB Students
    directoryStudents.forEach((p) => {
      if (p.matricNo !== stats.matricNo) {
        map.set(p.matricNo, { ...p });
      }
    });

    // 3. Online multiplayer players (mark active presence and location)
    allOnlinePlayers.forEach((player) => {
      if (player.matricNo === stats.matricNo) return;
      const existing = map.get(player.matricNo);
      if (existing) {
        existing.isOnline = true;
        existing.location = player.location;
      } else {
        const usernameTag = player.username.replace(/\s+/g, '_');
        map.set(player.matricNo, {
          matricNo: player.matricNo,
          username: usernameTag,
          displayName: player.username,
          avatar: player.status === 'nepo' ? '👑' : '🎒',
          isOnline: true,
          status: player.status,
          department: player.department,
          level: player.level,
          location: player.location,
          lastMessageSnippet: '🟢 Online now in campus',
          lastMessageTime: 'just now',
        });
      }
    });

    return Array.from(map.values());
  }, [basePeers, directoryStudents, allOnlinePlayers, stats.matricNo]);

  // Active Chats List: only shows users that the player has an active conversation with
  const activeChatsList = useMemo(() => {
    return allDirectoryPeers.filter((p) => activeChatMatrics.includes(p.matricNo));
  }, [allDirectoryPeers, activeChatMatrics]);

  // Directory Search Results (when searching for a peer by username, name, or matric number)
  const directorySearchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().replace('@', '').trim();
    if (!query) return [];
    return allDirectoryPeers.filter(
      (p) =>
        p.username.toLowerCase().includes(query) ||
        p.displayName.toLowerCase().includes(query) ||
        p.matricNo.toLowerCase().includes(query) ||
        (p.department && p.department.toLowerCase().includes(query))
    );
  }, [allDirectoryPeers, searchQuery]);

  // Helper to open chat with peer from search and save to active chats
  const handleStartChatWithPeer = (peer: PeerUser) => {
    recordActiveChat(peer.matricNo);
    setActivePeer(peer);
    setSearchQuery('');
  };

  // Auto-scroll chat history on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending || !activePeer) return;

    recordActiveChat(activePeer.matricNo);
    setIsSending(true);
    setInputText('');
    setIsEmojiPickerOpen(false);
    await sendMessage(text, { type: 'text' });
    setIsSending(false);
  };

  // Quick reply chips
  const nigerianQuickChips = [
    'How far? 👏',
    'I dey o 😂',
    'Wetin dey happen?',
    'Where you dey? 👀',
    'Send urgent 2k 💸',
    'Come my hostel 🏠',
    'Drop aza 💳',
  ];

  // Emojis list
  const emojiPalette = ['😂', '🔥', '👏', '🍾', '💸', '🍛', '😴', '❤️', '🙌', '👀', '💯', '🙏'];

  const handleMicClick = () => {
    addToast('🎙️ Voice note simulation (Hold to record)', 'info');
  };

  // =========================================================================
  // INTERACTIVE SOCIAL ACTION PILL HANDLERS
  // =========================================================================

  // 1. 🏠 Invite over
  const handleInviteOver = async () => {
    if (!activePeer) return;
    const currentLocName =
      currentLocation === 'home_hostel'
        ? 'Hall 4 Hostel Room'
        : currentLocation === 'sub'
        ? 'Student Union Building'
        : 'Campus Grounds';

    await sendMessage(`🏠 I'm chilling at ${currentLocName}. Tap to come over!`, {
      type: 'invite_hostel',
      location: currentLocation,
      status: 'pending',
    });

    addToast(`📨 Sent hostel invite to @${activePeer.username}!`, 'success');
  };

  // 2. 🚪 Visit them
  const handleVisitThem = () => {
    if (!activePeer) return;
    const targetLoc: GameLocation = activePeer.location || 'home_hostel';
    navigateToLocation(targetLoc);
    addToast(`🏃 Teleporting to @${activePeer.username}'s spot (${targetLoc})!`, 'info');
  };

  // 3. 💸 Send money
  const handleConfirmSendMoney = async () => {
    const amountNum = parseInt(sendMoneyAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast('❌ Please enter a valid amount', 'warning');
      return;
    }

    if (stats.balance < amountNum) {
      addToast(`❌ Insufficient funds! You have ₦${stats.balance.toLocaleString()}`, 'warning');
      return;
    }

    if (spendBalance(amountNum)) {
      await sendMessage(`💸 Sent ₦${amountNum.toLocaleString()} via Kuda Instant Transfer!`, {
        type: 'money_transfer',
        amount: amountNum,
        status: 'completed',
      });
      addToast(`✅ Transferred ₦${amountNum.toLocaleString()} to @${activePeer?.username}!`, 'success');
      setIsSendMoneyModalOpen(false);
    }
  };

  // 4. 🙏 Request money
  const handleConfirmRequestMoney = async () => {
    const amountNum = parseInt(requestMoneyAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast('❌ Please enter a valid amount', 'warning');
      return;
    }

    await sendMessage(`🙏 Urgent billing: Guy abeg send ₦${amountNum.toLocaleString()} for urgent survival!`, {
      type: 'money_request',
      amount: amountNum,
      status: 'pending',
    });

    addToast(`📩 Billing request for ₦${amountNum.toLocaleString()} sent to @${activePeer?.username}!`, 'info');
    setIsRequestMoneyModalOpen(false);
  };

  // 5. 🍛 Buy food
  const handleConfirmBuyFood = async (foodName: string, price: number, energyGain: number) => {
    if (stats.balance < price) {
      addToast(`❌ Insufficient funds for ${foodName}! Need ₦${price.toLocaleString()}`, 'warning');
      return;
    }

    if (spendBalance(price)) {
      await sendMessage(`🍛 Ordered ${foodName} (+${energyGain}⚡ Energy) delivered straight to you!`, {
        type: 'food_gift',
        foodName,
        amount: price,
        status: 'completed',
      });
      addToast(`🛵 Ordered ${foodName} for @${activePeer?.username}! (-₦${price.toLocaleString()})`, 'success');
      setIsBuyFoodModalOpen(false);
    }
  };

  // Respond to Money Request
  const handlePayBillingRequest = (reqAmount: number) => {
    if (stats.balance < reqAmount) {
      addToast(`❌ Insufficient funds to pay billing! Need ₦${reqAmount.toLocaleString()}`, 'warning');
      return;
    }

    if (spendBalance(reqAmount)) {
      sendMessage(`✅ Settled your billing of ₦${reqAmount.toLocaleString()}! Enjoy bro 🤝`, {
        type: 'money_transfer',
        amount: reqAmount,
        status: 'completed',
      });
      addToast(`💸 Paid ₦${reqAmount.toLocaleString()} billing request!`, 'success');
    }
  };

  // Format message time (12-hour format e.g. "10:05 PM")
  const formatTime = (iso?: string) => {
    if (!iso) return '10:05 PM';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '10:05 PM';
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return '10:05 PM';
    }
  };

  // Format date badge (e.g. "Tue, Oct 6")
  const formatChatDate = (iso?: string) => {
    if (!iso) return 'Tue, Oct 6';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return 'Tue, Oct 6';
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return 'Tue, Oct 6';
    }
  };

  const newMessagesSeparatorIndex = useMemo(() => {
    if (messages.length === 0) return -1;
    const firstIncoming = messages.findIndex(
      (m) =>
        (m.sender_matric || m.sender_id || '').toLowerCase() !==
        (stats.matricNo || '').toLowerCase()
    );
    if (firstIncoming !== -1) return firstIncoming;
    return messages.length > 1 ? messages.length - 1 : 0;
  }, [messages, stats.matricNo]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 select-none overflow-hidden animate-in fade-in duration-200">
      {/* =================================================================== */}
      {/* SCREEN A: MESSAGES HUB / INBOX LIST                                */}
      {/* =================================================================== */}
      {!activePeer && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shrink-0 shadow-2xs">
            <div className="flex items-center justify-between">
              <button
                onClick={onBackToHome}
                className="p-1 -ml-1 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Home
              </button>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Messages</h2>
              <span className="w-8" />
            </div>

            {/* Tabs: [Chats | Updates] */}
            <div className="flex items-center mt-3 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'chats'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Chats
              </button>
              <button
                onClick={() => setActiveTab('updates')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'updates'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Updates
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            {activeTab === 'chats' ? (
              <>
                {/* Notification Banner */}
                {!notificationsEnabled && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-200/80 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bell className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                        Get notified when friends message you
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setNotificationsEnabled(true);
                        addToast('🔔 Direct message notifications turned on!', 'success');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                    >
                      Turn on
                    </button>
                  </div>
                )}

                {/* Search / Directory Lookup Input */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campus: @username, name, or matric..."
                    className="w-full bg-white pl-8 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* WHEN SEARCHING: Show Directory Search Results */}
                {searchQuery.trim() !== '' ? (
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center justify-between">
                      <span>Campus Directory Search</span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        {directorySearchResults.length} found
                      </span>
                    </div>

                    <div className="space-y-2">
                      {directorySearchResults.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 p-4">
                          <p className="font-semibold text-xs text-slate-700">No student found</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            No student matches &quot;{searchQuery}&quot;. Ask for their exact @username or matric number!
                          </p>
                        </div>
                      ) : (
                        directorySearchResults.map((peer) => (
                          <div
                            key={peer.matricNo}
                            onClick={() => handleStartChatWithPeer(peer)}
                            className="p-3 rounded-2xl bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 flex items-center justify-between gap-3 transition-all shadow-2xs group cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Avatar */}
                              <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform">
                                  {peer.avatar}
                                </div>
                                {peer.isOnline && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-2xs animate-pulse" />
                                )}
                              </div>

                              {/* Student Profile Info */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs truncate">
                                    @{peer.username}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider shrink-0 ${
                                      peer.status === 'nepo'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {peer.status === 'nepo' ? '👑 Nepo' : '💼 Lapo'}
                                  </span>
                                  {peer.isOnline && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-green-100 text-green-700">
                                      Online
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] font-medium text-slate-700 truncate">
                                  {peer.displayName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {peer.department || 'Liids University'} · {peer.matricNo}
                                </p>
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartChatWithPeer(peer);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shrink-0 shadow-xs transition-colors cursor-pointer"
                            >
                              Message
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* WHEN NOT SEARCHING: Normal Inbox with Groups & Active Chats */
                  <>
                    {/* Section "GROUPS" Card Banner */}
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                        Groups
                      </div>
                      <div
                        onClick={() => {
                          if (onOpenCampusBuzz) onOpenCampusBuzz();
                          else addToast('🎉 Opening LU Campus Buzz group broadcast!', 'info');
                        }}
                        className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-900 to-indigo-800 text-white border border-purple-700/50 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🍾</span>
                            <h4 className="font-bold text-xs tracking-tight text-white group-hover:text-purple-200 transition-colors">
                              LU Campus Buzz & Nightlife
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/40 text-purple-200 text-[9px] font-bold border border-purple-400/30">
                            {Math.max(1, allOnlinePlayers.length + 1)} Online
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-200/90 mt-1.5 leading-snug">
                          Make a group with your friends - Add them by username, chat together and plan Quilox nights 🍾
                        </p>
                      </div>
                    </div>

                    {/* Section "CHATS" (Only shows active conversations) */}
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center justify-between">
                        <span>Chats</span>
                        <span className="text-[9px] lowercase font-normal text-slate-400">
                          {activeChatsList.length} conversations
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {activeChatsList.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 p-4">
                            <p className="font-semibold text-xs text-slate-600">No active chats yet</p>
                            <p className="text-[10px] mt-0.5">
                              Search for a student above by their @username or matric number to start messaging them!
                            </p>
                          </div>
                        ) : (
                          activeChatsList.map((peer) => (
                            <button
                              key={peer.matricNo}
                              onClick={() => setActivePeer(peer)}
                              className="w-full text-left p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-emerald-300 flex items-center gap-3 transition-all shadow-2xs group cursor-pointer"
                            >
                              {/* Avatar with Online Dot */}
                              <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform">
                                  {peer.avatar}
                                </div>
                                {peer.isOnline && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-2xs animate-pulse" />
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-bold text-slate-900 text-xs truncate">
                                      @{peer.username}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider shrink-0 ${
                                        peer.status === 'nepo'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {peer.status === 'nepo' ? '👑 Nepo' : '💼 Lapo'}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-slate-400 font-medium shrink-0 ml-1">
                                    {peer.lastMessageTime || 'now'}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-500 truncate group-hover:text-slate-700">
                                  {peer.lastMessageSnippet || `Say hi to @${peer.username}`}
                                </p>
                              </div>

                              {peer.unread && (
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      {/* Search Discovery Hint */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/70 text-slate-500 flex items-center gap-2">
                        <span className="text-xs">🔒</span>
                        <p className="text-[10px] leading-tight">
                          Private campus directory: New users won&apos;t appear here until you search for them or they send you a message.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Updates Tab */
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">📢</span>
                    <span className="font-bold text-xs text-slate-900">SUG Electoral Commission</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Campaign rallies for presidential tickets are open at SUB amphitheatre. Cast your vote in the phone SUG app!
                  </p>
                  <span className="text-[9px] text-slate-400 mt-2 block">10 mins ago</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🍔</span>
                    <span className="font-bold text-xs text-slate-900">Campus Chow Logistics</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Night delivery is active for all halls. Use the Chow app to order smoky party jollof right to your doorstep!
                  </p>
                  <span className="text-[9px] text-slate-400 mt-2 block">1 hour ago</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SCREEN B: ACTIVE 1-ON-1 DIRECT MESSAGE SCREEN                      */}
      {/* =================================================================== */}
      {activePeer && (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-3.5 pt-3 pb-2.5 shrink-0 z-10 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActivePeer(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors cursor-pointer -ml-1"
                  title="Back"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <span className="font-bold text-sm text-slate-900 tracking-tight">
                  @{activePeer.username}
                </span>
              </div>

              {/* Right: More options circle button (•••) */}
              <button
                onClick={() => setIsMoreOptionsOpen(true)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle: 🔒 Private · only you and @Username can see this (small, muted text) */}
            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 pl-1 font-normal">
              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Private · only you and @{activePeer.username} can see this</span>
            </div>
          </div>

          {/* Streak Card */}
          <div className="mx-3.5 mt-2.5 mb-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2 shadow-2xs shrink-0">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
                <span>Start a streak.</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                Both of you do something together on the same day, every day.
              </p>
            </div>
            <button
              onClick={() => setIsStreakModalOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0 whitespace-nowrap cursor-pointer transition-colors"
            >
              What counts?
            </button>
          </div>

          {/* Action Chips Row */}
          <div className="px-3.5 pb-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {/* 🏠 Invite (light green tint) */}
            <button
              onClick={handleInviteOver}
              className="flex-1 min-w-[95px] py-2 px-3 rounded-full bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/70 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <span className="text-xs">🏠</span>
              <span>Invite</span>
            </button>

            {/* 🚪 Visit (light blue/grey tint) */}
            <button
              onClick={handleVisitThem}
              className="flex-1 min-w-[95px] py-2 px-3 rounded-full bg-sky-50/80 hover:bg-sky-100/90 border border-sky-200/70 text-sky-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <span className="text-xs">🚪</span>
              <span>Visit</span>
            </button>

            {/* 💸 Send money (light yellow tint) */}
            <button
              onClick={() => setIsSendMoneyModalOpen(true)}
              className="flex-1 min-w-[110px] py-2 px-3 rounded-full bg-amber-50 hover:bg-amber-100/90 border border-amber-200/70 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <span className="text-xs">💸</span>
              <span>Send money</span>
            </button>
          </div>

          {/* Chat Stream Canvas */}
          <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-2.5 bg-white">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Opening secure direct channel...</span>
              </div>
            ) : messages.length === 0 ? (
              /* Greeting Wave */
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 gap-2.5">
                <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
                  👋
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Say hi to @{activePeer.username}
                  </h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mt-0.5">
                    No messages yet in this private chat. Break the ice, send some urgent 2k, or invite them over!
                  </p>
                </div>
                <button
                  onClick={() => handleSendMessage('How far? 👏')}
                  className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>👋 Send "How far? 👏"</span>
                </button>
              </div>
            ) : (
              <>
                {/* Centered date badge: Tue, Oct 6 in soft grey text */}
                <div className="flex items-center justify-center my-2">
                  <span className="text-xs font-medium text-slate-400">
                    {formatChatDate(messages[0]?.created_at)}
                  </span>
                </div>

                {messages.map((msg, index) => {
                  const isMe =
                    (msg.sender_matric || msg.sender_id || '').toLowerCase() ===
                    (stats.matricNo || '').toLowerCase();
                  const meta: DirectMessageMetadata | undefined = msg.metadata || {
                    type: (msg.action_type as any) || 'text',
                    amount: msg.amount || 0,
                  };

                  const showSeparator = index === newMessagesSeparatorIndex;

                  return (
                    <React.Fragment key={msg.id || index}>
                      {/* Red line separator: ────── New messages ────── */}
                      {showSeparator && (
                        <div className="flex items-center gap-3 my-3 px-2">
                          <div className="flex-1 border-t border-red-200" />
                          <span className="text-red-500 border-red-200 text-xs font-semibold whitespace-nowrap">
                            New messages
                          </span>
                          <div className="flex-1 border-t border-red-200" />
                        </div>
                      )}

                      <div
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in fade-in duration-150`}
                      >
                        {/* SPECIAL INTERACTION CARDS */}
                        {meta?.type === 'money_transfer' ? (
                          /* Money Transfer Card */
                          <div
                            className={`max-w-[85%] p-3.5 rounded-3xl shadow-sm mb-1 text-left ${
                              isMe
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900 border border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold">
                              <DollarSign className={`w-4 h-4 ${isMe ? 'text-blue-200' : 'text-emerald-600'}`} />
                              <span>Kuda Instant Cash Transfer</span>
                            </div>
                            <div className="text-base font-black my-1">
                              ₦{meta.amount?.toLocaleString()}
                            </div>
                            <p className={`text-[11px] ${isMe ? 'text-blue-100' : 'text-gray-700'}`}>
                              {msg.content}
                            </p>
                            <div className={`flex items-center justify-between mt-2 pt-1.5 border-t ${isMe ? 'border-blue-500/40' : 'border-slate-200'} text-[9px]`}>
                              <span className={isMe ? 'text-blue-200 font-semibold' : 'text-emerald-700 font-bold'}>
                                ✓ Settled into student account
                              </span>
                              <span className={isMe ? 'text-blue-200' : 'text-slate-400'}>
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                          </div>
                        ) : meta?.type === 'money_request' ? (
                          /* Money Request / Billing Card */
                          <div
                            className={`max-w-[85%] p-3.5 rounded-3xl shadow-sm mb-1 text-left ${
                              isMe
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900 border border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold">
                              <HandCoins className={`w-4 h-4 ${isMe ? 'text-blue-200' : 'text-amber-600'}`} />
                              <span>Urgent 2k Billing Request</span>
                            </div>
                            <div className="text-base font-black my-1">
                              ₦{meta.amount?.toLocaleString()}
                            </div>
                            <p className={`text-[11px] ${isMe ? 'text-blue-100' : 'text-gray-700'}`}>
                              {msg.content}
                            </p>
                            {!isMe && (
                              <div className="mt-2.5 pt-2 border-t border-slate-200">
                                <button
                                  onClick={() => handlePayBillingRequest(meta.amount || 2000)}
                                  className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  Pay ₦{(meta.amount || 2000).toLocaleString()} Now
                                </button>
                              </div>
                            )}
                            <span className={`text-[9px] mt-1.5 block text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        ) : meta?.type === 'food_gift' ? (
                          /* Food Delivery Gift Card */
                          <div
                            className={`max-w-[85%] p-3.5 rounded-3xl shadow-sm mb-1 text-left ${
                              isMe
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900 border border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold">
                              <UtensilsCrossed className={`w-4 h-4 ${isMe ? 'text-blue-200' : 'text-orange-600'}`} />
                              <span>Campus Chow Delivery Gift</span>
                            </div>
                            <div className="text-xs font-bold my-1 flex items-center gap-1">
                              <span>🛵 {meta.foodName}</span>
                            </div>
                            <p className={`text-[11px] ${isMe ? 'text-blue-100' : 'text-gray-700'}`}>
                              {msg.content}
                            </p>
                            <span className={`text-[9px] mt-1.5 block text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        ) : meta?.type === 'invite_hostel' ? (
                          /* Hostel Invite Card */
                          <div
                            className={`max-w-[85%] p-3.5 rounded-3xl shadow-sm mb-1 text-left ${
                              isMe
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900 border border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold">
                              <Home className={`w-4 h-4 ${isMe ? 'text-blue-200' : 'text-blue-600'}`} />
                              <span>Hostel Hangout Invitation</span>
                            </div>
                            <p className={`text-[11px] my-1 ${isMe ? 'text-blue-100' : 'text-gray-700'}`}>
                              {msg.content}
                            </p>
                            {!isMe && (
                              <button
                                onClick={() => {
                                  const dest = (meta.location as GameLocation) || 'home_hostel';
                                  navigateToLocation(dest);
                                  addToast(`🏃 Accepted invite! Teleporting to ${dest}`, 'success');
                                }}
                                className="mt-2 w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                              >
                                <DoorOpen className="w-3 h-3" />
                                Accept & Warp to Room
                              </button>
                            )}
                            <span className={`text-[9px] mt-1.5 block text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        ) : isMe ? (
                          /* Outgoing messages: Rich vibrant blue pill (bg-blue-600 text-white rounded-3xl py-2 px-4) with white timestamp + double checkmarks (10:05 PM ✓✓) */
                          <div className="relative max-w-[80%] bg-blue-600 text-white rounded-3xl py-2 px-4 shadow-xs text-left">
                            <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap break-words select-text text-white">
                              {msg.content}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-white/90 font-medium">
                              <span>{formatTime(msg.created_at)}</span>
                              <CheckCheck className="w-3.5 h-3.5 text-white inline" />
                            </div>
                          </div>
                        ) : (
                          /* Incoming messages: Off-white/light grey bubble (bg-gray-100 text-gray-900 rounded-3xl py-2 px-4) */
                          <div className="relative max-w-[80%] bg-gray-100 text-gray-900 rounded-3xl py-2 px-4 shadow-2xs text-left">
                            <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap break-words select-text text-gray-900">
                              {msg.content}
                            </p>
                            <div className="flex items-center justify-start gap-1 mt-1 text-[9px] text-slate-400 font-medium">
                              <span>{formatTime(msg.created_at)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies & Input Bar */}
          {/* Quick reply pill carousels: How far? 👏, I dey o 😂, Wetin dey happen?, etc. */}
          <div className="bg-white border-t border-slate-100 px-3 py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
            {nigerianQuickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium whitespace-nowrap shrink-0 transition-colors active:scale-95 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Emoji Palette Dropdown */}
          {isEmojiPickerOpen && (
            <div className="bg-white border-t border-slate-100 px-3 py-2 flex items-center justify-around gap-1 shrink-0 animate-in slide-in-from-bottom-2 duration-150">
              {emojiPalette.map((em, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText((prev) => prev + em)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-sm transition-transform active:scale-125 cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          {/* Input row: White capsule input with smiley emoji icon on the left, Message @username... placeholder, and a green circular action button on the right (Send icon or Mic icon) */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            {/* White capsule input */}
            <div className="flex-1 bg-white border border-slate-200 rounded-full px-3.5 py-2 flex items-center gap-2 shadow-2xs focus-within:border-slate-300 focus-within:ring-1 focus-within:ring-slate-200 transition-all">
              <button
                onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                title="Insert emoji"
                type="button"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Message @${activePeer.username}...`}
                disabled={isSending}
                maxLength={280}
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Green circular action button on the right (Send icon or Mic icon) */}
            <button
              onClick={() => {
                if (inputText.trim()) {
                  handleSendMessage();
                } else {
                  handleMicClick();
                }
              }}
              disabled={isSending}
              className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0 cursor-pointer active:scale-95 transition-all"
              title={inputText.trim() ? 'Send message' : 'Voice note'}
              type="button"
            >
              {inputText.trim() ? (
                <Send className="w-4 h-4 ml-0.5" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SOCIAL ACTION MODALS (Send Money, Request Money, Buy Food)          */}
      {/* =================================================================== */}

      {/* 1. SEND MONEY MODAL */}
      {isSendMoneyModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-4 w-full max-w-xs shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Send Money to @{activePeer?.username}</span>
              </div>
              <button
                onClick={() => setIsSendMoneyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2.5">
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>Your Bank Balance:</span>
                <span className="font-bold text-emerald-600">₦{stats.balance.toLocaleString()}</span>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                  ₦
                </span>
                <input
                  type="number"
                  value={sendMoneyAmount}
                  onChange={(e) => setSendMoneyAmount(e.target.value)}
                  placeholder="2000"
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Quick Pills */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {['1000', '2000', '5000', '10000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSendMoneyAmount(amt)}
                    className="py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-[10px] font-bold text-slate-700 transition-colors"
                  >
                    ₦{parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsSendMoneyModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendMoney}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Send Cash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REQUEST MONEY MODAL */}
      {isRequestMoneyModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-4 w-full max-w-xs shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <HandCoins className="w-4 h-4 text-amber-600" />
                <span>Urgent 2k Billing Request</span>
              </div>
              <button
                onClick={() => setIsRequestMoneyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2.5">
              <p className="text-[10px] text-slate-500">
                Send an urgent billing notification to @{activePeer?.username} asking for campus relief funds.
              </p>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                  ₦
                </span>
                <input
                  type="number"
                  value={requestMoneyAmount}
                  onChange={(e) => setRequestMoneyAmount(e.target.value)}
                  placeholder="2000"
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Quick Pills */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {['2000', '3000', '5000', '10000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setRequestMoneyAmount(amt)}
                    className="py-1 rounded-lg bg-slate-100 hover:bg-amber-50 text-[10px] font-bold text-slate-700 transition-colors"
                  >
                    ₦{parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRequestMoneyModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequestMoney}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Request Billing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BUY FOOD MODAL */}
      {isBuyFoodModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-4 w-full max-w-xs shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                <span>Buy Meal for @{activePeer?.username}</span>
              </div>
              <button
                onClick={() => setIsBuyFoodModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <p className="text-[10px] text-slate-500 mb-1">
                Select a campus delicacy to deliver to their hostel:
              </p>

              {[
                { name: 'Smoky Party Jollof & Dodo', price: 1800, energy: 45, icon: '🍛' },
                { name: 'Ibadan Amala & Gbegiri-Ewedu', price: 2200, energy: 55, icon: '🍲' },
                { name: 'Chilled Soft Drink & Hot Gala', price: 600, energy: 15, icon: '🥤' },
              ].map((food, fIdx) => (
                <div
                  key={fIdx}
                  className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{food.icon}</span>
                    <div>
                      <div className="font-bold text-[11px] text-slate-900">{food.name}</div>
                      <div className="text-[9px] text-emerald-600 font-semibold">+{food.energy}⚡ Energy</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConfirmBuyFood(food.name, food.price, food.energy)}
                    className="px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] shadow-2xs shrink-0 transition-colors"
                  >
                    ₦{food.price.toLocaleString()}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsBuyFoodModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MORE OPTIONS ACTION SHEET */}
      {isMoreOptionsOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl p-4 w-full shadow-2xl border-t border-slate-200 text-left animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-900">@{activePeer?.username}</h4>
                <p className="text-[10px] text-slate-400">
                  {activePeer?.displayName} · {activePeer?.department || 'Student'}
                </p>
              </div>
              <button
                onClick={() => setIsMoreOptionsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 py-2">
              <button
                onClick={() => {
                  setIsMoreOptionsOpen(false);
                  addToast(`👤 Student ${activePeer?.displayName} (${activePeer?.matricNo})`, 'info');
                }}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>👤</span>
                <span>View Student Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsMoreOptionsOpen(false);
                  if (activePeer) {
                    const storageKey = `lu_dm_history_${[stats.matricNo || '', activePeer.matricNo].sort().join('__')}`;
                    localStorage.removeItem(storageKey);
                    addToast('🧹 Chat history cleared for this conversation', 'success');
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left text-xs font-medium text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>🧹</span>
                <span>Clear Conversation History</span>
              </button>

              <button
                onClick={() => {
                  setIsMoreOptionsOpen(false);
                  addToast('🚨 Report submitted to Landmark University Student Affairs', 'warning');
                }}
                className="w-full px-3 py-2.5 rounded-xl hover:bg-red-50 text-left text-xs font-medium text-red-600 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>🚨</span>
                <span>Report to Student Affairs</span>
              </button>
            </div>

            <button
              onClick={() => setIsMoreOptionsOpen(false)}
              className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 5. WHAT COUNTS TOWARDS STREAKS MODAL */}
      {isStreakModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs shadow-2xl border border-slate-200 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <span className="text-base">🔥</span>
                <span>Campus Streaks: What counts?</span>
              </div>
              <button
                onClick={() => setIsStreakModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Both of you must do at least one activity together on the same day, every day to keep the flame alive:
            </p>

            <div className="space-y-2 mt-3 text-xs text-slate-700">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                <span>💬</span>
                <span>Send direct messages back and forth</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                <span>🏠</span>
                <span>Invite over or visit hostel rooms</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                <span>💸</span>
                <span>Send Kuda transfers or order campus chow</span>
              </div>
            </div>

            <button
              onClick={() => setIsStreakModalOpen(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
