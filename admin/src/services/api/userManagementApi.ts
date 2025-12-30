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
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkAssignRoleMutation,
  useSearchUsersQuery,
  useGetUserStatisticsQuery,
  useLazyGetAllUsersForExportQuery,
} = userManagementApi;
