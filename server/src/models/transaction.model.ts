import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  type: string;
  amount: number;
  currency: string;
  status: string;
  paymentGateway?: 'plisio' | 'stripe' | 'paypal' | 'crypto' | 'soap' | 'nowpayments' | 'payouts' | 'goat' | 'centryos';
  gatewayTransactionId?: string;
  gatewayInvoiceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      enum: ['plisio', 'stripe', 'paypal', 'crypto','soap','nowpayments','payouts','goat','centryos'],
    },
    gatewayTransactionId: String,
    gatewayInvoiceId: String,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
transactionSchema.index({ userId: 1, type: 1,status:1, createdAt: -1 });


export default mongoose.model<ITransaction>("Transaction", transactionSchema); 