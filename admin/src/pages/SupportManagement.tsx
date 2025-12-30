// import React, { useState } from 'react';
// import { Users, MessageSquare, Clock, CheckCircle, AlertCircle, Plus, Search, Filter } from 'lucide-react';
// import Card from '../components/UI/Card';
// import Button from '../components/UI/Button';
// import Table, { TableColumn } from '../components/UI/Table';
// import Modal from '../components/UI/Modal';
// import { usePermissions } from '../hooks/usePermissions';

// interface SupportTicket {
//   id: string;
//   title: string;
//   description: string;
//   status: 'open' | 'in_progress' | 'resolved' | 'closed';
//   priority: 'low' | 'medium' | 'high' | 'urgent';
//   assignedTo?: string;
//   createdAt: Date;
//   updatedAt: Date;
//   userId: string;
//   userName: string;
// }

// interface SupportAgent {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   status: 'active' | 'inactive';
//   ticketsAssigned: number;
//   avgResponseTime: number;
// }

// const SupportManagement: React.FC = () => {
//   const { canManageSupport, hasPermission } = usePermissions();
//   const [activeTab, setActiveTab] = useState<'tickets' | 'team'>('tickets');
//   const [showTicketModal, setShowTicketModal] = useState(false);
//   const [showAgentModal, setShowAgentModal] = useState(false);
//   const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

//   // Mock data - replace with actual API calls
//   const mockTickets: SupportTicket[] = [
//     {
//       id: '1',
//       title: 'Cannot access game account',
//       description: 'User is unable to log into their game account after recent update',
//       status: 'open',
//       priority: 'high',
//       createdAt: new Date('2024-01-15'),
//       updatedAt: new Date('2024-01-15'),
//       userId: 'user1',
//       userName: 'John Doe'
//     },
//     {
//       id: '2',
//       title: 'Withdrawal request pending',
//       description: 'User submitted withdrawal request 3 days ago, still pending',
//       status: 'in_progress',
//       priority: 'medium',
//       assignedTo: 'agent1',
//       createdAt: new Date('2024-01-12'),
//       updatedAt: new Date('2024-01-14'),
//       userId: 'user2',
//       userName: 'Jane Smith'
//     }
//   ];

//   const mockAgents: SupportAgent[] = [
//     {
//       id: 'agent1',
//       name: 'Sarah Johnson',
//       email: 'sarah@support.com',
//       role: 'Senior Support',
//       status: 'active',
//       ticketsAssigned: 5,
//       avgResponseTime: 2.5
//     },
//     {
//       id: 'agent2',
//       name: 'Mike Chen',
//       email: 'mike@support.com',
//       role: 'Support Agent',
//       status: 'active',
//       ticketsAssigned: 3,
//       avgResponseTime: 4.2
//     }
//   ];

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'open': return 'text-red-600 bg-red-100';
//       case 'in_progress': return 'text-yellow-600 bg-yellow-100';
//       case 'resolved': return 'text-green-600 bg-green-100';
//       case 'closed': return 'text-gray-600 bg-gray-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'urgent': return 'text-red-600 bg-red-100';
//       case 'high': return 'text-orange-600 bg-orange-100';
//       case 'medium': return 'text-yellow-600 bg-yellow-100';
//       case 'low': return 'text-green-600 bg-green-100';
//       default: return 'text-gray-600 bg-gray-100';
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'open': return <AlertCircle className="w-4 h-4" />;
//       case 'in_progress': return <Clock className="w-4 h-4" />;
//       case 'resolved': return <CheckCircle className="w-4 h-4" />;
//       case 'closed': return <MessageSquare className="w-4 h-4" />;
//       default: return <MessageSquare className="w-4 h-4" />;
//     }
//   };

//   const ticketColumns: TableColumn<SupportTicket>[] = [
//     { header: 'ID', accessor: 'id' },
//     { header: 'Title', accessor: 'title' },
//     { header: 'User', accessor: 'userName' },
//     { 
//       header: 'Status', 
//       accessor: (row: SupportTicket) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(row.status)}`}>
//           {getStatusIcon(row.status)}
//           {row.status.replace('_', ' ').toUpperCase()}
//         </span>
//       )
//     },
//     { 
//       header: 'Priority', 
//       accessor: (row: SupportTicket) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(row.priority)}`}>
//           {row.priority.toUpperCase()}
//         </span>
//       )
//     },
//     { header: 'Assigned To', accessor: 'assignedTo' },
//     { 
//       header: 'Created', 
//       accessor: (row: SupportTicket) => row.createdAt.toLocaleDateString()
//     },
//     { 
//       header: 'Actions', 
//       accessor: (row: SupportTicket) => (
//         <div className="flex gap-2">
//           <Button
//             size="sm"
//             variant="secondary"
//             onClick={() => {
//               setSelectedTicket(row);
//               setShowTicketModal(true);
//             }}
//           >
//             View
//           </Button>
//           {hasPermission('canResolveSupportTickets') && (
//             <Button size="sm" variant="secondary">
//               Assign
//             </Button>
//           )}
//         </div>
//       )
//     }
//   ];

//   const agentColumns: TableColumn<SupportAgent>[] = [
//     { header: 'Name', accessor: 'name' },
//     { header: 'Email', accessor: 'email' },
//     { header: 'Role', accessor: 'role' },
//     { 
//       header: 'Status', 
//       accessor: (row: SupportAgent) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//           row.status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
//         }`}>
//           {row.status.toUpperCase()}
//         </span>
//       )
//     },
//     { header: 'Tickets Assigned', accessor: 'ticketsAssigned' },
//     { header: 'Avg Response (hrs)', accessor: 'avgResponseTime' },
//     { 
//       header: 'Actions', 
//       accessor: (row: SupportAgent) => (
//         <div className="flex gap-2">
//           <Button size="sm" variant="secondary">
//             Edit
//           </Button>
//           <Button size="sm" variant="secondary">
//             View Performance
//           </Button>
//         </div>
//       )
//     }
//   ];

