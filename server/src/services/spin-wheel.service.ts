import crypto from "crypto";
import mongoose from "mongoose";
import { logger } from "../utils/logger";
import SpinWheelUsageModel, { 
  ISpinResult, 
  ISpinReward, 
  SPIN_WHEEL_REWARDS, 
  SpinRewardType, 
  SpinRewardRarity, 
  ISpinWheelUsage
} from "../models/spin-wheel.model";
import SpinWheelConfigModel, { ISpinRewardConfig, ISpinWheelConfig } from "../models/spin-wheel-config.model";
import SpinWheelEligibilityModel, { ISpinWheelEligibility } from "../models/spin-wheel-eligibility.model";
import walletModel from "../models/wallet.model";
import UserBonusModel from "../models/bonus.model";
import TransactionModel from "../models/transaction.model";
import UserModel from "../models/user.model";

class SpinWheelService {
  /**
   * Get or create spin wheel configuration
   */
  async getOrCreateConfig(): Promise<ISpinWheelConfig> {
    let config = await SpinWheelConfigModel.findOne();
    
    if (!config) {
      // Create default configuration with existing rewards
      const defaultRewards: ISpinRewardConfig[] = SPIN_WHEEL_REWARDS.map(reward => ({
        id: reward.id,
        amount: reward.amount,
        type: reward.type,
        rarity: reward.rarity,
        probability: reward.probability,
        description: reward.description,
        isActive: true,
      }));
      
      config = await SpinWheelConfigModel.create({
        isActive: true,
        rewards: defaultRewards,
        triggers: {
          firstTime: {
            enabled: true,
            spinsPerUser: 1,
          },
          random: {
            enabled: false,
            probability: 0,
            cooldownHours: 24,
          },
          threshold: {
            enabled: false,
            thresholds: [],
          },
        },
      });
      
      logger.info("Created default spin wheel configuration");
    }
    
    return config;
  }

  /**
   * Get or create user spin eligibility
   */
  async getOrCreateEligibility(userId: string | mongoose.Types.ObjectId): Promise<ISpinWheelEligibility> {
    let eligibility = await SpinWheelEligibilityModel.findOne({ userId });
    
    if (!eligibility) {
      const config = await this.getOrCreateConfig();
      
      // Initialize first-time spins if enabled
      const firstTimeSpins = config.triggers.firstTime.enabled 
        ? config.triggers.firstTime.spinsPerUser 
        : 0;
      
      eligibility = await SpinWheelEligibilityModel.create({
        userId,
        hasUsedFirstTimeSpin: false,
        firstTimeSpinsRemaining: firstTimeSpins,
        thresholdSpinsEarned: [],
        totalSpinsAvailable: firstTimeSpins,
      });
    }
    
    return eligibility;
  }

  /**
   * Generate a secure random spin result based on probability weights
   * Uses admin-configurable rewards if available, otherwise falls back to default
   */
  private generateSecureSpinResult(rewards: ISpinRewardConfig[]): ISpinRewardConfig {
    // Filter only active rewards
    const activeRewards = rewards.filter(r => r.isActive);
    
    if (activeRewards.length === 0) {
      // Fallback to default rewards if no active rewards configured
      const totalWeight = SPIN_WHEEL_REWARDS.reduce((sum, reward) => sum + reward.probability, 0);
      const randomBuffer = crypto.randomBytes(4);
      const randomValue = randomBuffer.readUInt32BE(0) / 0xFFFFFFFF;
      const weightedRandom = randomValue * totalWeight;
      
      let currentWeight = 0;
      for (const reward of SPIN_WHEEL_REWARDS) {
        currentWeight += reward.probability;
        if (weightedRandom <= currentWeight) {
          return {
            id: reward.id,
            amount: reward.amount,
            type: reward.type,
            rarity: reward.rarity,
            probability: reward.probability,
            description: reward.description,
            isActive: true,
          };
        }
      }
      return {
        id: SPIN_WHEEL_REWARDS[0].id,
        amount: SPIN_WHEEL_REWARDS[0].amount,
        type: SPIN_WHEEL_REWARDS[0].type,
        rarity: SPIN_WHEEL_REWARDS[0].rarity,
        probability: SPIN_WHEEL_REWARDS[0].probability,
        description: SPIN_WHEEL_REWARDS[0].description,
        isActive: true,
      };
    }
    
    // Calculate total probability weight
    const totalWeight = activeRewards.reduce((sum, reward) => sum + reward.probability, 0);
    
    // Generate cryptographically secure random number
    const randomBuffer = crypto.randomBytes(4);
    const randomValue = randomBuffer.readUInt32BE(0) / 0xFFFFFFFF; // Convert to 0-1 range
    const weightedRandom = randomValue * totalWeight;
    
    // Find the reward based on weighted random selection
    let currentWeight = 0;
    for (const reward of activeRewards) {
      currentWeight += reward.probability;
      if (weightedRandom <= currentWeight) {
        return reward;
      }
    }
    
    // Fallback to first active reward (should never happen)
    return activeRewards[0];
  }

