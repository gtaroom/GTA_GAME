import { model, Schema, Document, models } from "mongoose";

export interface OTPSchemaIn extends Document {
  _id: string;
  phoneNumber: string;
  otpCode: string;
  purpose: 'PHONE_VERIFICATION';
  isUsed: boolean;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OTPSchema = new Schema<OTPSchemaIn>(
  {
    phoneNumber: { 
      type: String, 
      required: true,
      index: true 
    },
    otpCode: { 
      type: String, 
      required: true 
    },
    purpose: { 
      type: String, 
      required: true,
      enum: ['PHONE_VERIFICATION'],
      default: 'PHONE_VERIFICATION'
    },
    isUsed: { 
      type: Boolean, 
      default: false 
    },
    expiresAt: { 
      type: Date, 
      required: true,
      index: true 
    },
    attempts: { 
      type: Number, 
      default: 0 
    },
    maxAttempts: { 
      type: Number, 
      default: 3 
    }
  },
  { 
    timestamps: true 
  }
);

// Index for automatic cleanup of expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for finding active OTPs
OTPSchema.index({ phoneNumber: 1, purpose: 1, isUsed: 1, expiresAt: 1 });

const OTPModel = models.OTP || model<OTPSchemaIn>("OTP", OTPSchema);
export default OTPModel; 