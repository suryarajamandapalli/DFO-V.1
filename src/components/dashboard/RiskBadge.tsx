import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: 'red' | 'yellow' | 'green';
}

export function RiskBadge({ level }: RiskBadgeProps) {
  switch (level) {
    case 'red':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Critical</span>
        </div>
      );
    case 'yellow':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Elevated</span>
        </div>
      );
    case 'green':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wider">Routine</span>
        </div>
      );
    default:
      return null;
  }
}
