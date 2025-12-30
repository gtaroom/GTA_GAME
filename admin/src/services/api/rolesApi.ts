import { Role, CreateRolePayload, UpdateRolePayload, PermissionSet } from "../../types/admin/UserTypes";
import { baseUserApi } from "./baseUserApi";

export const rolesApi = baseUserApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all roles
    getAllRoles: builder.query<Role[], void>({
      query: () => "/roles",
      transformResponse: (response: { data: Role[] }) => response.data,
      providesTags: ["Roles"],
    }),

    // Get role by ID
    getRoleById: builder.query<Role, string>({
      query: (roleId) => `/roles/${roleId}`,
      transformResponse: (response: { data: Role }) => response.data,
      providesTags: (result, error, roleId) => [{ type: "Roles", id: roleId }],
    }),

    // Create new role
    createRole: builder.mutation<Role, CreateRolePayload>({
      query: (payload) => ({
        url: "/roles",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: { data: Role }) => response.data,
      invalidatesTags: ["Roles"],
    }),

    // Update role
    updateRole: builder.mutation<Role, { roleId: string; payload: UpdateRolePayload }>({
      query: ({ roleId, payload }) => ({
        url: `/roles/${roleId}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: { data: Role }) => response.data,
      invalidatesTags: (result, error, { roleId }) => [
        { type: "Roles", id: roleId },
        "Roles",
      ],
    }),

    // Delete role (soft delete)
    deleteRole: builder.mutation<{ message: string }, string>({
      query: (roleId) => ({
        url: `/roles/${roleId}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: { message: string } }) => response.data,
      invalidatesTags: ["Roles"],
    }),

    // Get role permissions
    getRolePermissions: builder.query<PermissionSet, string>({
      query: (roleId) => `/roles/permissions/${roleId}`,
      transformResponse: (response: { data: { permissions: PermissionSet }}) => response.data.permissions,
      providesTags: (result, error, roleId) => [{ type: "RolePermissions", id: roleId }],
    }),

    // Initialize default roles
    initializeRoles: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/roles/initialize",
        method: "POST",
      }),
      transformResponse: (response: { data: { message: string } }) => response.data,
      invalidatesTags: ["Roles"],
    }),
  }),
});

export const {
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolePermissionsQuery,
  useInitializeRolesMutation,
} = rolesApi; 