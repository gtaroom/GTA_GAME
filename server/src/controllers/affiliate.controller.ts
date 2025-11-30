import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { getUserFromRequest } from "../utils/get-user";
import AffiliateModel from "../models/affiliate.model";
import UserModel from "../models/user.model";
import ReferralModel from "../models/referral.model";
import TransactionModel from "../models/transaction.model";
import { sendEmailNotify, generateAdminNotificationContent } from "../utils/mail";
import crypto from "crypto";

/**
 * Submit partnership application
 * POST /affiliate/apply
 */
export const applyForPartnership = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      email,
      name,
      company,
      website,
      phone,
      socialMedia,
      audienceSize,
      promotionMethods,
    } = req.body;
const { first: firstName, last: lastName } = name;
    // Validate required fields
    if (!email || !firstName || !lastName) {
      throw new ApiError(400, "Email, first name, and last name are required");
    }

    // Check if user is logged in
    let userId: string | undefined;
    try {
      const user = getUserFromRequest(req);
      userId = user._id.toString();
    } catch (error) {
      // User is not logged in - that's okay for affiliate applications
      userId = undefined;
    }

    // Check if user already has an application
    if (userId) {
      const existingApplication = await AffiliateModel.findOne({
        $or: [{ userId }, { email }],
      });

      if (existingApplication) {
        throw new ApiError(
          409,
          "You already have a partnership application. Please wait for review."
        );
      }
    } else {
      // Check by email only if not logged in
      const existingApplication = await AffiliateModel.findOne({ email });
      if (existingApplication) {
        throw new ApiError(
          409,
          "An application with this email already exists. Please wait for review."
        );
      }
    }

    // Create affiliate application
    const affiliate = await AffiliateModel.create({
      userId,
      email: email.toLowerCase(),
      name: {
        first: firstName,
        last: lastName,
      },
      company,
      website,
      phone,
      socialMedia: socialMedia || {},
      audienceSize,
      promotionMethods: promotionMethods || [],
      status: "pending",
    });

    // Send email notification to admin
    const adminEmailContent = generateAdminNotificationContent(
      "New Affiliate Partnership Application",
      {
        firstName: affiliate.name.first,
        lastName: affiliate.name.last,
        email: affiliate.email,
        company: affiliate.company || "N/A",
        website: affiliate.website || "N/A",
        phone: affiliate.phone || "N/A",
        audienceSize: affiliate.audienceSize || "N/A",
        socialMedia: affiliate.socialMedia || {},
        promotionMethods: affiliate.promotionMethods || [],
        applicationId: affiliate._id.toString(),
        status: affiliate.status,
        appliedAt: new Date(affiliate.createdAt).toLocaleString(),
      },
      "affiliate_application"
    );

    await sendEmailNotify({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      subject: "New Affiliate Partnership Application",
      mailgenContent: adminEmailContent,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          applicationId: affiliate._id,
          status: affiliate.status,
        },
        "Partnership application submitted successfully. We will review your application and get back to you soon."
      )
    );
  }
);

/**
 * Get application status (if logged in)
 * GET /affiliate/status
 */
export const getApplicationStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);

    const affiliate = await AffiliateModel.findOne({ userId }).select(
      "-notes"
    );

    if (!affiliate) {
      return res.status(200).json(
        new ApiResponse(
          200,
          { hasApplication: false },
          "No application found"
        )
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          hasApplication: true,
          status: affiliate.status,
          affiliateCode: affiliate.affiliateCode,
          rejectionReason: affiliate.rejectionReason,
          appliedAt: affiliate.createdAt,
          approvedAt: affiliate.approvedAt,
        },
        "Application status retrieved successfully"
      )
    );
  }
);

/**
 * Get affiliate dashboard data (if approved)
 * GET /affiliate/dashboard
 */
