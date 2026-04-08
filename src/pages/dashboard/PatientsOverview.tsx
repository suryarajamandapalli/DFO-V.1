import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import type { Patient } from '../../lib/types';
import { 
  Users, 
  Baby, 
  Activity, 
  Search, 
  Filter, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export function PatientsOverview() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchPatients() {
      const { data, error } = await supabase
        .from('dfo_patients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setPatients(data as Patient[]);
      }
      setLoading(false);
    }
    fetchPatients();
  }, []);

  const filtered = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone_number?.includes(searchTerm)
  );

  return (
    <DashboardLayout activeMenu="patients">
      <div className="p-4 sm:p-8 flex flex-col h-full bg-slate-50/10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Medical Census</h1>
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-[0.25em] flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
               Clinical Patient Records Active
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[300px] focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/10 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or contact..." 
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* STATS BANNERS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
           {[
             { label: 'Total Enrolled', value: patients.length, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
             { label: 'High Risk Coverage', value: '12%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
             { label: 'Journey Active', value: patients.filter(p => p.journey_stage === 'pregnant').length, icon: Baby, color: 'text-indigo-600', bg: 'bg-indigo-50' },
           ].map((stat, idx) => (
             <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                <div className={`p-4 ${stat.bg} ${stat.color} rounded-xl`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                   <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        {/* PATIENTS TABLE/GRID */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <div className="h-full flex flex-col">
            <div className="px-8 py-5 border-b border-slate-50 grid grid-cols-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <div className="col-span-2">Patient Details</div>
               <div>Journey Stage</div>
               <div>Progress</div>
               <div>Medical Intel</div>
               <div className="text-right">Action</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {loading ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <Activity className="w-12 h-12 animate-spin mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Compiling Patient Index...</span>
                 </div>
               ) : filtered.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <Users className="w-16 h-16 mb-6" />
                    <p className="text-sm font-bold text-slate-400">No medical records found matches your criteria.</p>
                 </div>
               ) : (
                 filtered.map((p, idx) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     key={p.id} 
                     className="px-8 py-5 grid grid-cols-6 items-center border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                   >
                     <div className="col-span-2 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                           {p.full_name?.charAt(0) || <Activity className="w-5 h-5" />}
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors">{p.full_name}</p>
                           <p className="text-[10px] font-bold text-slate-400">{p.phone_number}</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            p.journey_stage === 'pregnant' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                            p.journey_stage === 'trying_to_conceive' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                           {p.journey_stage.replace(/_/g, ' ')}
                        </span>
                     </div>

                     <div className="flex items-center gap-4 pr-10">
                        <span className="text-xs font-black text-slate-700 min-w-[30px]">{p.pregnancy_stage || 0}w</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-sky-500/80 rounded-full" style={{ width: `${((p.pregnancy_stage || 0) / 40) * 100}%` }} />
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-1.5">
                        {p.medical_history && (p.medical_history as string[]).slice(0, 2).map((h, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded border border-slate-200 uppercase truncate max-w-[80px]">
                            {h}
                          </span>
                        ))}
                        {(!p.medical_history || (p.medical_history as string[]).length === 0) && (
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Clear History</span>
                        )}
                     </div>

                     <div className="text-right">
                        <button className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                           <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                   </motion.div>
                 ))
               )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
