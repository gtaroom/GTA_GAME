import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { getUserFromRequest } from "../utils/get-user";
import AffiliateModel from "../models/affiliate.model";
import AffiliateWithdrawalRequestModel from "../models/affiliate-withdrawal-request.model";
import { sendEmailNotify, generateAdminNotificationContent, generateUserNotificationContent } from "../utils/mail";
import crypto from "crypto";

// Minimum withdrawal amount (configurable)
const MIN_WITHDRAWAL_AMOUNT = 10; // $10 minimum

/**
 * Get affiliate balance (available for withdrawal)
 * GET /affiliate/withdrawal/balance
 */
export const getAffiliateBalance = asyncHandler(
  async (req: Request, res: Response) => {
    // Check if user is logged in or using token
    let affiliate;
    
    try {
      const user = getUserFromRequest(req);
      const { _id: userId, email: userEmail } = user;
      
      // Check by userId first, then by email (for old data where userId might not be set)
      affiliate = await AffiliateModel.findOne({
        $or: [{ userId }, { email: userEmail?.toLowerCase() }],
        status: "approved",
      });
    } catch (error) {
      // Try token-based access
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        throw new ApiError(401, "Authentication required");
      }
      
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      
      affiliate = await AffiliateModel.findOne({
        dashboardToken: hashedToken,
        status: "approved",
      });
      
      if (!affiliate || (affiliate.dashboardTokenExpiry && new Date() > affiliate.dashboardTokenExpiry)) {
        throw new ApiError(401, "Invalid or expired token");
      }
    }

    if (!affiliate) {
      throw new ApiError(404, "Affiliate not found or not approved");
    }

    const totalEarnings = affiliate.totalEarnings || 0;
    const totalPaid = affiliate.totalPaid || 0;

    // Calculate pending withdrawal amount
    const pendingWithdrawals = await AffiliateWithdrawalRequestModel.aggregate([
      {
        $match: {
          affiliateId: affiliate._id,
          status: { $in: ["pending", "approved"] },
        },
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: "$amount" },
        },
      },
    ]);

    const pendingAmount = pendingWithdrawals[0]?.totalPending || 0;
    const availableBalance = totalEarnings - totalPaid - pendingAmount;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalEarnings,
          totalPaid,
          pendingWithdrawals: pendingAmount,
          availableBalance: Math.max(0, availableBalance), // Ensure non-negative
          minimumWithdrawal: MIN_WITHDRAWAL_AMOUNT,
        },
        "Balance retrieved successfully"
      )
    );
  }
);

/**
 * Create withdrawal request
 * POST /affiliate/withdrawal/request
 */
