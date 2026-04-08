import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { 
  LogOut, 
  MessageSquare,   
  ShieldAlert, 
  HeartPulse, 
  Stethoscope,
  Search,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  UserPlus,
  Target,
  Menu,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationPopover } from './NotificationPopover';

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
    const isCRO = profile?.role === 'cro';
    
    if (isCRO) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/cro' },
        { id: 'patients', label: 'Patients', icon: Users, path: '/dashboard/cro/patients' },
        { id: 'inbox', label: 'Inbox', icon: MessageSquare, path: '/dashboard/cro/inbox', isImportant: true },
        { id: 'risk', label: 'Risk Monitor', icon: ShieldAlert, path: '#' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '#' },
        { id: 'consultations', label: 'Consultations', icon: HeartPulse, path: '#' },
        { id: 'documents', label: 'Documents', icon: FileText, path: '#' },
        { id: 'engagement', label: 'Engagement', icon: Target, path: '#' },
        { id: 'crm', label: 'Leads CRM', icon: UserPlus, path: '#' },
      ];
    }

    // Default for other roles
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${profile?.role}` },
      { id: 'patients', label: 'Patients', icon: Users, path: `/dashboard/${profile?.role}/patients` },
      { id: 'inbox', label: 'Inbox', icon: MessageSquare, path: `/dashboard/${profile?.role}` },
    ];
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f172a] text-white">
      <div className="p-8 grow overflow-y-auto custom-scrollbar-dark">
        <div 
          className="flex items-center gap-3 mb-10 cursor-pointer group" 
          onClick={() => navigate('/')}
        >
           <div className="bg-sky-500 p-2 rounded-xl text-white shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-all duration-300">
             <Stethoscope className="w-6 h-6 stroke-[2.5]" />
           </div>
           <div>
             <span className="text-xl font-black tracking-tight block leading-none">DFO CLINIC</span>
             <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Medical OS</span>
           </div>
        </div>

        <nav className="space-y-1 pb-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all group relative overflow-hidden",
                activeMenu === item.id 
                  ? "bg-sky-500/10 text-sky-400 font-bold" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <item.icon className={cn(
                  "w-4 h-4 transition-colors", 
                  activeMenu === item.id ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="tracking-tight text-left">{item.label}</span>
              </div>
              {item.isImportant && (
                <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)] animate-pulse" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800/40 shrink-0">
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#0f172a] flex overflow-hidden font-sans selection:bg-sky-100">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#0f172a] z-40 relative">
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
              className="absolute inset-y-0 left-0 w-[260px] overflow-hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative bg-[#F8FAFC]">
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="max-w-md w-full group relative hidden md:block">
              <div className={cn(
                 "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 border",
                 searchFocused 
                   ? "bg-white border-sky-400 shadow-sm" 
                   : "bg-slate-50 border-slate-100 group-hover:border-slate-200"
              )}>
                <Search className={cn("w-4 h-4 transition-colors", searchFocused ? "text-sky-500" : "text-slate-400")} />
                <input 
                  type="text" 
                  placeholder="Global Search" 
                  className="bg-transparent border-none outline-none text-xs font-medium text-slate-700 w-full placeholder:text-slate-400"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Connect: Active</span>
            </div>

            <div className="flex items-center gap-2">
              <NotificationPopover />
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none mb-1">{profile?.full_name || 'CRO Admin'}</p>
                <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest opacity-80 decoration-sky-500/30 underline-offset-2 underline decoration-2">Control Role</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 border border-sky-200 shadow-sm">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
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
