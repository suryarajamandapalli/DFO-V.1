import { Card } from '../ui/Card';
import { HeartPulse, Shield, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function AboutSection() {
  const features = [
    {
      title: "Intelligent Triage",
      desc: "Continuous support powered by clinical intelligence that provides immediate, localized guidance and filters high-risk queries in real-time.",
      icon: MessageCircle,
      delay: 0.1
    },
    {
      title: "Verified Connections",
      desc: "More than just an AI. We bridge the critical gap between patients and medical professionals when urgency or empathy is required.",
      icon: HeartPulse,
      delay: 0.2
    },
    {
      title: "Language Agnostic",
      desc: "Care beyond barriers. Our platform interprets intent and emotion across diverse linguistic landscapes to ensure inclusivity.",
      icon: Shield,
      delay: 0.3
    }
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start lg:items-end mb-16 md:mb-24">
          <div className="w-full lg:w-2/3">
             <motion.p 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 mb-4"
             >
               Mission Statement
             </motion.p>
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]"
             >
               The Intelligence Layer for <br className="hidden sm:block" /> <span className="text-slate-300">Clinical Operations.</span>
             </motion.h2>
          </div>
          <div className="w-full lg:w-1/3">
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              JanmaSethu is not just a portal—it's a clinical OS. We elevate healthcare providers with the tools to manage 10x the patient volume without sacrificing care quality.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((f, i) => (
            <Card key={i} delay={f.delay} className="group hover:bg-slate-900 transition-all duration-500 py-12 px-8 rounded-xl">
              <div className="w-16 h-16 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 mb-8 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 shadow-sm">
                <f.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-white transition-colors">{f.title}</h3>
              <p className="text-sm md:text-base text-slate-500 mb-10 font-medium leading-relaxed group-hover:text-slate-400 transition-colors">
                {f.desc}
              </p>
              <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-sky-600 group-hover:text-sky-400 transition-colors">
                Learn Methodology <ArrowRight className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
