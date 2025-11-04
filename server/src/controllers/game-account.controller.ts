import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import GameAccountRequestModel from "../models/game-account-request.model";
import GameModel from "../models/games.model";
import UserGameAccountModel from "../models/user-game-account.model";
import UserModel from "../models/user.model";
import twilioService from "../services/twilio.service";
import notificationService from "../services/notification.service";
import { SocketEvents } from "../types/socket.types";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { generateUsernameFromEmail } from "../utils/game-account-helper";
import { getUserFromRequest } from "../utils/get-user";
import { sendEmailNotify } from "../utils/mail";
import { formatPhoneNumber } from "../utils/phone-formatter";
import WalletModel from "../models/wallet.model";

// Store existing game account credentials
export const storeExistingGameAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { gameId, username, password, storeCredentials } = req.body;
    const { _id: userId } = getUserFromRequest(req);

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!gameId) {
      throw new ApiError(400, "Game ID is required");
    }

    // Check if game exists
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new ApiError(404, "Game not found");
    }

    // Check if user already has an account for this game
    const existingAccount = await UserGameAccountModel.findOne({
      userId,
      gameId,
    });
    if (existingAccount) {
      throw new ApiError(400, "You already have an account for this game");
    }

    let userGameAccount;

    if (storeCredentials && username && password) {
      // Store credentials if user wants to
      userGameAccount = new UserGameAccountModel({
        userId,
        gameId,
        gameName: game.name,
        username,
        password,
        hasExistingAccount: true,
        isCredentialsStored: true,
      });
    } else {
      // Just mark that user has existing account but no credentials stored
      userGameAccount = new UserGameAccountModel({
        userId,
        gameId,
        gameName: game.name,
        username: username || "",
        password: password || "",
        hasExistingAccount: true,
        isCredentialsStored: false,
      });
    }

    await userGameAccount.save();

    // Get user details for notifications
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Send email notification to user when credentials are stored
    if (storeCredentials && username && password) {
      await sendEmailNotify({
        email: user.email,
        subject: `Game Account Credentials Stored - ${game.name}`,
        mailgenContent: `
        <h2>Game Account Credentials Stored Successfully</h2>
        <p>Hello ${user.name?.first || ""} ${user.name?.last || ""},</p>
        <p>Your <strong>${game.name}</strong> account credentials have been stored successfully.</p>
        <p>You can now access your game account directly from our platform.</p>
        <p>If you need to update your credentials in the future, please contact our support team.</p>
      `,
      });
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          userGameAccount,
          "Game account stored successfully"
        )
      );
  }
);

