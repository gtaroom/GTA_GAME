import { Request, Response } from "express";
import crypto from "crypto";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { getUserFromRequest } from "../utils/get-user";
import ReferralModel from "../models/referral.model";
import UserModel from "../models/user.model";
import TransactionModel from "../models/transaction.model";

/**
 * Get user's referral link
 * GET /referral/link
 */
export const getReferralLink = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);

    const user = await UserModel.findById(userId).select("referralCode email");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Ensure user has a referral code (should be auto-generated, but just in case)
    if (!user.referralCode) {
      // Generate referral code if missing
      let code: string;
      let isUnique = false;

      while (!isUnique) {
        code = crypto.randomBytes(4).toString("hex").toUpperCase();
        const existingUser = await UserModel.findOne({ referralCode: code });
        if (!existingUser) {
          isUnique = true;
          user.referralCode = code;
          await user.save();
        }
      }
    }

    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const referralLink = `${baseUrl}/register?ref=${user.referralCode}`;

    return res.status(200).json(
      new ApiResponse(200, { referralLink, referralCode: user.referralCode }, "Referral link retrieved successfully")
    );
  }
);

/**
 * Get referral statistics
 * GET /referral/stats
 */
export const getReferralStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);

    // Get all referrals for this user
    const referrals = await ReferralModel.find({ referrerId: userId });

    // Calculate statistics
    const totalInvited = referrals.length;
    const qualified = referrals.filter((r) => r.status === "qualified" || r.status === "rewarded").length;
    const totalRewards = referrals.reduce((sum, r) => sum + (r.referrerReward || 0), 0);

    // Get recent referrals (last 10)
    const recentReferrals = await ReferralModel.find({ referrerId: userId })
      .populate("referredId", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("referredId status qualifiedAt createdAt");

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalInvited,
          qualified,
          totalRewards,
          recentReferrals,
        },
        "Referral statistics retrieved successfully"
      )
    );
  }
);

/**
 * Generate QR code for referral link
 * POST /referral/generate-qr
 * Note: QR code generation should be handled on the frontend, but we can return the link
 */
export const generateQRCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);

    const user = await UserModel.findById(userId).select("referralCode");
    if (!user || !user.referralCode) {
      throw new ApiError(404, "User referral code not found");
    }

    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const referralLink = `${baseUrl}/register?ref=${user.referralCode}`;

    // Return the link - frontend can generate QR code using a library like qrcode or react-qr-code
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          referralLink,
          referralCode: user.referralCode,
          // QR code generation should be done on frontend
          // You can use: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${referralLink}
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`,
        },
        "QR code data generated successfully"
      )
    );
  }
);

/**
 * Check if a referral code is valid (public endpoint)
 * GET /referral/validate/:code
 */
export const validateReferralCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.params;

    if (!code) {
      throw new ApiError(400, "Referral code is required");
    }

    const user = await UserModel.findOne({ referralCode: code.toUpperCase() }).select("name email");
    if (!user) {
      return res.status(200).json(
        new ApiResponse(200, { valid: false }, "Referral code not found")
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          valid: true,
          referrerName: `${user.name?.first || ""} ${user.name?.last || ""}`.trim(),
        },
        "Referral code is valid"
      )
    );
  }
);

