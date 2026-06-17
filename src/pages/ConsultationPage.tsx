import { useState } from 'react';
import {
  Filter, Sparkles, MapPin, Users, Calendar, DollarSign, Palette,
  Lock, Clock, Check, ChevronRight, Star, Heart, Zap, Award, Shield, AlertTriangle
} from 'lucide-react';
import { apiFetch } from '../store/auth';
import type { PackagePlan, ConsultationForm, LockResult } from '@shared/index';
import { PACKAGE_TYPE_LABELS, TASK_TYPE_LABELS } from '@shared/index';
import { useEffect } from 'react';

const WEDDING_STYLES = [
  { id: 'romantic', label: '浪漫唯美', icon: Heart, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=200&fit=crop' },
  { id: 'modern', label: '现代简约', icon: Sparkles, img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop' },
  { id: 'classic', label: '复古经典', icon: Award, img: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300&h=200&fit=crop' },
  { id: 'chinese', label: '中式传统', icon: Shield, img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=200&fit=crop' },
  { id: 'outdoor', label: '户外森系', icon: Palette, img: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=300&h=200&fit=crop' },
  { id: 'luxury', label: '奢华大气', icon: Zap, img: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=300&h=200&fit=crop' },
];

function formatPrice(n: number) { return '¥' + n.toLocaleString('zh-CN'); }

export default function ConsultationPage() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState<ConsultationForm>({
    budget: [50000, 150000],
    guestCount: 120,
    weddingDate: '',
    styles: [],
    preferredCity: '上海',
  });
  const [packages, setPackages] = useState<PackagePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [lockResult, setLockResult] = useState<LockResult | null>(null);
  const [countdown, setCountdown] = useState('');
  const [loadingLockStatus, setLoadingLockStatus] = useState(false);

  useEffect(() => {
    const restoreLock = async () => {
      try {
        const saved = localStorage.getItem('wedding_lock_result');
        if (saved) {
          const parsed = JSON.parse(saved) as LockResult;
          setLoadingLockStatus(true);
          try {
            const status = await apiFetch<LockResult | null>(`/api/consultation/lock-status/${parsed.lockId}`);
            if (status && !status.isExpired) {
              setLockResult(status);
              setStep(2);
            } else if (status?.isExpired) {
              setLockResult({ ...parsed, isExpired: true });
              setCountdown('已过期');
              setStep(2);
            } else {
              localStorage.removeItem('wedding_lock_result');
            }
          } catch {
            localStorage.removeItem('wedding_lock_result');
          }
          setLoadingLockStatus(false);
        }
      } catch {}
    };
    restoreLock();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await apiFetch<PackagePlan[]>('/api/consultation/packages');
      setPackages(data);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!lockResult) return;
    const checkStatus = async () => {
      const status = await apiFetch<LockResult | null>(`/api/consultation/lock-status/${lockResult.lockId}`);
      if (status && status.isExpired) {
        setLockResult({ ...lockResult, isExpired: true });
        setCountdown('已过期');
      } else if (!status) {
        clearLockResult();
        setCountdown('已过期');
      }
    };
    const t = setInterval(() => {
      checkStatus();
      const remain = new Date(lockResult.expiresAt).getTime() - Date.now();
      if (remain <= 0) { setCountdown('已过期'); clearInterval(t); return; }
      const h = Math.floor(remain / 3600000);
      const m = Math.floor((remain % 3600000) / 60000);
      const s = Math.floor((remain % 60000) / 1000);
      setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, [lockResult]);

  const toggleStyle = (id: string) => {
    setForm(f => ({ ...f, styles: f.styles.includes(id) ? f.styles.filter(s => s !== id) : [...f.styles, id] }));
  };

  const getRecommendations = async () => {
    setLoading(true);
    const data = await apiFetch<PackagePlan[]>('/api/consultation/recommend', {
      method: 'POST', body: JSON.stringify(form),
    });
    setPackages(data);
    setStep(1);
    setLoading(false);
  };

  const lockResources = async (planId: string) => {
    const data = await apiFetch<LockResult>('/api/consultation/lock', {
      method: 'POST', body: JSON.stringify({ planId }),
    });
    setLockResult(data);
    try { localStorage.setItem('wedding_lock_result', JSON.stringify(data)); } catch {}
    setStep(2);
  };

  const clearLockResult = () => {
    setLockResult(null);
    try { localStorage.removeItem('wedding_lock_result'); } catch {}
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold gradient-text flex items-center gap-3">
          <Filter className="w-7 h-7 text-wine-500" /> 客户咨询与方案推荐
        </h1>
        <p className="text-warm-500 text-sm mt-1.5">填写需求 → AI智能匹配 → 一键锁定档期，完成您的完美婚礼方案</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {['填写需求', '方案推荐', '档期锁定'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${step >= i ? 'bg-brand-gradient text-white shadow-rose-gold' : 'bg-blush-100 text-warm-400'}`}>
              {step > i ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${step >= i ? 'text-warm-700' : 'text-warm-400'}`}>{s}</span>
            {i < 2 && <ChevronRight className="w-4 h-4 text-warm-300 mx-1" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-6 max-w-4xl">
          <div className="card p-6 animate-fade-up">
            <div className="section-title"><DollarSign className="w-5 h-5 text-brand-500" /> 预算范围</div>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <input type="range" min={30000} max={400000} step={10000} value={form.budget[0]}
                  onChange={e => setForm({ ...form, budget: [+e.target.value, form.budget[1]] })}
                  className="w-full accent-brand-400" />
                <input type="range" min={30000} max={400000} step={10000} value={form.budget[1]}
                  onChange={e => setForm({ ...form, budget: [form.budget[0], +e.target.value] })}
                  className="w-full accent-brand-400 mt-2" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-serif font-bold gradient-text tabular-nums">
                  {form.budget[0].toLocaleString()} - {form.budget[1].toLocaleString()}
                </div>
                <div className="text-xs text-warm-400">预计花费 (元)</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
              <label className="label-text flex items-center gap-2"><Users className="w-4 h-4 text-brand-500" /> 预计宾客人数</label>
              <input type="number" value={form.guestCount} onChange={e => setForm({ ...form, guestCount: +e.target.value })}
                className="input-field" min={20} step={10} />
              <div className="text-xs text-warm-400 mt-2">建议 20-500 人</div>
            </div>
            <div className="card p-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <label className="label-text flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-500" /> 预计婚期</label>
              <input type="date" value={form.weddingDate} onChange={e => setForm({ ...form, weddingDate: e.target.value })}
                className="input-field" min={new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)} />
              <div className="text-xs text-warm-400 mt-2">建议提前3个月以上</div>
            </div>
            <div className="card p-5 animate-fade-up" style={{ animationDelay: '150ms' }}>
              <label className="label-text flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-500" /> 举办城市</label>
              <select value={form.preferredCity} onChange={e => setForm({ ...form, preferredCity: e.target.value })}
                className="input-field">
                {['上海', '北京', '广州', '深圳', '杭州', '苏州', '南京', '成都', '武汉', '宁波'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <div className="text-xs text-warm-400 mt-2">更多城市可联系策划师</div>
            </div>
          </div>

          <div className="card p-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="section-title"><Palette className="w-5 h-5 text-brand-500" /> 婚礼风格偏好 <span className="text-xs text-warm-400 font-normal">可多选</span></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {WEDDING_STYLES.map(s => {
                const active = form.styles.includes(s.id);
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => toggleStyle(s.id)}
                    className={`group rounded-xl overflow-hidden border-2 transition-all duration-300 relative
                      ${active ? 'border-brand-400 shadow-rose-gold' : 'border-transparent hover:border-brand-100'}`}>
                    <img src={s.img} alt={s.label} className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center gap-1.5 text-white">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium truncate">{s.label}</span>
                      {active && <Check className="w-3.5 h-3.5 ml-auto text-brand-200" />}
                    </div>
                    {active && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow">
                      <Check className="w-3 h-3" />
                    </div>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={getRecommendations} disabled={loading || !form.weddingDate || form.styles.length === 0}
              className="btn-primary !px-8 !py-3">
              {loading ? 'AI智能匹配中...' : (<><Sparkles className="w-4 h-4" /> 生成专属推荐方案</>)}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif text-xl font-semibold text-warm-700">为您匹配到 {packages.length} 套方案</div>
              <div className="text-sm text-warm-500">基于您的预算、风格偏好及供应商档期智能推荐</div>
            </div>
            <button onClick={() => setStep(0)} className="btn-secondary !py-2 !px-4 text-sm">重新填写需求</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {packages.map((pkg, i) => {
              const badgeClass = pkg.matchScore >= 90 ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                : pkg.matchScore >= 80 ? 'bg-gradient-to-r from-slate-300 to-slate-400'
                  : 'bg-warm-200';
              return (
                <div key={pkg.planId} className="card overflow-hidden group animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={pkg.casePhotos[0]} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className={`absolute top-3 right-3 ${badgeClass} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1`}>
                      <Star className="w-3 h-3" fill="white" /> 匹配度 {pkg.matchScore}%
                    </div>
                    <div className="absolute top-3 left-3 text-xs font-medium bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/20">
                      {PACKAGE_TYPE_LABELS[pkg.packageType]} · 余{pkg.availableSlots}档
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                      <div className="font-serif text-lg font-semibold drop-shadow">{pkg.name}</div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(pkg.includes).slice(0, 6).map(([k, item]) => item && (
                        <div key={k} className="p-2 rounded-lg bg-ivory-50 border border-blush-100 text-center">
                          <img src={item.thumbnail} alt="" className="w-full h-12 rounded object-cover mb-1" />
                          <div className="text-[10px] text-warm-500 truncate">{TASK_TYPE_LABELS[k as keyof typeof TASK_TYPE_LABELS]}</div>
                        </div>
                      ))}
                    </div>

                    <ul className="space-y-1">
                      {pkg.highlights.slice(0, 3).map((h, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-warm-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> {h}
                        </li>
                      ))}
                    </ul>

                    {pkg.recommendReasons && pkg.recommendReasons.length > 0 && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                        <div className="text-xs font-semibold text-amber-700 mb-1.5 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> 推荐理由
                        </div>
                        <ul className="space-y-1">
                          {pkg.recommendReasons.slice(0, 4).map((r, idx) => (
                            <li key={idx} className="text-[11px] text-amber-800 flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5">•</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-end justify-between pt-2 border-t border-blush-100">
                      <div>
                        <div className="text-xs text-warm-400 line-through tabular-nums">{formatPrice(pkg.originalPrice)}</div>
                        <div className="font-serif text-2xl font-bold gradient-text tabular-nums">{formatPrice(pkg.totalPrice)}</div>
                      </div>
                      <button onClick={() => lockResources(pkg.planId)} className="btn-primary !py-2 !px-5 text-sm">
                        <Lock className="w-4 h-4" /> 锁定档期
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          {(!lockResult || lockResult?.isExpired) && countdown === '已过期' ? (
            <div className="card p-8 text-center animate-fade-up">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-wine-50 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-wine-500" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-warm-800 mb-2">锁定已过期</h2>
              <p className="text-warm-500 mb-6">您的锁定已超过24小时有效期，所选资源已自动释放，请重新选择方案</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setStep(1)} className="btn-primary">返回方案列表</button>
                <button onClick={() => { clearLockResult(); setStep(0); }} className="btn-secondary">重新咨询</button>
              </div>
            </div>
          ) : lockResult && !lockResult.isExpired && (
            <div className="card p-8 text-center animate-fade-up">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                <Lock className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-warm-800 mb-2">档期已成功锁定！</h2>
              <p className="text-warm-500 mb-2">{lockResult.planName || '婚礼方案'}</p>
              <p className="text-warm-500 mb-6">所选资源已为您保留，请在倒计时结束前完成预付款支付</p>

            <div className="bg-gradient-to-r from-wine-50 to-brand-50 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-wine-500" />
                <span className="text-warm-600 font-medium">支付剩余时间</span>
              </div>
              <div className={`font-serif text-5xl font-bold tabular-nums ${countdown === '已过期' ? 'text-wine-500' : 'text-wine-600'} animate-pulse-slow`}>
                {countdown}
              </div>
            </div>

            <div className="text-left space-y-3 mb-6">
              <div className="text-sm font-medium text-warm-700 mb-2">已锁定资源：</div>
              {lockResult.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-ivory-50 border border-blush-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-warm-700">{TASK_TYPE_LABELS[item.type]}</div>
                      <div className="text-xs text-warm-500">{item.name}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.locked ? 'text-emerald-600 bg-emerald-50' : 'text-warm-500 bg-warm-100'}`}>
                    {item.locked ? '已锁定' : '锁定失败'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between p-5 rounded-2xl bg-card-gradient border border-blush-100 mb-6">
              <div className="text-left">
                <div className="text-xs text-warm-500">应付预付款 (30%)</div>
                <div className="font-serif text-3xl font-bold gradient-text tabular-nums">{formatPrice(lockResult.totalDeposit)}</div>
              </div>
              <button className="btn-primary !py-3 !px-8 text-base">
                立即支付 <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost">返回方案列表</button>
              <button onClick={() => { setLockResult(null); setStep(0); }} className="btn-secondary !py-2 text-sm">重新咨询</button>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
