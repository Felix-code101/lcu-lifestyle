import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useGame } from '../context/GameContext';

export interface CampusChatMessage {
  id: string;
  sender_matric: string;
  sender_name: string;
  sender_status: string; // 'Nepo Baby' | 'Lapo Hustler'
  content: string;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'lu_campus_messages';
const BROADCAST_CHANNEL_NAME = 'lu_campus_buzz';

// Initial realistic campus messages for when offline or starting fresh
const INITIAL_CAMPUS_MESSAGES: CampusChatMessage[] = [
  {
    id: 'seed_msg_1',
    sender_matric: 'LU/24/1104',
    sender_name: 'Chioma Okafor',
    sender_status: 'Nepo Baby',
    content: 'Who is coming for the party at Lions Hall tonight? Free cocktails on me! 🥂🎉',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'seed_msg_2',
    sender_matric: 'LU/24/0982',
    sender_name: 'Femi Adeleke',
    sender_status: 'Lapo Hustler',
    content: 'Guys, has anyone solved Question 3 in the Software Engineering assignment? 💻',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'seed_msg_3',
    sender_matric: 'LU/24/0412',
    sender_name: 'Tunde Bakare',
    sender_status: 'Lapo Hustler',
    content: 'Selling hot meat pies and fresh zobo at SUB walkway! Come and patronize your boy 🥟🔥',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'seed_msg_4',
    sender_matric: 'LU/24/0150',
    sender_name: 'Segun Oladipo',
    sender_status: 'Nepo Baby',
    content: 'Just parked near Senate building. Anyone going to Central Cafeteria for brunch? 🚗',
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
];

export function useCampusChat() {
  const { stats } = useGame();
  const [messages, setMessages] = useState<CampusChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_CAMPUS_MESSAGES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Synchronize localStorage
  const persistMessages = useCallback((msgs: CampusChatMessage[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(msgs.slice(-50)));
    } catch {
      // ignore
    }
  }, []);

  // Multi-tab BroadcastChannel listener
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_MESSAGE' && event.data.payload) {
            const newMsg = event.data.payload as CampusChatMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              const next = [...prev, newMsg];
              persistMessages(next);
              return next;
            });
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel error for campus chat', err);
      }
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, [persistMessages]);

  // Supabase Real-Time Integration
  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    const initSupabase = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Fetch 30 most recent messages ordered by created_at ASC
        const { data, error } = await supabase
          .from('campus_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (!error && data && data.length > 0 && isMounted) {
          const sorted = [...data].reverse();
          setMessages(sorted);
          persistMessages(sorted);
        }
      } catch (err) {
        console.warn('Failed to query campus_messages from Supabase, using local state', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }

      // 2. Subscribe to real-time changes
      try {
        channel = supabase
          .channel('public:campus_messages')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'campus_messages' },
            (payload) => {
              if (payload.new && isMounted) {
                const newMsg = payload.new as CampusChatMessage;
                setMessages((prev) => {
                  if (prev.some((m) => m.id === newMsg.id)) return prev;
                  const next = [...prev, newMsg];
                  persistMessages(next);
                  return next;
                });
              }
            }
          )
          .subscribe();
      } catch (subErr) {
        console.warn('Realtime subscription error for campus_messages', subErr);
      }
    };

    initSupabase();

    return () => {
      isMounted = false;
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [persistMessages]);

  // Send a message to Campus Buzz
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      const trimmed = content.trim();
      if (!trimmed) return false;

      const matric = stats.matricNo || 'LU/24/0001';
      const name = stats.username || 'Student';
      const statusText = stats.status === 'nepo' ? 'Nepo Baby' : 'Lapo Hustler';

      const localMsg: CampusChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sender_matric: matric,
        sender_name: name,
        sender_status: statusText,
        content: trimmed,
        created_at: new Date().toISOString(),
      };

      // 1. Immediately update local state & persist
      setMessages((prev) => {
        const next = [...prev, localMsg];
        persistMessages(next);
        return next;
      });

      // 2. Broadcast across tabs
      broadcastChannelRef.current?.postMessage({
        type: 'NEW_MESSAGE',
        payload: localMsg,
      });

      // 3. Persist to Supabase if configured
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('campus_messages')
            .insert({
              sender_matric: localMsg.sender_matric,
              sender_name: localMsg.sender_name,
              sender_status: localMsg.sender_status,
              content: localMsg.content,
            })
            .select()
            .single();

          if (!error && data) {
            // Replace temporary local ID with server record if needed
            setMessages((prev) =>
              prev.map((m) => (m.id === localMsg.id ? (data as CampusChatMessage) : m))
            );
          }
        } catch (dbErr) {
          console.warn('Supabase campus_messages insert failed, retained in local storage', dbErr);
        }
      }

      return true;
    },
    [stats.matricNo, stats.username, stats.status, persistMessages]
  );

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
