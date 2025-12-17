import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { getUserFromRequest } from "../utils/get-user";
import vipService from "../services/vip.service";
import { logger } from "../utils/logger";

/**
 * Middleware to update user's VIP tier
 * This should be called after deposit transactions are completed
 */
export const updateVipTierMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { _id: userId } = getUserFromRequest(req);
      
      if (userId) {
        logger.debug(`Updating VIP tier for user ${userId} via middleware`);
        await vipService.updateUserTier(userId);
      }
      
      next();
    } catch (error) {
      logger.error("Error in VIP tier update middleware:", error);
      // Don't fail the request if VIP tier update fails, just log it
      next();
    }
  }
);

/**
 * Middleware to check redemption limits based on VIP tier
 * This should be used on withdrawal/redemption endpoints
 */
export const checkRedemptionLimitMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { _id: userId } = getUserFromRequest(req);
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      throw new ApiError(400, "Invalid amount");
    }
    
    logger.debug(`Checking redemption limit for user ${userId}, amount=${amount}`);
    
    const redemptionCheck = await vipService.checkRedemptionLimit(userId, amount);
    
    if (!redemptionCheck.allowed) {
      logger.warn(`Redemption limit exceeded for user ${userId}: ${redemptionCheck.reason}`);
      throw new ApiError(
        400,
        redemptionCheck.reason || "Daily redemption limit exceeded"
      );
    }
    
    next();
  }
);

/**
 * Middleware to check if user is a confirmed VIP
 */
export const requireConfirmedVip = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { _id: userId } = getUserFromRequest(req);
    
    const vipTier = await vipService.getOrCreateVipTier(userId);
    
    if (!vipTier.isVipConfirmed) {
      throw new ApiError(
        403,
        "This feature is only available to confirmed VIP members. Please contact support to verify your VIP eligibility."
      );
    }
    
    next();
  }
);

/**
 * Middleware to attach VIP status to request object
 * This adds vipStatus to the request for use in downstream handlers
 */
export const attachVipStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { _id: userId } = getUserFromRequest(req);
      
      if (userId) {
        const vipStatus = await vipService.getUserVipStatus(userId);
        (req as any).vipStatus = vipStatus;
      }
      
      next();
    } catch (error) {
      logger.error("Error in attach VIP status middleware:", error);
      // Don't fail the request if VIP status fetch fails
      next();
    }
  }
);



