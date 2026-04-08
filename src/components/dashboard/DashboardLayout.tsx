import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { 
  LogOut, 
  MessageSquare, 
  BarChart3, 
  ShieldAlert, 
  HeartPulse, 
  Stethoscope,
  Search,
  Bell,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  UserPlus,
  Lock,
  Target,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
  rightPanel?: React.ReactNode;
}

export function DashboardLayout({ children, activeMenu = 'dashboard', rightPanel }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const getMenuItems = () => {
    const isAdmin = profile?.role === 'cro';
    const isNurse = profile?.role === 'nurse';

    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${profile?.role}` },
      { id: 'patients', label: 'My Patients', icon: Users, path: `/dashboard/${profile?.role}/patients` },
      { id: 'leads', label: 'Inquiry Desk', icon: MapPin, path: `/dashboard/${profile?.role}/leads` },
      { id: 'inbox', label: 'Inbox', icon: MessageSquare, path: `/dashboard/${profile?.role}${isAdmin ? '/inbox' : ''}` },
    ];

    if (isNurse) {
      return [
        ...baseItems,
        { id: 'escalations', label: 'Escalations', icon: ShieldAlert, path: '#' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '#' },
        { id: 'consultations', label: 'Consultations', icon: HeartPulse, path: '#' },
      ];
    }

    if (isAdmin) {
      return [
        ...baseItems,
        { id: 'risk', label: 'Risk Monitor', icon: ShieldAlert, path: '#' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '#' },
        { id: 'consultations', label: 'Consultations', icon: HeartPulse, path: '#' },
        { id: 'documents', label: 'Documents', icon: FileText, path: '#' },
        { id: 'engagement', label: 'Engagement', icon: Target, path: '#' },
        { id: 'crm', label: 'Leads CRM', icon: UserPlus, path: '#' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '#' },
        { id: 'admin', label: 'Admin / Compliance', icon: Lock, path: '#' },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f172a] text-white">
      <div className="p-8 grow overflow-y-auto custom-scrollbar">
        <div 
          className="flex items-center gap-3 mb-12 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
           <div className="bg-white p-2 rounded-xl text-[#0f172a] shadow-lg shadow-white/5 group-hover:scale-110 transition-transform">
             <Stethoscope className="w-6 h-6 stroke-[2.5]" />
           </div>
           <span className="text-2xl font-black tracking-tighter">DFOCLINIC</span>
        </div>

        <nav className="space-y-1.5 pb-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm transition-all group relative overflow-hidden",
                activeMenu === item.id 
                  ? "bg-slate-800/80 text-white font-black shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              )}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <item.icon className={cn(
                  "w-[18px] h-[18px] transition-colors", 
                  activeMenu === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="tracking-tight text-left">{item.label}</span>
              </div>
              {activeMenu === item.id && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" 
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-8 border-t border-slate-800/40 shrink-0">
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-xs font-black text-slate-500 hover:text-white hover:bg-rose-500/10 transition-all uppercase tracking-[0.2em]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#0f172a] flex overflow-hidden font-sans selection:bg-sky-100">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 bg-[#0f172a] z-40 relative">
        <SidebarContent />
      </aside>

      {/* 2. MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-[280px] overflow-hidden shadow-2xl"
            >
              <SidebarContent />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-8 right-4 p-2 text-slate-400 hover:text-white z-20"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN WORKSPACE (Light background on top of dark root to hide gaps) */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative bg-[#F9FAFB]">
        {/* GLOBAL HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

          <div className="flex-1 max-w-xl group relative">
            <div className={cn(
               "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 border",
               searchFocused 
                 ? "bg-white border-sky-400 shadow-sm scale-[1.01]" 
                 : "bg-slate-50/50 border-slate-100 group-hover:border-slate-200"
            )}>
              <Search className={cn("w-4 h-4 transition-colors", searchFocused ? "text-sky-500" : "text-slate-400")} />
              <input 
                type="text" 
                placeholder="Universal Search..." 
                className="bg-transparent border-none outline-none text-xs font-semibold text-slate-700 w-full placeholder:text-slate-400/80"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#fcfdfe]">
             {children}
          </main>
          
          {rightPanel && (
            <aside className="hidden xl:flex w-80 flex-shrink-0 bg-white border-l border-slate-100 flex-col overflow-y-auto custom-scrollbar">
               {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
