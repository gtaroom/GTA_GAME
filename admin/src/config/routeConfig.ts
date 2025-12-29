import { RouteConfig } from "../types";

// Route configuration with permission requirements
// Note: Users with ADMIN role will automatically have access to ALL routes regardless of specific permissions
export const routeConfigs: RouteConfig[] = [
  {
    path: "/",
    title: "Dashboard",
    description: "Overview and analytics",
    icon: "BarChart3",
    requiredPermissions: ["ADMIN"],
    isActive: true,
  },
  {
    path: "/roles",
    title: "Role Management",
    description: "Manage user roles and permissions",
    icon: "Shield",
    requiredPermissions: ["canManageRoles"],
    isActive: true,
  },
  {
    path: "/users",
    title: "User Management",
    description: "Manage system users",
    icon: "Users",
    requiredPermissions: ["canViewAllUsers"],
    isActive: true,
  },
  {
    path: "/balance",
    title: "User Balance",
    description: "View and manage user balances",
    icon: "Wallet",
    requiredPermissions: ["canViewAllUsers"],
    isActive: true,
  },
  {
    path: "/banner-management",
    title: "Banner Management",
    icon: "Image",
    requiredPermissions: ["canManageBanners"],
  },
  {
    path: "/transactions",
    title: "Transactions",
    description: "View wallet transactions",
    icon: "Receipt",
    requiredPermissions: ["canViewAllTransactions"],
    isActive: true,
  },
  {
    path: "/recharges",
    title: "Recharges",
    description: "Manage user recharge requests",
    icon: "ArrowDownLeft",
    requiredPermissions: ["canViewSupportTickets"],
    isActive: true,
  },
  {
    path: "/withdrawals",
    title: "Withdrawals",
    description: "Manage user withdrawal requests",
    icon: "ArrowUpRight",
    requiredPermissions: ["canViewSupportTickets"],
    isActive: true,
  },
  {
    path: "/game-accounts",
    title: "Game Account Requests",
    description: "Manage game account requests",
    icon: "Gamepad2",
    requiredPermissions: ["canManageGames"],
    isActive: true,
  },
  {
    path: "/coupons",
    title: "Coupon Management",
    description: "Manage promotional coupons",
    icon: "Tag",
    requiredPermissions: ["canManageCoupons"],
    isActive: true,
  },
  {
    path: "/draw-winners",
    title: "Draw Winners",
    description: "Manage game winners and draws",
    icon: "Trophy",
    requiredPermissions: ["ADMIN"],
    isActive: true,
  },

  {
    path: "/email",
    title: "Email Communication",
    description: "Send emails to users",
    icon: "Mail",
    requiredPermissions: ["canManageSystem"],
    isActive: true,
  },
  {
    path: '/affiliates',
    title: 'Affiliate Management',
    description: 'Manage affiliate applications',
    icon: 'UserCheck',
    requiredPermissions: ['ADMIN'],
    isActive: true
  },
  {
    path: '/spin-wheel',
    title: 'Spin Wheel Management',
    description: 'Configure spin wheel rewards and triggers',
    icon: 'Circle',
    requiredPermissions: ['ADMIN'],
    isActive: true
  },
//   {
//     path: '/support',
//     title: 'Support Management',
//     description: 'Manage support team and tickets',
//     icon: 'Users',
//     requiredPermissions: ['canManageSupportTeam'],
//     isActive: true
//   },
//   {
//     path: '/moderation',
//     title: 'Content Moderation',
//     description: 'Moderate user content and ban users',
//     icon: 'Shield',
//     requiredPermissions: ['canModerateContent'],
//     isActive: true
//   }
];

// Helper function to get routes accessible by a user based on their permissions
export const getAccessibleRoutes = (
  userPermissions: string[],
  userRole?: string
): RouteConfig[] => {
  // If user is ADMIN, they get access to all routes
  if (userRole === "ADMIN") {
    return routeConfigs;
  }

  // Otherwise, filter routes based on user permissions
  return routeConfigs.filter((route) => {
    // Check if user has any of the required permissions for this route
    return route.requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );
  });
};

// Helper function to check if a user can access a specific route
export const canAccessRoute = (
  routePath: string,
  userPermissions: string[],
  userRole?: string
): boolean => {
  // If user is ADMIN, they can access all routes
  if (userRole === "ADMIN") {
    return true;
  }

  const route = routeConfigs.find((r) => r.path === routePath);
  if (!route) return false;

  return route.requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
};

// Helper function to get routes grouped by category
export const getRoutesByCategory = (
  userPermissions?: string[],
  userRole?: string
): Record<string, RouteConfig[]> => {
  // If user is ADMIN, show all routes
  const routesToShow =
    userRole === "ADMIN"
      ? routeConfigs
      : userPermissions
      ? getAccessibleRoutes(userPermissions, userRole)
      : routeConfigs;

  const categories: Record<string, RouteConfig[]> = {
    "Analytics & Reports": [],
    "User Management": [],
    "System Management": [],
    "Financial Management": [],
    "Game Management": [],
    "Support & Communication": [],
    "Content Moderation": [],
  };

  routesToShow.forEach(route => {
    if (route.path === '/') {
      categories['Analytics & Reports'].push(route);
    } else if (route.path === '/users' || route.path === '/roles') {
      categories['User Management'].push(route);
    } else if (route.path === '/balance' || route.path === '/withdrawals' || route.path === '/recharges') {
      categories['Financial Management'].push(route);
    } else if (route.path === '/draw-winners' || route.path === '/game-accounts') {
      categories['Game Management'].push(route);
    } else if (route.path === '/email' || route.path === '/coupons') {
      categories['System Management'].push(route);
    } else if (route.path === '/affiliates' || route.path === '/spin-wheel') {
      categories['System Management'].push(route);
    } else if (route.path === '/support') {
      categories['Support & Communication'].push(route);
    } else if (route.path === '/moderation') {
      categories['Content Moderation'].push(route);
    }
  });

  return categories;
};
