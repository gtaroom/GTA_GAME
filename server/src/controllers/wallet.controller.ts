import crypto from "crypto";
import { Request, Response } from "express";
import TransactionModel from "../models/transaction.model";
import WalletModel from "../models/wallet.model";
import UserBonusModel from "../models/bonus.model";
import { PaymentGatewayFactory } from "../services/payment/gateway.factory";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { getUserFromRequest } from "../utils/get-user";
import { SoapPaymentGateway } from "../services/payment/interfaces";
import { IPaymentGateway } from "../services/payment/interfaces";
import withdrawalRequestModel from "../models/withdrawal-request.model";
import { logger } from "../utils/logger";
import UserModel from "../models/user.model";
import { sendEmailNotify } from "../utils/mail";
import socketService from "../services/socket.service";
import { SocketEvents } from "../types/socket.types";
import { v4 as uuidv4 } from "uuid";
import notificationService from "../services/notification.service";
import twilioService from "../services/twilio.service";
import { formatPhoneNumber } from "../utils/phone-formatter";
import vipService from "../services/vip.service";
import referralService from "../services/referral.service";
// Get user's wallet
export const getWallet = asyncHandler(async (req: Request, res: Response) => {
  const { _id: userId } = getUserFromRequest(req);
  logger.debug(`Getting wallet for user ${userId}`);

  let wallet = await WalletModel.findOne({ userId });

  if (!wallet) {
    logger.info(`Creating new wallet for user ${userId}`);
    wallet = await WalletModel.create({
      userId,
      balance: 0,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, wallet, "Wallet retrieved successfully"));
});

// Create deposit invoice
export const createDeposit = asyncHandler(
  async (req: Request, res: Response) => {
    const { amount, paymentGateway = "plisio" } = req.body;
    const { _id: userId } = getUserFromRequest(req);

    logger.info(
      `Creating deposit for ${userId}: amount=${amount}, gateway=${paymentGateway}`
    );

    if (!amount || amount <= 0) {
      logger.warn(`Invalid deposit amount: ${amount} for user ${userId}`);
      throw new ApiError(400, "Invalid amount");
    }

    let wallet = await WalletModel.findOne({ userId });
    if (!wallet) {
      logger.info(`Creating new wallet for user ${userId} during deposit flow`);
      wallet = await WalletModel.create({
        userId,
        balance: 0,
      });
    }

    const orderId = crypto.randomBytes(16).toString("hex");
    logger.debug(`Generated order ID: ${orderId}`);

    try {
      const gateway =
        paymentGateway !== "nowpayments"
          ? PaymentGatewayFactory.getGateway(paymentGateway as any)
          : null;

      let result;
      if (paymentGateway === "soap") {
        // Handle Soap deposit
        logger.debug(`Processing Soap deposit for user ${userId}`);
        const soapGateway = gateway as SoapPaymentGateway;
        result = await soapGateway.processDeposit(
          amount,
          userId.toString(),
          req.body.productId,
          req.body.returnUrl
        );
      } else if (paymentGateway === "centryos") {
        // Handle CentryOS deposit
        logger.debug(`Processing CentryOS deposit for user ${userId}`);
        const centryosGateway = gateway as SoapPaymentGateway;
        result = await centryosGateway.processDeposit(
          amount,
          userId.toString(),
          req.body.returnUrl
        );
      } else if (paymentGateway === "plisio") {
        // Handle other payment gateways
        logger.debug(`Processing ${paymentGateway} deposit for user ${userId}`);
        const regularGateway = gateway as IPaymentGateway;
        result = await regularGateway.createInvoice({
          amount,
          currency: "BTC",
          orderId,
          successUrl: `${process.env.CLIENT_URL}/wallet/success`,
          failureUrl: `${process.env.CLIENT_URL}/wallet/failure`,
          callbackUrl: `${process.env.WEBHOOK_CALLBACK_URL}/${paymentGateway}`,
        });
      } else {
        result = {
          data: {
            ...req.body.response,
          },
        };
      }
      // Create transaction record
      const transaction = await TransactionModel.create({
        userId,
        walletId: wallet._id,
        type: "deposit",
        amount,
        currency: wallet.currency,
        status: "pending",
        paymentGateway,
        gatewayInvoiceId:
          paymentGateway === "soap"
            ? result.checkoutId
            : paymentGateway === "centryos"
              ? result.paymentId
              : paymentGateway === "plisio"
                ? orderId
                : result.data.payment_id,
        gatewayTransactionId:
          paymentGateway === "soap"
            ? result.checkoutId
            : paymentGateway === "centryos"
              ? result.id
              : paymentGateway === "plisio"
                ? result?.data?.id
                : result.data.order_id,
        metadata:
          paymentGateway === "soap"
            ? {
                checkoutUrl: result.checkoutUrl,
              }
            : paymentGateway === "centryos"
              ? {
                  paymentUrl: result.paymentUrl,
                  paymentId: result.paymentId,
                  expiredAt: result.expiredAt,
                }
              : result.data,
      });

      logger.info(
        `Deposit transaction created: ${transaction._id} for user ${userId}, amount=${amount}, gateway=${paymentGateway}`
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            invoiceUrl:
              paymentGateway === "soap"
                ? result.checkoutUrl
                : paymentGateway === "centryos"
                  ? result.paymentUrl
                  : result.data.invoice_url,
            invoiceId:
              paymentGateway === "soap"
                ? result.checkoutId
                : paymentGateway === "centryos"
                  ? result.paymentId
                  : result.data.id,
          },
          `Deposit ${paymentGateway === "soap" ? "checkout" : paymentGateway === "centryos" ? "payment link" : "invoice"} created successfully`
        )
      );
    } catch (error) {
      logger.error(`Error creating deposit for user ${userId}:`, error);
      throw error;
    }
  }
);

