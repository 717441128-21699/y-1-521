import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, DollarSign, HeartHandshake, Users, Filter,
  BarChart3, Activity, PieChart, Star
} from 'lucide-react';
import { apiFetch } from '../store/auth';
import type { DashboardOverview, PackageType } from '@shared/index';
import KpiCard from '../components/dashboard/KpiCard';
import ProjectProgressRings from '../components/dashboard/ProjectProgressRings';
import VendorRankingChart from '../components/dashboard/VendorRankingChart';
import SatisfactionTrendChart from '../components/charts/SatisfactionTrendChart';
import { RevenuePieChart, RevenueBarChart } from '../components/charts/RevenueCharts';
import DashboardToolbar from '../components/dashboard/DashboardToolbar';
import { useAuth } from '../store/auth';

function getDateRange(preset: string): { start: string; end: string; preset: string } {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);
  switch (preset) {
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end.setDate(0);
      break;
    case 'last_7_days':
      start.setDate(start.getDate() - 7);
      break;
    case 'this_quarter':
      start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    preset,
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [datePreset, setDatePreset] = useState('this_month');
  const [packageType, setPackageType] = useState<PackageType | 'all'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { user } = useAuth();

  const loadData = async (preset?: string) => {
    const range = getDateRange(preset || datePreset);
    const d = await apiFetch<DashboardOverview>(
      `/api/dashboard/overview?dateRange=${encodeURIComponent(JSON.stringify(range))}`
    );
    setData(d);
    setLastUpdate(new Date());
  };

  const refresh = async () => {
    const range = getDateRange(datePreset);
    const d = await apiFetch<DashboardOverview>(
      `/api/dashboard/realtime?dateRange=${encodeURIComponent(JSON.stringify(range))}`
    );
    setData(d);
    setLastUpdate(new Date());
  };

  const exportReport = async () => {
    try {
      const res = await fetch('/api/settings/reports/monthly', { method: 'POST' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `月度运营分析报告_${new Date().toISOString().slice(0, 7)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* empty */ }
  };

  useEffect(() => {
    loadData();
  }, [datePreset]);

  useEffect(() => {
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [datePreset]);

  if (!data) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl shimmer-bg" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="h-96 rounded-2xl shimmer-bg" />
          <div className="h-96 rounded-2xl shimmer-bg" />
        </div>
      </div>
    );
  }

  const filteredProgress = packageType === 'all'
    ? data.projectProgress
    : data.projectProgress.filter(p => p.packageType === packageType);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold gradient-text flex items-center gap-3">
            <Activity className="w-7 h-7 text-wine-500" />
            运营数据大屏
          </h1>
          <p className="text-warm-500 text-sm mt-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dot-pulse" />
            实时数据 · 每5秒自动刷新 · 最后更新:
            <span className="tabular-nums text-warm-600">{lastUpdate.toLocaleTimeString('zh-CN')}</span>
          </p>
        </div>
        <div className="text-sm text-warm-500">
          欢迎回来, <span className="font-medium text-brand-600">{user?.name}</span> 👋
        </div>
      </div>

      <DashboardToolbar
        dateRange={datePreset} setDateRange={setDatePreset}
        packageType={packageType} setPackageType={setPackageType}
        refresh={refresh} exportReport={exportReport}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <KpiCard title="进行中项目" value={data.kpis.activeProjects} delta={data.kpis.activeProjectsDelta}
          icon={<CalendarDays className="w-5 h-5" />} gradient="#C9A06C, #9A6F35" />
        <KpiCard title="本月营收 (¥)" value={data.kpis.monthlyRevenue} delta={data.kpis.monthlyRevenueDelta}
          prefix="" decimals={0} icon={<DollarSign className="w-5 h-5" />} gradient="#7B2D26, #B85C55" />
        <KpiCard title="平均客户满意度" value={data.kpis.avgSatisfaction} delta={data.kpis.avgSatisfactionDelta}
          suffix="" decimals={2} icon={<Star className="w-5 h-5" />} gradient="#B8894A, #D9A585" />
        <KpiCard title="合作供应商总数" value={data.kpis.totalVendors} delta={data.kpis.totalVendorsDelta}
          icon={<HeartHandshake className="w-5 h-5" />} gradient="#9F4039, #C9A06C" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <div className="card p-5 xl:col-span-2">
          <div className="section-title">
            <Filter className="w-5 h-5 text-brand-500" />
            婚礼项目进度
            <span className="ml-auto text-xs font-normal text-warm-400">{filteredProgress.length} 个项目</span>
          </div>
          <ProjectProgressRings items={filteredProgress} />
        </div>

        <div className="card p-5">
          <div className="section-title">
            <Users className="w-5 h-5 text-brand-500" />
            供应商完成率排行
          </div>
          <VendorRankingChart items={data.vendorRanking.slice(0, 6)} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-6">
        <div className="card p-5 xl:col-span-3">
          <div className="section-title">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            客户满意度趋势
            <span className="ml-auto text-xs font-normal text-warm-400">近12个月 · 满分5.0</span>
          </div>
          <SatisfactionTrendChart points={data.satisfactionTrend} />
        </div>

        <div className="card p-5 xl:col-span-2">
          <div className="section-title">
            <PieChart className="w-5 h-5 text-brand-500" />
            套餐类型营收占比
          </div>
          <RevenuePieChart categories={data.revenueBreakdown.categories} />
        </div>
      </div>

      <div className="card p-5 mb-6">
        <div className="section-title">
          <DollarSign className="w-5 h-5 text-brand-500" />
          月度营收与成本趋势
        </div>
        <RevenueBarChart monthly={data.revenueBreakdown.monthly} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Link to="/consultation" className="card p-4 hover:shadow-rose-gold transition-all group">
          <div className="text-warm-500 text-sm mb-2 flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-500 group-hover:rotate-12 transition-transform" />
            快捷入口
          </div>
          <div className="font-medium text-warm-700 group-hover:text-brand-600">→ 客户咨询与方案推荐</div>
        </Link>
        <Link to="/projects" className="card p-4 hover:shadow-rose-gold transition-all group">
          <div className="text-warm-500 text-sm mb-2 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-brand-500 group-hover:rotate-12 transition-transform" />
            快捷入口
          </div>
          <div className="font-medium text-warm-700 group-hover:text-brand-600">→ 婚礼项目管理</div>
        </Link>
        <Link to="/vendor" className="card p-4 hover:shadow-rose-gold transition-all group">
          <div className="text-warm-500 text-sm mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500 group-hover:rotate-12 transition-transform" />
            快捷入口
          </div>
          <div className="font-medium text-warm-700 group-hover:text-brand-600">→ 供应商任务工作台</div>
        </Link>
        <Link to="/finance" className="card p-4 hover:shadow-rose-gold transition-all group">
          <div className="text-warm-500 text-sm mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-500 group-hover:rotate-12 transition-transform" />
            快捷入口
          </div>
          <div className="font-medium text-warm-700 group-hover:text-brand-600">→ 费用结算与预警</div>
        </Link>
      </div>
    </div>
  );
}