export const getAffiliateDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);

    const affiliate = await AffiliateModel.findOne({
      userId,
      status: "approved",
    });

    if (!affiliate) {
      throw new ApiError(
        403,
        "You are not an approved affiliate partner"
      );
    }

    // Get referral statistics using affiliate code
    // Note: We need to track affiliate referrals separately or use a different approach
    // For now, we'll get referrals where the code matches the affiliate code
    const referrals = await ReferralModel.find({
      referralCode: affiliate.affiliateCode,
    })
      .populate("referredId", "name email")
      .sort({ createdAt: -1 });

    const totalReferrals = referrals.length;
    const qualifiedReferrals = referrals.filter(
      (r) => r.status === "qualified" || r.status === "rewarded"
    ).length;
    const totalEarnings = affiliate.totalEarnings || 0;

    // Get recent referrals
    const recentReferrals = referrals.slice(0, 10).map((ref) => ({
      referredUser: ref.referredId,
      status: ref.status,
      qualifiedAt: ref.qualifiedAt,
      createdAt: ref.createdAt,
    }));

    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const affiliateLink = `${baseUrl}/register?aff=${affiliate.affiliateCode}`;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          affiliateCode: affiliate.affiliateCode,
          affiliateLink,
          commissionRate: affiliate.commissionRate || 0,
          totalReferrals,
          qualifiedReferrals,
          totalEarnings,
          recentReferrals,
        },
        "Affiliate dashboard data retrieved successfully"
      )
    );
  }
);

/**
 * Get affiliate link (for approved affiliates)
 * GET /affiliate/link
 */
export const getAffiliateLink = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);

    const affiliate = await AffiliateModel.findOne({
      userId,
      status: "approved",
    });

    if (!affiliate || !affiliate.affiliateCode) {
      throw new ApiError(403, "You are not an approved affiliate partner");
    }

    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const affiliateLink = `${baseUrl}/register?aff=${affiliate.affiliateCode}`;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          affiliateLink,
          affiliateCode: affiliate.affiliateCode,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(affiliateLink)}`,
        },
        "Affiliate link retrieved successfully"
      )
    );
  }
);

/**
 * Get affiliate dashboard using token (PUBLIC - no auth required)
 * GET /affiliate/dashboard-public?token=TOKEN
 */
export const getAffiliateDashboardPublic = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      throw new ApiError(400, "Dashboard token is required");
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find affiliate by token
    const affiliate = await AffiliateModel.findOne({
      dashboardToken: hashedToken,
      status: "approved",
    });

    if (!affiliate) {
      throw new ApiError(401, "Invalid or expired dashboard token");
    }

    // Check if token is expired
    if (
      affiliate.dashboardTokenExpiry &&
      new Date() > affiliate.dashboardTokenExpiry
    ) {
      throw new ApiError(401, "Dashboard token has expired");
    }

    if (!affiliate.affiliateCode) {
      throw new ApiError(500, "Affiliate code not found");
    }

    // Get referral statistics
    const referrals = await ReferralModel.find({
      referralCode: affiliate.affiliateCode,
    })
      .populate("referredId", "name email")
      .sort({ createdAt: -1 });

    const totalReferrals = referrals.length;
    const qualifiedReferrals = referrals.filter(
      (r) => r.status === "qualified" || r.status === "rewarded"
    ).length;
    const totalEarnings = affiliate.totalEarnings || 0;

    // Get recent referrals
    const recentReferrals = referrals.slice(0, 10).map((ref) => ({
      referredUser: ref.referredId,
      status: ref.status,
      totalSpent: ref.totalSpent,
      referrerReward: ref.referrerReward,
      qualifiedAt: ref.qualifiedAt,
      createdAt: ref.createdAt,
    }));

    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const affiliateLink = `${baseUrl}/register?aff=${affiliate.affiliateCode}`;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          affiliate: {
            name: affiliate.name,
            email: affiliate.email,
            company: affiliate.company,
            affiliateCode: affiliate.affiliateCode,
            commissionRate: affiliate.commissionRate || 0,
          },
          affiliateLink,
          totalReferrals,
          qualifiedReferrals,
          totalEarnings,
          recentReferrals,
          hasAccount: !!affiliate.userId, // Whether affiliate has a user account
        },
        "Affiliate dashboard data retrieved successfully"
      )
    );
  }
);