// Process Goat Payment
export const processGoatPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { amount, paymentToken, orderId } = req.body;
    const { _id: userId, ...userDetails } = getUserFromRequest(req);

    if (!amount || amount <= 0) {
      throw new ApiError(400, "Invalid amount");
    }

    if (!paymentToken) {
      throw new ApiError(400, "Payment token is required");
    }

    if (!orderId) {
      throw new ApiError(400, "Order ID is required");
    }

    logger.info(
      `Processing Goat payment for user ${userId}: amount=${amount}, orderId=${orderId}`
    );

    try {
      // Find or create wallet for user
      let wallet = await WalletModel.findOne({ userId });
      if (!wallet) {
        logger.info(
          `Creating new wallet for user ${userId} during Goat payment flow`
        );
        wallet = await WalletModel.create({
          userId,
          balance: 0,
        });
      }

      // Get Goat gateway instance
      const gateway = PaymentGatewayFactory.getGateway("goat") as any; // GoatGateway type

      // Process the payment with the token from frontend
      const result = await gateway.processPayment({
        amount: Number(amount),
        paymentToken,
        orderId,
        firstName: userDetails.name?.first,
        lastName: userDetails.name?.last,
        email: userDetails.email,
        phone: userDetails.phone,
        address: userDetails.address?.line1,
        city: userDetails.city,
        state: userDetails.state,
        zip: userDetails.zipCode,
        country: userDetails.country,
      });

      if (!result.success) {
        logger.error(`Goat payment failed for user ${userId}:`, result.error);

        // Check if it's a token reuse issue
        const isTokenReuseError = result.error?.includes(
          "Payment Token does not exist"
        );
        const isActivityLimitError = result.error?.includes(
          "Activity limit exceeded"
        );

        // Create failed transaction record
        const transaction = await TransactionModel.create({
          userId,
          walletId: wallet._id,
          type: "deposit",
          amount: Number(amount),
          currency: wallet.currency || "USD",
          status: "failed",
          paymentGateway: "goat",
          gatewayInvoiceId: orderId,
          gatewayTransactionId: result.data?.transactionId || orderId,
          metadata: {
            error: result.error,
            paymentToken: paymentToken.substring(0, 8) + "...", // Store partial token for debugging
            isTokenReuseError,
            isActivityLimitError,
            ...result.data,
          },
        });

        // Provide specific error messages
        let errorMessage = "Payment failed";
        if (isTokenReuseError) {
          errorMessage =
            "Payment token has already been used. Please try again with a new payment form.";
        } else if (isActivityLimitError) {
          errorMessage =
            "Account activity limit exceeded. Please try again later or contact support.";
        }

        return res.status(400).json(
          new ApiResponse(
            400,
            {
              success: false,
              transactionId: transaction._id,
              orderId,
              error: result.error,
              errorType: isTokenReuseError
                ? "token_reuse"
                : isActivityLimitError
                  ? "activity_limit"
                  : "payment_failed",
              message: errorMessage,
            },
            errorMessage
          )
        );
      }

      // Payment successful - create transaction record
      const transaction = await TransactionModel.create({
        userId,
        walletId: wallet._id,
        type: "deposit",
        amount: Number(amount),
        currency: wallet.currency || "USD",
        status: "completed",
        paymentGateway: "goat",
        gatewayInvoiceId: orderId,
        gatewayTransactionId: result.data.transactionId,
        metadata: {
          authCode: result.data.authCode,
          responseText: result.data.responseText,
          avsResponse: result.data.avsResponse,
          cvvResponse: result.data.cvvResponse,
          responseCode: result.data.responseCode,
          paymentToken: paymentToken.substring(0, 8) + "...", // Store partial token for audit
        },
      });

      // Update wallet balance with VIP bonus calculation
      const coinsToAdd = Math.round(transaction.amount * 100); // Convert to coins

      // Get VIP status for bonus calculation
      const vipTier = await vipService.getOrCreateVipTier(userId);
      const bonusCalculation = vipService.calculateDepositBonus(
        transaction.amount,
        vipTier.isVipConfirmed,
        vipTier.currentTier
      );

      const totalAmount = coinsToAdd + bonusCalculation.totalBonus;

      wallet.balance += totalAmount;
      await wallet.save();

      // Update VIP tier after deposit
      await vipService.updateUserTier(userId);

      // Check and qualify referrals
      await referralService.checkAndQualifyReferrals(userId.toString(), transaction.amount);

      logger.info(
        `Goat deposit bonus applied: base=${bonusCalculation.baseBonus}, vip=${bonusCalculation.vipBonus}, total=${bonusCalculation.totalBonus}, multiplier=${bonusCalculation.multiplier}x`
      );

      logger.info(
        `Goat payment successful for user ${userId}: transaction=${transaction._id}, amount=${amount}`
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            success: true,
            transactionId: transaction._id,
            orderId,
            amount: Number(amount),
            newBalance: wallet.balance,
            authCode: result.data.authCode,
            gatewayTransactionId: result.data.transactionId,
          },
          "Payment processed successfully"
        )
      );
    } catch (error: any) {
      logger.error(`Error processing Goat payment for user ${userId}:`, error);
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Payment processing failed"
      );
    }
  }
);

// Test Goat Payment Endpoints (for debugging)
export const testGoatEndpoints = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);

    logger.info(`Testing Goat payment endpoints for user ${userId}`);

    try {
      const gateway = PaymentGatewayFactory.getGateway("goat") as any;
      const results = await gateway.testEndpoints();

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            results,
            summary: {
              totalEndpoints: results.length,
              workingEndpoints: results.filter((r: any) => r.working).length,
              failedEndpoints: results.filter((r: any) => !r.working).length,
            },
          },
          "Endpoint test completed"
        )
      );
    } catch (error: any) {
      logger.error(`Error testing Goat endpoints for user ${userId}:`, error);
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Endpoint test failed"
      );
    }
  }
);

// Test Goat Payment Token (for debugging)
export const testGoatToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentToken } = req.body;
    const { _id: userId } = getUserFromRequest(req);

    if (!paymentToken) {
      throw new ApiError(400, "Payment token is required");
    }

    logger.info(`Testing Goat payment token for user ${userId}`, {
      tokenLength: paymentToken.length,
      tokenPreview: paymentToken.substring(0, 8) + "...",
      tokenFormat: paymentToken.includes("-") ? "collect.js" : "unknown",
    });

    try {
      const gateway = PaymentGatewayFactory.getGateway("goat") as any;

      // Try a minimal transaction to test the token
      const result = await gateway.processPayment({
        amount: 0.01, // Minimal amount for testing
        paymentToken,
        orderId: `TEST-${Date.now()}`,
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            tokenValid: result.success,
            tokenInfo: {
              length: paymentToken.length,
              format: paymentToken.includes("-") ? "collect.js" : "unknown",
              preview: paymentToken.substring(0, 8) + "...",
            },
            result: result,
          },
          result.success ? "Token is valid" : "Token test failed"
        )
      );
    } catch (error: any) {
      logger.error(`Error testing Goat token for user ${userId}:`, error);
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Token test failed"
      );
    }
  }
);

// Create withdrawal request
export const createWithdrawal = asyncHandler(
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

    if (!gameName && !username) {
      throw new ApiError(
        400,
        "Method not allowed. Please use the gameName and username fields to create a withdrawal request."
      );
    }

    if (!amount || amount <= 0) {
      throw new ApiError(400, "Invalid amount");
    }

    if (amount < 40) {
      throw new ApiError(400, "Minimum withdrawal amount is 40 SC");
    }

    // Check VIP tier redemption limit
    const redemptionCheck = await vipService.checkRedemptionLimit(
      userId,
      amount
    );
    if (!redemptionCheck.allowed) {
      logger.warn(
        `Redemption limit exceeded for user ${userId}: ${redemptionCheck.reason}`
      );
      throw new ApiError(
        400,
        redemptionCheck.reason || "Daily redemption limit exceeded"
      );
    }

    // Validate wallet address for Plisio
    if (paymentGateway === "plisio" && !walletAddress) {
      throw new ApiError(
        400,
        "Wallet address is required for crypto withdrawals"
      );
    }

    // // Check if user has enough sweepCoins
    // const userBonus = await UserBonusModel.findOne({ userId });
    // if (!userBonus) {
    //   throw new ApiError(404, "User bonus record not found");
    // }

    // if (userBonus.sweepCoins < amount) {
    //   throw new ApiError(400, "Insufficient sweep coins");
    // }
    try {
      // Create withdrawal request
      const withdrawalRequest = await withdrawalRequestModel.create({
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
      // userBonus.sweepCoins -= amount;
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

      // Send SMS notification to user (if they have SMS enabled)
      // if (user.phone && user.isSmsOpted) {
      if (user.phone) {
        try {
          const formattedPhone = formatPhoneNumber(user.phone);
          if (formattedPhone) {
            const firstName = user.name?.first || "Player";

            const smsMessage = `✅ Redemption Request Confirmation\n\nGTOA Redemption Update\n\nHello ${firstName},\n\nWe received your redemption request for ${amount} SC.\n\nPlease allow up to 24 hours for processing, though it may be completed sooner — we just ask for your patience. You'll be notified once it's done.\n\nFor questions, text 702-356-3435 or DM http://m.me/105542688498394.`;

            const smsResult = await twilioService.sendTransactionalSMS(
              formattedPhone,
              {
                playerName: firstName,
                transactionType: "withdrawal",
                amount: amount,
                currency: "SC",
                transactionId: withdrawalRequest._id.toString(),
                status: "pending",
              },
              smsMessage
            );

            if (smsResult.success) {
              logger.info(
                `Redemption confirmation SMS sent to ${formattedPhone} for request ${withdrawalRequest._id}. SID: ${smsResult.sid}`
              );
            } else {
              logger.error(
                `Failed to send redemption SMS to ${formattedPhone}: ${smsResult.error}`
              );
            }
          } else {
            logger.warn(
              `Invalid phone number format for user ${userId}: ${user.phone}`
            );
          }
        } catch (smsError) {
          logger.error(
            `Failed to send SMS notification for redemption request ${withdrawalRequest._id}:`,
            smsError
          );
          // Don't fail the request if SMS fails
        }
      }

      // Create withdrawal request notification
      const withdrawalNotification = {
        id: uuidv4(),
        timestamp: new Date(),
        read: false,
        type: "withdrawal_request" as const,
        requestId: withdrawalRequest._id.toString(),
        userId: user._id.toString(),
        userName: `${user.name?.first || ""} ${user.name?.last || ""}`,
        userEmail: user.email,
        amount: withdrawalRequest.amount,
        gameName: withdrawalRequest.gameName,
        username: withdrawalRequest.username,
      };

      // Send to admins with persistent storage
      await notificationService.sendNotification(
        "admin", // Special case for admin notifications
        SocketEvents.WITHDRAWAL_REQUEST,
        withdrawalNotification
      );

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            withdrawalRequest,
            "Redeem request submitted successfully"
          )
        );
    } catch (error) {
      logger.error(`Error creating redemption for user ${userId}:`, error);
      throw error;
    }
  }
);
// export const createWithdrawal = asyncHandler(async (req: Request, res: Response) => {
//   const { amount, address, paymentGateway = 'plisio' } = req.body;
//   const { _id:userId } = getUserFromRequest(req);

