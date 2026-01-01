import {
  CheckCircle,
  Download,
  Edit,
  Eye,
  Filter,
  Mail,
  Phone,
  Search,
  Shield,
  Trash2,
  Upload,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import Modal from "../components/UI/Modal";
import Pagination from "../components/UI/Pagination";
import Table from "../components/UI/Table";
import { useToast } from "../context/ToastContext";
import { usePermissions } from "../hooks/usePermissions";
import { useGetAllRolesQuery } from "../services/api/rolesApi";
import {
  useBulkAssignRoleMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useGetUserStatisticsQuery,
  useUpdateUserMutation,
  useLazyGetAllUsersForExportQuery,
} from "../services/api/userManagementApi";
import {
  BulkRoleAssignmentPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UserManagementUser,
} from "../types/admin/UserTypes";

const EnhancedUserManagement: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState("");
  const [isKYC, setIsKYC] = useState("");
  const [isOpted, setIsOpted] = useState("");
  const [isSmsOpted, setIsSmsOpted] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementUser | null>(
    null
  );
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [createFormData, setCreateFormData] = useState<CreateUserPayload>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
  });
  const [editFormData, setEditFormData] = useState<UpdateUserPayload>({
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
    isActive: true,
    isPhoneVerified: false,
    isKYC: false,
    isEmailVerified: false,
    isOpted: false,
    isSmsOpted: false,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetAllUsersQuery({
    page: currentPage,
    limit: 10,
    role: selectedRole || undefined,
    search: debouncedSearchTerm || undefined,
    isEmailVerified: isEmailVerified || undefined,
    isPhoneVerified: isPhoneVerified || undefined,
    isKYC: isKYC || undefined,
    isOpted: isOpted || undefined,
    isSmsOpted: isSmsOpted || undefined,
  });

  const { data: roles } = useGetAllRolesQuery();
  const { data: userStats } = useGetUserStatisticsQuery();

  const [createUser, { isLoading: creatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: updatingUser }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deletingUser }] = useDeleteUserMutation();
  const [bulkAssignRole, { isLoading: bulkAssigning }] =
    useBulkAssignRoleMutation();
  const [getAllUsersForExport, { isLoading: isExporting }] =
    useLazyGetAllUsersForExportQuery();

  const handleCreateUser = async () => {
    try {
      if (
        !createFormData.email ||
        !createFormData.password ||
        !createFormData.firstName ||
        !createFormData.lastName ||
        !createFormData.role
      ) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      await createUser(createFormData).unwrap();
      showToast("User created successfully", "success");
      setIsCreateModalOpen(false);
      resetCreateForm();
      refetchUsers();
    } catch (error) {
      showToast("Failed to create user", "error");
    }
  };

  const handleUpdateUser = async () => {
    console.log("Updating user:", selectedUser);
    if (!selectedUser) {
      showToast("No user selected for editing", "error");
      return;
    }

    try {
      if (
        !editFormData.firstName ||
        !editFormData.lastName ||
        !editFormData.role
      ) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      console.log(
        "Updating user:",
        selectedUser._id,
        "with data:",
        editFormData
      );

      const result = await updateUser({
        userId: selectedUser._id,
        payload: editFormData,
      }).unwrap();
      console.log("Update result:", result);

      showToast("User updated successfully", "success");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetEditForm();
      refetchUsers();
    } catch (error) {
      console.error("Update error:", error);
      showToast("Failed to update user", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) {
      showToast("No user selected for deletion", "error");
      return;
    }

    try {
      console.log("Deleting user:", selectedUser._id);

      const result = await deleteUser(selectedUser._id).unwrap();
      console.log("Delete result:", result);

      showToast("User deleted successfully", "success");
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      refetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete user", "error");
    }
  };

  const handleBulkAssignRole = async (role: string) => {
    if (selectedUserIds.length === 0) {
      showToast("Please select users to assign role", "error");
      return;
    }

    if (!role) {
      showToast("Please select a role", "error");
      return;
    }

    try {
      console.log("Bulk assigning role:", role, "to users:", selectedUserIds);

      const payload: BulkRoleAssignmentPayload = {
        userIds: selectedUserIds,
        role,
      };
      const result = await bulkAssignRole(payload).unwrap();
      console.log("Bulk assign result:", result);

      showToast("Role assigned successfully", "success");
      setIsBulkAssignModalOpen(false);
      setSelectedUserIds([]);
      refetchUsers();
    } catch (error) {
      console.error("Bulk assign error:", error);
      showToast("Failed to assign role", "error");
    }
  };

  // Download CSV functionality - UPDATED TO USE NEW EXPORT ENDPOINT
  const downloadUsersData = async () => {
    try {
      showToast("Preparing export...", "success");

      // Fetch ALL users with current filters applied
      const result = await getAllUsersForExport({
        role: selectedRole || undefined,
        search: debouncedSearchTerm || undefined,
        isEmailVerified: isEmailVerified || undefined,
        isPhoneVerified: isPhoneVerified || undefined,
        isKYC: isKYC || undefined,
        isOpted: isOpted || undefined,
        isSmsOpted: isSmsOpted || undefined,
      }).unwrap();

      if (!result?.users || result.users.length === 0) {
        showToast("No users to export", "error");
        return;
      }

      console.log("Downloading CSV for users:", result.users.length);

      // Create CSV content with ALL users
      const headers = [
        "Name",
        "Email",
        "Role",
        "Phone",
        "Email Verified",
        "Phone Verified",
        "KYC",
        "Email Opted",
        "SMS Opted",
        "Created",
        "Status",
      ];

      const csvContent = [
        headers.join(","),
        ...result.users.map((user) =>
          [
            `"${user.name.first} ${user.name.middle || ""} ${
              user.name.last
            }".trim()`,
            user.email,
            user.role,
            user.phone || "",
            user.isEmailVerified ? "Yes" : "No",
            user.isPhoneVerified ? "Yes" : "No",
            user.isKYC ? "Yes" : "No",
            user.isOpted ? "Yes" : "No",
            user.isSmsOpted ? "Yes" : "No",
            new Date(user.createdAt).toLocaleDateString(),
            user.isActive ? "Active" : "Inactive",
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `all_users_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(
        `Successfully exported ${result.users.length} users!`,
        "success"
      );
    } catch (error) {
      console.error("Error exporting users data:", error);
      showToast("Failed to export users data", "error");
    }
  };

  // Bulk delete functionality
  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) {
      showToast("Please select users to delete", "error");
      return;
    }

    try {
      console.log("Bulk deleting users:", selectedUserIds);

      // Delete users one by one (you might want to implement a bulk delete API endpoint)
      for (const userId of selectedUserIds) {
        const result = await deleteUser(userId).unwrap();
        console.log("Deleted user:", userId, "result:", result);
      }

      showToast(
        `${selectedUserIds.length} users deleted successfully`,
        "success"
      );
      setIsBulkDeleteModalOpen(false);
      setSelectedUserIds([]);
      refetchUsers();
    } catch (error) {
      console.error("Bulk delete error:", error);
      showToast("Failed to delete some users", "error");
    }
  };

  const resetCreateForm = () => {
    console.log("Resetting create form");
    setCreateFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "",
    });
  };

  const resetEditForm = () => {
    console.log("Resetting edit form");
    setEditFormData({
      firstName: "",
      lastName: "",
      phone: "",
      role: "",
      isActive: true,
      isPhoneVerified: false,
      isKYC: false,
      isEmailVerified: false,
      isOpted: false,
      isSmsOpted: false,
    });
  };

  const openEditModal = (user: UserManagementUser) => {
    console.log("Opening edit modal for user:", user);
    setSelectedUser(user);
    setEditFormData({
      firstName: user?.name?.first || "",
      lastName: user?.name?.last || "",
      phone: user.phone || "",
      role: user.role,
      isActive: user.isActive,
      isPhoneVerified: Boolean(user.isPhoneVerified),
      isKYC: Boolean(user.isKYC),
      isEmailVerified: Boolean(user.isEmailVerified),
      isOpted: Boolean(user.isOpted),
      isSmsOpted: Boolean(user.isSmsOpted),
    });
    console.log("Edit form data set to:", editFormData);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: UserManagementUser) => {
    console.log("Opening delete modal for user:", user);
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCreateInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("Create input change:", name, value);
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("Edit input change:", name, value);
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(usersData?.users.map((user) => user._id) || []);
    } else {
      setSelectedUserIds([]);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedRole("");
    setIsEmailVerified("");
    setIsPhoneVerified("");
    setIsKYC("");
    setIsOpted("");
    setIsSmsOpted("");
  };

  if (!hasPermission("canViewAllUsers")) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Access Denied
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to view users.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (usersLoading) {
    return <LoadingSpinner size="lg" text="Loading users..." />;
  }

  const tableColumns = [
    { header: "", accessor: "select" as const, className: "w-12" },
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Role", accessor: "roleTag" as const, className: "w-32" },
    { header: "Phone", accessor: "phone" as const },
    { header: "Email", accessor: "emailVerified" as const, className: "w-20" },
    { header: "Phone", accessor: "phoneVerified" as const, className: "w-20" },
    { header: "KYC", accessor: "kyc" as const, className: "w-16" },
    { header: "Email Opt", accessor: "emailOpted" as const, className: "w-20" },
    { header: "SMS Opt", accessor: "smsOpted" as const, className: "w-20" },
    { header: "Created", accessor: "createdAt" as const, className: "w-28" },
    { header: "Actions", accessor: "actions" as const, className: "w-40" },
  ];

  const tableData =
    usersData?.users.map((user) => ({
      ...user,
      name: `${user?.name?.first || ""} ${user?.name?.middle || ""} ${
        user?.name?.last || ""
      }`.trim(),
      status: user.isActive ? "Active" : "Inactive",
      createdAt: new Date(user.createdAt).toLocaleDateString(),
      roleTag: (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
        ${
          user.role === "ADMIN"
            ? "bg-red-100 text-red-700 ring-1 ring-red-200"
            : user.role === "MANAGER"
            ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
            : user.role === "SUPPORT_TEAM"
            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
            : user.role === "FINANCE_MANAGER"
            ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
            : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
        }`}
          title={user.role}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
          {user.role.split("_").join(" ")}
        </span>
      ),
      emailVerified: user.isEmailVerified ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      ),
      phoneVerified: user.isPhoneVerified ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      ),
      kyc: user.isKYC ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      ),
      emailOpted: user.isOpted ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      ),
      smsOpted: user.isSmsOpted ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      ),

      actions: (
        <div className="flex space-x-3">
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate(`/users/${user._id}`)}
          className="px-3 py-2"
          title="View Full Details"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
          {hasPermission("canEditUsers") && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openEditModal(user)}
              className="px-3 py-2"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {hasPermission("canDeleteUsers") && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => openDeleteModal(user)}
              disabled={deletingUser}
              className="px-3 py-2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      ),
    })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage system users and their roles
          </p>
        </div>
        <div className="flex space-x-4">
          {hasPermission("canEditUsers") && (
            <>
              <Button
                onClick={() => setIsBulkAssignModalOpen(true)}
                disabled={selectedUserIds.length === 0 || bulkAssigning}
                variant="secondary"
                className="px-4 py-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Assign Role ({selectedUserIds.length})
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                disabled={creatingUser}
                className="px-6 py-2"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </>
          )}
          {hasPermission("canDeleteUsers") && selectedUserIds.length > 0 && (
            <Button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              disabled={deletingUser}
              variant="danger"
              className="px-4 py-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Bulk Delete ({selectedUserIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center p-4 gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {userStats?.totalUsers || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center p-4 gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Email Verified
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {userStats?.emailVerifiedUsers || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center p-4 gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Phone className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Phone Verified
              </p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {userStats?.phoneVerifiedUsers || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center p-4 gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">KYC Verified</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {userStats?.kycVerifiedUsers || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center p-4 gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Email Opted</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {userStats?.optedUsers || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center p-4 gap-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Phone className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">SMS Opted</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                {userStats?.smsOptedUsers || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-6">
          {/* Search and Role Filter */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Roles</option>
                {roles?.map((role) => (
                  <option key={role._id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              <Button
                variant="secondary"
                onClick={clearAllFilters}
                className="px-6 py-3"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Verified
              </label>
              <select
                value={isEmailVerified}
                onChange={(e) => setIsEmailVerified(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Verified
              </label>
              <select
                value={isPhoneVerified}
                onChange={(e) => setIsPhoneVerified(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                KYC Status
              </label>
              <select
                value={isKYC}
                onChange={(e) => setIsKYC(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All</option>
                <option value="true">KYC Verified</option>
                <option value="false">Not KYC Verified</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Opted
              </label>
              <select
                value={isOpted}
                onChange={(e) => setIsOpted(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All</option>
                <option value="true">Opted In</option>
                <option value="false">Not Opted</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                SMS Opted
              </label>
              <select
                value={isSmsOpted}
                onChange={(e) => setIsSmsOpted(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All</option>
                <option value="true">Opted In</option>
                <option value="false">Not Opted</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={
                selectedUserIds.length === (usersData?.users.length || 0)
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedUserIds.length} of {usersData?.users.length || 0}{" "}
              selected
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadUsersData}
            disabled={isExporting}
            className="px-4 py-2"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
        <Table
          columns={tableColumns as any[]}
          data={tableData}
          keyExtractor={(item) => item._id}
          emptyMessage="No users found"
        />
        {usersData?.pagination && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={usersData.pagination.pages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          console.log("Closing create modal");
          setIsCreateModalOpen(false);
          resetCreateForm();
        }}
        title="Create New User"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={createFormData.firstName}
                onChange={handleCreateInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={createFormData.lastName}
                onChange={handleCreateInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={createFormData.email}
              onChange={handleCreateInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={createFormData.password}
              onChange={handleCreateInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter password"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={createFormData.phone}
              onChange={handleCreateInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Role *
            </label>
            <select
              name="role"
              value={createFormData.role}
              onChange={handleCreateInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="">Select Role</option>
              {roles?.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              variant="secondary"
              onClick={() => {
                console.log("Create modal cancel clicked");
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                creatingUser ||
                !createFormData.email ||
                !createFormData.password ||
                !createFormData.firstName ||
                !createFormData.lastName ||
                !createFormData.role
              }
              className="px-6 py-2"
            >
              {creatingUser ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          console.log("Closing edit modal");
          setIsEditModalOpen(false);
          setSelectedUser(null);
          resetEditForm();
        }}
        title="Edit User"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={editFormData.firstName || ""}
                onChange={handleEditInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={editFormData.lastName || ""}
                onChange={handleEditInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={selectedUser?.email || ""}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={editFormData.phone}
              onChange={handleEditInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Role *
            </label>
            <select
              name="role"
              value={editFormData.role}
              onChange={handleEditInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="">Select Role</option>
              {roles?.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(editFormData.isKYC)}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    isKYC: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              KYC Verified
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(editFormData.isEmailVerified)}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    isEmailVerified: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              Email Verified
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(editFormData.isPhoneVerified)}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    isPhoneVerified: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              Phone Verified
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(editFormData.isOpted)}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    isOpted: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              Email Opted In
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(editFormData.isSmsOpted)}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    isSmsOpted: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              SMS Opted In
            </label>
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              variant="secondary"
              onClick={() => {
                console.log("Edit modal cancel clicked");
                setIsEditModalOpen(false);
                setSelectedUser(null);
                resetEditForm();
              }}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={
                updatingUser ||
                !editFormData.firstName ||
                !editFormData.lastName ||
                !editFormData.role
              }
              className="px-6 py-2"
            >
              {updatingUser ? "Updating..." : "Update User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          console.log("Closing delete modal");
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-gray-700">
              Are you sure you want to delete the user{" "}
              <span className="font-semibold text-red-700">
                {selectedUser?.name?.first}
              </span>
              ? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                console.log("Delete modal cancel clicked");
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
              }}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deletingUser}
              className="px-6 py-2"
            >
              {deletingUser ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Assign Role Modal */}
      <Modal
        isOpen={isBulkAssignModalOpen}
        onClose={() => {
          console.log("Closing bulk assign modal");
          setIsBulkAssignModalOpen(false);
        }}
        title="Bulk Assign Role"
      >
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              Assign role to{" "}
              <span className="font-semibold text-blue-700">
                {selectedUserIds.length}
              </span>{" "}
              selected users
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Role *
            </label>
            <select
              onChange={(e) => handleBulkAssignRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="">Select Role</option>
              {roles?.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              variant="secondary"
              onClick={() => {
                console.log("Bulk assign modal cancel clicked");
                setIsBulkAssignModalOpen(false);
              }}
              className="px-6 py-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => {
          console.log("Closing bulk delete modal");
          setIsBulkDeleteModalOpen(false);
        }}
        title="Confirm Bulk Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-700">
                {selectedUserIds.length}
              </span>{" "}
              selected users? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                console.log("Bulk delete modal cancel clicked");
                setIsBulkDeleteModalOpen(false);
              }}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              disabled={deletingUser}
              className="px-6 py-2"
            >
              {deletingUser
                ? "Deleting..."
                : `Delete ${selectedUserIds.length} Users`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedUserManagement;
