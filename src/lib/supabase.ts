import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { RegisteredStudent, SocioeconomicStatus, CharacterCustomization, CharacterGender } from '../types/game';

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
  username?: string;
  password?: string;
  pin?: string;
  email?: string;
  gender?: string;
  faculty?: string;
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

  const cleanPass = (playerData.password || playerData.pin)?.trim();
  const matricNo = playerData.matricNo || playerData.matric_no;
  const fullName = playerData.fullName || playerData.name || playerData.username || 'Student';

  const basePayload: Record<string, any> = {
    matric_no: matricNo,
    full_name: fullName,
    department: playerData.department || 'Computer Science',
    level: playerData.level || '100 Level (Fresher)',
    status: playerData.status || 'Fresher',
    cash: playerData.cash ?? 20000,
    classes_attended: playerData.classesAttended ?? playerData.classes_attended ?? 0,
    is_online: true,
    last_seen: new Date().toISOString(),
  };

  try {
    // 1. If password provided, attempt upserting with password / pin (if schema has either column)
    if (cleanPass) {
      try {
        const payloadWithPass = {
          ...basePayload,
          password: cleanPass,
          pin: cleanPass,
        };
        const { data, error } = await supabase
          .from('students')
          .upsert(payloadWithPass, { onConflict: 'matric_no' })
          .select();

        if (!error && data) {
          console.log('Student record with password/pin saved successfully to Supabase:', data);
          return data;
        }
      } catch {
        // Fall back
      }

      try {
        const payloadJustPass = {
          ...basePayload,
          password: cleanPass,
        };
        const { data, error } = await supabase
          .from('students')
          .upsert(payloadJustPass, { onConflict: 'matric_no' })
          .select();

        if (!error && data) {
          console.log('Student record with password saved successfully to Supabase:', data);
          return data;
        }
      } catch {
        // Fall back
      }
    }

    // 2. Standard upsert with verified columns
    const { data, error } = await supabase
      .from('students')
      .upsert(basePayload, { onConflict: 'matric_no' })
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
  let targetMatric = studentId;
  let targetUuid = studentId;

  try {
    const current = await getRegisteredStudents();
    const matched = current.find((s) => s.id === studentId || s.matricNo === studentId);
    if (matched) {
      targetMatric = matched.matricNo;
      targetUuid = matched.id;
    }

    const updated = current.map((s) => {
      if (s.id === studentId || s.matricNo === studentId || s.matricNo === targetMatric) {
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

      // Update in Supabase by UUID if valid UUID, or by matric_no
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUuid);
      let res;
      if (isUuid) {
        res = await supabase.from('students').update(updatePayload).eq('id', targetUuid);
      } else {
        res = await supabase.from('students').update(updatePayload).eq('matric_no', targetMatric);
      }

      if (res.error) {
        console.warn('Supabase update failed, retrying with matric_no:', res.error);
        await supabase.from('students').update(updatePayload).eq('matric_no', targetMatric);
      }
    } catch (e) {
      console.warn('Failed to update student status in Supabase', e);
    }
  }

  // Broadcast change across tabs / peers
  broadcastMessage({
    type: 'ADMIN_STATUS_CHANGE',
    senderId: 'admin_console',
    payload: { studentId: targetMatric, matricNo: targetMatric, newStatus, newBalance },
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

// ============================================================================
// STUDENT AUTHENTICATION & CREDENTIALS STORAGE
// ============================================================================
export interface StudentAccount {
  username: string;
  matricNo: string;
  password: string;
  email?: string;
  gender: CharacterGender;
  department: string;
  faculty: string;
  level: string;
  status: SocioeconomicStatus;
  balance: number;
  customization?: CharacterCustomization;
  createdAt: string;
}

const LOCAL_STORAGE_ACCOUNTS_KEY = 'lu_student_accounts_db';

// Retrieve all student accounts
export async function getStudentAccounts(): Promise<StudentAccount[]> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading student accounts:', e);
  }
  return [];
}

// Save or update student account
export async function saveStudentAccount(account: StudentAccount): Promise<void> {
  try {
    const existing = await getStudentAccounts();
    const index = existing.findIndex(
      (a) =>
        a.username.toLowerCase() === account.username.toLowerCase() ||
        a.matricNo.toLowerCase() === account.matricNo.toLowerCase() ||
        (account.email && a.email && a.email.toLowerCase() === account.email.toLowerCase())
    );

    let updated: StudentAccount[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...updated[index], ...account };
    } else {
      updated = [account, ...existing];
    }

    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving student account:', e);
  }
}

// Authenticate student by username, matricNo, or optional email
export async function authenticateStudent(
  identifier: string,
  password: string
): Promise<StudentAccount | null> {
  const trimmedId = identifier.trim();
  const cleanPass = password.trim();

  if (!trimmedId || !cleanPass) return null;

  // 1. Check local student accounts registry first (fastest, supports offline & custom avatar recovery)
  const localAccounts = await getStudentAccounts();
  const localMatch = localAccounts.find((a) => {
    const matchUser = a.username.trim().toLowerCase() === trimmedId.toLowerCase();
    const matchMatric = a.matricNo.trim().toLowerCase() === trimmedId.toLowerCase();
    const matchEmail = a.email ? a.email.trim().toLowerCase() === trimmedId.toLowerCase() : false;
    return (matchUser || matchMatric || matchEmail) && a.password.trim() === cleanPass;
  });

  if (localMatch) {
    return localMatch;
  }

  // 2. Query Supabase backend students table with case-insensitive search
  if (supabase) {
    try {
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .or(`matric_no.ilike.${trimmedId},full_name.ilike.${trimmedId}`)
        .maybeSingle();

      if (!error && student) {
        // Compare password: check student row password/pin, or check matching local account password
        const dbPassword = (student as any).password || (student as any).pin;
        let passwordMatches = false;

        if (dbPassword) {
          passwordMatches = String(dbPassword).trim() === cleanPass;
        } else {
          // If students table row does not contain password column, check local accounts by matric
          const matchedLocal = localAccounts.find(
            (a) =>
              a.matricNo.trim().toLowerCase() === student.matric_no?.trim().toLowerCase() ||
              a.username.trim().toLowerCase() === student.full_name?.trim().toLowerCase()
          );
          if (matchedLocal) {
            passwordMatches = matchedLocal.password.trim() === cleanPass;
          } else {
            // For students without an explicit password column, accept cleanPass
            passwordMatches = true;
          }
        }

        if (passwordMatches) {
          const accountFromDb: StudentAccount = {
            username: student.full_name || trimmedId,
            matricNo: student.matric_no,
            password: cleanPass,
            gender: ((student as any).gender as CharacterGender) || 'male',
            department: student.department || 'Computer Science',
            faculty: (student as any).faculty || 'Liids University',
            level: student.level || '100 Level (Fresher)',
            status: (student.status?.toLowerCase().includes('nepo') ? 'nepo' : 'lapo') as SocioeconomicStatus,
            balance: student.cash ?? 20000,
            createdAt: student.created_at || new Date().toISOString(),
          };

          // Cache in local accounts for offline resilience
          await saveStudentAccount(accountFromDb);
          return accountFromDb;
        }
      }
    } catch (e) {
      console.warn('Supabase authentication lookup failed:', e);
    }
  }

  return null;
}

// Check if username or email already exists in registry
export async function checkStudentAccountExists(
  username: string,
  email?: string
): Promise<{ usernameExists: boolean; emailExists: boolean }> {
  const accounts = await getStudentAccounts();
  const cleanUser = username.trim().toLowerCase();
  const cleanEmail = email ? email.trim().toLowerCase() : '';

  const usernameExists = accounts.some((a) => a.username.toLowerCase() === cleanUser);
  const emailExists = Boolean(
    cleanEmail && accounts.some((a) => a.email && a.email.toLowerCase() === cleanEmail)
  );

  return { usernameExists, emailExists };
}

