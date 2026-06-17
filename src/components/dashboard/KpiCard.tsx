import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedNumber from '../charts/AnimatedNumber';

interface KpiCardProps {
  title: string;
  value: number;
  delta: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: React.ReactNode;
  gradient: string;
}

export default function KpiCard({ title, value, delta, prefix = '', suffix = '', decimals = 0, icon, gradient }: KpiCardProps) {
  const positive = delta >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-card"
      style={{ background: `linear-gradient(135deg, ${gradient})` }}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-11 h-11 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-white shadow-sm">
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${positive ? 'text-emerald-100 bg-emerald-500/20' : 'text-rose-100 bg-rose-500/20'}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(delta)}%
        </div>
      </div>
      <div>
        <div className="text-white/85 text-sm font-medium">{title}</div>
        <div className="font-serif text-3xl font-bold text-white mt-1.5">
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
    </div>
  );
}
