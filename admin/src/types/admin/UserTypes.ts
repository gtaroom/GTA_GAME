export interface User {
  _id: string;
  name: string;
  email: string;
  role:
    | "USER"
    | "ADMIN"
    | "MANAGER"
    | "SUPPORT_TEAM"
    | "MODERATOR"
    | "ANALYST"
    | "SUPPORT_LEAD"
    | "GAME_MANAGER"
    | "FINANCE_MANAGER"
    | "CONTENT_MODERATOR"
    | "DESIGNER";
  refreshToken: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  permissions?: PermissionSet;
}

export interface PermissionSet {
  canViewAllUsers: boolean;
  canViewUserProfiles: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canCreateUsers: boolean;

  // Game Management
  canManageGames: boolean;

  canManageCoupons: boolean;

  // Wallet & Transactions
  canViewAllTransactions: boolean;
  canViewFinancialData: boolean;

  // Support & Tickets
  canViewSupportTickets: boolean;
  canResolveSupportTickets: boolean;
  // canResolveTickets: boolean;
  // canManageSupportTeam: boolean;

  // Content & Moderation
  canModerateContent: boolean;
  // canBanUsers: boolean;

  // Analytics & Reports
  canViewAnalytics: boolean;
  canViewReports: boolean;
  // canGenerateReports: boolean;
  // canViewAllData: boolean;

  // System Management
  canManageRoles: boolean;
  canManageSystem: boolean;
  // canAccessEverything: boolean;

  canManageBanners: boolean;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: PermissionSet;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  permissions: PermissionSet;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: Partial<PermissionSet>;
}

export interface UserManagementUser {
  _id: string;
  email: string;
  name: {
    first: string;
    middle: string;
    last: string;
  };
  phone?: string;
  role: string;
  createdAt: Date;
  lastLoginDate?: Date;
  isActive: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isKYC?: boolean;
  isOpted?: boolean;
  isSmsOpted?: boolean;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  isPhoneVerified?: boolean;
  isKYC?: boolean;
  isEmailVerified?: boolean;
  isOpted?: boolean;
  isSmsOpted?: boolean;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
  recentRegistrations: number;
  averageLoginFrequency: number;
  emailVerifiedUsers?: number;
  phoneVerifiedUsers?: number;
  kycVerifiedUsers?: number;
  optedUsers?: number;
  smsOptedUsers?: number;
}

export interface BulkRoleAssignmentPayload {
  userIds: string[];
  role: string;
}
