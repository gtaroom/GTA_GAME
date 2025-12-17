import VipTierModel, { VipTierLevel, VIP_TIER_CONFIG, IVipTier } from "../models/vip-tier.model";
import TransactionModel from "../models/transaction.model";
import { logger } from "../utils/logger";
import mongoose from "mongoose";

class VipService {
  /**
   * Calculate user's spending in the last 7 days
   */
  async calculate7DaySpending(userId: string | mongoose.Types.ObjectId): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId.toString()),
          type: "deposit",
          status: "completed",
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalSpending: { $sum: "$amount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalSpending : 0;
  }

  /**
   * Calculate user's lifetime spending
   */
  async calculateLifetimeSpending(userId: string | mongoose.Types.ObjectId): Promise<number> {
    const result = await TransactionModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId.toString()),
          type: "deposit",
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalSpending: { $sum: "$amount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalSpending : 0;
  }

  /**
   * Determine VIP tier based on spending amount
   */
  determineTier(spending: number): VipTierLevel {
    // Sort tiers by minSpend in descending order to find the highest applicable tier
    const tiers = Object.entries(VIP_TIER_CONFIG)
      .sort(([, a], [, b]) => b.minSpend - a.minSpend);

    for (const [tier, config] of tiers) {
      if (spending >= config.minSpend) {
        return tier as VipTierLevel;
      }
    }

    return VipTierLevel.NONE;
  }

  /**
   * Get or create VIP tier record for user
   */
  async getOrCreateVipTier(userId: string | mongoose.Types.ObjectId): Promise<IVipTier> {
    let vipTier = await VipTierModel.findOne({ userId });

    if (!vipTier) {
      logger.info(`Creating new VIP tier record for user ${userId}`);
      vipTier = await VipTierModel.create({
        userId,
        currentTier: VipTierLevel.NONE,
        isVipConfirmed: true, // Automatic VIP - only set to false for suspension
        last7DaysSpending: 0,
        totalLifetimeSpending: 0,
        tierHistory: [],
        birthdayBonusClaimed: false,
        bonusSpinsRemaining: 0,
      });
    }

    return vipTier;
  }

  /**
   * Update user's VIP tier based on current spending
   * Implements 14-day VIP period with tier locking
   */
  async updateUserTier(userId: string | mongoose.Types.ObjectId): Promise<IVipTier> {
    const vipTier = await this.getOrCreateVipTier(userId);
    const now = new Date();
    
    // Calculate current spending
    const last7DaysSpending = await this.calculate7DaySpending(userId);
    const totalLifetimeSpending = await this.calculateLifetimeSpending(userId);
    
    // Update spending amounts
    vipTier.last7DaysSpending = last7DaysSpending;
    vipTier.totalLifetimeSpending = totalLifetimeSpending;
    
    const previousTier = vipTier.currentTier;
    const newTier = this.determineTier(last7DaysSpending);
    
    // Check if we're within an active VIP period
    const hasActivePeriod = vipTier.vipPeriodEndDate && now < vipTier.vipPeriodEndDate;
    
    if (hasActivePeriod) {
      // During active period, only allow UPGRADES (no downgrades)
      if (this.isTierHigher(newTier, previousTier)) {
        logger.info(`User ${userId} upgraded from ${previousTier} to ${newTier} during active period - resetting 14-day timer`);
        
        // Upgrade and reset 14-day period
        vipTier.currentTier = newTier;
        vipTier.vipPeriodStartDate = now;
        vipTier.vipPeriodEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        
        vipTier.tierHistory.push({
          tier: newTier,
          achievedAt: now,
          spendingAtTime: last7DaysSpending,
        });
        
        // Grant period-based bonus spins for new tier
        this.grantPeriodBonusSpins(vipTier, newTier);
      } else {
        // No change or downgrade - tier stays locked during period
        logger.debug(`User ${userId} tier locked at ${previousTier} until period ends (${vipTier.vipPeriodEndDate})`);
      }
    } else {
      // No active period or period expired - recalculate freely
      if (newTier !== previousTier) {
        logger.info(`User ${userId} tier changed from ${previousTier} to ${newTier} - starting new 14-day period`);
        
        vipTier.currentTier = newTier;
        
        // Start new 14-day VIP period (only for VIP tiers, not "none")
        if (newTier !== VipTierLevel.NONE) {
          vipTier.vipPeriodStartDate = now;
          vipTier.vipPeriodEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          
          // Grant period-based bonus spins
          this.grantPeriodBonusSpins(vipTier, newTier);
        } else {
          // Dropped to standard - clear period
          vipTier.vipPeriodStartDate = undefined;
          vipTier.vipPeriodEndDate = undefined;
          vipTier.bonusSpinsRemaining = 0;
        }
        
        vipTier.tierHistory.push({
          tier: newTier,
          achievedAt: now,
          spendingAtTime: last7DaysSpending,
        });
      } else if (newTier !== VipTierLevel.NONE && !hasActivePeriod) {
        // Still qualify for same tier but period expired - restart period
        logger.info(`User ${userId} still qualifies for ${newTier} - restarting 14-day period`);
        vipTier.vipPeriodStartDate = now;
        vipTier.vipPeriodEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        
        // Grant fresh bonus spins for new period
        this.grantPeriodBonusSpins(vipTier, newTier);
      }
    }
    
    await vipTier.save();
    return vipTier;
  }
  
  /**
   * Helper: Check if tier A is higher than tier B
   */
  private isTierHigher(tierA: VipTierLevel, tierB: VipTierLevel): boolean {
    const tierOrder = Object.values(VipTierLevel);
    return tierOrder.indexOf(tierA) > tierOrder.indexOf(tierB);
  }
  
  /**
   * Helper: Grant bonus spins for VIP period
   */
  private grantPeriodBonusSpins(vipTier: any, tier: VipTierLevel): void {
    const tierConfig = VIP_TIER_CONFIG[tier];
    
    if (tierConfig.bonusSpins > 0) {
      const now = new Date();
      vipTier.bonusSpinsRemaining = tierConfig.bonusSpins;
      vipTier.bonusSpinsGrantedAt = now;
      vipTier.bonusSpinsExpireAt = vipTier.vipPeriodEndDate;
      
      logger.info(`Granted ${tierConfig.bonusSpins} bonus spins to user for ${tier} tier (valid until ${vipTier.vipPeriodEndDate})`);
    }
  }

  /**
   * Calculate deposit bonus based on amount and VIP status
   */
  calculateDepositBonus(
    amount: number,
    isVip: boolean,
    tierLevel: VipTierLevel
  ): { baseBonus: number; vipBonus: number; totalBonus: number; multiplier: number } {
    // Standard bonus calculation (existing logic)
    let baseBonus: number;
    
    if (amount >= 50) {
      baseBonus = 500;
    } else if (amount >= 20) {
      baseBonus = 300;
    } else if (amount >= 10) {
      baseBonus = 200;
    } else if (amount >= 5) {
      baseBonus = 100;
    } else {
      // For amounts less than $5, calculate proportionally
      const bonusTier = Math.floor(amount / 10);
      baseBonus = Math.min((bonusTier + 1) * 100, 500);
    }

    // Apply VIP multiplier if confirmed VIP
    const tierConfig = VIP_TIER_CONFIG[tierLevel];
    const multiplier = isVip && tierLevel !== VipTierLevel.NONE ? tierConfig.bonusMultiplier : 1;
    const totalBonus = baseBonus * multiplier;
    const vipBonus = totalBonus - baseBonus;

    return {
      baseBonus,
      vipBonus,
      totalBonus,
      multiplier,
    };
  }

  /**
   * Get VIP tier configuration
   */
  getTierConfig(tier: VipTierLevel) {
    return VIP_TIER_CONFIG[tier];
  }

  /**
   * Check if user is eligible for birthday bonus
   * Supports 3-day claim window (day before, birthday, day after)
   * Enhanced security: prevents birthday manipulation and tracks claim history
   * Automatically resets birthdayBonusClaimed field for new years
   */
  async checkBirthdayBonusEligibility(
    userId: string | mongoose.Types.ObjectId,
    userBirthday?: string
  ): Promise<{ eligible: boolean; bonusAmount: number; reason?: string }> {
    if (!userBirthday) {
      return { eligible: false, bonusAmount: 0, reason: "No birthday set" };
    }

    const vipTier = await this.getOrCreateVipTier(userId);
    
    // Check if VIP is suspended or not in any VIP tier
    if (!vipTier.isVipConfirmed || vipTier.currentTier === VipTierLevel.NONE) {
      return { eligible: false, bonusAmount: 0, reason: "Not a VIP member (must reach Iron tier or above)" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const currentYear = today.getFullYear();
    
    // Auto-reset birthdayBonusClaimed if it's a new year
    if (vipTier.birthdayBonusClaimed && vipTier.lastBirthdayBonusDate) {
      const lastClaimYear = new Date(vipTier.lastBirthdayBonusDate).getFullYear();
      if (lastClaimYear < currentYear) {
        vipTier.birthdayBonusClaimed = false;
        await vipTier.save();
        logger.info(`Auto-reset birthdayBonusClaimed for user ${userId} - new year ${currentYear}`);
      }
    }
    
    const birthday = new Date(userBirthday);
    birthday.setFullYear(today.getFullYear()); // Set to current year
    birthday.setHours(0, 0, 0, 0);
    
    // Calculate 3-day window
    const dayBefore = new Date(birthday);
    dayBefore.setDate(dayBefore.getDate() - 1);
    
    const dayAfter = new Date(birthday);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    // Check if today is within the 3-day window
    const isWithinWindow = today >= dayBefore && today <= dayAfter;
    
    if (!isWithinWindow) {
      return { eligible: false, bonusAmount: 0, reason: "Not within birthday window (day before, birthday, or day after)" };
    }

    // Enhanced security: Check if this specific birthday was already used for a claim THIS YEAR
    const birthdayUsedThisYear = vipTier.birthdayBonusHistory?.some(
      (claim) => {
        const claimYear = new Date(claim.claimedDate).getFullYear();
        return claim.birthdayUsed === userBirthday && claimYear === currentYear;
      }
    );
    
    if (birthdayUsedThisYear) {
      return { 
        eligible: false, 
        bonusAmount: 0, 
        reason: "This birthday has already been used for a bonus claim this year. You can claim again next year." 
      };
    }

    // Additional check: Prevent claiming if user has already claimed ANY birthday bonus this year
    // This prevents users from changing their birthday and claiming again in the same year
    const anyBirthdayClaimedThisYear = vipTier.birthdayBonusHistory?.some(
      (claim) => {
        const claimYear = new Date(claim.claimedDate).getFullYear();
        return claimYear === currentYear;
      }
    );
    
    if (anyBirthdayClaimedThisYear) {
      return { 
        eligible: false, 
        bonusAmount: 0, 
        reason: "You have already claimed a birthday bonus this year. You can claim again next year." 
      };
    }

    // Check the birthdayBonusClaimed flag (should be false after auto-reset)
    if (vipTier.birthdayBonusClaimed) {
      return { 
        eligible: false, 
        bonusAmount: 0, 
        reason: "Birthday bonus already claimed this year" 
      };
    }

    const tierConfig = this.getTierConfig(vipTier.currentTier);
    return {
      eligible: true,
      bonusAmount: tierConfig.birthdayBonus,
    };
  }

  /**
   * Reset birthday bonus claimed flag for all users (admin function)
   * This should be run annually to reset all users' birthday bonus eligibility
   */
  async resetAllBirthdayBonusClaims(): Promise<{ resetCount: number }> {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    // Find all VIP tiers where birthdayBonusClaimed is true and last claim was in previous year
    const startOfLastYear = new Date(`${lastYear}-01-01`);
    const endOfLastYear = new Date(`${lastYear}-12-31`);
    
    const result = await VipTierModel.updateMany(
      {
        birthdayBonusClaimed: true,
        lastBirthdayBonusDate: {
          $gte: startOfLastYear,
          $lte: endOfLastYear
        }
      },
      {
        $set: { birthdayBonusClaimed: false }
      }
    );
    
    logger.info(`Reset birthday bonus claims for ${result.modifiedCount} users for year ${currentYear}`);
    
    return { resetCount: result.modifiedCount };
  }

  /**
   * Get birthday bonus eligibility info including next available date
   */
  async getBirthdayBonusInfo(
    userId: string | mongoose.Types.ObjectId,
    userBirthday?: string
  ): Promise<{ 
    eligible: boolean; 
    bonusAmount: number; 
    reason?: string;
    nextAvailableDate?: string;
    claimsThisYear: number;
    totalClaims: number;
  }> {
    const eligibility = await this.checkBirthdayBonusEligibility(userId, userBirthday);
    const vipTier = await this.getOrCreateVipTier(userId);
    
    const currentYear = new Date().getFullYear();
    const claimsThisYear = vipTier.birthdayBonusHistory?.filter(
      (claim) => new Date(claim.claimedDate).getFullYear() === currentYear
    ).length || 0;
    
    const totalClaims = vipTier.birthdayBonusHistory?.length || 0;
    
    // Calculate next available date
    let nextAvailableDate: string | undefined;
    if (!eligibility.eligible && userBirthday) {
      const birthday = new Date(userBirthday);
      const nextYear = new Date(birthday);
      nextYear.setFullYear(currentYear + 1);
      nextAvailableDate = nextYear.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    return {
      ...eligibility,
      nextAvailableDate,
      claimsThisYear,
      totalClaims,
    };
  }
  async claimBirthdayBonus(
    userId: string | mongoose.Types.ObjectId, 
    userBirthday: string
  ): Promise<number> {
    const vipTier = await this.getOrCreateVipTier(userId);
    const tierConfig = this.getTierConfig(vipTier.currentTier);
    
    // Record the claim with the birthday used
    const claimRecord = {
      claimedDate: new Date(),
      birthdayUsed: userBirthday,
      bonusAmount: tierConfig.birthdayBonus,
    };
    
    // Initialize birthdayBonusHistory if it doesn't exist
    if (!vipTier.birthdayBonusHistory) {
      vipTier.birthdayBonusHistory = [];
    }
    
    vipTier.birthdayBonusHistory.push(claimRecord);
    vipTier.lastBirthdayBonusDate = new Date();
    vipTier.birthdayBonusClaimed = true;
    await vipTier.save();
    
    logger.info(`User ${userId} claimed birthday bonus: ${tierConfig.birthdayBonus} GC using birthday ${userBirthday}`);
    return tierConfig.birthdayBonus;
  }

  /**
   * Check daily redemption limit based on VIP tier
   */
  async checkRedemptionLimit(
    userId: string | mongoose.Types.ObjectId,
    requestedAmount: number
  ): Promise<{ allowed: boolean; limit: number; reason?: string }> {
    const vipTier = await this.getOrCreateVipTier(userId);
    const tierConfig = this.getTierConfig(vipTier.currentTier);
    const dailyLimit = tierConfig.scRedemptionLimit;

    // Calculate today's SC redemptions from withdrawal requests
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Import WithdrawalRequest model dynamically to avoid circular dependency
    const WithdrawalRequestModel = (await import("../models/withdrawal-request.model")).default;

    const todayRedemptions = await WithdrawalRequestModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId.toString()),
          status: { $in: ["pending", "approved", "processed"] }, // Only count active/processed requests
          createdAt: { $gte: startOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalRedeemed: { $sum: "$amount" },
        },
      },
    ]);

    const alreadyRedeemed = todayRedemptions.length > 0 ? todayRedemptions[0].totalRedeemed : 0;
    const remainingLimit = dailyLimit - alreadyRedeemed;

    if (requestedAmount > remainingLimit) {
      return {
        allowed: false,
        limit: dailyLimit,
        reason: `Daily SC redemption limit exceeded. Already redeemed: ${alreadyRedeemed} SC, Limit: ${dailyLimit} SC, Remaining: ${remainingLimit} SC`,
      };
    }

    return {
      allowed: true,
      limit: dailyLimit,
    };
  }

  /**
   * Get user's VIP status and perks
   */
  async getUserVipStatus(userId: string | mongoose.Types.ObjectId) {
    await this.updateUserTier(userId);
    const vipTier = await this.getOrCreateVipTier(userId);
    const tierConfig = this.getTierConfig(vipTier.currentTier);
    
    // Calculate Arcade Tickets (1 ticket per $50 spent)
    const arcadeTickets = Math.floor(vipTier.last7DaysSpending / 50);
    
    // Calculate days remaining in VIP period
    let daysRemainingInPeriod = 0;
    if (vipTier.vipPeriodEndDate) {
      const now = new Date();
      const timeRemaining = vipTier.vipPeriodEndDate.getTime() - now.getTime();
      daysRemainingInPeriod = Math.max(0, Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)));
    }
    
    return {
      tier: vipTier.currentTier,
      tierName: tierConfig.name,
      isVipConfirmed: vipTier.isVipConfirmed,
      last7DaysSpending: vipTier.last7DaysSpending,
      totalLifetimeSpending: vipTier.totalLifetimeSpending,
      
      // Arcade Tickets display
      arcadeTickets,
      arcadeTicketsNeededForNextTier: this.calculateTicketsNeededForNextTier(vipTier.currentTier),
      
      // VIP Period info
      vipPeriodStartDate: vipTier.vipPeriodStartDate,
      vipPeriodEndDate: vipTier.vipPeriodEndDate,
      daysRemainingInPeriod,
      // Birthday bonus info
      birthdayBonusClaimed: vipTier.birthdayBonusClaimed,
      perks: {
        bonusMultiplier: tierConfig.bonusMultiplier,
        birthdayBonus: tierConfig.birthdayBonus,
        scRedemptionLimit: tierConfig.scRedemptionLimit,
        drawingEntry: tierConfig.drawingEntry,
        surpriseDrops: tierConfig.surpriseDrops,
        bonusSpins: tierConfig.bonusSpins,
        bonusSpinFrequencyDays: tierConfig.bonusSpinFrequencyDays,
      },
      
      // Period-based bonus spins
      bonusSpinsRemaining: vipTier.bonusSpinsRemaining,
      bonusSpinsGrantedAt: vipTier.bonusSpinsGrantedAt,
      bonusSpinsExpireAt: vipTier.bonusSpinsExpireAt,
      
      tierHistory: vipTier.tierHistory,
      
      // Calculate spending needed for next tier
      nextTier: this.getNextTierInfo(vipTier.last7DaysSpending, vipTier.currentTier),
    };
  }
  
  /**
   * Calculate Arcade Tickets needed for next tier
   */
  private calculateTicketsNeededForNextTier(currentTier: VipTierLevel): number {
    const allTiers = Object.entries(VIP_TIER_CONFIG)
      .sort(([, a], [, b]) => a.minSpend - b.minSpend);
    
    const currentTierIndex = allTiers.findIndex(([tier]) => tier === currentTier);
    
    if (currentTierIndex === allTiers.length - 1) {
      return 0; // Already at max tier
    }
    
    const [, nextTierConfig] = allTiers[currentTierIndex + 1];
    return Math.floor(nextTierConfig.minSpend / 50);
  }

  /**
   * Get information about the next tier
   */
  private getNextTierInfo(currentSpending: number, currentTier: VipTierLevel) {
    const allTiers = Object.entries(VIP_TIER_CONFIG)
      .sort(([, a], [, b]) => a.minSpend - b.minSpend);
    
    const currentTierIndex = allTiers.findIndex(([tier]) => tier === currentTier);
    
    if (currentTierIndex === allTiers.length - 1) {
      return {
        tier: currentTier,
        name: VIP_TIER_CONFIG[currentTier].name,
        spendingNeeded: 0,
        message: "You've reached the highest tier!",
      };
    }
    
    const [nextTierKey, nextTierConfig] = allTiers[currentTierIndex + 1];
    const spendingNeeded = nextTierConfig.minSpend - currentSpending;
    
    return {
      tier: nextTierKey,
      name: nextTierConfig.name,
      minSpend: nextTierConfig.minSpend,
      spendingNeeded: Math.max(0, spendingNeeded),
      message: spendingNeeded > 0 
        ? `Spend $${spendingNeeded.toFixed(2)} more in the next 7 days to reach ${nextTierConfig.name}!`
        : `You qualify for ${nextTierConfig.name}!`,
    };
  }

  /**
   * Admin: Manually suspend/restore VIP privileges (for fraud/abuse cases)
   * Note: VIP status is automatic by default. Only use this to suspend privileges.
   */
  async setVipConfirmation(
    userId: string | mongoose.Types.ObjectId,
    isConfirmed: boolean
  ): Promise<IVipTier> {
    const vipTier = await this.getOrCreateVipTier(userId);
    vipTier.isVipConfirmed = isConfirmed;
    await vipTier.save();
    
    logger.info(`Admin ${isConfirmed ? 'restored' : 'suspended'} VIP privileges for user ${userId}`);
    return vipTier;
  }

  /**
   * Check bonus spins status (period-based, no manual granting)
   * Bonus spins are automatically granted at VIP period start
   */
  async checkBonusSpinsStatus(userId: string | mongoose.Types.ObjectId): Promise<{
    hasSpins: boolean;
    spinsRemaining: number;
    expiresAt?: Date;
    message: string;
  }> {
    const vipTier = await this.getOrCreateVipTier(userId);
    const tierConfig = this.getTierConfig(vipTier.currentTier);
    
    if (!vipTier.isVipConfirmed || tierConfig.bonusSpins === 0) {
      return {
        hasSpins: false,
        spinsRemaining: 0,
        message: "No bonus spins available for your tier",
      };
    }

    const now = new Date();
    
    // Check if spins have expired
    if (vipTier.bonusSpinsExpireAt && now > vipTier.bonusSpinsExpireAt) {
      // Expired - clear them
      vipTier.bonusSpinsRemaining = 0;
      await vipTier.save();
      
      return {
        hasSpins: false,
        spinsRemaining: 0,
        message: "Your bonus spins have expired. They will refresh when you start a new VIP period.",
      };
    }
    
    return {
      hasSpins: vipTier.bonusSpinsRemaining > 0,
      spinsRemaining: vipTier.bonusSpinsRemaining,
      expiresAt: vipTier.bonusSpinsExpireAt,
      message: vipTier.bonusSpinsRemaining > 0 
        ? `You have ${vipTier.bonusSpinsRemaining} bonus spins available`
        : "No bonus spins available in current period",
    };
  }
  
  /**
   * Use/consume a bonus spin for spin wheel
   * This method validates VIP bonus spins and allows spin wheel usage
   */
  async useBonusSpin(
    userId: string | mongoose.Types.ObjectId,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    spinsRemaining: number;
    message: string;
    spinResult?: any; // Will contain the spin wheel result
    error?: string;
  }> {
    const vipTier = await this.getOrCreateVipTier(userId);
    const now = new Date();
    
    // Check if user has spins available
    if (vipTier.bonusSpinsRemaining <= 0) {
      logger.warn(`User ${userId} attempted to use bonus spin but has none remaining`);
      return {
        success: false,
        spinsRemaining: 0,
        message: "No bonus spins available",
        error: "NO_SPINS_AVAILABLE",
      };
    }
    
    // Check if spins have expired
    if (vipTier.bonusSpinsExpireAt && now > vipTier.bonusSpinsExpireAt) {
      vipTier.bonusSpinsRemaining = 0;
      await vipTier.save();
      
      logger.warn(`User ${userId} attempted to use expired bonus spin`);
      return {
        success: false,
        spinsRemaining: 0,
        message: "Your bonus spins have expired",
        error: "SPINS_EXPIRED",
      };
    }
    
    // Import spin wheel service dynamically to avoid circular dependency
    const spinWheelService = (await import("./spin-wheel.service")).default;
    
    // Perform the spin wheel spin
    const spinResult = await spinWheelService.performSpin(userId, ipAddress, userAgent);
    
    if (!spinResult.success) {
      return {
        success: false,
        spinsRemaining: vipTier.bonusSpinsRemaining,
        message: spinResult.message,
        error: spinResult.error,
      };
    }
    
    // Consume the spin only after successful spin wheel result
    vipTier.bonusSpinsRemaining -= 1;
    await vipTier.save();
    
    logger.info(`User ${userId} used bonus spin on spin wheel. Spins remaining: ${vipTier.bonusSpinsRemaining}. Won: ${spinResult.result?.amount} ${spinResult.result?.type}`);
    
    return {
      success: true,
      spinsRemaining: vipTier.bonusSpinsRemaining,
      message: `Bonus spin used successfully! ${vipTier.bonusSpinsRemaining} spins remaining`,
      spinResult: spinResult.result,
    };
  }
}

export default new VipService();

