import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Stethoscope, Menu, X, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        isScrolled 
          ? "glass-navbar border-b border-white/20 py-3 shadow-premium" 
          : "bg-transparent py-6 md:py-8"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className={cn(
               "p-2 md:p-2.5 rounded-lg transition-all duration-500 shadow-lg", 
               isScrolled 
                ? "bg-slate-900 text-white" 
                : "bg-slate-900 text-white shadow-slate-900/10"
            )}>
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black tracking-tighter leading-none text-slate-900">
                DFO<span className="text-sky-500"> CLINIC.</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Clinical OS v2.0</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            {['About', 'Roles', 'Features'].map((item) => (
              <a 
                key={item}
                href={isHome ? `#${item.toLowerCase()}` : `/#${item.toLowerCase()}`} 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-slate-900 leading-none mb-1.5">{profile?.full_name || 'Clinician'}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{profile?.role || 'User'}</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/dashboard/${profile?.role || 'cro'}`)}
                  className="bg-slate-900 hover:bg-sky-600 text-white shadow-xl shadow-slate-900/10 px-8 py-5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </Button>
                <button 
                  onClick={handleSignOut}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Login
                </button>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/signup')} 
                  className="bg-slate-900 hover:bg-sky-600 text-white shadow-xl shadow-slate-900/10 px-8 py-5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all"
                >
                  Request Access
                </Button>
              </>
            )}
          </div>

          <button 
            className="lg:hidden p-2 text-slate-900 bg-slate-50 rounded-lg border border-slate-100 shadow-sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-2xl p-6 md:p-8 rounded-b-xl"
          >
            <div className="flex flex-col gap-6">
              {['About', 'Roles', 'Features'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-900 p-4 bg-slate-50 rounded-lg border border-slate-100 active:bg-sky-50 active:border-sky-100 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </a>
              ))}
              <div className="grid grid-cols-2 gap-4 mt-2">
                {user ? (
                   <Button className="col-span-2 py-6 rounded-md text-[11px] font-black bg-slate-900" onClick={() => { navigate(`/dashboard/${profile?.role}`); setIsMobileMenuOpen(false); }}>
                     Go to Dashboard
                   </Button>
                ) : (
                  <>
                    <Button variant="outline" className="py-6 rounded-md text-[11px] font-black" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Login</Button>
                    <Button className="py-6 rounded-md text-[11px] font-black bg-slate-900" onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}>Register</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
