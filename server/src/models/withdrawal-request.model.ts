import mongoose, { Document, Schema } from "mongoose";

export interface IWithdrawalRequest extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  walletAddress?: string; // For crypto withdrawals (Plisio)
  walletCurrency?: string; // For crypto withdrawals (Plisio)
  paymentGateway: 'soap' | 'plisio'| 'payouts' | 'goat';
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed' | 'refunded' | 'returned' | 'expired' | 'terminated';
  adminComment?: string;
  gameName?: string;
  username?: string;
  invoiceUrl?: string;
  gatewayInvoiceId?: string;
  gatewayTransactionId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  processedAt?: Date;
}

const withdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    walletAddress: {
      type: String,
      required: function(this: IWithdrawalRequest) {
        return this.paymentGateway === 'plisio';
      },
    },
    walletCurrency: {
      type: String,
    },
    gameName: {
      type: String,
    },
    username: {
      type: String,
    },
    paymentGateway: {
      type: String,
      enum: ['soap', 'plisio','payouts', 'goat'],
      required: true,
      default: 'soap',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processed', 'failed', 'refunded', 'returned', 'expired', 'terminated'],
      default: 'pending',
      required: true,
      index: true,
    },
    adminComment: {
      type: String,
    },
    metadata: Schema.Types.Mixed,
    invoiceUrl: {
      type: String,
    },
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
withdrawalRequestSchema.index({ createdAt: -1 });
withdrawalRequestSchema.index({ userId: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IWithdrawalRequest>("WithdrawalRequest", withdrawalRequestSchema); 