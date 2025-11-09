import crypto from "crypto";
import { Request, Response } from "express";
import UserBonusModel from "../models/bonus.model";
import transactionModel from "../models/transaction.model";
import UserModel from "../models/user.model";
import walletModel from "../models/wallet.model";
import WithdrawalRequestModel from "../models/withdrawal-request.model";
import { PaymentGatewayFactory } from "../services/payment/gateway.factory";
import { SoapPaymentGateway } from "../services/payment/interfaces";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { getUserFromRequest } from "../utils/get-user";
import { sendEmail, sendEmailNotify } from "../utils/mail";
import Mailgen from "mailgen";
import socketService from "../services/socket.service";
import { SocketEvents } from "../types/socket.types";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import twilioService from "../services/twilio.service";
import { formatPhoneNumber } from "../utils/phone-formatter";

// Create a new withdrawal request
export const createWithdrawalRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      amount,
      gameName,
      username,
      walletAddress,
      walletCurrency,
      paymentGateway = "soap",
    } = req.body;
    const { _id: userId } = getUserFromRequest(req);

    if (!amount || amount <= 0) {
      throw new ApiError(400, "Invalid amount");
    }

    if (!gameName && !username) {
      throw new ApiError(
        400,
        "Please use the gameName and username fields to create a withdrawal request."
      );
    }
    console.log(paymentGateway, "paymentGateway");
    // Validate wallet address for Plisio
    if (paymentGateway === "plisio" && !walletAddress) {
      throw new ApiError(
        400,
        "Wallet address is required for crypto withdrawals"
      );
    }

    // Check if user has enough sweepCoins
    const userBonus = await UserBonusModel.findOne({ userId });
    if (!userBonus) {
      throw new ApiError(404, "User bonus record not found");
    }

    if (userBonus.sweepCoins < amount && gameName === "featuredGames") {
      throw new ApiError(400, "Insufficient sweep coins");
    }

    // Create withdrawal request
    const withdrawalRequest = await WithdrawalRequestModel.create({
      userId,
      amount,
      walletAddress,
      walletCurrency,
      paymentGateway,
      status: "pending",
    });

    if (gameName) {
      withdrawalRequest.gameName = gameName;
    }
    if (username) {
      withdrawalRequest.username = username;
    }

    // Deduct sweepCoins immediately to prevent multiple requests with same balance
    if (gameName === "featuredGames") {
      userBonus.sweepCoins -= amount;
      await userBonus.save();
    }
    await withdrawalRequest.save();
    // Get user details to send notification
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Send email notification to admin
    await sendEmailNotify({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      subject: `New Redeem Request - ${gameName}`,
      mailgenContent: `
      <h2>New Redeem Request</h2>
      <p><strong>User:</strong> ${user.name?.first || ""} ${user.name?.last || ""} (${user.email})</p>
      <p><strong>Game:</strong> ${gameName}</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Amount:</strong> ${amount} ${"SC"}</p>
      <p><strong>Equivalent to:</strong> ${amount}${"USD"}</p>
      <p><strong>Request ID:</strong> ${withdrawalRequest._id}</p>
      <p><strong>Status:</strong> Pending</p>
      <p>Please review and process this request.</p>
    `,
    });

    // Send socket notification to all admins
    socketService.sendToAdmins(SocketEvents.WITHDRAWAL_REQUEST, {
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
      type: "withdrawal_request",
      requestId: withdrawalRequest._id.toString(),
      userId: user._id.toString(),
      userName: `${user.name?.first || ""} ${user.name?.last || ""}`,
      userEmail: user.email,
      amount: withdrawalRequest.amount,
      gameName: withdrawalRequest.gameName,
      username: withdrawalRequest.username,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          withdrawalRequest,
          "Redeem request submitted successfully"
        )
      );
  }
);

// Get a single withdrawal request by ID
export const getWithdrawalRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { _id: userId } = getUserFromRequest(req);

    // Determine if user is admin (this will be checked by middleware for admin routes)
    const isAdmin = (req.user as any)?.role === "ADMIN";

    const query = isAdmin ? { _id: id } : { _id: id, userId };

    const withdrawalRequest = await WithdrawalRequestModel.findOne(
      query
    ).populate("userId", "name email");

    if (!withdrawalRequest) {
      throw new ApiError(404, "Redeem request not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          withdrawalRequest,
          "Redeem request retrieved successfully"
        )
      );
  }
);

