import twilio from "twilio";
import { logger } from "../utils/logger";

// Twilio client initialization
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID; // Optional for bulk messaging

if (!accountSid || !authToken || !fromNumber) {
  logger.error(
    "Twilio configuration missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables."
  );
}

const client = twilio(accountSid, authToken);

// Types and interfaces
export interface SMSMessage {
  to: string;
  body: string;
}
export interface SMSResult {
  success: boolean;
  sid?: string;
  messageStatus?: string;
  error?: string;
}

export interface SMSResponse {
  success: boolean;
  sid?: string;
  error?: string;
  messageStatus?: string;
}

export interface GameAccountApprovalSMSData {
  userName: string;
  gameName: string;
  username: string;
  password: string;
  requestedAmount?: number;
}

export interface MarketingMessageData {
  playerName: string;
  gameName?: string;
  promotionDetails?: string;
  discountCode?: string;
  expiryDate?: string;
}

export interface TransactionalMessageData {
  playerName: string;
  transactionType:
    | "purchase"
    | "refund"
    | "subscription"
    | "welcome"
    | "deposit"
    | "withdrawal";
  amount?: number;
  currency?: string;
  transactionId?: string;
  status?: "completed" | "pending" | "failed";
  details?: string;
}

export interface OTPData {
  code: string;
  expiryMinutes?: number;
  purpose?:
    | "login"
    | "registration"
    | "password-reset"
    | "transaction"
    | "verification";
}

export enum MessageType {
  MARKETING = "marketing",
  TRANSACTIONAL = "transactional",
  OTP = "otp",
}

