import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import AffiliateModel from "../models/affiliate.model";
import { sendEmailNotify, generateUserNotificationContent } from "../utils/mail";
import crypto from "crypto";
import { logger } from "../utils/logger";

/**
 * Get all affiliate applications (Admin only)
 * GET /admin/affiliates
 */
export const getAllAffiliates = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, status, search } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const filter: any = {};

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { "name.first": { $regex: search, $options: "i" } },
        { "name.last": { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { affiliateCode: { $regex: search, $options: "i" } },
      ];
    }

    const [affiliates, total] = await Promise.all([
      AffiliateModel.find(filter)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      AffiliateModel.countDocuments(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          affiliates,
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            pages: Math.ceil(total / limitNumber),
          },
        },
        "Affiliate applications retrieved successfully"
      )
    );
  }
);

/**
 * Get single affiliate application details (Admin only)
 * GET /admin/affiliates/:id
 */
export const getAffiliateById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const affiliate = await AffiliateModel.findById(id).populate(
      "userId",
      "name email phone"
    );

    if (!affiliate) {
      throw new ApiError(404, "Affiliate application not found");
    }

    return res.status(200).json(
      new ApiResponse(200, affiliate, "Affiliate application retrieved successfully")
    );
  }
);

/**
 * Approve affiliate application (Admin only)
 * POST /admin/affiliates/:id/approve
 */
export const approveAffiliate = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { commissionRate = 15, notes } = req.body; // Default 15% commission

    const affiliate = await AffiliateModel.findById(id);

    if (!affiliate) {
      throw new ApiError(404, "Affiliate application not found");
    }

    if (affiliate.status !== "pending") {
      throw new ApiError(
        400,
        `Application cannot be approved. Current status: ${affiliate.status}`
      );
    }

    // Generate unique affiliate code
    let affiliateCode: string = "";
    let isUnique = false;

    while (!isUnique) {
      // Generate a random 8-character alphanumeric code
      affiliateCode = crypto.randomBytes(4).toString("hex").toUpperCase();
      const existingAffiliate = await AffiliateModel.findOne({
        affiliateCode,
      });
      if (!existingAffiliate) {
        isUnique = true;
      }
    }

    // Ensure affiliateCode is assigned (TypeScript safety check)
    if (!affiliateCode) {
      throw new ApiError(500, "Failed to generate affiliate code");
    }

    // Generate secure dashboard token for public access (no account required)
    const unHashedToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(unHashedToken)
      .digest("hex");
    // Token expires in 1 year (can be adjusted)
    const tokenExpiry = new Date();
    tokenExpiry.setFullYear(tokenExpiry.getFullYear() + 1);

    affiliate.dashboardToken = hashedToken;
    affiliate.dashboardTokenExpiry = tokenExpiry;

    // Update affiliate
    affiliate.status = "approved";
    affiliate.affiliateCode = affiliateCode;
    affiliate.commissionRate = commissionRate;
    affiliate.approvedAt = new Date();
    if (notes) {
      affiliate.notes = notes;
    }
    await affiliate.save();

    // Generate affiliate link
    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const affiliateLink = `${baseUrl}/register?aff=${affiliateCode}`;
    
    // Generate dashboard access link (for public affiliates without account)
    const dashboardLink = `${baseUrl}/affiliate/your/dashboard?token=${unHashedToken}`;

    // Send approval email to affiliate
    const userContent = generateUserNotificationContent(
      "Your Affiliate Partnership Has Been Approved!",
      {
        firstName: affiliate.name.first,
        lastName: affiliate.name.last,
        affiliateCode: affiliateCode,
        commissionRate: commissionRate,
        affiliateLink: affiliateLink,
        dashboardLink: dashboardLink,
        userId: affiliate.userId,
      },
      "affiliate_approved"
    );

    await sendEmailNotify({
      email: affiliate.email,
      subject: "Your Affiliate Partnership Has Been Approved!",
      mailgenContent: userContent,
    });

    logger.info(
      `Affiliate application approved: ${affiliate._id}, code: ${affiliateCode}, commission: ${commissionRate}%`
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          affiliate: {
            _id: affiliate._id,
            email: affiliate.email,
            name: affiliate.name,
            affiliateCode: affiliateCode,
            commissionRate: commissionRate,
            status: affiliate.status,
            approvedAt: affiliate.approvedAt,
          },
        },
        "Affiliate application approved successfully"
      )
    );
  }
);