// Get all withdrawal requests for the current user
export const getUserWithdrawalRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);
    const { page = 1, limit = 10, status } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const [withdrawalRequests, total] = await Promise.all([
      WithdrawalRequestModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      WithdrawalRequestModel.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          withdrawalRequests,
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
        "Redeem requests retrieved successfully"
      )
    );
  }
);

// Admin: Get all withdrawal requests
export const getAllWithdrawalRequests = asyncHandler(
  async (req: Request, res: Response) => {
    // Admin check is handled by the middleware
    const { page = 1, limit = 10, status, paymentGateway, email } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    let query: any = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by payment gateway if provided
    if (paymentGateway) {
      query.paymentGateway = paymentGateway;
    }

    // If email is provided, first find users with that email
    if (email) {
      const users = await UserModel.find({
        email: { $regex: new RegExp(email as string, "i") },
      }).select("_id");

      if (users.length > 0) {
        const userIds = users.map((user) => user._id);
        query.userId = { $in: userIds };
      } else {
        // If no users found with this email, return empty result
        return res.status(200).json(
          new ApiResponse(
            200,
            {
              withdrawalRequests: [],
              total: 0,
              page: pageNumber,
              limit: limitNumber,
              totalPages: 0,
            },
            "No users found with this email"
          )
        );
      }
    }

    const [withdrawalRequests, total] = await Promise.all([
      WithdrawalRequestModel.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      WithdrawalRequestModel.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          withdrawalRequests,
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
        "All Redeem requests retrieved successfully"
      )
    );
  }
);

// Admin: Approve a withdrawal request
export const approveWithdrawalRequest = asyncHandler(
  async (req: Request, res: Response) => {
    // Admin check is handled by the middleware
    const { id } = req.params;

    // Get the withdrawal request with populated user data
    const withdrawalRequest = await WithdrawalRequestModel.findById(
      id
    ).populate("userId", "email _id");

    if (!withdrawalRequest) {
      throw new ApiError(404, "Redeem request not found");
    }

    // if (withdrawalRequest.status !== 'pending') {
    //   throw new ApiError(400, `Request cannot be approved. Current status: ${withdrawalRequest.status}`);
    // }
    console.log(withdrawalRequest, "Redeem request");
    // Use the populated userId (which is now a User document)
    const userEmail = (withdrawalRequest.userId as any).email;
    const userId = withdrawalRequest.userId._id;

    if (!userEmail) {
      throw new ApiError(404, "User email not found");
    }

    const wallet = await walletModel.findOne({ userId });
    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }

    // Process the withdrawal based on payment gateway

    let result;
    const orderId = crypto.randomBytes(16).toString("hex");

    if (withdrawalRequest.paymentGateway === "soap") {
      const gateway = PaymentGatewayFactory.getGateway(
        withdrawalRequest.paymentGateway as any
      );

      // Process Soap withdrawal
      const soapGateway = gateway as SoapPaymentGateway;
      result = await soapGateway.processWithdrawal(
        withdrawalRequest.amount,
        userId.toString()
      );

      // Update withdrawal request
      withdrawalRequest.invoiceUrl = result.checkoutUrl;

      // Send email to user with the checkout URL
      await sendWithdrawalEmail(
        withdrawalRequest._id,
        withdrawalRequest.userId as any,
        withdrawalRequest.amount,
        result.checkoutUrl,
        "soap"
      );
    } else {
      // Notify user their request was approved
      await sendWithdrawalEmail(
        withdrawalRequest._id,
        withdrawalRequest.userId as any,
        withdrawalRequest.amount,
        null,
        withdrawalRequest.paymentGateway
      );
    }
    withdrawalRequest.status = "approved";
    withdrawalRequest.approvedAt = new Date();

    await transactionModel.create({
      userId,
      walletId: wallet._id,
      type: "withdrawal",
      amount: withdrawalRequest.amount,
      currency: wallet.currency,
      status: "pending",
      paymentGateway: withdrawalRequest.paymentGateway,
      gatewayInvoiceId:
        withdrawalRequest.paymentGateway === "soap"
          ? result.checkoutId
          : orderId,
      gatewayTransactionId:
        withdrawalRequest.paymentGateway === "soap"
          ? result.checkoutId
          : orderId,
      metadata:
        withdrawalRequest.paymentGateway === "soap"
          ? {
              checkoutUrl: result.checkoutUrl,
              status: result.status,
              game: withdrawalRequest.gameName,
              withdrawalRequestId: withdrawalRequest._id.toString(),
            }
          : {
              withdrawalRequestId: withdrawalRequest._id.toString(),
              walletAddress: withdrawalRequest.walletAddress,
              amount: withdrawalRequest.amount,
              status: withdrawalRequest.status,
            },
    });

    await withdrawalRequest.save();

    // Send socket notification to the user
    socketService.sendToUser(
      userId.toString(),
      SocketEvents.WITHDRAWAL_STATUS_UPDATED,
      {
        id: uuidv4(),
        timestamp: new Date(),
        read: false,
        type: "withdrawal_status_updated",
        requestId: withdrawalRequest._id.toString(),
        status: withdrawalRequest.status,
        amount: withdrawalRequest.amount,
        checkoutUrl:
          withdrawalRequest.paymentGateway === "soap"
            ? result.checkoutUrl
            : null,
        message: "Your withdrawal request has been approved",
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          withdrawalRequest,
          "Redeem request approved successfully"
        )
      );
  }
);