class TwilioService {
  /**
   * Send basic SMS message
   */
  async sendSMS(
    message: SMSMessage,
    messageType: MessageType = MessageType.TRANSACTIONAL
  ): Promise<SMSResponse> {
    try {
      if (!accountSid || !authToken || !fromNumber) {
        const error = "Twilio not configured properly";
        logger.error(error);
        return { success: false, error };
      }

      // Format phone number
      const formattedNumber = this.formatPhoneNumber(message.to);

      if (!formattedNumber) {
        const error = `Invalid phone number format: ${message.to}`;
        logger.error(error);
        return { success: false, error };
      }

      // Prepare message options
      const messageOptions: any = {
        body: message.body,
        to: formattedNumber,
      };

      // Use messaging service for marketing messages if available, otherwise use from number
      if (messageType === MessageType.MARKETING && messagingServiceSid) {
        messageOptions.messagingServiceSid = messagingServiceSid;
      } else {
        messageOptions.from = fromNumber;
      }

      const result = await client.messages.create(messageOptions);

      logger.info(
        `${messageType.toUpperCase()} SMS sent successfully. SID: ${result.sid}, To: ${formattedNumber}, Status: ${result.status}`
      );

      return {
        success: true,
        sid: result.sid,
        messageStatus: result.status,
      };
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      logger.error(`Error sending ${messageType} SMS:`, error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send marketing/promotional SMS
   */
  async sendMarketingSMS(
    phoneNumber: string,
    data: MarketingMessageData,
    customMessage?: string
  ): Promise<SMSResponse> {
    const message = {
      to: phoneNumber,
      body: customMessage || this.generateMarketingMessage(data),
    };

    return this.sendSMS(message, MessageType.MARKETING);
  }

  /**
   * Send transactional SMS (confirmations, notifications, etc.)
   */
  async sendTransactionalSMS(
    phoneNumber: string,
    data: TransactionalMessageData,
    customMessage?: string
  ): Promise<SMSResponse> {
    const message = {
      to: phoneNumber,
      body: customMessage || this.generateTransactionalMessage(data),
    };

    return this.sendSMS(message, MessageType.TRANSACTIONAL);
  }

  /**
   * Send OTP SMS
   */
  async sendOTPSMS(
    phoneNumber: string,
    otpData: OTPData,
    customMessage?: string
  ): Promise<SMSResponse> {
    let messageBody;

    if (customMessage) {
      // Replace {code} placeholder with actual OTP code
      messageBody = customMessage.replace(/{code}/g, otpData.code);
    } else {
      messageBody = this.generateOTPMessage(otpData);
    }
    console.log("Phone number being sent:", phoneNumber);

    const message = {
      to: phoneNumber,
      body: messageBody,
    };

    return this.sendSMS(message, MessageType.OTP);
  }

  /**
   * Send game account approval SMS (existing functionality)
   */
  async sendGameAccountApprovalSMS(
    phoneNumber: string,
    data: GameAccountApprovalSMSData,
    customMessage?: string // Add this parameter
  ): Promise<SMSResponse> {
    const message = {
      to: phoneNumber,
      body: customMessage || this.generateGameAccountApprovalMessage(data), // Use custom message if provided
    };

    return this.sendSMS(message, MessageType.TRANSACTIONAL);
  }

  /**
   * Send bulk SMS (for marketing campaigns)
   */
  async sendBulkMarketingSMS(
    phoneNumbers: string[],
    data: MarketingMessageData,
    customMessage?: string
  ): Promise<{ successful: number; failed: number; results: SMSResponse[] }> {
    const results: SMSResponse[] = [];
    let successful = 0;
    let failed = 0;

    const message = customMessage || this.generateMarketingMessage(data);

    // Process in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize);
      const batchPromises = batch.map((phoneNumber) =>
        this.sendMarketingSMS(phoneNumber, data, message)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
          if (result.value.success) {
            successful++;
          } else {
            failed++;
          }
        } else {
          results.push({
            success: false,
            error: result.reason?.message || "Promise rejected",
          });
          failed++;
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < phoneNumbers.length) {
        await this.delay(1000); // 1 second delay
      }
    }

    logger.info(
      `Bulk SMS campaign completed. Successful: ${successful}, Failed: ${failed}`
    );

    return { successful, failed, results };
  }

  /**
   * Generate marketing message
   */
  private generateMarketingMessage(data: MarketingMessageData): string {
    let message = `🎮 Hey ${data.playerName}!`;

    if (data.promotionDetails) {
      message += `\n\n${data.promotionDetails}`;
    }

    if (data.discountCode) {
      message += `\n\n🎁 Use code: ${data.discountCode}`;
    }

    if (data.expiryDate) {
      message += `\n⏰ Valid until: ${data.expiryDate}`;
    }

    if (data.gameName) {
      message += `\n\n🎯 Available in ${data.gameName}`;
    }

    message += `\n\nDon't miss out! 🚀`;
    message += `\n\nReply STOP to opt out`;

    return message;
  }

  /**
   * Generate transactional message
   */
  private generateTransactionalMessage(data: TransactionalMessageData): string {
    let message = `Hello ${data.playerName},\n\n`;

    switch (data.transactionType) {
      case "purchase":
        message += `✅ Purchase Confirmed`;
        if (data.amount && data.currency) {
          message += `\nAmount: ${data.currency}${data.amount}`;
        }
        break;
      case "refund":
        message += `💰 Refund Processed`;
        if (data.amount && data.currency) {
          message += `\nRefund Amount: ${data.currency}${data.amount}`;
        }
        break;
      case "subscription":
        message += `📅 Subscription Update`;
        break;
      case "welcome":
        message += `🎉 Welcome to GTOA!`;
        break;
      case "deposit":
        message += `💳 Deposit Successful`;
        if (data.amount && data.currency) {
          message += `\nDeposited: ${data.currency}${data.amount}`;
        }
        break;
      case "withdrawal":
        message += `🏦 Withdrawal Request`;
        if (data.amount && data.currency) {
          message += `\nAmount: ${data.currency}${data.amount}`;
        }
        break;
      default:
        message += `📋 Transaction Update`;
    }

    if (data.status) {
      message += `\nStatus: ${data.status.toUpperCase()}`;
    }

    if (data.transactionId) {
      message += `\nID: ${data.transactionId}`;
    }

    if (data.details) {
      message += `\n\n${data.details}`;
    }

    message += `\n\nFor support, contact our team.`;

    return message;
  }

  /**
   * Generate OTP message
   */
  private generateOTPMessage(otpData: OTPData): string {
    let message = `🔐 Your verification code: ${otpData.code}`;

    if (otpData.purpose) {
      const purposeText = {
        login: "login",
        registration: "account registration",
        "password-reset": "password reset",
        transaction: "transaction verification",
        verification: "account verification",
      };
      message += `\n\nUse this code for ${purposeText[otpData.purpose]}.`;
    }

    const expiryMinutes = otpData.expiryMinutes || 10;
    message += `\n\n⏰ Expires in ${expiryMinutes} minutes.`;
    message += `\n\n🔒 Keep this code secure and don't share it.`;

    return message;
  }

  /**
   * Generate game account approval message (existing)
   */
  private generateGameAccountApprovalMessage(
    data: GameAccountApprovalSMSData
  ): string {
    return `🎮 Game Account Approved!

Hello ${data.userName},

Your ${data.gameName} account request has been approved!

Username: ${data.username}
Password: ${data.password}
${data.requestedAmount ? `Requested Deposit: $${data.requestedAmount.toFixed(2)}(\worth ${(data.requestedAmount * 100).toFixed(0)} GC) added to your game by our team.` : ""}
You can now log in and start playing!

For support, contact our team.

Thank you for choosing us!`;
  }

  /**
   * Format phone number for Twilio
   */
  private formatPhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, "");

    // If no + prefix, add it
    if (!cleaned.startsWith("+")) {
      // Add +1 for US numbers if it's 10 digits
      if (cleaned.length === 10) {
        cleaned = "+1" + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
        cleaned = "+" + cleaned;
      } else {
        // For international numbers, you might need to add country code
        logger.warn(
          `Phone number format may need country code: ${phoneNumber}`
        );
        return null;
      }
    }

    // Basic validation - should be at least 10 digits after +
    const digitsOnly = cleaned.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return null;
    }

