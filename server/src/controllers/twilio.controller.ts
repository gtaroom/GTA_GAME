import { Request, Response } from "express";
import UserModel from "../models/user.model";
import twilioService, { MessageType } from "../services/twilio.service";
import { logger } from "../utils/logger";

/**
 * @description Get user segments for SMS marketing
 * @route GET /api/v1/sms-marketing/segments
 */
export const getUserSegments = async (req: Request, res: Response) => {
  try {
    // Total users count
    const totalUsers = await UserModel.countDocuments();

    // Users who opted in for SMS (isSmsOpted = true AND acceptSMSTerms = true)
    const smsOptIn = await UserModel.countDocuments({
      isSmsOpted: true,
      acceptSMSTerms: true,
    });

    // Active SMS users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeSmsUsers = await UserModel.countDocuments({
      isSmsOpted: true,
      acceptSMSTerms: true,
      updatedAt: { $gte: thirtyDaysAgo },
    });

    // Inactive SMS users (haven't logged in for 60+ days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const inactiveSmsUsers = await UserModel.countDocuments({
      isSmsOpted: true,
      acceptSMSTerms: true,
      updatedAt: { $lt: sixtyDaysAgo },
    });

    // VIP SMS users
    const vipSmsUsers = await UserModel.countDocuments({
      isSmsOpted: true,
      acceptSMSTerms: true,
      role: { $ne: "USER" },
    });

    res.status(200).json({
      data: {
        totalUsers,
        smsOptIn,
        activeSmsUsers,
        inactiveSmsUsers,
        vipSmsUsers,
      },
    });
  } catch (error: any) {
    logger.error("Get SMS segments error:", error);
    res.status(500).json({
      message: "Failed to get SMS segments",
      error: error.message,
    });
  }
};

/**
 * @description Send individual SMS to a single recipient
 * @route POST /api/v1/sms-marketing/send-individual
 */
export const sendIndividualSms = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;

    // Validation
    if (!to || !message) {
      return res.status(400).json({
        message: "Missing required fields: to, message",
      });
    }

    // Validate phone number format
    if (!twilioService.validatePhoneNumber(to)) {
      return res.status(400).json({
        message: "Invalid phone number format",
      });
    }

    // Check message length (SMS limit is 160 characters)
    if (message.length > 160) {
      return res.status(400).json({
        message: "Message exceeds 160 character limit",
      });
    }

    // Send SMS using existing twilioService
    const result = await twilioService.sendSMS(
      { to, body: message },
      MessageType.MARKETING
    );

    if (!result.success) {
      return res.status(500).json({
        message: "Failed to send SMS",
        error: result.error,
      });
    }

    // TODO: Save to SMS history table
    // await SmsHistory.create({
    //   type: 'individual',
    //   to,
    //   message,
    //   status: 'sent',
    //   sid: result.sid,
    //   sentAt: new Date()
    // });

    logger.info(`Individual SMS sent successfully to ${to}`);

    res.status(200).json({
      data: {
        message: "SMS sent successfully",
        sid: result.sid,
        status: result.messageStatus,
      },
    });
  } catch (error: any) {
    logger.error("Send individual SMS error:", error);
    res.status(500).json({
      message: "Failed to send SMS",
      error: error.message,
    });
  }
};

/**
 * @description Send bulk SMS to users based on segment
 * @route POST /api/v1/sms-marketing/send-bulk
 */