// Request new game account
// Request new game account
export const requestNewGameAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { gameId, amount } = req.body;
    const { _id: userId } = getUserFromRequest(req);
    const { email: userEmail } = getUserFromRequest(req);

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    if (!gameId) {
      throw new ApiError(400, "Game ID is required");
    }

    if (!userEmail) {
      throw new ApiError(400, "User email not found");
    }

    // Check if game exists
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new ApiError(404, "Game not found");
    }

    // Check if user already has an account for this game
    const existingAccount = await UserGameAccountModel.findOne({
      userId,
      gameId,
    });
    if (existingAccount) {
      throw new ApiError(400, "You already have an account for this game");
    }

    // Check if user already has a pending request for this game
    const existingRequest = await GameAccountRequestModel.findOne({
      userId,
      gameId,
      status: "pending",
    });
    if (existingRequest) {
      throw new ApiError(
        400,
        "You already have a pending request for this game"
      );
    }

    // Generate username from email (part before @)
    const username = generateUsernameFromEmail(userEmail);

    // Create new account request
    const accountRequest = new GameAccountRequestModel({
      userId,
      gameId,
      gameName: game.name,
      userEmail,
      status: "pending",
    });

    // If user provided an amount (USD), validate wallet and reserve funds
    if (amount !== undefined && amount !== null && amount !== "") {
      const usdAmount = Number(amount);
      if (isNaN(usdAmount) || usdAmount <= 0) {
        throw new ApiError(400, "Invalid amount");
      }

      const wallet = await WalletModel.findOne({ userId });
      if (!wallet) {
        throw new ApiError(404, "Wallet not found");
      }

      const goldCoinsToDeduct = Math.round(usdAmount * 100);
      if (wallet.balance < goldCoinsToDeduct) {
        throw new ApiError(400, "Insufficient balance in wallet");
      }

      // Reserve funds by deducting from wallet immediately (like recharge flow)
      wallet.balance -= goldCoinsToDeduct;
      await wallet.save();

      // Persist requested USD amount on the request
      accountRequest.requestedAmount = usdAmount;
    }

    await accountRequest.save();

    // Get user details for notifications
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Send email notification to user
    await sendEmailNotify({
      email: user.email,
      subject: `Game Account Request Received - ${game.name}`,
      mailgenContent: `
      <h2>We've Received Your Game Account Request!</h2>
      <p>Hello ${user.name?.first || ""} ${user.name?.last || ""},</p>
      <p>Thank you for requesting a <strong>${game.name}</strong> account.</p>
      <p><strong>Request Details:</strong></p>
      <ul>
        <li><strong>Game:</strong> ${game.name}</li>
        <li><strong>Status:</strong> Pending Review</li>
        ${accountRequest.requestedAmount ? `<li><strong>Initial Load Amount:</strong> $${accountRequest.requestedAmount.toFixed(2)} USD (${(accountRequest.requestedAmount * 100).toFixed(0)} GC)</li>` : ""}
      </ul>
      <p><strong>What happens next?</strong></p>
      <p>Our team is processing your request and will create your game account within a few minutes. You'll receive another notification with your login credentials once your account is ready.</p>
      ${accountRequest.requestedAmount ? `<p><em>Note: ${(accountRequest.requestedAmount * 100).toFixed(0)} GC has been reserved from your wallet and will be added to your game account once it's created.</em></p>` : ""}
      <p>If you have any questions, please contact our support team.</p>
    `,
    });

    // Send SMS notification to user if phone number exists
    if (user.phone) {
      try {
        const formattedPhone = formatPhoneNumber(user.phone);

        if (formattedPhone) {
          const firstName = user.name?.first || "User";

          const smsMessage = `GTOA Request Received ✓\n\nHello ${firstName},\n\nWe've received your ${game.name} account request!\n\n${accountRequest.requestedAmount ? `Initial Load: $${accountRequest.requestedAmount.toFixed(2)} (${(accountRequest.requestedAmount * 100).toFixed(0)} GC reserved)\n\n` : ""}Our team is setting up your account now. You'll receive your login credentials shortly via email and SMS.\n\nFor help, text 702-356-3435 or DM http://m.me/105542688498394.`;

          const smsResult = await twilioService.sendTransactionalSMS(
            formattedPhone,
            {
              playerName: firstName,
              transactionType: "game-account-request",
              details: `${game.name} account request received`,
            },
            smsMessage
          );

          if (smsResult.success) {
            console.log(
              `SMS notification sent successfully to ${formattedPhone} for game account request. SID: ${smsResult.sid}`
            );
          } else {
            console.error(
              `Failed to send SMS notification to ${formattedPhone}: ${smsResult.error}`
            );
          }
        } else {
          console.warn(
            `Invalid phone number format: ${user.phone}. Email notification sent instead.`
          );
        }
      } catch (error) {
        console.error("Error sending SMS notification:", error);
        // Don't throw error here as the request was successful
      }
    }

    // Send email notification to admin
    await sendEmailNotify({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      subject: `New Game Account Request - ${game.name}`,
      mailgenContent: `
      <h2>New Game Account Request</h2>
      <p><strong>User:</strong> ${user.name?.first || ""} ${user.name?.last || ""} (${user.email})</p>
      <p><strong>Game:</strong> ${game.name}</p>
      <p><strong>Request ID:</strong> ${accountRequest._id}</p>
      <p><strong>Status:</strong> Pending</p>
      ${accountRequest.requestedAmount ? `<p><strong>Requested Deposit:</strong> $${accountRequest.requestedAmount.toFixed(2)} USD</p>` : ""}
      <p>Please review and process this request.</p>
    `,
    });

    // Create game account request notification
    const gameAccountNotification = {
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
      type: "game_account_request" as const,
      requestId: accountRequest._id.toString(),
      userId: user._id.toString(),
      userName: `${user.name?.first || ""} ${user.name?.last || ""}`,
      userEmail: user.email,
      gameName: game.name,
      gameId: gameId,
      requestedAmount: accountRequest.requestedAmount,
    };

    // Send to admins with persistent storage
    await notificationService.sendNotification(
      "admin",
      SocketEvents.GAME_ACCOUNT_REQUEST,
      gameAccountNotification
    );

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          accountRequest,
          "Game account request created successfully"
        )
      );
  }
);

// Get user's game accounts
export const getUserGameAccounts = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const userAccounts = await UserGameAccountModel.find({ userId })
      .select("-password") // Don't send password in response
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userAccounts,
          "User game accounts retrieved successfully"
        )
      );
  }
);

