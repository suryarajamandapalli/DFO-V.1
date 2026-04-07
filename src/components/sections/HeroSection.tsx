import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { ShieldCheck, Activity, ArrowRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function HeroSection() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
      {/* Video Background Layer */}
      <div className="absolute inset-0 w-full h-full z-0 bg-slate-900">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          poster="https://images.unsplash.com/photo-1532938911079-1b06ac7ce122?auto=format&fit=crop&q=80&w=2070"
          className="w-full h-full object-cover"
        >
          {/* Main video: Doctor/Patient Sentiment provided by user */}
          <source src="https://www.pexels.com/download/video/5406018/" type="video/mp4" />
        </video>
        
        {/* Simple clean dark overlay to ensure text readability without ruining video colors */}
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center mt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 tracking-tight drop-shadow-md"
          >
            Digital Front Office for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-300 drop-shadow-sm">
              Modern Parenthood Care
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-2xl text-sky-50 mb-10 max-w-3xl mx-auto font-light leading-relaxed drop-shadow"
          >
            A clinical-grade operational conversations, monitor risk levels, and ensure continuous care with intelligent triaging.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-sky-100 font-medium"
          >
            <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700/50 shadow-lg">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span>HIPAA Compliant UI</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700/50 shadow-lg">
              <Activity className="w-5 h-5 text-sky-400" />
              <span>Real-time Risk Monitoring</span>
            </div>

            <Button 
              size="lg" 
              onClick={() => user ? navigate(`/dashboard/${profile?.role || 'cro'}`) : navigate('/login')}
              className="w-full sm:w-auto gap-2 bg-sky-500 hover:bg-sky-400 text-white shadow-[0_0_30px_rgb(14,165,233,0.5)] border border-sky-400 transition-all font-semibold px-8 py-6 text-lg rounded-xl"
            >
              {user ? 'Go to Dashboard' : 'Login to DFO'}
              <ArrowRight className="w-6 h-6" />
            </Button>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
