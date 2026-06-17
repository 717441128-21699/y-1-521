import type {
  User, WeddingProject, Task, PackagePlan, FinanceRecord,
  DashboardOverview, RecommendRules, RewardRules, TaskType
} from './index';

export const MOCK_USERS: User[] = [
  {
    id: 'u-customer-001',
    name: '张雅婷',
    role: 'customer',
    phone: '13800000001',
    email: 'zhangyt@example.com',
    avatar: 'ZYT',
  },
  {
    id: 'u-planner-001',
    name: '李梦琪',
    role: 'planner',
    phone: '13800000002',
    email: 'limq@example.com',
    avatar: 'LMQ',
  },
  {
    id: 'u-vendor-001',
    name: '星辰摄影工作室',
    role: 'vendor',
    phone: '13800000003',
    email: 'stars@photo.com',
    avatar: 'XC',
    vendorType: 'photography',
    rating: 4.9,
    completionRate: 98.5,
  },
  {
    id: 'u-vendor-002',
    name: '梦幻婚礼会馆',
    role: 'vendor',
    phone: '13800000004',
    email: 'dream@venue.com',
    avatar: 'MH',
    vendorType: 'venue',
    rating: 4.8,
    completionRate: 96.2,
  },
  {
    id: 'u-vendor-003',
    name: '蔷薇花艺设计',
    role: 'vendor',
    phone: '13800000005',
    email: 'rose@flowers.com',
    avatar: 'QW',
    vendorType: 'flowers',
    rating: 4.95,
    completionRate: 99.1,
  },
  {
    id: 'u-vendor-004',
    name: '华美造型工作室',
    role: 'vendor',
    phone: '13800000006',
    email: 'huamei@makeup.com',
    avatar: 'HM',
    vendorType: 'makeup',
    rating: 4.85,
    completionRate: 97.3,
  },
  {
    id: 'u-vendor-005',
    name: '金玉满堂餐饮',
    role: 'vendor',
    phone: '13800000007',
    email: 'jinyu@catering.com',
    avatar: 'JY',
    vendorType: 'catering',
    rating: 4.7,
    completionRate: 95.8,
  },
  {
    id: 'u-vendor-006',
    name: '声动司仪团队',
    role: 'vendor',
    phone: '13800000008',
    email: 'shengdong@mc.com',
    avatar: 'SD',
    vendorType: 'mc',
    rating: 4.88,
    completionRate: 98.0,
  },
  {
    id: 'u-admin-001',
    name: '王管理员',
    role: 'admin',
    phone: '13900000001',
    email: 'admin@wedding.com',
    avatar: 'WGL',
  },
];

export const DEFAULT_LOGIN_USERS = {
  customer: { phone: '13800000001', password: '123456' },
  planner: { phone: '13800000002', password: '123456' },
  vendor: { phone: '13800000003', password: '123456' },
  admin: { phone: '13900000001', password: '123456' },
};

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1525772764200-be829a350797?w=600&h=400&fit=crop',
];

