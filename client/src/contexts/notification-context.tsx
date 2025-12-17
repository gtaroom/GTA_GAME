'use client';

import { disconnectSocket, useSocket } from '@/hooks/useSocket';
import {
    deleteNotification as deleteNotificationApi,
    deleteReadNotifications as deleteReadApi,
    getNotifications,
    markAllNotificationsAsRead as markAllAsReadApi,
    markNotificationAsRead as markAsReadApi,
} from '@/lib/api/notifications';
import type { Notification } from '@/types/notification.types';
import { SocketEvents } from '@/types/notification.types';
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { useAuth } from './auth-context';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    activePopup: Notification | null;
    isLoading: boolean;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    dismissNotification: (notificationId: string) => void;
    clearReadNotifications: () => void;
    closePopup: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);
const NotificationBadgeContext = createContext<boolean>(true);

export function NotificationProvider({
    children,
    showBadge = true,
}: {
    children: ReactNode;
    showBadge?: boolean;
}) {
    const { user, isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activePopup, setActivePopup] = useState<Notification | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const userId = user?._id || '';
    const role = user?.role || 'user';

    const { subscribe } = useSocket({ userId, role });

    // Fetch notifications from API (ONCE on initial load only)
    useEffect(() => {
        if (!isLoggedIn || !userId) {
            console.log(
                '[Notification] 🚪 User logged out, clearing notifications'
            );
            setNotifications([]);
            setUnreadCount(0);
            // Disconnect socket when user logs out
            disconnectSocket();
            return;
        }

        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const response = await getNotifications();
                if (response.success) {
                    // Process notifications to ensure consistent format
                    const processedNotifications = response.data.map(
                        notification => ({
                            ...notification,
                            timestamp: new Date(notification.timestamp),
                        })
                    );
                    setNotifications(processedNotifications);
                    setUnreadCount(
                        response.unreadCount ||
                            processedNotifications.filter(n => !n.read).length
                    );
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Fetch only ONCE on mount
        fetchNotifications();

        // No polling! Socket handles real-time updates
    }, [isLoggedIn, userId]);

    // Helper to check if notification already exists
    const isNotificationDuplicate = (
        newNotification: Notification,
        existingNotifications: Notification[]
    ) => {
        return existingNotifications.some(
            n =>
                n.id === newNotification.id ||
                n._id === newNotification._id ||
                n.notificationId === newNotification.id ||
                n.id === newNotification.notificationId
        );
    };

    // Helper to get notification ID
    const getNotificationId = (notification: Notification): string => {
        return (
            notification._id ||
            notification.id ||
            notification.notificationId ||
            ''
        );
    };

    // Subscribe to socket events for real-time notifications
    useEffect(() => {
        if (!isLoggedIn || !userId) {
            console.log(
                '[Notification] ⏭️ Skipping - user not logged in or no userId'
            );
            return;
        }

        console.log(
            '[Notification] 🔔 Setting up socket subscriptions for user:',
            userId
        );

        const handleNewNotification = (data: any) => {
            console.log('[Notification] 📨 Received:', data.type);
            console.log(
                '[Notification] 📋 Full data:',
                JSON.stringify(data, null, 2)
            );

            // Special logging for game_account_approved
            if (data.type === 'game_account_approved') {
                console.log('[Notification] 🎮 GAME ACCOUNT DATA:');
                console.log('  - gameName:', data.gameName);
                console.log('  - generatedUsername:', data.generatedUsername);
                console.log('  - generatedPassword:', data.generatedPassword);
                console.log('  - All keys:', Object.keys(data));
            }
            const extendedData: Notification = {
                ...data,
                _id: data.id,
                notificationId: data.id,
                timestamp: new Date(data.timestamp),
            };

            setNotifications(prev => {
                if (isNotificationDuplicate(extendedData, prev)) {
                    console.log(
                        '[Notification] ⏭️ Duplicate skipped:',
                        data.id
                    );
                    return prev;
                }

                console.log('[Notification] ✅ Added:', data.type);
                return [extendedData, ...prev];
            });

            // Show popup for important notifications
            if (
                data.type === 'deposit_success' ||
                data.type === 'game_account_approved'
            ) {
                console.log('[Notification] 🎉 Showing popup for:', data.type);
                setActivePopup(extendedData);
            }

            // Trigger game account status refetch on approval/rejection
            if (
                data.type === 'game_account_approved' ||
                data.type === 'game_account_rejected'
            ) {
                const gameId = data.gameId;
                if (typeof window !== 'undefined' && gameId) {
                    try {
                        const ev = new CustomEvent(
                            'trigger-check-game-account',
                            { detail: { gameId } }
                        );
                        window.dispatchEvent(ev);
                        console.log(
                            '[Notification] 🔄 Dispatched trigger-check-game-account for',
                            gameId
                        );
                    } catch (err) {
                        console.warn(
                            '[Notification] Failed to dispatch game account refresh event',
                            err
                        );
                    }
                }
            }

            // Update unread count
            setUnreadCount(prev => prev + 1);
        };

        // Subscribe to user-facing events only
        console.log('[Notification] 📡 Subscribing to 6 events...');
        const unsubscribers = [
            subscribe(SocketEvents.DEPOSIT_SUCCESS, handleNewNotification),
            subscribe(
                SocketEvents.RECHARGE_STATUS_UPDATED,
                handleNewNotification
            ),
            subscribe(
                SocketEvents.WITHDRAWAL_STATUS_UPDATED,
                handleNewNotification
            ),
            subscribe(SocketEvents.PAYMENT_RECEIVED, handleNewNotification),
            subscribe(
                SocketEvents.GAME_ACCOUNT_APPROVED,
                handleNewNotification
            ),
            subscribe(
                SocketEvents.GAME_ACCOUNT_REJECTED,
                handleNewNotification
            ),
        ];
        console.log('[Notification] ✅ Subscriptions active');

        return () => {
            console.log('[Notification] 🧹 Cleaning up subscriptions');
            unsubscribers.forEach(unsub => unsub());
        };
    }, [isLoggedIn, userId, subscribe]);

    // Auto-dismiss popup after 10 seconds
    useEffect(() => {
        if (activePopup) {
            const timer = setTimeout(() => {
                setActivePopup(null);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [activePopup]);

    // Mark a notification as read
    const markAsRead = async (notificationId: string) => {
        // Optimistically update UI
        setNotifications(prev =>
            prev.map(notification =>
                getNotificationId(notification) === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );

        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await markAsReadApi(notificationId);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Revert on error
            setNotifications(prev =>
                prev.map(notification =>
                    getNotificationId(notification) === notificationId
                        ? { ...notification, read: false }
                        : notification
                )
            );
            setUnreadCount(prev => prev + 1);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        const previousNotifications = [...notifications];
        const previousUnreadCount = unreadCount;

        // Optimistically update UI
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);

        try {
            await markAllAsReadApi();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            // Revert on error
            setNotifications(previousNotifications);
            setUnreadCount(previousUnreadCount);
        }
    };

    // Dismiss/Delete a notification
    const dismissNotification = async (notificationId: string) => {
        // Find the notification to check if it's unread
        const notificationToDelete = notifications.find(
            n => getNotificationId(n) === notificationId
        );
        const wasUnread = notificationToDelete ? !notificationToDelete.read : false;

        // Optimistically update UI
        setNotifications(prev =>
            prev.filter(
                notification =>
                    getNotificationId(notification) !== notificationId
            )
        );

        // Update unread count if the deleted notification was unread
        if (wasUnread) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        try {
            await deleteNotificationApi(notificationId);
        } catch (error) {
            console.error('Failed to delete notification:', error);
            // Revert on error - restore the notification
            if (notificationToDelete) {
                setNotifications(prev => [...prev, notificationToDelete]);
                if (wasUnread) {
                    setUnreadCount(prev => prev + 1);
                }
            }
        }
    };

    // Clear all read notifications
    const clearReadNotifications = async () => {
        const previousNotifications = [...notifications];

        // Optimistically update UI
        setNotifications(prev => prev.filter(n => !n.read));

        try {
            await deleteReadApi();
        } catch (error) {
            console.error('Failed to clear read notifications:', error);
            // Revert on error
            setNotifications(previousNotifications);
        }
    };

    // Close popup
    const closePopup = () => {
        if (activePopup) {
            markAsRead(getNotificationId(activePopup));
            setActivePopup(null);
        }
    };

    const value = {
        notifications,
        unreadCount,
        activePopup,
        isLoading,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearReadNotifications,
        closePopup,
    };

    return (
        <NotificationContext.Provider value={value}>
            <NotificationBadgeContext.Provider value={showBadge}>
                {children}
            </NotificationBadgeContext.Provider>
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            'useNotifications must be used within a NotificationProvider'
        );
    }
    return context;
}

export function useNotificationBadge() {
    const context = useContext(NotificationBadgeContext);
    if (context === undefined) {
        throw new Error(
            'useNotificationBadge must be used within a NotificationProvider'
        );
    }
    return context;
}
