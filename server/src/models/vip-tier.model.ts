import mongoose, { Document, Schema } from "mongoose";

// Define VIP tier levels and their requirements
export enum VipTierLevel {
  NONE = "none",
  IRON = "iron",
  BRONZE = "bronze",
  SILVER = "silver",
  GOLD = "gold",
  PLATINUM = "platinum",
  ONYX = "onyx",
  SAPPHIRE = "sapphire",
  RUBY = "ruby",
  EMERALD = "emerald",
}

// VIP tier configuration
export const VIP_TIER_CONFIG = {
  [VipTierLevel.NONE]: {
    name: "Standard",
    minSpend: 0,
    bonusMultiplier: 1,
    birthdayBonus: 0,
    scRedemptionLimit: 350,
    drawingEntry: false,
    surpriseDrops: false,
    bonusSpins: 0,
    bonusSpinFrequencyDays: 0,
  },
  [VipTierLevel.IRON]: {
    name: "Iron Tier",
    minSpend: 500,
    bonusMultiplier: 2,
    birthdayBonus: 500,
    scRedemptionLimit: 350,
    drawingEntry: false,
    surpriseDrops: false,
    bonusSpins: 0,
    bonusSpinFrequencyDays: 0,
  },
  [VipTierLevel.BRONZE]: {
    name: "Bronze Tier",
    minSpend: 800,
    bonusMultiplier: 2,
    birthdayBonus: 500,
    scRedemptionLimit: 350,
    drawingEntry: false,
    surpriseDrops: false,
    bonusSpins: 0,
    bonusSpinFrequencyDays: 0,
  },
  [VipTierLevel.SILVER]: {
    name: "Silver Tier",
    minSpend: 1100,
    bonusMultiplier: 2,
    birthdayBonus: 500,
    scRedemptionLimit: 350,
    drawingEntry: true,
    surpriseDrops: false,
    bonusSpins: 0,
    bonusSpinFrequencyDays: 0,
  },
  [VipTierLevel.GOLD]: {
    name: "Gold Tier",
    minSpend: 1400,
    bonusMultiplier: 2,
    birthdayBonus: 1000,
    scRedemptionLimit: 400,
    drawingEntry: true,
    surpriseDrops: true,
    bonusSpins: 0,
    bonusSpinFrequencyDays: 0,
  },
  [VipTierLevel.PLATINUM]: {
    name: "Platinum Tier",
    minSpend: 1600,
    bonusMultiplier: 2,
    birthdayBonus: 1000,
    scRedemptionLimit: 400,
    drawingEntry: true,
    surpriseDrops: true,
    bonusSpins: 2,
    bonusSpinFrequencyDays: 14,
  },
  [VipTierLevel.ONYX]: {
    name: "Onyx Tier",
    minSpend: 1800,
    bonusMultiplier: 2,
    birthdayBonus: 1000,
    scRedemptionLimit: 400,
    drawingEntry: true,
    surpriseDrops: true,
    bonusSpins: 2,
    bonusSpinFrequencyDays: 14,
  },
  [VipTierLevel.SAPPHIRE]: {
    name: "Sapphire Tier",
    minSpend: 2000,
    bonusMultiplier: 2,
    birthdayBonus: 1000,
    scRedemptionLimit: 400,
    drawingEntry: true,
    surpriseDrops: true,
    bonusSpins: 2,
    bonusSpinFrequencyDays: 14,
  },
  [VipTierLevel.RUBY]: {
    name: "Ruby Tier",
    minSpend: 2300,
    bonusMultiplier: 2,
    birthdayBonus: 1500,
    scRedemptionLimit: 500,
    drawingEntry: true,
    surpriseDrops: true,
    bonusSpins: 4,
    bonusSpinFrequencyDays: 14,
  },
  [VipTierLevel.EMERALD]: {
    name: "Emerald Tier",
    minSpend: 2500,
    bonusMultiplier: 2,
    birthdayBonus: 1500,
    scRedemptionLimit: 500,
    drawingEntry: true,
    surpriseDrops: true,
    bonusSpins: 4,
    bonusSpinFrequencyDays: 14,
  },
};

export interface IVipTier extends Document {
  userId: mongoose.Types.ObjectId;
  currentTier: VipTierLevel;
  isVipConfirmed: boolean; // VIP status - automatic, only set false to suspend
  last7DaysSpending: number;
  totalLifetimeSpending: number;

  // VIP Period Management (14-day lock)
  vipPeriodStartDate?: Date;
  vipPeriodEndDate?: Date;

  tierHistory: Array<{
    tier: VipTierLevel;
    achievedAt: Date;
    spendingAtTime: number;
  }>;

  // Birthday Bonus
  birthdayBonusClaimed: boolean;
  lastBirthdayBonusDate?: Date;
  birthdayBonusHistory: Array<{
    claimedDate: Date;
    birthdayUsed: string; // Store the birthday that was used for the claim
    bonusAmount: number;
  }>;

  // Period-Based Bonus Spins
  bonusSpinsRemaining: number;
  bonusSpinsGrantedAt?: Date;
  bonusSpinsExpireAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const vipTierSchema = new Schema<IVipTier>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    currentTier: {
      type: String,
      enum: Object.values(VipTierLevel),
      default: VipTierLevel.NONE,
    },
    isVipConfirmed: {
      type: Boolean,
      default: true,
      comment:
        "VIP status is automatically enabled. Only set to false to suspend VIP privileges (fraud/abuse cases)",
    },
    last7DaysSpending: {
      type: Number,
      default: 0,
      comment: "Total spending in the last 7 days (USD)",
    },
    totalLifetimeSpending: {
      type: Number,
      default: 0,
      comment: "Total lifetime spending (USD)",
    },
    vipPeriodStartDate: {
      type: Date,
      comment: "When current 14-day VIP period started",
    },
    vipPeriodEndDate: {
      type: Date,
      comment: "When current 14-day VIP period ends",
    },
    tierHistory: [
      {
        tier: {
          type: String,
          enum: Object.values(VipTierLevel),
        },
        achievedAt: {
          type: Date,
          default: Date.now,
        },
        spendingAtTime: {
          type: Number,
          default: 0,
        },
      },
    ],
    birthdayBonusClaimed: {
      type: Boolean,
      default: false,
    },
    lastBirthdayBonusDate: {
      type: Date,
    },
    birthdayBonusHistory: [
      {
        claimedDate: {
          type: Date,
          required: true,
        },
        birthdayUsed: {
          type: String,
          required: true,
          comment:
            "The birthday that was used for this claim (YYYY-MM-DD format)",
        },
        bonusAmount: {
          type: Number,
          required: true,
        },
      },
    ],
    bonusSpinsRemaining: {
      type: Number,
      default: 0,
      comment: "Bonus spins available in current VIP period",
    },
    bonusSpinsGrantedAt: {
      type: Date,
      comment: "When bonus spins were granted for current period",
    },
    bonusSpinsExpireAt: {
      type: Date,
      comment: "When bonus spins expire (end of VIP period)",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
vipTierSchema.index({ userId: 1, currentTier: 1 });
vipTierSchema.index({ last7DaysSpending: -1 });
vipTierSchema.index({ currentTier: 1, isVipConfirmed: 1 });

export default mongoose.model<IVipTier>("VipTier", vipTierSchema);