// Admin: Reject a withdrawal request
export const rejectWithdrawalRequest = asyncHandler(
  async (req: Request, res: Response) => {
    // Admin check is handled by the middleware
    const { id } = req.params;
    const { adminComment } = req.body;

    // Get the withdrawal request with populated user data
    const withdrawalRequest = await WithdrawalRequestModel.findById(
      id
    ).populate("userId", "email _id");

    if (!withdrawalRequest) {
      throw new ApiError(404, "Redeem request not found");
    }

    if (withdrawalRequest.status !== "pending") {
      throw new ApiError(
        400,
        `Request cannot be rejected. Current status: ${withdrawalRequest.status}`
      );
    }

    // Use the populated userId (which is now a User document)
    const userEmail = (withdrawalRequest.userId as any).email;
    const userId = withdrawalRequest.userId._id;

    if (!userEmail) {
      throw new ApiError(404, "User email not found");
    }

    // Get user's bonus account to refund the sweepCoins
    const userBonus = await UserBonusModel.findOne({ userId });
    if (!userBonus) {
      throw new ApiError(404, "User bonus not found");
    }

    // Refund the sweepCoins
    if (withdrawalRequest.gameName === "featuredGames") {
      userBonus.sweepCoins += withdrawalRequest.amount;
      await userBonus.save();
    }
    // Update the withdrawal request
    withdrawalRequest.status = "rejected";
    withdrawalRequest.adminComment = adminComment;
    withdrawalRequest.rejectedAt = new Date();
    await withdrawalRequest.save();

    // Send email to user about the rejection
    await sendEmail({
      email: userEmail,
      subject: `Your Withdrawal Request was Rejected`,
      mailgenContent: {
        body: {
          name: `user`,
          intro: `We're sorry, but your request to desposit amount ${withdrawalRequest.gameName ? "in " + withdrawalRequest.gameName : ""} was rejected.`,
          table: {
            data: [
              {
                item: "Game",
                description: withdrawalRequest.gameName || "Not specified",
              },
              {
                item: "Amount",
                description: `${withdrawalRequest.amount} SC`,
              },
              {
                item: "Status",
                description: "Rejected",
              },
              {
                item: "Reason",
                description: adminComment || "Not specified",
              },
            ],
            columns: {
              customWidth: {
                item: "30%",
                description: "70%",
              },
            },
          },
          outro:
            "If the request is with bonus SweepCoins then it will be refunded to your wallet else it will not be deducted from your game rewards.",
        },
      },
    });

    // Send socket notification to the user
    socketService.sendToUser(
      userId.toString(),
      SocketEvents.WITHDRAWAL_STATUS_UPDATED,
      {
        id: uuidv4(),
        timestamp: new Date(),
        read: false,
        type: "withdrawal_status_updated",
        requestId: withdrawalRequest._id.toString(),
        status: withdrawalRequest.status,
        amount: withdrawalRequest.amount,
        message: adminComment || "Your withdrawal request has been rejected",
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          withdrawalRequest,
          "Redeem request rejected successfully"
        )
      );
  }
);

