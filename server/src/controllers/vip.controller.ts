import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import { getUserFromRequest } from "../utils/get-user";
import vipService from "../services/vip.service";
import UserModel from "../models/user.model";
import UserBonusModel from "../models/bonus.model";
import { logger } from "../utils/logger";
import walletModel from "../models/wallet.model";

/**
 * Get user's current VIP tier status and perks
 */
export const getVipStatus = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  logger.debug(`Getting VIP status for user ${userId}`);
  
  const vipStatus = await vipService.getUserVipStatus(userId);
  
  return res.status(200).json(
    new ApiResponse(200, vipStatus, "VIP status retrieved successfully")
  );
});

/**
 * Get VIP tier information and configuration
 */
export const getVipTiers = asyncHandler(async (req: Request, res: Response) => {
  const { VIP_TIER_CONFIG } = await import("../models/vip-tier.model");
  
  // Convert tier config to array format for easier frontend consumption
  const tiers = Object.entries(VIP_TIER_CONFIG).map(([key, value]) => ({
    tier: key,
    ...value,
  }));
  
  return res.status(200).json(
    new ApiResponse(200, { tiers }, "VIP tier configuration retrieved successfully")
  );
});

/**
 * Check birthday bonus eligibility and claim if eligible
 */
export const claimBirthdayBonus = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  
  logger.info(`User ${userId} attempting to claim birthday bonus`);
  
  // Get user to check birthday
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  // Check eligibility
  const eligibility = await vipService.checkBirthdayBonusEligibility(userId, user.birthday);
  
  if (!eligibility.eligible) {
    throw new ApiError(400, eligibility.reason || "Not eligible for birthday bonus");
  }
  
  // Claim the bonus
  const bonusAmount = await vipService.claimBirthdayBonus(userId, user.birthday);
  
  // Add to user's gold coins
  const userBonus = await walletModel.findOne({ userId });
  if (userBonus) {
    userBonus.balance += bonusAmount;
    await userBonus.save();
  }
  
  logger.info(`User ${userId} claimed birthday bonus: ${bonusAmount} GC`);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      { bonusAmount, newBalance: userBonus?.balance },
      "Birthday bonus claimed successfully"
    )
  );
});

/**
 * Check bonus spins status (period-based system)
 */
export const checkBonusSpins = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  
  logger.debug(`Checking bonus spins status for user ${userId}`);
  
  const spinsStatus = await vipService.checkBonusSpinsStatus(userId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      spinsStatus,
      spinsStatus.message
    )
  );
});

/**
 * Use/consume a bonus spin for spin wheel
 */
export const useBonusSpin = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  logger.info(`User ${userId} attempting to use bonus spin on spin wheel`);
  
  const result = await vipService.useBonusSpin(userId, ipAddress, userAgent);
  
  if (!result.success) {
    return res.status(400).json(
      new ApiResponse(400, result, result.message)
    );
  }
  
  return res.status(200).json(
    new ApiResponse(200, result, result.message)
  );
});

/**
 * Get user's redemption limit info
 */
export const getRedemptionLimit = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  
  logger.debug(`Getting redemption limit for user ${userId}`);
  
  // Check with a zero amount just to get the limit info
  const limitInfo = await vipService.checkRedemptionLimit(userId, 0);
  const vipStatus = await vipService.getUserVipStatus(userId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        dailyLimit: limitInfo.limit,
        tier: vipStatus.tier,
        tierName: vipStatus.tierName,
      },
      "Redemption limit retrieved successfully"
    )
  );
});

/**
 * ADMIN: Get all VIP users
 */
export const getAllVipUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, tier } = req.query;
  
  const pageNumber = parseInt(page as string);
  const limitNumber = parseInt(limit as string);
  const skip = (pageNumber - 1) * limitNumber;
  
  const VipTierModel = (await import("../models/vip-tier.model")).default;
  
  const query: any = {};
  if (tier) {
    query.currentTier = tier;
  }
  
  const [vipUsers, total] = await Promise.all([
    VipTierModel.find(query)
      .sort({ last7DaysSpending: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("userId", "name email phone"),
    VipTierModel.countDocuments(query),
  ]);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        vipUsers,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
      "VIP users retrieved successfully"
    )
  );
});

/**
 * ADMIN: Suspend or restore VIP privileges for a user
 * Note: VIP is automatic. Use this only to suspend privileges for fraud/abuse cases.
 */
export const setVipConfirmation = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isConfirmed } = req.body;
  
  if (typeof isConfirmed !== "boolean") {
    throw new ApiError(400, "isConfirmed must be a boolean");
  }
  
  logger.info(`Admin ${isConfirmed ? 'restoring' : 'suspending'} VIP privileges for user ${userId}`);
  
  const vipTier = await vipService.setVipConfirmation(userId, isConfirmed);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      { vipTier },
      `VIP privileges ${isConfirmed ? "restored" : "suspended"} successfully`
    )
  );
});

