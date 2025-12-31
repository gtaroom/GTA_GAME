import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import TransactionModel from "../models/transaction.model";
import WalletModel from "../models/wallet.model";
import UserModel from "../models/user.model";
import referralService from "../services/referral.service";
import { logger } from "../utils/logger";

/**
 * Simulate a deposit for testing affiliate/referral flow
 * POST /admin/test/simulate-deposit
 * 
 * This endpoint simulates a completed deposit transaction without actual payment.
 * Use this to test the referral and affiliate commission flow.
 */
export const simulateDeposit = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, amount } = req.body;

    if (!userId) {
      throw new ApiError(400, "userId is required");
    }

    if (!amount || amount <= 0) {
      throw new ApiError(400, "Valid amount is required (must be > 0)");
    }

    // Find user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Find or create wallet
    let wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      wallet = await WalletModel.create({
        userId,
        balance: 0,
      });
    }

    // Create a test transaction with status "completed"
    const transaction = await TransactionModel.create({
      userId,
      walletId: wallet._id,
      type: "deposit",
      amount,
      currency: "USD",
      status: "completed",
      paymentGateway: "plisio",
      gatewayTransactionId: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        test: true,
        simulated: true,
        simulatedAt: new Date(),
      },
    });

    // Update wallet balance
    const balanceToAdd = amount * 100; // Convert to cents/balance units
    wallet.balance += balanceToAdd;
    wallet.balance = parseFloat(wallet.balance.toFixed(2));
    await wallet.save();

    // Trigger referral qualification check
    try {
      await referralService.checkAndQualifyReferrals(
        userId.toString(),
        amount
      );
      logger.info(
        `Test deposit processed: User ${userId}, Amount: $${amount}, Referral check completed`
      );
    } catch (error) {
      logger.error("Error checking referrals during test deposit:", error);
      // Don't fail the request, just log the error
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          transaction: {
            _id: transaction._id,
            amount,
            status: transaction.status,
            createdAt: transaction.createdAt,
          },
          wallet: {
            balance: wallet.balance,
            balanceInDollars: (wallet.balance / 100).toFixed(2),
          },
          message: "Test deposit simulated successfully. Referral qualification check has been triggered.",
        },
        "Test deposit simulated successfully"
      )
    );
  }
);

/**
 * Manually trigger referral qualification check for a user
 * POST /admin/test/trigger-referral-check
 * 
 * Use this if you manually changed transaction status in database
 * and need to trigger referral qualification
 */
export const triggerReferralCheck = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    if (!userId) {
      throw new ApiError(400, "userId is required");
    }

    // Find user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Get all completed deposits for this user
    const completedDeposits = await TransactionModel.find({
      userId,
      type: "deposit",
      status: "completed",
    });

    const totalAmount = completedDeposits.reduce((sum, t) => sum + t.amount, 0);

    // Trigger referral qualification check
    // We'll call it with the total amount to ensure it processes correctly
    try {
      // Re-check all referrals for this user
      const ReferralModel = (await import("../models/referral.model")).default;
      const referrals = await ReferralModel.find({
        referredId: userId,
        status: "pending",
      });

      if (referrals.length === 0) {
        return res.status(200).json(
          new ApiResponse(
            200,
            {
              message: "No pending referrals found for this user",
              totalDeposits: totalAmount,
              referralsCount: 0,
            },
            "No referrals to process"
          )
        );
      }

      // Process each referral
      for (const referral of referrals) {
        // Calculate total spent
        const totalTransactions = await TransactionModel.aggregate([
          {
            $match: {
              userId: referral.referredId,
              type: "deposit",
              status: "completed",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        const totalSpent = totalTransactions[0]?.total || 0;

        if (totalSpent >= 20 && referral.status === "pending") {
          // Double-check status hasn't changed
          const currentReferral = await ReferralModel.findById(referral._id);
          if (!currentReferral || currentReferral.status !== "pending") {
            continue;
          }

          // Call the referral service to process qualification
          await referralService.checkAndQualifyReferrals(
            userId.toString(),
            totalSpent
          );
        }
      }

      logger.info(
        `Manual referral check triggered: User ${userId}, Total: $${totalAmount}`
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            message: "Referral qualification check completed",
            totalDeposits: totalAmount,
            referralsProcessed: referrals.length,
          },
          "Referral check completed successfully"
        )
      );
    } catch (error) {
      logger.error("Error in manual referral check:", error);
      throw new ApiError(500, "Error processing referral check");
    }
  }
);

