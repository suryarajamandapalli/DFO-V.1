import { motion } from 'framer-motion';
import type { Thread } from '../../lib/types';
import { RiskBadge } from './RiskBadge';
import { Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (id: string) => void;
}

export function ThreadList({ threads, selectedThreadId, onSelectThread }: ThreadListProps) {
  
  // Sort threads: Red > Yellow > Green, then by newest
  const sortedThreads = [...threads].sort((a, b) => {
    const riskMap: Record<string, number> = { red: 3, yellow: 2, green: 1 };
    const aWeight = riskMap[a.status] || 0;
    const bWeight = riskMap[b.status] || 0;
    
    if (aWeight !== bWeight) {
      return bWeight - aWeight;
    }
    return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
  });

  return (
    <div className="w-80 border-r border-slate-100 bg-white h-full flex flex-col flex-shrink-0 z-20">
      <div className="p-6 border-b border-slate-100 bg-white">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">Clinical Triage</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Sakhi Intelligence Active</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sortedThreads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <User className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active cases</p>
          </div>
        ) : (
          sortedThreads.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            const isRed = thread.status === 'red';
            const metadata = (thread.metadata as any) || {};
            const patientName = metadata.patient_name || thread.patient_name || `Patient ${thread.id.slice(0, 4)}`;
            const lastMsg = metadata.last_message || 'New triage request received';
            
            return (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectThread(thread.id)}
                className={`p-5 border-b border-slate-100 cursor-pointer transition-all relative ${
                  isSelected ? 'bg-sky-50 shadow-inner' : 'hover:bg-slate-50'
                }`}
              >
                {/* Visual Indicator Line for selected or red */}
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 shadow-[0_0_8px_#0ea5e9]" />}
                {!isSelected && isRed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 animate-pulse" />}

                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-sm font-black text-slate-900 truncate tracking-tight">
                      {patientName}
                    </h3>
                    <div className="flex items-center gap-1.5 opacity-60">
                       <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                         {thread.channel.toUpperCase()} • ID: {thread.id.slice(0,4)}
                       </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 scale-90 origin-right">
                    <RiskBadge level={thread.status} />
                  </div>
                </div>
                
                <p className="text-[11px] font-medium text-slate-500 line-clamp-2 mb-3 leading-relaxed tracking-wide">
                  {lastMsg}
                </p>
                
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(thread.updated_at || thread.created_at), { addSuffix: true })}</span>
                  </div>
                  {metadata.risk_score && (
                    <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                      INTEL: {metadata.risk_score}%
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