// Get user's game account for specific game
export const getUserGameAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { gameId } = req.params;
    const { _id: userId } = getUserFromRequest(req);

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const userAccount = await UserGameAccountModel.findOne({ userId, gameId });

    if (!userAccount) {
      throw new ApiError(404, "No game account found for this game");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, userAccount, "Game account retrieved successfully")
      );
  }
);

// Get user's pending account requests
export const getUserAccountRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const { _id: userId } = getUserFromRequest(req);
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const accountRequests = await GameAccountRequestModel.find({ userId }).sort(
      { createdAt: -1 }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          accountRequests,
          "Account requests retrieved successfully"
        )
      );
  }
);

// Admin: Get all account requests with pagination and filtering
export const getAllAccountRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, status = "pending", search = "" } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const skip = (pageNumber - 1) * limitNumber;

    // Build query
    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { gameName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
      ];
    }
    console.log(query, "QUERY");
    const accountRequests = await GameAccountRequestModel.find(query)
      .populate("userId", "name email")
      .populate("gameId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    console.log(accountRequests, "ACCOUNT REQUESTS");

    const totalRequests = await GameAccountRequestModel.countDocuments(query);
    const totalPages = Math.ceil(totalRequests / limitNumber);

    const responseData = {
      accountRequests,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        totalRequests,
      },
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseData,
          "Account requests retrieved successfully"
        )
      );
  }
);

// Admin: Approve account request
export const approveAccountRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const { generatedUsername, generatedPassword, adminNotes } = req.body;

    if (!generatedUsername || !generatedPassword) {
      throw new ApiError(400, "Generated username and password are required");
    }

    const accountRequest = await GameAccountRequestModel.findById(requestId);
    if (!accountRequest) {
      throw new ApiError(404, "Account request not found");
    }

    if (accountRequest.status !== "pending") {
      throw new ApiError(400, "Request is not pending");
    }

    // Update request status
    accountRequest.status = "approved";
    accountRequest.generatedUsername = generatedUsername;
    accountRequest.generatedPassword = generatedPassword;
    accountRequest.adminNotes = adminNotes;
    await accountRequest.save();

    // Create user game account
    const userGameAccount = new UserGameAccountModel({
      userId: accountRequest.userId,
      gameId: accountRequest.gameId,
      gameName: accountRequest.gameName,
      username: generatedUsername,
      password: generatedPassword,
      hasExistingAccount: false,
      isCredentialsStored: true,
    });

    await userGameAccount.save();

    // Get user details for notifications
    const user = await UserModel.findById(accountRequest.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Create game account approved notification
    const gameAccountApprovedNotification = {
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
      type: "game_account_approved" as const,
      requestId: accountRequest._id.toString(),
      userId: user._id.toString(),
      userName: `${user.name?.first || ""} ${user.name?.last || ""}`,
      userEmail: user.email,
      gameName: accountRequest.gameName,
      gameId: accountRequest.gameId.toString(),
      generatedUsername,
      generatedPassword,
    };

    // Send to user with persistent storage
    await notificationService.sendNotification(
      user._id.toString(),
      SocketEvents.GAME_ACCOUNT_APPROVED,
      gameAccountApprovedNotification
    );

    // Send SMS notification to user if phone number exists and user has opted in
    if (user.phone) {
      try {
        // Format phone number for SMS
        const formattedPhone = formatPhoneNumber(user.phone);

        if (formattedPhone) {
          const firstName = user.name?.first || "User";

          const customMessage = `GTOA ✅ Account Approved!\n\nHello ${firstName},\n\nYour ${accountRequest.gameName} account has been approved.\n\nUsername: ${generatedUsername}\nPassword: ${generatedPassword}\n\nYou can now log in and get started.\n\n💡 You'll see two buttons:\n\t•  Add Game GC – Add coins to your account\n\t• Redeem SC – Request redemption\n\nFor help, text 702-356-3435 or DM http://m.me/105542688498394.`;

          const smsResult = await twilioService.sendGameAccountApprovalSMS(
            formattedPhone,
            {
              userName: `${user.name?.first || ""} ${user.name?.last || ""}`,
              gameName: accountRequest.gameName,
              username: generatedUsername,
              password: generatedPassword,
              requestedAmount: accountRequest.requestedAmount,
            },
            customMessage // Pass the custom message to override the default template
          );

          if (smsResult.success) {
            console.log(
              `SMS notification sent successfully to ${formattedPhone} for game account approval. SID: ${smsResult.sid}`
            );
          } else {
            console.error(
              `Failed to send SMS notification to ${formattedPhone}: ${smsResult.error}`
            );
          }
        } else {
          console.warn(
            `Invalid phone number format: ${user.phone}. Email notification sent instead.`
          );
        }
      } catch (error) {
        console.error("Error sending SMS notification:", error);
        // Don't throw error here as email notification is already sent
      }
    }

    // Send email notification to user (always send email as backup)
    await sendEmailNotify({
      email: user.email,
      subject: `Game Account Approved - ${accountRequest.gameName}`,
      mailgenContent: `
      <h2>Your Game Account Request Has Been Approved!</h2>
      <p>Hello ${user.name?.first || ""} ${user.name?.last || ""},</p>
      <p>Your request for a <strong>${accountRequest.gameName}</strong> account has been approved.</p>
      <p><strong>Your Account Details:</strong></p>
      <p><strong>Username:</strong> ${generatedUsername}</p>
      <p><strong>Password:</strong> ${generatedPassword}</p>
      ${accountRequest.requestedAmount ? `<p><strong>Requested Deposit:</strong> $${accountRequest.requestedAmount.toFixed(2)} USD (worth ${(accountRequest.requestedAmount * 100).toFixed(0)} GC) added to your game by our team.</p>` : ""}
      ${adminNotes ? `<p><strong>Note:</strong> ${adminNotes}</p>` : ""}
      <p>You can now log in to your game account and start playing!</p>
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li><strong>Add Game GC</strong> – Add coins to your account</li>
        <li><strong>Redeem SC</strong> – Request redemption</li>
      </ul>
      <p>If you have any questions, please contact our support team.</p>
    `,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accountRequest, userGameAccount },
          "Account request approved successfully"
        )
      );
  }
);

