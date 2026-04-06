import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Thread, Message } from '../../lib/types';
import { ThreadList } from '../../components/dashboard/ThreadList';
import { ChatWindow } from '../../components/dashboard/ChatWindow';
import { LogOut, ShieldAlert, Activity } from 'lucide-react';
import { sendClinicalMessage, simulateIncomingPatientMessage } from '../../lib/dfoService';
import { Button } from '../../components/ui/Button';

export function CroDashboard() {
  const { user, profile, signOut } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');

  const activeThread = threads.find(t => t.id === activeThreadId);

  // Fetch all threads for CRO
  useEffect(() => {
    if (!user) return;
    
    const fetchThreads = async () => {
      let query = supabase.from('conversation_threads').select('*').order('updated_at', { ascending: false });
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data } = await query;
      if (data) setThreads(data);
    };
    
    fetchThreads();

    // Listen to realtime thread updates globally
    const threadSub = supabase.channel('cro-threads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_threads' }, payload => {
        const newThread = payload.new as Thread;
        // Apply filter manually for realtime updates
        if (filter !== 'all' && newThread.status !== filter) return;
        
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
        .from('conversation_messages')
        .select('*')
        .eq('thread_id', activeThreadId)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data);
    };
    
    fetchMessages();

    const msgSub = supabase.channel(`messages-cro-${activeThreadId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages', filter: `thread_id=eq.${activeThreadId}` }, payload => {
        setMessages(current => [...current, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [activeThreadId]);

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">CRO Control Tower</h1>
              <p className="text-xs text-indigo-600 font-medium tracking-wide uppercase">Global Operations</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            {(['all', 'green', 'yellow', 'red'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  filter === f ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            size="sm" 
            variant="outline"
            className="hidden md:flex gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
            onClick={() => simulateIncomingPatientMessage("Jane Doe", "I am having severe bleeding right now. Please help.", "red")}
          >
            <Activity className="w-4 h-4" /> Simulate Red Alert
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="hidden md:flex gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
            onClick={() => simulateIncomingPatientMessage("Maria Smith", "I have a mild headache and some nausea.", "yellow")}
          >
            <Activity className="w-4 h-4" /> Simulate Yellow Alert
          </Button>

          <div className="text-right hidden lg:block ml-4 border-l border-slate-200 pl-4">
            <p className="text-sm font-semibold text-slate-700">{profile?.full_name}</p>
            <p className="text-xs text-slate-500">Chief Research Officer</p>
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
            currentRole="cro"
            onSendMessage={(msg) => sendClinicalMessage(activeThread.id, 'cro', user!.id, msg)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400">
            <ShieldAlert className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-500">Control Tower Idle</p>
            <p className="text-sm mt-1 max-w-md text-center">Select a thread from the global pool to monitor real-time AI classification and clinical communications.</p>
          </div>
        )}
      </main>
    </div>
  );
}
