import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { User, X, HeartPulse, Stethoscope } from 'lucide-react';
import type { UserProfile } from '../../lib/types';

interface AssignmentModalProps {
  patientName: string;
  onClose: () => void;
  onAssign: (userId: string, role: 'nurse' | 'doctor') => Promise<void>;
}

export function AssignmentModal({ patientName, onClose, onAssign }: AssignmentModalProps) {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState<'all' | 'nurse' | 'doctor'>('all');

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

  const filteredStaff = staff.filter(s => filter === 'all' || s.role === filter);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Assign Clinician</h3>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">Thread: {patientName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-white">
          <div className="flex gap-2 mb-6">
            {(['all', 'nurse', 'doctor'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  filter === r 
                    ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-500/20' 
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="py-12 text-center text-slate-400 animate-pulse">
                <User className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <span>Finding active clinicians...</span>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                <span>No available {filter !== 'all' ? filter : 'clinical'} staff found.</span>
              </div>
            ) : (
              filteredStaff.map((person) => (
                <div 
                  key={person.id}
                  onClick={() => onAssign(person.id, person.role as 'nurse' | 'doctor')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      person.role === 'doctor' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {person.role === 'doctor' ? <Stethoscope className="w-4 h-4" /> : <HeartPulse className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{person.full_name}</h4>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{person.role}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-sky-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                    ASSIGN
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1 bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
