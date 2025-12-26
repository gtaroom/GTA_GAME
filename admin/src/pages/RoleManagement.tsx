"use client";

import { BarChart3, Edit, Plus, Shield, Trash2, Users } from "lucide-react";
import React, { useState } from "react";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Modal from "../components/UI/Modal";
import Table from "../components/UI/Table";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetAllRolesQuery,
  useUpdateRoleMutation,
} from "../services/api/rolesApi";
import { useGetUserStatisticsQuery } from "../services/api/userManagementApi";
import { CreateRolePayload, PermissionSet } from "../types/admin/UserTypes";

const RoleManagement: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const initialPermissions: PermissionSet = {
    canViewAllUsers: false,
    canViewUserProfiles: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canCreateUsers: false,
    canManageCoupons: false,
    canManageGames: false,
    canManageBanners: false, // Added for DESIGNER use
    canViewAllTransactions: false,
    canViewFinancialData: false,
    canViewSupportTickets: false,
    canResolveSupportTickets: false,
    canModerateContent: false,
    canViewAnalytics: false,
    canViewReports: false,
    canManageRoles: false,
    canManageSystem: false,
  };

  const [formData, setFormData] = useState<CreateRolePayload>({
    name: "",
    description: "",
    permissions: initialPermissions,
  });

  const {
    data: roles,
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useGetAllRolesQuery();
  const { data: userStats } = useGetUserStatisticsQuery();
  const [createRole, { isLoading: creatingRole }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updatingRole }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: deletingRole }] = useDeleteRoleMutation();

  const permissionLabels: Record<keyof PermissionSet, string> = {
    canViewAllUsers: "View All Users",
    canViewUserProfiles: "View User Profiles",
    canEditUsers: "Edit Users",
    canDeleteUsers: "Delete Users",
    canCreateUsers: "Create Users",
    canManageCoupons: "Manage Coupons",
    canManageGames: "Manage Game Requests",
    canManageBanners: "Manage Home Banners",
    canViewAllTransactions: "View All Transactions",
    canViewFinancialData: "View Financial Data",
    canViewSupportTickets: "View Support Tickets",
    canResolveSupportTickets: "Resolve Support Tickets",
    canModerateContent: "Moderate Content",
    canViewAnalytics: "View Analytics",
    canViewReports: "View Reports",
    canManageRoles: "Manage Roles",
    canManageSystem: "Manage System",
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", permissions: initialPermissions });
  };

  const handlePermissionChange = (
    permission: keyof PermissionSet,
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }));
  };

  const openEditModal = (role: any) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: { ...initialPermissions, ...role.permissions },
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      await deleteRole(id).unwrap();
      showToast("Role deleted", "success");
      refetchRoles();
    } catch (err: any) {
      showToast(err?.data?.message || "Error", "error");
    }
  };

  // We create strings for 'permissions' and JSX for 'actions' so the Table can use 'accessor'
  const tableData =
    roles?.map((role) => ({
      ...role,
      userCount: userStats?.usersByRole[role.name] || 0,
      // Convert active permissions to a single string
      permissionList: Object.entries(role.permissions)
        .filter(([_, value]) => value === true)
        .map(([key]) => permissionLabels[key as keyof PermissionSet])
        .join(", "),
      // Create the action buttons as a property the table can display
      actionButtons: (
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => openEditModal(role)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteRole(role._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    })) || [];

  const tableColumns = [
    { header: "Role Name", accessor: "name" as const },
    { header: "Users", accessor: "userCount" as const },
    { header: "Permissions", accessor: "permissionList" as const },
    { header: "Actions", accessor: "actionButtons" as const },
  ];

  if (!hasPermission("canManageRoles"))
    return <div className="p-6">Access Denied</div>;
  if (rolesLoading) return <LoadingSpinner size="lg" />;

  const handleSave = async () => {
    try {
      if (isCreateModalOpen) {
        console.log("Sending Create Payload:", formData);
        await createRole(formData).unwrap();
        showToast("Role created successfully", "success");
        setIsCreateModalOpen(false);
      } else {
        console.log("Sending Update Payload:", formData);
        await updateRole({
          roleId: selectedRole._id,
          payload: formData,
        }).unwrap();
        showToast("Role updated successfully", "success");
        setIsEditModalOpen(false);
      }
      resetForm();
      refetchRoles();
    } catch (err: any) {
      console.error("Save Error:", err);
      // This will show you exactly why the backend rejected it
      showToast(err?.data?.message || "Failed to save role", "error");
    }
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Create Role
        </Button>
      </div>

      <Card>
        <Table
          columns={tableColumns}
          data={tableData}
          keyExtractor={(item) => item._id}
          emptyMessage="No roles found"
        />
      </Card>

      {/* MODALS (logic remains same as your previous working version) */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isCreateModalOpen ? "Create Role" : "Edit Role"}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          <div className="space-y-2">
            <label className="text-sm font-bold">Role Name</label>
            <input
              className="w-full border p-2 rounded"
              placeholder="e.g. DESIGNER"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Description</label>
            <textarea
              className="w-full border p-2 rounded"
              placeholder="What does this role do?"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(permissionLabels).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={formData.permissions[key as keyof PermissionSet]}
                  onChange={(e) =>
                    handlePermissionChange(
                      key as keyof PermissionSet,
                      e.target.checked
                    )
                  }
                />
                <span className="text-xs">{label}</span>
              </label>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={handleSave}
            // This stops the user from clicking 10 times while it's loading
            disabled={creatingRole || updatingRole}
          >
            {creatingRole || updatingRole ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" /> Saving...
              </div>
            ) : (
              "Save Role"
            )}
          </Button>
          {/* <Button
            className="w-full"
            onClick={
              isCreateModalOpen
                ? async () => {
                    await createRole(formData).unwrap();
                    setIsCreateModalOpen(false);
                    refetchRoles();
                  }
                : async () => {
                    await updateRole({
                      roleId: selectedRole._id,
                      payload: formData,
                    }).unwrap();
                    setIsEditModalOpen(false);
                    refetchRoles();
                  }
            }
          >
            Save Role
          </Button> */}
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement;
