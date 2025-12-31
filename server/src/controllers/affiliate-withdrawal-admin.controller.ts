import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import AffiliateModel from "../models/affiliate.model";
import AffiliateWithdrawalRequestModel from "../models/affiliate-withdrawal-request.model";
import { sendEmailNotify, generateUserNotificationContent } from "../utils/mail";
import { logger } from "../utils/logger";

/**
 * Get all withdrawal requests (Admin only)
 * GET /admin/affiliate/withdrawals
 */
export const getAllWithdrawalRequests = asyncHandler(
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
      // Search by affiliate email, name, or affiliate code
      const affiliates = await AffiliateModel.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { "name.first": { $regex: search, $options: "i" } },
          { "name.last": { $regex: search, $options: "i" } },
          { affiliateCode: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const affiliateIds = affiliates.map((a) => a._id);
      filter.affiliateId = { $in: affiliateIds };
    }

    const [withdrawals, total] = await Promise.all([
      AffiliateWithdrawalRequestModel.find(filter)
        .populate("affiliateId", "name email affiliateCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      AffiliateWithdrawalRequestModel.countDocuments(filter),
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
        "Withdrawal requests retrieved successfully"
      )
    );
  }
);

/**
 * Get single withdrawal request (Admin only)
 * GET /admin/affiliate/withdrawals/:id
 */
export const getWithdrawalRequestById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const withdrawal = await AffiliateWithdrawalRequestModel.findById(id)
      .populate("affiliateId");

    if (!withdrawal) {
      throw new ApiError(404, "Withdrawal request not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        withdrawal,
        "Withdrawal request retrieved successfully"
      )
    );
  }
);

/**
 * Approve withdrawal request (Admin only)
 * POST /admin/affiliate/withdrawals/:id/approve
 */
export const approveWithdrawalRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const withdrawal = await AffiliateWithdrawalRequestModel.findById(id)
      .populate("affiliateId");

    if (!withdrawal) {
      throw new ApiError(404, "Withdrawal request not found");
    }

    if (withdrawal.status !== "pending") {
      throw new ApiError(
        400,
        `Withdrawal request cannot be approved. Current status: ${withdrawal.status}`
      );
    }

    const affiliate = withdrawal.affiliateId as any;
    if (!affiliate) {
      throw new ApiError(404, "Affiliate not found");
    }

    // Update withdrawal status
    withdrawal.status = "approved";
    withdrawal.approvedAt = new Date();
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }
    await withdrawal.save();

    // Send approval email to affiliate
    const userContent = generateUserNotificationContent(
      "Withdrawal Request Approved",
      {
        firstName: affiliate.name.first,
        lastName: affiliate.name.last,
        amount: withdrawal.amount,
        requestId: withdrawal._id.toString(),
        status: "approved",
        adminNotes: adminNotes || "",
      },
      "affiliate_withdrawal_approved"
    );

    await sendEmailNotify({
      email: affiliate.email,
      subject: "Withdrawal Request Approved",
      mailgenContent: userContent,
    });

    logger.info(
      `Withdrawal request approved: ${withdrawal._id}, affiliate: ${affiliate._id}, amount: $${withdrawal.amount}`
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          withdrawal: {
            _id: withdrawal._id,
            amount: withdrawal.amount,
            status: withdrawal.status,
            approvedAt: withdrawal.approvedAt,
          },
        },
        "Withdrawal request approved successfully"
      )
    );
  }
);

/**
 * Reject withdrawal request (Admin only)
 * POST /admin/affiliate/withdrawals/:id/reject
 */
export const rejectWithdrawalRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    const withdrawal = await AffiliateWithdrawalRequestModel.findById(id)
      .populate("affiliateId");

    if (!withdrawal) {
      throw new ApiError(404, "Withdrawal request not found");
    }

    if (withdrawal.status !== "pending") {
      throw new ApiError(
        400,
        `Withdrawal request cannot be rejected. Current status: ${withdrawal.status}`
      );
    }

    const affiliate = withdrawal.affiliateId as any;
    if (!affiliate) {
      throw new ApiError(404, "Affiliate not found");
    }

    // Update withdrawal status
    withdrawal.status = "rejected";
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectionReason =
      rejectionReason || "Withdrawal request rejected by admin";
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }
    await withdrawal.save();

    // Send rejection email to affiliate
    const userContent = generateUserNotificationContent(
      "Withdrawal Request Rejected",
      {
        firstName: affiliate.name.first,
        lastName: affiliate.name.last,
        amount: withdrawal.amount,
        requestId: withdrawal._id.toString(),
        status: "rejected",
        rejectionReason: withdrawal.rejectionReason,
      },
      "affiliate_withdrawal_rejected"
    );

    await sendEmailNotify({
      email: affiliate.email,
      subject: "Withdrawal Request Rejected",
      mailgenContent: userContent,
    });

    logger.info(
      `Withdrawal request rejected: ${withdrawal._id}, affiliate: ${affiliate._id}, reason: ${withdrawal.rejectionReason}`
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          withdrawal: {
            _id: withdrawal._id,
            amount: withdrawal.amount,
            status: withdrawal.status,
            rejectedAt: withdrawal.rejectedAt,
            rejectionReason: withdrawal.rejectionReason,
          },
        },
        "Withdrawal request rejected successfully"
      )
    );
  }
);

