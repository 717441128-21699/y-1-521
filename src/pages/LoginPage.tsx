import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Phone, Lock, Users, Sparkles, UserSquare2, Settings, User } from 'lucide-react';
import type { UserRole } from '@shared/index';
import { useAuth } from '../store/auth';

interface RoleOption { value: UserRole; label: string; icon: React.ElementType; desc: string; phone: string; }

const ROLE_OPTIONS: RoleOption[] = [
  { value: 'customer', label: '客户', icon: User, desc: '查看婚礼进度与费用', phone: '13800000001' },
  { value: 'planner', label: '策划师', icon: Sparkles, desc: '管理分配的婚礼项目', phone: '13800000002' },
  { value: 'vendor', label: '供应商', icon: UserSquare2, desc: '接单与上传交付物', phone: '13800000003' },
  { value: 'admin', label: '管理员', icon: Settings, desc: '全局管理与规则配置', phone: '13900000001' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('admin');
  const [phone, setPhone] = useState('13900000001');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const current = ROLE_OPTIONS.find(r => r.value === role);
    if (current && password !== '123456') setPassword('123456');
  }, [role]);

  const handleRoleChange = (r: RoleOption) => {
    setRole(r.value);
    setPhone(r.phone);
    setPassword('123456');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const ok = await login(phone, password, role);
      if (ok) navigate('/', { replace: true });
      else setError('账号或密码错误，请检查角色是否匹配');
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-ivory-100">
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(232,196,160,0.2) 0%, rgba(123,45,38,0.15) 100%), url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&h=1000&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
        <div className="relative z-10 max-w-xl px-16 text-white">
          <div className="flex items-center gap-4 mb-10 animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Heart className="w-9 h-9 text-white" fill="white" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold">智慧婚庆</h1>
              <p className="text-lg text-white/80 font-light">服务管理平台 · Wedding Service Platform</p>
            </div>
          </div>

          <h2 className="font-serif text-5xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            让每一场婚礼<br />
            <span className="bg-gradient-to-r from-amber-100 to-rose-200 bg-clip-text text-transparent">
              都成为永恒的记忆
            </span>
          </h2>
          <p className="text-white/85 text-lg mb-12 animate-fade-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            整合客户咨询、智能推荐、供应商协同、任务执行和费用结算<br />
            打造全链路数字化婚庆服务体验
          </p>

          <div className="grid grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {[
              { num: '300%', label: '策划效率提升' },
              { num: '95%', label: '档期冲突降低' },
              { num: '4.86', label: '平均客户满意度' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                <div className="font-serif text-3xl font-bold text-amber-100">{s.num}</div>
                <div className="text-sm text-white/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-wine-900/40 via-transparent to-transparent" />
      </div>

      <div className="w-full lg:w-2/5 flex items-center justify-center px-6 py-10 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-gradient flex items-center justify-center shadow-rose-gold mb-3">
              <Heart className="w-7 h-7 text-white" fill="white" />
            </div>
            <h1 className="font-serif text-2xl font-bold gradient-text">智慧婚庆</h1>
            <p className="text-warm-400 text-sm">服务管理平台</p>
          </div>

          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-warm-800 mb-2">欢迎回来 👋</h2>
            <p className="text-warm-500">请选择身份并登录您的账号</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLE_OPTIONS.map(r => {
              const Icon = r.icon;
              const active = role === r.value;
              return (
                <button key={r.value} onClick={() => handleRoleChange(r)}
                  className={`text-left p-3.5 rounded-2xl border-2 transition-all duration-300
                    ${active ? 'border-brand-300 bg-brand-50 shadow-rose-gold' : 'border-warm-100 bg-white hover:border-brand-100'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${active ? 'bg-brand-gradient text-white' : 'bg-blush-100 text-brand-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className={`text-sm font-semibold ${active ? 'text-brand-700' : 'text-warm-700'}`}>{r.label}</div>
                  <div className="text-xs text-warm-400 mt-0.5">{r.desc}</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="label-text">手机号码</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-warm-400" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  autoComplete="off"
                  className="input-field pl-11" placeholder="请输入手机号" />
              </div>
            </div>

            <div>
              <label className="label-text">登录密码</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-warm-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="input-field pl-11" placeholder="请输入密码" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-wine-50 text-wine-600 text-sm flex items-center gap-2 animate-shake">
                <Users className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-ivory-50 border border-blush-100">
            <div className="text-xs text-warm-500 mb-2 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> 演示账号提示
            </div>
            <div className="text-xs text-warm-400 leading-relaxed">
              默认密码均为 <span className="text-brand-600 font-mono font-semibold">123456</span>，
              切换上方身份即可自动填入对应手机号，点击登录即可体验。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