export const MOCK_PACKAGES: PackagePlan[] = [
  {
    planId: 'pkg-001',
    name: '永恒玫瑰·浪漫经典套餐',
    matchScore: 95,
    totalPrice: 128800,
    originalPrice: 158800,
    packageType: 'premium',
    includes: {
      venue: { id: 'v-001', name: '梦幻水晶厅', vendorName: '梦幻婚礼会馆', price: 38800, rating: 4.8, available: true, thumbnail: IMAGE_URLS[0] },
      photography: { id: 'p-001', name: '总监双机+航拍', vendorName: '星辰摄影工作室', price: 26800, rating: 4.9, available: true, thumbnail: IMAGE_URLS[1] },
      makeup: { id: 'm-001', name: '首席造型师全天', vendorName: '华美造型工作室', price: 12800, rating: 4.85, available: true, thumbnail: IMAGE_URLS[2] },
      flowers: { id: 'f-001', name: '奢华玫瑰主题花艺', vendorName: '蔷薇花艺设计', price: 18800, rating: 4.95, available: true, thumbnail: IMAGE_URLS[3] },
      catering: { id: 'c-001', name: '精选粤式婚宴88桌', vendorName: '金玉满堂餐饮', price: 26600, rating: 4.7, available: true, thumbnail: IMAGE_URLS[4] },
      mc: { id: 'mc-001', name: '金牌司仪全程主持', vendorName: '声动司仪团队', price: 5000, rating: 4.88, available: true, thumbnail: IMAGE_URLS[5] },
    },
    casePhotos: [IMAGE_URLS[0], IMAGE_URLS[1], IMAGE_URLS[6], IMAGE_URLS[7]],
    highlights: ['赠送婚礼策划总监一对一服务', '赠送新娘婚前SPA一次', '赠送父母礼服各一套', '赠送婚车头车装饰'],
    availableSlots: 3,
    serveCities: ['上海', '北京', '杭州', '苏州'],
    minGuests: 60,
    maxGuests: 120,
    peakSeasonBonus: 5,
  },
  {
    planId: 'pkg-002',
    name: '甜蜜蜜·精致标准套餐',
    matchScore: 88,
    totalPrice: 88800,
    originalPrice: 108800,
    packageType: 'standard',
    includes: {
      venue: { id: 'v-002', name: '玫瑰花园厅', vendorName: '梦幻婚礼会馆', price: 25800, rating: 4.7, available: true, thumbnail: IMAGE_URLS[2] },
      photography: { id: 'p-002', name: '资深双机摄影', vendorName: '星辰摄影工作室', price: 16800, rating: 4.8, available: true, thumbnail: IMAGE_URLS[3] },
      makeup: { id: 'm-002', name: '资深造型师全天', vendorName: '华美造型工作室', price: 8800, rating: 4.8, available: true, thumbnail: IMAGE_URLS[4] },
      flowers: { id: 'f-002', name: '标准婚礼花艺', vendorName: '蔷薇花艺设计', price: 10800, rating: 4.9, available: true, thumbnail: IMAGE_URLS[5] },
      catering: { id: 'c-002', name: '精品婚宴48桌', vendorName: '金玉满堂餐饮', price: 21600, rating: 4.7, available: true, thumbnail: IMAGE_URLS[6] },
      mc: { id: 'mc-002', name: '资深司仪主持', vendorName: '声动司仪团队', price: 3000, rating: 4.8, available: true, thumbnail: IMAGE_URLS[7] },
    },
    casePhotos: [IMAGE_URLS[2], IMAGE_URLS[3], IMAGE_URLS[4], IMAGE_URLS[5]],
    highlights: ['赠送婚礼执行督导一名', '赠送新娘手捧花一束', '赠送婚礼电子请柬制作'],
    availableSlots: 5,
    serveCities: ['上海', '杭州', '南京', '苏州', '宁波'],
    minGuests: 40,
    maxGuests: 80,
    peakSeasonBonus: 3,
  },
  {
    planId: 'pkg-003',
    name: '小确幸·经济实惠套餐',
    matchScore: 82,
    totalPrice: 58800,
    originalPrice: 68800,
    packageType: 'basic',
    includes: {
      venue: { id: 'v-003', name: '百合宴会厅', vendorName: '梦幻婚礼会馆', price: 16800, rating: 4.6, available: true, thumbnail: IMAGE_URLS[4] },
      photography: { id: 'p-003', name: '单机位全天摄影', vendorName: '星辰摄影工作室', price: 9800, rating: 4.7, available: true, thumbnail: IMAGE_URLS[5] },
      makeup: { id: 'm-003', name: '造型师半天跟妆', vendorName: '华美造型工作室', price: 5800, rating: 4.7, available: true, thumbnail: IMAGE_URLS[6] },
      flowers: { id: 'f-003', name: '简约清新花艺', vendorName: '蔷薇花艺设计', price: 6800, rating: 4.85, available: true, thumbnail: IMAGE_URLS[7] },
      catering: { id: 'c-003', name: '标准婚宴28桌', vendorName: '金玉满堂餐饮', price: 15600, rating: 4.6, available: true, thumbnail: IMAGE_URLS[0] },
    },
    casePhotos: [IMAGE_URLS[4], IMAGE_URLS[5], IMAGE_URLS[6]],
    highlights: ['赠送基础策划方案', '赠送签到台布置', '赠送交杯酒及蛋糕仪式道具'],
    availableSlots: 8,
    serveCities: ['上海', '杭州', '苏州', '无锡', '常州'],
    minGuests: 20,
    maxGuests: 50,
    peakSeasonBonus: 0,
  },
  {
    planId: 'pkg-004',
    name: '童话城堡·至尊定制套餐',
    matchScore: 92,
    totalPrice: 288800,
    originalPrice: 368800,
    packageType: 'custom',
    includes: {
      venue: { id: 'v-004', name: '皇家宫殿厅（包场）', vendorName: '梦幻婚礼会馆', price: 88000, rating: 4.9, available: true, thumbnail: IMAGE_URLS[6] },
      photography: { id: 'p-004', name: '创始人四机位+电影机+航拍', vendorName: '星辰摄影工作室', price: 58800, rating: 5.0, available: true, thumbnail: IMAGE_URLS[7] },
      makeup: { id: 'm-004', name: '创始人造型师+助理双全天', vendorName: '华美造型工作室', price: 28800, rating: 4.95, available: true, thumbnail: IMAGE_URLS[0] },
      flowers: { id: 'f-004', name: '进口花材定制主题花艺', vendorName: '蔷薇花艺设计', price: 38800, rating: 5.0, available: true, thumbnail: IMAGE_URLS[1] },
      catering: { id: 'c-004', name: '米其林定制菜单128桌', vendorName: '金玉满堂餐饮', price: 58800, rating: 4.9, available: true, thumbnail: IMAGE_URLS[2] },
      mc: { id: 'mc-004', name: '央视级司仪+定制台词', vendorName: '声动司仪团队', price: 12000, rating: 4.95, available: true, thumbnail: IMAGE_URLS[3] },
    },
    casePhotos: [IMAGE_URLS[6], IMAGE_URLS[7], IMAGE_URLS[0], IMAGE_URLS[1], IMAGE_URLS[2]],
    highlights: ['赠送婚前派对策划执行', '赠送明星级婚纱礼服三件套', '赠送蜜月旅行基金20000元', '赠送婚礼微电影拍摄', '赠送父母海外旅游套餐'],
    availableSlots: 1,
    serveCities: ['上海', '北京', '深圳', '广州'],
    minGuests: 80,
    maxGuests: 200,
    peakSeasonBonus: 8,
  },
];