/**
 * Mark withdrawal as paid (Admin only)
 * POST /admin/affiliate/withdrawals/:id/mark-paid
 */
export const markWithdrawalAsPaid = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const withdrawal = await AffiliateWithdrawalRequestModel.findById(id)
      .populate("affiliateId");

    if (!withdrawal) {
      throw new ApiError(404, "Withdrawal request not found");
    }

    if (withdrawal.status !== "approved") {
      throw new ApiError(
        400,
        `Withdrawal request must be approved before marking as paid. Current status: ${withdrawal.status}`
      );
    }

    const affiliate = withdrawal.affiliateId as any;
    if (!affiliate) {
      throw new ApiError(404, "Affiliate not found");
    }

    // Update withdrawal status
    withdrawal.status = "paid";
    withdrawal.paidAt = new Date();
    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }
    await withdrawal.save();

    // Update affiliate totalPaid
    affiliate.totalPaid = (affiliate.totalPaid || 0) + withdrawal.amount;
    await affiliate.save();

    // Send payment confirmation email to affiliate
    const userContent = generateUserNotificationContent(
      "Withdrawal Payment Processed",
      {
        firstName: affiliate.name.first,
        lastName: affiliate.name.last,
        amount: withdrawal.amount,
        requestId: withdrawal._id.toString(),
        status: "paid",
        paidAt: withdrawal.paidAt.toLocaleString(),
      },
      "affiliate_withdrawal_paid"
    );

    await sendEmailNotify({
      email: affiliate.email,
      subject: "Withdrawal Payment Processed",
      mailgenContent: userContent,
    });

    logger.info(
      `Withdrawal marked as paid: ${withdrawal._id}, affiliate: ${affiliate._id}, amount: $${withdrawal.amount}, totalPaid: $${affiliate.totalPaid}`
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          withdrawal: {
            _id: withdrawal._id,
            amount: withdrawal.amount,
            status: withdrawal.status,
            paidAt: withdrawal.paidAt,
          },
          affiliate: {
            totalEarnings: affiliate.totalEarnings || 0,
            totalPaid: affiliate.totalPaid || 0,
            availableBalance:
              (affiliate.totalEarnings || 0) - (affiliate.totalPaid || 0),
          },
        },
        "Withdrawal marked as paid successfully"
      )
    );
  }
);

/**
 * Get withdrawal statistics (Admin only)
 * GET /admin/affiliate/withdrawals/stats
 */
export const getWithdrawalStats = asyncHandler(
  async (req: Request, res: Response) => {
    const [total, pending, approved, rejected, paid] = await Promise.all([
      AffiliateWithdrawalRequestModel.countDocuments(),
      AffiliateWithdrawalRequestModel.countDocuments({ status: "pending" }),
      AffiliateWithdrawalRequestModel.countDocuments({ status: "approved" }),
      AffiliateWithdrawalRequestModel.countDocuments({ status: "rejected" }),
      AffiliateWithdrawalRequestModel.countDocuments({ status: "paid" }),
    ]);

    // Calculate total amounts by status
    const amountStats = await AffiliateWithdrawalRequestModel.aggregate([
      {
        $group: {
          _id: "$status",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      counts: {
        total,
        pending,
        approved,
        rejected,
        paid,
      },
      amounts: {
        totalPending: amountStats.find((s) => s._id === "pending")?.totalAmount || 0,
        totalApproved: amountStats.find((s) => s._id === "approved")?.totalAmount || 0,
        totalPaid: amountStats.find((s) => s._id === "paid")?.totalAmount || 0,
        totalRejected: amountStats.find((s) => s._id === "rejected")?.totalAmount || 0,
      },
    };

    return res.status(200).json(
      new ApiResponse(200, stats, "Withdrawal statistics retrieved successfully")
    );
  }
);

