import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import type { RegisteredStudent, SocioeconomicStatus } from '../types/game';
import {
  ShieldAlert,
  Crown,
  Backpack,
  X,
  Search,
  RefreshCw,
  Coins,
  Send,
  CheckCircle,
  Users,
  Radio,
  Sparkles,
  Scale,
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  registeredStudents: RegisteredStudent[];
  allOnlinePlayers: any[];
  onUpdateStudentStatus: (studentId: string, newStatus: SocioeconomicStatus, newBalance?: number) => void;
  onSendAnnouncement: (message: string, sender?: string) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  registeredStudents,
  allOnlinePlayers,
  onUpdateStudentStatus,
  onSendAnnouncement,
  onRefresh,
}) => {
  const { stats, addToast, setStats } = useGame();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'nepo' | 'lapo'>('all');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSender, setAnnouncementSender] = useState('Office of the Vice Chancellor');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter students
  const filteredStudents = registeredStudents.filter((student) => {
    const matchesSearch =
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalStudents = registeredStudents.length;
  const nepoCount = registeredStudents.filter((s) => s.status === 'nepo').length;
  const lapoCount = registeredStudents.filter((s) => s.status === 'lapo').length;
  const onlineCount = allOnlinePlayers.length;
  const totalCirculation = registeredStudents.reduce((acc, s) => acc + (s.balance || 0), 0);

  const handleStatusChange = (studentId: string, newStatus: SocioeconomicStatus) => {
    // If student is changed to Nepo, award starting perk if their balance was low
    const targetStudent = registeredStudents.find((s) => s.id === studentId);
    let newBalance = targetStudent?.balance;
    if (newStatus === 'nepo' && (!newBalance || newBalance < 250000)) {
      newBalance = 250000;
    }

    onUpdateStudentStatus(studentId, newStatus, newBalance);
    addToast(`Admin updated ${targetStudent?.username || 'student'} status to ${newStatus.toUpperCase()}`, 'success');

    // If local player was targeted, update stats directly
    if (targetStudent && (targetStudent.matricNo === stats.matricNo || targetStudent.username === stats.username)) {
      setStats((prev) => ({
        ...prev,
        status: newStatus,
        balance: newBalance !== undefined ? newBalance : prev.balance,
      }));
    }
  };

  const handleGrantFunds = (student: RegisteredStudent, amount: number) => {
    const newBal = (student.balance || 0) + amount;
    onUpdateStudentStatus(student.id, student.status, newBal);
    addToast(`Admin granted ₦${amount.toLocaleString()} to ${student.username}`, 'success');

    if (student.matricNo === stats.matricNo || student.username === stats.username) {
      setStats((prev) => ({ ...prev, balance: prev.balance + amount }));
    }
  };

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

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setIsSendingAnnouncement(true);
    onSendAnnouncement(announcementText.trim(), announcementSender.trim());
    addToast('Campus announcement broadcasted live to all students!', 'success');
    setAnnouncementText('');
    setIsSendingAnnouncement(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/30 backdrop-blur-xs overflow-hidden">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-800 animate-in fade-in duration-200">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Liids University (LU) Admin Console
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black uppercase tracking-wider">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live Multiplayer Registry, Socioeconomic Reassignment & Campus Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              title="Refresh Registry"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close Admin Panel"
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Metrics */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-2.5 rounded-2xl bg-white border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Enrolled</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-base font-black text-slate-900">{totalStudents}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Active Online</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="text-base font-black text-emerald-700">{Math.max(1, onlineCount)}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">👑 Nepo Babies</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-base font-black text-amber-800">{nepoCount}</span>
              <span className="text-[10px] text-slate-500">
                ({totalStudents ? Math.round((nepoCount / totalStudents) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">🎒 Lapo Hustlers</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Backpack className="w-4 h-4 text-emerald-600" />
              <span className="text-base font-black text-emerald-800">{lapoCount}</span>
              <span className="text-[10px] text-slate-500">
                ({totalStudents ? Math.round((lapoCount / totalStudents) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Circulating</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-black text-amber-800 font-mono">
                ₦{totalCirculation.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Main Body with Table and Announcement Section */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Student Registry Table */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200">
            {/* Table Controls / Search & Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name, matric no, or department..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    filterStatus === 'all' ? 'bg-slate-100 text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({totalStudents})
                </button>
                <button
                  onClick={() => setFilterStatus('nepo')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                    filterStatus === 'nepo' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'text-slate-500 hover:text-amber-700'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  Nepo ({nepoCount})
                </button>
                <button
                  onClick={() => setFilterStatus('lapo')}
                  className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                    filterStatus === 'lapo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-slate-500 hover:text-emerald-700'
                  }`}
                >
                  <Backpack className="w-3 h-3" />
                  Lapo ({lapoCount})
                </button>
              </div>
            </div>

            {/* Students Table */}
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
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No students found matching your criteria.
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
                          className={`hover:bg-slate-50 transition-colors ${
                            isCurrentLocal ? 'bg-emerald-50/60' : ''
                          }`}
                        >
                          {/* Student Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs border border-slate-300">
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

                          {/* Department */}
                          <td className="py-3 px-4">
                            <span className="text-slate-700 font-medium block truncate max-w-[150px]">
                              {student.department}
                            </span>
                            <span className="text-[10px] text-slate-500">CGPA: {student.cgpa?.toFixed(2) || '4.50'}</span>
                          </td>

                          {/* Socioeconomic Status Dropdown (Live Switcher) */}
                          <td className="py-3 px-4">
                            <div className="inline-block relative">
                              <select
                                value={student.status}
                                onChange={(e) =>
                                  handleStatusChange(student.id, e.target.value as SocioeconomicStatus)
                                }
                                className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider border cursor-pointer focus:outline-hidden transition-all ${
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
                          <td className="py-3 px-4 font-mono font-bold text-amber-700">
                            ₦{(student.balance || 0).toLocaleString()}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleGrantFunds(student, 50000)}
                                title="Grant ₦50,000 Bursary"
                                className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition-colors"
                              >
                                +₦50k
                              </button>
                              <button
                                onClick={() => handleResetStrikes(student)}
                                title="Clear Disciplinary Record"
                                className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold transition-colors"
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
          </div>

          {/* Right Column: Campus VC Announcement System & Quick Actions */}
          <div className="w-full md:w-80 bg-slate-50/70 p-5 flex flex-col space-y-5 overflow-y-auto border-l border-slate-200">
            {/* Live Campus Announcement Broadcast */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-rose-600">
                <Radio className="w-4 h-4 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  VC Campus Broadcast
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Send an official real-time marquee alert to all connected student screens.
              </p>

              <form onSubmit={handleBroadcastAnnouncement} className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Sender Title
                  </label>
                  <input
                    type="text"
                    value={announcementSender}
                    onChange={(e) => setAnnouncementSender(e.target.value)}
                    placeholder="e.g. Office of the Registrar"
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
                    placeholder="e.g. All students are required to settle first semester departmental dues before matriculation gown return deadline!"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-rose-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingAnnouncement || !announcementText.trim()}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Marquee Alert</span>
                </button>
              </form>
            </div>

            {/* Quick Campus Admin Controls */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Admin Actions
              </h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => {
                    setStats((prev) => ({ ...prev, balance: prev.balance + 100000 }));
                    addToast('Granted ₦100,000 to local player balance!', 'success');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-amber-800 font-bold border border-amber-200 flex items-center justify-between"
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
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-emerald-800 font-bold border border-emerald-200 flex items-center justify-between"
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
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-800 font-bold border border-blue-200 flex items-center justify-between"
                >
                  <span>Clear Disciplinary Strikes</span>
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
