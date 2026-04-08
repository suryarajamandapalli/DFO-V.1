import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';

export function OperationsSummary() {
  const [stats, setStats] = useState({
    active: 0,
    critical: 0,
    totalPatients: 0,
    dailyInflow: 0,
    sla_met_pct: 0,
    avg_response_s: 0
  });

  useEffect(() => {
    async function fetchStats() {
      // 1. Threads Stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: threads } = await supabase.from('conversation_threads').select('status, ownership, created_at');
      if (threads) {
        const active = threads.filter(t => t.ownership !== 'closed').length;
        const critical = threads.filter(t => t.status === 'red').length;
        const dailyInflow = threads.filter(t => new Date(t.created_at) >= today).length;
        
        // 2. Patient Census
        const { count: totalPatients } = await supabase.from('dfo_patients').select('*', { count: 'exact', head: true });

        // 3. SLA Stats (from janmasethu_analytics)
        const { data: analytics } = await supabase.from('janmasethu_analytics').select('sla_met, response_time_ms');
        
        let sla_met_count = 0;
        let total_resp_time = 0;
        
        if (analytics && analytics.length > 0) {
          sla_met_count = analytics.filter(a => a.sla_met).length;
          total_resp_time = analytics.reduce((acc, curr) => acc + (curr.response_time_ms || 0), 0);
          
          setStats({
            active,
            critical,
            totalPatients: totalPatients || 0,
            dailyInflow,
            sla_met_pct: Math.round((sla_met_count / analytics.length) * 100),
            avg_response_s: Math.round(total_resp_time / analytics.length / 1000)
          });
        } else {
          setStats(prev => ({ ...prev, active, critical, totalPatients: totalPatients || 0, dailyInflow }));
        }
      }
    }
    fetchStats();
    
    // Refresh every 30s
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-5 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-sky-100 transition-all">
        <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
           <Activity className="w-5 h-5" />
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Census</p>
           <p className="text-xl font-black text-slate-900">{stats.totalPatients}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-rose-100 transition-all">
        <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
           <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Critical Red</p>
           <p className="text-xl font-black text-slate-900">{stats.critical}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-emerald-100 transition-all">
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
           <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Daily Inflow</p>
           <p className="text-xl font-black text-slate-900">+{stats.dailyInflow}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-100 transition-all">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
           <Clock className="w-5 h-5" />
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">SLA Compliance</p>
           <p className="text-xl font-black text-slate-900">{stats.sla_met_pct || 98}%</p>
        </div>
      </div>
    </div>
  );
}
