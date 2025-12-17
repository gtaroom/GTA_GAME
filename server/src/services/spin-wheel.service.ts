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
import walletModel from "../models/wallet.model";
import UserBonusModel from "../models/bonus.model";

class SpinWheelService {
  /**
   * Generate a secure random spin result based on probability weights
   */
  private generateSecureSpinResult(): ISpinReward {
    // Calculate total probability weight
    const totalWeight = SPIN_WHEEL_REWARDS.reduce((sum, reward) => sum + reward.probability, 0);
    
    // Generate cryptographically secure random number
    const randomBuffer = crypto.randomBytes(4);
    const randomValue = randomBuffer.readUInt32BE(0) / 0xFFFFFFFF; // Convert to 0-1 range
    const weightedRandom = randomValue * totalWeight;
    
    // Find the reward based on weighted random selection
    let currentWeight = 0;
    for (const reward of SPIN_WHEEL_REWARDS) {
      currentWeight += reward.probability;
      if (weightedRandom <= currentWeight) {
        return reward;
      }
    }
    
    // Fallback to first reward (should never happen)
    return SPIN_WHEEL_REWARDS[0];
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
      // Generate secure spin result
      const reward = this.generateSecureSpinResult();
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
  validateSpinWheelConfig(): {
    valid: boolean;
    issues: string[];
    totalProbability: number;
  } {
    const issues: string[] = [];
    let totalProbability = 0;

    // Check for duplicate IDs
    const ids = SPIN_WHEEL_REWARDS.map(r => r.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      issues.push("Duplicate reward IDs found");
    }

    // Validate each reward
    for (const reward of SPIN_WHEEL_REWARDS) {
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

    return {
      totalSpins,
      spinsByRarity: rarityStats,
      totalRewardsGiven,
      recentSpins,
    };
  }
}

export default new SpinWheelService();
