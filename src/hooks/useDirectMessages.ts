import { useState, useEffect, useCallback, useRef } from 'react';
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
}

const LOCAL_STORAGE_PREFIX = 'lu_dm_history_';
const BROADCAST_CHANNEL_NAME = 'lu_direct_messages';

// Helper to create an order-independent unique conversation pair key
export const getConversationKey = (matricA: string, matricB: string): string => {
  return [matricA, matricB].sort().join('__');
};

interface UseDirectMessagesOptions {
  targetMatric: string;
  targetUsername?: string;
}

export function useDirectMessages({ targetMatric, targetUsername: _targetUsername }: UseDirectMessagesOptions) {
  const { stats } = useGame();
  const myMatric = stats.matricNo || 'LU/24/0001';
  const myName = stats.username || 'Student';

  const conversationKey = getConversationKey(myMatric, targetMatric);
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

  // Multi-tab BroadcastChannel listener for DMs
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_DM' && event.data.payload) {
            const newMsg = event.data.payload as DirectMessage;
            const msgMatchesPair =
              (newMsg.sender_matric === myMatric && newMsg.recipient_matric === targetMatric) ||
              (newMsg.sender_matric === targetMatric && newMsg.recipient_matric === myMatric);

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
  }, [myMatric, targetMatric, persistMessages]);

  // Supabase Real-Time Integration for Direct Messages
  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    const initSupabaseDM = async () => {
      if (!targetMatric || !myMatric) {
        setIsLoading(false);
        return;
      }

      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Fetch prior messages where:
        // ((sender_matric = myMatric AND recipient_matric = targetMatric) OR (sender_matric = targetMatric AND recipient_matric = myMatric))
        const { data, error } = await supabase
          .from('direct_messages')
          .select('*')
          .or(
            `and(sender_matric.eq.${myMatric},recipient_matric.eq.${targetMatric}),and(sender_matric.eq.${targetMatric},recipient_matric.eq.${myMatric})`
          )
          .order('created_at', { ascending: true })
          .limit(50);

        if (!error && data && isMounted) {
          if (data.length > 0) {
            const mapped: DirectMessage[] = data.map((row: any) => ({
              id: row.id,
              sender_matric: row.sender_matric,
              recipient_matric: row.recipient_matric,
              sender_name: row.sender_name,
              content: row.content,
              metadata: {
                type: row.action_type || 'text',
                amount: row.amount || 0,
              },
              created_at: row.created_at,
            }));
            setMessages(mapped);
            persistMessages(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to query direct_messages from Supabase, using local state', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }

      // 2. Subscribe via Supabase Realtime
      try {
        const channelName = `dm:${[myMatric, targetMatric].sort().join(':')}`;
        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'direct_messages',
            },
            (payload) => {
              const row = payload.new as any;
              const msg: DirectMessage = {
                id: row.id,
                sender_matric: row.sender_matric,
                recipient_matric: row.recipient_matric,
                sender_name: row.sender_name,
                content: row.content,
                metadata: {
                  type: row.action_type || 'text',
                  amount: row.amount || 0,
                },
                created_at: row.created_at,
              };
              if (
                (msg.sender_matric === targetMatric && msg.recipient_matric === myMatric) ||
                (msg.sender_matric === myMatric && msg.recipient_matric === targetMatric)
              ) {
                if (isMounted) {
                  setMessages((prev) => {
                    if (prev.some((m) => m.id === msg.id)) return prev;
                    const next = [...prev, msg];
                    persistMessages(next);
                    return next;
                  });
                }
              }
            }
          )
          .subscribe();
      } catch (subErr) {
        console.warn('Realtime subscription error for direct_messages', subErr);
      }
    };

    initSupabaseDM();

    return () => {
      isMounted = false;
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [myMatric, targetMatric, persistMessages]);

  // Send a direct message
  const sendMessage = useCallback(
    async (content: string, metadata?: DirectMessageMetadata): Promise<boolean> => {
      const trimmed = content.trim();
      if (!trimmed && !metadata) return false;

      const localMsg: DirectMessage = {
        id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sender_matric: myMatric,
        recipient_matric: targetMatric,
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
            sender_name: localMsg.sender_name,
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
          } else {
            console.log('Direct message record saved successfully to Supabase:', data);
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
    [myMatric, targetMatric, myName, persistMessages]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    myMatric,
    myName,
  };
}
