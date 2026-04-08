import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface ClinicalMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon: LucideIcon;
  variant?: 'blue' | 'red' | 'green' | 'orange';
  delay?: number;
}

export function ClinicalMetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon, 
  variant = 'blue',
  delay = 0 
}: ClinicalMetricCardProps) {
  const variants = {
    blue: 'border-l-sky-500 hover:shadow-sky-100/50',
    red: 'border-l-rose-500 hover:shadow-rose-100/50',
    green: 'border-l-emerald-500 hover:shadow-emerald-100/50',
    orange: 'border-l-amber-500 hover:shadow-amber-100/50'
  };

  const iconVariants = {
    blue: 'bg-sky-50 text-sky-600 ring-sky-100',
    red: 'bg-rose-50 text-rose-600 ring-rose-100',
    green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    orange: 'bg-amber-50 text-amber-600 ring-amber-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "bg-white p-6 rounded-xl border border-slate-100 shadow-premium border-l-4 transition-all duration-300",
        variants[variant]
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</p>
        <div className={cn("p-2.5 rounded-2xl ring-4 ring-opacity-30 transition-shadow", iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-1.5">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h2>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm",
            trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] font-bold text-slate-400/80 tracking-wide">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
