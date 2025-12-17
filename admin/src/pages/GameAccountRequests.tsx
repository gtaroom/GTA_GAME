import React, { useState } from 'react';
import Card from '../components/UI/Card';
import Table from '../components/UI/Table';
import Pagination from '../components/UI/Pagination';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import Modal from '../components/UI/Modal';
import { CheckCircle, Filter, Search, XCircle } from 'lucide-react';
import { 
  useGetAllAccountRequestsQuery, 
  useApproveAccountRequestMutation, 
  useRejectAccountRequestMutation,
  GameAccountRequest
} from '../services/api/gameAccountApi';

const GameAccountRequests: React.FC = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [selectedRequest, setSelectedRequest] = useState<GameAccountRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  
  // Query params for RTK Query
  const queryParams = {
    page: currentPage,
    limit,
    status: filterStatus,
    search: searchQuery
  };
  
  // Fetch data using RTK Query
  const { 
    data: accountRequestsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllAccountRequestsQuery(queryParams, {
    refetchOnMountOrArgChange: true
  });
  
  // Mutation hooks
  const [approveAccountRequest, { isLoading: isApproving }] = useApproveAccountRequestMutation();
  const [rejectAccountRequest, { isLoading: isRejecting }] = useRejectAccountRequestMutation();

  // Generate username and password from email
  const generateCredentials = (email: string) => {
    const emailPrefix = email.split('@')[0];
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const username = `${emailPrefix}_${randomSuffix}`;
    const password = `pass_${randomSuffix}`;
    
    setGeneratedUsername(username);
    setGeneratedPassword(password);
  };

  // Action handlers
  const handleApproveClick = (request: GameAccountRequest) => {
    setSelectedRequest(request);
    generateCredentials(request.userEmail);
    setAdminNotes('');
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (request: GameAccountRequest) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setIsRejectModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (selectedRequest && generatedUsername && generatedPassword) {
      try {
        await approveAccountRequest({ 
          requestId: selectedRequest._id, 
          payload: {
            generatedUsername,
            generatedPassword,
            adminNotes: adminNotes.trim() || undefined
          }
        }).unwrap();
        setIsApproveModalOpen(false);
        setToastMessage("Account request approved successfully!");
        setToastType("success");
        refetch();
      } catch {
        setToastMessage("Failed to approve account request. Please try again.");
        setToastType("error");
      }
    }
  };

  const handleRejectConfirm = async () => {
    if (selectedRequest && adminNotes.trim()) {
      try {
        await rejectAccountRequest({ 
          requestId: selectedRequest._id, 
          payload: { adminNotes: adminNotes.trim() }
        }).unwrap();
        setIsRejectModalOpen(false);
        setAdminNotes('');
        setToastMessage("Account request rejected successfully!");
        setToastType("success");
        refetch();
      } catch {
        setToastMessage("Failed to reject account request. Please try again.");
        setToastType("error");
      }
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Reset filters
  const resetFilters = () => {
    setTempSearchQuery('');
    setSearchQuery('');
    setFilterStatus('pending');
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSearchQuery(e.target.value);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(tempSearchQuery);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Table columns configuration
  const columns = [
    { 
      header: 'User', 
      accessor: (request: GameAccountRequest) => (
        <div>
          <div className="font-semibold">
            {request.userId?.name.first} {request.userId?.name.middle} {request.userId?.name.last}
          </div>
          <div className="text-xs text-gray-500">{request.userId?.email}</div>
        </div>
      ) 
    },
    { 
      header: 'Game', 
      accessor: (request: GameAccountRequest) => (
        <span className="font-medium">{request.gameName}</span>
      ) 
    },
    { 
      header: 'Status', 
      accessor: (request: GameAccountRequest) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      ) 
    },
    { 
      header: 'Requested On', 
      accessor: (request: GameAccountRequest) => formatDate(request.createdAt)
    },
    { 
      header: 'Actions', 
      accessor: (request: GameAccountRequest) => (
        <div className="flex gap-2">
          {request.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => handleApproveClick(request)}
                disabled={isApproving}
                className="flex items-center gap-1"
              >
                <CheckCircle size={14} />
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleRejectClick(request)}
                disabled={isRejecting}
                className="flex items-center gap-1"
              >
                <XCircle size={14} />
                Reject
              </Button>
            </>
          )}
          {request.status === 'approved' && (
            <div className="text-sm text-gray-600">
              <div>Username: {request.generatedUsername}</div>
              <div>Password: {request.generatedPassword}</div>
              {request.adminNotes && (
                <div className="mt-1 text-xs">Notes: {request.adminNotes}</div>
              )}
            </div>
          )}
          {request.status === 'rejected' && request.adminNotes && (
            <div className="text-sm text-gray-600">
              <div>Reason: {request.adminNotes}</div>
            </div>
          )}
        </div>
      ) 
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading account requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading account requests</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Game Account Requests</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by game name or email..."
                value={tempSearchQuery}
                onChange={handleSearchInputChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
          
          <Button onClick={resetFilters} variant="secondary" size="sm">
            Reset
          </Button>
        </div>
      </div>

      <Card>
        <Table
          data={accountRequestsData?.accountRequests || []}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
        />
        
        {accountRequestsData?.pagination && (
          <div className="mt-6">
                      <Pagination
            currentPage={currentPage}
            totalPages={accountRequestsData.pagination.totalPages}
            onPageChange={setCurrentPage}
          />
          </div>
        )}
      </Card>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Account Request"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">User Information</h3>
            <p className="text-sm text-gray-600">
              {selectedRequest?.userId.name.first} {selectedRequest?.userId.name.middle} {selectedRequest?.userId.name.last}
            </p>
            <p className="text-sm text-gray-600">{selectedRequest?.userEmail}</p>
            <p className="text-sm text-gray-600">Game: {selectedRequest?.gameName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Generated Username</label>
            <input
              type="text"
              value={generatedUsername}
              onChange={(e) => setGeneratedUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Generated Password</label>
            <input
              type="text"
              value={generatedPassword}
              onChange={(e) => setGeneratedPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Admin Notes (Optional)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any notes..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleApproveConfirm}
              disabled={isApproving || !generatedUsername || !generatedPassword}
              className="flex-1"
            >
              {isApproving ? 'Approving...' : 'Approve Request'}
            </Button>
            <Button
              onClick={() => setIsApproveModalOpen(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Account Request"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">User Information</h3>
            <p className="text-sm text-gray-600">
              {selectedRequest?.userId.name.first} {selectedRequest?.userId.name.middle} {selectedRequest?.userId.name.last}
            </p>
            <p className="text-sm text-gray-600">{selectedRequest?.userEmail}</p>
            <p className="text-sm text-gray-600">Game: {selectedRequest?.gameName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Reason for Rejection *</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Please provide a reason for rejection..."
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleRejectConfirm}
              disabled={isRejecting || !adminNotes.trim()}
              variant="danger"
              className="flex-1"
            >
              {isRejecting ? 'Rejecting...' : 'Reject Request'}
            </Button>
            <Button
              onClick={() => setIsRejectModalOpen(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default GameAccountRequests; 