// import { Edit, Filter, Search, Trash2 } from 'lucide-react';
// import React, { useState } from 'react';
// import Button from '../components/UI/Button';
// import Card from '../components/UI/Card';
// import Modal from '../components/UI/Modal';
// import Pagination from '../components/UI/Pagination';
// import Table from '../components/UI/Table';
// import Toast from '../components/UI/Toast';
// import { useDeleteUserMutation, useGetAllUsersQuery, useUpdateUserMutation } from '../services/api/usersApi';
// import { IUser } from '../types';
// import { useAppContext } from '../context/AppContext';
// import { useToast } from '../context/ToastContext';

// const UserManagement: React.FC = () => {
//    const [toastMessage, setToastMessage] = useState<string | null>(null);
//    const [toastType, setToastType] = useState<"success" | "error">("success");
//   const { showToast } = useToast();
//   const limit:number =10;
//   const [currentPage,setCurrentPage]=useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState<string>('all');
//   const [updateUser, { isLoading:updateLoading}] = useUpdateUserMutation();
//   const [deleteUser, { isLoading:deleteLoading}] = useDeleteUserMutation();
//   const {isLoading,error,data:users,refetch:refetchUsers}=useGetAllUsersQuery({
//     page:currentPage,
//     limit,
//     search:searchTerm,
//     filter:filterStatus
//   });
//   console.log(isLoading,error,users,"ALL USERs");  
//   const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [editFormData, setEditFormData] = useState<IUser | null>(null);
//   // Handle edit user
//   const handleEditClick = (user: IUser) => {
//     setSelectedUser(user);
//     setEditFormData({ ...user });
//     setIsEditModalOpen(true);
//   };
  
//   // Handle delete user
//   const handleDeleteClick = (user: IUser) => {
//     setSelectedUser(user);
//     setIsDeleteModalOpen(true);
//   };
  
//   // Handle form input change
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     if (!editFormData) return;
  
//     const { name, type, value } = e.target;
//     const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
  
//     setEditFormData((prev) => {
//       if (!prev) return prev; 

//       // Check if the field belongs to `name` (first, middle, last)
//       if (["first", "middle", "last"].includes(name)) {
//         return {
//           ...prev,
//           name: {
//             ...prev.name,
//             [name]: newValue, 
//           },
//           _id: prev._id ?? "", // Ensuring `_id` exists
//         };
//       }
  
//       return {
//         ...prev,
//         [name]: newValue, // Handle other fields like `kyc`, `subscribed`, etc.
//         _id: prev._id ?? "",
//       };
//     });
//   };
  
  
  
//   // Handle form submission
//   const handleSubmit = async(e: React.FormEvent) => {
//     e.preventDefault();
//     if (editFormData) {
//       try{
//         await updateUser(editFormData);
//         setIsEditModalOpen(false);
//         setToastMessage("User updated successfully!");
//       setToastType("success");
//       }catch(err){
//         setToastMessage("Failed to update user data. Please try again.");
//         setToastType("error");
//       }
//     }
//   };
  
// // Downlaod CSV
// const downloadUsersData = async () => {
//   try {
//     const response = await fetch('/api/v1/user/csv-data', {
//       method: 'GET',
//      credentials: 'include'
//     });
    
//       // Browser will automatically trigger download
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'users_data.xlsx';
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
      
//       showToast('Users data downloaded successfully!', 'success');
//   } catch (error) {
//     console.error('Error downloading users data:', error);
//     const errorMessage = error instanceof Error ? error.message : 'Failed to download users data. Please try again.';
//     showToast(errorMessage, 'error');
//   }
// };

//   // Handle user deletion confirmation
//   const handleDeleteConfirm = async() => {
//     if (selectedUser) {
//       try {
//      await deleteUser(selectedUser).unwrap();
//       setIsDeleteModalOpen(false);
//       showToast('User deleted successfully!', 'success');
//       refetchUsers();
//     }catch(err){
//       const errorMessage = (err as any)?.data?.message || 'Failed to delete user. Please try again.';
//       showToast(errorMessage, 'error');
//     }
//   }
// };
  
