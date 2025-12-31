import mongoose, { Document, Schema } from "mongoose";
import { SpinTriggerType } from "./spin-wheel-config.model";

// User spin eligibility tracking
export interface ISpinWheelEligibility extends Document {
  userId: mongoose.Types.ObjectId;
  // First-time spin tracking
  hasUsedFirstTimeSpin: boolean;
  firstTimeSpinsRemaining: number;
  // Random trigger tracking
  lastRandomTriggerCheck?: Date;
  lastRandomSpinDate?: Date;
  // Threshold tracking
  thresholdSpinsEarned: IThresholdSpinEarned[];
  totalSpinsAvailable: number; // Total spins currently available
  createdAt: Date;
  updatedAt: Date;
}

// Track which thresholds have been reached and spins earned
export interface IThresholdSpinEarned {
  thresholdId: string;
  spendingAmount: number;
  spinsAwarded: number;
  reachedAt: Date;
  spinsUsed: number; // How many spins from this threshold have been used
}

const thresholdSpinEarnedSchema = new Schema<IThresholdSpinEarned>(
  {
    thresholdId: { type: String, required: true },
    spendingAmount: { type: Number, required: true },
    spinsAwarded: { type: Number, required: true },
    reachedAt: { type: Date, required: true },
    spinsUsed: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const spinWheelEligibilitySchema = new Schema<ISpinWheelEligibility>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    hasUsedFirstTimeSpin: {
      type: Boolean,
      default: false,
    },
    firstTimeSpinsRemaining: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRandomTriggerCheck: {
      type: Date,
    },
    lastRandomSpinDate: {
      type: Date,
    },
    thresholdSpinsEarned: {
      type: [thresholdSpinEarnedSchema],
      default: [],
    },
    totalSpinsAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
spinWheelEligibilitySchema.index({ userId: 1 });
spinWheelEligibilitySchema.index({ totalSpinsAvailable: 1 });

export default mongoose.model<ISpinWheelEligibility>("SpinWheelEligibility", spinWheelEligibilitySchema);