/**
 * Get test user info (to find user ID for testing)
 * GET /admin/test/user-info?email=user@example.com
 */
export const getTestUserInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, userId } = req.query;

    let user;
    if (userId) {
      user = await UserModel.findById(userId);
    } else if (email) {
      user = await UserModel.findOne({ email: (email as string).toLowerCase() });
    } else {
      throw new ApiError(400, "Either email or userId query parameter is required");
    }

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Get wallet info
    const wallet = await WalletModel.findOne({ userId: user._id });
    
    // Get transaction history
    const transactions = await TransactionModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate total deposits
    const totalDeposits = await TransactionModel.aggregate([
      {
        $match: {
          userId: user._id,
          type: "deposit",
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            referralCode: user.referralCode,
          },
          wallet: {
            balance: wallet?.balance || 0,
            balanceInDollars: wallet ? (wallet.balance / 100).toFixed(2) : "0.00",
          },
          totalDeposits: totalDeposits[0]?.total || 0,
          recentTransactions: transactions.map((t) => ({
            _id: t._id,
            amount: t.amount,
            type: t.type,
            status: t.status,
            createdAt: t.createdAt,
            test: t.metadata?.test || false,
          })),
        },
        "User info retrieved successfully"
      )
    );
  }
);

/**
 * Get referral info for a user (to see referral status)
 * GET /admin/test/referral-info?userId=xxx
 */
export const getReferralInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.query;

    if (!userId) {
      throw new ApiError(400, "userId query parameter is required");
    }

    const ReferralModel = (await import("../models/referral.model")).default;

    // Get referrals where this user was referred
    const referralsAsReferred = await ReferralModel.find({
      referredId: userId,
    })
      .populate("referrerId", "name email")
      .sort({ createdAt: -1 });

    // Get referrals where this user is the referrer
    const referralsAsReferrer = await ReferralModel.find({
      referrerId: userId,
    })
      .populate("referredId", "name email")
      .sort({ createdAt: -1 });

    // Get total spent
    const totalDeposits = await TransactionModel.aggregate([
      {
        $match: {
          userId,
          type: "deposit",
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalSpent = totalDeposits[0]?.total || 0;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalSpent,
          qualificationThreshold: 20,
          isQualified: totalSpent >= 20,
          referralsAsReferred: referralsAsReferred.map((r) => ({
            _id: r._id,
            referralCode: r.referralCode,
            referrer: r.referrerId,
            status: r.status,
            totalSpent: r.totalSpent,
            referrerReward: r.referrerReward,
            referredReward: r.referredReward,
            qualifiedAt: r.qualifiedAt,
            createdAt: r.createdAt,
          })),
          referralsAsReferrer: referralsAsReferrer.map((r) => ({
            _id: r._id,
            referralCode: r.referralCode,
            referred: r.referredId,
            status: r.status,
            totalSpent: r.totalSpent,
            referrerReward: r.referrerReward,
            createdAt: r.createdAt,
          })),
        },
        "Referral info retrieved successfully"
      )
    );
  }
);

/**
 * Create referral record manually (for testing)
 * POST /admin/test/create-referral
 * 
 * Use this if a user registered but referral record wasn't created
 */
