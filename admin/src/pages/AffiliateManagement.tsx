import React, { useState } from 'react';
import { CheckCircle, Edit, Filter, Search, Shield, XCircle, Users, BarChart3, DollarSign, UserCheck } from 'lucide-react';
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
  useGetAffiliateByIdQuery,
  useApproveAffiliateMutation,
  useRejectAffiliateMutation,
  useUpdateAffiliateMutation,
  useGetAffiliateStatisticsQuery,
  Affiliate
} from '../services/api/affiliatesApi';

const AffiliateManagement: React.FC = () => {
  const { hasPermission, user } = usePermissions();
  const { showToast } = useToast();
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  
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
    status: filterStatus || undefined,
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

  if (isLoading) {
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
          <p className="text-gray-600">Manage affiliate applications and settings</p>
        </div>
      </div>

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
    </div>
  );
};

export default AffiliateManagement;

