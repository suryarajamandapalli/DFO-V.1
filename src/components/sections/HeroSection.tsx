import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { ShieldCheck, Activity, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const slides = [
  {
    tag: "Clinical OS v2.0 Platform",
    title: "Modern Ops for Clinical Triage.",
    desc: "Automated intake flows, real-time risk telemetry, and unified role-based command for modern parenthood care clinics.",
    image: "/hero-doctor.png",
    stat: "100% SLA"
  },
  {
    tag: "Real-time Telemetry",
    title: "Intelligence Beyond Support.",
    desc: "Identify critical high-risk cases instantly with our hybrid sentiment-BERT engine designed for clinical precision.",
    image: "/hero-telemetry.png",
    stat: "1.2ms Latency"
  }
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-20 pb-12 overflow-hidden bg-white">
      {/* Background stays static/subtle */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-sky-50/50 to-white -z-20" />
      
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative z-10 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`slide-content-${current}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-900/[0.03] border border-slate-900/5 text-slate-900 text-[10px] font-black uppercase tracking-[0.15em] mb-10">
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  <span>{slides[current].tag}</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black text-slate-900 leading-[0.95] mb-8 tracking-tighter">
                  {slides[current].title.split(' ').map((word, i) => (
                    <span key={i} className={word.toLowerCase() === 'clinical' || word.toLowerCase() === 'beyond' ? 'text-sky-500' : ''}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>

                <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-xl mx-auto lg:mx-0 font-medium leading-[1.6] tracking-tight">
                  {slides[current].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
              <Button 
                size="lg" 
                onClick={() => user ? navigate(`/dashboard/${profile?.role || 'cro'}`) : navigate('/login')}
                className="w-full sm:w-auto h-16 px-10 bg-slate-900 hover:bg-slate-800 text-white shadow-2xl rounded-md text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
              >
                {user ? 'Enter Control Tower' : 'Launch Dashboard'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <div className="flex items-center gap-4">
                 <button onClick={prevSlide} className="p-4 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-all">
                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                 </button>
                 <button onClick={nextSlide} className="p-4 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-all">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                 </button>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
               {slides.map((_, i) => (
                 <button 
                   key={i} 
                   onClick={() => setCurrent(i)}
                   className={`h-1 rounded-full transition-all duration-500 ${current === i ? 'w-12 bg-sky-500' : 'w-4 bg-slate-200 hover:bg-slate-300'}`}
                 />
               ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={`slide-image-${current}`}
                initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.05, rotate: -1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="relative rounded-lg border-2 border-slate-900/5 overflow-hidden shadow-2xl bg-white">
                    <img 
                      src={slides[current].image} 
                      alt={slides[current].title} 
                      className="w-full h-[600px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
                    
                    <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-xl px-6 py-3 rounded-md border border-white/40 shadow-xl">
                       <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{slides[current].stat}</span>
                    </div>
                </div>

                {/* Fixed Decorative Elements */}
                <div className="absolute -top-12 -left-12 bg-sky-500/10 p-12 rounded-full blur-[80px] -z-10 animate-pulse" />
              </motion.div>
            </AnimatePresence>
            
            {/* Floating Live Indicator */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-lg shadow-bespoke border border-slate-50 flex items-center gap-4 z-20">
               <div className="w-12 h-12 rounded-lg bg-sky-500 text-white flex items-center justify-center">
                  <Activity className="w-6 h-6 animate-pulse" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Protocol Delta</p>
                  <p className="text-[9px] font-bold text-slate-400">SYNCED: CLUSTER HYDRA v2</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
