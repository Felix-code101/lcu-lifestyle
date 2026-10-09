import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useGame } from '../context/GameContext';

export interface DirectMessageMetadata {
  type?: 'text' | 'money_transfer' | 'money_request' | 'food_gift' | 'invite_hostel';
  amount?: number;
  foodName?: string;
  location?: string;
  status?: 'pending' | 'accepted' | 'completed';
}

export interface DirectMessage {
  id: string;
  sender_matric: string;
  recipient_matric: string;
  sender_name?: string;
  content: string;
  metadata?: DirectMessageMetadata;
  created_at: string;
  sender_id?: string;
  recipient_id?: string;
  action_type?: string;
  amount?: number;
}

const LOCAL_STORAGE_PREFIX = 'lu_dm_history_';
const BROADCAST_CHANNEL_NAME = 'lu_direct_messages';

// Helper to create an order-independent unique conversation pair key
export const getConversationKey = (matricA: string, matricB: string): string => {
  return [matricA.trim().toLowerCase(), matricB.trim().toLowerCase()].sort().join('__');
};

interface UseDirectMessagesOptions {
  targetMatric: string;
  targetUsername?: string;
  activeChatUser?: { matric_no?: string; username?: string };
}

export function useDirectMessages({
  targetMatric,
  targetUsername: _targetUsername,
  activeChatUser: customActiveChatUser,
}: UseDirectMessagesOptions) {
  const { stats } = useGame();

  const currentUser = useMemo(
    () => ({
      matric_no: stats.matricNo || 'LU/24/0001',
      username: stats.username || 'Student',
    }),
    [stats.matricNo, stats.username]
  );

  const activeChatUser = useMemo(
    () =>
      customActiveChatUser || {
        matric_no: targetMatric,
        username: _targetUsername,
      },
    [customActiveChatUser, targetMatric, _targetUsername]
  );

  const myMatric = currentUser.matric_no;
  const myName = currentUser.username;
  const targetMatricClean = activeChatUser?.matric_no || '';

  const conversationKey = getConversationKey(myMatric, targetMatricClean);
  const storageKey = `${LOCAL_STORAGE_PREFIX}${conversationKey}`;

  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Synchronize localStorage
  const persistMessages = useCallback(
    (msgs: DirectMessage[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(msgs.slice(-100)));
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  // 1. Initial message load / fetchConversation
  const fetchConversation = useCallback(async () => {
    if (!targetMatricClean || !myMatric || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_matric.eq.${myMatric},recipient_matric.eq.${targetMatricClean}),and(sender_matric.eq.${targetMatricClean},recipient_matric.eq.${myMatric})`
        )
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data) {
        const mapped: DirectMessage[] = data.map((row: any) => ({
          id: row.id,
          sender_matric: row.sender_matric || row.sender_id,
          sender_id: row.sender_id || row.sender_matric,
          recipient_matric: row.recipient_matric || row.recipient_id,
          recipient_id: row.recipient_id || row.recipient_matric,
          sender_name: row.sender_name,
          content: row.content,
          metadata: {
            type: row.action_type || 'text',
            amount: row.amount || 0,
          },
          action_type: row.action_type,
          amount: row.amount,
          created_at: row.created_at,
        }));
        setMessages(mapped);
        persistMessages(mapped);
      }
    } catch (err) {
      console.warn('Failed to query direct_messages from Supabase, using local state', err);
    } finally {
      setIsLoading(false);
    }
  }, [myMatric, targetMatricClean, persistMessages]);

  // Multi-tab BroadcastChannel listener for DMs
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_DM' && event.data.payload) {
            const newMsg = event.data.payload as DirectMessage;
            const msgSender = (newMsg.sender_matric || newMsg.sender_id || '').toLowerCase();
            const msgRecipient = (newMsg.recipient_matric || newMsg.recipient_id || '').toLowerCase();
            const currentM = myMatric.toLowerCase();
            const targetM = targetMatricClean.toLowerCase();

            const msgMatchesPair =
              (msgSender === currentM && msgRecipient === targetM) ||
              (msgSender === targetM && msgRecipient === currentM);

            if (msgMatchesPair) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                const next = [...prev, newMsg];
                persistMessages(next);
                return next;
              });
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel error for direct messages', err);
      }
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, [myMatric, targetMatricClean, persistMessages]);

  // 2. Realtime listener for incoming messages on this conversation
  useEffect(() => {
    const activeMatric = activeChatUser?.matric_no;
    const currentMatric = currentUser?.matric_no;
    if (!activeMatric || !currentMatric || !supabase) return;

    // 1. Initial message load
    fetchConversation();

    // 2. Realtime listener for incoming messages
    const channel = supabase
      .channel(`dm-${currentMatric}-${activeMatric}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (!newMsg) return;

          const sender = (newMsg.sender_id || newMsg.sender_matric || '').trim().toLowerCase();
          const recipient = (newMsg.recipient_id || newMsg.recipient_matric || '').trim().toLowerCase();
          const activeClean = activeMatric.trim().toLowerCase();
          const currentClean = currentMatric.trim().toLowerCase();

          // Verify message belongs to this conversation
          const isCurrentConvo =
            (sender === activeClean && recipient === currentClean) ||
            (sender === currentClean && recipient === activeClean);

          if (isCurrentConvo) {
            const formattedMsg: DirectMessage = {
              id: newMsg.id,
              sender_matric: newMsg.sender_matric || newMsg.sender_id,
              sender_id: newMsg.sender_id || newMsg.sender_matric,
              recipient_matric: newMsg.recipient_matric || newMsg.recipient_id,
              recipient_id: newMsg.recipient_id || newMsg.recipient_matric,
              sender_name: newMsg.sender_name,
              content: newMsg.content,
              metadata: newMsg.metadata || {
                type: newMsg.action_type || 'text',
                amount: newMsg.amount || 0,
              },
              action_type: newMsg.action_type,
              amount: newMsg.amount,
              created_at: newMsg.created_at || new Date().toISOString(),
            };

            setMessages((prev) => {
              if (prev.some((m) => m.id === formattedMsg.id)) return prev;

              // Reconcile optimistic message sent from this tab
              const optimisticIdx = prev.findIndex(
                (m) =>
                  m.id.startsWith('dm_') &&
                  (m.sender_matric.toLowerCase() === formattedMsg.sender_matric.toLowerCase() ||
                    (m.sender_id && m.sender_id.toLowerCase() === formattedMsg.sender_matric.toLowerCase())) &&
                  m.content === formattedMsg.content
              );

              let next: DirectMessage[];
              if (optimisticIdx >= 0) {
                next = [...prev];
                next[optimisticIdx] = formattedMsg;
              } else {
                next = [...prev, formattedMsg];
              }

              persistMessages(next);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [activeChatUser?.matric_no, currentUser?.matric_no, fetchConversation, persistMessages]);

  // Send a direct message
  const sendMessage = useCallback(
    async (content: string, metadata?: DirectMessageMetadata): Promise<boolean> => {
      const trimmed = content.trim();
      if (!trimmed && !metadata) return false;

      const localMsg: DirectMessage = {
        id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sender_matric: myMatric,
        sender_id: myMatric,
        recipient_matric: targetMatricClean,
        recipient_id: targetMatricClean,
        sender_name: myName,
        content: trimmed,
        metadata,
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
        type: 'NEW_DM',
        payload: localMsg,
      });

      // 3. Persist to Supabase if available
      if (supabase) {
        try {
          const payload = {
            sender_matric: localMsg.sender_matric,
            recipient_matric: localMsg.recipient_matric,
            sender_name: localMsg.sender_name || 'Student',
            content: localMsg.content,
            action_type: localMsg.metadata?.type || 'chat',
            amount: localMsg.metadata?.amount || 0,
          };

          const { data, error } = await supabase
            .from('direct_messages')
            .insert(payload)
            .select()
            .single();

          if (error) {
            console.error('Supabase direct message failed:', error);
          } else if (data) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === localMsg.id
                  ? {
                      ...localMsg,
                      id: (data as any).id,
                      created_at: (data as any).created_at || localMsg.created_at,
                    }
                  : m
              )
            );
          }
        } catch (dbErr) {
          console.error('Unexpected error saving direct message:', dbErr);
        }
      }

      return true;
    },
    [myMatric, targetMatricClean, myName, persistMessages]
  );

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage,
    fetchConversation,
    myMatric,
    myName,
    currentUser,
    activeChatUser,
  };
}