export const createReferralRecord = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      throw new ApiError(400, "userId and referralCode are required");
    }

    // Find user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if referral already exists
    const ReferralModel = (await import("../models/referral.model")).default;
    const existingReferral = await ReferralModel.findOne({
      referredId: userId,
    });

    if (existingReferral) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            message: "Referral record already exists",
            referral: existingReferral,
          },
          "Referral already exists"
        )
      );
    }

    // Check if it's a user referral code or affiliate code
    const code = String(referralCode).toUpperCase().trim();
    
    // Check if it's a user referral code
    const referrer = await UserModel.findOne({ referralCode: code });
    let referrerId = null;

    if (referrer && referrer._id.toString() !== userId.toString()) {
      referrerId = referrer._id;
    } else {
      // Check if it's an affiliate code
      const AffiliateModel = (await import("../models/affiliate.model")).default;
      const affiliate = await AffiliateModel.findOne({
        affiliateCode: code,
        status: "approved",
      });

      if (affiliate) {
        referrerId = affiliate.userId || null;
      } else {
        throw new ApiError(404, "Invalid referral code. Not found as user or affiliate code.");
      }
    }

    // Create referral record
    const referral = await ReferralModel.create({
      referrerId,
      referredId: userId,
      referralCode: code,
      status: "pending",
    });

    logger.info(
      `Manual referral record created: ${referrerId || "affiliate"} referred ${userId} with code ${code}`
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          referral: {
            _id: referral._id,
            referralCode: referral.referralCode,
            status: referral.status,
            referrerId: referral.referrerId,
            referredId: referral.referredId,
          },
          message: "Referral record created successfully. Now trigger qualification check if user has spent $20+",
        },
        "Referral record created successfully"
      )
    );
  }
);

/**
 * Get affiliate earnings info
 * GET /admin/test/affiliate-info?affiliateId=xxx
 */
export const getAffiliateInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { affiliateId, affiliateCode, email } = req.query;

    const AffiliateModel = (await import("../models/affiliate.model")).default;
    const ReferralModel = (await import("../models/referral.model")).default;

    let affiliate;
    if (affiliateId) {
      affiliate = await AffiliateModel.findById(affiliateId);
    } else if (affiliateCode) {
      affiliate = await AffiliateModel.findOne({ affiliateCode });
    } else if (email) {
      affiliate = await AffiliateModel.findOne({ email: (email as string).toLowerCase() });
    } else {
      throw new ApiError(400, "affiliateId, affiliateCode, or email is required");
    }

    if (!affiliate) {
      throw new ApiError(404, "Affiliate not found");
    }

    // Get all referrals with this affiliate code
    const referrals = await ReferralModel.find({
      referralCode: affiliate.affiliateCode,
    })
      .populate("referredId", "name email")
      .sort({ createdAt: -1 });

    // Calculate stats
    const qualifiedReferrals = referrals.filter(
      (r) => r.status === "qualified" || r.status === "rewarded"
    );

    const totalCommission = qualifiedReferrals.reduce(
      (sum, r) => sum + (r.referrerReward || 0),
      0
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          affiliate: {
            _id: affiliate._id,
            email: affiliate.email,
            name: affiliate.name,
            affiliateCode: affiliate.affiliateCode,
            commissionRate: affiliate.commissionRate,
            status: affiliate.status,
            totalEarnings: affiliate.totalEarnings || 0,
            totalPaid: affiliate.totalPaid || 0,
            totalReferrals: affiliate.totalReferrals || 0,
          },
          referrals: {
            total: referrals.length,
            qualified: qualifiedReferrals.length,
            pending: referrals.filter((r) => r.status === "pending").length,
          },
          calculatedCommission: totalCommission,
          referralsList: referrals.map((r) => ({
            _id: r._id,
            referredUser: r.referredId,
            status: r.status,
            totalSpent: r.totalSpent,
            commission: r.referrerReward,
            qualifiedAt: r.qualifiedAt,
            createdAt: r.createdAt,
          })),
        },
        "Affiliate info retrieved successfully"
      )
    );
  }
);
