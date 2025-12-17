import { EditIcon, Search } from 'lucide-react';
import React, { useState } from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import Pagination from '../components/UI/Pagination';
import Table from '../components/UI/Table';
import Toast from '../components/UI/Toast';
import { useGetUsersBonusQuery, useUpdateUserBonusMutation } from '../services/api/usersApi';
import { IUserBonus, User } from '../types';
import { usePermissions } from '../hooks/usePermissions';

const UserBalance: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const [updateUserBonus, { isLoading:updateLoading}] = useUpdateUserBonusMutation();
  const {isLoading,error,data:users} = useGetUsersBonusQuery({
    page:currentPage,
    limit:10,
    search:searchTerm,
    field:sortField,direction:sortDirection
  });


  const [selectedUser, setSelectedUser] = useState<IUserBonus | null>(null);
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
 
  // Handle edit balance
  const handleEditBalance = (user: IUserBonus) => {
    setSelectedUser(user);
    setIsEditBalanceModalOpen(true);
  };

  
   // Handle balance update
   const handleBalanceUpdate = async () => {
    if (selectedUser) {
      try {
        await updateUserBonus(selectedUser).unwrap();
        setToastMessage("Balance updated successfully!");
        setToastType("success");
        setIsEditBalanceModalOpen(false);
      } catch (error: any) {
        const errorMessage = error?.data?.message || "Failed to update balance. Please try again.";
        setToastMessage(errorMessage);
        setToastType("error");
      }
    }
  };
  
  // Table columns
  const columns = [
    { header: 'User ID', accessor: (user: IUserBonus) => `${user.userId.name.first}-${user.userId._id.slice(20,24)}` },
    { header: 'Email', accessor: (user: IUserBonus) => user.userId.email },
    { 
      header: 'Gold Coins', 
      accessor: (user: IUserBonus) => (
        <span className="font-medium">
          {user.goldCoins.toFixed(2)}
        </span>
      )
    },
    { 
      header: 'Sweep Coins', 
      accessor: (user: IUserBonus) => (
        <span className="font-medium">
          {user.sweepCoins.toFixed(2)}
        </span>
      )
    },
    { 
      header: 'Wallet Balance (GC)', 
      accessor: (user: IUserBonus) => (
        <span className="font-medium">
          {user.walletBalance}
        </span>
      )
    },
    { header: 'Last Login Date', accessor: (user: IUserBonus) => user.lastLoginDate?new Date(user.lastLoginDate).toLocaleDateString():"N/A" },
    { header: 'Login Streak', accessor: (user: IUserBonus) => user.loginStreak },
    {
      header: 'Actions',
      accessor: (user: IUserBonus) => (
          hasPermission('canEditUsers') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleEditBalance(user)}
          >
            <EditIcon size={14} style={{marginRight:"4px"}}/> Edit Balance
          </Button>
          )
      )
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUser((prev) => {
      if (!prev) return prev; // Ensure `prev` is not null
  
      return {
        ...prev,
        [e.target.name]: e.target.value ?? "", // Add field if it doesn't exist
      };
    });
  };
  

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">User Balance Management</h1>
      
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by mail..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Sort by:</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortField(field as keyof User);
                  setSortDirection(direction as 'asc' | 'desc');
                }}
              >
                <option value="">Filters</option>
                <option value="goldCoins-asc">Gold Coins (Low to High)</option>
                <option value="goldCoins-desc">Gold Coins (High to Low)</option>
                <option value="sweepCoins-asc">Sweep Coins (Low to High)</option>
                <option value="sweepCoins-desc">Sweep Coins (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
        
        {users &&  <Table
          columns={columns}
          data={users?.users?users.users:[]}
          keyExtractor={(user) => user._id}
          emptyMessage="No users found matching your criteria"
        />}
        
        {users?.pagination && users?.pagination?.totalPages > 1 &&  (
          <Pagination 
            currentPage={currentPage}
            totalPages={users?.pagination?.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
      
      {/* Edit Balance Modal */}
      <Modal
        isOpen={isEditBalanceModalOpen}
        onClose={() => setIsEditBalanceModalOpen(false)}
        title="Edit User Balance"
        size="sm"
      >
        <div className="space-y-4">
        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gold Coins Balance
            </label>
            <input
              type="text"
              name='goldCoins'
              onChange={handleInputChange}
              value={`${selectedUser?.goldCoins}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sweep Coins Balance
            </label>
            <input
              type="text"
              name='sweepCoins'
              value={`${selectedUser?.sweepCoins}`}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Balance (GC)
            </label>
            <input
              type="text"
              name='walletBalance'
              value={`${selectedUser?.walletBalance}`}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsEditBalanceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBalanceUpdate}
              disabled={updateLoading}
            >
           {updateLoading ? "Updating..." : "Update Balance"}
            </Button>
          </div>
        </div>
      </Modal>
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default UserBalance;