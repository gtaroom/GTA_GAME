import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Notification, SocketEvents } from '../types/socket.types';


interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userId: string;
  role: string;
  permissions?: any;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  userId,
  role
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { subscribe } = useSocket({ userId, role });

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark a notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Dismiss a notification
  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Subscribe to socket events
  useEffect(() => {
    if (!userId) return;

    // Handle withdrawal requests (admin only)
    const withdrawalRequestUnsub = subscribe<Notification>(
      SocketEvents.WITHDRAWAL_REQUEST, 
      (data) => {
        setNotifications(prev => [data, ...prev]);
      }
    );
    const rechargeRequestUnsub = subscribe<Notification>(
      SocketEvents.RECHARGE_REQUEST, 
      (data) => {
        setNotifications(prev => [data, ...prev]);
      }
    );

    const rechargeStatusUnsub = subscribe<Notification>(
      SocketEvents.RECHARGE_STATUS_UPDATED, 
      (data) => {
        setNotifications(prev => [data, ...prev]);
      }
    );
    // Handle withdrawal status updates (user notifications)
    const withdrawalStatusUnsub = subscribe<Notification>(
      SocketEvents.WITHDRAWAL_STATUS_UPDATED, 
      (data) => {
        setNotifications(prev => [data, ...prev]);
      }
    );

        const gameAccRequest = subscribe<Notification>(
      SocketEvents.GAME_ACCOUNT_REQUEST, 
      (data) => {
        setNotifications(prev => [data, ...prev]);
      }
    );

    // Handle payment received notifications
    const paymentReceivedUnsub = subscribe<Notification>(
      SocketEvents.PAYMENT_RECEIVED, 
      (data) => {
        setNotifications(prev => [data, ...prev]);
      }
    );

    // Cleanup subscriptions
    return () => {
      withdrawalRequestUnsub();
      withdrawalStatusUnsub();
      rechargeRequestUnsub();
      rechargeStatusUnsub();
      paymentReceivedUnsub();
      gameAccRequest()
    };
  }, [userId, subscribe]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 