import { Users, Stethoscope, ShieldAlert, CheckCircle2, BrainCircuit, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function RoleBasedSystem() {
  const roles = [
    {
      title: "CRO",
      subtitle: "Control Role",
      icon: Users,
      color: "sky",
      bullets: [
        "View all threads (Green + Yellow + Red)",
        "See overall patient dashboard & metrics",
        "Assign threads to Nurses / Doctors",
        "Monitor risk levels & sentiment",
        "Track system performance (SLA, growth index)",
        "Manage patients, appointments, data",
        "Full access & control"
      ]
    },
    {
      title: "Nurse",
      subtitle: "Care Role",
      icon: Stethoscope,
      color: "amber",
      bullets: [
        "Handle Yellow threads (medium priority)",
        "View assigned patients only",
        "Chat & support patients",
        "Use AI suggestions (Sakhi assist)",
        "Escalate to Doctor if needed",
        "Add notes / observations",
        "Track own response performance"
      ]
    },
    {
      title: "Doctor",
      subtitle: "Critical Role",
      icon: ShieldAlert,
      color: "rose",
      bullets: [
        "Handle Red threads (emergency cases)",
        "View critical patient details & history",
        "Chat/respond immediately",
        "Make medical decisions",
        "Mark cases resolved",
        "Review nurse notes & escalations",
        "Focus only on high-risk patients"
      ]
    }
  ];

  return (
    <section id="roles" className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-16 md:mb-20">
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 text-slate-600 text-[9px] font-black uppercase tracking-widest mb-6"
           >
             <BrainCircuit className="w-3.5 h-3.5" />
             <span>Collaborative Intelligence</span>
           </motion.div>
           <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
             Specialized Clinical <br className="hidden sm:block" /> Roles. <span className="text-slate-400">Perfect Sync.</span>
           </h2>
           <p className="text-base md:text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
             A structured workflow ensuring the right clinical staff handles the right cases at the right time. Maximum SLA compliance, zero patient neglect.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {roles.map((role, idx) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl border border-slate-100 shadow-premium p-8 md:p-10 group hover:border-slate-300 transition-all flex flex-col"
            >
              <div className={cn(
                "w-14 h-14 rounded-lg flex items-center justify-center mb-10 transition-transform group-hover:scale-110 shadow-lg",
                role.color === 'sky' ? 'bg-sky-50 text-sky-600 shadow-sky-100' :
                role.color === 'amber' ? 'bg-amber-50 text-amber-600 shadow-amber-100' :
                'bg-rose-50 text-rose-600 shadow-rose-100'
              )}>
                <role.icon className="w-7 h-7" />
              </div>
              
              <div className="mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{role.title}</h3>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  role.color === 'sky' ? 'text-sky-500' :
                  role.color === 'amber' ? 'text-amber-500' :
                  'text-rose-500'
                )}>{role.subtitle}</p>
              </div>

              <ul className="space-y-4 mb-12 flex-1">
                {role.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex gap-4 text-[13px] md:text-sm font-medium text-slate-600 leading-snug">
                    <CheckCircle2 className="w-4 h-4 text-slate-200 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Priority</span>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase text-white shadow-sm",
                  role.color === 'sky' ? 'bg-sky-500' :
                  role.color === 'amber' ? 'bg-amber-500' :
                  'bg-rose-500'
                )}>
                  {role.color === 'sky' ? 'Global' : role.color === 'amber' ? 'Medium' : 'Critical'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Summary Line - Enhanced Responsiveness */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-24 bg-slate-900 rounded-xl p-8 md:p-12 flex flex-col xl:flex-row items-center justify-between gap-10 shadow-2xl"
        >
           <div className="flex items-center gap-6 w-full xl:w-auto">
              <div className="p-4 bg-sky-500/10 rounded-lg shrink-0">
                 <Activity className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                 <p className="text-white font-black text-xl md:text-2xl tracking-tight">One-Line Understanding</p>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">DFO Operational Hierarchy</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 w-full xl:w-auto">
              {[
                { label: "CRO → Manages All", color: "bg-sky-500", text: "text-sky-100" },
                { label: "Nurse → Medium cases", color: "bg-amber-500", text: "text-amber-100" },
                { label: "Doctor → Critical cases", color: "bg-rose-500", text: "text-rose-100" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className={cn("w-2 h-2 rounded-full shrink-0", item.color)} />
                  <span className={cn("text-[11px] font-black uppercase tracking-widest", item.text)}>{item.label}</span>
                </div>
              ))}
           </div>
        </motion.div>
      </div>
    </section>
  );
}