// Admin: Mark a withdrawal as processed
export const markWithdrawalProcessed = asyncHandler(
  async (req: Request, res: Response) => {
    // Admin check is handled by the middleware
    const { id } = req.params;
    const { adminComment } = req.body;

    const withdrawalRequest = await WithdrawalRequestModel.findById(
      id
    ).populate("userId", "email name phone isSmsOpted");

    if (!withdrawalRequest) {
      throw new ApiError(404, "Redeem request not found");
    }

    if (withdrawalRequest.status !== "approved") {
      throw new ApiError(
        400,
        `Request cannot be marked as processed. Current status: ${withdrawalRequest.status}`
      );
    }

    // Update the status to processed
    withdrawalRequest.status = "processed";
    withdrawalRequest.adminComment = adminComment;
    withdrawalRequest.processedAt = new Date();
    await withdrawalRequest.save();

    // Update associated transaction if exists
    const transaction = await transactionModel.findOne({
      "metadata.withdrawalRequestId": withdrawalRequest._id.toString(),
    });

    if (transaction) {
      transaction.status = "completed";
      await transaction.save();
    }

    // Send email notification to user
    const userEmail = (withdrawalRequest.userId as any).email;
    const userId = withdrawalRequest.userId._id;
    const user = withdrawalRequest.userId as any;

    if (userEmail) {
      await sendEmailNotify({
        email: userEmail,
        subject: "Your Withdrawal Has Been Processed",
        mailgenContent: `
        <h2>Withdrawal Processed</h2>
        <p>Your withdrawal request for ${withdrawalRequest.amount} SC has been processed successfully.</p>
        ${adminComment ? `<p><strong>Note:</strong> ${adminComment}</p>` : ""}
        <p>If you have any questions, please contact our support team.</p>
      `,
      });
    }

    // Send SMS notification to user (if they have SMS enabled)
    // if (user.phone && user.isSmsOpted) {
    if (user.phone) {
      try {
        const formattedPhone = formatPhoneNumber(user.phone);
        if (formattedPhone) {
          const firstName = user.name?.first || "Player";

          const smsMessage = `🎉 Redemption Processed\n\nGTOA Redemption Update\n\nHello ${firstName},\n\nYour redemption request for ${withdrawalRequest.amount} SC has been successfully processed.\n\nYou may now complete the transfer to your selected method of payment under "Redeem Loot."\n\nFunds will appear in your account within 2 hours.\n\nFor questions, text us at 702-356-3435 or DM us at http://m.me/105542688498394.`;

          const smsResult = await twilioService.sendTransactionalSMS(
            formattedPhone,
            {
              playerName: firstName,
              transactionType: "withdrawal",
              amount: withdrawalRequest.amount,
              currency: "SC",
              transactionId: withdrawalRequest._id.toString(),
              status: "completed",
            },
            smsMessage
          );

          if (smsResult.success) {
            logger.info(
              `Redemption processed SMS sent to ${formattedPhone} for request ${withdrawalRequest._id}. SID: ${smsResult.sid}`
            );
          } else {
            logger.error(
              `Failed to send redemption processed SMS to ${formattedPhone}: ${smsResult.error}`
            );
          }
        } else {
          logger.warn(
            `Invalid phone number format for user ${userId}: ${user.phone}`
          );
        }
      } catch (smsError) {
        logger.error(
          `Failed to send SMS notification for processed redemption ${withdrawalRequest._id}:`,
          smsError
        );
        // Don't fail the process if SMS fails
      }
    }

    // Send socket notification to the user
    socketService.sendToUser(
      userId.toString(),
      SocketEvents.WITHDRAWAL_STATUS_UPDATED,
      {
        id: uuidv4(),
        timestamp: new Date(),
        read: false,
        type: "withdrawal_status_updated",
        requestId: withdrawalRequest._id.toString(),
        status: withdrawalRequest.status,
        amount: withdrawalRequest.amount,
        message: "Your withdrawal request has been processed",
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          withdrawalRequest,
          "Redeem request marked as processed successfully"
        )
      );
  }
);

