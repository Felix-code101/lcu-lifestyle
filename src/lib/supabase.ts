import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { RegisteredStudent, SocioeconomicStatus } from '../types/game';

// Environment variables for Supabase (optional: works seamlessly in offline/fallback mode if absent)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://avnsouavfrhwjcgzjmiv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bnNvdWF2ZnJod2pjZ3pqbWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMDU2MDIsImV4cCI6MjEwNjg4MTYwMn0.sQI8wbBOf690MsrvoAzbvQWDVbXE9rdfmeO8mEZAejE';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Multi-Tab & Local Network Synchronization Channel
const BROADCAST_CHANNEL_NAME = 'lu_campus_multiplayer';
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported in this environment', e);
  }
}

export interface MultiplayerMessage {
  type: 'PRESENCE' | 'MOVE' | 'UPDATE_PROFILE' | 'ADMIN_STATUS_CHANGE' | 'CAMPUS_ANNOUNCEMENT' | 'LEAVE';
  payload: any;
  senderId: string;
  timestamp: number;
}

// Initial Simulated Students in the Campus Registry
export const DEFAULT_CAMPUS_STUDENTS: RegisteredStudent[] = [
  {
    id: 'student_femi_01',
    username: 'Femi Adeleke',
    matricNo: 'LU/24/0982',
    department: 'Software Engineering',
    level: '100 Level (Fresher)',
    status: 'lapo',
    balance: 14500,
    cgpa: 4.62,
    createdAt: '2024-10-01T08:00:00.000Z',
    lastActive: new Date().toISOString(),
    isOnline: true,
  },
  {
    id: 'student_chioma_02',
    username: 'Chioma Okafor',
    matricNo: 'LU/24/1104',
    department: 'Private & Property Law',
    level: '100 Level (Fresher)',
    status: 'nepo',
    balance: 285000,
    cgpa: 4.88,
    createdAt: '2024-10-01T09:30:00.000Z',
    lastActive: new Date().toISOString(),
    isOnline: true,
  },
  {
    id: 'student_tolu_03',
    username: 'Tolu Davies',
    matricNo: 'LU/24/0521',
    department: 'Mass Communication',
    level: '100 Level (Fresher)',
    status: 'lapo',
    balance: 18200,
    cgpa: 3.75,
    createdAt: '2024-10-02T11:15:00.000Z',
    lastActive: new Date().toISOString(),
    isOnline: false,
  },
  {
    id: 'student_amina_04',
    username: 'Amina Bello',
    matricNo: 'LU/24/0744',
    department: 'Nursing Science',
    level: '100 Level (Fresher)',
    status: 'lapo',
    balance: 22000,
    cgpa: 4.41,
    createdAt: '2024-10-02T14:20:00.000Z',
    lastActive: new Date().toISOString(),
    isOnline: true,
  },
  {
    id: 'student_kene_05',
    username: 'Kenechukwu Dan-Jumbo',
    matricNo: 'LU/24/0019',
    department: 'Business Administration',
    level: '100 Level (Fresher)',
    status: 'nepo',
    balance: 310000,
    cgpa: 3.45,
    createdAt: '2024-10-03T10:00:00.000Z',
    lastActive: new Date().toISOString(),
    isOnline: false,
  },
];

const LOCAL_STORAGE_STUDENTS_KEY = 'lu_registered_students_db';

export interface StudentRegistrationData {
  matricNo?: string;
  matric_no?: string;
  fullName?: string;
  name?: string;
  department?: string;
  level?: string;
  status?: string;
  cash?: number;
  classesAttended?: number;
  classes_attended?: number;
}

// Explicit Supabase registration function matching schema requirements
export const registerStudentToDatabase = async (playerData: StudentRegistrationData) => {
  if (!supabase) {
    console.warn('Supabase not configured, student saved locally');
    return null;
  }

  try {
    const payload = {
      matric_no: playerData.matricNo || playerData.matric_no,
      full_name: playerData.fullName || playerData.name,
      department: playerData.department || 'Computer Science',
      level: playerData.level || '100 Level (Fresher)',
      status: playerData.status || 'Fresher',
      cash: playerData.cash ?? 20000,
      classes_attended: playerData.classesAttended ?? playerData.classes_attended ?? 0,
      is_online: true,
      last_seen: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('students')
      .upsert(payload, { onConflict: 'matric_no' })
      .select();

    if (error) {
      console.error('Supabase registration failed:', error);
      return null;
    } else {
      console.log('Student record saved successfully to Supabase:', data);
      return data;
    }
  } catch (err) {
    console.error('Unexpected error saving student:', err);
    return null;
  }
};

// Get all registered students from Supabase (students table) or localStorage fallback
export async function getRegisteredStudents(): Promise<RegisteredStudent[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id || `student_${row.matric_no?.replace(/\//g, '_')}`,
          username: row.full_name || 'Student',
          matricNo: row.matric_no,
          department: row.department || 'Computer Science',
          level: row.level || '100 Level (Fresher)',
          status: (row.status?.toLowerCase().includes('nepo') ? 'nepo' : 'lapo') as SocioeconomicStatus,
          balance: row.cash ?? 20000,
          cgpa: row.cgpa ?? null,
          createdAt: row.created_at || new Date().toISOString(),
          lastActive: row.last_seen || new Date().toISOString(),
          isOnline: row.is_online ?? true,
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch students from Supabase, falling back to local database', e);
    }
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STUDENTS_KEY) || localStorage.getItem('lcu_registered_students_db');
    if (raw) {
      const parsed = JSON.parse(raw) as RegisteredStudent[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading students from localStorage', e);
  }

  // Seed default students if empty
  try {
    localStorage.setItem(LOCAL_STORAGE_STUDENTS_KEY, JSON.stringify(DEFAULT_CAMPUS_STUDENTS));
  } catch {
    // ignore
  }
  return DEFAULT_CAMPUS_STUDENTS;
}

