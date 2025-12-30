import { baseUserApi } from "./baseUserApi";

export interface DashboardOverview {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  recentActivity: {
    newUsers: number;
    roleChanges: number;
    systemEvents: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    lastBackup: string;
  };
}

export interface RoleStatistics {
  roles: Array<{
    name: string;
    userCount: number;
    permissions: string[];
  }>;
  totalRoles: number;
  activeRoles: number;
  mostUsedRole: string;
  leastUsedRole: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastBackup: string;
  databaseStatus: 'connected' | 'disconnected';
  apiStatus: 'operational' | 'degraded' | 'down';
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export const adminDashboardApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard overview
    getDashboardOverview: builder.query<DashboardOverview, void>({
      query: () => "/admin/dashboard",
      transformResponse: (response: { data: DashboardOverview }) => response.data,
      providesTags: ["Dashboard"],
    }),

    // Get role statistics
    getRoleStatistics: builder.query<RoleStatistics, void>({
      query: () => "/admin/role-statistics",
      transformResponse: (response: { data: RoleStatistics }) => response.data,
      providesTags: ["RoleStatistics"],
    }),

    // Get system health
    getSystemHealth: builder.query<SystemHealth, void>({
      query: () => "/admin/system-health",
      transformResponse: (response: { data: SystemHealth }) => response.data,
      providesTags: ["SystemHealth"],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetRoleStatisticsQuery,
  useGetSystemHealthQuery,
} = adminDashboardApi; 