// services/twilio.service.ts
import twilio from "twilio";
import { logger } from "../utils/logger";

// ===========================
// CONFIGURATION
// ===========================
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const fromNumberMarketing = process.env.TWILIO_PHONE_NUMBER_MARKETING; // NEW: Marketing number
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

if (!accountSid || !authToken || !fromNumber) {
  logger.error(
    "Twilio configuration missing. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables."
  );
}

// Log marketing number if configured
if (fromNumberMarketing) {
  logger.info(`Using dedicated marketing number: ${fromNumberMarketing}`);
} else {
  logger.info("Using default number for all SMS types");
}

const client = twilio(accountSid, authToken);

// ===========================
// TYPES & INTERFACES
// ===========================
export interface SMSMessage {
  to: string;
  body: string;
}

export interface SMSResponse {
  success: boolean;
  sid?: string;
  error?: string;
  messageStatus?: string;
}

export interface SMSResult {
  success: boolean;
  sid?: string;
  messageStatus?: string;
  error?: string;
}

export interface BulkSMSResult {
  successful: number;
  failed: number;
  results: Array<{
    phoneNumber: string;
    status: "success" | "failed";
    sid?: string;
    error?: string;
  }>;
}

export enum MessageType {
  MARKETING = "marketing",
  TRANSACTIONAL = "transactional",
  OTP = "otp",
}

// Transaction-related interfaces
export interface TransactionalMessageData {
  playerName: string;
  transactionType:
    | "purchase"
    | "refund"
    | "subscription"
    | "welcome"
    | "deposit"
    | "withdrawal"
    | "game-account-request";
  amount?: number;
  currency?: string;
  transactionId?: string;
  status?: "completed" | "pending" | "failed";
  details?: string;
}

// Specific SMS data interfaces
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

export interface DepositRejectionSMSData {
  gameName: string;
  amount: number;
  reason: string;
}

export interface BulkSMSOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  maxRetries?: number;
}

// ===========================
// MAIN TWILIO SERVICE CLASS
// ===========================
class TwilioService {
  // ===========================
  // CORE SMS METHODS
  // ===========================

  /**
   * Send basic SMS message (core method)
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

      const formattedNumber = this.formatPhoneNumber(message.to);
      if (!formattedNumber) {
        const error = `Invalid phone number format: ${message.to}`;
        logger.error(error);
        return { success: false, error };
      }

      const messageOptions: any = {
        body: message.body,
        to: formattedNumber,
      };

      // Use messaging service for marketing, regular number for transactional
      if (messageType === MessageType.MARKETING && messagingServiceSid) {
        messageOptions.messagingServiceSid = messagingServiceSid;
      } else if (messageType === MessageType.MARKETING && fromNumberMarketing) {
        // Use dedicated marketing number if available
        messageOptions.from = fromNumberMarketing;
      } else {
        // Use default number
        messageOptions.from = fromNumber;
      }

      const result = await client.messages.create(messageOptions);

      logger.info(
        `${messageType.toUpperCase()} SMS sent successfully. SID: ${result.sid}, To: ${formattedNumber}, From: ${messageOptions.from || "Messaging Service"}, Status: ${result.status}`
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
   * Send SMS with retry logic
   */
  private async sendWithRetry(
    phoneNumber: string,
    message: string,
    messageType: MessageType,
    maxRetries: number
  ): Promise<{ success: boolean; sid?: string; error?: string }> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const formattedNumber = this.formatPhoneNumber(phoneNumber);
        if (!formattedNumber) {
          return {
            success: false,
            error: `Invalid phone number format: ${phoneNumber}`,
          };
        }

        const messageOptions: any = {
          body: message,
          to: formattedNumber,
        };

        // Use messaging service for marketing
        if (messageType === MessageType.MARKETING && messagingServiceSid) {
          messageOptions.messagingServiceSid = messagingServiceSid;
        } else if (
          messageType === MessageType.MARKETING &&
          fromNumberMarketing
        ) {
          // Use dedicated marketing number if available
          messageOptions.from = fromNumberMarketing;
        } else {
          messageOptions.from = fromNumber;
        }

        const result = await client.messages.create(messageOptions);

