import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, X, HeartPulse, Stethoscope, CheckCircle2, ChevronRight } from 'lucide-react';
import type { UserProfile } from '../../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AssignmentModalProps {
  patientName: string;
  onClose: () => void;
  onAssign: (userId: string, role: 'Nurse' | 'Doctor') => Promise<void>;
}

export function AssignmentModal({ patientName, onClose, onAssign }: AssignmentModalProps) {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<'all' | 'nurse' | 'doctor'>('all');
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStaff() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['nurse', 'doctor']);

      if (!error && data) {
        setStaff(data as UserProfile[]);
      }
      setLoading(false);
    }
    fetchStaff();
  }, []);

  const handleAssignClick = async (person: UserProfile) => {
    setAssigningId(person.id);
    await onAssign(person.id, (person.role.charAt(0).toUpperCase() + person.role.slice(1)) as 'Nurse' | 'Doctor');
    setAssigningId(null);
  };

  const filteredStaff = staff.filter(s => filter === 'all' || s.role === filter);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/60 z-10 relative flex flex-col max-h-[90vh]"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative">
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 rounded-full" />
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Assign Clinical Lead</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Case: <span className="text-sky-500">{patientName}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100 gap-1.5">
            {(['all', 'nurse', 'doctor'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase",
                  filter === r 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {r === 'all' ? 'All Staff' : `${r}s`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0 space-y-3">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Searching registry...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center">
                 <User className="w-10 h-10 mb-4 opacity-10" />
                 <p className="text-xs font-black uppercase tracking-widest">No matching clinicians available</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredStaff.map((person) => (
                  <motion.div 
                    layout
                    key={person.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleAssignClick(person)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all group cursor-pointer",
                      assigningId === person.id 
                        ? 'border-emerald-200 bg-emerald-50/50' 
                        : 'border-slate-100 hover:border-sky-300 hover:bg-sky-50/30'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                        person.role === 'doctor' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                      )}>
                        {person.role === 'doctor' ? <Stethoscope className="w-5 h-5" /> : <HeartPulse className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{person.full_name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                             person.role === 'doctor' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                           )}>
                             {person.role}
                           </span>
                           <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-emerald-400" />
                              Available
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <button className={cn(
                      "p-2 rounded-xl transition-all",
                      assigningId === person.id ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white opacity-0 group-hover:opacity-100'
                    )}>
                      {assigningId === person.id ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cancel Handover
          </button>
        </div>
      </motion.div>
    </div>
  );
}