function generateTasks(projectId: string, weddingDate: string): Task[] {
  const baseDate = new Date(weddingDate);
  const tasks: Array<{ type: TaskType; title: string; desc: string; daysBefore: number; vendorId: string; vendorName: string }> = [
    { type: 'venue', title: '婚礼场地布置', desc: '按照方案完成场地搭建与装饰', daysBefore: 0, vendorId: 'u-vendor-002', vendorName: '梦幻婚礼会馆' },
    { type: 'photography', title: '婚礼摄影摄像', desc: '全天跟拍+仪式重点拍摄+精修', daysBefore: 0, vendorId: 'u-vendor-001', vendorName: '星辰摄影工作室' },
    { type: 'makeup', title: '新娘化妆造型', desc: '新娘全天跟妆+三套造型设计', daysBefore: 0, vendorId: 'u-vendor-004', vendorName: '华美造型工作室' },
    { type: 'flowers', title: '婚礼花艺布置', desc: '签到台+仪式区+桌花+手捧花', daysBefore: 0, vendorId: 'u-vendor-003', vendorName: '蔷薇花艺设计' },
    { type: 'catering', title: '婚宴餐饮服务', desc: '餐品准备+席间服务+敬酒环节', daysBefore: 0, vendorId: 'u-vendor-005', vendorName: '金玉满堂餐饮' },
    { type: 'mc', title: '婚礼司仪主持', desc: '流程把控+现场互动+才艺表演', daysBefore: 0, vendorId: 'u-vendor-006', vendorName: '声动司仪团队' },
    { type: 'decor', title: '灯光音响氛围', desc: '专业灯光秀+音响设备+氛围营造', daysBefore: 0, vendorId: 'u-vendor-002', vendorName: '梦幻婚礼会馆' },
  ];
  const allStatuses: Array<'assigned' | 'accepted' | 'in_progress' | 'submitted' | 'verified'> = ['verified', 'submitted', 'accepted', 'in_progress', 'assigned'];
  return tasks.map((t, idx) => {
    const deadline = new Date(baseDate);
    deadline.setDate(deadline.getDate() - t.daysBefore);
    const statusIdx = Math.min(Math.floor(Math.random() * (idx + 2)), allStatuses.length - 1);
    const status = allStatuses[statusIdx];
    const taskId = `${projectId}-task-${idx + 1}`;
    return {
      id: taskId,
      projectId,
      type: t.type,
      title: t.title,
      description: t.desc,
      assignedVendorId: t.vendorId,
      assignedVendorName: t.vendorName,
      status,
      deadline: deadline.toISOString(),
      acceptedAt: status !== 'assigned' ? new Date(deadline.getTime() - 86400000 * 3).toISOString() : undefined,
      reassignedCount: Math.random() > 0.85 ? 1 : 0,
      submissions: (status === 'submitted' || status === 'verified')
        ? [{
            id: `${taskId}-sub-1`,
            taskId,
            submittedAt: new Date(deadline.getTime() - 3600000 * 5).toISOString(),
            mediaUrls: [IMAGE_URLS[idx % IMAGE_URLS.length], IMAGE_URLS[(idx + 1) % IMAGE_URLS.length]],
            note: '现场照片已上传，请查收确认。如有调整意见请告知。',
            submittedBy: t.vendorId,
          }]
        : [],
      verification: status === 'verified'
        ? {
            verifiedAt: new Date(deadline.getTime() + 3600000 * 2).toISOString(),
            verifiedBy: 'u-customer-001',
            rating: 4 + Math.random(),
            comment: '非常满意，服务专业细致！',
          }
        : undefined,
    };
  });
}

