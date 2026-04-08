import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Thread, UserProfile, Patient } from '../../lib/types';
import { 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Calendar,
  Stethoscope,
  HeartPulse,
  Mail,
  Smartphone,
  Baby,
  BrainCircuit,
  Activity,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

interface ThreadInfoPanelProps {
  thread: Thread;
}

export function ThreadInfoPanel({ thread }: ThreadInfoPanelProps) {
  const [assignedStaff, setAssignedStaff] = useState<UserProfile | null>(null);
  const [patientData, setPatientData] = useState<any | null>(null);
  const [riskReason, setRiskReason] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeepIntel() {
      // 1. Fetch Staff
      if (thread.assigned_user_id) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', thread.assigned_user_id)
          .single();
        if (data) setAssignedStaff(data as UserProfile);
      } else {
        setAssignedStaff(null);
      }

      // 2. Fetch Patient Profile
      if (thread.user_id) {
        let query = supabase.from('dfo_patients').select('*');
        query = query.eq('id', thread.user_id);
        
        const { data: patient } = await query.single();
        if (patient) setPatientData(patient as Patient);
      }

      // 3. Fetch Risk Reasoning (from dfo_risk_logs)
      const { data: riskLog } = await supabase
        .from('dfo_risk_logs')
        .select('reasoning')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (riskLog) setRiskReason(riskLog.reasoning);

    }
    fetchDeepIntel();
  }, [thread]);

  const riskColors = {
    red: 'text-rose-600 bg-rose-50 border-rose-100',
    yellow: 'text-amber-600 bg-amber-50 border-amber-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100'
  };

  const currentJourney = patientData?.journey_stage || (thread.metadata as any)?.journey_stage || 'pregnant';

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6 space-y-7">
      {/* 1. CLINICIAN DETAILS */}
      <section>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operational Status</h3>
        <div className="flex items-center justify-between mb-3 px-1">
           <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", thread.ownership === 'AI' ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse')} />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{thread.ownership || 'AI'} CONTROL</span>
           </div>
           <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">{thread.channel || 'Web'}</span>
           </div>
        </div>

        {assignedStaff ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                assignedStaff.role === 'doctor' ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600'
              )}>
                {assignedStaff.role === 'doctor' ? <Stethoscope className="w-5 h-5" /> : <HeartPulse className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">{assignedStaff.full_name}</p>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{assignedStaff.role}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-50">
               <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91 990XX XXX88</span>
               </div>
               <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{assignedStaff.full_name?.toLowerCase().replace(' ', '.')}@jsclinics.com</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-indigo-50/50 py-5 px-4 rounded-2xl border border-dashed border-indigo-100 text-center">
            <BrainCircuit className="w-6 h-6 text-indigo-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-tight">AI Agent Managing Thread</p>
          </div>
        )}
      </section>

      {/* 2. PATIENT JOURNEY INTELLIGENCE */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Journey Intelligence</h3>
          <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border uppercase", riskColors[thread.status])}>
            {thread.status} Risk
          </span>
        </div>
        
        <div className="space-y-4">
            {/* Journey Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                {currentJourney === 'pregnant' ? <Baby className="w-12 h-12" /> : <Activity className="w-12 h-12" />}
              </div>
              
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Stage & Progress</p>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 border border-sky-100/50">
                    {currentJourney === 'pregnant' ? <Baby className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-900 leading-none mb-1 capitalize">
                      {currentJourney.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest leading-none">
                      Operational Lead
                    </p>
                  </div>
                </div>

                {(patientData?.pregnancy_stage || (thread.metadata as any)?.pregnancy_stage) ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">
                        {patientData?.pregnancy_stage || (thread.metadata as any)?.pregnancy_stage} Weeks Completed
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Term: 40w
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((patientData?.pregnancy_stage || (thread.metadata as any)?.pregnancy_stage || 0) / 40) * 100}%` }}
                        className="h-full bg-sky-500 rounded-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 inline-block">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Onboarding</span>
                  </div>
                )}
              </div>
            </div>

           {/* Risk Reasoning */}
           {riskReason && (
             <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
               <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Clinical Logic</span>
               </div>
               <p className="text-xs text-rose-900 font-medium leading-relaxed italic">
                 "{riskReason}"
               </p>
             </div>
           )}

           {/* Medical History Snippet */}
           {patientData?.medical_history && patientData.medical_history.length > 0 && (
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
               <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Past History</span>
               </div>
               <div className="flex flex-wrap gap-1.5">
                  {patientData.medical_history.slice(0, 3).map((item: string, idx: number) => (
                    <span key={idx} className="text-[9px] font-bold bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                      {item}
                    </span>
                  ))}
               </div>
             </div>
           )}
        </div>
      </section>

      {/* 3. SESSION METADATA */}
      <section className="flex-1 min-h-0">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Platform Metadata</h3>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            {(thread.metadata as any)?.sla_breached && (
             <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-rose-600 uppercase">SLA BREACHED</span>
                <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
             </div>
           )}

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  <span>Initiated</span>
                </div>
                <p className="text-xs font-bold text-slate-800">{format(parseISO(thread.created_at), 'MMM dd')}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  <span>Last Hub Sync</span>
                </div>
                <p className="text-xs font-bold text-slate-800">{format(new Date(), 'HH:mm')}</p>
              </div>
           </div>
        </div>
      </section>

      <div className="pt-4 opacity-30 text-center pb-2">
         <p className="text-[9px] font-black text-slate-400 tracking-[0.2em]">DFO IQ v2.0 • SAKHI CORE</p>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
