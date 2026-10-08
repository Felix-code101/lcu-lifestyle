import { useEffect, useRef, useState, useCallback } from 'react';
import type { RemotePlayer, RegisteredStudent, SocioeconomicStatus, GameLocation, CharacterCustomization } from '../types/game';
import {
  broadcastMessage,
  subscribeToMultiplayer,
  getRegisteredStudents,
  updateStudentSocioeconomicStatus,
  type MultiplayerMessage,
} from '../lib/supabase';

interface UseMultiplayerOptions {
  localId: string;
  username: string;
  matricNo: string;
  department: string;
  academicLevel: string;
  status: SocioeconomicStatus;
  currentLocation: GameLocation;
  customization: CharacterCustomization;
  isRegistered: boolean;
  onStatusChangeByAdmin?: (newStatus: SocioeconomicStatus, newBalance?: number) => void;
  onCampusAnnouncement?: (message: string, sender: string) => void;
}

export function useMultiplayer({
  localId,
  username,
  matricNo,
  department,
  academicLevel,
  status,
  currentLocation,
  customization,
  isRegistered,
  onStatusChangeByAdmin,
  onCampusAnnouncement,
}: UseMultiplayerOptions) {
  const [remotePlayersMap, setRemotePlayersMap] = useState<Map<string, RemotePlayer>>(new Map());
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>([]);
  const [activeCampusAnnouncement, setActiveCampusAnnouncement] = useState<{ message: string; sender: string } | null>(null);

  // Position and movement state of local player
  const localPosRef = useRef<[number, number, number]>([0, 0, 0]);
  const localRotRef = useRef<number>(0);
  const localWalkingRef = useRef<boolean>(false);
  const lastBroadcastTimeRef = useRef<number>(0);

  // Load registered students list
  const refreshStudentsList = useCallback(async () => {
    try {
      const list = await getRegisteredStudents();
      setRegisteredStudents(list);
    } catch (e) {
      console.error('Failed to load registered students list', e);
    }
  }, []);

  useEffect(() => {
    refreshStudentsList();
  }, [refreshStudentsList]);

  // Broadcast presence
  const broadcastPresence = useCallback(() => {
    if (!isRegistered || !username) return;

    broadcastMessage({
      type: 'PRESENCE',
      senderId: localId,
      payload: {
        id: localId,
        username,
        matricNo,
        department,
        level: academicLevel,
        status,
        location: currentLocation,
        position: localPosRef.current,
        rotation: localRotRef.current,
        isWalking: localWalkingRef.current,
        customization,
        lastSeen: Date.now(),
      } as RemotePlayer,
      timestamp: Date.now(),
    });
  }, [isRegistered, username, localId, matricNo, department, academicLevel, status, currentLocation, customization]);

  // Broadcast movement (throttled to ~100ms)
  const broadcastMove = useCallback(
    (position: [number, number, number], rotation: number, isWalking: boolean) => {
      localPosRef.current = position;
      localRotRef.current = rotation;
      localWalkingRef.current = isWalking;

      if (!isRegistered || !username) return;

      const now = Date.now();
      if (now - lastBroadcastTimeRef.current >= 90) {
        lastBroadcastTimeRef.current = now;
        broadcastMessage({
          type: 'MOVE',
          senderId: localId,
          payload: {
            id: localId,
            location: currentLocation,
            position,
            rotation,
            isWalking,
            customization,
            lastSeen: now,
          },
          timestamp: now,
        });
      }
    },
    [isRegistered, username, localId, currentLocation, customization]
  );

  // Handle incoming multiplayer messages
  useEffect(() => {
    const unsubscribe = subscribeToMultiplayer((msg: MultiplayerMessage) => {
      // Ignore self-echo
      if (msg.senderId === localId && msg.type !== 'ADMIN_STATUS_CHANGE') return;

      switch (msg.type) {
        case 'PRESENCE':
        case 'MOVE': {
          const remotePlayer = msg.payload as Partial<RemotePlayer>;
          if (!remotePlayer.id || remotePlayer.id === localId) return;

          setRemotePlayersMap((prev) => {
            const next = new Map(prev);
            const existing = next.get(remotePlayer.id!);
            next.set(remotePlayer.id!, {
              id: remotePlayer.id!,
              username: remotePlayer.username || existing?.username || 'Peer Student',
              matricNo: remotePlayer.matricNo || existing?.matricNo || 'LU/24/0000',
              department: remotePlayer.department || existing?.department || 'General Studies',
              level: remotePlayer.level || existing?.level || '100 Level (Fresher)',
              status: (remotePlayer.status || existing?.status || 'lapo') as SocioeconomicStatus,
              location: remotePlayer.location || existing?.location || 'home_hostel',
              position: remotePlayer.position || existing?.position || [0, 0, 0],
              rotation: remotePlayer.rotation ?? existing?.rotation ?? 0,
              isWalking: remotePlayer.isWalking ?? existing?.isWalking ?? false,
              customization: remotePlayer.customization || existing?.customization || customization,
              lastSeen: Date.now(),
            });
            return next;
          });
          break;
        }

        case 'LEAVE': {
          const playerId = msg.payload?.id || msg.senderId;
          setRemotePlayersMap((prev) => {
            const next = new Map(prev);
            next.delete(playerId);
            return next;
          });
          break;
        }

        case 'ADMIN_STATUS_CHANGE': {
          const { studentId, matricNo: payloadMatric, newStatus, newBalance } = msg.payload || {};
          const isTarget =
            studentId === localId ||
            (payloadMatric && matricNo && payloadMatric.toLowerCase() === matricNo.toLowerCase()) ||
            (studentId && matricNo && studentId.toLowerCase() === matricNo.toLowerCase()) ||
            (localId && studentId && (localId.includes(studentId.replace(/\//g, '_')) || studentId.includes(localId)));

          if (isTarget && onStatusChangeByAdmin) {
            onStatusChangeByAdmin(newStatus, newBalance);
          }
          // Refresh student list and remote player map
          refreshStudentsList();
          setRemotePlayersMap((prev) => {
            if (!prev.has(studentId)) return prev;
            const next = new Map(prev);
            const p = next.get(studentId)!;
            next.set(studentId, { ...p, status: newStatus });
            return next;
          });
          break;
        }

        case 'CAMPUS_ANNOUNCEMENT': {
          const { message, sender } = msg.payload;
          setActiveCampusAnnouncement({ message, sender });
          if (onCampusAnnouncement) {
            onCampusAnnouncement(message, sender);
          }
          break;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [localId, customization, onStatusChangeByAdmin, onCampusAnnouncement, refreshStudentsList]);

  // Periodic heartbeat presence broadcast (every 4 seconds)
  useEffect(() => {
    if (!isRegistered) return;
    broadcastPresence();

    const interval = setInterval(() => {
      broadcastPresence();
    }, 4000);

    return () => {
      clearInterval(interval);
      // Broadcast leave on unmount
      broadcastMessage({
        type: 'LEAVE',
        senderId: localId,
        payload: { id: localId },
        timestamp: Date.now(),
      });
    };
  }, [broadcastPresence, isRegistered, localId]);

  // Prune disconnected/stale players older than 14 seconds
  useEffect(() => {
    const pruneInterval = setInterval(() => {
      const now = Date.now();
      setRemotePlayersMap((prev) => {
        let hasStale = false;
        prev.forEach((player) => {
          if (now - player.lastSeen > 14000) {
            hasStale = true;
          }
        });
        if (!hasStale) return prev;

        const next = new Map();
        prev.forEach((player, id) => {
          if (now - player.lastSeen <= 14000) {
            next.set(id, player);
          }
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(pruneInterval);
  }, []);

  // Filter remote players to those currently in the same location
  const remotePlayersInCurrentLocation = Array.from(remotePlayersMap.values()).filter(
    (p) => p.location === currentLocation
  );

  // Admin action: change status of any student
  const changeStudentStatus = useCallback(
    async (studentId: string, newStatus: SocioeconomicStatus, newBalance?: number) => {
      await updateStudentSocioeconomicStatus(studentId, newStatus, newBalance);
      await refreshStudentsList();
    },
    [refreshStudentsList]
  );

  // Admin action: send campus broadcast
  const sendAnnouncement = useCallback((message: string, sender: string = 'Office of the Vice Chancellor') => {
    broadcastMessage({
      type: 'CAMPUS_ANNOUNCEMENT',
      senderId: 'admin',
      payload: { message, sender },
      timestamp: Date.now(),
    });
    setActiveCampusAnnouncement({ message, sender });
  }, []);

  return {
    remotePlayers: remotePlayersInCurrentLocation,
    allOnlinePlayers: Array.from(remotePlayersMap.values()),
    registeredStudents,
    refreshStudentsList,
    changeStudentStatus,
    broadcastMove,
    broadcastPresence,
    sendAnnouncement,
    activeCampusAnnouncement,
    clearAnnouncement: () => setActiveCampusAnnouncement(null),
  };
}
