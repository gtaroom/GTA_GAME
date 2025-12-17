// import React, { useState, useEffect } from "react";
// import {
//   Send,
//   Users,
//   Search,
//   CheckCircle,
//   XCircle,
//   MessageSquare,
// } from "lucide-react";

// // Mock API hooks - Replace with your actual API service
// const useGetAllUsersQuery = (params) => {
//   // This should be replaced with your actual RTK Query hook
//   const [data, setData] = useState({
//     users: [
//       {
//         _id: "1",
//         name: { first: "John", last: "Doe" },
//         email: "john@example.com",
//         phone: "+1234567890",
//         isActive: true,
//       },
//       {
//         _id: "2",
//         name: { first: "Jane", last: "Smith" },
//         email: "jane@example.com",
//         phone: "+1234567891",
//         isActive: true,
//       },
//       {
//         _id: "3",
//         name: { first: "Bob", last: "Johnson" },
//         email: "bob@example.com",
//         phone: "+1234567892",
//         isActive: false,
//       },
//     ],
//     totalPages: 1,
//     currentPage: 1,
//     total: 3,
//   });

//   return {
//     data,
//     isLoading: false,
//     error: null,
//     isFetching: false,
//     refetch: () => {},
//   };
// };

// const useSendSmsMutation = () => {
//   return [
//     async (payload) => {
//       // Simulate API call
//       return new Promise((resolve) => {
//         setTimeout(() => {
//           console.log("Sending SMS:", payload);
//           resolve({ success: true });
//         }, 1000);
//       });
//     },
//     { isLoading: false, error: null },
//   ];
// };

// // UI Components (simplified versions - replace with your actual components)
// const Card = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
//     {children}
//   </div>
// );

// const Button = ({
//   children,
//   variant = "primary",
//   size = "md",
//   onClick,
//   disabled,
//   className = "",
// }) => {
//   const baseClasses =
//     "rounded-lg font-medium transition-colors flex items-center justify-center";
//   const sizeClasses = {
//     sm: "px-3 py-1.5 text-sm",
//     md: "px-4 py-2",
//     lg: "px-6 py-3 text-lg",
//   };
//   const variantClasses = {
//     primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
//     secondary:
//       "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
//     success: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300",
//     danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
//   };

//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
//     >
//       {children}
//     </button>
//   );
// };

// const Toast = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => onClose(), 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

//   return (
//     <div
//       className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`}
//     >
//       {message}
//     </div>
//   );
// };

// const Modal = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg max-w-md w-full mx-4">
//         <div className="border-b px-6 py-4 flex items-center justify-between">
//           <h3 className="text-lg font-semibold">{title}</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <XCircle size={20} />
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// };

// const SmsSender = () => {
//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const limit = 10;

//   // UI state
//   const [toastMessage, setToastMessage] = useState(null);
//   const [toastType, setToastType] = useState("success");
//   const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

//   // Search and filter states
//   const [search, setSearch] = useState("");
//   const [tempSearch, setTempSearch] = useState("");
//   const [filterActive, setFilterActive] = useState("all");

//   // SMS composition state
//   const [message, setMessage] = useState("");
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [sendToAll, setSendToAll] = useState(false);

//   // Query params for RTK Query
//   const queryParams = {
//     page: currentPage,
//     limit,
//     isActive: filterActive === "all" ? undefined : filterActive === "active",
//     search: search,
//   };

//   // Fetch data using RTK Query
//   const {
//     data: usersData,
//     isLoading,
//     error,
//     refetch,
//     isFetching,
//   } = useGetAllUsersQuery(queryParams);

//   // Mutation hooks
//   const [sendSms, { isLoading: isSending, error: sendError }] =
//     useSendSmsMutation();

//   // Handle mutation errors
//   useEffect(() => {
//     if (sendError) {
//       setToastMessage("Failed to send SMS");
//       setToastType("error");
//     }
//   }, [sendError]);

//   // Handle user selection
//   const handleUserToggle = (userId) => {
//     setSelectedUsers((prev) => {
//       if (prev.includes(userId)) {
//         return prev.filter((id) => id !== userId);
//       } else {
//         return [...prev, userId];
//       }
//     });
//   };

//   // Handle select all on current page
//   const handleSelectAllCurrentPage = () => {
//     if (!usersData?.users) return;

//     const currentPageUserIds = usersData.users.map((u) => u._id);
//     const allSelected = currentPageUserIds.every((id) =>
//       selectedUsers.includes(id)
//     );

