interface Category { name: string; value: number; }
interface Monthly { month: string; revenue: number; cost: number; }

export function RevenuePieChart({ categories }: { categories: Category[] }) {
  const colors = ['#C9A06C', '#E8C4A0', '#B85C55', '#D9A585', '#7B2D26', '#9F4039'];
  let cumulative = 0;
  const total = categories.reduce((s, c) => s + c.value, 0);

  const radius = 60, inner = 36;
  const segments = categories.map((c, i) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += c.value;
    const endAngle = (cumulative / total) * 360;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    const x1 = 90 + radius * Math.cos(startRad), y1 = 90 + radius * Math.sin(startRad);
    const x2 = 90 + radius * Math.cos(endRad), y2 = 90 + radius * Math.sin(endRad);
    const xi1 = 90 + inner * Math.cos(endRad), yi1 = 90 + inner * Math.sin(endRad);
    const xi2 = 90 + inner * Math.cos(startRad), yi2 = 90 + inner * Math.sin(startRad);
    return {
      ...c,
      color: colors[i % colors.length],
      path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${inner} ${inner} 0 ${largeArc} 0 ${xi2} ${yi2} Z`
    };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {segments.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity cursor-pointer"
              style={{ transformOrigin: '90px 90px', animation: `popIn 0.6s ${i * 0.1}s backwards ease-out` }} />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="font-serif text-2xl font-bold text-warm-700">{categories.length}</div>
          <div className="text-xs text-warm-400">套餐分类</div>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
            <div className="text-sm text-warm-600 flex-1">{s.name}</div>
            <div className="font-semibold text-warm-700 text-sm tabular-nums">{s.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueBarChart({ monthly }: { monthly: Monthly[] }) {
  const maxVal = Math.max(...monthly.map(m => Math.max(m.revenue, m.cost)));
  const width = 500, height = 180;
  const padding = { top: 20, right: 16, bottom: 28, left: 48 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const bw = Math.min((innerW / monthly.length) * 0.35, 32);
  const gap = innerW / monthly.length;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[420px] h-44">
        <defs>
          <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A06C" />
            <stop offset="100%" stopColor="#E8C4A0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = padding.top + r * innerH;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#F5E6E0" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9A9893">
                ¥{Math.floor((maxVal * (1 - r)) / 10000)}万
              </text>
            </g>
          );
        })}
        {monthly.map((m, i) => {
          const x = padding.left + i * gap + (gap - bw * 2) / 2;
          const rh = (m.revenue / maxVal) * innerH;
          const ch = (m.cost / maxVal) * innerH;
          return (
            <g key={m.month}>
              <rect x={x} y={padding.top + innerH - rh} width={bw - 2} height={rh} rx={3} fill="url(#gradRev)">
                <animate attributeName="height" from="0" to={rh} dur="0.8s" fill="freeze" />
                <animate attributeName="y" from={padding.top + innerH} to={padding.top + innerH - rh} dur="0.8s" fill="freeze" />
              </rect>
              <rect x={x + bw} y={padding.top + innerH - ch} width={bw - 2} height={ch} rx={3} fill="#EED3C7">
                <animate attributeName="height" from="0" to={ch} dur="0.8s" fill="freeze" />
                <animate attributeName="y" from={padding.top + innerH} to={padding.top + innerH - ch} dur="0.8s" fill="freeze" />
              </rect>
              <text x={x + bw - 1} y={height - 8} textAnchor="middle" fontSize="11" fill="#6B6965">{m.month}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-center gap-6 text-xs text-warm-500 mt-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-gradient" />营收</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blush-300" />成本</span>
      </div>
    </div>
  );
}
