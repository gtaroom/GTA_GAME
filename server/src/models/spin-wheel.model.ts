import mongoose, { Document, Schema } from "mongoose";

// Spin wheel reward types
export enum SpinRewardType {
  GC = "GC", // Gold Coins
  SC = "SC", // Silver Coins
}

// Spin wheel reward rarity levels
export enum SpinRewardRarity {
  COMMON = "common",
  UNCOMMON = "uncommon", 
  RARE = "rare",
  VERY_RARE = "very_rare",
  ULTRA_RARE = "ultra_rare",
  TOP_REWARD = "top_reward"
}

// Individual spin wheel reward configuration
export interface ISpinReward {
  id: number;
  amount: number;
  type: SpinRewardType;
  rarity: SpinRewardRarity;
  probability: number; // Probability weight (higher = more likely)
  description: string;
}

// Spin wheel configuration
export const SPIN_WHEEL_REWARDS: ISpinReward[] = [
  { id: 1, amount: 1000, type: SpinRewardType.GC, rarity: SpinRewardRarity.COMMON, probability: 25, description: "Gameplay-only bonus" },
  { id: 2, amount: 2500, type: SpinRewardType.GC, rarity: SpinRewardRarity.COMMON, probability: 20, description: "Gameplay-only bonus" },
  { id: 3, amount: 5, type: SpinRewardType.SC, rarity: SpinRewardRarity.COMMON, probability: 15, description: "Common reward" },
  { id: 4, amount: 5000, type: SpinRewardType.GC, rarity: SpinRewardRarity.UNCOMMON, probability: 12, description: "Uncommon reward" },
  { id: 5, amount: 10, type: SpinRewardType.SC, rarity: SpinRewardRarity.UNCOMMON, probability: 10, description: "Uncommon reward" },
  { id: 6, amount: 10000, type: SpinRewardType.GC, rarity: SpinRewardRarity.RARE, probability: 8, description: "Rare reward" },
  { id: 7, amount: 15, type: SpinRewardType.SC, rarity: SpinRewardRarity.RARE, probability: 6, description: "Rare reward" },
  { id: 8, amount: 15000, type: SpinRewardType.GC, rarity: SpinRewardRarity.VERY_RARE, probability: 2.5, description: "Very rare reward" },
  { id: 9, amount: 20000, type: SpinRewardType.GC, rarity: SpinRewardRarity.VERY_RARE, probability: 1.5, description: "Very rare reward" },
  { id: 10, amount: 5500, type: SpinRewardType.GC, rarity: SpinRewardRarity.ULTRA_RARE, probability: 0.8, description: "Ultra rare reward" },
  { id: 11, amount: 25, type: SpinRewardType.SC, rarity: SpinRewardRarity.ULTRA_RARE, probability: 0.2, description: "Ultra rare reward" },
  { id: 12, amount: 50, type: SpinRewardType.SC, rarity: SpinRewardRarity.TOP_REWARD, probability: 0.01, description: "Top reward (extremely rare)" },
];

// Spin wheel result interface
export interface ISpinResult {
  rewardId: number;
  amount: number;
  type: SpinRewardType;
  rarity: SpinRewardRarity;
  description: string;
  timestamp: Date;
  spinId: string; // Unique identifier for this spin
}

// Spin wheel usage tracking
export interface ISpinWheelUsage extends Document {
  userId: mongoose.Types.ObjectId;
  spinId: string;
  rewardId: number;
  amount: number;
  type: SpinRewardType;
  rarity: SpinRewardRarity;
  description: string;
  spunAt: Date; // When the spin was performed
  claimedAt?: Date; // When the reward was claimed (null if not claimed yet)
  ipAddress?: string;
  userAgent?: string;
}

const spinWheelUsageSchema = new Schema<ISpinWheelUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    spinId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    rewardId: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(SpinRewardType),
      required: true,
    },
    rarity: {
      type: String,
      enum: Object.values(SpinRewardRarity),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    spunAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    claimedAt: {
      type: Date,
      default: null,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
spinWheelUsageSchema.index({ userId: 1, spunAt: -1 });
spinWheelUsageSchema.index({ spinId: 1 }, { unique: true });
spinWheelUsageSchema.index({ rarity: 1 });
spinWheelUsageSchema.index({ claimedAt: 1 });

export default mongoose.model<ISpinWheelUsage>("SpinWheelUsage", spinWheelUsageSchema);
