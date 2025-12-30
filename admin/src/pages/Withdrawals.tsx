import React, { useState, useEffect } from 'react';
import Card from '../components/UI/Card';
import Table from '../components/UI/Table';
import Pagination from '../components/UI/Pagination';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import Modal from '../components/UI/Modal';
import { CheckCircle, Copy, Filter, Search, XCircle } from 'lucide-react';
import { 
  useGetAllWithdrawalsQuery, 
  useApproveWithdrawalMutation, 
  useRejectWithdrawalMutation, 
  useMarkWithdrawalProcessedMutation,
  WithdrawalRequest
} from '../services/api/withdrawalApi';

const Withdrawals: React.FC = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  
  // Search and filter states
  const [searchEmail, setSearchEmail] = useState('');
  const [tempSearchEmail, setTempSearchEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterPaymentGateway, setFilterPaymentGateway] = useState<string>('');
  
  // Query params for RTK Query
  const queryParams = {
    page: currentPage,
    limit,
    status: filterStatus,
    paymentGateway: filterPaymentGateway,
    email: searchEmail
  };
  
  // Fetch data using RTK Query
  const { 
    data: withdrawalsData, 
    isLoading, 
    refetch 
  } = useGetAllWithdrawalsQuery(queryParams, {
    // Skip caching to ensure fresh data
    refetchOnMountOrArgChange: true
  });
  
  // Log query parameters for debugging
  useEffect(() => {
    console.log('Query params:', queryParams);
  }, [queryParams]);
  
  // Mutation hooks
  const [approveWithdrawal, { isLoading: isApproving }] = useApproveWithdrawalMutation();
  const [rejectWithdrawal, { isLoading: isRejecting }] = useRejectWithdrawalMutation();
  const [markWithdrawalProcessed, { isLoading: isProcessing }] = useMarkWithdrawalProcessedMutation();

  // Action handlers
  const handleApproveClick = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setIsRejectModalOpen(true);
  };

  const handleProcessClick = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setIsProcessModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (selectedWithdrawal) {
      try {
        await approveWithdrawal(selectedWithdrawal._id).unwrap();
        setIsApproveModalOpen(false);
        setToastMessage("Withdrawal request approved successfully!");
        setToastType("success");
        refetch(); // Refetch after action
      } catch (err) {
        setToastMessage("Failed to approve withdrawal request. Please try again.");
        setToastType("error");
      }
    }
  };

  const handleRejectConfirm = async () => {
    if (selectedWithdrawal) {
      try {
        await rejectWithdrawal({ id: selectedWithdrawal._id, adminComment }).unwrap();
        setIsRejectModalOpen(false);
        setAdminComment(''); // Reset comment after rejection
        setToastMessage("Withdrawal request rejected successfully!");
        setToastType("success");
        refetch(); // Refetch after action
      } catch (err) {
        setToastMessage("Failed to reject withdrawal request. Please try again.");
        setToastType("error");
      }
    }
  };

  const handleProcessConfirm = async () => {
    if (selectedWithdrawal) {
      try {
        await markWithdrawalProcessed(selectedWithdrawal._id).unwrap();
        setIsProcessModalOpen(false);
        setToastMessage("Withdrawal request marked as processed successfully!");
        setToastType("success");
        refetch(); // Refetch after action
      } catch (err) {
        setToastMessage("Failed to mark withdrawal request as processed. Please try again.");
        setToastType("error");
      }
    }
  };

  // Copy wallet address to clipboard
  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    navigator.clipboard.writeText(text)
      .then(() => {
        setToastMessage("Wallet address copied to clipboard!");
        setToastType("success");
      })
      .catch(() => {
        setToastMessage("Failed to copy wallet address.");
        setToastType("error");
      });
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Reset filters
  const resetFilters = () => {
    setTempSearchEmail('');
    setSearchEmail('');
    setFilterStatus('');
    setFilterPaymentGateway('');
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSearchEmail(e.target.value);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchEmail(tempSearchEmail);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (type: 'status' | 'paymentGateway', value: string) => {
    if (type === 'status') {
      setFilterStatus(value);
    } else {
      setFilterPaymentGateway(value);
    }
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Table columns configuration
  const columns = [
    { 
      header: 'User', 
      accessor: (withdrawal: WithdrawalRequest) => {
        if (!withdrawal.userId) {
          return <div className="text-gray-400">User not found</div>;
        }
        return (
          <div>
            <div className="font-semibold">
              {withdrawal.userId.name?.first || ''} {withdrawal.userId.name?.middle || ''} {withdrawal.userId.name?.last || ''}
            </div>
            <div className="text-xs text-gray-500">{withdrawal.userId.email || 'N/A'}</div>
          </div>
        );
      }
    },
   {
  header: 'Game Name',
  accessor: (recharge: WithdrawalRequest) => (
    <span
      className={`font-medium ${
        recharge.gameName === "featuredGames"
          ? "bg-blue-500 rounded p-1 text-white"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {recharge.gameName}
    </span>
  )
}
,
    { 
      header: 'Game Id', 
      accessor: (recharge: WithdrawalRequest) => (
        <span className="font-medium">{recharge.username}</span>
      ) 
    },
 
    { 
      header: 'Payment Method', 
      accessor: (withdrawal: WithdrawalRequest) => (
        <div>
        <span className="font-semibold">${withdrawal.amount.toFixed(2)}</span>

          <div className="font-medium capitalize">{withdrawal.paymentGateway}</div>
          {withdrawal.paymentGateway === 'plisio' && withdrawal.walletAddress && (
            <div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <span className="truncate max-w-[150px]">{withdrawal.walletAddress}</span>
                <button 
                  onClick={(e) => copyToClipboard(withdrawal.walletAddress || '', e)}
                  className="ml-1 p-1 hover:bg-gray-100 rounded-full"
                  title="Copy wallet address"
                >
                  <Copy size={12} />
                </button>
              </div>
              {withdrawal.walletCurrency && (
                <div className="text-xs text-gray-500">
                  Currency: {withdrawal.walletCurrency}
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Date', 
      accessor: (withdrawal: WithdrawalRequest) => formatDate(withdrawal.createdAt)
    },
    { 
      header: 'Status', 
      accessor: (withdrawal: WithdrawalRequest) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          processed: 'bg-blue-100 text-blue-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[withdrawal.status]}`}>
            {withdrawal.status.toUpperCase()}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (withdrawal: WithdrawalRequest) => {
        const isPending = withdrawal.status === 'pending';
        const failedStatuses = ['failed', 'expired', 'terminated'];
        const isFailed = failedStatuses.includes(withdrawal.status);

        const isApproved = withdrawal.status === 'approved';
        const isPlisio = withdrawal.paymentGateway === 'plisio';
        const isPayouts = withdrawal.paymentGateway === 'payouts';
        
        // Create row of buttons based on status and payment gateway
        return (
          <div className="flex flex-wrap gap-2">
            {/* PENDING STATUS - Show Approve and Reject buttons */}
            {isPending && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveClick(withdrawal);
                  }}
                >
                  <CheckCircle size={16} className="mr-1" /> Approve
                </Button>
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectClick(withdrawal);
                  }}
                >
                  <XCircle size={16} className="mr-1" /> Reject
                </Button>
              </>
            )}

            {isFailed && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveClick(withdrawal);
                  }}
                >
                  <CheckCircle size={16} className="mr-1" /> Re-approve
                </Button>
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRejectClick(withdrawal);
                  }}
                >
                  <XCircle size={16} className="mr-1" /> Reject
                </Button>
              </>
            )}
            
            {/* APPROVED STATUS - Show Mark as Processed for Plisio only */}
            {isApproved && (isPlisio  || isPayouts) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProcessClick(withdrawal);
                }}
              >
                <CheckCircle size={16} className="mr-1" /> Processed
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Withdrawal Requests</h1>
      
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <form 
            className="relative" 
            onSubmit={handleSearchSubmit}
          >
            <input
              type="text"
              placeholder="Search by email..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={tempSearchEmail}
              onChange={handleSearchInputChange}
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
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterPaymentGateway}
                onChange={(e) => handleFilterChange('paymentGateway', e.target.value)}
              >
                <option value="">All Payment Methods</option>
                <option value="plisio">Plisio</option>
                <option value="soap">Soap</option>
                <option value="payouts">Payouts</option>
              </select>
            </div>
            
            {(searchEmail || filterStatus || filterPaymentGateway) && (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        <Table
          columns={columns}
          data={withdrawalsData?.withdrawalRequests || []}
          keyExtractor={(withdrawal) => withdrawal._id}
          isLoading={isLoading}
          emptyMessage="No withdrawal requests found"
        />
        
        {withdrawalsData?.totalPages && withdrawalsData?.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={withdrawalsData.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
      
      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Withdrawal Request"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to approve this withdrawal request for <strong>${selectedWithdrawal?.amount.toFixed(2)}</strong>?
          </p>
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApproveConfirm} isLoading={isApproving}>
              Approve
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Withdrawal Request"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to reject this withdrawal request for <strong>${selectedWithdrawal?.amount.toFixed(2)}</strong>?
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
            <Button variant="danger" onClick={handleRejectConfirm} isLoading={isRejecting}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Process Modal */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title="Mark Withdrawal as Processed"
      >
        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to mark this withdrawal request as processed? This indicates that the payment has been initiated.
          </p>
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsProcessModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleProcessConfirm} isLoading={isProcessing}>
              Mark as Processed
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Toast Notification */}
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

export default Withdrawals; 