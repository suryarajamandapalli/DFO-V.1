import { Network, Activity, Clock, Users, Shield, Calendar, Stethoscope, FileText, History, Bell, BarChart3, ChevronRight, MoveRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Network, title: "Control Tower", desc: "Intelligence and monitoring layer that analyzes conversations, detects risks, and enforces rules." },
  { icon: Activity, title: "Hybrid Risk Engine", desc: "Analyzes sentiment, keywords, and BERT models alongside patient history to assign clinical risk." },
  { icon: Clock, title: "SLA Monitoring", desc: "Tracks response times for critical cases and escalates automatically if untouched." },
  { icon: Users, title: "Thread Assignment", desc: "Smart routing of cases manually by CRO or automatically based on workload and role." },
  { icon: Shield, title: "Human Takeover", desc: "Locks the thread when a doctor takes control, instantly disabling AI responses to avoid conflicts." },
  { icon: Calendar, title: "Appointment Lifecycle", desc: "End-to-end handling of bookings, rescheduling, and automated missed-consultation detection." },
  { icon: Stethoscope, title: "Consultation Workflow", desc: "Dedicated interface for doctors to start, manage, and close consultations with clinical notes." },
  { icon: FileText, title: "Prescription Engine", desc: "Generates and stores structured prescriptions with medicine, dosage, and duration tracking." },
  { icon: History, title: "Deep Patient History", desc: "Unified timeline of all past interactions, consultations, prescriptions, and reports." },
  { icon: Bell, title: "Notification System", desc: "Automated alerts sent via WhatsApp & dashboard to keep patients and doctors synchronized." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time insights into system health, response times, and clinical load distribution." },
];

export function CoreFeatures() {
  return (
    <section id="features" className="py-24 md:py-32 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-16 md:mb-24">
           <motion.p 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 mb-4"
             >
               Full Capability Suite
             </motion.p>
           <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
             The Foundation of <br className="hidden sm:block" /> <span className="text-slate-300">Modern Clinical Ops.</span>
           </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-px bg-slate-100 border border-slate-100 overflow-hidden rounded-lg shadow-premium">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white p-8 md:p-10 group hover:bg-slate-50 transition-colors cursor-default"
            >
              <div className="w-14 h-14 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-[11px] md:text-sm font-black text-slate-900 uppercase tracking-[0.15em] mb-4 flex items-center justify-between">
                {feature.title}
                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs md:text-sm font-semibold text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">
                {feature.desc}
              </p>
            </motion.div>
          ))}
          
          <div className="bg-slate-900 p-8 md:p-10 flex flex-col justify-between group cursor-pointer overflow-hidden relative min-h-[250px]">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <Network className="w-48 h-48 text-white" />
             </div>
             <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight mb-4 tracking-tight">Custom <br /> Deployment?</h3>
                <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed max-w-[180px]">
                   Partner with our clinical engineering team for bespoke protocols.
                </p>
             </div>
             <button className="relative z-10 mt-8 text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Contact Ops <MoveRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </section>
  );
}
