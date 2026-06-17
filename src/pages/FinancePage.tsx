import { useEffect, useState } from 'react';
import {
  Wallet, AlertTriangle, DollarSign, Calendar, TrendingUp,
  FileText, Bell, Send, CheckCircle, AlertCircle
} from 'lucide-react';
import { apiFetch } from '../store/auth';
import type { FinanceRecord, FinanceWarning } from '@shared/index';

function formatCurrency(n: number) { return '¥' + n.toLocaleString('zh-CN'); }

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function FinancePage() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [r, w] = await Promise.all([
        apiFetch<FinanceRecord[]>('/api/finance/projects'),
        apiFetch<FinanceWarning[]>('/api/finance/warnings'),
      ]);
      setRecords(r);
      setWarnings(w);
      if (!selectedId) setSelectedId(r[0]?.id || null);
      setLoading(false);
    };
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleRemind = async (projectId: string) => {
    await apiFetch('/api/finance/remind', { method: 'POST', body: JSON.stringify({ projectId }) });
    const [r, w] = await Promise.all([
      apiFetch<FinanceRecord[]>('/api/finance/projects'),
      apiFetch<FinanceWarning[]>('/api/finance/warnings'),
    ]);
    setRecords(r);
    setWarnings(w);
  };

  const selected = records.find(r => r.id === selectedId);
  const totalContract = records.reduce((s, r) => s + r.contractAmount, 0);
  const totalPaid = records.reduce((s, r) => s + r.paidAmount, 0);
  const totalOverdue = records.reduce((s, r) => s + r.overdueAmount, 0);
  const totalLateFee = records.reduce((s, r) => s + r.lateFee, 0);

  if (loading) return <div className="p-8"><div className="h-[500px] rounded-2xl shimmer-bg" /></div>;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold gradient-text flex items-center gap-3">
          <Wallet className="w-7 h-7 text-wine-500" /> 费用结算中心
        </h1>
        <p className="text-warm-500 text-sm mt-1.5">分段自动计费 · 超支10%自动预警 · 逾期7天催缴并加收滞纳金</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center"><FileText className="w-4.5 h-4.5 text-brand-500" /></div>
          </div>
          <div className="font-serif text-2xl font-bold text-warm-800 tabular-nums">{formatCurrency(totalContract)}</div>
          <div className="text-xs text-warm-500 mt-1">合同总额 ({records.length}单)</div>
        </div>
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle className="w-4.5 h-4.5 text-emerald-500" /></div>
          </div>
          <div className="font-serif text-2xl font-bold text-emerald-600 tabular-nums">{formatCurrency(totalPaid)}</div>
          <div className="text-xs text-warm-500 mt-1">已收款 {totalContract > 0 ? Math.round(totalPaid / totalContract * 100) : 0}%</div>
        </div>
        <div className={`card p-5 animate-fade-up ${totalOverdue > 0 ? 'ring-2 ring-wine-200' : ''}`} style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-wine-50 flex items-center justify-center"><AlertTriangle className={`w-4.5 h-4.5 text-wine-500 ${totalOverdue > 0 ? 'animate-pulse' : ''}`} /></div>
          </div>
          <div className={`font-serif text-2xl font-bold tabular-nums ${totalOverdue > 0 ? 'text-wine-500' : 'text-warm-800'}`}>{formatCurrency(totalOverdue)}</div>
          <div className="text-xs text-warm-500 mt-1">逾期金额 {warnings.filter(w => w.type === 'overdue').length}笔</div>
        </div>
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><TrendingUp className="w-4.5 h-4.5 text-amber-600" /></div>
          </div>
          <div className="font-serif text-2xl font-bold text-amber-600 tabular-nums">{formatCurrency(totalLateFee)}</div>
          <div className="text-xs text-warm-500 mt-1">累计滞纳金</div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {warnings.slice(0, 3).map((w, i) => (
            <div key={w.id || i}
              className={`p-4 rounded-xl flex items-start gap-3 animate-fade-up ${w.severity === 'high' ? 'bg-wine-50 border border-wine-100' : 'bg-amber-50 border border-amber-100'}`}
              style={{ animationDelay: `${i * 80}ms` }}>
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${w.severity === 'high' ? 'text-wine-500 animate-pulse' : 'text-amber-500'}`} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${w.severity === 'high' ? 'text-wine-700' : 'text-amber-700'}`}>
                  {w.type === 'overrun' ? '⚠️ 费用超支预警' : '⏰ 款项逾期预警'} · {w.coupleName || '项目'}
                </div>
                <div className="text-sm text-warm-600 mt-0.5">{w.message}</div>
              </div>
              {w.type === 'overdue' && (
                <button onClick={() => handleRemind(w.projectId)} disabled={w.notifiedCustomer}
                  className="btn-primary !py-1.5 !px-3 text-xs flex-shrink-0">
                  <Send className="w-3 h-3" /> {w.notifiedCustomer ? '已通知' : '立即催缴'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-serif text-lg font-semibold text-warm-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" /> 项目费用列表
          </h3>
          {records.map((r, i) => {
            const active = r.id === selectedId;
            const daysOverdue = Math.floor(r.overdueAmount / (r.contractAmount * 0.3 / 7));
            return (
              <button key={r.id} onClick={() => setSelectedId(r.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all animate-fade-up group
                  ${active ? 'border-brand-300 bg-brand-50/50 shadow-rose-gold' : 'border-transparent bg-white hover:border-brand-100 card'}`}
                style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-warm-700 group-hover:text-brand-600 transition-colors">{r.coupleName}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${r.status === 'overdue' ? 'bg-wine-50 text-wine-600 animate-pulse' :
                      r.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {r.status === 'overdue' ? '已逾期' : r.status === 'warning' ? '需关注' : '正常'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-warm-500">
                  <div>合同: <span className="text-warm-700 font-medium tabular-nums">{(r.contractAmount / 10000).toFixed(1)}万</span></div>
                  <div>已收: <span className="text-emerald-600 font-medium tabular-nums">{Math.round(r.paidAmount / r.contractAmount * 100)}%</span></div>
                  <div>
                    超支: <span className={`font-medium tabular-nums ${r.overrunPercentage > 10 ? 'text-wine-500' : 'text-warm-600'}`}>
                      +{r.overrunPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {r.lateFee > 0 && (
                  <div className="mt-2 text-xs text-wine-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> 产生滞纳金: {formatCurrency(r.lateFee)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-warm-800">{selected.coupleName} · 费用明细</h3>
                  <div className="text-sm text-warm-500 mt-1 flex items-center gap-3">
                    <span>合同总额: <span className="text-warm-700 font-medium tabular-nums">{formatCurrency(selected.contractAmount)}</span></span>
                    <span className={`${selected.overrunPercentage > 10 ? 'text-wine-500' : 'text-warm-400'}`}>
                      超支 {selected.overrunPercentage.toFixed(1)}%
                      {selected.overrunPercentage > 10 && ' ⚠️ 已超过10%阈值'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium text-warm-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-500" /> 分期付款计划
                </div>
                <div className="space-y-3">
                  {selected.installments.map((ins, i) => {
                    const isOverdue = ins.status === 'overdue';
                    const isPaid = ins.status === 'paid';
                    return (
                      <div key={ins.id}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between
                          ${isOverdue ? 'bg-wine-50 border-wine-200 animate-shake' : isPaid ? 'bg-emerald-50/60 border-emerald-100' : 'bg-ivory-50 border-blush-100'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif text-sm font-bold
                            ${isOverdue ? 'bg-wine-500 text-white' : isPaid ? 'bg-emerald-500 text-white' : 'bg-brand-200 text-brand-700'}`}>
                            {i + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-warm-700">{ins.name}</span>
                              <span className="text-xs text-warm-400">{ins.percentage}%</span>
                              {isOverdue && <Bell className="w-3.5 h-3.5 text-wine-500 animate-pulse" />}
                            </div>
                            <div className={`text-xs mt-0.5 ${isOverdue ? 'text-wine-600' : 'text-warm-500'}`}>
                              截止: {formatDate(ins.dueDate)}
                              {isPaid && ins.paidAt && ` · 已支付 ${formatDate(ins.paidAt)}`}
                              {isOverdue && ' · 已逾期，请尽快催缴'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-serif text-xl font-bold tabular-nums ${isOverdue ? 'text-wine-500' : isPaid ? 'text-emerald-600' : 'text-warm-700'}`}>
                            {formatCurrency(ins.amount)}
                          </div>
                          <div className={`mt-1 text-xs px-2 py-0.5 rounded-full inline-block
                            ${isOverdue ? 'bg-wine-100 text-wine-600' : isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-warm-100 text-warm-600'}`}>
                            {isPaid ? '✓ 已支付' : isOverdue ? '⚠️ 已逾期' : '待支付'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-card-gradient border border-blush-100">
                <div className="text-center">
                  <div className="text-xs text-warm-500 mb-1">累计已收款</div>
                  <div className="font-serif text-2xl font-bold text-emerald-600 tabular-nums">{formatCurrency(selected.paidAmount)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-warm-500 mb-1">剩余待收款</div>
                  <div className="font-serif text-2xl font-bold text-brand-600 tabular-nums">{formatCurrency(selected.pendingAmount)}</div>
                </div>
                <div className="text-center border-t border-blush-200 pt-4 col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-warm-500 mb-1">逾期金额</div>
                    <div className={`font-serif text-lg font-bold tabular-nums ${selected.overdueAmount > 0 ? 'text-wine-500' : 'text-warm-400'}`}>
                      {formatCurrency(selected.overdueAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-warm-500 mb-1">滞纳金</div>
                    <div className={`font-serif text-lg font-bold tabular-nums ${selected.lateFee > 0 ? 'text-wine-500' : 'text-warm-400'}`}>
                      {formatCurrency(selected.lateFee)}
                    </div>
                  </div>
                </div>
              </div>

              {selected.warnings.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-medium text-warm-700 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-500" /> 预警通知记录
                  </div>
                  <div className="space-y-2">
                    {selected.warnings.map((w, i) => (
                      <div key={i} className={`p-3 rounded-xl text-sm flex items-start gap-2
                        ${w.severity === 'high' ? 'bg-wine-50' : 'bg-amber-50'}`}>
                        {w.type === 'overrun' ? <DollarSign className="w-4 h-4 mt-0.5 text-wine-500 flex-shrink-0" />
                          : <Bell className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0 animate-pulse" />}
                        <div className="flex-1">
                          <div className={`${w.severity === 'high' ? 'text-wine-700' : 'text-amber-700'} font-medium`}>{w.message}</div>
                          <div className="text-xs text-warm-500 mt-1 flex items-center gap-2">
                            {formatDate(w.triggeredAt)} 触发
                            {w.notifiedCustomer && <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> 已通知客户
                            </span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-16 text-center text-warm-400">
              <Wallet className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <div>请在左侧选择项目查看详细费用信息</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
