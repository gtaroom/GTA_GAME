import { Document, model, models, Schema, Types } from "mongoose";

export interface CouponSchemaIn extends Document {
  code: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  createdBy: Types.ObjectId;
  usedBy: Types.ObjectId[];
  description?: string;
}

const CouponSchema = new Schema<CouponSchemaIn>(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true,
      uppercase: true,
      trim: true 
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0 
    },
    startDate: { 
      type: Date, 
      required: true 
    },
    endDate: { 
      type: Date, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    usageLimit: { 
      type: Number, 
      required: true,
      min: 1 
    },
    usedCount: { 
      type: Number, 
      default: 0 
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    usedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    description: { 
      type: String 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Virtual for checking if coupon is expired
CouponSchema.virtual('isExpired').get(function() {
  const now = new Date();
  return now > this.endDate;
});

// Virtual for checking if coupon is valid
CouponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    this.usedCount < this.usageLimit
  );
});

// Method to validate coupon
CouponSchema.methods.validateCoupon = function(userId: Types.ObjectId) {
  if (!this.isValid) {
    return { valid: false, message: 'Coupon is not valid' };
  }

  if (this.usedBy.includes(userId)) {
    return { valid: false, message: 'You have already used this coupon' };
  }

  return { valid: true };
};

// Method to mark coupon as used
CouponSchema.methods.markAsUsed = function(userId: Types.ObjectId) {
  this.usedCount += 1;
  this.usedBy.push(userId);
  if (this.usedCount >= this.usageLimit) {
    this.isActive = false;
  }
  return this.save();
};

const CouponModel = models.Coupon || model<CouponSchemaIn>('Coupon', CouponSchema);
export default CouponModel; 