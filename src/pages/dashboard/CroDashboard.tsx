import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Thread, Message } from '../../lib/types';
import { ThreadList } from '../../components/dashboard/ThreadList';
import { ChatWindow } from '../../components/dashboard/ChatWindow';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ThreadInfoPanel } from '../../components/dashboard/ThreadInfoPanel';
import { AssignmentModal } from '../../components/dashboard/AssignmentModal';
import { OperationsSummary } from '../../components/dashboard/OperationsSummary';
import { ShieldAlert, Activity, UserPlus, LayoutDashboard, Filter } from 'lucide-react';
import { sendClinicalMessage, assignThread } from '../../lib/dfoService';
import { Button } from '../../components/ui/Button';

export function CroDashboard() {
  const { profile } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const activeThread = threads.find(t => t.id === activeThreadId);

  // Fetch all threads with production schema
  useEffect(() => {
    if (!profile) return;
    
    const fetchThreads = async () => {
      let query = supabase.from('conversation_threads').select('*').order('updated_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data } = await query;
      if (data) setThreads(data as Thread[]);
    };
    
    fetchThreads();

    // Listen to realtime thread updates globally
    const threadSub = supabase.channel('cro-threads-prod')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_threads' }, payload => {
        const newThread = payload.new as Thread;
        if (filter !== 'all' && newThread.status !== filter) return;
        
        setThreads(current => {
          const exists = current.find(t => t.id === newThread.id);
          if (exists) return current.map(t => t.id === newThread.id ? newThread : t);
          return [newThread, ...current];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(threadSub); };
  }, [profile, filter]);

  // Messages fetch (Production Schema)
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

    const msgSub = supabase.channel(`messages-cro-prod-${activeThreadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `thread_id=eq.${activeThreadId}` }, payload => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [activeThreadId]);

  const handleAssign = async (userId: string, role: 'Nurse' | 'Doctor') => {
    if (!activeThreadId) return;
    try {
      await assignThread(activeThreadId, role, userId);
      setShowAssignModal(false);
    } catch (err) {
      console.error("Assignment failed:", err);
    }
  };

  return (
    <DashboardLayout 
      activeMenu="inbox"
      rightPanel={activeThread ? <ThreadInfoPanel thread={activeThread} /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
          <Activity className="w-12 h-12 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
            Select a thread to view <br /> Clinical Intelligence
          </p>
        </div>
      )}
    >
      <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-hidden bg-slate-50/10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Clinical Control Center</h1>
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-[0.25em] flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
               Live Production Fleet Monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white p-1.5 rounded-2xl shadow-premium border border-slate-100 flex items-center gap-1">
                {(['all', 'red', 'yellow', 'green'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === f 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
        </div>
        
        <OperationsSummary />

        <div className="flex-1 flex overflow-hidden rounded-2xl border border-slate-200/60 shadow- premium bg-white min-h-0 mt-6">
          {/* Thread List Column */}
          <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-100 bg-white">
             <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" />
                  Fleet Control
                </span>
             </div>
             <div className="flex-1 overflow-hidden">
                <ThreadList 
                   threads={threads} 
                   selectedThreadId={activeThreadId}
                   onSelectThread={setActiveThreadId}
                />
             </div>
          </div>

          {/* Interaction Zone */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
             {activeThread ? (
               <>
                 <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                          <ShieldAlert className="w-5 h-5 text-sky-500" />
                          <span>Global Oversight</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Button 
                         onClick={() => setShowAssignModal(true)}
                         size="sm"
                         className="bg-slate-900 text-white hover:bg-sky-600 h-10 px-6 text-[10px] font-black uppercase tracking-wider shadow-sm transition-all rounded-xl group"
                       >
                         <UserPlus className="w-4 h-4 mr-2" />
                         Handover
                       </Button>
                    </div>
                 </div>
                 <div className="flex-1 min-h-0">
                    <ChatWindow 
                      thread={activeThread}
                      messages={messages}
                      currentRole="CRO"
                      onSendMessage={(msg) => sendClinicalMessage(activeThread.id, 'CRO', profile!.id, msg)}
                    />
                 </div>
               </>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/20 text-slate-400 p-12">
                  <div className="w-28 h-28 bg-white rounded-[3rem] shadow-premium flex items-center justify-center mb-10 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <LayoutDashboard className="w-12 h-12 text-slate-100" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-3">Ops Overview</h2>
                  <p className="text-sm font-bold text-slate-400/80 max-w-sm text-center leading-relaxed tracking-wide">
                    Manage global clinical flows and assign high-priority cases to medical staff. Select a thread to begin clinical supervision.
                  </p>
               </div>
             )}
          </div>
        </div>
      </div>

      {showAssignModal && activeThread && (
        <AssignmentModal 
          patientName={activeThread.metadata?.patient_name || activeThread.patient_name || "Unknown Patient"}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssign}
        />
      )}
    </DashboardLayout>
  );
}
