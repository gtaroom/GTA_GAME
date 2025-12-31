import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { getUserFromRequest } from "../utils/get-user";
import spinWheelService from "../services/spin-wheel.service";
import { logger } from "../utils/logger";

/**
 * Perform a spin on the wheel
 */
export const performSpin = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  logger.info(`User ${userId} attempting to spin the wheel`);

  const result = await spinWheelService.performSpin(userId, ipAddress, userAgent);

  if (!result.success) {
    throw new ApiError(400, result.message, [], result.error);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      result.result,
      result.message
    )
  );
});

/**
 * Claim spin wheel reward
 */
export const claimSpinReward = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  const { spinId } = req.body;

  if (!spinId) {
    throw new ApiError(400, "Spin ID is required");
  }

  logger.info(`User ${userId} attempting to claim spin reward: ${spinId}`);

  const result = await spinWheelService.claimSpinReward(userId, spinId);

  if (!result.success) {
    throw new ApiError(400, result.message, [], result.error);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { 
        newBalance: result.newBalance,
        spinId 
      },
      result.message
    )
  );
});

/**
 * Get user's spin history
 */
export const getSpinHistory = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  const { limit = 10, offset = 0 } = req.query;

  const limitNum = parseInt(limit as string) || 10;
  const offsetNum = parseInt(offset as string) || 0;

  // Validate limits
  if (limitNum > 50) {
    throw new ApiError(400, "Limit cannot exceed 50");
  }

  const result = await spinWheelService.getUserSpinHistory(userId, limitNum, offsetNum);

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Spin history retrieved successfully"
    )
  );
});

/**
 * Get spin wheel configuration (public endpoint)
 */
export const getSpinWheelConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await spinWheelService.getConfig();
  
  // Return only safe configuration data (no probabilities, only active rewards)
  const safeConfig = config.rewards
    .filter(reward => reward.isActive)
    .map(reward => ({
      id: reward.id,
      amount: reward.amount,
      type: reward.type,
      rarity: reward.rarity,
      description: reward.description,
    }));

  return res.status(200).json(
    new ApiResponse(
      200,
      { 
        rewards: safeConfig,
        isActive: config.isActive,
      },
      "Spin wheel configuration retrieved successfully"
    )
  );
});

/**
 * Check user's spin eligibility
 */
export const checkSpinEligibility = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  
  logger.debug(`Checking spin eligibility for user ${userId}`);
  
  const eligibility = await spinWheelService.checkSpinEligibility(userId);
  
  // Also check for random trigger (this can award spins)
  await spinWheelService.checkRandomTrigger(userId);
  
  // Re-check eligibility after random trigger check
  const updatedEligibility = await spinWheelService.checkSpinEligibility(userId);
  
  return res.status(200).json(
    new ApiResponse(
      200,
      updatedEligibility,
      updatedEligibility.message
    )
  );
});

/**
 * Get spin wheel configuration (Admin only - includes full config)
 */
export const getSpinWheelConfigAdmin = asyncHandler(async (req: Request, res: Response) => {
  const config = await spinWheelService.getConfig();

  return res.status(200).json(
    new ApiResponse(
      200,
      { config },
      "Spin wheel configuration retrieved successfully"
    )
  );
});

/**
 * Update spin wheel configuration (Admin only)
 */
export const updateSpinWheelConfig = asyncHandler(async (req: Request, res: Response) => {
  const { isActive, rewards, triggers } = req.body;
  
  logger.info("Admin updating spin wheel configuration");
  
  const updates: any = {};
  
  if (typeof isActive === "boolean") {
    updates.isActive = isActive;
  }
  
  if (rewards && Array.isArray(rewards)) {
    updates.rewards = rewards;
  }
  
  if (triggers) {
    updates.triggers = triggers;
  }
  
  const updatedConfig = await spinWheelService.updateConfig(updates);
  
  // Validate the updated configuration
  const validation = await spinWheelService.validateSpinWheelConfig();
  
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        config: updatedConfig,
        validation,
      },
      validation.valid 
        ? "Spin wheel configuration updated successfully" 
        : "Configuration updated but has validation issues"
    )
  );
});

/**
 * Validate spin wheel configuration (Admin only)
 */
export const validateSpinWheelConfig = asyncHandler(async (req: Request, res: Response) => {
  const validation = await spinWheelService.validateSpinWheelConfig();

  return res.status(200).json(
    new ApiResponse(
      200,
      validation,
      validation.valid ? "Configuration is valid" : "Configuration has issues"
    )
  );
});

/**
 * Get spin wheel statistics (Admin only)
 */
export const getSpinWheelStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await spinWheelService.getSpinWheelStats();

  return res.status(200).json(
    new ApiResponse(
      200,
      stats,
      "Spin wheel statistics retrieved successfully"
    )
  );
});