//   logger.info(`Creating withdrawal for ${userId}: amount=${amount}, gateway=${paymentGateway}`);

//   if (!amount || amount <= 0) {
//     logger.warn(`Invalid withdrawal amount: ${amount} for user ${userId}`);
//     throw new ApiError(400, "Invalid amount");
//   }

//   const wallet = await WalletModel.findOne({ userId });
//   if (!wallet) {
//     logger.error(`Wallet not found for user ${userId} during withdrawal`);
//     throw new ApiError(404, "Wallet not found");
//   }

//   // Get user bonus for sweepCoins
//   const userBonus = await UserBonusModel.findOne({ userId });
//   if (!userBonus) {
//     logger.error(`User bonus not found for user ${userId} during withdrawal`);
//     throw new ApiError(404, "User bonus record not found");
//   }

//   // Check if user has enough sweepCoins
//   if (userBonus.sweepCoins < amount) {
//     logger.warn(`Insufficient sweepCoins for user ${userId}: has ${userBonus.sweepCoins}, needs ${amount}`);
//     throw new ApiError(400, "Insufficient sweep coins");
//   }

//   try {
//     const orderId = crypto.randomBytes(16).toString('hex');
//     logger.debug(`Generated order ID: ${orderId}`);

//     const gateway = PaymentGatewayFactory.getGateway(paymentGateway as any);

//     let result;
//     if (paymentGateway === 'soap') {
//       // Handle Soap withdrawal
//       logger.debug(`Processing Soap withdrawal for user ${userId}`);
//       const soapGateway = gateway as SoapPaymentGateway;
//       result = await soapGateway.processWithdrawal(amount, userId.toString());
//     } else {
//       // Handle other payment gateways
//       logger.debug(`Processing ${paymentGateway} withdrawal for user ${userId}`);
//       const regularGateway = gateway as IPaymentGateway;
//       result = await regularGateway.createWithdrawal({
//         amount,
//         currency: 'BTC',
//         address,
//         orderId,
//       });
//     }

//     // Create transaction record
//     const transaction = await TransactionModel.create({
//       userId,
//       walletId: wallet._id,
//       type: 'withdrawal',
//       amount,
//       currency: wallet.currency,
//       status: 'pending',
//       paymentGateway,
//       gatewayInvoiceId: paymentGateway === 'soap' ? result.checkoutId : orderId,
//       gatewayTransactionId: paymentGateway === 'soap' ? result.checkoutId : result?.data?.id,
//       metadata: paymentGateway === 'soap' ? {
//         checkoutUrl: result.checkoutUrl,
//         status: result.status
//       } : {
//         ...req.body,
//         ...result?.data
//       },
//     });

//     // Deduct from sweepCoins
//     const previousSweepCoins = userBonus.sweepCoins;
//     userBonus.sweepCoins -= amount;
//     await userBonus.save();

//     logger.info(`Withdrawal transaction created: ${transaction._id} for user ${userId}, amount=${amount}, gateway=${paymentGateway}`);
//     logger.info(`User ${userId} sweepCoins updated: ${previousSweepCoins} -> ${userBonus.sweepCoins}`);

//     return res.status(200).json(
//       new ApiResponse(200, {
//         'invoiceUrl':
//           paymentGateway === 'soap' ? result.checkoutUrl : result?.data?.withdrawal_url,
//         'invoiceId':
//           paymentGateway === 'soap' ? result.checkoutId : result?.data?.id
//       }, `Withdrawal ${paymentGateway === 'soap' ? 'checkout' : 'request'} created successfully`)
//     );
//   } catch (error) {
//     logger.error(`Error creating withdrawal for user ${userId}:`, error);
//     throw error;
//   }
// });

// Get transaction history
export const getTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId, role } = getUserFromRequest(req);
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const query: any = {};
    // Only filter by userId if not admin
    if (role !== "ADMIN") {
      query.userId = userId;
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [transactions, total] = await Promise.all([
      TransactionModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      TransactionModel.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          transactions,
          total,
          page: pageNumber,
          limit: limitNumber,
        },
        "Transactions retrieved successfully"
      )
    );
  }
);

export const getDashboardTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    const query: any = {};

    if (req.query.type) {
      query.type = req.query.type;
    }

    const [transactions, total] = await Promise.all([
      TransactionModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate({ path: "userId", select: "name email" })
        .populate({ path: "walletId", select: "balance" }),
      TransactionModel.countDocuments(query),
    ]);

    // Handle null userId/walletId from deleted users/wallets - still show transaction for tracking
    const safeTransactions = transactions.map((transaction) => {
      const transactionObj = transaction.toObject();
      
      // Handle null userId (deleted user)
      if (!transactionObj.userId || transactionObj.userId === null) {
        transactionObj.userId = {
          _id: null,
          name: { first: "Deleted", last: "User" },
          email: "deleted@user.com",
          isDeleted: true,
        };
      }
      
      // Handle null walletId (deleted wallet)
      if (!transactionObj.walletId || transactionObj.walletId === null) {
        transactionObj.walletId = {
          _id: null,
          balance: 0,
          isDeleted: true,
        };
      }
      
      return transactionObj;
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          transactions: safeTransactions,
          total,
          page: pageNumber,
          limit: limitNumber,
        },
        "Transactions retrieved successfully"
      )
    );
  }
);

