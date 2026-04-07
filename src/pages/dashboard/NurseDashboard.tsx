import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Thread, Message } from '../../lib/types';
import { ThreadList } from '../../components/dashboard/ThreadList';
import { ChatWindow } from '../../components/dashboard/ChatWindow';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ThreadInfoPanel } from '../../components/dashboard/ThreadInfoPanel';
import { HeartPulse, Activity } from 'lucide-react';
import { sendClinicalMessage, assignThread } from '../../lib/dfoService';

export function NurseDashboard() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const activeThread = threads.find(t => t.id === activeThreadId);

  // Fetch initial threads (Yellow or explicitly assigned to this nurse)
  useEffect(() => {
    if (!user) return;
    
    const fetchThreads = async () => {
      const { data } = await supabase
        .from('threads')
        .select('*')
        .or(`risk_level.eq.yellow,assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false });
        
      if (data) setThreads(data as Thread[]);
    };
    
    fetchThreads();

    // Listen to realtime thread updates
    const threadSub = supabase.channel('nurse-threads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, payload => {
        const newThread = payload.new as Thread;
        // Only keep if yellow or assigned to them explicitly
        if (newThread.risk_level === 'yellow' || newThread.assigned_to === user.id) {
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
        .from('messages')
        .select('*')
        .eq('thread_id', activeThreadId)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data as Message[]);
    };
    
    fetchMessages();

    const msgSub = supabase.channel(`messages-nurse-${activeThreadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${activeThreadId}` }, payload => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [activeThreadId]);

  return (
    <DashboardLayout 
      activeMenu="threads"
      rightPanel={activeThread ? <ThreadInfoPanel thread={activeThread} /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
          <Activity className="w-12 h-12 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
            Select a case to view <br /> Patient Intelligence
          </p>
        </div>
      )}
    >
      <div className="flex-1 flex overflow-hidden">
        <ThreadList 
          threads={threads} 
          selectedThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
        />
        
        {activeThread ? (
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="px-6 py-2 border-b border-slate-50 flex items-center justify-between bg-white z-10">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Session</span>
               </div>
               {!activeThread.assigned_to && (
                 <button 
                  onClick={() => assignThread(activeThread.id, 'nurse', user!.id)}
                  className="flex items-center gap-2 text-[10px] font-black bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors uppercase tracking-wider"
                 >
                   Claim Triage Thread
                 </button>
               )}
            </div>
            
            <ChatWindow 
              thread={activeThread}
              messages={messages}
              currentRole="nurse"
              onSendMessage={(msg) => sendClinicalMessage(activeThread.id, 'nurse', user!.id, msg)}
              onTakeover={() => assignThread(activeThread.id, 'nurse', user!.id)}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/20 text-slate-400 p-12">
             <div className="p-8 rounded-full bg-white shadow-sm border border-slate-100 mb-6 font-bold">
                <HeartPulse className="w-12 h-12 text-rose-200" />
             </div>
             <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">Triage Queue</h2>
             <p className="text-sm font-medium text-slate-500 max-w-xs text-center leading-relaxed">
                Routine maternal queries and yellow-risk threads require triage within 15 minutes.
             </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

