import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { ApiResponse } from '../utils/api-response';
import { getUserFromRequest } from '../utils/get-user';
import notificationService from '../services/notification.service';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/api-error';
import mongoose from 'mongoose';
import NotificationModel from '../models/notification.model';

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  const { unread } = req.query;
  
  logger.info('Fetching notifications', { userId, unreadOnly: !!unread });
  
  let notifications;
  if (unread === 'true') {
    notifications = await notificationService.getUnreadNotifications(userId.toString());
  } else {
    notifications = await notificationService.getAllNotifications(userId.toString());
  }
  
  return res.status(200).json(
    new ApiResponse(200, notifications, "Notifications retrieved successfully")
  );
});

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  const { id } = req.params;
  
  logger.info('Request to mark notification as read', { 
    userId: userId.toString(), 
    requestedId: id,
    paramId: req.params.id
  });
  
  const notification = await notificationService.markAsRead(id, userId.toString());
  
  if (!notification) {
    logger.warn('Notification not found for marking as read', { id, userId: userId.toString() });
    throw new ApiError(404, "Notification not found");
  }
  
  logger.info('Successfully marked notification as read via API', {
    requestedId: id,
    actualNotificationId: notification.notificationId,
    notificationDbId: notification._id.toString()
  });
  
  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

/**
 * Mark all notifications for a user as read
 */
export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  
  logger.info('Marking all notifications as read', { userId });
  
  const updatedCount = await notificationService.markAllAsRead(userId.toString());
  
  return res.status(200).json(
    new ApiResponse(200, { count: updatedCount }, "All notifications marked as read")
  );
});

/**
 * Delete all read notifications for a user
 */
export const deleteReadNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  
  logger.info('Deleting read notifications', { userId });
  
  const deletedCount = await notificationService.deleteReadNotifications(userId.toString());
  
  return res.status(200).json(
    new ApiResponse(200, { count: deletedCount }, "Read notifications deleted successfully")
  );
});

/**
 * Get a specific notification by ID
 */
export const getNotificationById = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  const { id } = req.params;
  
  logger.info('Request to get notification by ID', { 
    userId: userId.toString(), 
    requestedId: id 
  });
  
  // Use the service method to find the notification
  const notification = await notificationService.findNotificationById(id, userId.toString());
  
  if (!notification) {
    logger.warn('Notification not found', { id, userId: userId.toString() });
    throw new ApiError(404, "Notification not found");
  }
  
  logger.info('Found notification via API', {
    requestedId: id,
    foundId: notification._id.toString(),
    foundNotificationId: notification.notificationId
  });
  
  return res.status(200).json(
    new ApiResponse(200, notification, "Notification retrieved successfully")
  );
}); 