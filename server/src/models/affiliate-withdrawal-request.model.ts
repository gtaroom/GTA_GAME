import mongoose, { Document, Schema } from "mongoose";

export interface IAffiliateWithdrawalRequest extends Document {
  affiliateId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod?: string; // e.g., "PayPal", "Bank Transfer", "Crypto", etc.
  paymentDetails?: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    paypalEmail?: string;
    walletAddress?: string;
    notes?: string;
  };
  status: "pending" | "approved" | "rejected" | "paid";
  adminNotes?: string;
  rejectionReason?: string;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateWithdrawalRequestSchema = new Schema<IAffiliateWithdrawalRequest>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
    },
    paymentDetails: {
      accountNumber: String,
      accountName: String,
      bankName: String,
      paypalEmail: String,
      walletAddress: String,
      notes: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
      required: true,
      index: true,
    },
    adminNotes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
affiliateWithdrawalRequestSchema.index({ affiliateId: 1, createdAt: -1 });
affiliateWithdrawalRequestSchema.index({ status: 1, createdAt: -1 });
affiliateWithdrawalRequestSchema.index({ createdAt: -1 });

export default mongoose.model<IAffiliateWithdrawalRequest>(
  "AffiliateWithdrawalRequest",
  affiliateWithdrawalRequestSchema
);

