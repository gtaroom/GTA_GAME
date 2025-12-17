import { Request, Response } from "express";
import UserModel from "../models/user.model";
import sendGridService from "../services/sendgrid.service";
import { logger } from "../utils/logger";

/**
 * @description Get user segments for email marketing
 * @route GET /api/v1/email-marketing/segments
 */
export const getUserSegments = async (req: Request, res: Response) => {
  try {
    // Total users count
    const totalUsers = await UserModel.countDocuments();

    // Users who opted in for email (isOpted = true)
    const emailOptIn = await UserModel.countDocuments({
      isOpted: true,
    });

    // Users who opted in for SMS (isSmsOpted = true)
    const smsOptIn = await UserModel.countDocuments({
      isSmsOpted: true,
    });

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await UserModel.countDocuments({
      isOpted: true,
      updatedAt: { $gte: thirtyDaysAgo },
    });

    // Inactive users (haven't logged in for 60+ days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const inactiveUsers = await UserModel.countDocuments({
      isOpted: true,
      updatedAt: { $lt: sixtyDaysAgo },
    });

    // VIP/Premium users
    const vipUsers = await UserModel.countDocuments({
      isOpted: true,
      role: { $ne: "USER" },
    });

    res.status(200).json({
      data: {
        totalUsers,
        emailOptIn,
        smsOptIn,
        activeUsers,
        inactiveUsers,
        vipUsers,
      },
    });
  } catch (error: any) {
    logger.error("Get user segments error:", error);
    res.status(500).json({
      message: "Failed to get user segments",
      error: error.message,
    });
  }
};

/**
 * @description Send individual email to a single recipient
 * @route POST /api/v1/email-marketing/send-individual
 */
export const sendIndividualEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, message } = req.body;

    // Validation
    if (!to || !subject || !message) {
      return res.status(400).json({
        message: "Missing required fields: to, subject, message",
      });
    }

    // Validate email format
    if (!sendGridService.validateEmail(to)) {
      return res.status(400).json({
        message: "Invalid email address format",
      });
    }

    // Send email using SendGrid
    const result = await sendGridService.sendEmail({
      to,
      subject,
      html: message,
      text: message.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    if (!result.success) {
      return res.status(500).json({
        message: "Failed to send email",
        error: result.error,
      });
    }

    // TODO: Save to email history table
    // await EmailHistory.create({
    //   type: 'individual',
    //   to,
    //   subject,
    //   status: 'sent',
    //   messageId: result.messageId,
    //   sentAt: new Date()
    // });

    logger.info(`Individual email sent successfully to ${to}`);

    res.status(200).json({
      data: {
        message: "Email sent successfully",
        messageId: result.messageId,
      },
    });
  } catch (error: any) {
    logger.error("Send individual email error:", error);
    res.status(500).json({
      message: "Failed to send email",
      error: error.message,
    });
  }
};

/**
 * @description Send email campaign to users based on segment
 * @route POST /api/v1/email-marketing/send-campaign
 */
export const sendEmailCampaign = async (req: Request, res: Response) => {
  try {
    const { subject, segment, htmlContent } = req.body;

    // Validation
    if (!subject || !segment || !htmlContent) {
      return res.status(400).json({
        message: "Missing required fields: subject, segment, htmlContent",
      });
    }

    // Get users based on segment
    const query: any = {
      isOpted: true,
      email: { $exists: true, $ne: "" },
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

    // Get users with email addresses
    const users = await UserModel.find(query).select("email name");

    if (users.length === 0) {
      return res.status(404).json({
        message: "No users found in the selected segment",
      });
    }

    // Extract email addresses
    const emails = users.map((u) => u.email).filter((e) => e);

    logger.info(
      `Sending email campaign to ${emails.length} users in segment: ${segment}`
    );

    // Send bulk email using SendGrid (fromName and replyTo from env)
    const result = await sendGridService.sendBulkEmail(
      emails,
      subject,
      htmlContent
    );

    // TODO: Save to email history table
    // await EmailHistory.create({
    //   type: 'campaign',
    //   subject,
    //   segment,
    //   recipientCount: result.successful,
    //   status: 'sent',
    //   sentAt: new Date()
    // });

    logger.info(
      `Email campaign completed. Successful: ${result.successful}, Failed: ${result.failed}`
    );

    res.status(200).json({
      data: {
        message: "Email campaign sent successfully",
        recipientCount: emails.length,
        successful: result.successful,
        failed: result.failed,
        errors: result.errors,
      },
    });
  } catch (error: any) {
    logger.error("Send email campaign error:", error);
    res.status(500).json({
      message: "Failed to send email campaign",
      error: error.message,
    });
  }
};

/**
 * @description Get email history
 * @route GET /api/v1/email-marketing/history
 */
export const getEmailHistory = async (req: Request, res: Response) => {
  try {
    // TODO: Implement email history retrieval from database
    // For now, return empty array
    const history: any[] = [];

    res.status(200).json({
      data: history,
    });
  } catch (error: any) {
    logger.error("Get email history error:", error);
    res.status(500).json({
      message: "Failed to get email history",
      error: error.message,
    });
  }
};
