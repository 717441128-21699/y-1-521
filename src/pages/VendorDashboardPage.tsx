import { useEffect, useState } from 'react';
import {
  UserSquare2, CheckCircle, AlertTriangle, Send, Image, Star,
  Calendar, Clock, ChevronRight, ListTodo, Award, TrendingUp, BarChart3,
  Upload
} from 'lucide-react';
import { apiFetch } from '../store/auth';
import type { Task, TaskStatus } from '@shared/index';
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS } from '@shared/index';
import { useAuth } from '../store/auth';

const TABS = [
  { key: 'assigned', label: '待接单', icon: AlertTriangle, filter: (t: Task) => t.status === 'assigned' || t.status === 'reassigned' },
  { key: 'progress', label: '进行中', icon: ListTodo, filter: (t: Task) => t.status === 'accepted' || t.status === 'in_progress' },
  { key: 'submitted', label: '已提交', icon: Send, filter: (t: Task) => t.status === 'submitted' },
  { key: 'verified', label: '已完成', icon: CheckCircle, filter: (t: Task) => t.status === 'verified' },
];

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<typeof TABS[number]['key']>('assigned');
  const [acceptCountdown, setAcceptCountdown] = useState<Record<string, number>>({});
  const [submitModal, setSubmitModal] = useState<Task | null>(null);
  const [submitNote, setSubmitNote] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await apiFetch<Task[]>('/api/tasks');
      setTasks(data);
      setLoading(false);
      const cd: Record<string, number> = {};
      data.forEach(t => {
        if (t.status === 'assigned' || t.status === 'reassigned') {
          cd[t.id] = 7200 - Math.floor(Math.random() * 3600);
        }
      });
      setAcceptCountdown(cd);
    };
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setAcceptCountdown(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { if (next[k] > 0) next[k] = Math.max(0, next[k] - 1); });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAccept = async (id: string) => {
    await apiFetch(`/api/tasks/${id}/accept`, { method: 'POST' });
    const data = await apiFetch<Task[]>('/api/tasks');
    setTasks(data);
  };

  const handleSubmit = async () => {
    if (!submitModal) return;
    await apiFetch(`/api/tasks/${submitModal.id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        mediaUrls: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop',
        ],
        note: submitNote || '交付物已上传，请查收',
      }),
    });
    setSubmitModal(null);
    setSubmitNote('');
    const data = await apiFetch<Task[]>('/api/tasks');
    setTasks(data);
  };

  const activeTab = TABS.find(t => t.key === tab)!;
  const filtered = tasks.filter(activeTab.filter);
  const stats = {
    total: tasks.length,
    assigned: tasks.filter(t => t.status === 'assigned' || t.status === 'reassigned').length,
    verified: tasks.filter(t => t.status === 'verified').length,
    avgRating: tasks.filter(t => t.verification).length > 0
      ? (tasks.filter(t => t.verification).reduce((s, t) => s + (t.verification?.rating || 0), 0) / tasks.filter(t => t.verification).length)
      : 0,
  };

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold gradient-text flex items-center gap-3">
            <UserSquare2 className="w-7 h-7 text-wine-500" /> 供应商工作台
          </h1>
          <p className="text-warm-500 text-sm mt-1.5">欢迎回来, {user?.name} · 请及时接单确认，超时将自动转派</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center"><ListTodo className="w-4.5 h-4.5 text-brand-500" /></div>
            <span className="text-xs text-warm-400">全部</span>
          </div>
          <div className="font-serif text-2xl font-bold text-warm-800 tabular-nums">{stats.total}</div>
          <div className="text-xs text-warm-500 mt-1">任务总数</div>
        </div>
        <div className={`card p-5 animate-fade-up ${stats.assigned > 0 ? 'ring-2 ring-wine-200' : ''}`} style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-wine-50 flex items-center justify-center"><AlertTriangle className={`w-4.5 h-4.5 text-wine-500 ${stats.assigned > 0 ? 'animate-pulse' : ''}`} /></div>
            <span className="text-xs text-warm-400">紧急</span>
          </div>
          <div className={`font-serif text-2xl font-bold tabular-nums ${stats.assigned > 0 ? 'text-wine-500' : 'text-warm-800'}`}>{stats.assigned}</div>
          <div className="text-xs text-warm-500 mt-1">待接单</div>
        </div>
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><CheckCircle className="w-4.5 h-4.5 text-emerald-500" /></div>
            <span className="text-xs text-warm-400">已完成</span>
          </div>
          <div className="font-serif text-2xl font-bold text-warm-800 tabular-nums">{stats.verified}</div>
          <div className="text-xs text-warm-500 mt-1">完成率 {stats.total > 0 ? Math.round(stats.verified / stats.total * 100) : 0}%</div>
        </div>
        <div className="card p-5 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><Star className="w-4.5 h-4.5 text-amber-500" fill="#f59e0b" /></div>
            <span className="text-xs text-warm-400">评分</span>
          </div>
          <div className="font-serif text-2xl font-bold text-warm-800 tabular-nums">{stats.avgRating.toFixed(2)}</div>
          <div className="text-xs text-warm-500 mt-1">客户平均评价</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          const count = tasks.filter(t.filter).length;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active ? 'bg-brand-gradient text-white shadow-rose-gold' : 'bg-white text-warm-500 hover:bg-blush-50 border border-blush-100'}`}>
              <Icon className="w-4 h-4" />
              {t.label}
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/25 text-white' : 'bg-wine-50 text-wine-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 rounded-2xl shimmer-bg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center text-warm-400">
          <Award className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <div className="text-lg font-medium text-warm-500 mb-1">暂无任务</div>
          <div className="text-sm">当前筛选条件下没有任务工单</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((task, i) => {
            const date = task.weddingDate ? new Date(task.weddingDate) : null;
            const cd = acceptCountdown[task.id];
            const colorClass = TASK_TYPE_COLORS[task.type];
            return (
              <div key={task.id} className="card overflow-hidden animate-fade-up relative group" style={{ animationDelay: `${i * 40}ms` }}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colorClass.split(' ')[0]}`} />
                <div className="p-5 pl-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center ${colorClass}`}>
                        <Image className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-warm-700">{task.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colorClass}`}>{TASK_TYPE_LABELS[task.type]}</span>
                        </div>
                        <div className="text-xs text-warm-400 mt-0.5 flex items-center gap-2">
                          <Calendar className="w-3 h-3 inline" /> {task.coupleName} · {date ? `${date.getMonth() + 1}月${date.getDate()}日婚礼` : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-warm-500 mb-4 line-clamp-2">{task.description}</p>

                  {(task.status === 'assigned' || task.status === 'reassigned') && cd !== undefined && (
                    <div className={`mb-4 p-3 rounded-xl flex items-center justify-between ${cd < 1800 ? 'bg-wine-50 border border-wine-100' : 'bg-amber-50 border border-amber-100'}`}>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${cd < 1800 ? 'text-wine-500 animate-pulse' : 'text-amber-600'}`} />
                        <span className={`text-xs ${cd < 1800 ? 'text-wine-600' : 'text-amber-700'}`}>
                          接单倒计时: <span className="font-mono font-bold text-base">{formatCountdown(cd)}</span>
                          {task.status === 'reassigned' && <span className="ml-2 bg-wine-100 px-1.5 py-0.5 rounded text-wine-600">转派任务</span>}
                        </span>
                      </div>
                      {cd < 1800 && <AlertTriangle className="w-4 h-4 text-wine-500 animate-pulse" />}
                    </div>
                  )}

                  {task.verification && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs text-emerald-700">客户已验收通过</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                        <span className="text-xs font-bold text-amber-600">{task.verification.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-blush-100">
                    <div className="text-xs text-warm-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      截止: {formatDate(task.deadline)}
                    </div>
                    <div className="flex-1" />

                    {(task.status === 'assigned' || task.status === 'reassigned') && (
                      <button onClick={() => handleAccept(task.id)} className="btn-primary !py-2 !px-4 text-sm">
                        <CheckCircle className="w-4 h-4" /> 立即接单
                      </button>
                    )}

                    {(task.status === 'accepted' || task.status === 'in_progress') && (
                      <>
                        <button className="btn-secondary !py-2 !px-3 text-xs">开始执行</button>
                        <button onClick={() => { setSubmitModal(task); setSubmitNote(''); }} className="btn-primary !py-2 !px-4 text-sm">
                          <Send className="w-4 h-4" /> 提交交付
                        </button>
                      </>
                    )}

                    {task.status === 'submitted' && (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-pulse" /> 等待客户验收...
                      </span>
                    )}

                    {(task.status === 'verified' || task.status === 'submitted') && (
                      <button className="btn-ghost !py-2 text-xs flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5" /> 详情 <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {submitModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-up">
            <h3 className="font-serif text-xl font-bold text-warm-800 mb-1">提交任务交付物</h3>
            <p className="text-warm-500 text-sm mb-5">{submitModal.title}</p>
            <div className="space-y-4">
              <div>
                <label className="label-text">现场照片/视频</label>
                <div className="p-8 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/30 text-center hover:bg-brand-50 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 mx-auto text-brand-400 mb-2" />
                  <div className="text-sm text-warm-600 mb-1">点击或拖拽文件上传</div>
                  <div className="text-xs text-warm-400">支持 JPG/PNG/MP4 · 模拟自动上传2张示例图片</div>
                </div>
              </div>
              <div>
                <label className="label-text">备注说明</label>
                <textarea value={submitNote} onChange={e => setSubmitNote(e.target.value)}
                  rows={3} className="input-field resize-none" placeholder="请填写交付说明或注意事项..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSubmitModal(null)} className="btn-secondary flex-1">取消</button>
              <button onClick={handleSubmit} className="btn-primary flex-1">
                <Send className="w-4 h-4" /> 确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
