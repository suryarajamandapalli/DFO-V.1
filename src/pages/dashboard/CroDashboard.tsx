import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Thread, Message } from '../../lib/types';
import { ThreadList } from '../../components/dashboard/ThreadList';
import { ChatWindow } from '../../components/dashboard/ChatWindow';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ThreadInfoPanel } from '../../components/dashboard/ThreadInfoPanel';
import { AssignmentModal } from '../../components/dashboard/AssignmentModal';
import { ShieldAlert, Activity, UserPlus, LayoutDashboard } from 'lucide-react';
import { sendClinicalMessage, simulateIncomingPatientMessage, assignThread } from '../../lib/dfoService';
import { Button } from '../../components/ui/Button';

export function CroDashboard() {
  const { user, profile } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const activeThread = threads.find(t => t.id === activeThreadId);

  // Fetch all threads for CRO
  useEffect(() => {
    if (!user) return;
    
    const fetchThreads = async () => {
      let query = supabase.from('threads').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') {
        query = query.eq('risk_level', filter);
      }
      
      const { data } = await query;
      if (data) setThreads(data as Thread[]);
    };
    
    fetchThreads();

    // Listen to realtime thread updates globally
    const threadSub = supabase.channel('cro-threads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, payload => {
        const newThread = payload.new as Thread;
        // Apply filter manually for realtime updates
        if (filter !== 'all' && newThread.risk_level !== filter) return;
        
        setThreads(current => {
          const exists = current.find(t => t.id === newThread.id);
          if (exists) return current.map(t => t.id === newThread.id ? newThread : t);
          return [newThread, ...current];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(threadSub); };
  }, [user, filter]);

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

    const msgSub = supabase.channel(`messages-cro-${activeThreadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${activeThreadId}` }, payload => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [activeThreadId]);

  const handleAssign = async (userId: string, role: 'nurse' | 'doctor') => {
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
      activeMenu="threads"
      rightPanel={activeThread ? <ThreadInfoPanel thread={activeThread} /> : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
          <Activity className="w-12 h-12 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
            Select a thread to view <br /> Clinical Intelligence
          </p>
        </div>
      )}
    >
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Thread List Container */}
        <div className="flex-shrink-0 flex flex-col border-r border-slate-100 bg-white">
           <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters</span>
              <div className="flex items-center gap-1.5">
                {(['all', 'red', 'yellow'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`w-2.5 h-2.5 rounded-full border border-white shadow-sm ring-1 ring-offset-1 transition-all ${
                      filter === f ? 'scale-125 ring-slate-300' : 'ring-transparent opacity-40 hover:opacity-100'
                    } ${f === 'all' ? 'bg-slate-400' : f === 'red' ? 'bg-rose-500' : 'bg-amber-500'}`}
                    title={f.toUpperCase()}
                  />
                ))}
              </div>
           </div>
           <ThreadList 
            threads={threads} 
            selectedThreadId={activeThreadId}
            onSelectThread={setActiveThreadId}
          />
        </div>

        {/* Center Side: Interaction Zone */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
           {activeThread ? (
             <>
               <div className="px-6 py-2 border-b border-slate-50 flex items-center justify-between bg-white z-10">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <ShieldAlert className="w-3.5 h-3.5 text-sky-500" />
                       <span>Ops Center Control</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-[10px] uppercase font-black text-rose-500 hover:bg-rose-50 px-3 h-8"
                      onClick={() => simulateIncomingPatientMessage("Urgent Alert", "Patient requires immediate human intervention.", "red")}
                    >
                      Trigger Alert
                    </Button>
                    <Button 
                      onClick={() => setShowAssignModal(true)}
                      size="sm"
                      className="bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100 h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-2" />
                      Assign Staff
                    </Button>
                 </div>
               </div>
               <ChatWindow 
                 thread={activeThread}
                 messages={messages}
                 currentRole="cro"
                 onSendMessage={(msg) => sendClinicalMessage(activeThread.id, 'CRO', user!.id, msg)}
               />
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/20 text-slate-400 p-12">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-8">
                  <LayoutDashboard className="w-10 h-10 text-slate-200" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">DFO Global Dashboard</h2>
                <p className="text-sm font-medium text-slate-500 max-w-xs text-center leading-relaxed">
                  Select a live thread from the panel to oversee clinical flow and manage personnel allocation.
                </p>
             </div>
           )}
        </div>
      </div>

      {showAssignModal && activeThread && (
        <AssignmentModal 
          patientName={activeThread.patient_name}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssign}
        />
      )}
    </DashboardLayout>
  );
}

