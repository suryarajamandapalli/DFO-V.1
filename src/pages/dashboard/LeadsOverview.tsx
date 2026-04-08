import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { 
  Users, 
  Phone, 
  MapPin, 
  Calendar,
  Search, 
  Filter, 
  ChevronRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ClinicLead {
  id: string;
  name: string;
  phone: string;
  source: string;
  inquiry: string;
  status: string;
  problem: string;
  location: string;
  created_at: string;
}

export function LeadsOverview() {
  const [leads, setLeads] = useState<ClinicLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('sakhi_clinic_leads')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setLeads(data as ClinicLead[]);
      }
      setLoading(false);
    }
    fetchLeads();
  }, []);

  const filtered = leads.filter(l => 
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.phone?.includes(searchTerm)
  );

  return (
    <DashboardLayout activeMenu="leads">
      <div className="p-4 sm:p-8 flex flex-col h-full bg-slate-50/10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Acquisition Desk</h1>
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-[0.25em] flex items-center gap-3">
               <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
               Clinical Leads Monitoring Active
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 min-w-[300px] focus-within:border-sky-400 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-white rounded-lg border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-5 mb-8">
           {[
             { label: 'Total Inflow', value: leads.length, icon: Inbox, color: 'text-sky-600', bg: 'bg-sky-50' },
             { label: 'Conversion Rate', value: '24%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
             { label: 'New Today', value: leads.filter(l => new Date(l.created_at) >= new Date(new Date().setHours(0,0,0,0))).length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
             { label: 'Walk-Ins', value: leads.filter(l => l.source === 'Walk-In').length, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           ].map((stat, idx) => (
             <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl`}>
                   <stat.icon className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-xl font-black text-slate-900">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        {/* LEADS LIST */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-y-auto custom-scrollbar">
           <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10">
                 <tr className="border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Lead Details</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Contact</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Source & Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Clinical Inquiry</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans text-right">Action</th>
                 </tr>
              </thead>
              <tbody>
                 {loading ? (
                   <tr>
                     <td colSpan={5} className="py-24 text-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block">
                           <TrendingUp className="w-8 h-8 text-sky-500" />
                        </motion.div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Compiling Acquisition Data...</p>
                     </td>
                   </tr>
                 ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center opacity-40">
                         <Inbox className="w-12 h-12 mx-auto mb-4" />
                         <p className="text-sm font-bold text-slate-400">No leads found matching your criteria.</p>
                      </td>
                    </tr>
                 ) : (
                    filtered.map((l, idx) => (
                       <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                                   {l.name?.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-900">{l.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400">{l.location || 'Remote'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                <Phone className="w-3.5 h-3.5" />
                                {l.phone}
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex flex-col gap-1.5">
                                <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-[9px] font-black uppercase tracking-widest border border-sky-100 rounded-lg inline-block w-fit">
                                   {l.source}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                   Status: {l.status}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-5 max-w-xs">
                             <p className="text-xs font-bold text-slate-600 truncate">{l.inquiry || 'Direct Clinical Interest'}</p>
                             <p className="text-[9px] font-medium text-slate-400 mt-1 italic line-clamp-1">{l.problem}</p>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                                <ChevronRight className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
