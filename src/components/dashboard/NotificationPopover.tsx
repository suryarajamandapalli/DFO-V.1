import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';

interface Notification {
  id: string;
  patient_id?: string;
  category: string;
  payload?: any;
  status: string;
  created_at: string;
  type?: 'info' | 'warning' | 'alert' | 'success';
  title?: string;
  message?: string;
  is_read?: boolean;
}

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase.channel('dfo_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dfo_notification_logs' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('dfo_notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      // Map and ensure reasonable fallbacks for missing title/message in payload
      const mapped = data.map(n => ({
        ...n,
        title: n.payload?.title || n.category.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        message: n.payload?.message || `System alert recorded in category: ${n.category}`,
        is_read: n.status === 'READ',
        type: (n.category.includes('alert') || n.category.includes('risk')) ? 'alert' : 
              n.category.includes('warning') ? 'warning' : 
              n.category.includes('onboarding') ? 'success' : 'info'
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => n.status !== 'READ').length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('dfo_notification_logs').update({ status: 'READ' }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ', is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase.from('dfo_notification_logs').update({ status: 'READ' }).neq('status', 'READ');
    setNotifications(prev => prev.map(n => ({ ...n, status: 'READ', is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-transparent"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-black text-sky-600 uppercase tracking-widest hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 grayscale opacity-30">
                       <Bell className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All caught up</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-4 hover:bg-slate-50/50 transition-colors flex gap-4 relative group",
                          !n.is_read && "bg-sky-50/20"
                        )}
                      >
                        {!n.is_read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
                        )}
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          n.type === 'alert' ? 'bg-rose-50 text-rose-500' :
                          n.type === 'warning' ? 'bg-amber-50 text-amber-500' :
                          n.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-sky-50 text-sky-500'
                        )}>
                          {n.type === 'alert' ? <AlertCircle className="w-5 h-5" /> :
                           n.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                           n.type === 'success' ? <Check className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-black text-slate-900 leading-none">{n.title}</h4>
                            <span className="text-[9px] font-bold text-slate-400 truncate ml-2">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-2">
                            {n.message}
                          </p>
                          {!n.is_read && (
                            <button 
                              onClick={() => markAsRead(n.id)}
                              className="text-[9px] font-black text-sky-600 uppercase tracking-widest hover:text-sky-700 transition-colors"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 hover:bg-slate-50 hover:text-slate-600 transition-all">
                View all activity
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
