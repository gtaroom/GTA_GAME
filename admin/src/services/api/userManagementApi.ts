import {
  UserManagementUser,
  CreateUserPayload,
  UpdateUserPayload,
  UserStatistics,
  BulkRoleAssignmentPayload,
} from "../../types/admin/UserTypes";
import { baseUserApi } from "./baseUserApi";

export const userManagementApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users with filters
    getAllUsers: builder.query<
      {
        users: UserManagementUser[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      },
      {
        page?: number;
        limit?: number;
        role?: string;
        search?: string;
        isEmailVerified?: string;
        isPhoneVerified?: string;
        isKYC?: string;
        isOpted?: string;
        isSmsOpted?: string;
      }
    >({
      query: (params) => ({
        url: "/user-management",
        params,
      }),
      transformResponse: (response: {
        data: {
          users: UserManagementUser[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        };
      }) => response.data,
      providesTags: ["UserManagement"],
    }),

    // Get all users for export (no pagination)
    getAllUsersForExport: builder.query<
      {
        users: UserManagementUser[];
      },
      {
        role?: string;
        search?: string;
        isEmailVerified?: string;
        isPhoneVerified?: string;
        isKYC?: string;
        isOpted?: string;
        isSmsOpted?: string;
      }
    >({
      query: (params) => ({
        url: "/user-management",
        params: {
          ...params,
          limit: 100000, // Large number to get all users
          page: 1,
        },
      }),
      transformResponse: (response: {
        data: {
          users: UserManagementUser[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        };
      }) => ({ users: response.data.users }),
    }),

    // Get user by ID
    getUserById: builder.query<UserManagementUser, string>({
      query: (userId) => `/user-management/${userId}`,
      transformResponse: (response: { data: UserManagementUser }) =>
        response.data,
      providesTags: (result, error, userId) => [
        { type: "UserManagement", id: userId },
      ],
    }),

    // Create new user
    createUser: builder.mutation<UserManagementUser, CreateUserPayload>({
      query: (payload) => ({
        url: "/user-management",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: UserManagementUser }) =>
        response.data,
      invalidatesTags: ["UserManagement"],
    }),

    // Update user
    updateUser: builder.mutation<
      UserManagementUser,
      { userId: string; payload: UpdateUserPayload }
    >({
      query: ({ userId, payload }) => ({
        url: `/user-management/${userId}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: { data: UserManagementUser }) =>
        response.data,
      invalidatesTags: (result, error, { userId }) => [
        { type: "UserManagement", id: userId },
        "UserManagement",
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/user-management/${userId}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: { message: string } }) =>
        response.data,
      invalidatesTags: ["UserManagement"],
    }),

    // Bulk assign role
    bulkAssignRole: builder.mutation<
      { message: string },
      BulkRoleAssignmentPayload
    >({
      query: (payload) => ({
        url: "/user-management/bulk-assign-role",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: { message: string } }) =>
        response.data,
      invalidatesTags: ["UserManagement"],
    }),

    // Search users
    searchUsers: builder.query<
      {
        users: UserManagementUser[];
        total: number;
      },
      {
        q: string;
        role?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/user-management/search",
        params,
      }),
      transformResponse: (response: {
        data: {
          users: UserManagementUser[];
          total: number;
        };
      }) => response.data,
      providesTags: ["UserManagement"],
    }),

    // Get user statistics
    getUserStatistics: builder.query<UserStatistics, void>({
      query: () => "/user-management/statistics",
      transformResponse: (response: { data: UserStatistics }) => response.data,
      providesTags: ["UserStatistics"],
    }),

    // Get user full details (comprehensive view)
    getUserFullDetails: builder.query<UserDetailsResponse, string>({
      query: (userId) => `/user/details/${userId}`,
      transformResponse: (response: { 
        statusCode: number;
        success: boolean;
        data: UserDetailsResponse;
        message: string;
      }) => response.data,
      providesTags: (result, error, userId) => [{ type: "UserDetails", id: userId }],
    }),
  }),
});

// User Details Types
export interface UserDetails {
  _id: string;
  name: {
    first: string;
    middle?: string;
    last?: string;
  };
  email: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
  };
  zipCode?: string;
  city?: string;
  state?: string;
  gender?: string;
  dob?: string;
  birthday?: string;
  avatar?: {
    url: string | null;
    localPath?: string;
  };
  role: "USER";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKYC: boolean;
  isOpted: boolean;
  acceptSMSTerms?: boolean;
  isSmsOpted: boolean;
  referralCode?: string;
  loginType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWallet {
  balance: number;
  currency: "GC";
  balanceInDollars: string;
}

export interface UserBonus {
  goldCoins: number;
  sweepCoins: number;
  loginStreak: number;
  lastLoginDate: string | null;
  lastSweeDate: string | null;
  claimedDailyBonus: boolean;
  claimedDailySweepBonus: boolean;
  claimedNewUserBonus: boolean;
  canClaimSpinwheel: boolean;
}

export interface UserTransaction {
  _id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  paymentGateway: string;
  gatewayTransactionId: string;
  gatewayInvoiceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserVipTier {
  currentTier: "none" | "iron" | "bronze" | "silver" | "gold" | "platinum" | "onyx" | "sapphire" | "ruby" | "emerald";
  isVipConfirmed: boolean;
  last7DaysSpending: number;
  totalLifetimeSpending: number;
  vipPeriodStartDate?: string | null;
  vipPeriodEndDate?: string | null;
  bonusSpinsRemaining: number;
  bonusSpinsGrantedAt?: string | null;
  bonusSpinsExpireAt?: string | null;
  birthdayBonusClaimed?: boolean;
  lastBirthdayBonusDate?: string | null;
}

export interface UserSpinWheel {
  totalSpinsUsed: number;
  totalGCWon: number;
  totalSCWon: number;
}

export interface UserDetailsResponse {
  user: UserDetails;
  wallet: UserWallet;
  bonus: UserBonus;
  transactions: UserTransaction[];
  vipTier: UserVipTier;
  spinWheel: UserSpinWheel;
}

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkAssignRoleMutation,
  useSearchUsersQuery,
  useGetUserStatisticsQuery,
  useGetUserFullDetailsQuery,
  useLazyGetAllUsersForExportQuery,
} = userManagementApi;
