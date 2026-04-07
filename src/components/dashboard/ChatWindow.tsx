import { useState, useRef, useEffect } from 'react';
import type { Message, Thread } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Send, UserCircle, Bot, Stethoscope, HeartPulse, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  thread: Thread;
  messages: Message[];
  currentRole: 'cro' | 'nurse' | 'doctor';
  onSendMessage: (text: string) => Promise<void>;
  onTakeover?: () => Promise<void>;
}

export function ChatWindow({ thread, messages, currentRole, onSendMessage, onTakeover }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    await onSendMessage(inputText.trim());
    setInputText('');
    setSending(false);
  };

  const getSenderIcon = (type: string) => {
    switch(type) {
      case 'patient': return <UserCircle className="w-5 h-5 text-slate-400" />;
      case 'ai': return <Bot className="w-5 h-5 text-indigo-500" />;
      case 'doctor': return <Stethoscope className="w-5 h-5 text-rose-500" />;
      case 'nurse': return <HeartPulse className="w-5 h-5 text-amber-500" />;
      default: return <UserCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSenderName = (type: string) => {
    switch(type) {
      case 'patient': return thread.patient_name || 'Patient';
      case 'ai': return 'Sakhi AI';
      case 'doctor': return 'Attending Doctor';
      case 'nurse': return 'Triage Nurse';
      default: return 'System';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      {/* Thread Header - Simplified */}
      <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${thread.risk_level === 'red' ? 'bg-rose-500 animate-pulse' : thread.risk_level === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <h2 className="text-base font-black text-slate-800 tracking-tight">{thread.patient_name || 'Patient'}</h2>
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-50 text-slate-500 uppercase tracking-widest leading-none border border-slate-200">
            {thread.status}
          </span>
        </div>

        {/* Human Takeover logic */}
        <div className="flex items-center gap-3">
          {!thread.assigned_to && currentRole === 'doctor' && (
            <Button onClick={onTakeover} size="sm" className="bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 gap-2">
              <ShieldAlert className="w-4 h-4" />
              Emergency Takeover
            </Button>
          )}
          {!thread.assigned_to && currentRole === 'nurse' && (
            <Button onClick={onTakeover} size="sm" className="bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 gap-2">
              <HeartPulse className="w-4 h-4" />
              Claim Thread
            </Button>
          )}
          {thread.assigned_to && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <Stethoscope className="w-4 h-4" />
              <span className="text-xs font-bold">ACTIVE CLINICAL SESSION</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 text-sm mt-12 flex flex-col items-center gap-4">
             <div className="bg-slate-100 p-4 rounded-full">
               <Bot className="w-8 h-8 text-slate-300" />
             </div>
             <span>No secure messages in this thread yet.</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = (msg.sender_type === 'CRO' && currentRole === 'cro') || 
                       (msg.sender_type === 'nurse' && currentRole === 'nurse') ||
                       (msg.sender_type === 'doctor' && currentRole === 'doctor');
            const isPatient = msg.sender_type === 'patient';

            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`mt-1 flex-shrink-0 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 ${isMe ? 'hidden' : ''}`}>
                  {getSenderIcon(msg.sender_type)}
                </div>
                
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`text-xs text-slate-500 mb-1 flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="font-medium">{isMe ? 'You' : getSenderName(msg.sender_type)}</span>
                    <span className="text-[10px]">{format(new Date(msg.created_at), 'HH:mm')}</span>
                  </div>
                  
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-sky-600 text-white rounded-tr-sm shadow-sky-600/10' 
                      : isPatient
                        ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                        : 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tl-sm' // AI or other staff
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={(thread.assigned_to || currentRole === 'cro') ? "Type a secure medical response..." : "Take over the thread to send a message..."}
            disabled={!thread.assigned_to && currentRole !== 'cro'}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-400 transition-shadow"
          />
          <Button 
            type="submit" 
            disabled={sending || !inputText.trim() || (!thread.assigned_to && currentRole !== 'cro')}
            className={`px-5 rounded-xl flex items-center gap-2 ${inputText.trim() ? 'bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/20' : 'bg-slate-300 text-slate-100'}`}
          >
            {sending ? 'Sending...' : <><Send className="w-4 h-4" /> Send</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
