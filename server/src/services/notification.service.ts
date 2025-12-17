import { Notification } from '../types/socket.types';
import NotificationModel, { INotification } from '../models/notification.model';
import socketService from './socket.service';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import UserModel from '../models/user.model';
import { rolesEnum } from '../constants';

class NotificationService {
  /**
   * Send a notification to a user, both via socket and persistent storage
   */
  async sendNotification(userId: string, event: string, notification: Notification): Promise<void> {
    try {
      logger.info('Sending notification', { userId, event, notificationType: notification.type });
      
      // Special case for admin notifications
      if (userId === 'admin') {
        await this.sendAdminNotification(event, notification);
        return;
      }
      
      // Save notification to database first
      await this.saveNotification(userId, notification);
      
      // Then try to send via socket
      socketService.sendToUser(userId, event, notification);
    } catch (error) {
      logger.error('Failed to send notification', { error, userId, event });
    }
  }

  /**
   * Send a notification to all admin users
   */
  async sendAdminNotification(event: string, notification: Notification): Promise<void> {
    try {
      // Find all admin users
      const adminUsers = await UserModel.find({ role: rolesEnum.ADMIN }).select('_id').lean();
      
      if (!adminUsers || adminUsers.length === 0) {
        logger.warn('No admin users found to send notification');
        return;
      }
      
      // Save notification for each admin
      const savePromises = adminUsers.map(admin => 
        this.saveNotification(admin._id.toString(), notification)
      );
      
      await Promise.all(savePromises);
      
      // Send socket notification to all admins
      socketService.sendToAdmins(event, notification);
      
      logger.info('Admin notification sent and saved', { 
        event, 
        notificationType: notification.type,
        adminCount: adminUsers.length
      });
    } catch (error) {
      logger.error('Failed to send admin notification', { error, event });
    }
  }

  /**
   * Save a notification to the database for persistence
   */
  async saveNotification(userId: string, notification: Notification): Promise<INotification> {
    try {
      logger.debug('Saving notification to database', { userId, notificationType: notification.type });
      
      const notificationDoc = await NotificationModel.create({
        notificationId: notification.id,
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: notification.timestamp,
        read: notification.read,
        type: notification.type,
        metadata: notification,
        // Set expiration date to 30 days from now
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      logger.debug('Notification saved successfully', { 
        notificationId: notificationDoc._id,
        userId 
      });
      
      return notificationDoc;
    } catch (error) {
      logger.error('Failed to save notification', { error, userId, notification });
      throw error;
    }
  }

  /**
   * Get all unread notifications for a user
   */
  async getUnreadNotifications(userId: string): Promise<INotification[]> {
    try {
      return await NotificationModel.find({ 
        userId: new mongoose.Types.ObjectId(userId),
        read: false
      }).sort({ timestamp: -1 }).lean();
    } catch (error) {
      logger.error('Failed to get unread notifications', { error, userId });
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   */
  async getAllNotifications(userId: string): Promise<INotification[]> {
    try {
      return await NotificationModel.find({ 
        userId: new mongoose.Types.ObjectId(userId)
      }).sort({ timestamp: -1 }).lean();
    } catch (error) {
      logger.error('Failed to get all notifications', { error, userId });
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param id - Can be either MongoDB _id or the notification's notificationId
   * @param userId - User ID to ensure the notification belongs to this user
   */
  async markAsRead(id: string, userId: string): Promise<INotification | null> {
    try {
      logger.info('Attempting to mark notification as read', { id, userId });
      
      // First, find the notification
      const notification = await this.findNotificationById(id, userId);
      
      if (!notification) {
        logger.warn('No notification found to mark as read', { id, userId });
        return null;
      }
      
      logger.info('Found notification to mark as read', {
        id,
        foundId: notification._id.toString(),
        foundNotificationId: notification.notificationId
      });
      
      // Now update it
      const updatedNotification = await NotificationModel.findByIdAndUpdate(
        notification._id,
        { 
          read: true,
          'metadata.read': true 
        },
        { new: true }
      );
      
      if (updatedNotification) {
        logger.info('Successfully marked notification as read', { 
          id,
          notificationId: updatedNotification._id.toString() 
        });
      }
      
      return updatedNotification;
    } catch (error) {
      logger.error('Failed to mark notification as read', { error, id, userId });
      throw error;
    }
  }

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await NotificationModel.updateMany(
        { userId: new mongoose.Types.ObjectId(userId), read: false },
        { 
          read: true,
          // Also update the read status in the metadata object
          'metadata.read': true
        }
      );
      return result.modifiedCount;
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { error, userId });
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const result = await NotificationModel.deleteOne({ _id: notificationId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Failed to delete notification', { error, notificationId });
      throw error;
    }
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteReadNotifications(userId: string): Promise<number> {
    try {
      const result = await NotificationModel.deleteMany({ 
        userId: new mongoose.Types.ObjectId(userId),
        read: true 
      });
      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to delete read notifications', { error, userId });
      throw error;
    }
  }

  /**
   * Find a notification by ID (either MongoDB _id or notificationId)
   * @param id - Can be either MongoDB _id or the notification's notificationId
   * @param userId - User ID to ensure the notification belongs to this user
   */
  async findNotificationById(id: string, userId: string): Promise<INotification | null> {
    try {
      logger.info('Finding notification by ID', { id, userId });
      
      // Build the query conditions
      const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
      
      // Build a simpler query without empty objects that might cause issues
      let query;
      
      if (isValidObjectId) {
        // If it's a valid ObjectId, try to match by _id or notificationId
        query = {
          userId: new mongoose.Types.ObjectId(userId),
          $or: [
            { _id: new mongoose.Types.ObjectId(id) },
            { notificationId: id }
          ]
        };
      } else {
        // If it's not a valid ObjectId, only try to match by notificationId
        query = {
          userId: new mongoose.Types.ObjectId(userId),
          notificationId: id
        };
      }

      logger.debug('Using query to find notification', { query });
      
      const notification = await NotificationModel.findOne(query);
      
      if (notification) {
        logger.info('Found notification by ID', {
          id,
          foundId: notification._id.toString(),
          foundNotificationId: notification.notificationId
        });
      } else {
        logger.warn('No notification found with the provided ID', { id, userId });
      }
      
      return notification;
    } catch (error) {
      logger.error('Failed to find notification by ID', { error, id, userId });
      throw error;
    }
  }
}

export default new NotificationService(); 