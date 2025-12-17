import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Transaction, EmailTemplate, DashboardStats, RegistrationTrend, EngagementMetric } from '../types';
import { users as mockUsers, transactions as mockTransactions, emailTemplates as mockEmailTemplates, dashboardStats as mockDashboardStats, registrationTrend as mockRegistrationTrend, engagementMetrics as mockEngagementMetrics } from '../data/mockData';

interface AppContextType {
  users: User[];
  transactions: Transaction[];
  emailTemplates: EmailTemplate[];
  dashboardStats: DashboardStats;
  registrationTrend: RegistrationTrend[];
  engagementMetrics: EngagementMetric[];
  updateUser: (updatedUser: User) => void;
  deleteUser: (userId: string) => void;
  updateUserBalance: (userId: string, newBalance: number) => void;
  addEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmailTemplate: (updatedTemplate: EmailTemplate) => void;
  deleteEmailTemplate: (templateId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(mockDashboardStats);
  const [registrationTrend] = useState<RegistrationTrend[]>(mockRegistrationTrend);
  const [engagementMetrics] = useState<EngagementMetric[]>(mockEngagementMetrics);

  const updateUser = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    
    // Update dashboard stats if subscription status changed
    const oldUser = users.find(user => user.id === updatedUser.id);
    if (oldUser && oldUser.subscriptionStatus !== updatedUser.subscriptionStatus) {
      const subscribedDiff = 
        (updatedUser.subscriptionStatus === 'Active' ? 1 : 0) - 
        (oldUser.subscriptionStatus === 'Active' ? 1 : 0);
      
      setDashboardStats(prev => ({
        ...prev,
        subscribedUsers: prev.subscribedUsers + subscribedDiff
      }));
    }
  };

  const deleteUser = (userId: string) => {
    const userToDelete = users.find(user => user.id === userId);
    
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    setTransactions(prevTransactions => 
      prevTransactions.filter(transaction => transaction.userId !== userId)
    );
    
    // Update dashboard stats
    if (userToDelete) {
      setDashboardStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        subscribedUsers: prev.subscribedUsers - (userToDelete.subscriptionStatus === 'Active' ? 1 : 0)
      }));
    }
  };

  const updateUserBalance = (userId: string, newBalance: number) => {
    const now = new Date().toISOString().split('T')[0];
    
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, balance: newBalance, lastTransactionDate: now } 
          : user
      )
    );
    
    // Add a new transaction
    const user = users.find(user => user.id === userId);
    if (user) {
      const balanceDiff = newBalance - user.balance;
      const newTransaction: Transaction = {
        id: `transaction-${userId}-${Date.now()}`,
        userId,
        amount: Math.abs(balanceDiff),
        type: balanceDiff >= 0 ? 'Credit' : 'Debit',
        date: now,
        description: balanceDiff >= 0 ? 'Balance increase' : 'Balance decrease'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const addEmailTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newTemplate: EmailTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    
    setEmailTemplates(prev => [...prev, newTemplate]);
  };

  const updateEmailTemplate = (updatedTemplate: EmailTemplate) => {
    const now = new Date().toISOString().split('T')[0];
    
    setEmailTemplates(prevTemplates => 
      prevTemplates.map(template => 
        template.id === updatedTemplate.id 
          ? { ...updatedTemplate, updatedAt: now } 
          : template
      )
    );
  };

  const deleteEmailTemplate = (templateId: string) => {
    setEmailTemplates(prevTemplates => 
      prevTemplates.filter(template => template.id !== templateId)
    );
  };

  return (
    <AppContext.Provider
      value={{
        users,
        transactions,
        emailTemplates,
        dashboardStats,
        registrationTrend,
        engagementMetrics,
        updateUser,
        deleteUser,
        updateUserBalance,
        addEmailTemplate,
        updateEmailTemplate,
        deleteEmailTemplate
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};