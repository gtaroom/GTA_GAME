import mongoose, { Document, Schema } from "mongoose";
import { SpinRewardType, SpinRewardRarity } from "./spin-wheel.model";

// Trigger types for spin wheel
export enum SpinTriggerType {
  FIRST_TIME = "first_time", // Available to new users on first visit
  RANDOM = "random", // Randomly triggered
  THRESHOLD = "threshold", // Triggered when user reaches spending threshold
  MANUAL = "manual", // Manually triggered by admin
}

// Spin wheel configuration interface
export interface ISpinWheelConfig extends Document {
  isActive: boolean;
  rewards: ISpinRewardConfig[];
  triggers: {
    firstTime: {
      enabled: boolean;
      spinsPerUser: number; // How many spins a new user gets
    };
    random: {
      enabled: boolean;
      probability: number; // Probability per login/action (0-100)
      cooldownHours: number; // Hours between random triggers
    };
    threshold: {
      enabled: boolean;
      thresholds: IThresholdConfig[]; // Multiple thresholds can be set
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Individual reward configuration (admin-configurable)
export interface ISpinRewardConfig {
  id: number;
  amount: number;
  type: SpinRewardType;
  rarity: SpinRewardRarity;
  probability: number; // Probability weight (higher = more likely)
  description: string;
  isActive: boolean;
}

// Threshold configuration
export interface IThresholdConfig {
  id: string;
  spendingAmount: number; // Amount in dollars user needs to spend
  spinsAwarded: number; // Number of spins awarded when threshold is reached
  isActive: boolean;
}

const spinRewardConfigSchema = new Schema<ISpinRewardConfig>(
  {
    id: { type: Number, required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: Object.values(SpinRewardType), required: true },
    rarity: { type: String, enum: Object.values(SpinRewardRarity), required: true },
    probability: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const thresholdConfigSchema = new Schema<IThresholdConfig>(
  {
    id: { type: String, required: true },
    spendingAmount: { type: Number, required: true, min: 0 },
    spinsAwarded: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const spinWheelConfigSchema = new Schema<ISpinWheelConfig>(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    rewards: {
      type: [spinRewardConfigSchema],
      default: [],
    },
    triggers: {
      firstTime: {
        enabled: { type: Boolean, default: true },
        spinsPerUser: { type: Number, default: 1, min: 0 },
      },
      random: {
        enabled: { type: Boolean, default: false },
        probability: { type: Number, default: 0, min: 0, max: 100 },
        cooldownHours: { type: Number, default: 24, min: 0 },
      },
      threshold: {
        enabled: { type: Boolean, default: false },
        thresholds: { type: [thresholdConfigSchema], default: [] },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one configuration document exists
spinWheelConfigSchema.index({}, { unique: true });

export default mongoose.model<ISpinWheelConfig>("SpinWheelConfig", spinWheelConfigSchema);

