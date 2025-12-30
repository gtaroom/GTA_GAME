import React, { useMemo, useState } from 'react';
import Card from '../components/UI/Card';
import Table from '../components/UI/Table';
import Pagination from '../components/UI/Pagination';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import { useGetTransactionsQuery } from '../services/api/transactionsApi';
import { usePermissions } from '../hooks/usePermissions';
import AccessDenied from '../components/UI/AccessDenied';

const Transactions: React.FC = () => {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('canViewAllTransactions');

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState('');

  const { data, isLoading, refetch } = useGetTransactionsQuery({ page: currentPage, limit, type }, { skip: !canView });

  const columns = useMemo(() => ([
    { header: 'Txn ID', accessor: (row: any) => row._id.slice(-8) },
    { header: 'User', accessor: (row: any) =>
      (  <div>
        <div className="font-semibold">
          {row.userId?.name.first} {row.userId?.name.middle} {row.userId?.name.last}
        </div>
        <div className="text-xs text-gray-500">{row.userId?.email}</div>
      </div>)},
    { header: 'Wallet', accessor: (row: any) => row.walletId?.balance || 0 },
    { header: 'Type', accessor: (row: any) => row.type },
    { header: 'Amount', accessor: (row: any) => `${row.amount} ${row.currency}` },
    { header: 'Status', accessor: (row: any) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        row.status === 'failed' ? 'bg-red-100 text-red-700' :
        'bg-green-100 text-green-700'
      }`}>{row.status}</span>
    )},
    { header: 'Gateway', accessor: (row: any) => row.paymentGateway || '-' },
    { header: 'Created', accessor: (row: any) => new Date(row.createdAt).toLocaleString() },
  ]), []);

  if (!canView) {
    return <AccessDenied feature="transactions" requiredRole="canViewAllTransactions" />;
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading transactions..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-2">View and filter wallet transactions</p>
        </div>
        <div className="flex gap-3">
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setCurrentPage(1); refetch(); }}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="coupon">Coupon</option>
          </select>
          <Button variant="secondary" onClick={() => refetch()}>Refresh</Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns as any}
          data={data?.transactions || []}
          keyExtractor={(item: any) => item._id}
          emptyMessage="No transactions found"
        />
        {data && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil((data.total || 0) / (data.limit || limit)))}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transactions;