// Admin: Reject account request
export const rejectAccountRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const { adminNotes } = req.body;

    const accountRequest = await GameAccountRequestModel.findById(requestId);
    if (!accountRequest) {
      throw new ApiError(404, "Account request not found");
    }

    if (accountRequest.status !== "pending") {
      throw new ApiError(400, "Request is not pending");
    }

    accountRequest.status = "rejected";
    accountRequest.adminNotes = adminNotes;
    await accountRequest.save();

    // Get user details for notifications
    const user = await UserModel.findById(accountRequest.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Create game account rejected notification
    const gameAccountRejectedNotification = {
      id: uuidv4(),
      timestamp: new Date(),
      read: false,
      type: "game_account_rejected" as const,
      requestId: accountRequest._id.toString(),
      userId: user._id.toString(),
      userName: `${user.name?.first || ""} ${user.name?.last || ""}`,
      userEmail: user.email,
      gameName: accountRequest.gameName,
      gameId: accountRequest.gameId.toString(),
    };

    // Send to user with persistent storage
    await notificationService.sendNotification(
      user._id.toString(),
      SocketEvents.GAME_ACCOUNT_REJECTED,
      gameAccountRejectedNotification
    );

    // Send SMS notification to user (if they have SMS enabled)
    // if (user.phone && user.isSmsOpted) {
    if (user.phone) {
      try {
        const formattedPhone = formatPhoneNumber(user.phone);
        if (formattedPhone) {
          const firstName = user.name?.first || "User";

          const smsMessage = `GTOA Account Update\n\nHello ${firstName},\n\nYour ${accountRequest.gameName} account request could not be approved at this time.\n\n${adminNotes ? `Reason: ${adminNotes}\n\n` : ""}You can submit a new request anytime.\n\nFor questions, text 702-356-3435 or DM http://m.me/105542688498394.`;

          const smsResult = await twilioService.sendTransactionalSMS(
            formattedPhone,
            {
              playerName: firstName,
              transactionType: "subscription",
              details: "Account request rejected",
            },
            smsMessage
          );

          if (smsResult.success) {
            console.log(
              `SMS notification sent successfully to ${formattedPhone} for game account rejection. SID: ${smsResult.sid}`
            );
          } else {
            console.error(
              `Failed to send SMS notification to ${formattedPhone}: ${smsResult.error}`
            );
          }
        } else {
          console.warn(
            `Invalid phone number format: ${user.phone}. Email notification sent instead.`
          );
        }
      } catch (error) {
        console.error("Error sending SMS notification:", error);
        // Don't throw error here as email notification is already sent
      }
    }

    // Send email notification to user (always send email as backup)
    await sendEmailNotify({
      email: user.email,
      subject: `Game Account Request Update - ${accountRequest.gameName}`,
      mailgenContent: `
      <h2>Game Account Request Update</h2>
      <p>Hello ${user.name?.first || ""} ${user.name?.last || ""},</p>
      <p>Your request for a <strong>${accountRequest.gameName}</strong> account could not be approved at this time.</p>
      ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ""}
      <p>If you have any questions or would like to submit a new request, please contact our support team.</p>
    `,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          accountRequest,
          "Account request rejected successfully"
        )
      );
  }
);
