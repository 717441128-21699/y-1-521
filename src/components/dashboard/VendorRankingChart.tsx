import { Trophy, Medal } from 'lucide-react';
import { TASK_TYPE_LABELS } from '@shared/index';
import type { VendorServiceType } from '@shared/index';

interface RankingItem {
  vendorId: string;
  vendorName: string;
  vendorType: VendorServiceType;
  completionRate: number;
  totalTasks: number;
  avgRating: number;
  rank: number;
}

export default function VendorRankingChart({ items }: { items: RankingItem[] }) {
  const maxRate = Math.max(...items.map((i) => i.completionRate), 100);
  const renderRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5" />;
    if (rank <= 3) return <Medal className="w-4 h-4" />;
    return <span>{rank}</span>;
  };
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.vendorId} className="group animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-6 text-center font-serif font-bold text-xs" style={{ color: item.rank <= 3 ? '#B8894A' : '#9A9893' }}>
              {renderRankIcon(item.rank)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-warm-700 truncate">{item.vendorName}</span>
                  <span className="text-[10px] text-brand-600 bg-brand-50 px-1.5 py-px rounded whitespace-nowrap">
                    {TASK_TYPE_LABELS[item.vendorType]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-warm-400">{item.totalTasks}单</span>
                  <span className="text-brand-500 font-medium">{item.completionRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2.5 bg-blush-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out group-hover:shadow-glow"
                  style={{
                    width: `${(item.completionRate / maxRate) * 100}%`,
                    background: 'linear-gradient(90deg, #E8C4A0 0%, #C9A06C 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