/**
 * ADMIN: Manually update user's VIP tier
 */
export const updateUserVipTier = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  logger.info(`Admin manually updating VIP tier for user ${userId}`);
  
  const vipTier = await vipService.updateUserTier(userId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      { vipTier },
      "VIP tier updated successfully"
    )
  );
});

/**
 * ADMIN: Get VIP statistics
 */
export const getVipStatistics = asyncHandler(async (req: Request, res: Response) => {
  const VipTierModel = (await import("../models/vip-tier.model")).default;
  const { VipTierLevel } = await import("../models/vip-tier.model");
  
  // Get count of users in each tier
  const tierCounts = await VipTierModel.aggregate([
    {
      $group: {
        _id: "$currentTier",
        count: { $sum: 1 },
        totalSpending: { $sum: "$last7DaysSpending" },
        avgSpending: { $avg: "$last7DaysSpending" },
      },
    },
    {
      $sort: { totalSpending: -1 },
    },
  ]);
  
  // Get total VIP confirmed users
  const confirmedVipCount = await VipTierModel.countDocuments({
    isVipConfirmed: true,
    currentTier: { $ne: VipTierLevel.NONE },
  });
  
  // Get top spenders
  const topSpenders = await VipTierModel.find()
    .sort({ last7DaysSpending: -1 })
    .limit(10)
    .populate("userId", "name email");
  
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tierCounts,
        confirmedVipCount,
        topSpenders,
      },
      "VIP statistics retrieved successfully"
    )
  );
});

/**
 * Update user's birthday
 * Enhanced security: prevents birthday changes after bonus claims
 */
export const updateBirthday = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  const { birthday } = req.body;
  
  if (!birthday) {
    throw new ApiError(400, "Birthday is required");
  }
  
  // Validate birthday format (YYYY-MM-DD)
  const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!birthdayRegex.test(birthday)) {
    throw new ApiError(400, "Birthday must be in YYYY-MM-DD format");
  }
  
  // Get current user to check existing birthday
  const currentUser = await UserModel.findById(userId);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }
  
  // Get VIP tier to check birthday bonus history
  const vipTier = await vipService.getOrCreateVipTier(userId);
  
  // Security check: Prevent birthday changes if user has claimed birthday bonus THIS YEAR
  const currentYear = new Date().getFullYear();
  const hasClaimedThisYear = vipTier.birthdayBonusHistory?.some(
    (claim) => {
      const claimYear = new Date(claim.claimedDate).getFullYear();
      return claimYear === currentYear;
    }
  );
  
  if (hasClaimedThisYear) {
    throw new ApiError(
      403, 
      "Birthday cannot be changed after claiming birthday bonus this year. This prevents fraud and maintains system integrity. You can change your birthday next year if needed."
    );
  }
  
  // Additional security: Check if the new birthday was already used by this user THIS YEAR
  if (vipTier.birthdayBonusHistory) {
    const birthdayUsedThisYear = vipTier.birthdayBonusHistory.some(
      (claim) => {
        const claimYear = new Date(claim.claimedDate).getFullYear();
        return claim.birthdayUsed === birthday && claimYear === currentYear;
      }
    );
    
    if (birthdayUsedThisYear) {
      throw new ApiError(
        409,
        "This birthday has already been used for a bonus claim this year. Please use a different birthday."
      );
    }
  }
  
  logger.info(`User ${userId} updating birthday from ${currentUser.birthday} to ${birthday}`);
  
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { birthday },
    { new: true }
  );
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, { birthday: user.birthday }, "Birthday updated successfully")
  );
});

/**
 * Reset all birthday bonus claims for new year (Admin only)
 */
export const resetAllBirthdayBonusClaims = asyncHandler(async (req: Request, res: Response) => {
  const result = await vipService.resetAllBirthdayBonusClaims();
  
  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      `Successfully reset birthday bonus claims for ${result.resetCount} users`
    )
  );
});

/**
 * Get birthday bonus eligibility info
 */
export const getBirthdayBonusInfo = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  
  // Get user to check birthday
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  const bonusInfo = await vipService.getBirthdayBonusInfo(userId, user.birthday);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      bonusInfo,
      "Birthday bonus info retrieved successfully"
    )
  );
});

/**
 * Get birthday bonus history for admin monitoring
 */
export const getBirthdayBonusHistory = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  
  const vipTier = await vipService.getOrCreateVipTier(userId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      { 
        birthdayBonusHistory: vipTier.birthdayBonusHistory || [],
        totalClaims: vipTier.birthdayBonusHistory?.length || 0,
        lastClaimDate: vipTier.lastBirthdayBonusDate
      },
      "Birthday bonus history retrieved successfully"
    )
  );
});