function generateTimeline(weddingDate: string) {
  const base = new Date(weddingDate);
  const t = (days: number, h = 0) => { const d = new Date(base); d.setDate(d.getDate() + days); d.setHours(h); return d.toISOString(); };
  return [
    { id: 'tl-1', title: '合同签订', description: '确认套餐方案，签订服务合同，支付定金', scheduledAt: t(-60, 14), completedAt: t(-60, 14), status: 'completed' as const },
    { id: 'tl-2', title: '方案设计', description: '策划师完成详细方案设计，确认场地布置', scheduledAt: t(-45, 10), completedAt: t(-44, 16), status: 'completed' as const },
    { id: 'tl-3', title: '试妆试菜', description: '新娘试妆造型，婚宴菜品品鉴', scheduledAt: t(-30, 11), completedAt: t(-30, 15), status: 'completed' as const },
    { id: 'tl-4', title: '最终确认', description: '最终方案确认，流程彩排', scheduledAt: t(-7, 15), status: 'completed' as const },
    { id: 'tl-5', title: '场地搭建', description: '婚礼场地布置搭建，设备调试', scheduledAt: t(-1, 9), status: 'in_progress' as const, taskType: 'venue' as const },
    { id: 'tl-6', title: '婚礼当天', description: '接亲+仪式+婚宴+送客，全天跟拍', scheduledAt: t(0, 6), status: 'upcoming' as const },
    { id: 'tl-7', title: '后期交付', description: '精修照片、视频交付，客户确认', scheduledAt: t(30, 10), status: 'upcoming' as const, taskType: 'photography' as const },
  ];
}