// Handle payment gateway webhooks
export const handlePaymentWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentGateway } = req.params;
    logger.info(`Received ${paymentGateway} webhook:`, { body: req.body });

    // Find pending transaction
    const transaction = await TransactionModel.findOne({
      paymentGateway,
      status: "pending",
      $or: [
        { gatewayInvoiceId: req.body.order_number },
        { gatewayTransactionId: req.body.txn_id },
      ],
    });

    if (!transaction) {
      logger.error(`Transaction not found for ${paymentGateway} webhook`, {
        order_number: req.body.order_number,
        txn_id: req.body.txn_id,
      });
      throw new ApiError(404, "Transaction not found");
    }

    logger.info(
      `Processing webhook for transaction ${transaction._id}, type=${transaction.type}, status=${req.body.status}`
    );

    const wallet = await WalletModel.findById(transaction.walletId);
    if (!wallet) {
      logger.error(`Wallet not found for transaction ${transaction._id}`);
      throw new ApiError(404, "Wallet not found");
    }

    // Get user for notifications
    const user = await UserModel.findById(transaction.userId).select(
      "name phone isSmsOpted"
    );
    if (!user) {
      logger.error(`User not found for transaction ${transaction._id}`);
      throw new ApiError(404, "User not found");
    }

    // Get user bonus for withdrawal handling if needed
    const userBonus =
      transaction.type === "withdrawal"
        ? await UserBonusModel.findOne({ userId: transaction.userId })
        : null;

    if (transaction.type === "withdrawal" && !userBonus) {
      logger.error(
        `User bonus not found for withdrawal transaction ${transaction._id}, user ${transaction.userId}`
      );
      throw new ApiError(404, "User bonus record not found for withdrawal");
    }

    try {
      if (req.body.status === "new") {
        logger.info(
          `Setting transaction ${transaction._id} currency to ${req.body.currency}`
        );
        transaction.currency = req.body.currency;
        transaction.metadata = { ...transaction.metadata, ...req.body };
      } else if (req.body.status === "completed") {
        logger.info(`Completing transaction ${transaction._id}`);
        transaction.status = "completed";
        transaction.metadata = { ...transaction.metadata, ...req.body };

        if (transaction.type === "deposit") {
          const newBalance = Math.round(transaction.amount * 100);

          // Get VIP status for bonus calculation
          const vipTier = await vipService.getOrCreateVipTier(
            transaction.userId
          );
          const bonusCalculation = vipService.calculateDepositBonus(
            transaction.amount,
            vipTier.isVipConfirmed,
            vipTier.currentTier
          );

          const totalAmount = newBalance + bonusCalculation.totalBonus;

          const previousBalance = wallet.balance;
          wallet.balance += totalAmount;

          // Update VIP tier after deposit
          await vipService.updateUserTier(transaction.userId);

          // Check and qualify referrals
          await referralService.checkAndQualifyReferrals(
            transaction.userId.toString(),
            transaction.amount
          );

          logger.info(
            `Deposit bonus applied: base=${bonusCalculation.baseBonus}, vip=${bonusCalculation.vipBonus}, total=${bonusCalculation.totalBonus}, multiplier=${bonusCalculation.multiplier}x, tier=${vipTier.currentTier}`
          );

          // Create notification object with correct type
          const notification = {
            id: uuidv4(),
            timestamp: new Date(),
            read: false,
            type: "deposit_success" as const,
            transactionId: transaction._id.toString(),
            amount: transaction.amount,
            coins: totalAmount,
            paymentGateway: "plisio",
          };

          // Use notification service to send and store notification
          await notificationService.sendNotification(
            transaction.userId.toString(),
            SocketEvents.DEPOSIT_SUCCESS,
            notification
          );

          // Send SMS notification for successful deposit
          // if (user.phone && user.isSmsOpted) {
          if (user.phone) {
            try {
              const formattedPhone = formatPhoneNumber(user.phone);
              if (formattedPhone) {
                const firstName = user.name?.first || "Player";

                const smsMessage = `💳 Deposit Confirmation + Next Step\n\nHello ${firstName},\n\nYour deposit of $${transaction.amount} has been received and coins have been added to your account.\n\n💡 Once your wallet shows the update, tap Add Game GC then Add Coins. A Support rep will load your coins to your game right away.\n\nFor support, text 702-356-3435 or DM http://m.me/105542688498394.`;

                const smsResult = await twilioService.sendTransactionalSMS(
                  formattedPhone,
                  {
                    playerName: firstName,
                    transactionType: "deposit",
                    amount: transaction.amount,
                    currency: "USD",
                    transactionId: transaction._id.toString(),
                    status: "completed",
                  },
                  smsMessage
                );

                if (smsResult.success) {
                  logger.info(
                    `Deposit confirmation SMS sent to ${formattedPhone} for transaction ${transaction._id}. SID: ${smsResult.sid}`
                  );
                } else {
                  logger.error(
                    `Failed to send deposit confirmation SMS to ${formattedPhone}: ${smsResult.error}`
                  );
                }
              } else {
                logger.warn(
                  `Invalid phone number format for user ${transaction.userId}: ${user.phone}`
                );
              }
            } catch (smsError) {
              logger.error(
                `Failed to send SMS notification for deposit ${transaction._id}:`,
                smsError
              );
              // Don't fail the webhook processing if SMS fails
            }
          }

          logger.info(
            `Deposit completed: Adding ${totalAmount} to wallet balance for user ${transaction.userId}, new balance=${wallet.balance}`
          );
        }
      } else if (req.body.status === "failed") {
        logger.info(`Transaction ${transaction._id} failed`);
        transaction.status = "failed";
        transaction.metadata = { ...transaction.metadata, ...req.body };

        if (transaction.type === "withdrawal" && userBonus) {
          // Refund the sweepCoins for failed withdrawal
          const previousSweepCoins = userBonus.sweepCoins;
          // userBonus.sweepCoins += transaction.amount;
          logger.info(
            `Refunding ${transaction.amount} sweepCoins to user ${transaction.userId} due to failed withdrawal, new balance=${userBonus.sweepCoins}`
          );
        }
      }

      // Update promises to include userBonus if it exists
      const savePromises = [transaction.save(), wallet.save()];
      if (userBonus) {
        savePromises.push(userBonus.save());
      }

      await Promise.all(savePromises);
      logger.info(
        `Webhook processing completed for transaction ${transaction._id}, new status=${transaction.status}`
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      logger.error(
        `Error processing ${paymentGateway} webhook for transaction ${transaction._id}:`,
        error
      );
      throw error;
    }
  }
);

