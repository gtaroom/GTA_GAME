/**
 * Notifications API Module
 * Handles all notification-related API requests
 */

import { http } from './http';
import type {
  NotificationListResponse,
  NotificationActionResponse,
} from '@/types/notification.types';

/**
 * Get all user notifications
 */
export async function getNotifications() {
  return http<NotificationListResponse>('/user/notifications', {
    method: 'GET',
    cache: 'no-store',
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  return http<NotificationActionResponse>('/user/notifications/read-all', {
    method: 'PUT',
  });
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return http<NotificationActionResponse>(`/user/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
}

/**
 * Delete all read notifications
 */
export async function deleteReadNotifications() {
  return http<NotificationActionResponse>('/user/notifications/read', {
    method: 'DELETE',
  });
}

/**
 * Delete a specific notification
 */
export async function deleteNotification(notificationId: string) {
  return http<NotificationActionResponse>(`/user/notifications/${notificationId}`, {
    method: 'DELETE',
  });
}

