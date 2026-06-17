import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, MapPin, Users, Calendar, DollarSign, ChevronRight,
  Clock, Search, Filter as FilterIcon, Plus, Sparkles
} from 'lucide-react';
import { apiFetch } from '../store/auth';
import type { WeddingProject, ProjectStatus, PackageType } from '@shared/index';
import { PACKAGE_TYPE_LABELS } from '@shared/index';

const STATUS_INFO: Record<ProjectStatus, { label: string; color: string }> = {
  pending: { label: '筹备中', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  active: { label: '进行中', color: 'bg-brand-50 text-brand-600 border-brand-200' },
  completed: { label: '已完成', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  cancelled: { label: '已取消', color: 'bg-warm-100 text-warm-500 border-warm-200' },
};

function formatCurrency(n: number) { return '¥' + n.toLocaleString('zh-CN'); }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<WeddingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [pkgType, setPkgType] = useState<PackageType | 'all'>('all');

  useEffect(() => {
    const load = async () => {
      const data = await apiFetch<WeddingProject[]>('/api/projects');
      setProjects(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = projects.filter(p => {
    if (search && !p.coupleName.includes(search) && !p.location.includes(search)) return false;
    if (status !== 'all' && p.status !== status) return false;
    if (pkgType !== 'all' && p.packageType !== pkgType) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold gradient-text flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-wine-500" /> 婚礼项目管理
          </h1>
          <p className="text-warm-500 text-sm mt-1.5">共 {projects.length} 个婚礼项目 · 点击查看详情与任务工单</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" /> 新建项目
        </button>
      </div>

      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9" placeholder="搜索新人姓名或举办地点..." />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon className="w-4 h-4 text-brand-500" />
          <select value={status} onChange={e => setStatus(e.target.value as any)} className="input-field !py-2">
            <option value="all">全部状态</option>
            {(Object.keys(STATUS_INFO) as ProjectStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_INFO[s].label}</option>
            ))}
          </select>
          <select value={pkgType} onChange={e => setPkgType(e.target.value as any)} className="input-field !py-2">
            <option value="all">全部套餐</option>
            {(Object.keys(PACKAGE_TYPE_LABELS) as PackageType[]).map(s => (
              <option key={s} value={s}>{PACKAGE_TYPE_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-60 rounded-2xl shimmer-bg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p, i) => {
            const date = new Date(p.weddingDate);
            const sInfo = STATUS_INFO[p.status];
            const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
            return (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="card group overflow-hidden animate-fade-up hover:shadow-card"
                style={{ animationDelay: `${i * 40}ms` }}>
                <div className="h-2 bg-card-gradient relative overflow-hidden">
                  <div className="h-full bg-brand-gradient transition-all duration-1000" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-serif text-lg font-semibold text-warm-800 group-hover:text-brand-600 transition-colors">
                        {p.coupleName}
                      </div>
                      <div className="text-xs text-warm-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {p.location.split(' · ')[0]}
                      </div>
                    </div>
                    <span className={`badge border ${sInfo.color}`}>{sInfo.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-warm-500">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      {date.getFullYear()}.{String(date.getMonth() + 1).padStart(2, '0')}.{String(date.getDate()).padStart(2, '0')}
                    </div>
                    <div className="flex items-center gap-1.5 text-warm-500">
                      <Users className="w-3.5 h-3.5 text-brand-500" /> {p.guestCount} 人
                    </div>
                    <div className="flex items-center gap-1.5 text-warm-500">
                      <DollarSign className="w-3.5 h-3.5 text-brand-500" /> {formatCurrency(p.totalBudget)}
                    </div>
                    <div className={`flex items-center gap-1.5 ${days > 0 ? 'text-warm-500' : days === 0 ? 'text-brand-600 font-medium' : 'text-warm-400'}`}>
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      {days > 0 ? `还有 ${days} 天` : days === 0 ? '今天！' : `已过 ${-days} 天`}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blush-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
                        <span>项目进度</span>
                        <span className="font-medium text-warm-600 tabular-nums">{p.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-blush-100 overflow-hidden">
                        <div className="h-full bg-brand-gradient rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-brand-600 text-sm font-medium group-hover:gap-2 transition-all">
                      <Sparkles className="w-4 h-4" />
                      {PACKAGE_TYPE_LABELS[p.packageType]}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-warm-400 flex items-center gap-1">
                      <Users className="w-3 h-3" /> 策划师: {p.plannerName} · {p.tasks.length}个工单
                    </div>
                    <ChevronRight className="w-4 h-4 text-warm-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-warm-400">
          <FolderKanban className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <div>暂无匹配的项目</div>
        </div>
      )}
    </div>
  );
}
