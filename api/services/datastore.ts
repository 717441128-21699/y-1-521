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
    getOverview: (role: UserRole, userId: string, dateRange?: { start: string; end: string; preset: string }): DashboardOverview => {
      const result = JSON.parse(JSON.stringify(dashboard)) as DashboardOverview;
      if (dateRange) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / 86400000);
        const multiplier = Math.min(1.5, Math.max(0.3, daysDiff / 30));

        result.kpis.activeProjects = Math.max(1, Math.round(result.kpis.activeProjects * multiplier * (0.8 + Math.random() * 0.4)));
        result.kpis.monthlyRevenue = Math.round(result.kpis.monthlyRevenue * multiplier * (0.85 + Math.random() * 0.3));
        result.kpis.avgSatisfaction = +(result.kpis.avgSatisfaction * (0.95 + Math.random() * 0.1)).toFixed(2);
        result.kpis.totalVendors = Math.round(result.kpis.totalVendors * Math.min(1, multiplier * 1.2));

        result.projectProgress = result.projectProgress.map(p => {
          const wedding = new Date(p.weddingDate);
          const inRange = wedding >= start && wedding <= end;
          return {
            ...p,
            status: inRange ? p.status : (Math.random() > 0.5 ? 'warning' : 'normal') as any,
            progress: Math.max(0, Math.min(100, p.progress + (inRange ? 0 : Math.round((Math.random() - 0.6) * 20)))),
          };
        });

        result.revenueBreakdown.monthly = result.revenueBreakdown.monthly.map((m, idx) => {
          const factor = (idx === 0 ? 1.2 : idx === 5 ? 0.7 : 0.9 + Math.random() * 0.3) * multiplier;
          return {
            ...m,
            revenue: Math.round(m.revenue * factor),
            cost: Math.round(m.cost * factor * 0.65),
          };
        });

        result.satisfactionTrend = result.satisfactionTrend.map((s, idx) => ({
          ...s,
          score: +(s.score * (0.9 + Math.random() * 0.2) * (idx === 0 ? 1.1 : 1)).toFixed(2),
          projectCount: Math.max(1, Math.round(s.projectCount * multiplier * (0.8 + Math.random() * 0.4))),
        }));

        result.vendorRanking = result.vendorRanking.map(v => ({
          ...v,
          completionRate: +(v.completionRate * (0.95 + Math.random() * 0.1)).toFixed(1),
          totalTasks: Math.round(v.totalTasks * multiplier * (0.85 + Math.random() * 0.3)),
        }));

        result.revenueBreakdown.categories = result.revenueBreakdown.categories.map(c => ({
          ...c,
          value: Math.round(c.value * multiplier * (0.85 + Math.random() * 0.3)),
        }));
      }
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
      const weddingDate = new Date(form.weddingDate);
      const isPeakSeason = [4, 5, 9, 10].includes(weddingDate.getMonth() + 1);
      const city = form.preferredCity || '上海';

      const scored = packages.map(pkg => {
        let score = pkg.matchScore;
        const reasons: string[] = [];

        const priceDiff = Math.abs(pkg.totalPrice - budgetMid) / budgetMid;
        if (priceDiff < 0.05) {
          score += 10;
          reasons.push('💰 预算完美匹配，价格在您的期望范围内');
        } else if (priceDiff < 0.1) {
          score += 5;
          reasons.push('💰 预算匹配度高，性价比突出');
        } else if (priceDiff < 0.2) {
          score += 2;
          reasons.push('💰 价格略高于预算，但整体价值优秀');
        }

        if (form.guestCount) {
          const minG = pkg.minGuests || 30;
          const maxG = pkg.maxGuests || 150;
          if (form.guestCount >= minG && form.guestCount <= maxG) {
            score += 8;
            reasons.push(`👥 宾客人数(${form.guestCount}人)与套餐承载能力(${minG}-${maxG}人)完美匹配`);
          } else if (form.guestCount < minG) {
            score -= 5;
            reasons.push(`⚠️ 宾客人数偏少，套餐更适合${minG}人以上`);
          } else {
            score -= 3;
            reasons.push(`⚠️ 宾客人数较多，建议考虑升级更大场地`);
          }
        }

        if (pkg.serveCities && pkg.serveCities.includes(city)) {
          score += 6;
          reasons.push(`📍 ${city}在服务覆盖范围内，无需额外差旅费用`);
        } else if (pkg.serveCities && pkg.serveCities.some(c => ['上海', '北京'].includes(c) && ['上海', '北京'].includes(city))) {
          score += 2;
          reasons.push(`📍 ${city}周边城市可服务，需少量差旅补贴`);
        } else {
          score -= 4;
          reasons.push(`⚠️ ${city}暂不在直接服务范围，需单独沟通`);
        }

        if (isPeakSeason && pkg.availableSlots > 0) {
          if (pkg.peakSeasonBonus && pkg.peakSeasonBonus > 0) {
            score += pkg.peakSeasonBonus;
            reasons.push(`📅 婚期在黄金旺季(5月/10月)，套餐有旺季特别配置`);
          }
          if (pkg.availableSlots >= 3) {
            score += 3;
            reasons.push(`📅 旺季档期充足，有${pkg.availableSlots}个可选日期`);
          } else if (pkg.availableSlots === 1) {
            score -= 2;
            reasons.push(`⚠️ 旺季仅剩${pkg.availableSlots}个档期，建议尽快锁定`);
          }
        }

        if (!isPeakSeason) {
          score += 3;
          reasons.push('📅 非黄金档期，价格优惠且可选空间大');
        }

        if (form.styles.length > 0) {
          score += Math.min(5, form.styles.length * 1.2);
          if (form.styles.includes('romantic') && pkg.packageType === 'premium') {
            score += 3;
            reasons.push('💐 浪漫风格与豪华套餐氛围完美契合');
          } else if (form.styles.includes('modern') && pkg.packageType === 'custom') {
            score += 3;
            reasons.push('✨ 现代风格与定制套餐的设计理念高度一致');
          } else if (form.styles.includes('chinese') && pkg.packageType === 'standard') {
            score += 2;
            reasons.push('🎎 中式元素在标准套餐中已有很好的体现');
          } else if (form.styles.includes('simple') && pkg.packageType === 'basic') {
            score += 2;
            reasons.push('🌿 简约风格与经济套餐的理念高度契合');
          }
        }

        if (pkg.availableSlots >= 5) {
          score += 2;
        }

        if (reasons.length === 0) {
          reasons.push('✨ 综合匹配度优秀，值得考虑');
        }

        return {
          ...pkg,
          matchScore: Math.max(50, Math.min(99, Math.round(score))),
          recommendReasons: reasons,
        };
      });

      return scored.sort((a, b) => b.matchScore - a.matchScore);
    },
    lockResources: (planId: string): LockResult | null => {
      const pkg = packages.find(p => p.planId === planId);
      if (!pkg) return null;
      const now = new Date();
      const expires = new Date(now.getTime() + recommendRules.autoLockHours * 3600000);
      const items: LockResult['items'] = [
        { type: 'venue' as TaskType, name: pkg.includes.venue.name, locked: pkg.includes.venue.available },
        { type: 'photography' as TaskType, name: pkg.includes.photography.name, locked: pkg.includes.photography.available },
        { type: 'makeup' as TaskType, name: pkg.includes.makeup.name, locked: pkg.includes.makeup.available },
      ];
      if (pkg.includes.flowers) {
        items.push({ type: 'flowers' as TaskType, name: pkg.includes.flowers.name, locked: pkg.includes.flowers.available });
      }
      if (pkg.includes.catering) {
        items.push({ type: 'catering' as TaskType, name: pkg.includes.catering.name, locked: pkg.includes.catering.available });
      }
      if (pkg.includes.mc) {
        items.push({ type: 'mc' as TaskType, name: pkg.includes.mc.name, locked: pkg.includes.mc.available });
      }
      const lockId = `lock-${Date.now()}`;
      const result: LockResult = {
        lockId,
        lockedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        items,
        totalDeposit: Math.round(pkg.totalPrice * 0.3),
        planId: pkg.planId,
        planName: pkg.name,
        isExpired: false,
      };
      locks.set(lockId, result);
      return result;
    },
    getLockStatus: (lockId: string): LockResult | null => {
      const lock = locks.get(lockId);
      if (!lock) return null;
      const now = new Date();
      const expires = new Date(lock.expiresAt);
      if (now > expires) {
        lock.isExpired = true;
        locks.delete(lockId);
        return null;
      }
      return { ...lock, isExpired: false };
    },
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
    checkAutoReassign: (): Task[] => {
      const now = new Date();
      const reassigned: Task[] = [];
      for (const p of projects) {
        for (const t of p.tasks) {
          if ((t.status === 'assigned' || t.status === 'reassigned') && t.acceptedAt === undefined) {
            const deadline = new Date(t.deadline);
            const acceptDeadline = new Date(deadline.getTime() - recommendRules.acceptTimeoutHours * 3600000);
            if (now > acceptDeadline) {
              const otherVendors = users.filter(u => u.role === 'vendor' && u.vendorType === t.type && u.id !== t.assignedVendorId);
              if (otherVendors.length > 0) {
                const newVendor = otherVendors[Math.floor(Math.random() * otherVendors.length)];
                t.assignedVendorId = newVendor.id;
                t.assignedVendorName = newVendor.name;
                t.status = 'reassigned';
                t.reassignedCount++;
                t.deadline = new Date(now.getTime() + recommendRules.acceptTimeoutHours * 3600000).toISOString();
                reassigned.push({ ...t, coupleName: p.coupleName, weddingDate: p.weddingDate });
              }
            }
          }
        }
      }
      return reassigned;
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
    getAll: (): FinanceRecord[] => {
      return finances.map(f => DataStore.finance.getDetail(f.id)!);
    },
    getDetail: (id: string): FinanceRecord | undefined => {
      const f = finances.find(x => x.id === id);
      if (!f) return undefined;

      const now = new Date();
      const record = JSON.parse(JSON.stringify(f)) as FinanceRecord;

      record.installments.forEach((ins, idx) => {
        if (ins.status === 'pending' || ins.status === 'overdue') {
          const dueDate = new Date(ins.dueDate);
          const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / 86400000);

          if (daysOverdue > 0) {
            ins.status = 'overdue';
            record.status = 'overdue';

            if (daysOverdue >= recommendRules.overdueReminderDays) {
              const dailyRate = recommendRules.lateFeeRatePerDay;
              const lateFeeAmount = Math.round(ins.amount * dailyRate * daysOverdue);
              record.lateFee += lateFeeAmount;
              record.overdueAmount += ins.amount;

              const existingReminder = record.warnings.find(w => w.message.includes(ins.name) && w.type === 'overdue');
              if (!existingReminder) {
                record.warnings.unshift({
                  id: `warn-auto-${Date.now()}-${idx}`,
                  type: 'overdue',
                  message: `${ins.name}已逾期${daysOverdue}天，累计滞纳金¥${lateFeeAmount.toLocaleString()}，请尽快支付`,
                  triggeredAt: now.toISOString(),
                  notifiedCustomer: false,
                  severity: daysOverdue > 14 ? 'high' : daysOverdue > 7 ? 'high' : 'medium',
                });
              }
            }
          }
        }
      });

      if (record.lateFee > 0) {
        const totalOverdue = record.installments
          .filter(i => i.status === 'overdue')
          .reduce((s, i) => s + i.amount, 0);
        record.overdueAmount = Math.max(record.overdueAmount, totalOverdue);
      }

      return record;
    },
    getWarnings: (): (FinanceRecord['warnings'][0] & { coupleName: string; projectId: string })[] => {
      const all = DataStore.finance.getAll();
      return all.flatMap(f => f.warnings.map(w => ({ ...w, coupleName: f.coupleName, projectId: f.projectId })));
    },
    remind: (projectId: string): boolean => {
      const f = finances.find(x => x.projectId === projectId);
      if (!f) return false;
      const detail = DataStore.finance.getDetail(f.id);
      if (detail) {
        detail.warnings.forEach(w => {
          if (w.type === 'overdue') w.notifiedCustomer = true;
        });
        f.warnings = detail.warnings;
        f.status = detail.status;
        f.lateFee = detail.lateFee;
      }
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
