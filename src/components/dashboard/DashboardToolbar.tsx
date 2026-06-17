import { useState } from 'react';
import { Calendar, Package, Download, RefreshCw } from 'lucide-react';
import type { PackageType } from '@shared/index';
import { PACKAGE_TYPE_LABELS } from '@shared/index';

interface Props {
  dateRange: string;
  setDateRange: (v: string) => void;
  customStart: string;
  customEnd: string;
  setCustomStart: (v: string) => void;
  setCustomEnd: (v: string) => void;
  packageType: PackageType | 'all';
  setPackageType: (v: PackageType | 'all') => void;
  refresh: () => void;
  exportReport: () => void;
}

export default function DashboardToolbar({
  dateRange, setDateRange, customStart, customEnd, setCustomStart, setCustomEnd,
  packageType, setPackageType, refresh, exportReport
}: Props) {
  const [showCustom, setShowCustom] = useState(false);

  const handleDateChange = (v: string) => {
    setDateRange(v);
    setShowCustom(v === 'custom');
  };

  return (
    <div className="card-glass rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-brand-500" />
        <span className="text-sm text-warm-500">日期:</span>
        <select value={dateRange} onChange={e => handleDateChange(e.target.value)}
          className="px-3 py-1.5 rounded-full bg-ivory-100 border border-warm-100 text-sm text-warm-700 focus:outline-none focus:border-brand-300">
          <option value="last_7_days">近7天</option>
          <option value="this_month">本月</option>
          <option value="last_month">上月</option>
          <option value="this_quarter">本季度</option>
          <option value="this_year">本年度</option>
          <option value="custom">自定义</option>
        </select>
      </div>
      {showCustom && (
        <div className="flex items-center gap-2">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-ivory-100 border border-warm-100 text-sm text-warm-700 focus:outline-none focus:border-brand-300" />
          <span className="text-warm-400">至</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-ivory-100 border border-warm-100 text-sm text-warm-700 focus:outline-none focus:border-brand-300" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-brand-500" />
        <span className="text-sm text-warm-500">套餐:</span>
        <select value={packageType} onChange={e => setPackageType(e.target.value as any)}
          className="px-3 py-1.5 rounded-full bg-ivory-100 border border-warm-100 text-sm text-warm-700 focus:outline-none focus:border-brand-300">
          <option value="all">全部类型</option>
          {(Object.keys(PACKAGE_TYPE_LABELS) as PackageType[]).map(k => (
            <option key={k} value={k}>{PACKAGE_TYPE_LABELS[k]}</option>
          ))}
        </select>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button onClick={refresh} className="btn-ghost text-sm group">
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          刷新数据
        </button>
        <button onClick={exportReport} className="btn-primary !py-2 !px-4 text-sm">
          <Download className="w-4 h-4" />
          导出月度报告
        </button>
      </div>
    </div>
  );
}