        return {
          success: true,
          sid: result.sid,
        };
      } catch (error: any) {
        lastError = error;
        logger.warn(
          `Attempt ${attempt}/${maxRetries} failed for ${phoneNumber}: ${error.message}`
        );

        // Don't retry on certain errors (invalid number, etc)
        if (
          error.code === 21211 ||
          error.code === 21614 ||
          error.code === 21408
        ) {
          logger.error(
            `Permanent error for ${phoneNumber}, skipping retries: ${error.message}`
          );
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await this.delay(1000 * attempt);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || "Unknown error",
    };
  }

  // ===========================
  // BUSINESS-SPECIFIC SMS METHODS
  // ===========================

  /**
   * Send OTP verification SMS
   */
  async sendOTPSMS(
    phoneNumber: string,
    otpData: OTPData,
    customMessage?: string
  ): Promise<SMSResponse> {
    let messageBody;

    if (customMessage) {
      messageBody = customMessage.replace(/{code}/g, otpData.code);
    } else {
      messageBody = this.generateOTPMessage(otpData);
    }

    const message = {
      to: phoneNumber,
      body: messageBody,
    };

    return this.sendSMS(message, MessageType.OTP);
  }

  /**
   * Send transactional SMS (receipts, confirmations, etc.)
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

  // ===========================
  // GTOA-SPECIFIC SMS METHODS
  // ===========================

  /**
   * Send marketing/promotional SMS
   */
  async sendGameAccountApprovalSMS(
    phoneNumber: string,
    data: GameAccountApprovalSMSData,
    customMessage?: string
  ): Promise<SMSResponse> {
    const message = {
      to: phoneNumber,
      body: customMessage || this.generateGameAccountApprovalMessage(data),
    };

    return this.sendSMS(message, MessageType.TRANSACTIONAL);
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

      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return {
          success: false,
          error: "Invalid phone number format",
        };
      }

      const message = `Hi ${userName}! 🎉 

You're now subscribed to GTOA notifications. You'll receive:
• Important account notices
• Reward announcements
• Promotional updates

Reply STOP to unsubscribe at any.`;

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

  // ===========================
  // IMPROVED BULK SMS METHODS
  // ===========================

  /**
   * Send bulk marketing SMS with improved batching and retry logic
   */
  async sendBulkMarketingSMS(
    phoneNumbers: string[],
    data: MarketingMessageData,
    customMessage?: string,
    options?: BulkSMSOptions
  ): Promise<BulkSMSResult> {
    const batchSize = options?.batchSize || 100; // Process 100 at a time
    const delayBetweenBatches = options?.delayBetweenBatches || 1000; // 1 second delay
    const maxRetries = options?.maxRetries || 3; // Retry failed messages 3 times

    let successful = 0;
    let failed = 0;
    const results: Array<{
      phoneNumber: string;
      status: "success" | "failed";
      sid?: string;
      error?: string;
    }> = [];

    const message = customMessage || this.generateMarketingMessage(data);

    // Validate and format all phone numbers first
    const validPhoneNumbers = phoneNumbers
      .map((phone) => this.formatPhoneNumber(phone))
      .filter((phone) => phone !== null) as string[];

    logger.info(
      `Starting bulk SMS campaign: ${validPhoneNumbers.length} valid numbers out of ${phoneNumbers.length} total`
    );

    // Split into batches
    const batches = this.createBatches(validPhoneNumbers, batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(
        `Processing batch ${i + 1}/${batches.length} (${batch.length} numbers)`
      );

      // Process batch concurrently with Promise.allSettled
      const batchPromises = batch.map(async (phoneNumber) => {
        return this.sendWithRetry(
          phoneNumber,
          message,
          MessageType.MARKETING,
          maxRetries
        );
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Count successes and failures
      batchResults.forEach((result, index) => {
        const phoneNumber = batch[index];

        if (result.status === "fulfilled" && result.value.success) {
          successful++;
          results.push({
            phoneNumber,
            status: "success",
            sid: result.value.sid,
          });
        } else {
          failed++;
          const error =
            result.status === "fulfilled"
              ? result.value.error
              : result.reason?.message || "Unknown error";

          results.push({
            phoneNumber,
            status: "failed",
            error,
          });
        }
      });

      // Delay between batches to avoid rate limiting
      if (i < batches.length - 1) {
        logger.info(`Waiting ${delayBetweenBatches}ms before next batch...`);
        await this.delay(delayBetweenBatches);
      }
    }

    logger.info(
      `Bulk SMS campaign completed. Successful: ${successful}, Failed: ${failed}`
    );

    return {
      successful,
      failed,
      results,
    };
  }

  /**
   * Send bulk SMS (generic version)
   */
  async sendBulkSMS(
    phoneNumbers: string[],
    message: string,
    messageType: MessageType = MessageType.MARKETING,
    options?: BulkSMSOptions
  ): Promise<BulkSMSResult> {
    const batchSize = options?.batchSize || 100;
    const delayBetweenBatches = options?.delayBetweenBatches || 1000;
    const maxRetries = options?.maxRetries || 3;

    let successful = 0;
    let failed = 0;
    const results: Array<{
      phoneNumber: string;
      status: "success" | "failed";
      sid?: string;
      error?: string;
    }> = [];

    // Validate and format all phone numbers first
    const validPhoneNumbers = phoneNumbers
      .map((phone) => this.formatPhoneNumber(phone))
      .filter((phone) => phone !== null) as string[];

    logger.info(
      `Starting bulk SMS: ${validPhoneNumbers.length} valid numbers out of ${phoneNumbers.length} total`
    );

    // Split into batches
    const batches = this.createBatches(validPhoneNumbers, batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(
        `Processing batch ${i + 1}/${batches.length} (${batch.length} numbers)`
      );

      // Process batch concurrently
      const batchPromises = batch.map(async (phoneNumber) => {
        return this.sendWithRetry(
          phoneNumber,
          message,
          messageType,
          maxRetries
        );
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Count successes and failures
      batchResults.forEach((result, index) => {
        const phoneNumber = batch[index];

        if (result.status === "fulfilled" && result.value.success) {
          successful++;
          results.push({
            phoneNumber,
            status: "success",
            sid: result.value.sid,
          });
        } else {
          failed++;
          const error =
            result.status === "fulfilled"
              ? result.value.error
              : result.reason?.message || "Unknown error";

          results.push({
            phoneNumber,
            status: "failed",
            error,
          });
        }
      });

      // Delay between batches
      if (i < batches.length - 1) {
        await this.delay(delayBetweenBatches);
      }
    }

    logger.info(
      `Bulk SMS completed. Successful: ${successful}, Failed: ${failed}`
    );

    return {
      successful,
      failed,
      results,
    };
  }

  // ===========================
  // MESSAGE GENERATORS (Private Methods)
  // ===========================

  private generateDepositRejectionMessage(
    data: DepositRejectionSMSData
  ): string {
    const amountUSD = (data.amount / 100).toFixed(2);

    return `GTOA: Your deposit request for ${data.gameName} was rejected.
Amount: ${data.amount} GC (worth: ${amountUSD})
Reason: ${data.reason}
The amount has been refunded to your wallet.
Thank you for being part of the GTOA family!
GTOA sweepstakes run under Official Rules. No purchase necessary. Void where prohibited.`;
  }

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
        message += `💳 Deposit Update`;
        if (data.amount && data.currency) {
          message += `\nAmount: ${data.currency}${data.amount}`;
        }
        break;
      case "withdrawal":
        message += `🏦 Withdrawal Update`;
        if (data.amount && data.currency) {
          message += `\nAmount: ${data.currency}${data.amount}`;
        }
        break;
      case "game-account-request":
        message += `🎮 Game Account Request`;
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

  private generateGameAccountApprovalMessage(
    data: GameAccountApprovalSMSData
  ): string {
    return `🎮 Game Account Approved!

Hello ${data.userName},

Your ${data.gameName} account request has been approved!

Username: ${data.username}
Password: ${data.password}

You can now log in and start playing!

For support, contact our team.

Thank you for choosing us!`;
  }

  // ===========================
  // UTILITY METHODS
  // ===========================

  private formatPhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, "");

    // If doesn't start with +, add country code
    if (!cleaned.startsWith("+")) {
      if (cleaned.length === 10) {
        // US 10-digit number (e.g., 8005551234)
        cleaned = "+1" + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
        // US 11-digit with 1 prefix (e.g., 18005551234)
        cleaned = "+" + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith("234")) {
        // Nigerian number starting with 234
        cleaned = "+" + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
        // Might be Nigerian number with 0 prefix (e.g., 08012345678)
        // Remove the 0 and add +234
        cleaned = "+234" + cleaned.substring(1);
      } else if (cleaned.length === 13 && cleaned.startsWith("234")) {
        // Full Nigerian number without + (e.g., 2348012345678)
        cleaned = "+" + cleaned;
      } else {
        logger.warn(
          `Unrecognized phone number format: ${phoneNumber} (length: ${cleaned.length})`
        );
        return null;
      }
    }

    // Validate final format
    const digitsOnly = cleaned.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      logger.warn(
        `Invalid phone number length: ${phoneNumber} (${digitsOnly.length} digits)`
      );
      return null;
    }

    return cleaned;
  }

  /**
   * Split array into batches
   */
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return formatted !== null;
  }

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

  generateOTP(length: number = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, "0");
  }

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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get account balance
   */
  async getBalance() {
    try {
      const balance = await client.balance.fetch();
      return {
        balance: balance.balance,
        currency: balance.currency,
      };
    } catch (error: any) {
      logger.error("Get balance error:", error);
      return null;
    }
  }

  /**
   * Get SMS usage stats
   */
  async getUsageStats(startDate?: Date, endDate?: Date) {
    try {
      const records = await client.usage.records.list({
        category: "sms",
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate || new Date(),
      });

      return records;
    } catch (error: any) {
      logger.error("Get usage stats error:", error);
      return null;
    }
  }
}

// ===========================
// EXPORT SINGLETON
// ===========================
const twilioService = new TwilioService();
export default twilioService;
