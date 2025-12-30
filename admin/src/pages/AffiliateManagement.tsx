import React, { useState } from 'react';
import { CheckCircle, Edit, Filter, Search, Shield, XCircle, Users, BarChart3, DollarSign, UserCheck, Wallet, Eye } from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import Pagination from '../components/UI/Pagination';
import Table from '../components/UI/Table';
import { useToast } from '../context/ToastContext';
import { usePermissions } from '../hooks/usePermissions';
import {
  useGetAllAffiliatesQuery,
  useApproveAffiliateMutation,
  useRejectAffiliateMutation,
  useUpdateAffiliateMutation,
  useGetAffiliateStatisticsQuery,
  useGetAllAffiliateWithdrawalsQuery,
  useGetAffiliateWithdrawalStatisticsQuery,
  useApproveAffiliateWithdrawalMutation,
  useRejectAffiliateWithdrawalMutation,
  useMarkAffiliateWithdrawalPaidMutation,
  Affiliate,
  AffiliateWithdrawal
} from '../services/api/affiliatesApi';

const AffiliateManagement: React.FC = () => {
  const { user } = usePermissions();
  const { showToast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'affiliates' | 'withdrawals'>('affiliates');
  
  // Pagination and filters for affiliates
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Pagination and filters for withdrawals
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [withdrawalSearchTerm, setWithdrawalSearchTerm] = useState('');
  const [tempWithdrawalSearchTerm, setTempWithdrawalSearchTerm] = useState('');
  const [withdrawalFilterStatus, setWithdrawalFilterStatus] = useState<string>('');
  
  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  
  // Withdrawal modal states
  const [isWithdrawalViewModalOpen, setIsWithdrawalViewModalOpen] = useState(false);
  const [isWithdrawalApproveModalOpen, setIsWithdrawalApproveModalOpen] = useState(false);
  const [isWithdrawalRejectModalOpen, setIsWithdrawalRejectModalOpen] = useState(false);
  const [isWithdrawalMarkPaidModalOpen, setIsWithdrawalMarkPaidModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AffiliateWithdrawal | null>(null);
  
  // Withdrawal form states
  const [withdrawalApproveForm, setWithdrawalApproveForm] = useState({ adminNotes: '' });
  const [withdrawalRejectForm, setWithdrawalRejectForm] = useState({ 
    rejectionReason: '', 
    adminNotes: '' 
  });
  const [withdrawalMarkPaidForm, setWithdrawalMarkPaidForm] = useState({ adminNotes: '' });
  
  // Form states
  const [approveFormData, setApproveFormData] = useState({
    commissionRate: 15,
    notes: ''
  });
  const [rejectFormData, setRejectFormData] = useState({
    rejectionReason: '',
    notes: ''
  });
  const [editFormData, setEditFormData] = useState({
    commissionRate: 0,
    notes: '',
    status: 'approved' as 'pending' | 'approved' | 'rejected'
  });

  // Query params
  const queryParams = {
    page: currentPage,
    limit,
    status: (filterStatus as "pending" | "approved" | "rejected" | undefined) || undefined,
    search: searchTerm || undefined
  };

  // API hooks
  const { 
    data: affiliatesData, 
    isLoading, 
    refetch 
  } = useGetAllAffiliatesQuery(queryParams, {
    refetchOnMountOrArgChange: true
  });

  const { data: statistics } = useGetAffiliateStatisticsQuery();
  const [approveAffiliate, { isLoading: isApproving }] = useApproveAffiliateMutation();
  const [rejectAffiliate, { isLoading: isRejecting }] = useRejectAffiliateMutation();
  const [updateAffiliate, { isLoading: isUpdating }] = useUpdateAffiliateMutation();

  // Withdrawal query params
  const withdrawalQueryParams = {
    page: withdrawalPage,
    limit,
    status: (withdrawalFilterStatus as "pending" | "approved" | "rejected" | "paid" | undefined) || undefined,
    search: withdrawalSearchTerm || undefined
  };

  // Withdrawal API hooks
  const { 
    data: withdrawalsData, 
    isLoading: withdrawalsLoading, 
    refetch: refetchWithdrawals 
  } = useGetAllAffiliateWithdrawalsQuery(withdrawalQueryParams, {
    refetchOnMountOrArgChange: true,
    skip: activeTab !== 'withdrawals'
  });

  const { data: withdrawalStats } = useGetAffiliateWithdrawalStatisticsQuery(undefined, {
    skip: activeTab !== 'withdrawals'
  });

  const [approveAffiliateWithdrawal, { isLoading: isApprovingWithdrawal }] = useApproveAffiliateWithdrawalMutation();
  const [rejectAffiliateWithdrawal, { isLoading: isRejectingWithdrawal }] = useRejectAffiliateWithdrawalMutation();
  const [markAffiliateWithdrawalPaid, { isLoading: isMarkingPaid }] = useMarkAffiliateWithdrawalPaidMutation();

  // Check if user is ADMIN
  const isAdmin = user?.role === 'ADMIN';

  // Permission check
  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have permission to manage affiliates. Only ADMIN users can access this page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Handlers
  const handleApproveClick = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setApproveFormData({
      commissionRate: affiliate.commissionRate !== undefined ? affiliate.commissionRate : 15,
      notes: affiliate.notes || ''
    });
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setRejectFormData({
      rejectionReason: '',
      notes: ''
    });
    setIsRejectModalOpen(true);
  };

  const handleEditClick = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setEditFormData({
      commissionRate: affiliate.commissionRate !== undefined ? affiliate.commissionRate : 0,
      notes: affiliate.notes || '',
      status: affiliate.status
    });
    setIsEditModalOpen(true);
  };

  const handleViewClick = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setIsViewModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedAffiliate) return;
    
    try {
      await approveAffiliate({
        id: selectedAffiliate._id,
        payload: approveFormData
      }).unwrap();
      showToast('Affiliate application approved successfully', 'success');
      setIsApproveModalOpen(false);
      resetApproveForm();
      refetch();
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to approve affiliate application', 'error');
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedAffiliate) return;
    
    try {
      await rejectAffiliate({
        id: selectedAffiliate._id,
        payload: rejectFormData
      }).unwrap();
      showToast('Affiliate application rejected successfully', 'success');
      setIsRejectModalOpen(false);
      resetRejectForm();
      refetch();
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to reject affiliate application', 'error');
    }
  };

  const handleUpdateConfirm = async () => {
    if (!selectedAffiliate) return;
    
    try {
      await updateAffiliate({
        id: selectedAffiliate._id,
        payload: editFormData
      }).unwrap();
      showToast('Affiliate updated successfully', 'success');
      setIsEditModalOpen(false);
      resetEditForm();
      refetch();
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to update affiliate', 'error');
    }
  };

  const resetApproveForm = () => {
    setApproveFormData({ commissionRate: 15, notes: '' });
  };

  const resetRejectForm = () => {
    setRejectFormData({ rejectionReason: '', notes: '' });
  };

  const resetEditForm = () => {
    setEditFormData({ commissionRate: 0, notes: '', status: 'approved' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(tempSearchTerm);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setTempSearchTerm('');
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const resetWithdrawalFilters = () => {
    setTempWithdrawalSearchTerm('');
    setWithdrawalSearchTerm('');
    setWithdrawalFilterStatus('');
    setWithdrawalPage(1);
  };

  // Withdrawal handlers
  const handleWithdrawalViewClick = (withdrawal: AffiliateWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsWithdrawalViewModalOpen(true);
  };

  const handleWithdrawalApproveClick = (withdrawal: AffiliateWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setWithdrawalApproveForm({ adminNotes: withdrawal.adminNotes || '' });
    setIsWithdrawalApproveModalOpen(true);
  };

  const handleWithdrawalRejectClick = (withdrawal: AffiliateWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setWithdrawalRejectForm({ rejectionReason: '', adminNotes: '' });
    setIsWithdrawalRejectModalOpen(true);
  };

  const handleWithdrawalMarkPaidClick = (withdrawal: AffiliateWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setWithdrawalMarkPaidForm({ adminNotes: withdrawal.adminNotes || '' });
    setIsWithdrawalMarkPaidModalOpen(true);
  };

  const handleWithdrawalApproveConfirm = async () => {
    if (!selectedWithdrawal) return;
    
    try {
      await approveAffiliateWithdrawal({
        id: selectedWithdrawal._id,
        payload: withdrawalApproveForm
      }).unwrap();
      showToast('Withdrawal request approved successfully', 'success');
      setIsWithdrawalApproveModalOpen(false);
      setWithdrawalApproveForm({ adminNotes: '' });
      refetchWithdrawals();
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to approve withdrawal request', 'error');
    }
  };

  const handleWithdrawalRejectConfirm = async () => {
    if (!selectedWithdrawal) return;
    
    try {
      await rejectAffiliateWithdrawal({
        id: selectedWithdrawal._id,
        payload: withdrawalRejectForm
      }).unwrap();
      showToast('Withdrawal request rejected successfully', 'success');
      setIsWithdrawalRejectModalOpen(false);
      setWithdrawalRejectForm({ rejectionReason: '', adminNotes: '' });
      refetchWithdrawals();
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to reject withdrawal request', 'error');
    }
  };

  const handleWithdrawalMarkPaidConfirm = async () => {
    if (!selectedWithdrawal) return;
    
    try {
      await markAffiliateWithdrawalPaid({
        id: selectedWithdrawal._id,
        payload: withdrawalMarkPaidForm
      }).unwrap();
      showToast('Withdrawal marked as paid successfully', 'success');
      setIsWithdrawalMarkPaidModalOpen(false);
      setWithdrawalMarkPaidForm({ adminNotes: '' });
      refetchWithdrawals();
    } catch (error: any) {
      showToast(error?.data?.message || 'Failed to mark withdrawal as paid', 'error');
    }
  };

  const handleWithdrawalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalSearchTerm(tempWithdrawalSearchTerm);
    setWithdrawalPage(1);
  };

  const handleWithdrawalFilterChange = (value: string) => {
    setWithdrawalFilterStatus(value);
    setWithdrawalPage(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatName = (name: Affiliate['name']) => {
    return `${name.first} ${name.middle || ''} ${name.last}`.trim();
  };

  const formatSocialMedia = (socialMedia?: Record<string, string>) => {
    if (!socialMedia || Object.keys(socialMedia).length === 0) {
      return <span className="text-gray-400">N/A</span>;
    }
    
    return (
      <div className="flex flex-col gap-1">
        {Object.entries(socialMedia).map(([platform, url]) => (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm capitalize"
          >
            {platform}: {url}
          </a>
        ))}
      </div>
    );
  };

  const formatPromotionMethods = (methods?: string[]) => {
    if (!methods || methods.length === 0) {
      return <span className="text-gray-400">N/A</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {methods.map((method, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
          >
            {method}
          </span>
        ))}
      </div>
    );
  };

  if (isLoading && activeTab === 'affiliates') {
    return <LoadingSpinner size="lg" text="Loading affiliates..." />;
  }

  // Table columns
  const columns = [
    {
      header: 'Name',
      accessor: (affiliate: Affiliate) => (
        <div>
          <div className="font-semibold">{formatName(affiliate.name)}</div>
          <div className="text-xs text-gray-500">{affiliate.email}</div>
        </div>
      )
    },
    {
      header: 'Company',
      accessor: (affiliate: Affiliate) => (
        <span className="font-medium">{affiliate.company || 'N/A'}</span>
      )
    },
    {
      header: 'Affiliate Code',
      accessor: (affiliate: Affiliate) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {affiliate.affiliateCode || 'N/A'}
        </span>
      )
    },
    {
      header: 'Commission Rate',
      accessor: (affiliate: Affiliate) => (
        <span className="font-semibold">
          {affiliate.commissionRate !== undefined ? `${affiliate.commissionRate}%` : 'N/A'}
        </span>
      )
    },
    {
      header: 'Earnings',
      accessor: (affiliate: Affiliate) => (
        <div>
          <div className="font-semibold">${(affiliate.totalEarnings || 0).toFixed(2)}</div>
          <div className="text-xs text-gray-500">{affiliate.totalReferrals || 0} referrals</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (affiliate: Affiliate) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[affiliate.status]}`}>
            {affiliate.status.toUpperCase()}
          </span>
        );
      }
    },
    {
      header: 'Applied Date',
      accessor: (affiliate: Affiliate) => formatDate(affiliate.createdAt)
    },
    {
      header: 'Actions',
      accessor: (affiliate: Affiliate) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewClick(affiliate);
            }}
          >
            View
          </Button>
          {affiliate.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveClick(affiliate);
                }}
              >
                <CheckCircle size={16} className="mr-1" /> Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectClick(affiliate);
                }}
              >
                <XCircle size={16} className="mr-1" /> Reject
              </Button>
            </>
          )}
          {(affiliate.status === 'approved' || affiliate.status === 'rejected') && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(affiliate);
              }}
            >
              <Edit size={16} className="mr-1" /> Edit
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Management</h1>
          <p className="text-gray-600">Manage affiliate applications and withdrawal requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`${
              activeTab === 'affiliates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Users className="h-4 w-4 mr-2" />
            Affiliates
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`${
              activeTab === 'withdrawals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Withdrawals
          </button>
        </nav>
      </div>

      {/* Affiliates Tab */}
      {activeTab === 'affiliates' && (
        <>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Affiliates</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.total || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.pending || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.approved || 0}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${statistics?.totalEarnings?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Affiliates Table */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <form className="relative" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search by email, name, company, code..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={tempSearchTerm}
              onChange={(e) => setTempSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <button type="submit" className="hidden">Search</button>
          </form>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="mr-2 text-gray-500" size={18} />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {(searchTerm || filterStatus) && (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        <Table
          columns={columns}
          data={affiliatesData?.affiliates || []}
          keyExtractor={(affiliate) => affiliate._id}
          isLoading={isLoading}
          emptyMessage="No affiliate applications found"
        />
        
        {affiliatesData?.pagination && affiliatesData.pagination.pages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={affiliatesData.pagination.pages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Affiliate Application"
      >
        <div className="space-y-4">
          {selectedAffiliate && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Approving application for: <strong>{formatName(selectedAffiliate.name)}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Email: <strong>{selectedAffiliate.email}</strong>
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={approveFormData.commissionRate}
              onChange={(e) => setApproveFormData(prev => ({
                ...prev,
                commissionRate: parseFloat(e.target.value) || 0
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes (Optional)
            </label>
            <textarea
              value={approveFormData.notes}
              onChange={(e) => setApproveFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any notes about this approval..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleApproveConfirm}
              isLoading={isApproving}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Affiliate Application"
      >
        <div className="space-y-4">
          {selectedAffiliate && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Rejecting application for: <strong>{formatName(selectedAffiliate.name)}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Email: <strong>{selectedAffiliate.email}</strong>
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={rejectFormData.rejectionReason}
              onChange={(e) => setRejectFormData(prev => ({
                ...prev,
                rejectionReason: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Reason for rejection (will be sent to affiliate)..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes (Optional)
            </label>
            <textarea
              value={rejectFormData.notes}
              onChange={(e) => setRejectFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Internal notes..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectConfirm}
              isLoading={isRejecting}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Affiliate"
      >
        <div className="space-y-4">
          {selectedAffiliate && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Editing: <strong>{formatName(selectedAffiliate.name)}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Affiliate Code: <strong>{selectedAffiliate.affiliateCode || 'N/A'}</strong>
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={editFormData.commissionRate}
              onChange={(e) => setEditFormData(prev => ({
                ...prev,
                commissionRate: parseFloat(e.target.value) || 0
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData(prev => ({
                ...prev,
                status: e.target.value as 'pending' | 'approved' | 'rejected'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes (Optional)
            </label>
            <textarea
              value={editFormData.notes}
              onChange={(e) => setEditFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Internal notes..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateConfirm}
              isLoading={isUpdating}
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>

        </>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          {withdrawalStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <div className="flex items-center">
                  <Wallet className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                    <p className="text-2xl font-bold text-gray-900">{withdrawalStats.counts.total}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{withdrawalStats.counts.pending}</p>
                    <p className="text-xs text-gray-500">${withdrawalStats.amounts.totalPending.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{withdrawalStats.counts.approved}</p>
                    <p className="text-xs text-gray-500">${withdrawalStats.amounts.totalApproved.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Paid</p>
                    <p className="text-2xl font-bold text-gray-900">{withdrawalStats.counts.paid}</p>
                    <p className="text-xs text-gray-500">${withdrawalStats.amounts.totalPaid.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Withdrawals Table */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <form className="relative" onSubmit={handleWithdrawalSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search by email, name, or affiliate code..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempWithdrawalSearchTerm}
                  onChange={(e) => setTempWithdrawalSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <button type="submit" className="hidden">Search</button>
              </form>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Filter className="mr-2 text-gray-500" size={18} />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={withdrawalFilterStatus}
                    onChange={(e) => handleWithdrawalFilterChange(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                
                {(withdrawalSearchTerm || withdrawalFilterStatus) && (
                  <Button variant="secondary" size="sm" onClick={resetWithdrawalFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
            
            {withdrawalsLoading ? (
              <LoadingSpinner size="md" text="Loading withdrawals..." />
            ) : (
              <>
                <Table
                  columns={[
                    {
                      header: 'Affiliate',
                      accessor: (withdrawal: AffiliateWithdrawal) => (
                        <div>
                          <div className="font-semibold">
                            {withdrawal.affiliateId.name.first} {withdrawal.affiliateId.name.last}
                          </div>
                          <div className="text-xs text-gray-500">{withdrawal.affiliateId.email}</div>
                          <div className="text-xs text-gray-400 font-mono">
                            {withdrawal.affiliateId.affiliateCode}
                          </div>
                        </div>
                      )
                    },
                    {
                      header: 'Amount',
                      accessor: (withdrawal: AffiliateWithdrawal) => (
                        <span className="font-semibold text-lg">${withdrawal.amount.toFixed(2)}</span>
                      )
                    },
                    {
                      header: 'Payment Method',
                      accessor: (withdrawal: AffiliateWithdrawal) => (
                        <span className="font-medium capitalize">{withdrawal.paymentMethod}</span>
                      )
                    },
                    {
                      header: 'Status',
                      accessor: (withdrawal: AffiliateWithdrawal) => {
                        const statusColors = {
                          pending: 'bg-yellow-100 text-yellow-800',
                          approved: 'bg-blue-100 text-blue-800',
                          rejected: 'bg-red-100 text-red-800',
                          paid: 'bg-green-100 text-green-800'
                        };
                        
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[withdrawal.status]}`}>
                            {withdrawal.status.toUpperCase()}
                          </span>
                        );
                      }
                    },
                    {
                      header: 'Requested At',
                      accessor: (withdrawal: AffiliateWithdrawal) => formatDate(withdrawal.requestedAt)
                    },
                    {
                      header: 'Actions',
                      accessor: (withdrawal: AffiliateWithdrawal) => (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWithdrawalViewClick(withdrawal);
                            }}
                          >
                            <Eye size={16} className="mr-1" /> View
                          </Button>
                          {withdrawal.status === 'pending' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWithdrawalApproveClick(withdrawal);
                                }}
                              >
                                <CheckCircle size={16} className="mr-1" /> Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWithdrawalRejectClick(withdrawal);
                                }}
                              >
                                <XCircle size={16} className="mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {withdrawal.status === 'approved' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWithdrawalMarkPaidClick(withdrawal);
                              }}
                            >
                              <DollarSign size={16} className="mr-1" /> Mark Paid
                            </Button>
                          )}
                        </div>
                      )
                    }
                  ]}
                  data={withdrawalsData?.withdrawals || []}
                  keyExtractor={(withdrawal) => withdrawal._id}
                  isLoading={withdrawalsLoading}
                  emptyMessage="No withdrawal requests found"
                />
                
                {withdrawalsData?.pagination && withdrawalsData.pagination.pages > 1 && (
                  <Pagination
                    currentPage={withdrawalPage}
                    totalPages={withdrawalsData.pagination.pages}
                    onPageChange={setWithdrawalPage}
                  />
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Affiliate Details"
      >
        {selectedAffiliate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-sm text-gray-900">{formatName(selectedAffiliate.name)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-gray-900">{selectedAffiliate.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Company</p>
                <p className="text-sm text-gray-900">{selectedAffiliate.company || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-sm text-gray-900">{selectedAffiliate.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Website</p>
                <p className="text-sm text-gray-900">
                  {selectedAffiliate.website ? (
                    <a href={selectedAffiliate.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedAffiliate.website}
                    </a>
                  ) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Audience Size</p>
                <p className="text-sm text-gray-900">{selectedAffiliate.audienceSize || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  selectedAffiliate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedAffiliate.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedAffiliate.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Affiliate Code</p>
                <p className="text-sm text-gray-900 font-mono">
                  {selectedAffiliate.affiliateCode || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                <p className="text-sm text-gray-900">
                  {selectedAffiliate.commissionRate !== undefined ? `${selectedAffiliate.commissionRate}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-sm text-gray-900 font-semibold">
                  ${(selectedAffiliate.totalEarnings || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-sm text-gray-900 font-semibold">
                  {selectedAffiliate.totalReferrals || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Applied Date</p>
                <p className="text-sm text-gray-900">{formatDate(selectedAffiliate.createdAt)}</p>
              </div>
              {selectedAffiliate.approvedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Date</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedAffiliate.approvedAt)}</p>
                </div>
              )}
              {selectedAffiliate.rejectedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected Date</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedAffiliate.rejectedAt)}</p>
                </div>
              )}
              {selectedAffiliate.promotionMethods && selectedAffiliate.promotionMethods.length > 0 && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">Promotion Methods</p>
                  <div className="mt-1">
                    {formatPromotionMethods(selectedAffiliate.promotionMethods)}
                  </div>
                </div>
              )}
              {selectedAffiliate.socialMedia && Object.keys(selectedAffiliate.socialMedia).length > 0 && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">Social Media</p>
                  <div className="mt-1">
                    {formatSocialMedia(selectedAffiliate.socialMedia)}
                  </div>
                </div>
              )}
              {selectedAffiliate.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">Rejection Reason</p>
                  <p className="text-sm text-gray-900">{selectedAffiliate.rejectionReason}</p>
                </div>
              )}
              {selectedAffiliate.notes && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">Admin Notes</p>
                  <p className="text-sm text-gray-900">{selectedAffiliate.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Withdrawal View Modal */}
      <Modal
        isOpen={isWithdrawalViewModalOpen}
        onClose={() => setIsWithdrawalViewModalOpen(false)}
        title="Withdrawal Details"
      >
        {selectedWithdrawal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Affiliate</p>
                <p className="text-sm text-gray-900">
                  {selectedWithdrawal.affiliateId.name.first} {selectedWithdrawal.affiliateId.name.last}
                </p>
                <p className="text-xs text-gray-500">{selectedWithdrawal.affiliateId.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Affiliate Code</p>
                <p className="text-sm text-gray-900 font-mono">{selectedWithdrawal.affiliateId.affiliateCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-sm text-gray-900 font-semibold">${selectedWithdrawal.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Method</p>
                <p className="text-sm text-gray-900 capitalize">{selectedWithdrawal.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  selectedWithdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedWithdrawal.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                  selectedWithdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedWithdrawal.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Requested At</p>
                <p className="text-sm text-gray-900">{formatDate(selectedWithdrawal.requestedAt)}</p>
              </div>
              {selectedWithdrawal.approvedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved At</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedWithdrawal.approvedAt)}</p>
                </div>
              )}
              {selectedWithdrawal.rejectedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected At</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedWithdrawal.rejectedAt)}</p>
                </div>
              )}
              {selectedWithdrawal.paidAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid At</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedWithdrawal.paidAt)}</p>
                </div>
              )}
              {selectedWithdrawal.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">Rejection Reason</p>
                  <p className="text-sm text-gray-900">{selectedWithdrawal.rejectionReason}</p>
                </div>
              )}
              {selectedWithdrawal.adminNotes && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">Admin Notes</p>
                  <p className="text-sm text-gray-900">{selectedWithdrawal.adminNotes}</p>
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-600 mb-2">Payment Details</p>
              <div className="space-y-1">
                {Object.entries(selectedWithdrawal.paymentDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsWithdrawalViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Withdrawal Approve Modal */}
      <Modal
        isOpen={isWithdrawalApproveModalOpen}
        onClose={() => setIsWithdrawalApproveModalOpen(false)}
        title="Approve Withdrawal Request"
      >
        <div className="space-y-4">
          {selectedWithdrawal && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Approving withdrawal for: <strong>{selectedWithdrawal.affiliateId.name.first} {selectedWithdrawal.affiliateId.name.last}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Amount: <strong>${selectedWithdrawal.amount.toFixed(2)}</strong>
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes (Optional)
            </label>
            <textarea
              value={withdrawalApproveForm.adminNotes}
              onChange={(e) => setWithdrawalApproveForm({ adminNotes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any notes about this approval..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsWithdrawalApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleWithdrawalApproveConfirm}
              isLoading={isApprovingWithdrawal}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Withdrawal Reject Modal */}
      <Modal
        isOpen={isWithdrawalRejectModalOpen}
        onClose={() => setIsWithdrawalRejectModalOpen(false)}
        title="Reject Withdrawal Request"
      >
        <div className="space-y-4">
          {selectedWithdrawal && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Rejecting withdrawal for: <strong>{selectedWithdrawal.affiliateId.name.first} {selectedWithdrawal.affiliateId.name.last}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Amount: <strong>${selectedWithdrawal.amount.toFixed(2)}</strong>
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={withdrawalRejectForm.rejectionReason}
              onChange={(e) => setWithdrawalRejectForm(prev => ({ ...prev, rejectionReason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Reason for rejection (will be sent to affiliate)..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes (Optional)
            </label>
            <textarea
              value={withdrawalRejectForm.adminNotes}
              onChange={(e) => setWithdrawalRejectForm(prev => ({ ...prev, adminNotes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Internal notes..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsWithdrawalRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleWithdrawalRejectConfirm}
              isLoading={isRejectingWithdrawal}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Withdrawal Mark Paid Modal */}
      <Modal
        isOpen={isWithdrawalMarkPaidModalOpen}
        onClose={() => setIsWithdrawalMarkPaidModalOpen(false)}
        title="Mark Withdrawal as Paid"
      >
        <div className="space-y-4">
          {selectedWithdrawal && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Marking withdrawal as paid for: <strong>{selectedWithdrawal.affiliateId.name.first} {selectedWithdrawal.affiliateId.name.last}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Amount: <strong>${selectedWithdrawal.amount.toFixed(2)}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This will update the affiliate's total paid amount and decrease their available balance.
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes (Optional)
            </label>
            <textarea
              value={withdrawalMarkPaidForm.adminNotes}
              onChange={(e) => setWithdrawalMarkPaidForm({ adminNotes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Payment details, transaction ID, etc..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsWithdrawalMarkPaidModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleWithdrawalMarkPaidConfirm}
              isLoading={isMarkingPaid}
            >
              Mark as Paid
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AffiliateManagement;