export const sendBulkSms = async (req: Request, res: Response) => {
  try {
    const { segment, message, batchSize, delayBetweenBatches, maxRetries } =
      req.body;

    // Validation
    if (!segment || !message) {
      return res.status(400).json({
        message: "Missing required fields: segment, message",
      });
    }

    // Check message length
    if (message.length > 160) {
      return res.status(400).json({
        message: "Message exceeds 160 character limit",
      });
    }

    // Get users based on segment
    const query: any = {
      isSmsOpted: true,
      acceptSMSTerms: true,
      phone: { $exists: true, $ne: "" },
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    switch (segment) {
      case "active":
        query.updatedAt = { $gte: thirtyDaysAgo };
        break;
      case "inactive":
        query.updatedAt = { $lt: sixtyDaysAgo };
        break;
      case "vip":
        query.role = { $ne: "USER" };
        break;
      case "all":
        // No additional filters
        break;
      default:
        return res.status(400).json({
          message: "Invalid segment. Use: all, active, inactive, or vip",
        });
    }

    // Get users with phone numbers
    const users = await UserModel.find(query).select("phone name");

    if (users.length === 0) {
      return res.status(404).json({
        message: "No users found in the selected segment",
      });
    }

    // Extract and validate phone numbers
    const phoneNumbers = users
      .map((u) => u.phone)
      .filter((p) => p && twilioService.validatePhoneNumber(p));

    logger.info(
      `Preparing to send bulk SMS to ${phoneNumbers.length} users in segment: ${segment}`
    );

    // Send bulk SMS using improved method
    const results = await twilioService.sendBulkSMS(
      phoneNumbers,
      message,
      MessageType.MARKETING,
      {
        batchSize: batchSize || 100, // Default: 100 messages per batch
        delayBetweenBatches: delayBetweenBatches || 1000, // Default: 1 second delay
        maxRetries: maxRetries || 3, // Default: 3 retries
      }
    );

    // TODO: Save to SMS history table
    // await SmsHistory.create({
    //   type: 'bulk',
    //   segment,
    //   recipientCount: phoneNumbers.length,
    //   successful: results.successful,
    //   failed: results.failed,
    //   message,
    //   status: 'completed',
    //   sentAt: new Date(),
    //   results: results.results
    // });

    logger.info(
      `Bulk SMS campaign completed. Total: ${phoneNumbers.length}, Successful: ${results.successful}, Failed: ${results.failed}`
    );

    res.status(200).json({
      data: {
        message: "Bulk SMS campaign completed",
        recipientCount: phoneNumbers.length,
        successful: results.successful,
        failed: results.failed,
        successRate: `${((results.successful / phoneNumbers.length) * 100).toFixed(2)}%`,
        // Include detailed results (enable with query param ?details=true)
        details: req.query.details === "true" ? results.results : undefined,
      },
    });
  } catch (error: any) {
    logger.error("Send bulk SMS error:", error);
    res.status(500).json({
      message: "Failed to send bulk SMS",
      error: error.message,
    });
  }
};

/**
 * @description Get SMS history
 * @route GET /api/v1/sms-marketing/history
 */
export const getSmsHistory = async (req: Request, res: Response) => {
  try {
    // TODO: Implement SMS history retrieval from database
    // For now, return empty array
    const history: any[] = [];

    res.status(200).json({
      data: history,
    });
  } catch (error: any) {
    logger.error("Get SMS history error:", error);
    res.status(500).json({
      message: "Failed to get SMS history",
      error: error.message,
    });
  }
};

/**
 * @description Get Twilio account balance
 * @route GET /api/v1/sms-marketing/balance
 */
export const getTwilioBalance = async (req: Request, res: Response) => {
  try {
    const balance = await twilioService.getBalance();

    if (!balance) {
      return res.status(500).json({
        message: "Failed to fetch Twilio balance",
      });
    }

    res.status(200).json({
      data: balance,
    });
  } catch (error: any) {
    logger.error("Get Twilio balance error:", error);
    res.status(500).json({
      message: "Failed to get Twilio balance",
      error: error.message,
    });
  }
};

/**
 * @description Test SMS sending
 * @route POST /api/v1/sms-marketing/test
 */
export const testSMS = async (req: Request, res: Response) => {
  try {
    const { to, messageType } = req.body;

    if (!to) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    const result = await twilioService.testSMS(to, messageType);

    if (!result.success) {
      return res.status(500).json({
        message: "Failed to send test SMS",
        error: result.error,
      });
    }

    res.status(200).json({
      data: {
        message: "Test SMS sent successfully",
        sid: result.sid,
        status: result.messageStatus,
      },
    });
  } catch (error: any) {
    logger.error("Test SMS error:", error);
    res.status(500).json({
      message: "Failed to send test SMS",
      error: error.message,
    });
  }
};

/**
 * @description Check SMS delivery status by SID
 * @route GET /api/v1/sms-marketing/status/:sid
 */
export const checkSMSStatus = async (req: Request, res: Response) => {
  try {
    const { sid } = req.params;

    if (!sid) {
      return res.status(400).json({
        message: "Message SID is required",
      });
    }

    const status = await twilioService.getMessageStatus(sid);

    if (!status) {
      return res.status(404).json({
        message: "Message not found or error fetching status",
      });
    }

    res.status(200).json({
      data: {
        sid,
        status,
        description: getStatusDescription(status),
      },
    });
  } catch (error: any) {
    logger.error("Check SMS status error:", error);
    res.status(500).json({
      message: "Failed to check SMS status",
      error: error.message,
    });
  }
};

/**
 * Helper function to describe SMS status
 */
function getStatusDescription(status: string): string {
  const descriptions: { [key: string]: string } = {
    queued: "Message is queued and waiting to be sent",
    sending: "Message is currently being sent",
    sent: "Message has been sent to carrier",
    delivered: "Message was successfully delivered",
    undelivered: "Message could not be delivered",
    failed: "Message sending failed",
    received: "Message was received (for incoming messages)",
  };

  return descriptions[status] || "Unknown status";
}
