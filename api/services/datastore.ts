import type {
  User, WeddingProject, PackagePlan, FinanceRecord,
  DashboardOverview, RecommendRules, RewardRules,
  Task, TaskStatus, TaskType, ConsultationForm, LockResult, UserRole
} from '../../shared/index.js';
import {
  MOCK_USERS, MOCK_PROJECTS, MOCK_PACKAGES, MOCK_FINANCES,
  MOCK_DASHBOARD, DEFAULT_RECOMMEND_RULES, DEFAULT_REWARD_RULES,
  DEFAULT_LOGIN_USERS
} from '../../shared/mock-data.js';

let users: User[] = [...MOCK_USERS];
let projects: WeddingProject[] = [...MOCK_PROJECTS];
let packages: PackagePlan[] = [...MOCK_PACKAGES];
let finances: FinanceRecord[] = [...MOCK_FINANCES];
let dashboard: DashboardOverview = JSON.parse(JSON.stringify(MOCK_DASHBOARD));
let recommendRules: RecommendRules = { ...DEFAULT_RECOMMEND_RULES };
let rewardRules: RewardRules = JSON.parse(JSON.stringify(DEFAULT_REWARD_RULES));
const locks = new Map<string, LockResult>();

export const DataStore = {
  auth: {
    login: (phone: string, password: string, role: UserRole): { user: User; token: string; permissions: string[] } | null => {
      const credKey = role as keyof typeof DEFAULT_LOGIN_USERS;
      const creds = DEFAULT_LOGIN_USERS[credKey];
      if (!creds || creds.phone !== phone || creds.password !== password) return null;
      const user = users.find(u => u.phone === phone && u.role === role);
      if (!user) return null;
      const permissionMap: Record<UserRole, string[]> = {
        customer: ['projects:view_own', 'tasks:verify', 'finance:view_own', 'consultation:submit'],
        planner: ['projects:*', 'tasks:*', 'finance:view', 'consultation:*', 'vendor:view'],
        vendor: ['tasks:view_own', 'tasks:accept', 'tasks:submit', 'dashboard:view_own'],
        admin: ['*'],
      };
      return { user, token: `token-${user.id}-${Date.now()}`, permissions: permissionMap[role] };
    },
  },

  dashboard: {
    getOverview: (role: UserRole, userId: string): DashboardOverview => {
      const result = JSON.parse(JSON.stringify(dashboard)) as DashboardOverview;
      if (role === 'customer') {
        result.projectProgress = result.projectProgress.slice(0, 2);
      } else if (role === 'vendor') {
        result.vendorRanking = result.vendorRanking.filter(v => v.vendorId === userId).concat(result.vendorRanking.slice(0, 3));
      }
      return result;
    },
    getRealtime: (): DashboardOverview => {
      dashboard.kpis.activeProjects += Math.random() > 0.7 ? 1 : 0;
      dashboard.kpis.monthlyRevenue += Math.floor(Math.random() * 1000);
      dashboard.projectProgress.forEach(p => {
        if (p.progress < 100) p.progress = Math.min(100, p.progress + Math.floor(Math.random() * 3));
      });
      dashboard.vendorRanking.forEach(v => {
        v.completionRate = Math.min(100, v.completionRate + (Math.random() - 0.3) * 0.5);
      });
      return JSON.parse(JSON.stringify(dashboard));
    },
  },

  consultation: {
    getPackages: (): PackagePlan[] => packages,
    recommend: (form: ConsultationForm): PackagePlan[] => {
      const budgetMid = (form.budget[0] + form.budget[1]) / 2;
      const scored = packages.map(pkg => {
        let score = pkg.matchScore;
        const priceDiff = Math.abs(pkg.totalPrice - budgetMid) / budgetMid;
        if (priceDiff < 0.1) score += 5;
        else if (priceDiff < 0.2) score += 2;
        if (form.styles.length > 0) score += Math.min(5, form.styles.length * 1.5);
        if (pkg.availableSlots > 3) score += 2;
        return { ...pkg, matchScore: Math.min(99, Math.round(score)) };
      });
      return scored.sort((a, b) => b.matchScore - a.matchScore);
    },
    lockResources: (planId: string): LockResult | null => {
      const pkg = packages.find(p => p.planId === planId);
      if (!pkg) return null;
      const now = new Date();
      const expires = new Date(now.getTime() + recommendRules.autoLockHours * 3600000);
      const items = [
        { type: 'venue' as TaskType, name: pkg.includes.venue.name, locked: pkg.includes.venue.available },
        { type: 'photography' as TaskType, name: pkg.includes.photography.name, locked: pkg.includes.photography.available },
        { type: 'makeup' as TaskType, name: pkg.includes.makeup.name, locked: pkg.includes.makeup.available },
      ];
      const lockId = `lock-${Date.now()}`;
      const result: LockResult = {
        lockId, lockedAt: now.toISOString(), expiresAt: expires.toISOString(),
        items, totalDeposit: Math.round(pkg.totalPrice * 0.3),
      };
      locks.set(lockId, result);
      return result;
    },
    getLockStatus: (lockId: string): LockResult | null => locks.get(lockId) ?? null,
  },

  projects: {
    getAll: (role: UserRole, userId: string): WeddingProject[] => {
      if (role === 'customer' || role === 'planner') {
        return projects.slice(0, 6);
      }
      return projects;
    },
    getById: (id: string): WeddingProject | undefined => projects.find(p => p.id === id),
    create: (data: Partial<WeddingProject>): WeddingProject => {
      const newProject: WeddingProject = {
        id: `proj-${Date.now()}`,
        coupleName: data.coupleName || '新夫妇',
        weddingDate: data.weddingDate || new Date(Date.now() + 86400000 * 60).toISOString(),
        location: data.location || '待确认',
        guestCount: data.guestCount || 100,
        totalBudget: data.totalBudget || 88800,
        spentAmount: 0,
        status: 'pending',
        progress: 0,
        plannerId: 'u-planner-001',
        plannerName: '李梦琪',
        customerId: 'u-customer-001',
        packageType: data.packageType || 'standard',
        timeline: [],
        tasks: [],
      };
      projects.unshift(newProject);
      dashboard.kpis.activeProjects++;
      return newProject;
    },
  },

  tasks: {
    getByVendor: (vendorId: string): Task[] => {
      const all: Task[] = [];
      projects.forEach(p => {
        p.tasks.forEach(t => {
          if (t.assignedVendorId === vendorId) {
            all.push({ ...t, coupleName: p.coupleName, weddingDate: p.weddingDate });
          }
        });
      });
      return all;
    },
    accept: (taskId: string, vendorId: string): Task | null => {
      for (const p of projects) {
        const t = p.tasks.find(x => x.id === taskId);
        if (t && t.assignedVendorId === vendorId && (t.status === 'assigned' || t.status === 'reassigned')) {
          t.status = 'accepted';
          t.acceptedAt = new Date().toISOString();
          return t;
        }
      }
      return null;
    },
    reassign: (taskId: string): Task | null => {
      for (const p of projects) {
        const t = p.tasks.find(x => x.id === taskId);
        if (t) {
          t.status = 'reassigned';
          t.reassignedCount++;
          return t;
        }
      }
      return null;
    },
    submit: (taskId: string, vendorId: string, mediaUrls: string[], note: string): Task | null => {
      for (const p of projects) {
        const t = p.tasks.find(x => x.id === taskId);
        if (t && t.assignedVendorId === vendorId) {
          t.status = 'submitted';
          t.submissions.push({
            id: `sub-${Date.now()}`, taskId, submittedAt: new Date().toISOString(),
            mediaUrls, note, submittedBy: vendorId,
          });
          return t;
        }
      }
      return null;
    },
    verify: (taskId: string, rating: number, comment: string): Task | null => {
      for (const p of projects) {
        const t = p.tasks.find(x => x.id === taskId);
        if (t && t.status === 'submitted') {
          t.status = 'verified';
          t.verification = {
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'u-customer-001', rating, comment,
          };
          const allVerified = p.tasks.every(x => x.status === 'verified');
          if (allVerified) {
            p.progress = 100;
            p.status = 'completed';
          } else {
            p.progress = Math.round(p.tasks.filter(x => x.status === 'verified').length / p.tasks.length * 100);
          }
          return t;
        }
      }
      return null;
    },
  },

  finance: {
    getAll: (): FinanceRecord[] => finances,
    getDetail: (id: string): FinanceRecord | undefined => finances.find(f => f.id === id),
    getWarnings: (): FinanceRecord['warnings'] => finances.flatMap(f => f.warnings.map(w => ({ ...w, coupleName: f.coupleName, projectId: f.projectId }))),
    remind: (projectId: string): boolean => {
      const f = finances.find(x => x.projectId === projectId);
      if (!f) return false;
      f.warnings.forEach(w => { if (w.type === 'overdue') w.notifiedCustomer = true; });
      return true;
    },
  },

  settings: {
    getRecommendRules: (): RecommendRules => ({ ...recommendRules }),
    updateRecommendRules: (r: Partial<RecommendRules>): RecommendRules => {
      recommendRules = { ...recommendRules, ...r };
      return recommendRules;
    },
    getRewardRules: (): RewardRules => JSON.parse(JSON.stringify(rewardRules)),
    updateRewardRules: (r: Partial<RewardRules>): RewardRules => {
      rewardRules = { ...rewardRules, ...r, vendorTiers: r.vendorTiers || rewardRules.vendorTiers };
      return rewardRules;
    },
    getUsers: (): User[] => users,
  },

  reports: {
    monthly: (): { content: string; filename: string } => {
      const data = dashboard;
      let csv = '指标,数值\n';
      csv += `进行中项目数,${data.kpis.activeProjects}\n`;
      csv += `本月营收,${data.kpis.monthlyRevenue}\n`;
      csv += `平均满意度,${data.kpis.avgSatisfaction}\n`;
      csv += `供应商总数,${data.kpis.totalVendors}\n`;
      csv += '\n月度营收,营收,成本\n';
      data.revenueBreakdown.monthly.forEach(m => { csv += `${m.month},${m.revenue},${m.cost}\n`; });
      return { content: csv, filename: `月度运营分析报告_${new Date().toISOString().slice(0, 7)}.csv` };
    },
  },
};

export default DataStore;
