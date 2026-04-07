import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Thread, UserProfile } from '../../lib/types';
import { 
  User, 
  Clock, 
  MapPin, 
  History, 
  ShieldCheck, 
  Calendar,
  Stethoscope,
  HeartPulse,
  Mail,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { SLATimer } from './SLATimer';

interface ThreadInfoPanelProps {
  thread: Thread;
}

export function ThreadInfoPanel({ thread }: ThreadInfoPanelProps) {
  const [assignedStaff, setAssignedStaff] = useState<UserProfile | null>(null);
  const [slaData, setSlaData] = useState<any>(null);

  useEffect(() => {
    async function fetchDetails() {
      if (thread.assigned_to) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', thread.assigned_to)
          .single();
        if (data) setAssignedStaff(data as UserProfile);
      } else {
        setAssignedStaff(null);
      }

      // Fetch SLA
      const { data: sla } = await supabase
        .from('sla_tracking')
        .select('*')
        .eq('thread_id', thread.id)
        .single();
      if (sla) setSlaData(sla);
    }
    fetchDetails();
  }, [thread]);

  const riskColors = {
    red: 'text-rose-600 bg-rose-50 border-rose-100',
    yellow: 'text-amber-600 bg-amber-50 border-amber-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100'
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6 space-y-8">
      {/* 1. CLINICIAN DETAILS */}
      <section>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assisting Clinician</h3>
        {assignedStaff ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "p-2 rounded-lg",
                assignedStaff.role === 'doctor' ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600'
              )}>
                {assignedStaff.role === 'doctor' ? <Stethoscope className="w-5 h-5" /> : <HeartPulse className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{assignedStaff.full_name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{assignedStaff.role} On Duty</p>
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
          <div className="bg-slate-50 py-6 px-4 rounded-2xl border border-dashed border-slate-200 text-center">
            <User className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-bold text-slate-400">WAITING FOR ASSIGNMENT</p>
          </div>
        )}
      </section>

      {/* 2. PATIENT CONTEXT */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Patient Intelligence</h3>
          <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border uppercase", riskColors[thread.risk_level])}>
            {thread.risk_level} Risk
          </span>
        </div>
        <div className="space-y-4">
           <div className="flex items-center justify-between group cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Primary Subject</span>
                <span className="text-sm font-black text-slate-900">{thread.patient_name}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
           </div>

           <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                 <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <History className="w-3.5 h-3.5" />
                    <span>Sentiment Score</span>
                 </div>
                 <span className={cn(
                   "font-black px-1.5 py-0.5 rounded",
                   thread.sentiment_score < -0.5 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
                 )}>
                   {thread.sentiment_score.toFixed(2)}
                 </span>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", thread.sentiment_score < -0.5 ? "bg-rose-500" : "bg-emerald-500")}
                  style={{ width: `${((thread.sentiment_score + 1) / 2) * 100}%` }}
                />
              </div>
           </div>
        </div>
      </section>

      {/* 3. SESSION METADATA */}
      <section className="flex-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Session Metadata</h3>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
           {slaData && (
             <div className="pb-4 border-b border-slate-50">
               <SLATimer deadline={slaData.response_deadline} status={slaData.status} />
             </div>
           )}

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  <span>Date Created</span>
                </div>
                <p className="text-xs font-bold text-slate-800">{format(parseISO(thread.created_at), 'MMM dd, yyyy')}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  <span>Triage Time</span>
                </div>
                <p className="text-xs font-bold text-slate-800">{format(parseISO(thread.created_at), 'HH:mm:ss')}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  <span>Channel</span>
                </div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  JanmaSethu Web
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <History className="w-3 h-3" />
                  <span>Engagement</span>
                </div>
                <p className="text-xs font-bold text-slate-800 tracking-tight leading-tight">Human Priority</p>
              </div>
           </div>
        </div>
      </section>

      <div className="pt-4 mt-auto opacity-40 text-center">
         <p className="text-[9px] font-black text-slate-400 tracking-[0.2em]">PLATFORM SECURED BY DFO v1.4.2</p>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
