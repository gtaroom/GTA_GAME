import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import UserModel from "../models/user.model";
import twilioService from "../services/twilio.service";
import { logger } from "../utils/logger";

/**
 * @desc    Get all users who have opted in for SMS marketing
 * @route   GET /api/sms-marketing/opted-users
 * @access  Private/Admin
 */
export const getOptedInUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = "", isActive } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build query for users who are opted in
    const filter: any = { isOpted: true };

    // Add active filter if provided
    if (isActive !== undefined && isActive !== "") {
      filter.isActive = isActive === "true";
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { "name.first": { $regex: search, $options: "i" } },
        { "name.last": { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const users = await UserModel.find(filter)
      .select("name email phone isActive isOpted createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await UserModel.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalUsers: total,
            limit: Number(limit),
          },
        },
        "Opted-in users retrieved successfully"
      )
    );
  }
);

/**
 * @desc    Send SMS to selected users or all opted-in users
 * @route   POST /api/sms-marketing/send-sms
 * @access  Private/Admin
 */
export const sendSms = asyncHandler(async (req: Request, res: Response) => {
  const { message, sendToAll, userIds } = req.body;

  // Validate message
  if (!message || message.trim().length === 0) {
    throw new ApiError(400, "Message is required");
  }

  // Validate recipients
  if (
    !sendToAll &&
    (!userIds || !Array.isArray(userIds) || userIds.length === 0)
  ) {
    throw new ApiError(
      400,
      "Please select at least one user or choose send to all"
    );
  }

  let recipients;

  if (sendToAll) {
    // Get all opted-in and active users
    recipients = await UserModel.find({
      isOpted: true,
      isActive: true,
    }).select("name email phone");
  } else {
    // Get selected users who are opted-in and active
    recipients = await UserModel.find({
      _id: { $in: userIds },
      isOpted: true,
      isActive: true,
    }).select("name email phone");
  }

  if (recipients.length === 0) {
    throw new ApiError(400, "No valid opted-in recipients found");
  }

  // Prepare marketing message data for each user
  const phoneNumbers = recipients.map((user) => user.phone);
  const userName = recipients[0]?.name?.first || "User";

  logger.info(`Starting SMS campaign to ${recipients.length} recipients`);

  // Use Twilio service to send bulk marketing SMS
  const result = await twilioService.sendBulkMarketingSMS(
    phoneNumbers,
    {
      playerName: userName, // This will be personalized per user if needed
      promotionDetails: message,
    },
    message // Use custom message
  );

  logger.info(
    `SMS campaign completed. Successful: ${result.successful}, Failed: ${result.failed}`
  );

  // You can also log this to a database for tracking
  // Create an SMS campaign record here if needed

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        recipientCount: recipients.length,
        successful: result.successful,
        failed: result.failed,
        recipients: recipients.map((r) => ({
          name: `${r.name.first} ${r.name.last}`,
          phone: r.phone,
        })),
      },
      "SMS sent successfully"
    )
  );
});

/**
 * @desc    Get SMS marketing statistics
 * @route   GET /api/sms-marketing/stats
 * @access  Private/Admin
 */
export const getSmsStats = asyncHandler(async (req: Request, res: Response) => {
  const totalUsers = await UserModel.countDocuments({});
  const totalOptedIn = await UserModel.countDocuments({ isOpted: true });
  const activeOptedIn = await UserModel.countDocuments({
    isOpted: true,
    isActive: true,
  });

  const optInRate =
    totalUsers > 0 ? ((totalOptedIn / totalUsers) * 100).toFixed(2) : "0.00";

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalUsers,
          totalOptedIn,
          activeOptedIn,
          optInRate,
        },
      },
      "SMS statistics retrieved successfully"
    )
  );
});

/**
 * @desc    Update user SMS opt-in status
 * @route   PUT /api/sms-marketing/opt-in/:userId
 * @access  Private/Admin or User (own profile)
 */
export const updateUserOptIn = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { optIn } = req.body;

    if (typeof optIn !== "boolean") {
      throw new ApiError(400, "optIn must be a boolean value");
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Update opt-in status
    user.isOpted = optIn;

    await user.save();

    // Send confirmation SMS if user opted in
    if (optIn && user.phone) {
      try {
        await twilioService.sendOptInConfirmationSMS(
          user.phone,
          user.name?.first || "User"
        );
        logger.info(`Opt-in confirmation SMS sent to user ${userId}`);
      } catch (error) {
        logger.error(
          `Failed to send opt-in confirmation SMS to user ${userId}:`,
          error
        );
        // Don't throw error, opt-in status was saved successfully
      }
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          userId: user._id,
          isOpted: user.isOpted,
          message: `Successfully ${optIn ? "opted in to" : "opted out of"} SMS marketing`,
        },
        `User ${optIn ? "opted in" : "opted out"} successfully`
      )
    );
  }
);

/**
 * @desc    Send test SMS to verify configuration
 * @route   POST /api/sms-marketing/test-sms
 * @access  Private/Admin
 */
export const sendTestSms = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, messageType = "MARKETING" } = req.body;

  if (!phoneNumber) {
    throw new ApiError(400, "Phone number is required");
  }

  // Validate phone number format
  if (!twilioService.validatePhoneNumber(phoneNumber)) {
    throw new ApiError(400, "Invalid phone number format");
  }

  const result = await twilioService.testSMS(
    phoneNumber,
    messageType.toLowerCase()
  );

  if (!result.success) {
    throw new ApiError(500, result.error || "Failed to send test SMS");
  }

  logger.info(
    `Test SMS sent successfully to ${phoneNumber}. SID: ${result.sid}`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        success: result.success,
        sid: result.sid,
        status: result.messageStatus,
      },
      "Test SMS sent successfully"
    )
  );
});
