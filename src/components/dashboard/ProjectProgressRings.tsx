import { PACKAGE_TYPE_LABELS } from '@shared/index';

interface Item {
  projectId: string;
  coupleName: string;
  weddingDate: string;
  progress: number;
  status: 'normal' | 'warning' | 'danger';
  packageType: string;
}

export default function ProjectProgressRings({ items }: { items: Item[] }) {
  const statusColors = {
    normal: { stroke: '#10b981', bg: '#D1FAE5' },
    warning: { stroke: '#f59e0b', bg: '#FEF3C7' },
    danger: { stroke: '#ef4444', bg: '#FEE2E2' },
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item, i) => {
        const c = statusColors[item.status];
        const offset = circumference - (item.progress / 100) * circumference;
        const date = new Date(item.weddingDate);
        return (
          <div key={item.projectId} className="card p-4 flex flex-col items-center text-center group hover:shadow-card animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="relative mb-3">
              <svg width="100" height="100" className="-rotate-90">
                <circle cx="50" cy="50" r={radius} fill="none" stroke={c.bg} strokeWidth="8" />
                <circle cx="50" cy="50" r={radius} fill="none" stroke={c.stroke} strokeWidth="8"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="font-serif text-2xl font-bold" style={{ color: c.stroke }}>
                  {item.progress}%
                </div>
              </div>
            </div>
            <div className="font-medium text-warm-700 text-sm truncate w-full">{item.coupleName}</div>
            <div className="text-xs text-warm-400 mt-0.5">{`${date.getMonth() + 1}月${date.getDate()}日`}</div>
            <div className="mt-2 text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-medium">
              {PACKAGE_TYPE_LABELS[item.packageType as keyof typeof PACKAGE_TYPE_LABELS] || item.packageType}
            </div>
          </div>
        );
      })}
    </div>
  );
}
