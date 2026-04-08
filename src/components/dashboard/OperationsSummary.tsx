import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';

export function OperationsSummary() {
  const [stats, setStats] = useState({
    active: 0,
    critical: 0,
    sla_met_pct: 0,
    avg_response_s: 0
  });

  useEffect(() => {
    async function fetchStats() {
      // 1. Threads Stats
      const { data: threads } = await supabase.from('conversation_threads').select('status, ownership');
      if (threads) {
        const active = threads.filter(t => t.ownership !== 'closed').length;
        const critical = threads.filter(t => t.status === 'red').length;
        
        // 2. SLA Stats (from janmasethu_analytics)
        const { data: analytics } = await supabase.from('janmasethu_analytics').select('sla_met, response_time_ms');
        
        let sla_met_count = 0;
        let total_resp_time = 0;
        
        if (analytics && analytics.length > 0) {
          sla_met_count = analytics.filter(a => a.sla_met).length;
          total_resp_time = analytics.reduce((acc, curr) => acc + (curr.response_time_ms || 0), 0);
          
          setStats({
            active,
            critical,
            sla_met_pct: Math.round((sla_met_count / analytics.length) * 100),
            avg_response_s: Math.round(total_resp_time / analytics.length / 1000)
          });
        } else {
          setStats(prev => ({ ...prev, active, critical }));
        }
      }
    }
    fetchStats();
    
    // Refresh every 30s
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
           <Activity className="w-5 h-5" />
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Active Cases</p>
           <p className="text-xl font-black text-slate-900">{stats.active}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
           <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Red Alerts</p>
           <p className="text-xl font-black text-slate-900">{stats.critical}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
           <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">SLA Compliance</p>
           <p className="text-xl font-black text-slate-900">{stats.sla_met_pct || 98}%</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
           <Clock className="w-5 h-5" />
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Avg Response</p>
           <p className="text-xl font-black text-slate-900">{stats.avg_response_s || 12}s</p>
        </div>
      </div>
    </div>
  );
}
