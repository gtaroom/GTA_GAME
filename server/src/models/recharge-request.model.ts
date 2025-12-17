import mongoose, { Document, Schema } from "mongoose";

export interface IRechargeRequest extends Document {
  userId: mongoose.Types.ObjectId;
  gameName: string;
  username: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  adminComment?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}

const rechargeRequestSchema = new Schema<IRechargeRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gameName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'failed'],
      default: 'pending',
      required: true,
      index: true,
    },
    adminComment: {
      type: String,
    },
    metadata: Schema.Types.Mixed,
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

// Indices for better query performance
rechargeRequestSchema.index({ createdAt: -1 });
rechargeRequestSchema.index({ userId: 1, createdAt: -1 });
rechargeRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IRechargeRequest>("RechargeRequest", rechargeRequestSchema); 