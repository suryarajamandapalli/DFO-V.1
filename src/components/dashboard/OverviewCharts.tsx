import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartProps {
  data: any[];
}

export function PatientInflowChart({ data }: ChartProps) {
  if (!data?.length) return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[350px] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
      Loading Inflow Data...
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white p-6 rounded-xl border border-slate-100 shadow-premium h-[350px]"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">Patient Inflow</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live registration velocity</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 800, fill: '#64748B' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 800, fill: '#64748B' }} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.12)', fontWeight: 900, fontSize: '10px' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#0F172A" 
            strokeWidth={4} 
            dot={{ r: 4, fill: '#0F172A', strokeWidth: 3, stroke: '#fff' }} 
            activeDot={{ r: 7, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function RiskDistributionChart({ data }: ChartProps) {
  if (!data?.length) return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[350px] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
      Loading Risk Data...
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white p-6 rounded-xl border border-slate-100 shadow-premium h-[350px] flex flex-col"
    >
      <div className="mb-6">
        <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">Risk Stratification</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Current Population Health</p>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
              animationBegin={400}
              animationDuration={1500}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.12)', fontWeight: 900, fontSize: '10px' }}
            />
            <Legend 
               verticalAlign="bottom" 
               align="center"
               iconType="circle"
               formatter={(value) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
