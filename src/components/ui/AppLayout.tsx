import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileQuestion, FolderKanban, UserSquare2,
  Wallet, Settings, LogOut, Heart, Users, Sparkles
} from 'lucide-react';
import type { UserRole } from '@shared/index';
import { useAuth } from '../../store/auth';

interface NavItem {
  path: string; label: string; icon: React.ElementType; roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '数据大屏', icon: LayoutDashboard, roles: ['admin', 'planner', 'vendor', 'customer'] },
  { path: '/consultation', label: '客户咨询', icon: FileQuestion, roles: ['admin', 'planner', 'customer'] },
  { path: '/projects', label: '项目管理', icon: FolderKanban, roles: ['admin', 'planner', 'customer'] },
  { path: '/vendor', label: '供应商工作台', icon: UserSquare2, roles: ['admin', 'planner', 'vendor'] },
  { path: '/finance', label: '费用结算', icon: Wallet, roles: ['admin', 'planner', 'customer'] },
  { path: '/settings', label: '系统设置', icon: Settings, roles: ['admin'] },
];

const ROLE_LABELS: Record<UserRole, { label: string; icon: React.ElementType; color: string }> = {
  customer: { label: '客户', icon: Heart, color: 'text-wine-500 bg-wine-50' },
  planner: { label: '策划师', icon: Sparkles, color: 'text-brand-600 bg-brand-50' },
  vendor: { label: '供应商', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
  admin: { label: '管理员', icon: Settings, color: 'text-violet-600 bg-violet-50' },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(user.role));
  const roleInfo = ROLE_LABELS[user.role];
  const RoleIcon = roleInfo.icon;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ivory-100">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-blush-100 shadow-sm flex flex-col">
        <div className="px-6 py-5 border-b border-blush-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-rose-gold">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <div className="font-serif text-lg font-semibold gradient-text">智慧婚庆</div>
            <div className="text-xs text-warm-400">服务管理平台</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive ? 'bg-brand-gradient text-white shadow-rose-gold' : 'text-warm-500 hover:bg-blush-50 hover:text-brand-600'}`}>
                <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-blush-100 space-y-2">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-ivory-50`}>
            <div className="w-10 h-10 rounded-full bg-brand-gradient text-white font-semibold flex items-center justify-center text-sm shadow-sm">
              {user.avatar || user.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-warm-700 text-sm truncate">{user.name}</div>
              <div className={`inline-flex items-center gap-1 text-xs mt-0.5 px-1.5 py-0.5 rounded-full ${roleInfo.color}`}>
                <RoleIcon className="w-3 h-3" />
                {roleInfo.label}
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-wine-500 hover:bg-wine-50 transition-colors">
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
