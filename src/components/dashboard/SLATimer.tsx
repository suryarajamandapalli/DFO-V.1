import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { differenceInSeconds, parseISO } from 'date-fns';

interface SLATimerProps {
  deadline: string;
  status: 'pending' | 'breached' | 'completed';
}

export function SLATimer({ deadline, status }: SLATimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (status !== 'pending') return;

    const interval = setInterval(() => {
      const seconds = differenceInSeconds(parseISO(deadline), new Date());
      setTimeLeft(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, status]);

  if (status === 'completed') {
    return (
      <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
        SLA MET
      </div>
    );
  }

  const isBreached = status === 'breached' || timeLeft < 0;
  const minutes = Math.floor(Math.abs(timeLeft) / 60);
  const seconds = Math.abs(timeLeft) % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
      isBreached 
        ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
        : timeLeft < 120 
          ? 'bg-amber-50 text-amber-600 border-amber-200'
          : 'bg-slate-50 text-slate-600 border-slate-200'
    }`}>
      {isBreached ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      <span>{isBreached ? 'BREACHED' : 'DUE IN'} {timeStr}</span>
    </div>
  );
}
