import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { DEFAULT_PLAYER_CUSTOMIZATION } from '../data/npcData';
import type { RegisteredStudent, SocioeconomicStatus } from '../types/game';
import {
  ShieldAlert,
  ShieldCheck,
  Crown,
  Backpack,
  Search,
  RefreshCw,
  Coins,
  Send,
  CheckCircle,
  Users,
  Radio,
  Sparkles,
  Scale,
  LogOut,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Building,
} from 'lucide-react';

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'LU_VC_2026!';
const SESSION_STORAGE_KEY = 'lu_admin_session';

export interface AdminDashboardProps {
  onLogout?: () => void;
  registeredStudents?: RegisteredStudent[];
  allOnlinePlayers?: any[];
  onUpdateStudentStatus?: (studentId: string, newStatus: SocioeconomicStatus, newBalance?: number) => void;
  onSendAnnouncement?: (message: string, sender?: string) => void;
  onRefresh?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  registeredStudents: propStudents,
  allOnlinePlayers: propOnlinePlayers,
  onUpdateStudentStatus: propUpdateStudentStatus,
  onSendAnnouncement: propSendAnnouncement,
  onRefresh: propRefresh,
}) => {
  const { stats, addToast, setStats, setSocioeconomicStatus } = useGame();

  // Authentication State Gate
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const savedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return Boolean(savedSession);
    } catch {
      return false;
    }
  });

  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Self-sufficient Multiplayer Hook for Standalone Route
  const standaloneMultiplayer = useMultiplayer({
    localId: 'admin_console_vc',
    username: "Vice Chancellor's Office",
    matricNo: 'LU/ADMIN/VC/01',
    department: 'University Administration',
    academicLevel: 'Vice Chancellor',
    status: 'nepo',
    currentLocation: 'campus_map',
    customization: DEFAULT_PLAYER_CUSTOMIZATION,
    isRegistered: false, // Prevents creating a student avatar on 3D campus
    onStatusChangeByAdmin: (newStatus, newBalance) => {
      setSocioeconomicStatus(newStatus, newBalance);
    },
    onCampusAnnouncement: (message, sender) => {
      addToast(`📢 ${sender}: "${message}"`, 'info');
    },
  });

  const registeredStudents = propStudents ?? standaloneMultiplayer.registeredStudents;
  const allOnlinePlayers = propOnlinePlayers ?? standaloneMultiplayer.allOnlinePlayers;
  const updateStudentStatusFn = propUpdateStudentStatus ?? standaloneMultiplayer.changeStudentStatus;
  const sendAnnouncementFn = propSendAnnouncement ?? standaloneMultiplayer.sendAnnouncement;
  const refreshStudentsFn = propRefresh ?? standaloneMultiplayer.refreshStudentsList;

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'nepo' | 'lapo'>('all');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSender, setAnnouncementSender] = useState('Office of the Vice Chancellor');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return registeredStudents.filter((student) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        student.username.toLowerCase().includes(term) ||
        student.matricNo.toLowerCase().includes(term) ||
        student.department.toLowerCase().includes(term);
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [registeredStudents, searchTerm, filterStatus]);

  // Aggregate Metrics
  const totalStudents = registeredStudents.length;
  const nepoCount = registeredStudents.filter((s) => s.status === 'nepo').length;
  const lapoCount = registeredStudents.filter((s) => s.status === 'lapo').length;
  const onlineCount = allOnlinePlayers.length;
  const totalCirculation = registeredStudents.reduce((acc, s) => acc + (s.balance || 0), 0);

  // Authentication Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError(null);

    const enteredCode = passcode.trim();
    if (enteredCode === ADMIN_SECRET) {
      const sessionData = {
        token: `lu_vc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        role: 'vice_chancellor',
        loginTime: new Date().toISOString(),
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      setIsAuthenticated(true);
      setPasscode('');
      addToast('Identity confirmed. Welcome to Vice Chancellor Executive Console.', 'success');
    } else {
      const securityAlertMsg = 'Unauthorized access detected. Campus security alerted.';
      setAuthError(securityAlertMsg);
      if (typeof window !== 'undefined') {
        window.alert(securityAlertMsg);
      }
      setPasscode('');
    }
    setIsVerifying(false);
  };

  // Logout Handler
  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAuthenticated(false);
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/';
    }
  };

  // Status Change Handler
  const handleStatusChange = (studentId: string, newStatus: SocioeconomicStatus) => {
    const targetStudent = registeredStudents.find((s) => s.id === studentId);
    let newBalance = targetStudent?.balance;
    if (newStatus === 'nepo' && (!newBalance || newBalance < 250000)) {
      newBalance = 250000;
    }

    updateStudentStatusFn(studentId, newStatus, newBalance);
    addToast(
      `Executive Order: Reassigned ${targetStudent?.username || 'student'} to ${newStatus === 'nepo' ? 'NEPO BABY 👑' : 'LAPO HUSTLER 🎒'}`,
      'success'
    );

    if (targetStudent && (targetStudent.matricNo === stats.matricNo || targetStudent.username === stats.username)) {
      setStats((prev) => ({
        ...prev,
        status: newStatus,
        balance: newBalance !== undefined ? newBalance : prev.balance,
      }));
    }
  };

  // Bursary Grant Handler (+₦50k)
  const handleGrantFunds = (student: RegisteredStudent, amount: number) => {
    const newBal = (student.balance || 0) + amount;
    updateStudentStatusFn(student.id, student.status, newBal);
    addToast(`Approved +₦${amount.toLocaleString()} special allocation to ${student.username}`, 'success');

    if (student.matricNo === stats.matricNo || student.username === stats.username) {
      setStats((prev) => ({ ...prev, balance: prev.balance + amount }));
    }
  };

  // Disciplinary Strike Reset Handler
  const handleResetStrikes = (student: RegisteredStudent) => {
    if (student.matricNo === stats.matricNo || student.username === stats.username) {
      setStats((prev) => ({
        ...prev,
        disciplinaryStrikes: 0,
        isSuspended: false,
        suspensionDaysRemaining: 0,
      }));
      addToast(`Cleared all disciplinary strikes for ${student.username}`, 'success');
    } else {
      addToast(`Cleared disciplinary record for ${student.username}`, 'info');
    }
  };

  // Real-time Marquee Broadcast
  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setIsSendingAnnouncement(true);
    sendAnnouncementFn(announcementText.trim(), announcementSender.trim());
    addToast('Executive Marquee Broadcast transmitted live to all campus terminals!', 'success');
    setAnnouncementText('');
    setIsSendingAnnouncement(false);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshStudentsFn();
    setTimeout(() => setIsRefreshing(false), 400);
    addToast('Student registry synchronized with central database.', 'info');
  };

  // ==========================================
  // VIEW 1: PASSCODE AUTHENTICATION GATE (LIGHT-MODE)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="w-screen h-screen min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/40 flex items-center justify-center p-4 select-none font-sans text-slate-800">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-8 flex flex-col items-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-rose-600" />

          {/* Institutional Seal Icon */}
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-amber-400 shadow-xl border border-slate-700">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
              <Building className="w-3 h-3 text-emerald-700" />
              <span>Senate Chambers · Restricted</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              LU Security Gateway · Vice Chancellor's Office
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Please enter the administrative security passkey to access student registries and university controls.
            </p>
          </div>

          {/* Security Alert Banner (On Incorrect Entry) */}
          {authError && (
            <div className="w-full mt-5 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <span className="font-bold block uppercase text-[10px] tracking-wider text-rose-700">
                  Security Violation
                </span>
                <p>{authError}</p>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleAuthSubmit} className="w-full mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Admin Secret Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  autoFocus
                  required
                  placeholder="Enter secret passkey..."
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border text-sm text-slate-900 font-mono placeholder:font-sans placeholder-slate-400 focus:outline-hidden focus:bg-white transition-all ${
                    authError
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !passcode.trim()}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isVerifying ? 'Verifying Passkey...' : 'Authenticate & Enter Console'}</span>
            </button>
          </form>

          {/* Navigation link back to main student campus */}
          <div className="mt-6 pt-5 border-t border-slate-100 w-full flex items-center justify-center">
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Campus Main Screen</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: STANDALONE FULL-PAGE DESKTOP CONSOLE
  // ==========================================
  return (
    <div className="w-screen h-screen min-h-screen bg-slate-100 text-slate-800 flex flex-col overflow-hidden font-sans select-none">
      {/* Executive Top Navigation Header */}
      <header className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs z-20 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Liids University (LU) Admin Console
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black uppercase tracking-wider">
                Root Admin
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Vice Chancellor's Office · Live Student Registry, Socioeconomic Switcher & Campus Broadcast
            </p>
          </div>
        </div>

        {/* Action Controls & Logout */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            title="Refresh Student Registry"
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Refresh Registry</span>
          </button>

          <button
            onClick={() => {
              window.location.href = '/';
            }}
            title="Switch to Student Campus Game"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Student View</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log out of Vice Chancellor Console"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Quick KPI Metrics Bar */}
      <div className="px-6 py-3 bg-white/70 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Enrolled</span>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-lg font-black text-slate-900">{totalStudents}</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Active Online</span>
          <div className="flex items-center gap-2 mt-1">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-lg font-black text-emerald-700">{Math.max(1, onlineCount)}</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">👑 Nepo Babies</span>
          <div className="flex items-center gap-2 mt-1">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-lg font-black text-amber-800">{nepoCount}</span>
            <span className="text-xs text-slate-500 font-semibold">
              ({totalStudents ? Math.round((nepoCount / totalStudents) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">🎒 Lapo Hustlers</span>
          <div className="flex items-center gap-2 mt-1">
            <Backpack className="w-4 h-4 text-emerald-600" />
            <span className="text-lg font-black text-emerald-800">{lapoCount}</span>
            <span className="text-xs text-slate-500 font-semibold">
              ({totalStudents ? Math.round((lapoCount / totalStudents) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Circulating</span>
          <div className="flex items-center gap-1.5 mt-1">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-base font-black text-amber-800 font-mono">
              ₦{totalCirculation.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Full-Page Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Student Registry Management */}
        <section className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Table Controls: Search & Status Filter */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, matric no, or department..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-700 shadow-2xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-slate-100 text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({totalStudents})
              </button>
              <button
                onClick={() => setFilterStatus('nepo')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  filterStatus === 'nepo'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-600" />
                Nepo ({nepoCount})
              </button>
              <button
                onClick={() => setFilterStatus('lapo')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  filterStatus === 'lapo'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                <Backpack className="w-3 h-3 text-emerald-600" />
                Lapo ({lapoCount})
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 z-10">
                <tr>
                  <th className="py-3 px-4 font-bold">Student</th>
                  <th className="py-3 px-4 font-bold">Department</th>
                  <th className="py-3 px-4 font-bold">Socioeconomic Status</th>
                  <th className="py-3 px-4 font-bold">Balance</th>
                  <th className="py-3 px-4 font-bold text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      No students found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const isCurrentLocal =
                      student.matricNo === stats.matricNo || student.username === stats.username;
                    const isOnline =
                      student.isOnline || allOnlinePlayers.some((p) => p.username === student.username);

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCurrentLocal ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        {/* Student Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs border border-slate-300">
                                {student.username.charAt(0)}
                              </div>
                              <span
                                title={isOnline ? 'Active Online' : 'Offline'}
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                  isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{student.username}</span>
                                {isCurrentLocal && (
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {student.matricNo} • {student.level}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Department & CGPA */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-800 font-medium block truncate max-w-[180px]">
                            {student.department}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            CGPA: {student.cgpa != null ? student.cgpa.toFixed(2) : 'Pending'}
                          </span>
                        </td>

                        {/* Real-time Status Dropdown */}
                        <td className="py-3.5 px-4">
                          <div className="inline-block relative">
                            <select
                              value={student.status}
                              onChange={(e) =>
                                handleStatusChange(student.id, e.target.value as SocioeconomicStatus)
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border cursor-pointer focus:outline-hidden transition-all ${
                                student.status === 'nepo'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              }`}
                            >
                              <option value="nepo" className="bg-white text-amber-800 font-bold">
                                👑 Nepo Baby
                              </option>
                              <option value="lapo" className="bg-white text-emerald-800 font-bold">
                                🎒 Lapo Hustler
                              </option>
                            </select>
                          </div>
                        </td>

                        {/* Balance */}
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                          ₦{(student.balance || 0).toLocaleString()}
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleGrantFunds(student, 50000)}
                              title="Inject ₦50,000 Bursary"
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              +₦50k
                            </button>
                            <button
                              onClick={() => handleResetStrikes(student)}
                              title="Clear Disciplinary Record"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              Clear Strikes
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Sidebar: VC Marquee Broadcast & Quick Controls */}
        <aside className="w-full lg:w-96 bg-slate-50/90 p-5 flex flex-col space-y-5 overflow-y-auto border-t lg:border-t-0 lg:border-l border-slate-200 shrink-0">
          {/* VC Campus Broadcast Console */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <Radio className="w-4 h-4 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                VC Campus Broadcast
              </h2>
            </div>
            <p className="text-[11px] text-slate-500">
              Send an official real-time marquee alert to all connected student screens.
            </p>

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Sender Title
                </label>
                <input
                  type="text"
                  value={announcementSender}
                  onChange={(e) => setAnnouncementSender(e.target.value)}
                  placeholder="e.g. Office of the Vice Chancellor"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Announcement Message
                </label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. All students are required to settle departmental dues before matriculation gown return deadline!"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-rose-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingAnnouncement || !announcementText.trim()}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Marquee Alert</span>
              </button>
            </form>
          </div>

          {/* Quick Executive Controls */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Admin Actions
            </h2>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setStats((prev) => ({ ...prev, balance: prev.balance + 100000 }));
                  addToast('Granted ₦100,000 to local player balance!', 'success');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-amber-800 font-bold border border-amber-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Grant Self +₦100k Cash</span>
                <Coins className="w-3.5 h-3.5 text-amber-600" />
              </button>

              <button
                onClick={() => {
                  setStats((prev) => ({
                    ...prev,
                    energy: prev.maxEnergy,
                    mood: 100,
                  }));
                  addToast('Fully restored player energy and mood!', 'success');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-emerald-800 font-bold border border-emerald-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Restore Energy & Mood (100%)</span>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              <button
                onClick={() => {
                  setStats((prev) => ({
                    ...prev,
                    disciplinaryStrikes: 0,
                    isSuspended: false,
                    suspensionDaysRemaining: 0,
                  }));
                  addToast('Disciplinary record cleared to 0 strikes!', 'success');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-800 font-bold border border-blue-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Clear Disciplinary Strikes</span>
                <Scale className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
