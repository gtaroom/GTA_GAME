import { useGetUserDetailsQuery } from '../services/api/authApi';
import { useGetRolePermissionsQuery } from '../services/api/rolesApi';
import { PermissionSet } from '../types/admin/UserTypes';

export const usePermissions = () => {
  const { data: user, isLoading: userLoading } = useGetUserDetailsQuery();
  const { data: permissions, isLoading: permissionsLoading } = useGetRolePermissionsQuery(
    user?.role || '',
    { skip: !user?.role }
  );
console.log(permissions);
  const isLoading = userLoading || permissionsLoading;

  // Check if user has a specific permission
  const hasPermission = (permission: keyof PermissionSet): boolean => {
    if (!user || !permissions) return false;
    // Admin has all permissions
    if (user.role === 'ADMIN') return true;
    
    // Check specific permission
    return permissions[permission] === true;
  };


  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionsToCheck: (keyof PermissionSet)[]): boolean => {
    console.log(permissionsToCheck);
    return permissionsToCheck.some(permission => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissionsToCheck: (keyof PermissionSet)[]): boolean => {
    return permissionsToCheck.every(permission => hasPermission(permission));
  };

  // Get all permissions that the user has
  const getUserPermissions = (): string[] => {
    if (!permissions) return [];
    
    return Object.entries(permissions)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key);
  };

  // Check if user can access a specific feature based on permissions
  const canAccessFeature = (requiredPermissions: (keyof PermissionSet)[]): boolean => {
    return hasAnyPermission(requiredPermissions);
  };

  // Role-based checks
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isSupportTeam = user?.role === 'SUPPORT_TEAM';
  const isModerator = user?.role === 'MODERATOR';
  const isAnalyst = user?.role === 'ANALYST';
  const isSupportLead = user?.role === 'SUPPORT_LEAD';
  const isGameManager = user?.role === 'GAME_MANAGER';
  const isFinanceManager = user?.role === 'FINANCE_MANAGER';
  const isContentModerator = user?.role === 'CONTENT_MODERATOR';



  return {
    // User info
    user,
    userRole: user?.role,
    isLoading,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessFeature,
    getUserPermissions,
    
    // Role checks
    isAdmin,
    isManager,
    isSupportTeam,
    isModerator,
    isAnalyst,
    isSupportLead,
    isGameManager,
    isFinanceManager,
    isContentModerator,
    
    // All permissions object
    permissions,
  };
}; 