// Save or update a registered student
export async function saveRegisteredStudent(student: RegisteredStudent): Promise<void> {
  // Update local storage first
  try {
    const current = await getRegisteredStudents();
    const existingIndex = current.findIndex((s) => s.id === student.id || s.matricNo === student.matricNo || s.username.toLowerCase() === student.username.toLowerCase());
    let updated: RegisteredStudent[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...student };
    } else {
      updated = [student, ...current];
    }
    localStorage.setItem(LOCAL_STORAGE_STUDENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating student in localStorage', e);
  }

  // Persist to Supabase students table
  await registerStudentToDatabase({
    matricNo: student.matricNo,
    fullName: student.username,
    department: student.department,
    level: student.level,
    status: student.status === 'nepo' ? 'Nepo Baby' : (student.status === 'lapo' ? 'Lapo Hustler' : student.status),
    cash: student.balance,
    classesAttended: 0,
  });
}

// Update student socioeconomic status (Admin function)
export async function updateStudentSocioeconomicStatus(
  studentId: string,
  newStatus: SocioeconomicStatus,
  newBalance?: number
): Promise<void> {
  try {
    const current = await getRegisteredStudents();
    const updated = current.map((s) => {
      if (s.id === studentId || s.matricNo === studentId) {
        return {
          ...s,
          status: newStatus,
          balance: newBalance !== undefined ? newBalance : (newStatus === 'nepo' ? Math.max(s.balance, 250000) : s.balance),
          lastActive: new Date().toISOString(),
        };
      }
      return s;
    });
    localStorage.setItem(LOCAL_STORAGE_STUDENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error updating status in localStorage', e);
  }

  if (supabase) {
    try {
      const updatePayload: Record<string, any> = {
        status: newStatus === 'nepo' ? 'Nepo Baby' : 'Lapo Hustler',
      };
      if (newBalance !== undefined) updatePayload.cash = newBalance;
      await supabase
        .from('students')
        .update(updatePayload)
        .or(`id.eq.${studentId},matric_no.eq.${studentId}`);
    } catch (e) {
      console.warn('Failed to update student status in Supabase', e);
    }
  }

  // Broadcast change across tabs / peers
  broadcastMessage({
    type: 'ADMIN_STATUS_CHANGE',
    senderId: 'admin_console',
    payload: { studentId, newStatus, newBalance },
    timestamp: Date.now(),
  });
}

// Broadcast message helper
export function broadcastMessage(msg: MultiplayerMessage): void {
  // 1. BroadcastChannel (for instant multi-tab testing)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(msg);
    } catch (e) {
      console.error('Failed to post message to BroadcastChannel', e);
    }
  }

  // 2. Supabase Realtime Channel
  if (supabase) {
    try {
      const channel = supabase.channel('lu_campus_multiplayer');
      channel.send({
        type: 'broadcast',
        event: msg.type,
        payload: msg,
      });
    } catch (e) {
      console.warn('Failed to broadcast via Supabase Realtime', e);
    }
  }
}

// Subscribe to multiplayer messages
export function subscribeToMultiplayer(
  onMessage: (msg: MultiplayerMessage) => void
): () => void {
  const channelListener = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object' && event.data.type) {
      onMessage(event.data as MultiplayerMessage);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', channelListener);
  }

  let supabaseChannel: any = null;
  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel('lu_campus_multiplayer')
        .on('broadcast', { event: '*' }, (payload: any) => {
          if (payload && payload.payload) {
            onMessage(payload.payload as MultiplayerMessage);
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Error connecting to Supabase Realtime channel', e);
    }
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', channelListener);
    }
    if (supabase && supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}
