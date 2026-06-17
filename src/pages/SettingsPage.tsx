import { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon, Sliders, Trophy, Users, Save, RotateCcw,
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { apiFetch } from '../store/auth';
import type { RecommendRules, RewardRules, User } from '@shared/index';
import { TASK_TYPE_LABELS } from '@shared/index';

type Tab = 'recommend' | 'reward' | 'users';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('recommend');
  const [rules, setRules] = useState<RecommendRules | null>(null);
  const [rewards, setRewards] = useState<RewardRules | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const [r, w, u] = await Promise.all([
        apiFetch<RecommendRules>('/api/settings/recommend-rules'),
        apiFetch<RewardRules>('/api/settings/rewards'),
        apiFetch<User[]>('/api/settings/users'),
      ]);
      setRules(r);
      setRewards(w);
      setUsers(u);
    };
    load();
  }, []);

  const showSaveMsg = () => {
    setSavedMsg('✓ 配置已保存');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const saveRecommendRules = async () => {
    if (!rules) return;
    await apiFetch('/api/settings/recommend-rules', { method: 'POST', body: JSON.stringify(rules) });
    showSaveMsg();
  };

  const saveRewardRules = async () => {
    if (!rewards) return;
    await apiFetch('/api/settings/rewards', { method: 'POST', body: JSON.stringify(rewards) });
    showSaveMsg();
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold gradient-text flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-wine-500" /> 系统设置
          </h1>
          <p className="text-warm-500 text-sm mt-1.5">配置推荐算法权重、供应商奖励机制与用户权限管理</p>
        </div>
        {savedMsg && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm animate-fade-up">
            <CheckCircle2 className="w-4 h-4" /> {savedMsg}
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {([
          { k: 'recommend', l: '推荐规则', i: Sliders },
          { k: 'reward', l: '奖励机制', i: Trophy },
          { k: 'users', l: '用户管理', i: Users },
        ] as const).map(t => {
          const I = t.i;
          const active = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active ? 'bg-brand-gradient text-white shadow-rose-gold' : 'bg-white text-warm-500 hover:bg-blush-50 border border-blush-100'}`}>
              <I className="w-4 h-4" /> {t.l}
            </button>
          );
        })}
      </div>

      {tab === 'recommend' && rules && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2 space-y-6 animate-fade-up">
            <div className="section-title"><Sliders className="w-5 h-5 text-brand-500" /> 推荐算法权重配置</div>
            <p className="text-sm text-warm-500">调整各因素在AI智能推荐中的权重占比，所有权重之和建议为 100%</p>

            {([
              { k: 'budgetWeight' as const, l: '预算匹配度', d: '客户预算与套餐价格的匹配程度' },
              { k: 'styleWeight' as const, l: '风格偏好匹配', d: '客户选择的婚礼风格与案例契合度' },
              { k: 'dateWeight' as const, l: '档期合适度', d: '婚礼日期与供应商空档的匹配度' },
              { k: 'vendorRatingWeight' as const, l: '供应商评分', d: '供应商历史评价与完成率权重' },
              { k: 'historicalCaseWeight' as const, l: '历史案例参考', d: '类似规模/预算的成功案例影响' },
            ]).map(({ k, l, d }) => (
              <div key={k} className="p-4 rounded-xl bg-ivory-50 border border-blush-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-warm-700">{l}</div>
                    <div className="text-xs text-warm-400 mt-0.5">{d}</div>
                  </div>
                  <div className="text-right">
                    <input type="number" value={Math.round(rules[k] * 100)}
                      onChange={e => setRules({ ...rules, [k]: +e.target.value / 100 })}
                      className="w-20 input-field !py-1.5 text-center font-serif text-lg font-bold text-brand-600 tabular-nums" />
                    <div className="text-xs text-warm-400 mt-0.5">%</div>
                  </div>
                </div>
                <input type="range" min={0} max={50} value={rules[k] * 100}
                  onChange={e => setRules({ ...rules, [k]: +e.target.value / 100 })}
                  className="w-full accent-brand-400" />
              </div>
            ))}

            <div className="pt-4 border-t border-blush-100 text-sm text-warm-500 flex items-center justify-between">
              <span>当前权重总和:
                <span className={`font-bold ml-1 tabular-nums ${Math.abs((rules.budgetWeight + rules.styleWeight + rules.dateWeight + rules.vendorRatingWeight + rules.historicalCaseWeight) * 100 - 100) > 5 ? 'text-wine-500' : 'text-emerald-600'}`}>
                  {Math.round((rules.budgetWeight + rules.styleWeight + rules.dateWeight + rules.vendorRatingWeight + rules.historicalCaseWeight) * 100)}%
                </span>
              </span>
              {Math.abs((rules.budgetWeight + rules.styleWeight + rules.dateWeight + rules.vendorRatingWeight + rules.historicalCaseWeight) * 100 - 100) > 5 && (
                <span className="flex items-center gap-1 text-wine-500"><AlertTriangle className="w-4 h-4" /> 建议调整至100%</span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="section-title text-base mb-4"><AlertTriangle className="w-4 h-4 text-brand-500" /> 时间阈值配置</div>
              <div className="space-y-4">
                {([
                  { k: 'autoLockHours' as const, l: '档期锁定时长', u: '小时', h: '锁定后超过此时长未付款自动释放' },
                  { k: 'acceptTimeoutHours' as const, l: '接单确认超时', u: '小时', h: '超过此时长未接单自动转派' },
                  { k: 'overrunWarningThreshold' as const, l: '超支预警阈值', u: '%', h: '费用超出预算此比例触发红色预警' },
                  { k: 'overdueReminderDays' as const, l: '逾期催缴天数', u: '天', h: '逾期超过此天数自动催缴' },
                  { k: 'lateFeeRatePerDay' as const, l: '每日滞纳金', u: '%', h: '逾期每日加收的滞纳金比例' },
                ]).map(({ k, l, u, h }) => (
                  <div key={k}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-warm-600">{l}</label>
                      <div className="flex items-center gap-1">
                        <input type="number" value={rules[k]} step={k.includes('Rate') ? 0.01 : 1}
                          onChange={e => setRules({ ...rules, [k]: +e.target.value })}
                          className="w-20 input-field !py-1.5 text-right text-sm tabular-nums" />
                        <span className="text-xs text-warm-400 w-8">{u}</span>
                      </div>
                    </div>
                    <div className="text-xs text-warm-400">{h}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setRules({
                budgetWeight: 0.30, styleWeight: 0.25, dateWeight: 0.15,
                vendorRatingWeight: 0.15, historicalCaseWeight: 0.15,
                autoLockHours: 24, acceptTimeoutHours: 2, overrunWarningThreshold: 10,
                overdueReminderDays: 7, lateFeeRatePerDay: 0.05,
              })} className="btn-secondary flex-1 !py-2 text-sm">
                <RotateCcw className="w-4 h-4" /> 恢复默认
              </button>
              <button onClick={saveRecommendRules} className="btn-primary flex-1 !py-2 text-sm">
                <Save className="w-4 h-4" /> 保存配置
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'reward' && rewards && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2 animate-fade-up">
            <div className="section-title"><Trophy className="w-5 h-5 text-brand-500" /> 供应商等级与奖金倍率</div>
            <p className="text-sm text-warm-500 mb-4">根据供应商完成率自动评定等级，享受对应奖金倍率</p>
            <div className="space-y-3">
              {rewards.vendorTiers.map((tier, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 items-center p-4 rounded-xl bg-card-gradient border border-blush-100">
                  <div>
                    <label className="text-xs text-warm-500 mb-1 block">等级名称</label>
                    <input value={tier.tier} onChange={e => {
                      const next = [...rewards.vendorTiers]; next[i].tier = e.target.value;
                      setRewards({ ...rewards, vendorTiers: next });
                    }} className="input-field !py-1.5 font-serif text-lg font-bold" />
                  </div>
                  <div>
                    <label className="text-xs text-warm-500 mb-1 block">最低完成率 (%)</label>
                    <input type="number" value={tier.minCompletionRate}
                      onChange={e => {
                        const next = [...rewards.vendorTiers]; next[i].minCompletionRate = +e.target.value;
                        setRewards({ ...rewards, vendorTiers: next });
                      }} className="input-field !py-1.5 tabular-nums" />
                  </div>
                  <div>
                    <label className="text-xs text-warm-500 mb-1 block">奖金倍率 (%)</label>
                    <input type="number" value={tier.bonusRate}
                      onChange={e => {
                        const next = [...rewards.vendorTiers]; next[i].bonusRate = +e.target.value;
                        setRewards({ ...rewards, vendorTiers: next });
                      }} className="input-field !py-1.5 tabular-nums text-brand-600 font-bold" />
                  </div>
                  <div className="h-10 flex items-center justify-center">
                    <span className="text-xs text-warm-400">等级 {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
              <div className="section-title text-base mb-4">💰 奖励规则 (元)</div>
              <div className="space-y-3">
                {([
                  { k: 'taskAcceptBonus' as const, l: '及时接单奖励', d: '在15分钟内确认接单可获得' },
                  { k: 'fastDeliveryBonus' as const, l: '提前交付奖励', d: '提前24小时完成并提交可获得' },
                  { k: 'highRatingBonus' as const, l: '满分好评奖励', d: '客户评价5星可额外获得' },
                ]).map(({ k, l, d }) => (
                  <div key={k} className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-warm-700">{l}</label>
                      <div className="flex items-center gap-1">
                        <span className="text-brand-500">¥</span>
                        <input type="number" value={rewards[k]}
                          onChange={e => setRewards({ ...rewards, [k]: +e.target.value })}
                          className="w-20 input-field !py-1 text-right text-sm tabular-nums !bg-white" />
                      </div>
                    </div>
                    <div className="text-xs text-warm-400">{d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="section-title text-base mb-4">⚠️ 惩罚规则 (元)</div>
              <div className="space-y-3">
                {([
                  { k: 'reassignmentPenalty' as const, l: '超时转派罚金', d: '未按时接单被系统自动转派' },
                  { k: 'overduePenalty' as const, l: '逾期交付罚金', d: '超过截止日期仍未提交交付物' },
                ]).map(({ k, l, d }) => (
                  <div key={k} className="p-3 rounded-xl bg-wine-50 border border-wine-100">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-warm-700">{l}</label>
                      <div className="flex items-center gap-1">
                        <span className="text-wine-500">-¥</span>
                        <input type="number" value={rewards[k]}
                          onChange={e => setRewards({ ...rewards, [k]: +e.target.value })}
                          className="w-20 input-field !py-1 text-right text-sm tabular-nums !bg-white" />
                      </div>
                    </div>
                    <div className="text-xs text-warm-400">{d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setRewards({
                vendorTiers: [
                  { tier: '金牌', minCompletionRate: 98, bonusRate: 8 },
                  { tier: '银牌', minCompletionRate: 95, bonusRate: 5 },
                  { tier: '铜牌', minCompletionRate: 90, bonusRate: 3 },
                  { tier: '标准', minCompletionRate: 0, bonusRate: 0 },
                ],
                taskAcceptBonus: 50, fastDeliveryBonus: 100, highRatingBonus: 200,
                reassignmentPenalty: 100, overduePenalty: 300,
              })} className="btn-secondary flex-1 !py-2 text-sm">
                <RotateCcw className="w-4 h-4" /> 默认
              </button>
              <button onClick={saveRewardRules} className="btn-primary flex-1 !py-2 text-sm">
                <Save className="w-4 h-4" /> 保存
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden animate-fade-up">
          <div className="p-5 flex items-center justify-between border-b border-blush-100">
            <div className="section-title !mb-0"><Users className="w-5 h-5 text-brand-500" /> 用户权限管理</div>
            <button className="btn-primary !py-2 !px-4 text-sm">+ 新增用户</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ivory-50 border-b border-blush-100">
                <tr className="text-left text-xs text-warm-500">
                  <th className="px-5 py-3 font-medium">用户信息</th>
                  <th className="px-5 py-3 font-medium">角色</th>
                  <th className="px-5 py-3 font-medium">服务类型</th>
                  <th className="px-5 py-3 font-medium">联系电话</th>
                  <th className="px-5 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blush-50">
                {users.map((u, i) => {
                  const roleInfo: Record<string, { l: string; c: string }> = {
                    customer: { l: '客户', c: 'text-wine-600 bg-wine-50' },
                    planner: { l: '策划师', c: 'text-brand-600 bg-brand-50' },
                    vendor: { l: '供应商', c: 'text-emerald-600 bg-emerald-50' },
                    admin: { l: '管理员', c: 'text-violet-600 bg-violet-50' },
                  };
                  const r = roleInfo[u.role];
                  return (
                    <tr key={u.id} className="hover:bg-ivory-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-gradient text-white flex items-center justify-center font-medium text-sm shadow-sm">
                            {u.avatar || u.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-warm-700">{u.name}</div>
                            {u.email && <div className="text-xs text-warm-400">{u.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${r.c}`}>{r.l}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-warm-600">
                        {u.vendorType ? TASK_TYPE_LABELS[u.vendorType] : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-warm-500 tabular-nums font-mono">{u.phone}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button className="btn-ghost !py-1 !px-3 text-xs">编辑</button>
                          <button className="btn-ghost !py-1 !px-3 text-xs text-wine-500 hover:text-wine-600 hover:bg-wine-50">禁用</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
