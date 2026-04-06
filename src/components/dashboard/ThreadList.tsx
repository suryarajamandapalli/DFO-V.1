import { motion } from 'framer-motion';
import type { Thread } from '../../lib/types';
import { RiskBadge } from './RiskBadge';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (id: string) => void;
}

export function ThreadList({ threads, selectedThreadId, onSelectThread }: ThreadListProps) {
  
  // Sort threads: Red > Yellow > Green, then by newest
  const sortedThreads = [...threads].sort((a, b) => {
    const riskWeight = { red: 3, yellow: 2, green: 1 };
    if (riskWeight[a.status] !== riskWeight[b.status]) {
      return riskWeight[b.status] - riskWeight[a.status];
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className="w-full md:w-80 border-r border-slate-200 bg-white h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800">Active Threads</h2>
        <p className="text-xs text-slate-500">{threads.length} total monitored via Sakhi Triage</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedThreads.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">
            <p>No active threads assigned to this view.</p>
          </div>
        ) : (
          sortedThreads.map((thread) => {
            const isSelected = selectedThreadId === thread.id;
            const isRed = thread.status === 'red';
            
            return (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => onSelectThread(thread.id)}
                className={`p-4 border-b border-slate-100 cursor-pointer transition-colors relative ${
                  isSelected ? 'bg-sky-50' : 'hover:bg-slate-50'
                }`}
              >
                {/* Visual Indicator Line for selected or red */}
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />}
                {!isSelected && isRed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />}

                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 truncate pr-2">
                    {thread.metadata?.patient_name || 'Incoming Patient'}
                  </h3>
                  <div className="flex-shrink-0">
                    <RiskBadge level={thread.status} />
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {thread.metadata?.last_message || 'Initializing triage...'}
                </p>
                
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(thread.updated_at), { addSuffix: true })}</span>
                  </div>
                  {thread.metadata?.sentiment_score < -0.3 && (
                    <span className="text-rose-500">Frustrated ({(thread.metadata.sentiment_score).toFixed(2)})</span>
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