export const MOCK_PROJECTS: WeddingProject[] = [
  {
    id: 'proj-001', coupleName: '陈先生 & 张雅婷', weddingDate: '2026-07-18T00:00:00Z',
    location: '上海浦东 · 梦幻婚礼会馆水晶厅', guestCount: 180,
    totalBudget: 128800, spentAmount: 90160, status: 'active', progress: 68,
    plannerId: 'u-planner-001', plannerName: '李梦琪', customerId: 'u-customer-001', packageType: 'premium',
    timeline: generateTimeline('2026-07-18T00:00:00Z'),
    tasks: generateTasks('proj-001', '2026-07-18T00:00:00Z'),
  },
  {
    id: 'proj-002', coupleName: '王先生 & 李小姐', weddingDate: '2026-08-08T00:00:00Z',
    location: '上海静安 · 玫瑰花园厅', guestCount: 120,
    totalBudget: 88800, spentAmount: 44400, status: 'active', progress: 45,
    plannerId: 'u-planner-001', plannerName: '李梦琪', customerId: 'u-customer-001', packageType: 'standard',
    timeline: generateTimeline('2026-08-08T00:00:00Z'),
    tasks: generateTasks('proj-002', '2026-08-08T00:00:00Z'),
  },
  {
    id: 'proj-003', coupleName: '刘先生 & 周女士', weddingDate: '2026-09-20T00:00:00Z',
    location: '杭州西湖 · 皇家宫殿厅', guestCount: 260,
    totalBudget: 288800, spentAmount: 86640, status: 'active', progress: 30,
    plannerId: 'u-planner-001', plannerName: '李梦琪', customerId: 'u-customer-001', packageType: 'custom',
    timeline: generateTimeline('2026-09-20T00:00:00Z'),
    tasks: generateTasks('proj-003', '2026-09-20T00:00:00Z'),
  },
  {
    id: 'proj-004', coupleName: '赵先生 & 孙女士', weddingDate: '2026-10-01T00:00:00Z',
    location: '苏州金鸡湖 · 百合宴会厅', guestCount: 80,
    totalBudget: 58800, spentAmount: 17640, status: 'active', progress: 22,
    plannerId: 'u-planner-001', plannerName: '李梦琪', customerId: 'u-customer-001', packageType: 'basic',
    timeline: generateTimeline('2026-10-01T00:00:00Z'),
    tasks: generateTasks('proj-004', '2026-10-01T00:00:00Z'),
  },
  {
    id: 'proj-005', coupleName: '吴先生 & 郑女士', weddingDate: '2026-06-28T00:00:00Z',
    location: '南京玄武 · 梦幻水晶厅', guestCount: 150,
    totalBudget: 128800, spentAmount: 115920, status: 'active', progress: 90,
    plannerId: 'u-planner-001', plannerName: '李梦琪', customerId: 'u-customer-001', packageType: 'premium',
    timeline: generateTimeline('2026-06-28T00:00:00Z'),
    tasks: generateTasks('proj-005', '2026-06-28T00:00:00Z'),
  },
  {
    id: 'proj-006', coupleName: '钱先生 & 冯女士', weddingDate: '2026-11-11T00:00:00Z',
    location: '宁波海曙 · 玫瑰花园厅', guestCount: 100,
    totalBudget: 88800, spentAmount: 17760, status: 'pending', progress: 12,
    plannerId: 'u-planner-001', plannerName: '李梦琪', customerId: 'u-customer-001', packageType: 'standard',
    timeline: generateTimeline('2026-11-11T00:00:00Z'),
    tasks: generateTasks('proj-006', '2026-11-11T00:00:00Z'),
  },
  {
    id: 'proj-007', coupleName: '孙先生 & 马女士', weddingDate: '2026-12-25T00:00:00Z',
    location: '无锡滨湖 · 百合宴会厅', guestCount: 90,
    totalBudget: 58800, spentAmount: 5880, status: 'pending', progress: 8,
    plannerId: 'u-planner-001', plannerName: '李梦琪', customerId: 'u-customer-001', packageType: 'basic',
    timeline: generateTimeline('2026-12-25T00:00:00Z'),
    tasks: generateTasks('proj-007', '2026-12-25T00:00:00Z'),
  },
  {
    id: 'proj-008', coupleName: '李先生 & 林女士', weddingDate: '2026-05-20T00:00:00Z',
    location: '上海浦东 · 皇家宫殿厅', guestCount: 220,
    totalBudget: 288800, spentAmount: 288800, status: 'completed', progress: 100,
    plannerId: 'u-planner-001', plannerName: '李梦琪', customerId: 'u-customer-001', packageType: 'custom',
    timeline: generateTimeline('2026-05-20T00:00:00Z'),
    tasks: generateTasks('proj-008', '2026-05-20T00:00:00Z'),
  },
];

