import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Send,
  Users,
  Radio,
  CheckCheck,
  Crown,
  Briefcase,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useCampusChat } from '../hooks/useCampusChat';
import { useGame } from '../context/GameContext';

interface CampusChatAppProps {
  onBack: () => void;
  onlinePlayersCount?: number;
}

export const CampusChatApp: React.FC<CampusChatAppProps> = ({
  onBack,
  onlinePlayersCount = 1,
}) => {
  const { stats } = useGame();
  const { messages, isLoading, sendMessage } = useCampusChat();
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');
    await sendMessage(text);
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  // Quick suggestion chips for rapid campus engagement
  const quickChips = [
    '📚 Who is in the Library?',
    '🥟 Who dey SUB for chops?',
    '🗳️ Vote SUG Elections!',
    '⚽ Match at Stadium today?',
  ];

  const totalActiveStudents = Math.max(1, onlinePlayersCount + 1);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 select-none overflow-hidden animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. CHAT APP HEADER: Clean Light WhatsApp/iMessage Header */}
      {/* ============================================================== */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 py-2.5 flex items-center justify-between shadow-xs shrink-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            title="Back to Home Screen"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
              <MessageSquare className="w-4 h-4 text-emerald-100" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          <div className="text-left ml-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">LU Campus Buzz</h3>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100/80 text-emerald-800 font-extrabold text-[8px] uppercase tracking-wider">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Users className="w-3 h-3 text-emerald-600 inline" />
              <span>{totalActiveStudents} active {totalActiveStudents === 1 ? 'student' : 'students'} online</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="px-2 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center gap-1 border border-slate-200/80">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">Channel</span>
            <span>#General</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CHAT FEED: Real-time Message History */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-slate-50 via-slate-100/50 to-emerald-50/20">
        {/* Campus Notice Pill */}
        <div className="flex justify-center my-1">
          <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-semibold flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Public Campus Broadcast • Messages visible to all active students</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Connecting to campus network...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 gap-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm">
              💬
            </div>
            <p className="text-xs font-bold text-slate-700">No messages yet!</p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Break the campus silence. Share study updates, party locations, or business pitches!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_matric === stats.matricNo;
            const isNepo =
              msg.sender_status?.toLowerCase().includes('nepo') ||
              (isMe && stats.status === 'nepo');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in fade-in duration-150`}
              >
                {/* Sender Metadata Bar for Incoming Messages */}
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px]">
                    <span className="font-bold text-slate-800">{msg.sender_name}</span>
                    <span className="font-mono text-slate-400 text-[9px]">{msg.sender_matric}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 border ${
                        isNepo
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isNepo ? (
                        <>
                          <Crown className="w-2.5 h-2.5" />
                          <span>Nepo</span>
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-2.5 h-2.5" />
                          <span>Lapo</span>
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`relative max-w-[84%] px-3.5 py-2 text-left shadow-xs transition-transform ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-xs shadow-emerald-600/10'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-2xl rounded-tl-xs'
                  }`}
                >
                  {/* Sender Metadata Bar inside Outgoing Messages */}
                  {isMe && (
                    <div className="flex items-center justify-end gap-1 mb-0.5 text-[9px] text-emerald-100 font-semibold">
                      <span>You ({msg.sender_matric})</span>
                      <span className="opacity-75">·</span>
                      <span className="uppercase text-[8px] tracking-wider">
                        {isNepo ? '👑 Nepo' : '💼 Lapo'}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap break-words select-text">
                    {msg.content}
                  </p>

                  {/* Message Timestamp & Delivery Check */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                      isMe ? 'text-emerald-100/90' : 'text-slate-400'
                    }`}
                  >
                    <span>{formatMessageTime(msg.created_at)}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-emerald-200 inline" />}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ============================================================== */}
      {/* 3. QUICK CHIPS: Fast Campus Suggestion Pills */}
      {/* ============================================================== */}
      <div className="bg-white/90 border-t border-slate-200/70 px-2 py-1.5 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-slate-600 text-[10px] font-medium whitespace-nowrap shrink-0 transition-colors active:scale-95 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 4. INPUT FOOTER: Input Box with Paper Plane Send Button */}
      {/* ============================================================== */}
      <div className="p-2.5 bg-white border-t border-slate-200/90 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a campus message..."
          disabled={isSending}
          maxLength={280}
          className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs px-3.5 py-2.5 rounded-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-800"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isSending}
          className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
