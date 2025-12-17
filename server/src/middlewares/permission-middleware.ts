import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { getUserFromRequest } from "../utils/get-user";
import { rolePermissions, AvailableRoles } from "../constants";
import RoleModel from "../models/role.model";

/**
 * Check if user has specific permission
 */
export const checkPermission = (permission: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { role } = getUserFromRequest(req);

    if (!role) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (role === "ADMIN") {
      return next();
    }
    // Check built-in roles first
    if (AvailableRoles.includes(role as any)) {
      const permissions = rolePermissions[role as keyof typeof rolePermissions];
      if (permissions && permissions[permission as keyof typeof permissions]) {
        return next();
      }
    }

    // Check custom roles
    const customRole = await RoleModel.findOne({ name: role, isActive: true });
    if (customRole && customRole.permissions[permission as keyof typeof customRole.permissions]) {
      return next();
    }

    throw new ApiError(403, `You don't have permission to ${permission}`);
  });
};

/**
 * Check if user has any of the specified permissions
 */
export const checkAnyPermission = (permissions: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { role } = getUserFromRequest(req);

    if (!role) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (role === "ADMIN") {
      return next();
    }
    // Check built-in roles first
    if (AvailableRoles.includes(role as any)) {
      const rolePerms = rolePermissions[role as keyof typeof rolePermissions];
      for (const permission of permissions) {
        if (rolePerms && rolePerms[permission as keyof typeof rolePerms]) {
          return next();
        }
      }
    }

    // Check custom roles
    const customRole = await RoleModel.findOne({ name: role, isActive: true });
    if (customRole) {
      for (const permission of permissions) {
        if (customRole.permissions[permission as keyof typeof customRole.permissions]) {
          return next();
        }
      }
    }

    throw new ApiError(403, `You don't have permission to perform this action`);
  });
};

/**
 * Check if user has all of the specified permissions
 */
export const checkAllPermissions = (permissions: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { role } = getUserFromRequest(req);

    if (!role) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (role === "ADMIN") {
      return next();
    }

    // Check built-in roles first
    if (AvailableRoles.includes(role as any)) {
      const rolePerms = rolePermissions[role as keyof typeof rolePermissions];
      for (const permission of permissions) {
        if (!rolePerms || !rolePerms[permission as keyof typeof rolePerms]) {
          throw new ApiError(403, `You don't have permission to ${permission}`);
        }
      }
      return next();
    }

    // Check custom roles
    const customRole = await RoleModel.findOne({ name: role, isActive: true });
    if (customRole) {
      for (const permission of permissions) {
        if (!customRole.permissions[permission as keyof typeof customRole.permissions]) {
          throw new ApiError(403, `You don't have permission to ${permission}`);
        }
      }
      return next();
    }

    throw new ApiError(403, `You don't have permission to perform this action`);
  });
};

/**
 * Check if user can manage the target user (admin can manage anyone, managers can manage non-admins)
 */
export const canManageUser = (targetUserId: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { _id, role } = getUserFromRequest(req);

    if (!_id || !role) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Admin can manage anyone
    if (role === "ADMIN") {
      return next();
    }

    // Check if target user exists and get their role
    const UserModel = (await import("../models/user.model")).default;
    const targetUser = await UserModel.findById(targetUserId).select("role");
    
    if (!targetUser) {
      throw new ApiError(404, "Target user not found");
    }

    // Managers can manage non-admin users
    if (role === "MANAGER" && targetUser.role !== "ADMIN") {
      return next();
    }

    // Users can only manage themselves
    if (_id.toString() === targetUserId) {
      return next();
    }

    throw new ApiError(403, "You don't have permission to manage this user");
  });
};

/**
 * Check if user can access admin features
 */
export const requireAdminAccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }

  // Check if role has admin access
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && 'canAccessEverything' in permissions && permissions.canAccessEverything) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canAccessEverything) {
    return next();
  }

  throw new ApiError(403, "Admin access required");
});

/**
 * Check if user can manage roles
 */
export const canManageRoles = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  console.log("canManageRoles");
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }

  // Only admins can manage roles
  if (role === "ADMIN") {
    return next();
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canManageRoles) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to manage roles");
});

/**
 * Check if user can view user data
 */
export const canViewUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }
  // Check built-in roles
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && (
      ('canViewAllUsers' in permissions && permissions.canViewAllUsers) ||
      ('canViewUserProfiles' in permissions && permissions.canViewUserProfiles)
    )) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && (customRole.permissions.canViewAllUsers || customRole.permissions.canViewUserProfiles)) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to view user data");
});

/**
 * Check if user can edit users
 */
export const canEditUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }
  // Check built-in roles
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && 'canEditUsers' in permissions && permissions.canEditUsers) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canEditUsers) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to edit users");
});

/**
 * Check if user can delete users
 */
export const canDeleteUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }
  // Check built-in roles
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && 'canDeleteUsers' in permissions && permissions.canDeleteUsers) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canDeleteUsers) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to delete users");
});

/**
 * Check if user can view analytics
 */
export const canViewAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }
  // Check built-in roles
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && 'canViewAnalytics' in permissions && permissions.canViewAnalytics) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canViewAnalytics) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to view analytics");
}); 


export const canViewSupportTickets = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }

  // Check built-in roles
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && 'canViewSupportTickets' in permissions && permissions.canViewSupportTickets) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canViewSupportTickets) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to view support tickets");
});
export const canResolveSupportTickets = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }

  // Check built-in roles
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && 'canResolveSupportTickets' in permissions && permissions.canResolveSupportTickets) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canResolveSupportTickets) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to resolve support tickets");
});

export const canManageGames = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }

  // Check built-in roles
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && 'canManageGames' in permissions && permissions.canManageGames) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canManageGames) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to manage games account requests");
});

export const canManageCoupons = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }

  // Check built-in roles
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && 'canManageCoupons' in permissions && permissions.canManageCoupons) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canManageCoupons) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to manage games account requests");
});

export const canViewAllTransactions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { role } = getUserFromRequest(req);

  if (!role) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (role === "ADMIN") {
    return next();
  }

  // Check built-in roles
  if (AvailableRoles.includes(role as any)) {
    const permissions = rolePermissions[role as keyof typeof rolePermissions];
    if (permissions && 'canViewAllTransactions' in permissions && permissions.canViewAllTransactions) {
      return next();
    }
  }

  // Check custom roles
  const customRole = await RoleModel.findOne({ name: role, isActive: true });
  if (customRole && customRole.permissions.canViewAllTransactions) {
    return next();
  }

  throw new ApiError(403, "You don't have permission to manage games account requests");
});