// Handle Soap webhook
export const handleSoapWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers["soap_signature"] as string;
    const payload = req.body;

    logger.info(`Received Soap webhook: type=${payload.type}`, {
      body: payload,
    });

    try {
      const gateway = PaymentGatewayFactory.getGateway(
        "soap"
      ) as SoapPaymentGateway;

      if (!gateway.verifyWebhook(payload, signature)) {
        logger.error(`Invalid Soap webhook signature`, { signature });
        throw new ApiError(401, "Invalid webhook signature");
      }

      const { type, data } = payload;
      logger.debug(`Processing Soap webhook: type=${type}, id=${data.id}`);

      // Find transaction
      const transaction = await TransactionModel.findOne({
        paymentGateway: "soap",
        gatewayInvoiceId: data.id,
      });

      if (!transaction) {
        logger.error(`Transaction not found for Soap webhook`, { id: data.id });
        throw new ApiError(404, "Transaction not found");
      }

      logger.info(
        `Found transaction ${transaction._id}, type=${transaction.type}, current status=${transaction.status}`
      );

      let withdrawalRequest;
      if (transaction.metadata?.withdrawalRequestId) {
        withdrawalRequest = await withdrawalRequestModel.findById(
          transaction.metadata.withdrawalRequestId
        );
        if (!withdrawalRequest) {
          logger.error(
            `Withdrawal request not found: ${transaction.metadata.withdrawalRequestId}`
          );
          throw new ApiError(404, "Withdrawal request not found");
        }
        logger.debug(
          `Found withdrawal request ${withdrawalRequest._id}, status=${withdrawalRequest.status}`
        );
      }

      const isGameWithdrawal = !!(
        withdrawalRequest?.gameName && withdrawalRequest?.username
      );

      const wallet = await WalletModel.findById(transaction.walletId);
      if (!wallet) {
        logger.error(`Wallet not found for transaction ${transaction._id}`);
        throw new ApiError(404, "Wallet not found");
      }

      // Get user bonus for withdrawal handling
      const userBonus =
        transaction.type === "withdrawal"
          ? await UserBonusModel.findOne({ userId: transaction.userId })
          : null;

      if (transaction.type === "withdrawal" && !userBonus) {
        logger.error(
          `User bonus not found for withdrawal transaction ${transaction._id}, user ${transaction.userId}`
        );
        throw new ApiError(404, "User bonus record not found for withdrawal");
      }

      // Update transaction status based on webhook event
      if (data.charge?.status === "succeeded") {
        logger.info(`Transaction ${transaction._id} succeeded`);
        transaction.status = "completed";
        transaction.metadata = {
          ...transaction.metadata,
          ...data,
          charge: data.charge,
        };

        if (transaction.type === "deposit") {
          const newBalance = Math.round(transaction.amount * 100);

          // Get VIP status for bonus calculation
          const vipTier = await vipService.getOrCreateVipTier(
            transaction.userId
          );
          const bonusCalculation = vipService.calculateDepositBonus(
            transaction.amount,
            vipTier.isVipConfirmed,
            vipTier.currentTier
          );

          const totalAmount = newBalance + bonusCalculation.totalBonus;

          const previousBalance = wallet.balance;
          wallet.balance += totalAmount;

          // Update VIP tier after deposit
          await vipService.updateUserTier(transaction.userId);

          // Check and qualify referrals
          await referralService.checkAndQualifyReferrals(
            transaction.userId.toString(),
            transaction.amount
          );

          logger.info(
            `Soap deposit bonus applied: base=${bonusCalculation.baseBonus}, vip=${bonusCalculation.vipBonus}, total=${bonusCalculation.totalBonus}, multiplier=${bonusCalculation.multiplier}x, tier=${vipTier.currentTier}`
          );

          // Create notification object with correct type
          const notification = {
            id: uuidv4(),
            timestamp: new Date(),
            read: false,
            type: "deposit_success" as const,
            transactionId: transaction._id.toString(),
            amount: transaction.amount,
            coins: totalAmount,
            paymentGateway: "soap",
          };

          // Use notification service to send and store notification
          await notificationService.sendNotification(
            transaction.userId.toString(),
            SocketEvents.DEPOSIT_SUCCESS,
            notification
          );
          const user = await UserModel.findById(transaction.userId).select(
            "name email phone isOpted isSmsOpted"
          );
          if (user.phone) {
            try {
              const formattedPhone = formatPhoneNumber(user.phone);
              if (formattedPhone) {
                const firstName = user.name?.first || "Player";

                const smsMessage = `💳 Deposit Confirmation + Next Step\n\nHello ${firstName},\n\nYour deposit of $${transaction.amount} has been received and coins have been added to your account.\n\n💡 Once your wallet shows the update, tap Add Game GC then Add Coins. A Support rep will load your coins to your game right away.\n\nFor support, text 702-356-3435 or DM http://m.me/105542688498394.`;

                const smsResult = await twilioService.sendTransactionalSMS(
                  formattedPhone,
                  {
                    playerName: firstName,
                    transactionType: "deposit",
                    amount: transaction.amount,
                    currency: "USD",
                    transactionId: transaction._id.toString(),
                    status: "completed",
                  },
                  smsMessage
                );

                if (smsResult.success) {
                  logger.info(
                    `Deposit confirmation SMS sent to ${formattedPhone} for transaction ${transaction._id}. SID: ${smsResult.sid}`
                  );
                } else {
                  logger.error(
                    `Failed to send deposit confirmation SMS to ${formattedPhone}: ${smsResult.error}`
                  );
                }
              } else {
                logger.warn(
                  `Invalid phone number format for user ${transaction.userId}: ${user.phone}`
                );
              }
            } catch (smsError) {
              logger.error(
                `Failed to send SMS notification for deposit ${transaction._id}:`,
                smsError
              );
              // Don't fail the webhook processing if SMS fails
            }
          }

          logger.info(
            `Deposit completed: Adding ${totalAmount} to wallet balance for user ${transaction.userId}, from ${previousBalance} to ${wallet.balance}`
          );
        }

        if (transaction.type === "withdrawal") {
          if (withdrawalRequest) {
            logger.info(
              `Marking withdrawal request ${withdrawalRequest._id} as processed`
            );
            withdrawalRequest.status = "processed";
            await withdrawalRequest.save();

            // Create withdrawal status notification
            const statusNotification = {
              id: uuidv4(),
              timestamp: new Date(),
              read: false,
              type: "withdrawal_status_updated" as const,
              requestId: withdrawalRequest._id.toString(),
              status: withdrawalRequest.status,
              amount: withdrawalRequest.amount,
              message: "Your withdrawal has been processed successfully.",
            };

            // Send to user with persistent storage
            await notificationService.sendNotification(
              transaction.userId.toString(),
              SocketEvents.WITHDRAWAL_STATUS_UPDATED,
              statusNotification
            );
          }
        }
      } else if (data.charge?.status === "failed") {
        logger.info(`Transaction ${transaction._id} failed`);
        transaction.status = "failed";
        transaction.metadata = {
          ...transaction.metadata,
          ...data,
          charge: data.charge,
        };

        if (transaction.type === "withdrawal" && userBonus) {
          if (withdrawalRequest) {
            logger.info(
              `Marking withdrawal request ${withdrawalRequest._id} as failed`
            );
            withdrawalRequest.status = "failed";
            await withdrawalRequest.save();

            // Create withdrawal status notification for failure
            const statusNotification = {
              id: uuidv4(),
              timestamp: new Date(),
              read: false,
              type: "withdrawal_status_updated" as const,
              requestId: withdrawalRequest._id.toString(),
              status: withdrawalRequest.status,
              amount: withdrawalRequest.amount,
              message: "Your withdrawal request has failed.",
            };

            // Send to user with persistent storage
            await notificationService.sendNotification(
              transaction.userId.toString(),
              SocketEvents.WITHDRAWAL_STATUS_UPDATED,
              statusNotification
            );
          }

          // Refund the sweepCoins for failed withdrawal
          const previousSweepCoins = userBonus.sweepCoins;
          if (!isGameWithdrawal) {
            // userBonus.sweepCoins += transaction.amount;
            logger.info(
              `Refunding ${transaction.amount} sweepCoins to user ${transaction.userId} due to failed withdrawal, from ${previousSweepCoins} to ${userBonus.sweepCoins}`
            );
          }
        }
      } else {
        if (transaction.type === "withdrawal") {
          if (type === "checkout.hold") {
            // WE HOLD THE MONEY FOR 24 HOURS
            logger.info(
              `Hold placed on withdrawal transaction ${transaction._id}`
            );
          } else if (type === "checkout.release_hold") {
            // WE RELEASE THE MONEY - Refund the sweepCoins
            logger.info(
              `Released hold on withdrawal transaction ${transaction._id}`
            );
            if (userBonus) {
              if (withdrawalRequest) {
                logger.info(
                  `Marking withdrawal request ${withdrawalRequest._id} as refunded`
                );
                withdrawalRequest.status = "refunded";
                await withdrawalRequest.save();

                // Create withdrawal status notification for returns
                const statusNotification = {
                  id: uuidv4(),
                  timestamp: new Date(),
                  read: false,
                  type: "withdrawal_status_updated" as const,
                  requestId: withdrawalRequest._id.toString(),
                  status: withdrawalRequest.status,
                  amount: withdrawalRequest.amount,
                  message:
                    "Your withdrawal has been returned. The funds have been credited back to your account.",
                };

                // Send to user with persistent storage
                await notificationService.sendNotification(
                  transaction.userId.toString(),
                  SocketEvents.WITHDRAWAL_STATUS_UPDATED,
                  statusNotification
                );
              }

              if (!isGameWithdrawal) {
                // userBonus.sweepCoins += transaction.amount;
                logger.info(
                  `Returning ${transaction.amount} sweepCoins to user ${transaction.userId} due to hold release`
                );
              }
            }
          }
        }

        // Handle checkout.returned event for transaction reversals
        if (type === "checkout.returned") {
          logger.info(`Processing returned transaction ${transaction._id}`);
          transaction.status = "returned";

          const transactionType = data.charge?.transaction_type;
          logger.debug(`Return transaction type: ${transactionType}`);

          if (transactionType === "credit") {
            // Money was originally credited (added) to the player's balance through a deposit
            // Deduct from wallet.balance
            const previousBalance = wallet.balance;
            wallet.balance -= transaction.amount;
            logger.info(
              `Reversing deposit: Deducting ${transaction.amount} from wallet balance for user ${transaction.userId}, from ${previousBalance} to ${wallet.balance}`
            );
          } else if (transactionType === "debit") {
            // Money was originally debited (removed) from the player's sweepCoins through a withdrawal
            // Add back to the userBonus.sweepCoins
            if (userBonus) {
              if (withdrawalRequest) {
                logger.info(
                  `Marking withdrawal request ${withdrawalRequest._id} as returned`
                );
                withdrawalRequest.status = "returned";
                await withdrawalRequest.save();
              }

              const previousSweepCoins = userBonus.sweepCoins;
              if (!isGameWithdrawal) {
                // userBonus.sweepCoins += transaction.amount;
                logger.info(
                  `Returning ${transaction.amount} sweepCoins to user ${transaction.userId}, from ${previousSweepCoins} to ${userBonus.sweepCoins}`
                );
              }
              // userBonus.sweepCoins += transaction.amount;
              // logger.info(`Returning ${transaction.amount} sweepCoins to user ${transaction.userId}, from  to ${userBonus.sweepCoins}`);
            }
          }

          transaction.metadata = {
            ...transaction.metadata,
            ...data,
            charge: data.charge,
            returned: true,
            returnedAt: new Date(),
          };
        } else if (type === "checkout.expired") {
          try {
            transaction.status = "failed";

            if (transaction.type === "withdrawal") {
              if (withdrawalRequest) {
                logger.info(
                  `Marking withdrawal request ${withdrawalRequest._id} as expired`
                );
                withdrawalRequest.status = "expired";
                await withdrawalRequest.save();
              }
              if (!isGameWithdrawal && userBonus) {
                // userBonus.sweepCoins += transaction.amount;
                logger.info(
                  `Returning amount ${transaction.amount} to user ${transaction.userId} due to expired withdrawal transaction`
                );
              }
            } else if (transaction.type === "deposit") {
              // For expired deposits, we need to ensure the transaction is marked as failed
              // and notify the user
              logger.info(
                `Deposit transaction ${transaction._id} expired - marking as failed`
              );
            }

            logger.info(`Transaction ${transaction._id} expired`);
            transaction.metadata = {
              ...transaction.metadata,
              ...data,
              charge: data.charge,
              expired: true,
              expiredAt: new Date(),
            };
          } catch (error) {
            logger.error(
              `Error handling expired transaction ${transaction._id}:`,
              error
            );
            // Don't throw the error, just log it and continue
            // This prevents 500 errors from being sent back
          }
        } else {
          if (type === "checkout.terminally_failed") {
            logger.info(`Transaction ${transaction._id} terminated`);
            if (withdrawalRequest) {
              logger.info(
                `Marking withdrawal request ${withdrawalRequest._id} as terminated`
              );
              withdrawalRequest.status = "terminated";
              await withdrawalRequest.save();
              if (!isGameWithdrawal) {
                // userBonus.sweepCoins += transaction.amount;
                logger.info(
                  `Returning amount ${transaction.amount} to user ${transaction.userId} due to terminated transaction`
                );
              }
            }
          }
          logger.info(
            `Updating transaction ${transaction._id} status to ${data.charge?.status}`
          );
          transaction.status = data.charge?.status;
          transaction.metadata = {
            ...transaction.metadata,
            ...data,
            charge: data.charge,
          };
        }
      }

      // Update promises to include userBonus if it exists
      const savePromises = [transaction.save(), wallet.save()];
      if (userBonus) {
        savePromises.push(userBonus.save());
      }

      await Promise.all(savePromises);
      logger.info(
        `Soap webhook processing completed for transaction ${transaction._id}, new status=${transaction.status}`
      );

      // Gateway handles any gateway-specific processing
      await gateway.handleWebhook(payload);
      logger.debug(`Gateway-specific webhook handling completed`);

      return res.status(200).json({ success: true });
    } catch (error) {
      logger.error(`Error processing Soap webhook:`, error);
      throw error;
    }
  }
);

