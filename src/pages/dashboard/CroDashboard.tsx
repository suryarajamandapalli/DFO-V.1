import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Thread } from '../../lib/types';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { AssignmentModal } from '../../components/dashboard/AssignmentModal';
import { PatientInflowChart, RiskDistributionChart } from '../../components/dashboard/OverviewCharts';
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  Search,
  MessageCircle,
  Stethoscope,
  Heart,
  ArrowUpDown,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { assignThread } from '../../lib/dfoService';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';

export function CroDashboard() {
  const { profile } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [inflowData, setInflowData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['red', 'yellow', 'green']);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'risk'>('newest');
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    criticalRisk: 0,
    slaCompliance: 98.4,
    growthIndex: 12.5
  });

  // Fetch all threads with production schema
  useEffect(() => {
    if (!profile) return;
    
    const fetchThreads = async () => {
      const { data } = await supabase
        .from('conversation_threads')
        .select(`
          *,
          patient:user_id (
            full_name,
            phone_number
          )
        `)
        .order('updated_at', { ascending: false });
      
      if (data) {
        const enriched = data.map((t: any) => ({
          ...t,
          patient_name: t.patient?.full_name || t.metadata?.patient_name || t.patient_name || `Phone: ${t.patient?.phone_number || 'Unknown'}`,
        }));
        setThreads(enriched as Thread[]);
      }
    };
    
    const fetchStats = async () => {
      const { count: patientCount } = await supabase
        .from('dfo_patients')
        .select('*', { count: 'exact', head: true });
      
      const { count: criticalCount } = await supabase
        .from('conversation_threads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'red');

      const { data: analytics } = await supabase.from('janmasethu_analytics').select('sla_met');
      const slaPct = analytics && analytics.length > 0 
        ? Math.round((analytics.filter(a => a.sla_met).length / analytics.length) * 100) 
        : 95.8;

      const { data: inflow } = await supabase
        .from('conversation_threads')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const realInflow = days.map(d => ({ day: d, value: 0 }));
      inflow?.forEach(t => {
        const day = days[new Date(t.created_at).getDay()];
        const entry = realInflow.find(r => r.day === day);
        if (entry) entry.value++;
      });

      setStats({
        totalPatients: patientCount || 0,
        criticalRisk: criticalCount || 0,
        slaCompliance: slaPct,
        growthIndex: 12.5
      });
      setInflowData(realInflow);
    };

    fetchThreads();
    fetchStats();

    const threadSub = supabase.channel('cro-global-v1')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_threads' }, () => {
        fetchThreads();
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(threadSub); };
  }, [profile]);

  const filteredThreads = useMemo(() => {
    let result = threads.filter(t => activeFilters.includes(t.status));
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(t => {
        const meta = (t.metadata as any) || {};
        return (t.patient_name?.toLowerCase().includes(lowerQuery) ||
               meta.last_message?.toLowerCase().includes(lowerQuery) ||
               t.channel.toLowerCase().includes(lowerQuery));
      });
    }
    
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    if (sortBy === 'risk') {
      const riskOrder: Record<string, number> = { red: 0, yellow: 1, green: 2 };
      result.sort((a, b) => riskOrder[a.status] - riskOrder[b.status]);
    }
    
    return result;
  }, [threads, searchQuery, activeFilters, sortBy]);

  const triageColumns = useMemo(() => ({
    green: filteredThreads.filter(t => t.status === 'green'),
    yellow: filteredThreads.filter(t => t.status === 'yellow'),
    red: filteredThreads.filter(t => t.status === 'red'),
  }), [filteredThreads]);

  const riskDistData = useMemo(() => [
    { name: 'Red', value: triageColumns.red.length, color: '#ef4444' },
    { name: 'Yellow', value: triageColumns.yellow.length, color: '#f59e0b' },
    { name: 'Green', value: triageColumns.green.length, color: '#10b981' },
  ], [triageColumns]);

  const handleAssign = async (userId: string, role: 'Nurse' | 'Doctor') => {
    if (!activeThreadId) return;
    try {
      await assignThread(activeThreadId, role, userId);
      
      await supabase.from('dfo_notification_logs').insert([
        {
          patient_id: userId,
          category: 'assignment_new',
          payload: {
            title: 'Action Required: Clinical Handover',
            message: `You have been assigned to a ${role} priority triage session.`
          },
          status: 'PENDING'
        }
      ]);

      setShowAssignModal(false);
      setActiveThreadId(null);
    } catch (err) {
      console.error("Clinical assignment failure:", err);
    }
  };

  const activeThread = threads.find(t => t.id === activeThreadId);

  return (
    <DashboardLayout activeMenu="dashboard">
      <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Clinic Control Center</h1>
            <p className="text-slate-500 text-sm font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Monitoring {threads.length} live clinical streams
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search patient, message or channel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                {(['red', 'yellow', 'green'] as const).map(color => (
                  <button
                    key={color}
                    onClick={() => {
                       setActiveFilters(prev => 
                         prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                       );
                    }}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      activeFilters.includes(color) 
                        ? (color === 'red' ? 'bg-rose-500 text-white shadow-md' : color === 'yellow' ? 'bg-amber-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md')
                        : 'text-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full border border-white", activeFilters.includes(color) ? 'bg-white' : (color === 'red' ? 'bg-rose-500' : color === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'))} />
                  </button>
                ))}
            </div>

            <button 
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : sortBy === 'oldest' ? 'risk' : 'newest')}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort: {sortBy}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           <KPICard 
              title="Census" 
              value={stats.totalPatients.toLocaleString()} 
              subtitle="Total Registered" 
              icon={<Activity className="w-4 h-4" />} 
              color="sky" 
           />
           <KPICard 
              title="Urgent" 
              value={stats.criticalRisk} 
              subtitle="Risk: High" 
              icon={<ShieldAlert className="w-4 h-4" />} 
              color="rose" 
              highlight={stats.criticalRisk > 0}
           />
           <KPICard 
              title="SLA Met" 
              value={`${stats.slaCompliance}%`} 
              subtitle="Response Time" 
              icon={<CheckCircle2 className="w-4 h-4" />} 
              color="emerald" 
           />
           <KPICard 
              title="Active" 
              value={threads.length} 
              subtitle="Current Threads" 
              icon={<TrendingUp className="w-4 h-4" />} 
              color="blue" 
           />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TriageColumn 
            title="Standard" 
            threads={triageColumns.green} 
            color="emerald"
            onAssign={(id: string) => { setActiveThreadId(id); setShowAssignModal(true); }}
          />
          <TriageColumn 
            title="Escalated" 
            threads={triageColumns.yellow} 
            color="amber"
            onAssign={(id: string) => { setActiveThreadId(id); setShowAssignModal(true); }}
          />
          <TriageColumn 
            title="Critical" 
            threads={triageColumns.red} 
            color="rose"
            onAssign={(id: string) => { setActiveThreadId(id); setShowAssignModal(true); }}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <PatientInflowChart data={inflowData} />
          </div>
          <div>
            <RiskDistributionChart data={riskDistData} />
          </div>
        </div>
      </div>

      {showAssignModal && activeThread && (
        <AssignmentModal 
          patientName={activeThread.patient_name || "Unknown Patient"}
          onClose={() => { setShowAssignModal(false); setActiveThreadId(null); }}
          onAssign={handleAssign}
        />
      )}
    </DashboardLayout>
  );
}

