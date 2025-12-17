import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Type definitions matching backend responses
export interface User {
  _id: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  email: string;
  phone: string;
  isActive: boolean;
  isOpted: boolean;
  createdAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

export interface OptedInUsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: Pagination;
  };
  message: string;
}

export interface SmsStatsResponse {
  success: boolean;
  data: {
    stats: {
      totalUsers: number;
      totalOptedIn: number;
      activeOptedIn: number;
      optInRate: string;
    };
  };
  message: string;
}

export interface SendSmsRequest {
  message: string;
  sendToAll: boolean;
  userIds: string[];
}

export interface SendSmsResponse {
  success: boolean;
  data: {
    recipientCount: number;
    successful: number;
    failed: number;
    recipients: Array<{
      name: string;
      phone: string;
    }>;
  };
  message: string;
}

export interface UpdateOptInRequest {
  optIn: boolean;
}

export interface UpdateOptInResponse {
  success: boolean;
  data: {
    userId: string;
    isOpted: boolean;
    message: string;
  };
  message: string;
}

export interface TestSmsRequest {
  phoneNumber: string;
  messageType?: string;
}

export interface TestSmsResponse {
  success: boolean;
  data: {
    success: boolean;
    sid: string;
    status: string;
  };
  message: string;
}

// Create the API
export const smsMarketingApi = createApi({
  reducerPath: "smsMarketingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/sms-marketing",
    prepareHeaders: (headers, { getState }) => {
      // Get token from your auth state - adjust path based on your store structure
      const token =
        (getState() as any).auth?.token ||
        (getState() as any).auth?.accessToken ||
        localStorage.getItem("token"); // Fallback to localStorage

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["OptedInUsers", "SmsStats"],
  endpoints: (builder) => ({
    // Get opted-in users
    getOptedInUsers: builder.query<
      OptedInUsersResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        isActive?: string;
      }
    >({
      query: ({ page = 1, limit = 10, search = "", isActive }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search) params.append("search", search);
        if (isActive !== undefined && isActive !== "") {
          params.append("isActive", isActive);
        }

        return `/opted-users?${params.toString()}`;
      },
      providesTags: ["OptedInUsers"],
    }),

    // Get SMS statistics
    getSmsStats: builder.query<SmsStatsResponse, void>({
      query: () => "/stats",
      providesTags: ["SmsStats"],
    }),

    // Send SMS
    sendSms: builder.mutation<SendSmsResponse, SendSmsRequest>({
      query: (data) => ({
        url: "/send-sms",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SmsStats"],
    }),

    // Update user opt-in status
    updateUserOptIn: builder.mutation<
      UpdateOptInResponse,
      {
        userId: string;
        optIn: boolean;
      }
    >({
      query: ({ userId, optIn }) => ({
        url: `/opt-in/${userId}`,
        method: "PUT",
        body: { optIn },
      }),
      invalidatesTags: ["OptedInUsers", "SmsStats"],
    }),

    // Send test SMS
    sendTestSms: builder.mutation<TestSmsResponse, TestSmsRequest>({
      query: (data) => ({
        url: "/test-sms",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetOptedInUsersQuery,
  useGetSmsStatsQuery,
  useSendSmsMutation,
  useUpdateUserOptInMutation,
  useSendTestSmsMutation,
} = smsMarketingApi;

// ==========================================
// Add to Redux Store
// File: store/store.ts or app/store.ts
// ==========================================

/*
import { configureStore } from '@reduxjs/toolkit';
import { smsMarketingApi } from '../services/api/smsMarketingApi';

export const store = configureStore({
  reducer: {
    // Add the SMS Marketing API reducer
    [smsMarketingApi.reducerPath]: smsMarketingApi.reducer,
    // ... your other reducers
    auth: authReducer,
    // etc...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(smsMarketingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
*/
