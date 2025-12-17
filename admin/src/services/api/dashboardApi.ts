import { DashboardStats, EngagementMetric, RegistrationTrend } from "../../types";
import { baseUserApi } from "./baseUserApi";

export const dashboardAPI = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<DashboardStats, void>({
      query: () => "/admin/dashboard-stats",
      transformResponse: (response: { data: DashboardStats }) => response.data,
      providesTags: ["Dashboard"],
    }),
    getUsersMetrics: builder.query<EngagementMetric[], void>({
      query: () => "/admin/user-mterics",
      transformResponse: (response: { data: EngagementMetric[] }) => response.data,
      providesTags: ["Dashboard"],
    }),
    getRegistrationTrend: builder.query<RegistrationTrend[], void>({
      query: () => "/admin/reg-trend",
      transformResponse: (response: { data: RegistrationTrend[] }) => response.data,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetStatsQuery, useGetUsersMetricsQuery,useGetRegistrationTrendQuery } = dashboardAPI;