//   // Table columns
//   const columns = [
//     { header: 'User ID', accessor: (user: IUser) => `${user.name.first}-${user._id.slice(20,24)}` },
//     { header: 'Name', accessor: (user: IUser) => user.name.first+" "+user.name.middle+" "+user.name.last},
//     { header: 'Email', accessor: (user: IUser) => user.email },
//     { header: 'Registration Date', accessor: (user: IUser) => new Date(user.createdAt).toLocaleDateString() },
//     { header: 'Address', accessor: (user: IUser) => `${user.city},${user.state}-(${user.zipCode})` },
//     { 
//       header: 'Email Verified', 
//       accessor: (user: IUser) => {
//         return (
//           <span className={`px-2 py-1 rounded-full text-md font-medium`}>
//             {user.isEmailVerified?"✅" :"❌"}
//           </span>
//         );
//       }
//     },
//     { 
//       header: 'KYC Verified', 
//       accessor: (user: IUser) => {
//         return (
//           <span className={`px-2 py-1 rounded-full text-md font-medium`}>
//             {user.isKYC?"✅"  :"❌"}
//           </span>
//         );
//       }
//     },
//     { 
//       header: 'Subscribed', 
//       accessor: (user: IUser) => {
//         return (
//           <span className={`px-2 py-1 rounded-full text-md font-medium`}>
//             {user.isOpted?"✅"  :"❌"}
//           </span>
//         );
//       }
//     },
//     {
//       header: 'Actions',
//       accessor: (user: IUser) => (
//         <div className="flex space-x-2">
//           <Button
//             variant="secondary"
//             size="sm"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleEditClick(user);
//             }}
//           >
//             <Edit size={16} className="mr-1" /> Edit
//           </Button>
//           <Button
//             variant="danger"
//             size="sm"
//             onClick={(e) => {
//               e.stopPropagation();
//               handleDeleteClick(user);
//             }}
//           >
//             <Trash2 size={16} className="mr-1" /> Delete
//           </Button>
//         </div>
//       )
//     }
//   ];

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      
//       <Card>
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search users by mail..."
//               className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//               }}
//             />
//             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <Button variant="primary" onClick={downloadUsersData}>
//               Export Users
//             </Button>
//             <div className="flex items-center">
//               <Filter className="mr-2 text-gray-500" size={18} />
//               <select
//                 className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 value={filterStatus}
//                 onChange={(e) => {
//                   setFilterStatus(e.target.value);
//                 }}
//               >
//                 <option value="all">All Statuses</option>
//                 <option value="kyc">KYC</option>
//                 <option value="opted">Subscribed</option>
//               </select>
//             </div>
//           </div>
//         </div>
        
//       {users &&  <Table
//           columns={columns}
//           data={users?.users?users.users:[]}
//           keyExtractor={(user) => user._id}
//           emptyMessage="No users found matching your criteria"
//         />}
        
//         {users?.pagination && users?.pagination?.totalPages > 1 &&  (
//           <Pagination
//             currentPage={currentPage}
//             totalPages={users?.pagination?.totalPages}
//             onPageChange={setCurrentPage}
//           />
//         )}
//       </Card>
      
//       {/* Edit User Modal */}
//       <Modal
//   isOpen={isEditModalOpen}
//   onClose={() => setIsEditModalOpen(false)}
//   title="Edit User"
// >
//   {editFormData && (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {/* First Name */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           First Name
//         </label>
//         <input
//           type="text"
//           name="first"
//           value={editFormData.name.first}
//           onChange={handleInputChange}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
//         />
//       </div>

//       {/* Middle Name */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Middle Name
//         </label>
//         <input
//           type="text"
//           name="middle"
//           value={editFormData.name.middle}
//           onChange={handleInputChange}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//         />
//       </div>

//       {/* Last Name */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Last Name
//         </label>
//         <input
//           type="text"
//           name="last"
//           value={editFormData.name.last}
//           onChange={handleInputChange}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//         />
//       </div>

//       {/* Email */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Email
//         </label>
//         <input
//           type="email"
//           name="email"
//           value={editFormData.email}
//           disabled
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           required
//         />
//       </div>

//       {/* KYC Verified Toggle */}
//       <div className="flex items-center justify-between">
//         <label className="text-sm font-medium text-gray-700">KYC Verified</label>
//         <input
//           type="checkbox"
//           name="isKYC"
//           checked={editFormData.isKYC}
//           onChange={handleInputChange}
//           className="w-5 h-5 rounded-md focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Subscribed Toggle */}
//       <div className="flex items-center justify-between">
//         <label className="text-sm font-medium text-gray-700">Subscribed</label>
//         <input
//           type="checkbox"
//           name="isOpted"
//           checked={editFormData.isOpted}
//           onChange={handleInputChange}
//           className="w-5 h-5 rounded-md focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Email Verified Toggle */}
//       <div className="flex items-center justify-between">
//         <label className="text-sm font-medium text-gray-700">Email Verified</label>
//         <input
//           type="checkbox"
//           name="isEmailVerified"
//           checked={editFormData.isEmailVerified}
//           onChange={handleInputChange}
//           className="w-5 h-5 rounded-md focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-end space-x-3 pt-4">
//         <Button
//           type="button"
//           variant="secondary"
//           onClick={() => setIsEditModalOpen(false)}
//         >
//           Cancel
//         </Button>
//         <Button type="submit" variant="primary">
//           Save Changes
//         </Button>
//       </div>
//     </form>
//   )}
// </Modal>

      
//       {/* Delete Confirmation Modal */}
//       <Modal
//         isOpen={isDeleteModalOpen}
//         onClose={() => setIsDeleteModalOpen(false)}
//         title="Confirm Deletion"
//         size="sm"
//       >
//         <div className="space-y-4">
//           <p className="text-gray-700">
//             Are you sure you want to delete the user <span className="font-semibold">{selectedUser?.name?.first}</span>?
//             This action cannot be undone.
//           </p>
          
//           <div className="flex justify-end space-x-3 pt-4">
//             <Button
//               variant="secondary"
//               onClick={() => setIsDeleteModalOpen(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="danger"
//               onClick={handleDeleteConfirm}
//             >
//               Delete User
//             </Button>
//           </div>
//         </div>
//       </Modal>
//       {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
//     </div>
//   );
// };

// export default UserManagement;