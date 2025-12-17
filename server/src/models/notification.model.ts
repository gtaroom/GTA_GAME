import mongoose, { Document, Schema } from "mongoose";
import { BaseNotification } from "../types/socket.types";

// Omit 'id' from BaseNotification to avoid conflict with Document's _id
export interface INotification extends Document, Omit<BaseNotification, 'id'> {
  userId: mongoose.Types.ObjectId;
  // Store original notification id in notificationId to avoid conflict with mongodb _id
  notificationId: string;
  message?: string;
  metadata?: any;
  expiresAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    notificationId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    type: {
      type: String,
      required: true,
      index: true
    },
    message: {
      type: String
    },
    metadata: {
      type: Schema.Types.Mixed
    },
    expiresAt: {
      type: Date,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1 });

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { expiresAt: { $exists: true } }
});

const NotificationModel = mongoose.models.Notification || 
  mongoose.model<INotification>("Notification", notificationSchema);

export default NotificationModel; 