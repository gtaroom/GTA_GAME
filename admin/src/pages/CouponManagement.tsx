import { EditIcon, PlusIcon, Search, TrashIcon } from 'lucide-react';
import React, { useState } from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Modal from '../components/UI/Modal';
import Pagination from '../components/UI/Pagination';
import Table from '../components/UI/Table';
import Toast from '../components/UI/Toast';
import { useCreateCouponMutation, useDeleteCouponMutation, useGetCouponsQuery, useUpdateCouponMutation } from '../services/api/couponsApi';
import { ICoupon, ICouponCreatePayload, ICouponUpdatePayload } from '../types';

const CouponManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const { data: coupons, isLoading } = useGetCouponsQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    isActive,
  });

  const [createCoupon, { isLoading: createLoading }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: updateLoading }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: deleteLoading }] = useDeleteCouponMutation();

  const handleCreateCoupon = async (formData: ICouponCreatePayload | ICouponUpdatePayload) => {
    try {
      // Ensure all required fields are present for create
      const createPayload: ICouponCreatePayload = {
        amount: formData.amount || 0,
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        usageLimit: formData.usageLimit || 1,
        description: formData.description,
        code: (formData as ICouponCreatePayload).code,
      };
      
      await createCoupon(createPayload).unwrap();
      setToastMessage("Coupon created successfully!");
      setToastType("success");
      setIsCreateModalOpen(false);
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to create coupon. Please try again.";
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const handleUpdateCoupon = async (id: string, formData: ICouponUpdatePayload) => {
    try {
      await updateCoupon({ id, data: formData }).unwrap();
      setToastMessage("Coupon updated successfully!");
      setToastType("success");
      setIsEditModalOpen(false);
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to update coupon. Please try again.";
      setToastMessage(errorMessage);
      setToastType("error");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await deleteCoupon(id).unwrap();
        setToastMessage("Coupon deleted successfully!");
        setToastType("success");
      } catch (error: any) {
        const errorMessage = error?.data?.message || "Failed to delete coupon. Please try again.";
        setToastMessage(errorMessage);
        setToastType("error");
      }
    }
  };

  const handleToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
  };

  const columns = [
    { 
      header: 'Code', 
      accessor: (coupon: ICoupon) => (
        <div className="flex items-center space-x-2">
          <span>{coupon.code}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(coupon.code);
              setToastMessage("Coupon code copied to clipboard!");
              setToastType("success");
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Copy code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      )
    },
    { 
      header: 'Amount', 
      accessor: (coupon: ICoupon) => (
        <span className="font-medium">
          {coupon.amount.toFixed(2)}
        </span>
      )
    },
    { 
      header: 'Usage', 
      accessor: (coupon: ICoupon) => (
        <span className="font-medium">
          {coupon.usedCount} / {coupon.usageLimit}
        </span>
      )
    },
    { 
      header: 'Validity', 
      accessor: (coupon: ICoupon) => (
        <span className="font-medium">
          {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: (coupon: ICoupon) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {coupon.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (coupon: ICoupon) => (
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedCoupon(coupon);
              setIsEditModalOpen(true);
            }}
          >
            <EditIcon size={14} style={{marginRight:"4px"}}/> Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteCoupon(coupon._id)}
            disabled={deleteLoading}
          >
            <TrashIcon size={14} style={{marginRight:"4px"}}/> Delete
          </Button>
        </div>
      )
    }
  ];
 
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon size={16} style={{marginRight:"8px"}}/> Create Coupon
        </Button>
      </div>
      
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search coupons by code..."
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
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={isActive === undefined ? '' : isActive.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setIsActive(value === '' ? undefined : value === 'true');
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="relative">
          { isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

        {coupons && (
          <Table
            columns={columns}
            data={coupons.coupons || []}
            keyExtractor={(coupon) => coupon._id}
            emptyMessage="No coupons found matching your criteria"
          />
        )}
        </div>
        
        {coupons?.pagination && coupons?.pagination?.pages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={coupons.pagination.pages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Coupon"
        size="md"
      >
        <CouponForm
          onSubmit={handleCreateCoupon}
          isLoading={createLoading}
          onCancel={() => setIsCreateModalOpen(false)}
          onToast={handleToast}
        />
      </Modal>

      {/* Edit Coupon Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Coupon"
        size="md"
      >
        {selectedCoupon && (
          <CouponForm
            initialData={selectedCoupon}
            onSubmit={(data) => handleUpdateCoupon(selectedCoupon._id, data)}
            isLoading={updateLoading}
            onCancel={() => setIsEditModalOpen(false)}
            isEdit
            onToast={handleToast}
          />
        )}
      </Modal>

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

interface CouponFormProps {
  initialData?: ICoupon;
  onSubmit: (data: ICouponCreatePayload | ICouponUpdatePayload) => void;
  isLoading: boolean;
  onCancel: () => void;
  isEdit?: boolean;
  onToast: (message: string, type: "success" | "error") => void;
}

const CouponForm: React.FC<CouponFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  isEdit,
  onToast
}) => {
  const [formData, setFormData] = useState<ICouponCreatePayload | ICouponUpdatePayload>({
    amount: isEdit ? initialData?.amount || 0 : 0,
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    usageLimit: initialData?.usageLimit || 1,
    description: initialData?.description || '',
    ...(isEdit ? { isActive: initialData?.isActive } : {}),
    ...(isEdit ? {} : { code: '' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      onToast("Please enter a valid amount greater than 0", "error");
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'usageLimit' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Code (Optional)
          </label>
          <input
            type="text"
            name="code"
            value={(formData as ICouponCreatePayload).code || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Leave empty for auto-generated code"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount || ''}
          onChange={handleChange}
          required
          min="0.01"
          step="0.01"
          placeholder="Enter amount"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date
        </label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date
        </label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Usage Limit
        </label>
        <input
          type="number"
          name="usageLimit"
          value={formData.usageLimit || 1}
          onChange={handleChange}
          required
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {isEdit && (
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={(formData as ICouponUpdatePayload).isActive || false}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
};

export default CouponManagement; 