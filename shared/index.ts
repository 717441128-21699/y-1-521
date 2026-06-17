export type UserRole = 'customer' | 'planner' | 'vendor' | 'admin';

export type VendorServiceType = 'venue' | 'photography' | 'makeup' | 'flowers' | 'catering' | 'mc' | 'decor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  avatar?: string;
  vendorType?: VendorServiceType;
  rating?: number;
  completionRate?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  permissions: string[];
}

export interface DashboardOverview {
  kpis: {
    activeProjects: number;
    activeProjectsDelta: number;
    monthlyRevenue: number;
    monthlyRevenueDelta: number;
    avgSatisfaction: number;
    avgSatisfactionDelta: number;
    totalVendors: number;
    totalVendorsDelta: number;
  };
  projectProgress: {
    projectId: string;
    coupleName: string;
    weddingDate: string;
    progress: number;
    status: 'normal' | 'warning' | 'danger';
    packageType: string;
  }[];
  vendorRanking: {
    vendorId: string;
    vendorName: string;
    vendorType: VendorServiceType;
    completionRate: number;
    totalTasks: number;
    avgRating: number;
    rank: number;
  }[];
  satisfactionTrend: {
    month: string;
    score: number;
    projectCount: number;
  }[];
  revenueBreakdown: {
    categories: { name: string; value: number }[];
    monthly: { month: string; revenue: number; cost: number }[];
  };
}

export interface ConsultationForm {
  budget: [number, number];
  guestCount: number;
  weddingDate: string;
  styles: string[];
  preferredCity: string;
  venueType?: string;
  specialRequirements?: string;
}

export type PackageType = 'basic' | 'standard' | 'premium' | 'custom';

export interface PackageItem {
  id: string;
  name: string;
  vendorName: string;
  price: number;
  rating: number;
  available: boolean;
  thumbnail: string;
}

export interface PackagePlan {
  planId: string;
  name: string;
  matchScore: number;
  totalPrice: number;
  originalPrice: number;
  packageType: PackageType;
  includes: {
    venue: PackageItem;
    photography: PackageItem;
    makeup: PackageItem;
    flowers?: PackageItem;
    catering?: PackageItem;
    mc?: PackageItem;
  };
  casePhotos: string[];
  highlights: string[];
  availableSlots: number;
}

export interface LockResult {
  lockId: string;
  lockedAt: string;
  expiresAt: string;
  items: { type: VendorServiceType; name: string; locked: boolean }[];
  totalDeposit: number;
}

export type ProjectStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type TaskStatus = 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'submitted' | 'verified' | 'reassigned';
export type TaskType = VendorServiceType;

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  completedAt?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'delayed';
  taskType?: TaskType;
}

export interface Submission {
  id: string;
  taskId: string;
  submittedAt: string;
  mediaUrls: string[];
  note: string;
  submittedBy: string;
}

export interface Verification {
  verifiedAt: string;
  verifiedBy: string;
  rating: number;
  comment: string;
}

export interface Task {
  id: string;
  projectId: string;
  type: TaskType;
  title: string;
  description: string;
  assignedVendorId?: string;
  assignedVendorName?: string;
  backupVendorId?: string;
  status: TaskStatus;
  deadline: string;
  acceptedAt?: string;
  reassignedCount: number;
  submissions: Submission[];
  verification?: Verification;
  coupleName?: string;
  weddingDate?: string;
}

export interface WeddingProject {
  id: string;
  coupleName: string;
  weddingDate: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  spentAmount: number;
  status: ProjectStatus;
  progress: number;
  plannerId: string;
  plannerName: string;
  customerId: string;
  packageType: PackageType;
  timeline: TimelineEvent[];
  tasks: Task[];
}

export interface Installment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'pending' | 'paid' | 'overdue';
  percentage: number;
}

export interface FinanceWarning {
  id: string;
  type: 'overrun' | 'overdue';
  message: string;
  triggeredAt: string;
  notifiedCustomer: boolean;
  severity: 'low' | 'medium' | 'high';
}

export interface FinanceRecord {
  id: string;
  projectId: string;
  coupleName: string;
  contractAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  lateFee: number;
  installments: Installment[];
  warnings: FinanceWarning[];
  status: 'normal' | 'warning' | 'overdue';
  overrunPercentage: number;
}

export interface RecommendRules {
  budgetWeight: number;
  styleWeight: number;
  dateWeight: number;
  vendorRatingWeight: number;
  historicalCaseWeight: number;
  autoLockHours: number;
  acceptTimeoutHours: number;
  overrunWarningThreshold: number;
  overdueReminderDays: number;
  lateFeeRatePerDay: number;
}

export interface RewardRules {
  vendorTiers: { tier: string; minCompletionRate: number; bonusRate: number }[];
  taskAcceptBonus: number;
  fastDeliveryBonus: number;
  highRatingBonus: number;
  reassignmentPenalty: number;
  overduePenalty: number;
}

export type TaskTypeLabel = { [key in TaskType]: string };

export const TASK_TYPE_LABELS: TaskTypeLabel = {
  venue: '场地布置',
  photography: '摄影摄像',
  makeup: '化妆造型',
  flowers: '花艺装饰',
  catering: '餐饮服务',
  mc: '司仪主持',
  decor: '氛围装饰',
};

export const TASK_TYPE_COLORS: { [key in TaskType]: string } = {
  venue: 'bg-amber-100 text-amber-700 border-amber-200',
  photography: 'bg-blue-100 text-blue-700 border-blue-200',
  makeup: 'bg-pink-100 text-pink-700 border-pink-200',
  flowers: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  catering: 'bg-orange-100 text-orange-700 border-orange-200',
  mc: 'bg-violet-100 text-violet-700 border-violet-200',
  decor: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const PACKAGE_TYPE_LABELS: { [key in PackageType]: string } = {
  basic: '经济套餐',
  standard: '标准套餐',
  premium: '豪华套餐',
  custom: '定制套餐',
};
