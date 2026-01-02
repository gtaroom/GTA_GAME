import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Star,
  CreditCard,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Gift,
  Award,
  Coins,
  Wallet,
  Activity,
  BarChart3
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Table from '../components/UI/Table';
import { useGetUserFullDetailsQuery } from '../services/api/userManagementApi';

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: userDetails,
    isLoading,
    error,
    refetch
  } = useGetUserFullDetailsQuery(id || '', {
    skip: !id
  });

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateOnly = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatName = (name: { first: string; middle?: string; last?: string }): string => {
    const parts = [name.first, name.middle, name.last].filter(Boolean);
    return parts.join(' ');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading user details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <XCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading User</h3>
            <p className="mt-1 text-sm text-gray-500">
              Failed to load user details. Please try again.
            </p>
            <div className="mt-4">
              <Button onClick={() => navigate('/users')} variant="primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">User Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The user you're looking for doesn't exist.
            </p>
            <div className="mt-4">
              <Button onClick={() => navigate('/users')} variant="primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { user, wallet, bonus, transactions, vipTier, spinWheel } = userDetails;

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/users')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600 mt-1">Comprehensive user information and activity</p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          className="flex items-center"
        >
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex-shrink-0">
            {user.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={formatName(user.name)}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg">
                <Users className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {formatName(user.name)}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {user.phone}
                </div>
              )}
              {user.referralCode && (
                <div className="flex items-center">
                  <Gift className="h-4 w-4 mr-2" />
                  <span className="font-mono font-semibold">{user.referralCode}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {user.isEmailVerified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Email Verified
                </span>
              )}
              {user.isPhoneVerified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Phone Verified
                </span>
              )}
              {user.isKYC && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  KYC Verified
                </span>
              )}
              {user.isOpted && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Email Opted
                </span>
              )}
              {user.isSmsOpted && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  SMS Opted
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Wallet Balance</p>
              <p className="text-3xl font-bold">
                {wallet.balance.toLocaleString()} {wallet.currency}
              </p>
            </div>
            <Wallet className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">Gold Coins</p>
              <p className="text-3xl font-bold">{bonus.goldCoins.toLocaleString()}</p>
              <p className="text-amber-100 text-sm mt-1">GC Available</p>
            </div>
            <Coins className="h-12 w-12 text-amber-200 opacity-80" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Sweep Coins</p>
              <p className="text-3xl font-bold">{bonus.sweepCoins.toFixed(2)}</p>
              <p className="text-green-100 text-sm mt-1">SC Available</p>
            </div>
            <Award className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Activity & Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Statistics */}
        <Card>
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Activity Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Login Streak</p>
              <p className="text-2xl font-bold text-gray-900">{bonus.loginStreak} days</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Spins Used</p>
              <p className="text-2xl font-bold text-gray-900">{spinWheel.totalSpinsUsed}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">GC Won from Spins</p>
              <p className="text-2xl font-bold text-gray-900">
                {spinWheel.totalGCWon.toLocaleString()} GC
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">SC Won from Spins</p>
              <p className="text-2xl font-bold text-gray-900">
                {spinWheel.totalSCWon.toFixed(2)} SC
              </p>
            </div>
            {bonus.lastLoginDate && (
              <div className="p-4 bg-indigo-50 rounded-lg col-span-2">
                <p className="text-sm text-gray-600 mb-1">Last Login</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(bonus.lastLoginDate)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* VIP Tier Status */}
        <Card>
          <div className="flex items-center mb-4">
            <Star className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">VIP Tier Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
              <div>
                <p className="text-sm text-gray-600">Current Tier</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {vipTier.currentTier === 'none' ? 'Standard' : vipTier.currentTier}
                </p>
              </div>
              {vipTier.currentTier !== 'none' && (
                <Star className="h-8 w-8 text-yellow-500" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">VIP Confirmed</p>
                <p className="text-lg font-semibold text-gray-900">
                  {vipTier.isVipConfirmed ? '✓ Yes' : '✗ No'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Bonus Spins</p>
                <p className="text-lg font-semibold text-gray-900">
                  {vipTier.bonusSpinsRemaining}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Last 7 Days</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${vipTier.last7DaysSpending.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Lifetime</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${vipTier.totalLifetimeSpending.toFixed(2)}
                </p>
              </div>
            </div>
            {vipTier.vipPeriodStartDate && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">VIP Period</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDateOnly(vipTier.vipPeriodStartDate)} - {' '}
                  {vipTier.vipPeriodEndDate 
                    ? formatDateOnly(vipTier.vipPeriodEndDate)
                    : 'Ongoing'}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          {transactions && transactions.length > 0 && (
            <span className="text-sm text-gray-500">
              Showing {Math.min(transactions.length, 10)} of {transactions.length}
            </span>
          )}
        </div>
        {transactions && transactions.length > 0 ? (
          <Table
            columns={[
              {
                header: 'Date',
                accessor: (txn: typeof transactions[0]) => (
                  <span className="text-sm">{formatDate(txn.createdAt)}</span>
                )
              },
              {
                header: 'Type',
                accessor: (txn: typeof transactions[0]) => (
                  <span className="capitalize font-medium">{txn.type}</span>
                )
              },
              {
                header: 'Amount',
                accessor: (txn: typeof transactions[0]) => (
                  <span className="font-semibold text-gray-900">
                    {txn.amount.toLocaleString()} {txn.currency}
                  </span>
                )
              },
              {
                header: 'Status',
                accessor: (txn: typeof transactions[0]) => {
                  const statusColors = {
                    completed: 'bg-green-100 text-green-800',
                    pending: 'bg-yellow-100 text-yellow-800',
                    failed: 'bg-red-100 text-red-800',
                    cancelled: 'bg-gray-100 text-gray-800'
                  };
                  return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[txn.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {txn.status.toUpperCase()}
                    </span>
                  );
                }
              },
              {
                header: 'Gateway',
                accessor: (txn: typeof transactions[0]) => (
                  <span className="capitalize text-sm">{txn.paymentGateway || 'N/A'}</span>
                )
              },
              {
                header: 'Transaction ID',
                accessor: (txn: typeof transactions[0]) => (
                  <span className="font-mono text-xs text-gray-600">
                    {txn.gatewayTransactionId || 'N/A'}
                  </span>
                )
              }
            ]}
            data={transactions.slice(0, 10)}
            keyExtractor={(txn) => txn._id}
            emptyMessage="No transactions found"
          />
        ) : (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No transactions found</p>
          </div>
        )}
      </Card>

      {/* Additional Information */}
      <Card>
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Account Created
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(user.createdAt)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Last Updated
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(user.updatedAt)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Login Type
            </p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {user.loginType?.replace('_', ' ') || 'N/A'}
            </p>
          </div>
          {user.address && (user.address.line1 || user.address.line2) && (
            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
              <p className="text-sm text-gray-600 mb-1 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Address
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {user.address.line1}
                {user.address.line2 && `, ${user.address.line2}`}
                {user.state && `, ${user.state}`}
              </p>
            </div>
          )}
          {user.dob && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDateOnly(user.dob)}
              </p>
            </div>
          )}
          {user.gender && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Gender</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {user.gender}
              </p>
            </div>
          )}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Email Opted</p>
            <p className="text-lg font-semibold text-gray-900">
              {user.isOpted ? '✓ Yes' : '✗ No'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">SMS Opted</p>
            <p className="text-lg font-semibold text-gray-900">
              {user.isSmsOpted ? '✓ Yes' : '✗ No'}
            </p>
          </div>
        </div>
      </Card>

   
    </div>
  );
};

export default UserDetails;