export const createWithdrawalRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { amount, paymentMethod, paymentDetails } = req.body;

    if (!amount || amount < MIN_WITHDRAWAL_AMOUNT) {
      throw new ApiError(
        400,
        `Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT}`
      );
    }

    // Check if user is logged in or using token
    let affiliate;
    
    try {
      const user = getUserFromRequest(req);
      const { _id: userId, email: userEmail } = user;
      
      // Check by userId first, then by email (for old data where userId might not be set)
      affiliate = await AffiliateModel.findOne({
        $or: [{ userId }, { email: userEmail?.toLowerCase() }],
        status: "approved",
      });
    } catch (error) {
      // Try token-based access
      const { token } = req.body;
      if (!token || typeof token !== "string") {
        throw new ApiError(401, "Authentication required");
      }
      
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      
      affiliate = await AffiliateModel.findOne({
        dashboardToken: hashedToken,
        status: "approved",
      });
      
      if (!affiliate || (affiliate.dashboardTokenExpiry && new Date() > affiliate.dashboardTokenExpiry)) {
        throw new ApiError(401, "Invalid or expired token");
      }
    }

    if (!affiliate) {
      throw new ApiError(404, "Affiliate not found or not approved");
    }

    // Calculate available balance
    const totalEarnings = affiliate.totalEarnings || 0;
    const totalPaid = affiliate.totalPaid || 0;

    const pendingWithdrawals = await AffiliateWithdrawalRequestModel.aggregate([
      {
        $match: {
          affiliateId: affiliate._id,
          status: { $in: ["pending", "approved"] },
        },
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: "$amount" },
        },
      },
    ]);

    const pendingAmount = pendingWithdrawals[0]?.totalPending || 0;
    const availableBalance = totalEarnings - totalPaid - pendingAmount;

    if (amount > availableBalance) {
      throw new ApiError(
        400,
        `Insufficient balance. Available: $${availableBalance.toFixed(2)}`
      );
    }

    // Create withdrawal request
    const withdrawalRequest = await AffiliateWithdrawalRequestModel.create({
      affiliateId: affiliate._id,
      amount,
      paymentMethod,
      paymentDetails,
      status: "pending",
      requestedAt: new Date(),
    });

    // Send email notification to admin
    const adminContent = generateAdminNotificationContent(
      "New Affiliate Withdrawal Request",
      {
        affiliateName: `${affiliate.name.first} ${affiliate.name.last}`,
        affiliateEmail: affiliate.email,
        affiliateCode: affiliate.affiliateCode || "N/A",
        amount: amount,
        paymentMethod: paymentMethod || "Not specified",
        paymentDetails: paymentDetails || {},
        requestId: withdrawalRequest._id.toString(),
        requestedAt: new Date().toLocaleString(),
      },
      "affiliate_withdrawal_request"
    );

    await sendEmailNotify({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      subject: `New Affiliate Withdrawal Request - $${amount}`,
      mailgenContent: adminContent,
    });

    // Send confirmation email to affiliate
    const userContent = generateUserNotificationContent(
      "Withdrawal Request Submitted",
      {
        firstName: affiliate.name.first,
        lastName: affiliate.name.last,
        amount: amount,
        requestId: withdrawalRequest._id.toString(),
        status: "pending",
      },
      "affiliate_withdrawal_submitted"
    );

    await sendEmailNotify({
      email: affiliate.email,
      subject: "Withdrawal Request Submitted",
      mailgenContent: userContent,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          withdrawalRequest: {
            _id: withdrawalRequest._id,
            amount,
            status: withdrawalRequest.status,
            requestedAt: withdrawalRequest.requestedAt,
          },
          availableBalance: availableBalance - amount,
        },
        "Withdrawal request submitted successfully"
      )
    );
  }
);

/**
 * Get withdrawal history
 * GET /affiliate/withdrawal/history
 */
export const getWithdrawalHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Check if user is logged in or using token
    let affiliate;
    
    try {
      const user = getUserFromRequest(req);
      const { _id: userId, email: userEmail } = user;
      
      // Check by userId first, then by email (for old data where userId might not be set)
      affiliate = await AffiliateModel.findOne({
        $or: [{ userId }, { email: userEmail?.toLowerCase() }],
        status: "approved",
      });
    } catch (error) {
      // Try token-based access
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        throw new ApiError(401, "Authentication required");
      }
      
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      
      affiliate = await AffiliateModel.findOne({
        dashboardToken: hashedToken,
        status: "approved",
      });
      
      if (!affiliate || (affiliate.dashboardTokenExpiry && new Date() > affiliate.dashboardTokenExpiry)) {
        throw new ApiError(401, "Invalid or expired token");
      }
    }

    if (!affiliate) {
      throw new ApiError(404, "Affiliate not found or not approved");
    }

    const [withdrawals, total] = await Promise.all([
      AffiliateWithdrawalRequestModel.find({ affiliateId: affiliate._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      AffiliateWithdrawalRequestModel.countDocuments({ affiliateId: affiliate._id }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          withdrawals,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            pages: Math.ceil(total / limitNumber),
          },
        },
        "Withdrawal history retrieved successfully"
      )
    );
  }
);

