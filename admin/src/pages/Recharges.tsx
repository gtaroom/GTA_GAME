import React, { useState, useEffect } from 'react';
import Card from '../components/UI/Card';
import Table from '../components/UI/Table';
import Pagination from '../components/UI/Pagination';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import Modal from '../components/UI/Modal';
import { AlertCircle, CheckCircle, Filter, Search, XCircle } from 'lucide-react';
import { 
  useGetAllRechargeRequestsQuery, 
  useApproveRechargeRequestMutation, 
  useRejectRechargeRequestMutation, 
  RechargeRequest
} from '../services/api/rechargeApi';

const Recharges: React.FC = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [selectedRecharge, setSelectedRecharge] = useState<RechargeRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  
  // Search and filter states
  const [search, setSearch] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  
  // Query params for RTK Query
  const queryParams = {
    page: currentPage,
    limit,
    status: filterStatus,
    search: search
  };
  
  // Fetch data using RTK Query
  const { 
    data: rechargesData, 
    isLoading, 
    error, 
    refetch,
    isFetching
  } = useGetAllRechargeRequestsQuery(queryParams, {
    // Skip caching to ensure fresh data
    refetchOnMountOrArgChange: true
  });
  
  // Show error toast if fetch fails
  useEffect(() => {
    if (error) {
      let errorMessage = 'Failed to fetch recharge requests';
      
      if (typeof error === 'object' && error !== null) {
        // Try to extract message from different possible error structures
        errorMessage = 
          // @ts-ignore - Handle different possible error shapes
          error.data?.message || 
          // @ts-ignore
          error.error || 
          // @ts-ignore
          error.message || 
          errorMessage;
      }
      
      setToastMessage(errorMessage);
      setToastType("error");
    }
  }, [error]);
  
  // Mutation hooks
  const [approveRecharge, { isLoading: isApproving, error: approveError }] = useApproveRechargeRequestMutation();
  const [rejectRecharge, { isLoading: isRejecting, error: rejectError }] = useRejectRechargeRequestMutation();

  // Handle mutation errors
  useEffect(() => {
    if (approveError) {
      let errorMessage = 'Failed to approve recharge request';
      
      if (typeof approveError === 'object' && approveError !== null) {
        // @ts-ignore - Handle different possible error shapes
        errorMessage = 
          // @ts-ignore
          approveError.data?.message || 
          // @ts-ignore
          approveError.error || 
          // @ts-ignore
          approveError.message || 
          errorMessage;
      }
      
      setToastMessage(errorMessage);
      setToastType("error");
    }
  }, [approveError]);

  useEffect(() => {
    if (rejectError) {
      let errorMessage = 'Failed to reject recharge request';
      
      if (typeof rejectError === 'object' && rejectError !== null) {
        // @ts-ignore - Handle different possible error shapes
        errorMessage = 
          // @ts-ignore
          rejectError.data?.message || 
          // @ts-ignore
          rejectError.error || 
          // @ts-ignore
          rejectError.message || 
          errorMessage;
      }
      
      setToastMessage(errorMessage);
      setToastType("error");
    }
  }, [rejectError]);

  // Action handlers
  const handleApproveClick = (recharge: RechargeRequest) => {
    setSelectedRecharge(recharge);
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (recharge: RechargeRequest) => {
    setSelectedRecharge(recharge);
    setIsRejectModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (selectedRecharge) {
      try {
        await approveRecharge(selectedRecharge._id).unwrap();
        setIsApproveModalOpen(false);
        setToastMessage("Recharge request approved successfully!");
        setToastType("success");
        refetch(); // Refetch after action
      } catch (err) {
        // Error is handled by the useEffect hook monitoring approveError
      }
    }
  };

  const handleRejectConfirm = async () => {
    if (selectedRecharge) {
      try {
        await rejectRecharge({ id: selectedRecharge._id, adminComment }).unwrap();
        setIsRejectModalOpen(false);
        setAdminComment(''); // Reset comment after rejection
        setToastMessage("Recharge request rejected successfully!");
        setToastType("success");
        refetch(); // Refetch after action
      } catch (err) {
        // Error is handled by the useEffect hook monitoring rejectError
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
    setTempSearch('');
    setSearch('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSearch(e.target.value);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(tempSearch);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Table columns configuration
  const columns = [
    { 
      header: 'User', 
      accessor: (recharge: RechargeRequest) => (
        <div>
          <div className="font-semibold">
            {recharge.userId?.name.first} {recharge.userId?.name.middle} {recharge.userId?.name.last}
          </div>
          <div className="text-xs text-gray-500">{recharge.userId?.email}</div>
        </div>
      ) 
    },
    { 
      header: 'Game Name', 
      accessor: (recharge: RechargeRequest) => (
        <span className="font-medium">{recharge.gameName}</span>
      ) 
    },
    { 
      header: 'Game Id', 
      accessor: (recharge: RechargeRequest) => (
        <span className="font-medium">{recharge.username}</span>
      ) 
    },
    { 
      header: 'Amount', 
      accessor: (recharge: RechargeRequest) => (
        <div>
        <div className="font-semibold">
        {recharge.amount.toFixed(2)} GC
        </div>
        <div className="text-xs text-gray-500">Worth :{(recharge.amount/100).toFixed(2)} USD</div>
      </div>
      ) 
    },
    { 
      header: 'Date', 
      accessor: (recharge: RechargeRequest) => formatDate(recharge.createdAt)
    },
    { 
      header: 'Status', 
      accessor: (recharge: RechargeRequest) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          failed: 'bg-gray-100 text-gray-800'
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[recharge.status]}`}>
            {recharge.status.toUpperCase()}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (recharge: RechargeRequest) => {
        const isPending = recharge.status === 'pending';
        
        // Only show action buttons for pending recharges
        return isPending ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleApproveClick(recharge);
              }}
              disabled={isApproving}
            >
              <CheckCircle size={16} className="mr-1" /> Approve
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRejectClick(recharge);
              }}
              disabled={isRejecting}
            >
              <XCircle size={16} className="mr-1" /> Reject
            </Button>
          </div>
        ) : null;
      }
    }
  ];

  // Render loading state for the entire page if initially loading
  if (isLoading && !isFetching) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading recharge requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Recharge Requests</h1>
      
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0 gap-4">
          <form 
            className="relative" 
            onSubmit={handleSearchSubmit}
          >
            <input
              type="text"
              placeholder="Search game name..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={tempSearch}
              onChange={handleSearchInputChange}
              disabled={isLoading || isFetching}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <button type="submit" className="hidden">Search</button>
          </form>
          
          <div className="flex items-center">
            <Filter className="mr-2 text-gray-500" size={18} />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              disabled={isLoading || isFetching}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          {(search || filterStatus) && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={resetFilters}
              disabled={isLoading || isFetching}
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        {/* Show a refresh button if there was an error */}
        {error && (
          <div className="mb-4 flex justify-center">
            <Button
              variant="primary"
              onClick={() => refetch()}
              className="flex items-center"
            >
              <AlertCircle size={16} className="mr-2" />
              There was an error loading data. Click to retry.
            </Button>
          </div>
        )}
        
        {/* Show a loading overlay when refreshing data */}
        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          <Table
            columns={columns}
            data={rechargesData?.rechargeRequests || []}
            keyExtractor={(recharge) => recharge._id}
            isLoading={isLoading || isFetching}
            emptyMessage={error ? "Error loading data" : "No recharge requests found"}
          />
        </div>
        
        {rechargesData && rechargesData.totalPages > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={rechargesData.totalPages}
              onPageChange={setCurrentPage}
              disabled={isLoading || isFetching}
            />
          </div>
        )}
      </Card>
      
      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => !isApproving && setIsApproveModalOpen(false)}
        title="Approve Recharge Request"
      >
        <div className="p-6">
          {isApproving ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p>Processing request...</p>
            </div>
          ) : (
            <>
              <p className="mb-4">
                Are you sure you want to approve this recharge request for <strong>${selectedRecharge?.amount ? (Number(selectedRecharge.amount.toFixed(2))/100) : 0}</strong>?
              </p>
              <div className="flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => setIsApproveModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleApproveConfirm}>
                  Approve
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
      
      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => !isRejecting && setIsRejectModalOpen(false)}
        title="Reject Recharge Request"
      >
        <div className="p-6">
          {isRejecting ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p>Processing request...</p>
            </div>
          ) : (
            <>
              <p className="mb-4">
                Are you sure you want to reject this recharge request for <strong>${selectedRecharge?.amount.toFixed(2)}</strong>?
              </p>
              <textarea 
                className='w-full h-32 border mb-4 p-2' 
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder='Please add reason..' 
              />
              <div className="flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleRejectConfirm}>
                  Reject
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
      
      {/* Toast for notifications */}
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

export default Recharges; 