export const MOCK_DASHBOARD: DashboardOverview = {
  kpis: {
    activeProjects: 8,
    activeProjectsDelta: 12.5,
    monthlyRevenue: 856400,
    monthlyRevenueDelta: 18.3,
    avgSatisfaction: 4.86,
    avgSatisfactionDelta: 2.1,
    totalVendors: 42,
    totalVendorsDelta: 5.0,
  },
  projectProgress: MOCK_PROJECTS.filter(p => p.status !== 'completed').slice(0, 6).map(p => ({
    projectId: p.id,
    coupleName: p.coupleName,
    weddingDate: p.weddingDate,
    progress: p.progress,
    status: p.progress > 80 ? 'danger' : p.progress > 40 ? 'normal' : 'warning',
    packageType: p.packageType,
  })),
  vendorRanking: [
    { vendorId: 'u-vendor-003', vendorName: '蔷薇花艺设计', vendorType: 'flowers', completionRate: 99.1, totalTasks: 128, avgRating: 4.95, rank: 1 },
    { vendorId: 'u-vendor-001', vendorName: '星辰摄影工作室', vendorType: 'photography', completionRate: 98.5, totalTasks: 156, avgRating: 4.90, rank: 2 },
    { vendorId: 'u-vendor-006', vendorName: '声动司仪团队', vendorType: 'mc', completionRate: 98.0, totalTasks: 98, avgRating: 4.88, rank: 3 },
    { vendorId: 'u-vendor-004', vendorName: '华美造型工作室', vendorType: 'makeup', completionRate: 97.3, totalTasks: 134, avgRating: 4.85, rank: 4 },
    { vendorId: 'u-vendor-002', vendorName: '梦幻婚礼会馆', vendorType: 'venue', completionRate: 96.2, totalTasks: 86, avgRating: 4.80, rank: 5 },
    { vendorId: 'u-vendor-005', vendorName: '金玉满堂餐饮', vendorType: 'catering', completionRate: 95.8, totalTasks: 112, avgRating: 4.70, rank: 6 },
  ],
  satisfactionTrend: [
    { month: '2025-07', score: 4.72, projectCount: 12 },
    { month: '2025-08', score: 4.78, projectCount: 15 },
    { month: '2025-09', score: 4.68, projectCount: 18 },
    { month: '2025-10', score: 4.80, projectCount: 14 },
    { month: '2025-11', score: 4.75, projectCount: 16 },
    { month: '2025-12', score: 4.82, projectCount: 22 },
    { month: '2026-01', score: 4.78, projectCount: 10 },
    { month: '2026-02', score: 4.85, projectCount: 13 },
    { month: '2026-03', score: 4.82, projectCount: 19 },
    { month: '2026-04', score: 4.88, projectCount: 21 },
    { month: '2026-05', score: 4.90, projectCount: 24 },
    { month: '2026-06', score: 4.86, projectCount: 26 },
  ],
  revenueBreakdown: {
    categories: [
      { name: '豪华套餐', value: 38.5 },
      { name: '标准套餐', value: 28.2 },
      { name: '定制套餐', value: 22.8 },
      { name: '经济套餐', value: 10.5 },
    ],
    monthly: [
      { month: '1月', revenue: 420000, cost: 294000 },
      { month: '2月', revenue: 528000, cost: 369600 },
      { month: '3月', revenue: 686000, cost: 480200 },
      { month: '4月', revenue: 752000, cost: 526400 },
      { month: '5月', revenue: 896000, cost: 627200 },
      { month: '6月', revenue: 856400, cost: 599480 },
    ],
  },
};

