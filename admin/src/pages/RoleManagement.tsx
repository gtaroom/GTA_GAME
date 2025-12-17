import { BarChart3, Edit, Plus, Shield, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import Table from '../components/UI/Table';
import { useToast } from '../context/ToastContext';
import { usePermissions } from '../hooks/usePermissions';
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetAllRolesQuery,
  useInitializeRolesMutation,
  useUpdateRoleMutation
} from '../services/api/rolesApi';
import { useGetUserStatisticsQuery } from '../services/api/userManagementApi';
import { CreateRolePayload, PermissionSet } from '../types/admin/UserTypes';

const RoleManagement: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [formData, setFormData] = useState<CreateRolePayload>({
    name: '',
    description: '',
    permissions: {
      canViewAllUsers: false,
      canViewUserProfiles: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canManageCoupons: false,
      // Game Management
      canManageGames: false,
      
      // Wallet & Transactions
      canViewAllTransactions: false,
      canViewFinancialData: false,
      
      // Support & Tickets
      canViewSupportTickets: false,
      canResolveSupportTickets: false,
      
      // Content & Moderation
      canModerateContent: false,
      
      // Analytics & Reports
      canViewAnalytics: false,
      canViewReports: false,
      
      // System Management
      canManageRoles: false,
      canManageSystem: false,
      // canAccessEverything: false,
    }
  });

  const { data: roles, isLoading: rolesLoading, refetch: refetchRoles } = useGetAllRolesQuery();
  const { data: userStats } = useGetUserStatisticsQuery();
  const [createRole, { isLoading: creatingRole }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updatingRole }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: deletingRole }] = useDeleteRoleMutation();
  const [initializeRoles, { isLoading: initializing }] = useInitializeRolesMutation();

  const handleCreateRole = async () => {
    try {
      await createRole(formData).unwrap();
      showToast('Role created successfully', 'success');
      setIsCreateModalOpen(false);
      resetForm();
      refetchRoles();
    } catch (error:any) {
      showToast(error?.data?.message || 'Failed to create role', 'error');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    
    try {
      await updateRole({ roleId: selectedRole._id, payload: formData }).unwrap();
      showToast('Role updated successfully', 'success');
      setIsEditModalOpen(false);
      resetForm();
      refetchRoles();
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await deleteRole(roleId).unwrap();
      showToast('Role deleted successfully', 'success');
      refetchRoles();
    } catch (error: any) {
      console.log(error)
      showToast(error?.data?.message || 'Failed to delete role', 'error');
    }
  };

  const handleInitializeRoles = async () => {
    try {
      await initializeRoles().unwrap();
      showToast('Default roles initialized successfully', 'success');
      refetchRoles();
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to initialize roles', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: {
        canViewAllUsers: false,
        canViewUserProfiles: false,
        canEditUsers: false,
        canDeleteUsers: false,
        canCreateUsers: false,
        
        // Game Management
        canManageGames: false,
        canManageCoupons: false,
        
        // Wallet & Transactions
        canViewAllTransactions: false,
        canViewFinancialData: false,
        
        // Support & Tickets
        canViewSupportTickets: false,
        canResolveSupportTickets: false,
        
        // Content & Moderation
        canModerateContent: false,
        
        // Analytics & Reports
        canViewAnalytics: false,
        canViewReports: false,
        
        // System Management
        canManageRoles: false,
        canManageSystem: false,
        // canAccessEverything: false,
      }
    });
  };

  const openEditModal = (role: any) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsEditModalOpen(true);
  };

  const handlePermissionChange = (permission: keyof PermissionSet, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const permissionLabels: Record<keyof PermissionSet, string> = {
    canViewAllUsers: 'View All Users',
    canViewUserProfiles: 'View User Profiles',
    canEditUsers: 'Edit Users',
    canDeleteUsers: 'Delete Users',
    canCreateUsers: 'Create Users',
    canManageCoupons: 'Manage Coupons',
    // Game Management
    canManageGames: 'Manage Games Account Requests',
    
    // Wallet & Transactions
    canViewAllTransactions: 'View All Transactions',
    canViewFinancialData: 'View Financial Data',
    
    // Support & Tickets
    canViewSupportTickets: 'View Support Tickets',
    canResolveSupportTickets: 'Resolve Support Tickets',

    // Content & Moderation
    canModerateContent: 'Moderate Content',
    // canBanUsers: 'Ban Users',
    
    // Analytics & Reports
    canViewAnalytics: 'View Analytics',
    canViewReports: 'View Reports',
    
    // System Management
    canManageRoles: 'Manage Roles',
    canManageSystem: 'Manage System',
    // canAccessEverything: 'Access Everything',
  };

  if (!hasPermission('canManageRoles')) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to manage roles.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (rolesLoading) {
    return <LoadingSpinner size="lg" text="Loading roles..." />;
  }

  const tableColumns = [
    { header: 'Role Name', accessor: 'name' as const },
    { header: 'Description', accessor: 'description' as const },
    { header: 'Users', accessor: 'userCount' as const },
    { header: 'Permissions', accessor: 'permissions' as const },
    { header: 'Actions', accessor: 'actions' as const },
  ];

  const tableData = roles?.map(role => ({
    ...role,
    userCount: userStats?.usersByRole[role.name] || 0,
    permissions: Object.entries(role.permissions)
      .filter(([_, value]) => value)
      .map(([key]) => permissionLabels[key as keyof PermissionSet])
      .join(', '),
    actions: (
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => openEditModal(role)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDeleteRole(role._id)}
          disabled={deletingRole}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={creatingRole}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.totalUsers || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Roles</p>
              <p className="text-2xl font-bold text-gray-900">
                {roles?.filter(role => role.isActive).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <Table
          columns={tableColumns}
          data={tableData}
          keyExtractor={(item) => item._id}
          emptyMessage="No roles found"
        />
      </Card>

      {/* Create Role Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., SUPPORT_LEAD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Describe the role's purpose"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions[key as keyof PermissionSet]}
                    onChange={(e) => handlePermissionChange(key as keyof PermissionSet, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={creatingRole || !formData.name}
            >
              {creatingRole ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions[key as keyof PermissionSet]}
                    onChange={(e) => handlePermissionChange(key as keyof PermissionSet, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updatingRole || !formData.name}
            >
              {updatingRole ? 'Updating...' : 'Update Role'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoleManagement; 