interface Point { month: string; score: number; projectCount: number; }

export default function SatisfactionTrendChart({ points }: { points: Point[] }) {
  const width = 560, height = 220;
  const padding = { top: 20, right: 20, bottom: 36, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const minY = 4.5, maxY = 5.0;
  const xStep = innerW / (points.length - 1);

  const points_ = points.map((p, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + innerH - ((p.score - minY) / (maxY - minY)) * innerH;
    return { ...p, x, y };
  });

  const pathD = points_.map((p, i) => (i === 0 ? `M ${p.x}, ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaD = `${pathD} L ${points_[points_.length - 1].x} ${padding.top + innerH} L ${points_[0].x} ${padding.top + innerH} Z`;

  const yTicks = [4.5, 4.6, 4.7, 4.8, 4.9, 5.0].reverse();

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[480px] h-56">
        <defs>
          <linearGradient id="satisfactionArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8C4A0" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#E8C4A0" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="satisfactionLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E8C4A0" />
            <stop offset="100%" stopColor="#7B2D26" />
          </linearGradient>
        </defs>

        {yTicks.map((tick, i) => {
          const y = padding.top + (i / (yTicks.length - 1)) * innerH;
          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y}
                stroke="#F5E6E0" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9A9893">{tick.toFixed(1)}</text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#satisfactionArea)">
          <animate attributeName="d" dur="1.5s" fill="freeze" />
        </path>
        <path d={pathD} fill="none" stroke="url(#satisfactionLine)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {points_.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={5} fill="white" stroke="#B8894A" strokeWidth={2}>
              <animate attributeName="r" values="0;5;4;5" dur="2s" begin={`${i * 80}ms`} fill="freeze" />
            </circle>
            <circle cx={p.x} cy={p.y} r={10} fill="none" stroke="#B8894A" strokeOpacity={0} opacity={0}>
              <animate attributeName="stroke-opacity" values="0;0.3;0" dur="2s" begin={`${i * 80 + 200}ms`} repeatCount="indefinite" />
              <animate attributeName="r" values="5;14;14" dur="2s" begin={`${i * 80 + 200}ms`} repeatCount="indefinite" />
            </circle>
            <text x={p.x} y={height - 14} textAnchor="middle" fontSize="10" fill="#9A9893"
              transform={`rotate(-35, ${p.x}, ${height - 14})`}>
              {p.month.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