// Helper: Send email for approved withdrawal
const sendWithdrawalEmail = async (
  id: string,
  user: { email: string; name: { first: string; last: string } },
  amount: number,
  checkoutUrl: string | null,
  gateway: "soap" | "plisio" | "payouts" | "goat"
) => {
  try {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "GOLDEN TICKET ONLINE ARCADE AND CASINO",
        link: "https://gtoarcade.com",
      },
    });

    let subject = "Your Redemption Request Has Been Approved";

    // Create email content based on gateway type
    const content: Mailgen.Content = {
      body: {
        name: `${user.name?.first || ""} ${user.name?.last || ""}`,
        intro: "Your redemption request has been approved!",
        table: {
          data: [
            {
              item: "Amount Approved",
              description: `${amount} Sweep Coins`,
            },
            {
              item: "Equivalent Reward",
              description: `${amount} USD`,
            },
            {
              item: "Redemption Method",
              description:
                gateway === "soap"
                  ? "Link Money, ACH"
                  : gateway === "plisio"
                    ? "Crypto"
                    : "Payouts",
            },
            {
              item: "RedeemId",
              description: id,
            },
            {
              item: "Expected Delivery",
              description:
                gateway === "soap" ? "Within 24hrs" : "Within 24-48hrs",
            },
          ],
          columns: {
            customWidth: {
              item: "30%",
              description: "70%",
            },
          },
        },
        outro: [
          gateway === "plisio"
            ? "Our team will process your crypto redemption shortly and you will receive another email once the transaction is complete."
            : gateway === "payouts"
              ? "Your redemption request is being processed. You’ll receive another email once the transaction is complete."
              : "",
          "Reminder: Only SC earned through gameplay, promotions, or an approved alternative method of entry (AMOE) are eligible for redemption. SC received as a bonus with Gold Coin purchases are for gameplay only and are not redeemable.",
          "Thanks for being part of the GTOA community!",
          "GTOA sweepstakes promotions are administered in accordance with our Official Rules. No purchase necessary. Void where prohibited.",
          "View our official sweepstake rules at: https://gtoarcade.com/sweepstake-rules",
          "View our terms and conditions at: https://gtoarcade.com/terms-and-conditions",
        ].filter((text) => text !== ""),
      },
    };

    // Add action button for soap gateway with checkout URL
    if (gateway === "soap" && checkoutUrl) {
      content.body.action = {
        instructions:
          "Please click the button below to complete your redemption:",
        button: {
          color: "#22BC66",
          text: "Complete Redemption",
          link: checkoutUrl,
        },
      };
    }

    // Send email notification to user
    await sendEmail({
      email: user.email,
      subject,
      mailgenContent: content,
    });
  } catch (error) {
    console.error("Error sending redemption approval email:", error);
  }
};

// Admin: Search withdrawal requests with more flexible options
export const searchWithdrawalRequests = asyncHandler(
  async (req: Request, res: Response) => {
    // Admin check is handled by the middleware
    const {
      page = 1,
      limit = 10,
      status,
      paymentGateway,
      email,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      walletAddress,
    } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    let query: any = {};

    // Filter by status if provided
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    // Filter by payment gateway if provided
    if (paymentGateway) {
      query.paymentGateway = paymentGateway;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo as string);
      }
    }

    // Filter by amount range
    if (amountMin || amountMax) {
      query.amount = {};
      if (amountMin) {
        query.amount.$gte = parseFloat(amountMin as string);
      }
      if (amountMax) {
        query.amount.$lte = parseFloat(amountMax as string);
      }
    }

    // Filter by wallet address
    if (walletAddress) {
      query.walletAddress = {
        $regex: new RegExp(walletAddress as string, "i"),
      };
    }

    // If email is provided, first find users with that email
    if (email) {
      const users = await UserModel.find({
        email: { $regex: new RegExp(email as string, "i") },
      }).select("_id");

      if (users.length > 0) {
        const userIds = users.map((user) => user._id);
        query.userId = { $in: userIds };
      } else {
        // If no users found with this email, return empty result
        return res.status(200).json(
          new ApiResponse(
            200,
            {
              withdrawalRequests: [],
              total: 0,
              page: pageNumber,
              limit: limitNumber,
              totalPages: 0,
            },
            "No users found with this email"
          )
        );
      }
    }

    const [withdrawalRequests, total] = await Promise.all([
      WithdrawalRequestModel.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      WithdrawalRequestModel.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          withdrawalRequests,
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
        "Search results retrieved successfully"
      )
    );
  }
);
