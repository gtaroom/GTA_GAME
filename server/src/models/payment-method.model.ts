import mongoose, { Document, Schema } from "mongoose";

export interface IPaymentMethod extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'bank' | 'skrill' | 'crypto' | 'soap' | 'goat' | 'centryos';
  isDefault: boolean;
  status: 'active' | 'pending' | 'disabled';
  details: {
    // Bank account details
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    routingNumber?: string;
    iban?: string;
    swiftCode?: string;
    // Skrill details
    skrillEmail?: string;
    skrillAccountId?: string;
    // Crypto details
    cryptoAddress?: string;
    cryptoNetwork?: string;
    // Soap details
    soapAccountId?: string;
    // Goat details
    goatAccountId?: string;
    // CentryOS details
    centryosExternalId?: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ['bank', 'skrill', 'crypto','soap', 'goat', 'centryos'],
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'disabled'],
      default: 'pending',
    },
    details: {
      bankName: String,
      accountNumber: String,
      accountHolderName: String,
      routingNumber: String,
      iban: String,
      swiftCode: String,
      skrillEmail: String,
      skrillAccountId: String,
      soapAccountId: String,
      goatAccountId: String,
      centryosExternalId: String,
      cryptoAddress: String,
      cryptoNetwork: String,
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
paymentMethodSchema.index({ userId: 1, type: 1 });
paymentMethodSchema.index({ userId: 1, isDefault: 1 });
paymentMethodSchema.index({ status: 1 });

export default mongoose.model<IPaymentMethod>("PaymentMethod", paymentMethodSchema); 