    return cleaned;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return formatted !== null;
  }

  /**
   * Check message delivery status
   */
  async getMessageStatus(messageSid: string): Promise<string | null> {
    try {
      const message = await client.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      logger.error(
        `Error fetching message status for SID ${messageSid}:`,
        error
      );
      return null;
    }
  }
  /**
   * Send opt-in confirmation SMS
   */
  async sendOptInConfirmationSMS(
    phoneNumber: string,
    userName: string
  ): Promise<SMSResult> {
    try {
      if (!phoneNumber || !userName) {
        return {
          success: false,
          error: "Phone number and user name are required",
        };
      }

      // Validate phone number format
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return {
          success: false,
          error: "Invalid phone number format",
        };
      }

      const message = `Hi ${userName}! 🎉 \n\nYou’re now subscribed to GTOA notifications. You’ll receive important updates, including:\n• Account updates\n• Rewards & bonuses\n• Deposit confirmations\n• Withdrawal alerts\n• Exclusive offers\n\nReply STOP to unsubscribe anytime.\Message & data rates may apply.`;

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedPhone,
      });

      logger.info(
        `Opt-in confirmation SMS sent successfully. SID: ${result.sid}, To: ${formattedPhone}`
      );

      return {
        success: true,
        sid: result.sid,
        messageStatus: result.status,
      };
    } catch (error) {
      logger.error("Error sending opt-in confirmation SMS:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send opt-in confirmation SMS",
      };
    }
  }
  /**
   * Test SMS functionality
   */
  async testSMS(
    toNumber: string,
    messageType: MessageType = MessageType.TRANSACTIONAL
  ): Promise<SMSResponse> {
    const testMessages = {
      [MessageType.MARKETING]:
        "🎮 Welcome to our gaming platform! Special offer just for you - 50% off your first purchase! Use code: TEST50. Valid for 24 hours. Reply STOP to opt out.",
      [MessageType.TRANSACTIONAL]:
        "🧪 This is a test transactional SMS from your game server. Integration is working perfectly!",
      [MessageType.OTP]:
        "🔐 Your test verification code: 123456\n\nExpires in 10 minutes.\n\n🔒 Keep this code secure.",
    };

    const testMessage = {
      to: toNumber,
      body: testMessages[messageType],
    };

    return this.sendSMS(testMessage, messageType);
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate random OTP
   */
  generateOTP(length: number = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, "0");
  }
}

// Export singleton instance
const twilioService = new TwilioService();
export default twilioService;
