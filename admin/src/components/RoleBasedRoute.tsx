import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGetUserDetailsQuery } from '../services/api/authApi';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from './UI/LoadingSpinner';
import AccessDenied from './UI/AccessDenied';
import { getAccessibleRoutes } from '../config/routeConfig';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  showAccessDenied?: boolean;
  autoRedirectToFirstAllowed?: boolean;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  requiredPermissions = [],
  fallbackPath = "/",
  showAccessDenied = true,
  autoRedirectToFirstAllowed = false
}) => {
  const { isLoading: userLoading, data: user, error } = useGetUserDetailsQuery();
  const { hasAnyPermission, getUserPermissions, isLoading: permissionsLoading } = usePermissions();

  // If there's an authentication error, redirect to login
  if (error && "status" in error && typeof error.status === "number" && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  // If still loading user OR permissions
  if (userLoading || permissionsLoading) {
    return null; // Return null instead of spinner to reduce flicker
  }

  // If no user data, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permissions
  let hasAccess = false;

  // If requiredPermissions are specified, check those first
  if (requiredPermissions.length > 0) {
    hasAccess = hasAnyPermission(requiredPermissions as any[]);
  }
  // If no permissions specified but roles are specified, fall back to role checking
  else if (allowedRoles.length > 0) {
    hasAccess = allowedRoles.includes(user.role);
  }
  // If neither specified, allow access (for backward compatibility)
  else {
    hasAccess = true;
  }

  if (!hasAccess) {
    if (autoRedirectToFirstAllowed && user) {
      const userPermissions = getUserPermissions();
      const routes = getAccessibleRoutes(userPermissions, user.role);
      const firstAccessible = routes.find(r => r.isActive !== false);
      if (firstAccessible) {
        return <Navigate to={firstAccessible.path} replace />;
      }
    }
    if (showAccessDenied && !autoRedirectToFirstAllowed) {
      return <AccessDenied 
        requiredRole="appropriate permissions"
        feature="this page" 
      />;
    } else {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};

export default RoleBasedRoute; 