//     if (allSelected) {
//       setSelectedUsers((prev) =>
//         prev.filter((id) => !currentPageUserIds.includes(id))
//       );
//     } else {
//       setSelectedUsers((prev) => [
//         ...new Set([...prev, ...currentPageUserIds]),
//       ]);
//     }
//   };

//   // Handle send SMS
//   const handleSendSms = async () => {
//     if (!message.trim()) {
//       setToastMessage("Please enter a message");
//       setToastType("error");
//       return;
//     }

//     if (!sendToAll && selectedUsers.length === 0) {
//       setToastMessage(
//         "Please select at least one user or choose 'Send to All'"
//       );
//       setToastType("error");
//       return;
//     }

//     try {
//       const payload = {
//         message: message.trim(),
//         sendToAll,
//         userIds: sendToAll ? [] : selectedUsers,
//       };

//       await sendSms(payload);
//       setToastMessage(
//         `SMS sent successfully to ${
//           sendToAll ? "all users" : `${selectedUsers.length} user(s)`
//         }!`
//       );
//       setToastType("success");
//       setMessage("");
//       setSelectedUsers([]);
//       setSendToAll(false);
//       setIsPreviewModalOpen(false);
//     } catch (err) {
//       // Error is handled by the useEffect hook
//     }
//   };

//   // Handle search submission
//   const handleSearchSubmit = (e) => {
//     if (e) e.preventDefault();
//     setSearch(tempSearch);
//     setCurrentPage(1);
//   };

//   // Handle filter change
//   const handleFilterChange = (value) => {
//     setFilterActive(value);
//     setCurrentPage(1);
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setTempSearch("");
//     setSearch("");
//     setFilterActive("all");
//     setCurrentPage(1);
//   };

//   const characterCount = message.length;
//   const maxCharacters = 160;
//   const messageSegments = Math.ceil(characterCount / maxCharacters);

//   return (
//     <div className="space-y-6 p-6 max-w-7xl mx-auto">
//       <h1 className="text-2xl font-bold text-gray-800 flex items-center">
//         <MessageSquare className="mr-3" size={28} />
//         Send SMS to Users
//       </h1>

//       {/* SMS Composition Section */}
//       <Card>
//         <h2 className="text-xl font-semibold mb-4 flex items-center">
//           <Send className="mr-2" size={20} />
//           Compose Message
//         </h2>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Message
//             </label>
//             <textarea
//               className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               rows="5"
//               placeholder="Type your message here..."
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               maxLength={maxCharacters * 5}
//             />
//             <div className="flex justify-between text-sm text-gray-500 mt-1">
//               <span>
//                 {characterCount} / {maxCharacters * messageSegments} characters
//               </span>
//               <span>{messageSegments} message segment(s)</span>
//             </div>
//           </div>

//           <div className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               id="sendToAll"
//               checked={sendToAll}
//               onChange={(e) => setSendToAll(e.target.checked)}
//               className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//             />
//             <label
//               htmlFor="sendToAll"
//               className="text-sm font-medium text-gray-700"
//             >
//               Send to all users
//             </label>
//           </div>

//           {!sendToAll && (
//             <div className="text-sm text-gray-600">
//               <Users size={16} className="inline mr-1" />
//               {selectedUsers.length} user(s) selected
//             </div>
//           )}
//         </div>
//       </Card>

//       {/* User Selection Section */}
//       {!sendToAll && (
//         <Card>
//           <h2 className="text-xl font-semibold mb-4 flex items-center">
//             <Users className="mr-2" size={20} />
//             Select Recipients
//           </h2>

//           <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0 gap-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search by name or email..."
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
//                 value={tempSearch}
//                 onChange={(e) => setTempSearch(e.target.value)}
//                 onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit(e)}
//                 disabled={isLoading || isFetching}
//               />
//               <Search
//                 className="absolute left-3 top-2.5 text-gray-400"
//                 size={18}
//               />
//             </div>

//             <div className="flex items-center gap-4">
//               <select
//                 className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 value={filterActive}
//                 onChange={(e) => handleFilterChange(e.target.value)}
//                 disabled={isLoading || isFetching}
//               >
//                 <option value="all">All Users</option>
//                 <option value="active">Active Only</option>
//                 <option value="inactive">Inactive Only</option>
//               </select>

//               <Button
//                 variant="secondary"
//                 size="sm"
//                 onClick={handleSelectAllCurrentPage}
//                 disabled={isLoading || isFetching || !usersData?.users?.length}
//               >
//                 {usersData?.users?.every((u) => selectedUsers.includes(u._id))
//                   ? "Deselect All"
//                   : "Select All"}
//               </Button>
//             </div>

