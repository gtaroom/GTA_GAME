import mongoose, { Document, Schema } from "mongoose";

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId | null; // User who referred (null for affiliate referrals)
  referredId: mongoose.Types.ObjectId; // User who was referred
  referralCode: string; // The referral code used
  status: "pending" | "qualified" | "rewarded"; // Status of the referral
  qualifiedAt?: Date; // When the referred user qualified (e.g., made $20+ purchase)
  rewardedAt?: Date; // When rewards were given
  referrerReward?: number; // Reward amount for referrer
  referredReward?: number; // Reward amount for referred user
  totalSpent?: number; // Total amount spent by referred user
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Can be null for affiliate referrals
      index: true,
    },
    referredId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // A user can only be referred once
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "qualified", "rewarded"],
      default: "pending",
      index: true,
    },
    qualifiedAt: {
      type: Date,
    },
    rewardedAt: {
      type: Date,
    },
    referrerReward: {
      type: Number,
      default: 0,
    },
    referredReward: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referralCode: 1, status: 1 });

export default mongoose.model<IReferral>("Referral", referralSchema);

