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
  const { SPIN_WHEEL_REWARDS } = await import("../models/spin-wheel.model");
  
  // Return only safe configuration data (no probabilities)
  const safeConfig = SPIN_WHEEL_REWARDS.map(reward => ({
    id: reward.id,
    amount: reward.amount,
    type: reward.type,
    rarity: reward.rarity,
    description: reward.description,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      { rewards: safeConfig },
      "Spin wheel configuration retrieved successfully"
    )
  );
});

/**
 * Validate spin wheel configuration (Admin only)
 */
export const validateSpinWheelConfig = asyncHandler(async (req: Request, res: Response) => {
  const validation = spinWheelService.validateSpinWheelConfig();

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
