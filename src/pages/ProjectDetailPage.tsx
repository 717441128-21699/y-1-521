import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar, MapPin, Users, DollarSign, ArrowLeft, Star, MessageCircle,
  CheckCircle, Clock, AlertTriangle, Image, Camera, Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../store/auth';
import type { WeddingProject, Task, TaskStatus, TimelineEvent } from '@shared/index';
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS, PACKAGE_TYPE_LABELS } from '@shared/index';

const TASK_STATUS_INFO: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: '待分配', color: 'bg-warm-100 text-warm-500' },
  assigned: { label: '待接单', color: 'bg-amber-100 text-amber-600' },
  accepted: { label: '已接单', color: 'bg-blue-100 text-blue-600' },
  in_progress: { label: '执行中', color: 'bg-violet-100 text-violet-600' },
  submitted: { label: '待验收', color: 'bg-brand-100 text-brand-600' },
  verified: { label: '已验收', color: 'bg-emerald-100 text-emerald-600' },
  reassigned: { label: '已转派', color: 'bg-wine-100 text-wine-600' },
};

const TIMELINE_STATUS: Record<TimelineEvent['status'], { icon: React.ElementType; color: string; dot: string }> = {
  completed: { icon: CheckCircle, color: 'text-emerald-600', dot: 'bg-emerald-500' },
  in_progress: { icon: Clock, color: 'text-brand-600', dot: 'bg-brand-400 animate-pulse' },
  upcoming: { icon: Clock, color: 'text-warm-400', dot: 'bg-warm-200' },
  delayed: { icon: AlertTriangle, color: 'text-wine-600', dot: 'bg-wine-500' },
};

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatCurrency(n: number) { return '¥' + n.toLocaleString('zh-CN'); }

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<WeddingProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'timeline' | 'tasks' | 'verify'>('timeline');
  const [verifyRating, setVerifyRating] = useState(5);

  useEffect(() => {
    const load = async () => {
      const data = await apiFetch<WeddingProject>(`/api/projects/${id}`);
      setProject(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleVerify = async (taskId: string) => {
    await apiFetch<Task>(`/api/tasks/${taskId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ rating: verifyRating, comment: '非常满意，交付质量高！' }),
    });
    const data = await apiFetch<WeddingProject>(`/api/projects/${id}`);
    setProject(data);
  };

  if (loading || !project) {
    return <div className="p-8"><div className="h-[600px] rounded-2xl shimmer-bg" /></div>;
  }

  const date = new Date(project.weddingDate);
  const verifiedTasks = project.tasks.filter(t => t.status === 'verified').length;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <Link to="/projects" className="inline-flex items-center gap-2 text-warm-500 hover:text-brand-600 mb-4 text-sm group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回项目列表
      </Link>

      <div className="card p-6 mb-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gradient opacity-5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-serif text-3xl font-bold text-warm-800 mb-1">{project.coupleName}</h1>
                <div className="text-warm-500 flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-500" />
                    {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日
                  </span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand-500" /> {project.location}</span>
                  <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-brand-500" /> {project.guestCount}位宾客</span>
                </div>
              </div>
              <span className="badge bg-brand-50 text-brand-600 text-xs">{PACKAGE_TYPE_LABELS[project.packageType]}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-ivory-50">
                <div className="text-xs text-warm-500 mb-1">合同总额</div>
                <div className="font-serif text-xl font-bold text-warm-800 tabular-nums">{formatCurrency(project.totalBudget)}</div>
              </div>
              <div className="p-4 rounded-xl bg-ivory-50">
                <div className="text-xs text-warm-500 mb-1">已支付</div>
                <div className="font-serif text-xl font-bold text-emerald-600 tabular-nums">{formatCurrency(project.spentAmount)}</div>
              </div>
              <div className="p-4 rounded-xl bg-ivory-50">
                <div className="text-xs text-warm-500 mb-1">项目进度</div>
                <div className="font-serif text-xl font-bold text-brand-600 tabular-nums">{project.progress}%</div>
              </div>
              <div className="p-4 rounded-xl bg-ivory-50">
                <div className="text-xs text-warm-500 mb-1">验收工单</div>
                <div className="font-serif text-xl font-bold text-warm-800 tabular-nums">{verifiedTasks}/{project.tasks.length}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 justify-center">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-warm-500">整体进度</span>
                <span className="font-medium text-warm-700 tabular-nums">{project.progress}%</span>
              </div>
              <div className="h-4 rounded-full bg-blush-100 overflow-hidden">
                <div className="h-full bg-brand-gradient rounded-full transition-all" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card-gradient border border-blush-100">
              <div className="w-10 h-10 rounded-full bg-brand-gradient text-white flex items-center justify-center font-medium">
                {project.plannerName.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="text-sm text-warm-500">专属策划师</div>
                <div className="font-medium text-warm-700">{project.plannerName}</div>
              </div>
              <button className="btn-ghost !px-3 !py-2"><MessageCircle className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'timeline' as const, label: '婚礼时间线', icon: Calendar },
          { key: 'tasks' as const, label: '任务工单', icon: Users, count: project.tasks.length },
          { key: 'verify' as const, label: '验收中心', icon: CheckCircle, count: project.tasks.filter(t => t.status === 'submitted').length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
              ${tab === t.key ? 'bg-brand-gradient text-white shadow-rose-gold' : 'bg-white text-warm-500 hover:bg-blush-50 border border-blush-100'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab === t.key ? 'bg-white/25' : 'bg-wine-50 text-wine-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'timeline' && (
        <div className="card p-6">
          <div className="section-title"><Calendar className="w-5 h-5 text-brand-500" /> 婚礼全流程时间线</div>
          <div className="relative pl-2">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-200 via-brand-200 to-warm-100" />
            {project.timeline.map((ev, i) => {
              const info = TIMELINE_STATUS[ev.status];
              const Icon = info.icon;
              return (
                <div key={ev.id} className="relative pl-14 pb-8 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className={`absolute left-0 w-10 h-10 rounded-full bg-white border-4 ${info.dot.replace('bg-', 'border-')} flex items-center justify-center shadow-sm`}>
                    <div className={`w-4 h-4 rounded-full ${info.dot}`} />
                  </div>
                  <div className="p-4 rounded-2xl border border-blush-100 bg-ivory-50/50 hover:bg-white hover:shadow-soft transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold flex items-center gap-2 ${ev.status === 'in_progress' ? 'text-brand-600' : 'text-warm-700'}`}>
                        {ev.title}
                        {ev.status === 'in_progress' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 animate-pulse">进行中</span>}
                      </h4>
                      <span className="text-xs text-warm-400 tabular-nums">{formatDate(ev.scheduledAt).slice(0, 16)}</span>
                    </div>
                    <p className="text-sm text-warm-500 leading-relaxed">{ev.description}</p>
                    {ev.completedAt && (
                      <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> 已完成 · {formatDate(ev.completedAt)}
                      </div>
                    )}
                    {ev.taskType && (
                      <div className={`mt-2 inline-flex text-[11px] px-2 py-0.5 rounded-full border ${TASK_TYPE_COLORS[ev.taskType]}`}>
                        {TASK_TYPE_LABELS[ev.taskType]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {project.tasks.map((t, i) => {
            const sInfo = TASK_STATUS_INFO[t.status];
            return (
              <div key={t.id} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center ${TASK_TYPE_COLORS[t.type]}`}>
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-warm-700">{t.title}</h4>
                      <div className={`text-[11px] mt-0.5 inline-flex px-2 py-0.5 rounded-full border ${TASK_TYPE_COLORS[t.type]}`}>
                        {TASK_TYPE_LABELS[t.type]}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${sInfo.color}`}>{sInfo.label}</span>
                </div>
                <p className="text-sm text-warm-500 mb-4 leading-relaxed">{t.description}</p>
                <div className="grid grid-cols-2 gap-3 text-xs mb-3 pb-3 border-b border-blush-100">
                  <div className="flex items-center gap-1.5 text-warm-500"><Users className="w-3.5 h-3.5 text-brand-500" /> {t.assignedVendorName}</div>
                  <div className="flex items-center gap-1.5 text-warm-500"><Clock className="w-3.5 h-3.5 text-brand-500" /> {formatDate(t.deadline).slice(0, 10)}</div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-warm-400">提交记录: {t.submissions.length} · 转派: {t.reassignedCount}次</span>
                  {t.verification && (
                    <span className="flex items-center gap-1 text-brand-500">
                      <Star className="w-3.5 h-3.5" fill="currentColor" /> {t.verification.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'verify' && (
        <div className="space-y-5">
          {project.tasks.filter(t => t.status === 'submitted' || t.status === 'verified').length === 0 ? (
            <div className="card p-16 text-center text-warm-400">
              <Upload className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <div className="text-lg font-medium text-warm-500 mb-1">暂无待验收的交付物</div>
              <div className="text-sm">供应商完成任务后会在此处提交照片/视频供您验收</div>
            </div>
          ) : (
            project.tasks.filter(t => t.status === 'submitted' || t.status === 'verified').map(t => (
              <div key={t.id} className="card p-5 animate-fade-up">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-warm-800 text-lg">{t.title}</h3>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${TASK_TYPE_COLORS[t.type]}`}>
                        {TASK_TYPE_LABELS[t.type]}
                      </span>
                      <span className={`badge ${TASK_STATUS_INFO[t.status].color}`}>{TASK_STATUS_INFO[t.status].label}</span>
                    </div>
                    <div className="text-xs text-warm-400 mt-1">供应商: {t.assignedVendorName}</div>
                  </div>
                </div>

                {t.submissions.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-warm-600 mb-2 flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-brand-500" /> 交付作品 ({t.submissions[0].mediaUrls.length}件)
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {t.submissions[0].mediaUrls.map((url, i) => (
                        <div key={i} className="aspect-video rounded-xl overflow-hidden group relative">
                          <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-3">
                            <button className="text-xs text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">点击查看大图</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-ivory-50 border border-blush-100">
                      <div className="text-xs text-warm-400 mb-1">供应商备注 · {formatDate(t.submissions[0].submittedAt)}</div>
                      <div className="text-sm text-warm-600">「{t.submissions[0].note}」</div>
                    </div>
                  </div>
                )}

                {t.status === 'verified' && t.verification ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                      <CheckCircle className="w-5 h-5" /> 已验收通过
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(t.verification.rating) ? 'text-amber-400' : 'text-warm-200'}`} fill="currentColor" />
                      ))}
                      <span className="ml-2 text-sm text-warm-600">{t.verification.rating.toFixed(1)}分</span>
                    </div>
                    <p className="text-sm text-warm-600">{t.verification.comment}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-warm-700">确认验收，为服务打分</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button key={i} onClick={() => setVerifyRating(i + 1)}
                            className={`transition-transform hover:scale-125 ${i < verifyRating ? 'text-amber-400' : 'text-warm-200'}`}>
                            <Star className="w-6 h-6" fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleVerify(t.id)} className="btn-primary !py-2 !px-5 text-sm flex-1">
                        <CheckCircle className="w-4 h-4" /> 确认验收并评价
                      </button>
                      <button className="btn-secondary !py-2 !px-5 text-sm">请求修改</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
