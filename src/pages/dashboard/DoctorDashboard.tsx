import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Thread, Message } from '../../lib/types';
import { ThreadList } from '../../components/dashboard/ThreadList';
import { ChatWindow } from '../../components/dashboard/ChatWindow';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ThreadInfoPanel } from '../../components/dashboard/ThreadInfoPanel';
import { Stethoscope, Activity, AlertTriangle } from 'lucide-react';
import { sendClinicalMessage, assignThread } from '../../lib/dfoService';

export function DoctorDashboard() {
  const { profile } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const activeThread = threads.find(t => t.id === activeThreadId);

  // Fetch initial threads (Red or explicitly assigned to this doctor)
  useEffect(() => {
    if (!profile) return;
    
    const fetchThreads = async () => {
      const { data } = await supabase
        .from('conversation_threads')
        .select('*')
        .or(`status.eq.red,assigned_user_id.eq.${profile.id}`)
        .order('updated_at', { ascending: false });
        
      if (data) setThreads(data as Thread[]);
    };
    
    fetchThreads();

    // Listen to realtime thread updates
    const threadSub = supabase.channel('dr-threads-prod')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_threads' }, payload => {
        const newThread = payload.new as Thread;
        // Only keep if red or assigned to them explicitly
        if (newThread.status === 'red' || newThread.assigned_user_id === profile.id) {
          setThreads(current => {
            const exists = current.find(t => t.id === newThread.id);
            if (exists) return current.map(t => t.id === newThread.id ? newThread : t);
            return [newThread, ...current];
          });
        } else {
           // Remove if it's no longer their concern
           setThreads(current => current.filter(t => t.id !== newThread.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(threadSub); };
  }, [profile]);

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
        
      if (data) setMessages(data as Message[]);
    };
    
    fetchMessages();

    const msgSub = supabase.channel(`messages-dr-prod-${activeThreadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `thread_id=eq.${activeThreadId}` }, payload => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [activeThreadId]);

  return (
    <DashboardLayout 
      activeMenu="inbox"
      rightPanel={activeThread ? <ThreadInfoPanel thread={activeThread} /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
          <Activity className="w-12 h-12 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
            Select an escalation to <br /> view Medical Intel
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
          <div className="flex-1 flex flex-col min-w-0 bg-white shadow-bespoke z-10 transition-all duration-500">
            <div className="px-6 py-4 border-b border-rose-50 flex items-center justify-between bg-white/90 backdrop-blur-xl sticky top-0 z-20">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-600 rounded-xl text-white shadow-lg shadow-rose-600/20">
                     <AlertTriangle className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] block leading-none mb-1">Emergency Medical Intel</span>
                    <h3 className="text-xs font-black text-slate-900 leading-none">TRAUMA/CRITICAL: {activeThread.id.slice(0,8).toUpperCase()}</h3>
                  </div>
               </div>
               {!activeThread.assigned_user_id && (
                 <button 
                  onClick={() => assignThread(activeThread.id, 'Doctor', profile!.id)}
                  className="flex items-center gap-2 text-[10px] font-black bg-rose-600 text-white px-6 py-3 rounded-2xl border border-rose-700 hover:bg-rose-700 hover:scale-[1.02] transition-all uppercase tracking-widest shadow-xl shadow-rose-600/30"
                 >
                   Take Clinical Control
                 </button>
               )}
            </div>
            
            <ChatWindow 
              thread={activeThread}
              messages={messages}
              currentRole="Doctor"
              onSendMessage={(msg) => sendClinicalMessage(activeThread.id, 'Doctor', profile!.id, msg)}
              onTakeover={() => assignThread(activeThread.id, 'Doctor', profile!.id)}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/20 text-slate-400 p-12">
             <div className="p-10 rounded-xl bg-white shadow-premium mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                <Stethoscope className="w-16 h-16 text-sky-200" />
             </div>
             <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Physician Escalations</h2>
             <p className="text-sm font-bold text-slate-400/80 max-w-sm text-center leading-relaxed tracking-wide">
                Critical red-risk alerts and high-priority maternal queries will appear here. Minimum SLA: 5 minutes.
             </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