//   if (!canManageSupport && !hasPermission('canViewSupportTickets')) {
//     return (
//       <div className="p-6">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
//           <p className="text-gray-600">You don't have permission to access Support Management.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Management</h1>
//         <p className="text-gray-600">Manage support team and customer tickets</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//         <Card>
//           <div className="flex items-center">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <MessageSquare className="w-6 h-6 text-blue-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Total Tickets</p>
//               <p className="text-2xl font-bold text-gray-900">{mockTickets.length}</p>
//             </div>
//           </div>
//         </Card>
        
//         <Card>
//           <div className="flex items-center">
//             <div className="p-2 bg-yellow-100 rounded-lg">
//               <Clock className="w-6 h-6 text-yellow-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Open Tickets</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {mockTickets.filter(t => t.status === 'open').length}
//               </p>
//             </div>
//           </div>
//         </Card>
        
//         <Card>
//           <div className="flex items-center">
//             <div className="p-2 bg-green-100 rounded-lg">
//               <CheckCircle className="w-6 h-6 text-green-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Resolved Today</p>
//               <p className="text-2xl font-bold text-gray-900">12</p>
//             </div>
//           </div>
//         </Card>
        
//         <Card>
//           <div className="flex items-center">
//             <div className="p-2 bg-purple-100 rounded-lg">
//               <Users className="w-6 h-6 text-purple-600" />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-600">Active Agents</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {mockAgents.filter(a => a.status === 'active').length}
//               </p>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Tabs */}
//       <div className="mb-6">
//         <div className="border-b border-gray-200">
//           <nav className="-mb-px flex space-x-8">
//             <button
//               onClick={() => setActiveTab('tickets')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === 'tickets'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Support Tickets
//             </button>
//             <button
//               onClick={() => setActiveTab('team')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === 'team'
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Support Team
//             </button>
//           </nav>
//         </div>
//       </div>

//       {/* Content */}
//       {activeTab === 'tickets' && (
//         <div>
//           <div className="flex justify-between items-center mb-4">
//             <div className="flex gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search tickets..."
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <Button variant="secondary" size="sm">
//                 <Filter className="w-4 h-4 mr-2" />
//                 Filter
//               </Button>
//             </div>
//             {canManageSupport && (
//               <Button onClick={() => setShowTicketModal(true)}>
//                 <Plus className="w-4 h-4 mr-2" />
//                 New Ticket
//               </Button>
//             )}
//           </div>
          
//           <Table
//             data={mockTickets}
//             columns={ticketColumns}
//             keyExtractor={(item) => item.id}
//           />
//         </div>
//       )}

//       {activeTab === 'team' && (
//         <div>
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-medium text-gray-900">Support Team Members</h3>
//             {canManageSupport && (
//               <Button onClick={() => setShowAgentModal(true)}>
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Agent
//               </Button>
//             )}
//           </div>
          
//           <Table
//             data={mockAgents}
//             keyExtractor={(item) => item.id}
//             columns={agentColumns}
//           />
//         </div>
//       )}

//       {/* Ticket Detail Modal */}
//       <Modal
//         isOpen={showTicketModal}
//         onClose={() => {
//           setShowTicketModal(false);
//           setSelectedTicket(null);
//         }}
//         title={selectedTicket ? `Ticket #${selectedTicket.id}` : 'New Ticket'}
//         size="lg"
//       >
//         {selectedTicket ? (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
//               <p className="text-gray-900 font-medium">{selectedTicket.title}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//               <p className="text-gray-900">{selectedTicket.description}</p>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
//                   {selectedTicket.status.replace('_', ' ').toUpperCase()}
//                 </span>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
//                   {selectedTicket.priority.toUpperCase()}
//                 </span>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
//                 <p className="text-gray-900">{selectedTicket.userName}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
//                 <p className="text-gray-900">{selectedTicket.createdAt.toLocaleDateString()}</p>
//               </div>
//             </div>
//             {canManageSupport && (
//               <div className="pt-4 border-t border-gray-200">
//                 <div className="flex gap-2">
//                   <Button>Update Status</Button>
//                   <Button variant="secondary">Assign to Agent</Button>
//                   <Button variant="secondary">Add Note</Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
//               <input
//                 type="text"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter ticket title"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//               <textarea
//                 rows={4}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter ticket description"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
//                 <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                   <option value="urgent">Urgent</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
//                 <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                   <option value="">Unassigned</option>
//                   {mockAgents.map(agent => (
//                     <option key={agent.id} value={agent.id}>{agent.name}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="pt-4 border-t border-gray-200">
//               <div className="flex gap-2">
//                 <Button>Create Ticket</Button>
//                 <Button variant="secondary" onClick={() => setShowTicketModal(false)}>Cancel</Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Add Agent Modal */}
//       <Modal
//         isOpen={showAgentModal}
//         onClose={() => setShowAgentModal(false)}
//         title="Add Support Agent"
//         size="md"
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//             <input
//               type="text"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Enter agent name"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//             <input
//               type="email"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Enter agent email"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
//             <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//               <option value="support_agent">Support Agent</option>
//               <option value="senior_support">Senior Support</option>
//               <option value="support_lead">Support Lead</option>
//             </select>
//           </div>
//           <div className="pt-4 border-t border-gray-200">
//             <div className="flex gap-2">
//               <Button>Add Agent</Button>
//               <Button variant="secondary" onClick={() => setShowAgentModal(false)}>Cancel</Button>
//             </div>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default SupportManagement; 