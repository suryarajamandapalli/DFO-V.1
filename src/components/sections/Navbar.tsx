import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Stethoscope, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If not on home page, change hrefs to routing to home instead of hash links locally
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className={cn("p-2 rounded-lg transition-colors", isScrolled ? "bg-sky-100 text-sky-600" : "bg-white/20 text-white backdrop-blur-sm")}>
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className={cn("text-xl font-bold tracking-tight transition-colors", isScrolled ? "text-slate-800" : "text-white")}>
              Janma<span className={isScrolled ? "text-sky-500" : "text-sky-100"}>Sethu</span>
            </span>
            <span className={cn("hidden md:flex text-xs font-semibold px-2 py-1 rounded-full ml-2 transition-colors", 
              isScrolled ? "bg-slate-100 text-slate-600" : "bg-white/20 text-white backdrop-blur-sm"
            )}>DFO</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href={isHome ? "#about" : "/#about"} className={cn("text-sm font-medium transition-colors hover:text-sky-400", isScrolled ? "text-slate-600" : "text-white/90")}>About</a>
            <a href={isHome ? "#features" : "/#features"} className={cn("text-sm font-medium transition-colors hover:text-sky-400", isScrolled ? "text-slate-600" : "text-white/90")}>Features</a>
            <a href={isHome ? "#roles" : "/#roles"} className={cn("text-sm font-medium transition-colors hover:text-sky-400", isScrolled ? "text-slate-600" : "text-white/90")}>Platform Roles</a>
            <a href={isHome ? "#intelligence" : "/#intelligence"} className={cn("text-sm font-medium transition-colors hover:text-sky-400", isScrolled ? "text-slate-600" : "text-white/90")}>Intelligence</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2">
                  <span className={cn("text-sm font-bold", isScrolled ? "text-slate-900" : "text-white")}>{profile?.full_name || 'Account'}</span>
                  <span className={cn("text-[10px] font-medium uppercase tracking-wider opacity-70", isScrolled ? "text-slate-500" : "text-white")}>{profile?.role || 'Clinician'}</span>
                </div>
                <Button 
                  size="sm" 
                  variant={isScrolled ? "ghost" : "outline"}
                  onClick={() => navigate(`/dashboard/${profile?.role || 'cro'}`)}
                  className={cn("gap-2", !isScrolled ? "text-white border-white/30 hover:bg-white/20 bg-transparent" : "")}
                >
                  <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                </Button>
                <button 
                  onClick={handleSignOut}
                  className={cn("p-2 rounded-full transition-colors", isScrolled ? "text-slate-400 hover:text-rose-500 hover:bg-rose-50" : "text-white/60 hover:text-white hover:bg-white/10")}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Button variant={isScrolled ? "ghost" : "outline"} size="sm" onClick={() => navigate('/signup')} className={!isScrolled ? "text-white border-white/30 hover:bg-white/20 bg-transparent" : "text-slate-600"}>Request Access</Button>
                <Button size="sm" onClick={() => navigate('/login')} className={!isScrolled ? "bg-white text-sky-600 hover:bg-sky-50" : ""}>Login to DFO</Button>
              </>
            )}
          </div>

          <button 
            className={cn("md:hidden transition-colors", isScrolled ? "text-slate-600" : "text-white")}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 px-4 py-4 mt-3 shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {user && (
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{profile?.full_name}</p>
                    <p className="text-xs text-slate-500 uppercase">{profile?.role}</p>
                  </div>
                </div>
              )}
              <a href="#about" className="text-slate-600 font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              <a href="#features" className="text-slate-600 font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
              <a href="#roles" className="text-slate-600 font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Platform Roles</a>
              <a href="#intelligence" className="text-slate-600 font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Intelligence</a>
              <div className="h-px bg-slate-100 my-2"></div>
              {user ? (
                <>
                  <Button className="w-full justify-center gap-2" onClick={() => { navigate(`/dashboard/${profile?.role}`); setIsMobileMenuOpen(false); }}>
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Button>
                  <Button variant="outline" className="w-full justify-center gap-2 text-rose-600 border-rose-100" onClick={handleSignOut}>
                    <LogOut className="w-5 h-5" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full justify-center" onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}>Request Access</Button>
                  <Button className="w-full justify-center" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Login to DFO</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
