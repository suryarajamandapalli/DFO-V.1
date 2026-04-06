import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Thread, Message } from '../../lib/types';
import { ThreadList } from '../../components/dashboard/ThreadList';
import { ChatWindow } from '../../components/dashboard/ChatWindow';
import { LogOut, Stethoscope } from 'lucide-react';
import { sendClinicalMessage, takeoverThread } from '../../lib/dfoService';

export function DoctorDashboard() {
  const { user, profile, signOut } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const activeThread = threads.find(t => t.id === activeThreadId);

  // Fetch initial threads (Red or explicitly assigned to this doctor)
  useEffect(() => {
    if (!user) return;
    
    const fetchThreads = async () => {
      const { data } = await supabase
        .from('conversation_threads')
        .select('*')
        .or(`status.eq.red,assigned_user_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });
        
      if (data) setThreads(data);
    };
    
    fetchThreads();

    // Listen to realtime thread updates
    const threadSub = supabase.channel('doctor-threads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_threads' }, payload => {
        const newThread = payload.new as Thread;
        // Only keep if red or assigned to them explicitly
        if (newThread.status === 'red' || newThread.assigned_user_id === user.id) {
          setThreads(current => {
            const exists = current.find(t => t.id === newThread.id);
            if (exists) return current.map(t => t.id === newThread.id ? newThread : t);
            return [newThread, ...current];
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(threadSub); };
  }, [user]);

  // Fetch messages when a thread is selected
  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('thread_id', activeThreadId)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data);
    };
    
    fetchMessages();

    const msgSub = supabase.channel(`messages-dr-${activeThreadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `thread_id=eq.${activeThreadId}` }, payload => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [activeThreadId]);

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Critical Escalations</h1>
            <p className="text-xs text-rose-600 font-medium tracking-wide uppercase">Doctor Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-700">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">Attending Doctor</p>
          </div>
          <button onClick={signOut} className="text-slate-400 hover:text-slate-600 transition-colors p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <ThreadList 
          threads={threads} 
          selectedThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
        />
        
        {activeThread ? (
          <ChatWindow 
            thread={activeThread}
            messages={messages}
            currentRole="doctor"
            onSendMessage={(msg) => sendClinicalMessage(activeThread.id, 'doctor', user!.id, msg)}
            onTakeover={() => takeoverThread(activeThread.id, 'doctor', user!.id)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400">
            <Stethoscope className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-500">Select a Red Thread</p>
            <p className="text-sm mt-1">These are emergency escalations demanding immediate intervention.</p>
          </div>
        )}
      </main>
    </div>
  );
}