  /**
   * Check if user is eligible for a spin
   */
  async checkSpinEligibility(userId: string | mongoose.Types.ObjectId): Promise<{
    eligible: boolean;
    spinsAvailable: number;
    message: string;
    error?: string;
  }> {
    try {
      const config = await this.getOrCreateConfig();
      
      if (!config.isActive) {
        return {
          eligible: false,
          spinsAvailable: 0,
          message: "Spin wheel is currently disabled",
          error: "SPIN_WHEEL_DISABLED",
        };
      }
      
      const eligibility = await this.getOrCreateEligibility(userId);
      
      // Update total spins available
      await this.updateEligibilitySpins(userId);
      
      // Refresh eligibility to get updated spins
      const updatedEligibility = await SpinWheelEligibilityModel.findOne({ userId });
      
      if (!updatedEligibility || updatedEligibility.totalSpinsAvailable <= 0) {
        return {
          eligible: false,
          spinsAvailable: 0,
          message: "No spins available. Check back later!",
          error: "NO_SPINS_AVAILABLE",
        };
      }
      
      return {
        eligible: true,
        spinsAvailable: updatedEligibility.totalSpinsAvailable,
        message: `You have ${updatedEligibility.totalSpinsAvailable} spin(s) available!`,
      };
    } catch (error) {
      logger.error(`Error checking spin eligibility for user ${userId}:`, error);
      return {
        eligible: false,
        spinsAvailable: 0,
        message: "Error checking eligibility",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update user's spin eligibility based on triggers
   */
  async updateEligibilitySpins(userId: string | mongoose.Types.ObjectId): Promise<void> {
    const config = await this.getOrCreateConfig();
    const eligibility = await this.getOrCreateEligibility(userId);
    
    let totalSpins = 0;
    
    // First-time spins
    if (config.triggers.firstTime.enabled && !eligibility.hasUsedFirstTimeSpin) {
      totalSpins += eligibility.firstTimeSpinsRemaining;
    }
    
    // Threshold spins
    if (config.triggers.threshold.enabled) {
      const lifetimeSpending = await this.calculateLifetimeSpending(userId);
      
      for (const threshold of config.triggers.threshold.thresholds) {
        if (!threshold.isActive) continue;
        
        // Check if we've already recorded this threshold
        const existingThreshold = eligibility.thresholdSpinsEarned.find(
          t => t.thresholdId === threshold.id
        );
        
        // Check if user has reached this threshold
        if (lifetimeSpending >= threshold.spendingAmount) {
          if (!existingThreshold) {
            // New threshold reached - add spins
            eligibility.thresholdSpinsEarned.push({
              thresholdId: threshold.id,
              spendingAmount: threshold.spendingAmount,
              spinsAwarded: threshold.spinsAwarded,
              reachedAt: new Date(),
              spinsUsed: 0,
            });
            totalSpins += threshold.spinsAwarded;
          } else {
            // Threshold already reached - add remaining spins
            const remainingSpins = existingThreshold.spinsAwarded - existingThreshold.spinsUsed;
            totalSpins += remainingSpins;
          }
        } else if (existingThreshold) {
          // User has reached this threshold before but spending dropped (shouldn't happen, but handle it)
          // Add remaining spins from previously reached threshold
          const remainingSpins = existingThreshold.spinsAwarded - existingThreshold.spinsUsed;
          totalSpins += remainingSpins;
        }
      }
    }
    
    // Update total spins available
    eligibility.totalSpinsAvailable = totalSpins;
    await eligibility.save();
  }

  /**
   * Calculate user's lifetime spending
   */
  private async calculateLifetimeSpending(userId: string | mongoose.Types.ObjectId): Promise<number> {
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
   * Check for random spin trigger
   */
  async checkRandomTrigger(userId: string | mongoose.Types.ObjectId): Promise<boolean> {
    const config = await this.getOrCreateConfig();
    
    if (!config.triggers.random.enabled || config.triggers.random.probability <= 0) {
      return false;
    }
    
    const eligibility = await this.getOrCreateEligibility(userId);
    const now = new Date();
    
    // Check cooldown
    if (eligibility.lastRandomSpinDate) {
      const hoursSinceLastSpin = (now.getTime() - eligibility.lastRandomSpinDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSpin < config.triggers.random.cooldownHours) {
        return false;
      }
    }
    
    // Generate random number to check probability
    const randomBuffer = crypto.randomBytes(4);
    const randomValue = randomBuffer.readUInt32BE(0) / 0xFFFFFFFF;
    const triggerChance = randomValue * 100;
    
    if (triggerChance <= config.triggers.random.probability) {
      // Award a random spin
      eligibility.totalSpinsAvailable = (eligibility.totalSpinsAvailable || 0) + 1;
      eligibility.lastRandomSpinDate = now;
      eligibility.lastRandomTriggerCheck = now;
      await eligibility.save();
      
      logger.info(`Random spin triggered for user ${userId}`);
      return true;
    }
    
    eligibility.lastRandomTriggerCheck = now;
    await eligibility.save();
    
    return false;
  }

  /**
   * Generate unique spin ID
   */
  private generateSpinId(): string {
    return `spin_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Validate spin request and perform spin
   */
  async performSpin(
    userId: string | mongoose.Types.ObjectId,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    result?: ISpinResult;
    message: string;
    error?: string;
  }> {
    try {
      // Check eligibility first
      const eligibilityCheck = await this.checkSpinEligibility(userId);
      
      if (!eligibilityCheck.eligible) {
        return {
          success: false,
          message: eligibilityCheck.message,
          error: eligibilityCheck.error,
        };
      }
      
      // Get configuration
      const config = await this.getOrCreateConfig();
      const eligibility = await this.getOrCreateEligibility(userId);
      
      // Generate secure spin result using admin-configurable rewards
      const reward = this.generateSecureSpinResult(config.rewards);
      const spinId = this.generateSpinId();
      
      // Create spin result
      const spinResult: ISpinResult = {
        rewardId: reward.id,
        amount: reward.amount,
        type: reward.type,
        rarity: reward.rarity,
        description: reward.description,
        timestamp: new Date(),
        spinId,
      };

      // Record the spin usage for audit trail
      await SpinWheelUsageModel.create({
        userId,
        spinId,
        rewardId: reward.id,
        amount: reward.amount,
        type: reward.type,
        rarity: reward.rarity,
        description: reward.description,
        spunAt: new Date(),
        claimedAt: null, // Will be set when reward is claimed
        ipAddress,
        userAgent,
      });

      // Consume a spin from eligibility
      eligibility.totalSpinsAvailable = Math.max(0, eligibility.totalSpinsAvailable - 1);
      
      // Update first-time spin tracking
      if (!eligibility.hasUsedFirstTimeSpin && config.triggers.firstTime.enabled) {
        eligibility.firstTimeSpinsRemaining = Math.max(0, eligibility.firstTimeSpinsRemaining - 1);
        if (eligibility.firstTimeSpinsRemaining === 0) {
          eligibility.hasUsedFirstTimeSpin = true;
        }
      }
      
      // Update threshold spin tracking
      if (config.triggers.threshold.enabled && eligibility.thresholdSpinsEarned.length > 0) {
        // Find the first threshold with remaining spins and consume one
        for (const threshold of eligibility.thresholdSpinsEarned) {
          if (threshold.spinsUsed < threshold.spinsAwarded) {
            threshold.spinsUsed += 1;
            break;
          }
        }
      }
      
      await eligibility.save();

      logger.info(`User ${userId} spun wheel and got: ${reward.amount} ${reward.type} (${reward.rarity}) - Spin ID: ${spinId}`);

      return {
        success: true,
        result: spinResult,
        message: `Congratulations! You won ${reward.amount} ${reward.type}!`,
      };

    } catch (error) {
      logger.error(`Error performing spin for user ${userId}:`, error);
      return {
        success: false,
        message: "Failed to perform spin. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Claim spin wheel reward (add to user's wallet)
   */
  async claimSpinReward(
    userId: string | mongoose.Types.ObjectId,
    spinId: string
  ): Promise<{
    success: boolean;
    message: string;
    newBalance?: number;
    error?: string;
  }> {
    try {
      // Find the spin usage record
      const spinUsage = await SpinWheelUsageModel.findOne({ 
        userId, 
        spinId 
      });

      if (!spinUsage) {
        return {
          success: false,
          message: "Invalid spin ID or spin not found",
          error: "SPIN_NOT_FOUND",
        };
      }

      // Check if reward was already claimed
      if (spinUsage.claimedAt) {
        return {
          success: false,
          message: "This reward has already been claimed",
          error: "ALREADY_CLAIMED",
        };
      }

      let wallet: any;
if (spinUsage.type === SpinRewardType.SC) {
   wallet = await UserBonusModel.findOne({ userId });
    if (!wallet) {
      wallet = await UserBonusModel.create({ userId });
    }
    wallet.sweepCoins += spinUsage.amount;
    await wallet.save();
} else {
     wallet = await walletModel.findOne({ userId });
    if (!wallet) {
      wallet = await walletModel.create({ 
        userId, 
        balance: 0, 
        currency: 'GC'
      });
    }

    // Add reward to wallet
    wallet.balance += spinUsage.amount;
    await wallet.save();
}

      // Get or create user wallet
    

      // Mark the reward as claimed
      spinUsage.claimedAt = new Date();
      await spinUsage.save();

      logger.info(`User ${userId} claimed spin reward: ${spinUsage.amount} ${spinUsage.type} - Spin ID: ${spinId}`);

      return {
        success: true,
        message: `Successfully claimed ${spinUsage.amount} ${spinUsage.type}!`,
        newBalance: wallet.balance || wallet.sweepCoins,
      };

    } catch (error) {
      logger.error(`Error claiming spin reward for user ${userId}, spin ${spinId}:`, error);
      return {
        success: false,
        message: "Failed to claim reward. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get user's spin history
   */
  async getUserSpinHistory(
    userId: string | mongoose.Types.ObjectId,
    limit: number = 10,
    offset: number = 0
  ): Promise<{
    spins: ISpinWheelUsage[];
    total: number;
  }> {
    const spins = await SpinWheelUsageModel.find({ userId })
      .sort({ spunAt: -1 })
      .limit(limit)
      .skip(offset);

    const total = await SpinWheelUsageModel.countDocuments({ userId });

    return { spins, total };
  }

  /**
   * Validate spin wheel configuration (admin function)
   */
  async validateSpinWheelConfig(): Promise<{
    valid: boolean;
    issues: string[];
    totalProbability: number;
  }> {
    const issues: string[] = [];
    let totalProbability = 0;

    const config = await this.getOrCreateConfig();
    const activeRewards = config.rewards.filter(r => r.isActive);

    if (activeRewards.length === 0) {
      issues.push("No active rewards configured");
      return {
        valid: false,
        issues,
        totalProbability: 0,
      };
    }

    // Check for duplicate IDs
    const ids = activeRewards.map(r => r.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      issues.push("Duplicate reward IDs found");
    }

    // Validate each reward
    for (const reward of activeRewards) {
      totalProbability += reward.probability;
      
      if (reward.amount <= 0) {
        issues.push(`Reward ID ${reward.id}: Amount must be positive`);
      }
      
      if (reward.probability <= 0) {
        issues.push(`Reward ID ${reward.id}: Probability must be positive`);
      }
      
      if (!Object.values(SpinRewardType).includes(reward.type)) {
        issues.push(`Reward ID ${reward.id}: Invalid reward type`);
      }
      
      if (!Object.values(SpinRewardRarity).includes(reward.rarity)) {
        issues.push(`Reward ID ${reward.id}: Invalid rarity`);
      }
    }

    // Check if total probability is reasonable (should be around 100)
    if (Math.abs(totalProbability - 100) > 0.1) {
      issues.push(`Total probability is ${totalProbability}%, should be close to 100%`);
    }

    // Validate triggers
    if (config.triggers.random.enabled) {
      if (config.triggers.random.probability < 0 || config.triggers.random.probability > 100) {
        issues.push("Random trigger probability must be between 0 and 100");
      }
      if (config.triggers.random.cooldownHours < 0) {
        issues.push("Random trigger cooldown must be non-negative");
      }
    }

    if (config.triggers.threshold.enabled) {
      const thresholdIds = new Set<string>();
      for (const threshold of config.triggers.threshold.thresholds) {
        if (thresholdIds.has(threshold.id)) {
          issues.push(`Duplicate threshold ID: ${threshold.id}`);
        }
        thresholdIds.add(threshold.id);
        
        if (threshold.spendingAmount < 0) {
          issues.push(`Threshold ${threshold.id}: Spending amount must be non-negative`);
        }
        if (threshold.spinsAwarded < 1) {
          issues.push(`Threshold ${threshold.id}: Spins awarded must be at least 1`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      totalProbability,
    };
  }

  /**
   * Get spin wheel statistics (admin function)
   */
  async getSpinWheelStats(): Promise<{
    totalSpins: number;
    spinsByRarity: Record<SpinRewardRarity, number>;
    totalRewardsGiven: Record<SpinRewardType, number>;
    recentSpins: ISpinWheelUsage[];
    usersWithSpins: number;
    totalSpinsAvailable: number;
  }> {
    const totalSpins = await SpinWheelUsageModel.countDocuments();
    
    // Get spins by rarity
    const spinsByRarity = await SpinWheelUsageModel.aggregate([
      {
        $group: {
          _id: "$rarity",
          count: { $sum: 1 },
        },
      },
    ]);

    const rarityStats: Record<SpinRewardRarity, number> = {
      [SpinRewardRarity.COMMON]: 0,
      [SpinRewardRarity.UNCOMMON]: 0,
      [SpinRewardRarity.RARE]: 0,
      [SpinRewardRarity.VERY_RARE]: 0,
      [SpinRewardRarity.ULTRA_RARE]: 0,
      [SpinRewardRarity.TOP_REWARD]: 0,
    };

    spinsByRarity.forEach(stat => {
      rarityStats[stat._id as SpinRewardRarity] = stat.count;
    });

    // Get total rewards given by type
    const rewardsByType = await SpinWheelUsageModel.aggregate([
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalRewardsGiven: Record<SpinRewardType, number> = {
      [SpinRewardType.GC]: 0,
      [SpinRewardType.SC]: 0,
    };

    rewardsByType.forEach(stat => {
      totalRewardsGiven[stat._id as SpinRewardType] = stat.totalAmount;
    });

    // Get recent spins
    const recentSpins = await SpinWheelUsageModel.find()
      .sort({ spunAt: -1 })
      .limit(20)
      .populate('userId', 'name email');

    // Get users with available spins
    const usersWithSpins = await SpinWheelEligibilityModel.countDocuments({
      totalSpinsAvailable: { $gt: 0 },
    });

    // Get total spins available across all users
    const totalSpinsResult = await SpinWheelEligibilityModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalSpinsAvailable" },
        },
      },
    ]);

    const totalSpinsAvailable = totalSpinsResult.length > 0 ? totalSpinsResult[0].total : 0;

    return {
      totalSpins,
      spinsByRarity: rarityStats,
      totalRewardsGiven,
      recentSpins,
      usersWithSpins,
      totalSpinsAvailable,
    };
  }

  /**
   * Get spin wheel configuration (admin function)
   */
  async getConfig(): Promise<ISpinWheelConfig> {
    return await this.getOrCreateConfig();
  }

  /**
   * Update spin wheel configuration (admin function)
   */
  async updateConfig(updates: Partial<ISpinWheelConfig>): Promise<ISpinWheelConfig> {
    const config = await this.getOrCreateConfig();
    
    if (updates.isActive !== undefined) {
      config.isActive = updates.isActive;
    }
    
    if (updates.rewards) {
      config.rewards = updates.rewards;
    }
    
    if (updates.triggers) {
      if (updates.triggers.firstTime) {
        config.triggers.firstTime = {
          ...config.triggers.firstTime,
          ...updates.triggers.firstTime,
        };
      }
      if (updates.triggers.random) {
        config.triggers.random = {
          ...config.triggers.random,
          ...updates.triggers.random,
        };
      }
      if (updates.triggers.threshold) {
        config.triggers.threshold = {
          ...config.triggers.threshold,
          ...updates.triggers.threshold,
        };
      }
    }
    
    await config.save();
    logger.info("Spin wheel configuration updated");
    
    return config;
  }
}

export default new SpinWheelService();