export const handleNowPaymentsWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    logger.info(`Received nowpayments webhook:`, { body: req.body });

    // Find pending transaction - check for both order_number and order_id
    const orderIdentifier = req.body.order_number || req.body.order_id;

    if (!orderIdentifier) {
      logger.error(`No order identifier found in nowpayments webhook`, {
        body: req.body,
      });
      throw new ApiError(400, "Missing order identifier in webhook payload");
    }
    console.log(orderIdentifier, "orderIdentifier");
    const transaction = await TransactionModel.findOne({
      paymentGateway: "nowpayments",
      status: "pending",
      gatewayInvoiceId: orderIdentifier,
    });

    if (!transaction) {
      logger.error(`Transaction not found for nowpayments webhook`, {
        order_identifier: orderIdentifier,
      });
      throw new ApiError(404, "Transaction not found");
    }

    logger.info(
      `Processing webhook for transaction ${transaction._id}, type=${transaction.type}, status=${req.body.status}`
    );

    const wallet = await WalletModel.findById(transaction.walletId);
    if (!wallet) {
      logger.error(`Wallet not found for transaction ${transaction._id}`);
      throw new ApiError(404, "Wallet not found");
    }

    // Get user bonus for withdrawal handling if needed
    const userBonus =
      transaction.type === "withdrawal"
        ? await UserBonusModel.findOne({ userId: transaction.userId })
        : null;

    if (transaction.type === "withdrawal" && !userBonus) {
      logger.error(
        `User bonus not found for withdrawal transaction ${transaction._id}, user ${transaction.userId}`
      );
      throw new ApiError(404, "User bonus record not found for withdrawal");
    }

    try {
      // Always store the latest webhook data in metadata
      transaction.metadata = { ...transaction.metadata, ...req.body };

      switch (req.body.status) {
        case "waiting":
          // Initial status, payment waiting to be sent by customer
          logger.info(`Transaction ${transaction._id} is waiting for payment`);
          break;

        case "confirming":
          // Transaction is being processed on blockchain
          logger.info(
            `Transaction ${transaction._id} is being confirmed on blockchain`
          );
          transaction.status = "processing";
          break;

        case "confirmed":
          // Transaction is confirmed on blockchain but not yet sent to merchant
          logger.info(
            `Transaction ${transaction._id} is confirmed on blockchain`
          );
          transaction.status = "processing";
          break;

        case "sending":
          // Funds are being sent to merchant wallet
          logger.info(
            `Transaction ${transaction._id} funds are being sent to merchant wallet`
          );
          transaction.status = "processing";
          break;

        case "partially_paid":
          // Customer sent less than required amount
          logger.info(`Transaction ${transaction._id} was partially paid`);
          transaction.status = "partial";
          break;

        case "finished":
        case "completed":
          // Payment is complete - handle deposit logic
          logger.info(`Completing transaction ${transaction._id}`);
          transaction.status = "completed";

          if (transaction.type === "deposit") {
            const newBalance = Math.round(transaction.amount * 100);

            // Get VIP status for bonus calculation
            const vipTier = await vipService.getOrCreateVipTier(
              transaction.userId
            );
            const bonusCalculation = vipService.calculateDepositBonus(
              transaction.amount,
              vipTier.isVipConfirmed,
              vipTier.currentTier
            );

            const totalAmount = newBalance + bonusCalculation.totalBonus;

            const previousBalance = wallet.balance;
            wallet.balance += totalAmount;

            // Update VIP tier after deposit
            await vipService.updateUserTier(transaction.userId);

            // Check and qualify referrals
            await referralService.checkAndQualifyReferrals(
              transaction.userId.toString(),
              transaction.amount
            );

            logger.info(
              `NowPayments deposit bonus applied: base=${bonusCalculation.baseBonus}, vip=${bonusCalculation.vipBonus}, total=${bonusCalculation.totalBonus}, multiplier=${bonusCalculation.multiplier}x, tier=${vipTier.currentTier}`
            );

            // Create notification object with correct type
            // const notification = {
            //   id: uuidv4(),
            //   timestamp: new Date(),
            //   read: false,
            //   type: 'deposit_success' as const,
            //   transactionId: transaction._id.toString(),
            //   amount: transaction.amount,
            //   coins: totalAmount,
            //   paymentGateway: 'nowpayments'
            // };

            // Use notification service to send and store notification
            // await notificationService.sendNotification(
            //   transaction.userId.toString(),
            //   SocketEvents.DEPOSIT_SUCCESS,
            //   notification
            // );

            // SMS
            const user = await UserModel.findById(transaction.userId).select(
              "name email phone isOpted isSmsOpted"
            );
            if (user.phone) {
              try {
                const formattedPhone = formatPhoneNumber(user.phone);
                if (formattedPhone) {
                  const firstName = user.name?.first || "Player";

                  const smsMessage = `💳 Deposit Confirmation + Next Step\n\nHello ${firstName},\n\nYour deposit of $${transaction.amount} has been received and coins have been added to your account.\n\n💡 Once your wallet shows the update, tap Add Game GC then Add Coins. A Support rep will load your coins to your game right away.\n\nFor support, text 702-356-3435 or DM http://m.me/105542688498394.`;

                  const smsResult = await twilioService.sendTransactionalSMS(
                    formattedPhone,
                    {
                      playerName: firstName,
                      transactionType: "deposit",
                      amount: transaction.amount,
                      currency: "USD",
                      transactionId: transaction._id.toString(),
                      status: "completed",
                    },
                    smsMessage
                  );

                  if (smsResult.success) {
                    logger.info(
                      `Deposit confirmation SMS sent to ${formattedPhone} for transaction ${transaction._id}. SID: ${smsResult.sid}`
                    );
                  } else {
                    logger.error(
                      `Failed to send deposit confirmation SMS to ${formattedPhone}: ${smsResult.error}`
                    );
                  }
                } else {
                  logger.warn(
                    `Invalid phone number format for user ${transaction.userId}: ${user.phone}`
                  );
                }
              } catch (smsError) {
                logger.error(
                  `Failed to send SMS notification for deposit ${transaction._id}:`,
                  smsError
                );
                // Don't fail the webhook processing if SMS fails
              }
            }

            logger.info(
              `Deposit completed: Adding ${totalAmount} to wallet balance for user ${transaction.userId}, new balance=${wallet.balance}`
            );
          }
          break;

        case "failed":
          // Payment failed
          logger.info(`Transaction ${transaction._id} failed`);
          transaction.status = "failed";

          if (transaction.type === "withdrawal" && userBonus) {
            // Refund the sweepCoins for failed withdrawal
            const previousSweepCoins = userBonus.sweepCoins;
            // userBonus.sweepCoins += transaction.amount;
            logger.info(
              `Refunding ${transaction.amount} sweepCoins to user ${transaction.userId} due to failed withdrawal, new balance=${userBonus.sweepCoins}`
            );
          }
          break;

        case "refunded":
          // Payment was refunded back to the user
          logger.info(`Transaction ${transaction._id} was refunded`);
          transaction.status = "refunded";

          if (transaction.type === "withdrawal" && userBonus) {
            // Handle refund logic similar to failed withdrawals
            const previousSweepCoins = userBonus.sweepCoins;
            // userBonus.sweepCoins += transaction.amount;
            logger.info(
              `Refunding ${transaction.amount} sweepCoins to user ${transaction.userId} due to refunded withdrawal, new balance=${userBonus.sweepCoins}`
            );
          }
          break;

        case "expired":
          // Payment expired (user didn't send funds within time window)
          logger.info(`Transaction ${transaction._id} expired`);
          transaction.status = "expired";

          if (transaction.type === "withdrawal" && userBonus) {
            // Handle expired withdrawals like failed ones
            const previousSweepCoins = userBonus.sweepCoins;
            // userBonus.sweepCoins += transaction.amount;
            logger.info(
              `Refunding ${transaction.amount} sweepCoins to user ${transaction.userId} due to expired withdrawal, new balance=${userBonus.sweepCoins}`
            );
          }
          break;

        default:
          logger.warn(
            `Unhandled nowpayments status "${req.body.status}" for transaction ${transaction._id}`
          );
      }

      // Update promises to include userBonus if it exists
      const savePromises = [transaction.save(), wallet.save()];
      if (userBonus) {
        savePromises.push(userBonus.save());
      }

      await Promise.all(savePromises);
      logger.info(
        `Webhook processing completed for transaction ${transaction._id}, new status=${transaction.status}`
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      logger.error(
        `Error processing nowpayments webhook for transaction ${transaction._id}:`,
        error
      );
      throw error;
    }
  }
);

