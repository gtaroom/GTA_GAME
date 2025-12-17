import { Document, model, models, Schema } from "mongoose";

export interface UserBonusSchemaIn extends Document {
  userId: Schema.Types.ObjectId; // Reference to the User model
  goldCoins: number;
  sweepCoins: number;
  lastLoginDate: Date;
  lastSweeDate: Date;
  loginStreak: number;
  claimedDailyBonus: boolean;
  claimedDailySweepBonus: boolean;
  claimedNewUserBonus: boolean;     
  canClaimSpinwheel: boolean;
}

const UserBonusSchema = new Schema<UserBonusSchemaIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    goldCoins: { type: Number, default: 0 },
    sweepCoins: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: null },
    loginStreak: { type: Number, default: 0 },
    lastSweeDate: { type: Date, default: null },
    claimedDailyBonus: { type: Boolean, default: false },
    claimedDailySweepBonus: { type: Boolean, default: false },
    claimedNewUserBonus: { type: Boolean, default: false },
    canClaimSpinwheel: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// const DAILY_BONUS_REWARDS = [
//   { goldCoins: 5000, sweepCoins: 0.03 }, // Day 1
//   { goldCoins: 6000, sweepCoins: 1.00 }, // Day 2
//   { goldCoins: 7000, sweepCoins: 0.04 }, // Day 3
//   { goldCoins: 8000, sweepCoins: 0.05 }, // Day 4
//   { goldCoins: 10000, sweepCoins: 1.00 }, // Day 5+
//   ];

// Method to update login streak
UserBonusSchema.methods.updateLoginStreak = function () {
  const today = new Date();
  const lastLogin = this.lastLoginDate ? new Date(this.lastLoginDate) : null;

  if (!lastLogin || lastLogin.toDateString() !== today.toDateString()) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastLogin && lastLogin.toDateString() === yesterday.toDateString()) {
      this.loginStreak += 1;
    } else {
      this.loginStreak = 1;
    }

    this.lastLoginDate = today;
  }
};


// Helper to get current streak day in range 1..7 (wrap-around)
UserBonusSchema.methods.getCurrentStreakDay = function () {
  const streak = Number(this.loginStreak) || 0;
  if (streak <= 0) return 1;
  return ((streak - 1) % 7) + 1;
};

// Method to claim daily bonus
UserBonusSchema.methods.claimDailyBonus = function () {
  if (!this.claimedDailyBonus) {
    // Day-based GC rewards with 7-day wrap
    const day = this.getCurrentStreakDay();
    const DAY_REWARDS = {
      1: 5000,
      2: 5500,
      3: 6000,
      4: 6500,
      5: 7000,
      6: 7500,
      7: 10000,
    } as Record<number, number>;

    // Preserve initial new-user daily claim boost if not yet claimed
    const bonusGoldCoins = !this.claimedNewUserBonus ? 10000 : DAY_REWARDS[day] || 5000;
    this.goldCoins += bonusGoldCoins;
    this.claimedDailyBonus = true;
    if (!this.claimedNewUserBonus) {
      this.claimedNewUserBonus = true;
    }
    // Grant spinwheel on 7th day claim only
    this.canClaimSpinwheel = day === 7;

    return { goldCoins: bonusGoldCoins};
  }
  return null;
};

// Method to update gold-coins balance
UserBonusSchema.methods.updateBonus = function (balance: number, type: string) {
  if (type === "credit") {
    this.goldCoins += balance;
  } else {
    this.goldCoins = Math.max(0, this.goldCoins - balance);
  }

  // Round to 2 decimals
  this.goldCoins = parseFloat(this.goldCoins.toFixed(2));

  return { type, balance };
};

// Method to update sweep-coins balance
UserBonusSchema.methods.updateSweepCoins = function (balance: number, type: string) {
  if (type === "credit") {
    this.sweepCoins += balance;
  } else {
    this.sweepCoins = Math.max(0, this.sweepCoins - balance);
  }

  // Round to 2 decimals
  this.sweepCoins = parseFloat(this.sweepCoins.toFixed(2));

  return { type, balance };
};

  UserBonusSchema.methods.claimDailySweepBonus = function () {
    if (!this.claimedDailySweepBonus) {
      // const streakIndex = Math.min(this.loginStreak - 1, DAILY_BONUS_REWARDS.length - 1);
      // const bonus = DAILY_BONUS_REWARDS[streakIndex];
      const bonusSweepCoins = 1;
      this.sweepCoins = parseFloat((this.sweepCoins + bonusSweepCoins).toFixed(2));
      this.claimedDailySweepBonus = true;
  
      return { sweepCoins: bonusSweepCoins };
    }
    return null;
  };
  

// Method to claim new user bonus
UserBonusSchema.methods.claimNewUserBonus = function () {
  if (!this.claimedNewUserBonus) {
    const bonusGoldCoins = 10000; 
    const bonusSweepCoins = 1; 

    this.goldCoins += bonusGoldCoins;
    this.sweepCoins += bonusSweepCoins;
    this.claimedNewUserBonus = true;

    return { goldCoins: bonusGoldCoins, sweepCoins: bonusSweepCoins };
  }
  return null;
};

const UserBonusModel =
  models.UserBonus || model<UserBonusSchemaIn>("UserBonus", UserBonusSchema);
export default UserBonusModel;