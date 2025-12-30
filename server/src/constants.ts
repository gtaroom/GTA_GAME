export const rolesEnum = {
  USER: "USER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SUPPORT_TEAM: "SUPPORT_TEAM",
  MODERATOR: "MODERATOR",
  ANALYST: "ANALYST",
  DESIGNER: "DESIGNER",
} as const;

export type RoleType = (typeof rolesEnum)[keyof typeof rolesEnum];
export const AvailableRoles = Object.values(rolesEnum);

// Define role permissions
export const rolePermissions = {
  USER: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canViewGames: true,
    canPlayGames: true,
    canViewWallet: true,
    canMakeTransactions: true,
    canManageBanners: false,
  },
  DESIGNER: {
    canViewOwnProfile: true,
    canManageBanners: true,
    canViewAnalytics: false,
  },
  ADMIN: {
    canViewAllUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canCreateUsers: true,
    canManageRoles: true,
    canViewAllTransactions: true,
    canManageGames: true,
    canViewReports: true,
    canManageSupportTeam: true,
    canViewAnalytics: true,
    canManageSystem: true,
    canAccessEverything: true,
    canManageBanners: true,
  },
} as const;

export const authProvider = {
  GOOGLE: "GOOGLE",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
} as const;

export type AuthType = (typeof authProvider)[keyof typeof authProvider];
export const AvailableAuthProviders = Object.values(authProvider);

export const USER_TEMPORARY_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
