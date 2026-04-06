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
      case 'patient': return thread.metadata?.patient_name || 'Patient';
      case 'ai': return 'Sakhi AI';
      case 'doctor': return 'Attending Doctor';
      case 'nurse': return 'Triage Nurse';
      default: return 'System';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      {/* Thread Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{thread.metadata?.patient_name || 'Incoming Patient'}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-500 font-medium">Status: {thread.status.toUpperCase()}</span>
            {thread.assigned_role && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Assigned to: {thread.assigned_role.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Human Takeover logic. Only Dr can take over explicitly to kick out AI. 
            Or if already assigned to someone else. */}
        <div className="flex items-center gap-3">
          {!thread.assigned_user_id && currentRole === 'doctor' && (
            <Button onClick={onTakeover} size="sm" className="bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 gap-2">
              <ShieldAlert className="w-4 h-4" />
              Emergency Takeover
            </Button>
          )}
          {!thread.assigned_user_id && currentRole === 'nurse' && (
            <Button onClick={onTakeover} size="sm" className="bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 gap-2">
              <HeartPulse className="w-4 h-4" />
              Claim Thread
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 text-sm mt-12">
            No secure messages in this thread yet.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_type === currentRole;
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
                      ? 'bg-sky-500 text-white rounded-tr-sm' 
                      : isPatient
                        ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                        : 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tl-sm' // AI or other staff
                  }`}>
                    {msg.content}
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
            placeholder={thread.assigned_user_id ? "Type a secure medical response..." : "Take over the thread to send a message..."}
            disabled={!thread.assigned_user_id && currentRole !== 'cro'}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-400 transition-shadow"
          />
          <Button 
            type="submit" 
            disabled={sending || !inputText.trim() || (!thread.assigned_user_id && currentRole !== 'cro')}
            className={`px-5 rounded-xl flex items-center gap-2 ${inputText.trim() ? 'bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/20' : 'bg-slate-200 text-slate-400'}`}
          >
            {sending ? 'Sending...' : <><Send className="w-4 h-4" /> Send</>}
          </Button>
        </form>
      </div>
    </div>
  );
}