/**
 * Reject affiliate application (Admin only)
 * POST /admin/affiliates/:id/reject
 */
export const rejectAffiliate = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rejectionReason, notes } = req.body;

    const affiliate = await AffiliateModel.findById(id);

    if (!affiliate) {
      throw new ApiError(404, "Affiliate application not found");
    }

    if (affiliate.status !== "pending") {
      throw new ApiError(
        400,
        `Application cannot be rejected. Current status: ${affiliate.status}`
      );
    }

    // Update affiliate
    affiliate.status = "rejected";
    affiliate.rejectionReason = rejectionReason || "Application did not meet our partnership criteria.";
    affiliate.rejectedAt = new Date();
    if (notes) {
      affiliate.notes = notes;
    }
    await affiliate.save();

    // Send rejection email to affiliate
    const userContent = generateUserNotificationContent(
      "Affiliate Partnership Application Update",
      {
        firstName: affiliate.name.first,
        lastName: affiliate.name.last,
        rejectionReason: affiliate.rejectionReason,
      },
      "affiliate_rejected"
    );

    await sendEmailNotify({
      email: affiliate.email,
      subject: "Affiliate Partnership Application Update",
      mailgenContent: userContent,
    });

    logger.info(`Affiliate application rejected: ${affiliate._id}`);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          affiliate: {
            _id: affiliate._id,
            email: affiliate.email,
            name: affiliate.name,
            status: affiliate.status,
            rejectionReason: affiliate.rejectionReason,
            rejectedAt: affiliate.rejectedAt,
          },
        },
        "Affiliate application rejected successfully"
      )
    );
  }
);

/**
 * Update affiliate details (Admin only)
 * PUT /admin/affiliates/:id
 */
export const updateAffiliate = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { commissionRate, notes, status } = req.body;

    const affiliate = await AffiliateModel.findById(id);

    if (!affiliate) {
      throw new ApiError(404, "Affiliate application not found");
    }

    // Update allowed fields
    if (commissionRate !== undefined) {
      affiliate.commissionRate = commissionRate;
    }
    if (notes !== undefined) {
      affiliate.notes = notes;
    }
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      affiliate.status = status as "pending" | "approved" | "rejected";
    }

    await affiliate.save();

    return res.status(200).json(
      new ApiResponse(200, affiliate, "Affiliate updated successfully")
    );
  }
);

/**
 * Get affiliate statistics (Admin only)
 * GET /admin/affiliates/stats
 */
export const getAffiliateStats = asyncHandler(
  async (req: Request, res: Response) => {
    const [total, pending, approved, rejected] = await Promise.all([
      AffiliateModel.countDocuments(),
      AffiliateModel.countDocuments({ status: "pending" }),
      AffiliateModel.countDocuments({ status: "approved" }),
      AffiliateModel.countDocuments({ status: "rejected" }),
    ]);

    // Calculate total earnings from all approved affiliates
    const totalEarningsResult = await AffiliateModel.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $ifNull: ["$totalEarnings", 0] } },
          totalReferrals: { $sum: { $ifNull: ["$totalReferrals", 0] } },
        },
      },
    ]);

    const stats = {
      total,
      pending,
      approved,
      rejected,
      totalEarnings: totalEarningsResult[0]?.totalEarnings || 0,
      totalReferrals: totalEarningsResult[0]?.totalReferrals || 0,
    };

    return res.status(200).json(
      new ApiResponse(200, stats, "Affiliate statistics retrieved successfully")
    );
  }
);