// Handle Goat Payments webhook
export const handleGoatWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = req.body;

    logger.info("Received Goat webhook:", { body: payload });

    try {
      const gateway = PaymentGatewayFactory.getGateway("goat") as any; // GoatGateway type

      if (!gateway.verifyWebhook(payload)) {
        logger.error("Invalid Goat webhook signature");
        throw new ApiError(400, "Invalid webhook signature");
      }

      // Find transaction by orderId (which should be in the webhook)
      const transaction = await TransactionModel.findOne({
        paymentGateway: "goat",
        gatewayInvoiceId: payload.orderid,
        status: { $in: ["pending", "completed", "failed"] },
      });

      if (!transaction) {
        logger.error(`Transaction not found for Goat webhook`, {
          orderid: payload.orderid,
          transactionid: payload.transactionid,
        });
        // Return success even if transaction not found to prevent webhook retries
        return res
          .status(200)
          .json({ success: true, message: "Transaction not found" });
      }

      logger.info(
        `Processing Goat webhook for transaction ${transaction._id}, response=${payload.response}`
      );

      const wallet = await WalletModel.findById(transaction.walletId);
      if (!wallet) {
        logger.error(`Wallet not found for transaction ${transaction._id}`);
        throw new ApiError(404, "Wallet not found");
      }

      // Get user bonus for withdrawal handling if needed
      const userBonus =
        transaction.type === "withdrawal"
          ? await UserBonusModel.findOne({ userId: transaction.userId })
          : null;

      // Update transaction based on webhook response
      // response: '1' = Success, '2' = Decline, '3' = Error
      switch (payload.response) {
        case "1":
          // Payment successful
          if (transaction.status !== "completed") {
            logger.info(
              `Goat payment successful for transaction ${transaction._id}`
            );
            transaction.status = "completed";
            transaction.gatewayTransactionId = payload.transactionid;
            transaction.metadata = {
              ...transaction.metadata,
              authcode: payload.authcode,
              responsetext: payload.responsetext,
              avsresponse: payload.avsresponse,
              cvvresponse: payload.cvvresponse,
              response_code: payload.response_code,
              webhook_received: true,
            };

            if (transaction.type === "deposit") {
              // Add coins to wallet balance for deposits
              const coinsToAdd = Math.round(transaction.amount * 100); // Convert to coins

              // Get VIP status for bonus calculation
              const vipTier = await vipService.getOrCreateVipTier(
                transaction.userId
              );
              const bonusCalculation = vipService.calculateDepositBonus(
                transaction.amount,
                vipTier.isVipConfirmed,
                vipTier.currentTier
              );

              const totalAmount = coinsToAdd + bonusCalculation.totalBonus;

              wallet.balance += totalAmount;

              // Update VIP tier after deposit
              await vipService.updateUserTier(transaction.userId);

              // Check and qualify referrals
              await referralService.checkAndQualifyReferrals(
                transaction.userId.toString(),
                transaction.amount
              );

              logger.info(
                `Goat webhook deposit bonus applied: base=${bonusCalculation.baseBonus}, vip=${bonusCalculation.vipBonus}, total=${bonusCalculation.totalBonus}, multiplier=${bonusCalculation.multiplier}x, tier=${vipTier.currentTier}`
              );

              // Create notification
              const notification = {
                id: uuidv4(),
                timestamp: new Date(),
                read: false,
                type: "deposit_success" as const,
                transactionId: transaction._id.toString(),
                amount: transaction.amount,
                coins: totalAmount,
                paymentGateway: "goat",
              };

              // Send notification
              await notificationService.sendNotification(
                transaction.userId.toString(),
                SocketEvents.DEPOSIT_SUCCESS,
                notification
              );

              // SMS
              const user = await UserModel.findById(transaction.userId).select(
                "name email phone isOpted isSmsOpted"
              );
              if (user.phone) {
                try {
                  const formattedPhone = formatPhoneNumber(user.phone);
                  if (formattedPhone) {
                    const firstName = user.name?.first || "Player";

                    const smsMessage = `💳 Deposit Confirmation + Next Step\n\nHello ${firstName},\n\nYour deposit of $${transaction.amount} has been received and coins have been added to your account.\n\n💡 Once your wallet shows the update, tap Add Game GC then Add Coins. A Support rep will load your coins to your game right away.\n\nFor support, text 702-356-3435 or DM http://m.me/105542688498394.`;

                    const smsResult = await twilioService.sendTransactionalSMS(
                      formattedPhone,
                      {
                        playerName: firstName,
                        transactionType: "deposit",
                        amount: transaction.amount,
                        currency: "USD",
                        transactionId: transaction._id.toString(),
                        status: "completed",
                      },
                      smsMessage
                    );

                    if (smsResult.success) {
                      logger.info(
                        `Deposit confirmation SMS sent to ${formattedPhone} for transaction ${transaction._id}. SID: ${smsResult.sid}`
                      );
                    } else {
                      logger.error(
                        `Failed to send deposit confirmation SMS to ${formattedPhone}: ${smsResult.error}`
                      );
                    }
                  } else {
                    logger.warn(
                      `Invalid phone number format for user ${transaction.userId}: ${user.phone}`
                    );
                  }
                } catch (smsError) {
                  logger.error(
                    `Failed to send SMS notification for deposit ${transaction._id}:`,
                    smsError
                  );
                  // Don't fail the webhook processing if SMS fails
                }
              }

              logger.info(
                `Goat deposit completed: Adding ${totalAmount} coins to wallet for user ${transaction.userId}, new balance=${wallet.balance}`
              );
            }
          }
          break;

        case "2":
        case "3":
          // Payment declined or error
          logger.info(
            `Goat payment failed for transaction ${transaction._id}: ${payload.responsetext}`
          );
          transaction.status = "failed";
          transaction.metadata = {
            ...transaction.metadata,
            responsetext: payload.responsetext,
            response_code: payload.response_code,
            webhook_received: true,
          };

          if (transaction.type === "withdrawal" && userBonus) {
            // Refund the sweepCoins for failed withdrawal
            // userBonus.sweepCoins += transaction.amount;
            logger.info(
              `Refunding ${transaction.amount} sweepCoins to user ${transaction.userId} due to failed Goat withdrawal`
            );
          }
          break;

        default:
          logger.warn(`Unknown Goat payment response: ${payload.response}`);
          transaction.metadata = {
            ...transaction.metadata,
            unknown_response: payload.response,
            responsetext: payload.responsetext,
            webhook_received: true,
          };
      }

      // Save updates
      const savePromises = [transaction.save(), wallet.save()];
      if (userBonus) {
        savePromises.push(userBonus.save());
      }

      await Promise.all(savePromises);
      logger.info(
        `Goat webhook processing completed for transaction ${transaction._id}, new status=${transaction.status}`
      );

      return res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error("Error processing Goat webhook:", error);
      throw error;
    }
  }
);

