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
  ChevronRight,
  Settings
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  activeMenu?: 'threads' | 'analytics' | 'settings';
}

export function DashboardLayout({ children, rightPanel, activeMenu = 'threads' }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'threads', label: 'Patient Threads', icon: MessageSquare, path: `/dashboard/${profile?.role}` },
    { id: 'analytics', label: 'Operational Analytics', icon: BarChart3, path: '#' },
    { id: 'settings', label: 'Account Settings', icon: Settings, path: '#' },
  ];

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'cro': return <ShieldAlert className="w-5 h-5 text-indigo-600" />;
      case 'nurse': return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'doctor': return <Stethoscope className="w-5 h-5 text-sky-600" />;
      default: return null;
    }
  };

  const getRoleColorClass = () => {
    switch (profile?.role) {
      case 'cro': return 'bg-indigo-50 border-indigo-100';
      case 'nurse': return 'bg-rose-50 border-rose-100';
      case 'doctor': return 'bg-sky-50 border-sky-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden font-sans selection:bg-sky-100">
      {/* 1. LEFT SIDEBAR (Identity + Navigation) */}
      <aside className="w-64 flex-shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col z-30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
             <div className="bg-sky-500 p-1.5 rounded-lg text-white">
               <Stethoscope className="w-5 h-5" />
             </div>
             <span className="text-lg font-bold text-slate-800 tracking-tight">JanmaSethu <span className="text-sky-500 font-black">DFO</span></span>
          </div>

          <div className={cn("p-4 rounded-2xl border transition-all mb-8 shadow-sm bg-white", getRoleColorClass())}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-50">
                {getRoleIcon()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">DESIGNATION</p>
                <p className="text-sm font-black text-slate-800 truncate">{profile?.role?.toUpperCase() || 'CLINICIAN'}</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium truncate italic">"{profile?.full_name || 'Active Practitioner'}"</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.path !== '#' && navigate(item.path)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all group",
                  activeMenu === item.id 
                    ? "bg-white text-sky-600 shadow-sm border border-slate-100" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-4 h-4", activeMenu === item.id ? "text-sky-500" : "text-slate-400 group-hover:text-slate-600")} />
                  <span>{item.label}</span>
                </div>
                {activeMenu === item.id && <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE (Threads + Interaction) */}
      <main className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden">
         {children}
      </main>

      {/* 3. RIGHT PANEL (Contextual Details) */}
      {rightPanel && (
        <aside className="w-80 flex-shrink-0 bg-slate-50/30 border-l border-slate-100 flex flex-col overflow-y-auto custom-scrollbar">
           {rightPanel}
        </aside>
      )}
    </div>
  );
}