//             {(search || filterActive !== "all") && (
//               <Button
//                 variant="secondary"
//                 size="sm"
//                 onClick={resetFilters}
//                 disabled={isLoading || isFetching}
//               >
//                 Clear Filters
//               </Button>
//             )}
//           </div>

//           {/* Users List */}
//           <div className="relative">
//             {isFetching && !isLoading && (
//               <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//               </div>
//             )}

//             {isLoading ? (
//               <div className="text-center py-8">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                 <p className="text-gray-500">Loading users...</p>
//               </div>
//             ) : usersData?.users?.length > 0 ? (
//               <div className="space-y-2 max-h-96 overflow-y-auto">
//                 {usersData.users.map((user) => (
//                   <div
//                     key={user._id}
//                     className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
//                       selectedUsers.includes(user._id)
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-gray-200"
//                     }`}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedUsers.includes(user._id)}
//                         onChange={() => handleUserToggle(user._id)}
//                         className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                       />
//                       <div>
//                         <div className="font-medium">
//                           {user.name.first} {user.name.last}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {user.email}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm font-medium">{user.phone}</div>
//                       <span
//                         className={`text-xs px-2 py-1 rounded-full ${
//                           user.isActive
//                             ? "bg-green-100 text-green-800"
//                             : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {user.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 No users found
//               </div>
//             )}
//           </div>

//           {/* Pagination */}
//           {usersData && usersData.totalPages > 1 && (
//             <div className="mt-4 flex justify-center space-x-2">
//               <Button
//                 variant="secondary"
//                 size="sm"
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage === 1 || isLoading || isFetching}
//               >
//                 Previous
//               </Button>
//               <span className="px-4 py-2 text-sm">
//                 Page {currentPage} of {usersData.totalPages}
//               </span>
//               <Button
//                 variant="secondary"
//                 size="sm"
//                 onClick={() =>
//                   setCurrentPage((p) => Math.min(usersData.totalPages, p + 1))
//                 }
//                 disabled={
//                   currentPage === usersData.totalPages ||
//                   isLoading ||
//                   isFetching
//                 }
//               >
//                 Next
//               </Button>
//             </div>
//           )}
//         </Card>
//       )}

//       {/* Send Button */}
//       <div className="flex justify-end">
//         <Button
//           variant="primary"
//           size="lg"
//           onClick={() => setIsPreviewModalOpen(true)}
//           disabled={
//             !message.trim() ||
//             (!sendToAll && selectedUsers.length === 0) ||
//             isSending
//           }
//           className="min-w-40"
//         >
//           <Send size={20} className="mr-2" />
//           {isSending ? "Sending..." : "Send SMS"}
//         </Button>
//       </div>

//       {/* Preview Modal */}
//       <Modal
//         isOpen={isPreviewModalOpen}
//         onClose={() => !isSending && setIsPreviewModalOpen(false)}
//         title="Confirm SMS Sending"
//       >
//         <div className="p-6">
//           {isSending ? (
//             <div className="text-center py-4">
//               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
//               <p>Sending SMS...</p>
//             </div>
//           ) : (
//             <>
//               <div className="mb-4">
//                 <p className="font-medium mb-2">Recipients:</p>
//                 <p className="text-gray-700">
//                   {sendToAll
//                     ? "All users"
//                     : `${selectedUsers.length} selected user(s)`}
//                 </p>
//               </div>

//               <div className="mb-4">
//                 <p className="font-medium mb-2">Message:</p>
//                 <div className="bg-gray-50 p-3 rounded border border-gray-200">
//                   <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
//                 </div>
//               </div>

//               <div className="text-sm text-gray-500 mb-4">
//                 This will send {messageSegments} SMS segment(s) per recipient.
//               </div>

//               <div className="flex justify-end space-x-4">
//                 <Button
//                   variant="secondary"
//                   onClick={() => setIsPreviewModalOpen(false)}
//                 >
//                   Cancel
//                 </Button>
//                 <Button variant="primary" onClick={handleSendSms}>
//                   <Send size={16} className="mr-2" />
//                   Confirm & Send
//                 </Button>
//               </div>
//             </>
//           )}
//         </div>
//       </Modal>

//       {/* Toast for notifications */}
//       {toastMessage && (
//         <Toast
//           message={toastMessage}
//           type={toastType}
//           onClose={() => setToastMessage(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default SmsSender;