function KPICard({ title, value, subtitle, icon, color, highlight }: any) {
  return (
    <div className={cn(
      "bg-white p-5 rounded-xl border transition-all shadow-sm",
      highlight ? "border-rose-200 bg-rose-50/20" : "border-slate-100"
    )}>
      <div className="flex items-center justify-between mb-4">
         <div className={cn(
           "p-2 rounded-lg text-white",
           color === 'sky' ? 'bg-sky-50 text-sky-600' :
           color === 'rose' ? 'bg-rose-50 text-rose-600' :
           color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
           'bg-blue-50 text-blue-600'
         )}>
           {icon}
         </div>
         <span className={cn(
           "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
           highlight ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"
         )}>
           {highlight ? 'Active Priority' : 'Stable'}
         </span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
         <span className="text-2xl font-black text-slate-900">{value}</span>
         <span className="text-[10px] font-bold text-slate-400">{subtitle}</span>
      </div>
    </div>
  );
}

function TriageColumn({ title, threads, color, onAssign }: any) {
  return (
    <div className="flex flex-col h-[550px] bg-slate-50/30 p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-5">
         <div className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full", color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : color === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]')} />
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">{title} Threads</h3>
         </div>
         <span className="text-xs font-black text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm">
           {threads.length}
         </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        {threads.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale py-10">
             <Clock className="w-8 h-8 text-slate-300 mb-3" />
             <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Queue is Empty</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {threads.map((thread: Thread) => (
              <ThreadCard 
                key={thread.id} 
                thread={thread} 
                accentColor={color} 
                onAssign={() => onAssign(thread.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function ThreadCard({ thread, accentColor, onAssign }: { thread: Thread, accentColor: string, onAssign: () => void }) {
  const metadata = (thread.metadata as any) || {};
  const patientName = thread.patient_name || "John Doe";
  const lastMsg = metadata.last_message || "No recent message content captured.";
  const sentiment = metadata.sentiment || 'neutral';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white p-4 rounded-xl border border-slate-200 group relative hover:border-sky-400 hover:shadow-md transition-all cursor-default"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
           <div className={cn(
             "w-9 h-9 rounded-lg flex items-center justify-center text-slate-900 font-black text-xs border border-slate-100 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-all",
             accentColor === 'rose' && "border-rose-100",
             accentColor === 'amber' && "border-amber-100",
             accentColor === 'emerald' && "border-emerald-100"
           )}>
              {patientName.substring(0, 2).toUpperCase()}
           </div>
           <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-900 leading-none truncate max-w-[120px]">{patientName}</h4>
              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight opacity-70 italic">{thread.channel}</p>
           </div>
        </div>
        <div className="flex flex-col items-end gap-1">
           <div className={cn(
             "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
             sentiment === 'positive' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
             sentiment === 'negative' ? 'text-rose-600 bg-rose-50 border-rose-100' :
             'text-sky-600 bg-sky-50 border-sky-100'
           )}>
              {sentiment}
           </div>
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              {formatDistanceToNow(new Date(thread.updated_at), { addSuffix: false })}
           </p>
        </div>
      </div>

      <p className="text-[10px] font-medium text-slate-500 line-clamp-2 leading-relaxed mb-4 group-hover:text-slate-900 transition-colors">
        {lastMsg}
      </p>

      <div className="flex items-center justify-between">
         <div className="flex -space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[7px] font-black">
                {i === 1 ? <Stethoscope className="w-2.5 h-2.5 text-rose-500" /> : 
                 i === 2 ? <Heart className="w-2.5 h-2.5 text-emerald-500" /> : 
                           <MessageCircle className="w-2.5 h-2.5 text-sky-500" />}
              </div>
            ))}
         </div>
         
         <button 
           onClick={(e) => { e.stopPropagation(); onAssign(); }}
           className={cn(
             "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm transition-all",
             accentColor === 'rose' ? "bg-rose-600 text-white hover:bg-rose-700 hover:shadow-rose-100" :
             accentColor === 'amber' ? "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-amber-100" :
             "bg-slate-900 text-white hover:bg-sky-600 hover:shadow-sky-100"
           )}
         >
           Assign Lead
         </button>
      </div>
    </motion.div>
  );
}