export const MOCK_FINANCES: FinanceRecord[] = MOCK_PROJECTS.slice(0, 6).map((p, idx) => {
  const contractAmount = p.totalBudget;
  const paidAmount = p.spentAmount;
  const overrunPct = idx === 1 ? 13.2 : idx === 3 ? 5.8 : 0;
  const overdue = idx === 4;
  const due = new Date(p.weddingDate);
  due.setDate(due.getDate() - 30);
  const due2 = new Date(p.weddingDate);
  due2.setDate(due2.getDate() - 7);
  const due3 = new Date(p.weddingDate);
  due3.setDate(due3.getDate() + 30);
  return {
    id: `fin-${p.id}`,
    projectId: p.id,
    coupleName: p.coupleName,
    contractAmount: contractAmount * (1 + overrunPct / 100),
    paidAmount,
    pendingAmount: contractAmount - paidAmount,
    overdueAmount: overdue ? (contractAmount * 0.3) : 0,
    lateFee: overdue ? Math.round(contractAmount * 0.3 * 0.0005 * 7) : 0,
    installments: [
      { id: `ins-${idx}-1`, name: '定金（30%）', amount: contractAmount * 0.3, dueDate: due.toISOString(), paidAt: due.toISOString(), status: 'paid', percentage: 30 },
      { id: `ins-${idx}-2`, name: '中期款（40%）', amount: contractAmount * 0.4, dueDate: due2.toISOString(), paidAt: overdue ? undefined : due2.toISOString(), status: overdue ? 'overdue' : 'paid', percentage: 40 },
      { id: `ins-${idx}-3`, name: '尾款（30%）', amount: contractAmount * 0.3, dueDate: due3.toISOString(), status: 'pending', percentage: 30 },
    ],
    warnings: overrunPct > 10 ? [
      { id: `warn-${idx}-1`, type: 'overrun', message: `项目费用超支${overrunPct.toFixed(1)}%，已超过10%预警阈值，建议客户确认附加费用明细`, triggeredAt: new Date().toISOString(), notifiedCustomer: true, severity: 'high' },
    ] : overdue ? [
      { id: `warn-${idx}-2`, type: 'overdue', message: '中期款已逾期7天，已自动发送催缴通知并开始计算滞纳金', triggeredAt: new Date().toISOString(), notifiedCustomer: true, severity: 'high' },
    ] : overrunPct > 0 ? [
      { id: `warn-${idx}-3`, type: 'overrun', message: `项目费用超支${overrunPct.toFixed(1)}%，请密切关注后续费用`, triggeredAt: new Date().toISOString(), notifiedCustomer: false, severity: 'low' },
    ] : [],
    status: overdue ? 'overdue' : overrunPct > 10 ? 'warning' : 'normal',
    overrunPercentage: overrunPct,
  };
});

export const DEFAULT_RECOMMEND_RULES: RecommendRules = {
  budgetWeight: 0.30,
  styleWeight: 0.25,
  dateWeight: 0.15,
  vendorRatingWeight: 0.15,
  historicalCaseWeight: 0.15,
  autoLockHours: 24,
  acceptTimeoutHours: 2,
  overrunWarningThreshold: 10,
  overdueReminderDays: 7,
  lateFeeRatePerDay: 0.05,
};

export const DEFAULT_REWARD_RULES: RewardRules = {
  vendorTiers: [
    { tier: '金牌', minCompletionRate: 98, bonusRate: 8 },
    { tier: '银牌', minCompletionRate: 95, bonusRate: 5 },
    { tier: '铜牌', minCompletionRate: 90, bonusRate: 3 },
    { tier: '标准', minCompletionRate: 0, bonusRate: 0 },
  ],
  taskAcceptBonus: 50,
  fastDeliveryBonus: 100,
  highRatingBonus: 200,
  reassignmentPenalty: 100,
  overduePenalty: 300,
};