// Test CentryOS integration
export const testCentryOSIntegration = asyncHandler(
  async (req: Request, res: Response) => {
    const { amount = 10 } = req.body;
    const { _id: userId } = getUserFromRequest(req);

    try {
      const gateway = PaymentGatewayFactory.getGateway("centryos") as any;
      const result = await gateway.processDeposit(amount, userId.toString());

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            message: "CentryOS integration test successful",
            paymentUrl: result.paymentUrl,
            paymentId: result.paymentId,
            expiredAt: result.expiredAt,
          },
          "CentryOS test completed successfully"
        )
      );
    } catch (error: any) {
      logger.error("CentryOS integration test failed:", error);
      return res
        .status(500)
        .json(
          new ApiResponse(500, { error: error.message }, "CentryOS test failed")
        );
    }
  }
);

// CentryOS webhook handler
export const handleCentryOSWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    // Get raw body for signature verification (from middleware)
    const rawBody = (req as any).rawBody;
    const payload = req.body; // Use the already parsed body
    const signature = req.headers["signature"] as string;

    logger.info("Received CentryOS webhook:", {
      eventType: payload.eventType,
      status: payload.status,
      signature: signature ? `${signature}...` : "missing",
    });

    try {
      const gateway = PaymentGatewayFactory.getGateway("centryos") as any;

      // Verify webhook signature using SHA-512 HMAC
      if (!gateway.verifyWebhook(rawBody, signature)) {
        logger.error("Invalid CentryOS webhook signature");
        // throw new ApiError(400, 'Invalid webhook signature');
      }

      // Handle COLLECTION event type
      if (payload.eventType !== "COLLECTION") {
        logger.info(`Ignoring non-collection event: ${payload.eventType}`);
        return res
          .status(200)
          .json({ success: true, message: "Event type not handled" });
      }

      // Find transaction by checking both entityId and transactionId against gatewayTransactionId
      const transaction = await TransactionModel.findOne({
        paymentGateway: "centryos",
        gatewayTransactionId: payload.payload.paymentLink.id,
      });

      if (!transaction) {
        logger.error(`Transaction not found for CentryOS webhook`);
        // Return success even if transaction not found to prevent webhook retries
        return res
          .status(200)
          .json({ success: true, message: "Transaction not found" });
      }

      // Log which field matched for debugging
      logger.info(
        `Processing CentryOS webhook for transaction ${transaction._id}`
      );

      const wallet = await WalletModel.findById(transaction.walletId);
      if (!wallet) {
        logger.error(`Wallet not found for transaction ${transaction._id}`);
        throw new ApiError(404, "Wallet not found");
      }

      // Update transaction based on webhook status
      switch (payload.status) {
        case "SUCCESS":
          // Payment successful
          if (transaction.status !== "completed") {
            logger.info(
              `CentryOS payment successful for transaction ${transaction._id}`
            );
            transaction.status = "completed";
            transaction.gatewayTransactionId = payload.payload.transactionId;

            const newBalance = Math.round(transaction.amount * 100);

            // Get VIP status for bonus calculation
            const vipTier = await vipService.getOrCreateVipTier(
              transaction.userId
            );
            const bonusCalculation = vipService.calculateDepositBonus(
              transaction.amount,
              vipTier.isVipConfirmed,
              vipTier.currentTier
            );

            const totalAmount = newBalance + bonusCalculation.totalBonus;

            wallet.balance += totalAmount;

            // Update VIP tier after deposit
            await vipService.updateUserTier(transaction.userId);

            // Check and qualify referrals
            await referralService.checkAndQualifyReferrals(
              transaction.userId.toString(),
              transaction.amount
            );

            logger.info(
              `CentryOS deposit bonus applied: base=${bonusCalculation.baseBonus}, vip=${bonusCalculation.vipBonus}, total=${bonusCalculation.totalBonus}, multiplier=${bonusCalculation.multiplier}x, tier=${vipTier.currentTier}`
            );
            // Add funds to wallet

            const notification = {
              id: uuidv4(),
              timestamp: new Date(),
              read: false,
              type: "deposit_success" as const,
              transactionId: transaction._id.toString(),
              amount: transaction.amount,
              coins: totalAmount,
              paymentGateway: "centryos",
            };

            // Use notification service to send and store notification
            await notificationService.sendNotification(
              transaction.userId.toString(),
              SocketEvents.DEPOSIT_SUCCESS,
              notification
            );

            // Update metadata
            transaction.metadata = {
              ...transaction.metadata,
              webhook_received: true,
              eventType: payload.eventType,
              status: payload.status,
              method: payload.payload.method,
              walletId: payload.payload.walletId,
              summary: payload.payload.summary,
              entry: payload.payload.entry,
              timestamp: payload.payload.timestamp,
              completed_at: new Date().toISOString(),
            };

            // SMS
            const user = await UserModel.findById(transaction.userId).select(
              "name email phone isOpted isSmsOpted"
            );
            if (user.phone) {
              try {
                const formattedPhone = formatPhoneNumber(user.phone);
                if (formattedPhone) {
                  const firstName = user.name?.first || "Player";

                  const smsMessage = `💳 Deposit Confirmation + Next Step\n\nHello ${firstName},\n\nYour deposit of $${transaction.amount} has been received and coins have been added to your account.\n\n💡 Once your wallet shows the update, tap Add Game GC then Add Coins. A Support rep will load your coins to your game right away.\n\nFor support, text 702-356-3435 or DM http://m.me/105542688498394.`;

                  const smsResult = await twilioService.sendTransactionalSMS(
                    formattedPhone,
                    {
                      playerName: firstName,
                      transactionType: "deposit",
                      amount: transaction.amount,
                      currency: "USD",
                      transactionId: transaction._id.toString(),
                      status: "completed",
                    },
                    smsMessage
                  );

                  if (smsResult.success) {
                    logger.info(
                      `Deposit confirmation SMS sent to ${formattedPhone} for transaction ${transaction._id}. SID: ${smsResult.sid}`
                    );
                  } else {
                    logger.error(
                      `Failed to send deposit confirmation SMS to ${formattedPhone}: ${smsResult.error}`
                    );
                  }
                } else {
                  logger.warn(
                    `Invalid phone number format for user ${transaction.userId}: ${user.phone}`
                  );
                }
              } catch (smsError) {
                logger.error(
                  `Failed to send SMS notification for deposit ${transaction._id}:`,
                  smsError
                );
                // Don't fail the webhook processing if SMS fails
              }
            }
          }
          break;

        case "FAILED":
          // Payment failed
          if (transaction.status !== "failed") {
            logger.info(
              `CentryOS payment failed for transaction ${transaction._id}`
            );
            transaction.status = "failed";

            // Update metadata
            transaction.metadata = {
              ...transaction.metadata,
              webhook_received: true,
              eventType: payload.eventType,
              status: payload.status,
              method: payload.payload.method,
              summary: payload.payload.summary,
              failed_at: new Date().toISOString(),
              failure_reason: payload.payload.summary || "Payment failed",
            };
          }
          break;

        default:
          logger.warn(`Unknown CentryOS webhook status: ${payload.status}`);
          transaction.metadata = {
            ...transaction.metadata,
            unknown_status: payload.status,
            webhook_received: true,
            eventType: payload.eventType,
          };
      }

      // Save updates
      await Promise.all([transaction.save(), wallet.save()]);
      logger.info(
        `CentryOS webhook processing completed for transaction ${transaction._id}, new status=${transaction.status}`
      );

      return res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error("Error processing CentryOS webhook:", error);
      throw error;
    }
  }
);
