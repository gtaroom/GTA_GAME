export interface User {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  subscriptionStatus: 'Active' | 'Inactive' | 'Pending';
  balance: number;
  lastTransactionDate: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'Credit' | 'Debit';
  date: string;
  description: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  subscribedUsers: number;
  totalGames: number;
}

export interface RegistrationTrend {
  date: string;
  count: number;
}

export interface EngagementMetric {
  name: string;
  value: number;
}

interface IUserName{
  first: string;
  middle?: string;
  last: string;
}

export interface IUser {
  _id: string;
  name: IUserName;
  address: {
    line1: string;
    line2?: string;
  };
  avatar: {
    url: string | null;
    localPath: string;
  };
  email: string;
  password: string;
  isEmailVerified: boolean;
  zipCode: string;
  city: string;
  state: string;
  dob: string; 
  role: "USER" | "ADMIN" | "MANAGER" | "SUPPORT_TEAM" | "MODERATOR" | "ANALYST" | "SUPPORT_LEAD" | "GAME_MANAGER" | "FINANCE_MANAGER" | "CONTENT_MODERATOR" | "MANAGEMENT"; 
  isKYC:boolean;
  isOpted:boolean;
  createdAt:Date;
}

export interface IUserBonus {
  walletBalance: any;
  _id: string;
  userId: {
    _id: string;
    name: IUserName;
    email: string;
  };
  goldCoins: number;
  sweepCoins: number;
  lastLoginDate: Date; 
  loginStreak: number;
  claimedDailyBonus: boolean;
  claimedNewUserBonus: boolean;
  claimedDailySweepBonus: boolean;
}

export interface IUserEntry {
  _id: string;
  userId: string;
  name: number;
  phone: number;
  address: Date; 
  email: number;
  isWinner: boolean;
  createdAt: Date;
}


export interface Pagination{
  page:number;
  limit:number;
  totalPages:number;
  totalUsers:number
}

export interface ICoupon {
  _id: string;
  code: string;
  amount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  createdBy: {
    username: string;
    email: string;
  };
  usedBy: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICouponCreatePayload {
  amount: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  description?: string;
  code?: string;
}

export interface ICouponUpdatePayload {
  amount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  description?: string;
  isActive?: boolean;
}

export interface ICouponListResponse {
  coupons: ICoupon[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Dynamic Route Configuration Types
export interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  icon?: string;
  requiredPermissions: string[];
  isActive?: boolean;
}