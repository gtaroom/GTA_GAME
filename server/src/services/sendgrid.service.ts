// services/sendgrid.service.ts
import sgMail from "@sendgrid/mail";
import { logger } from "../utils/logger";

// ===========================
// CONFIGURATION
// ===========================
const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;
const fromName = process.env.SENDGRID_FROM_NAME || "GTOA";

if (!apiKey || !fromEmail) {
  logger.error(
    "SendGrid configuration missing. Please set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL environment variables."
  );
} else {
  sgMail.setApiKey(apiKey);
}

// ===========================
// TYPES & INTERFACES
// ===========================
export interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface BulkEmailResult {
  successful: number;
  failed: number;
  errors: string[];
}

// ===========================
// MAIN SENDGRID SERVICE CLASS
// ===========================
class SendGridService {
  /**
   * Send individual email
   */
  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    try {
      if (!apiKey || !fromEmail) {
        const error = "SendGrid not configured properly";
        logger.error(error);
        return { success: false, error };
      }

      const msg = {
        to: message.to,
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: message.subject,
        text: message.text || "",
        html: message.html || message.text || "",
      };

      const response = await sgMail.send(msg);

      logger.info(`Email sent successfully to ${message.to}`);

      return {
        success: true,
        messageId: response[0]?.headers["x-message-id"] || "unknown",
      };
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      logger.error("Error sending email:", error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send bulk email campaign
   * Sends to multiple recipients in batches
   */
  async sendBulkEmail(
    recipients: string[],
    subject: string,
    htmlContent: string,
    fromNameOverride?: string,
    replyToOverride?: string
  ): Promise<BulkEmailResult> {
    const result: BulkEmailResult = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    if (!apiKey || !fromEmail) {
      const error = "SendGrid not configured properly";
      logger.error(error);
      result.failed = recipients.length;
      result.errors.push(error);
      return result;
    }

    const BATCH_SIZE = 1000; // SendGrid allows up to 1000 recipients per request

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      try {
        const msg = {
          to: batch,
          from: {
            email: fromEmail,
            name: fromNameOverride || fromName,
          },
          replyTo: replyToOverride || fromEmail,
          subject: subject,
          html: htmlContent,
        };

        await sgMail.send(msg);

        result.successful += batch.length;
        logger.info(`Batch email sent to ${batch.length} recipients`);

        // Small delay between batches to avoid rate limits
        if (i + BATCH_SIZE < recipients.length) {
          await this.delay(100);
        }
      } catch (error: any) {
        const errorMessage = error.message || "Unknown error";
        result.failed += batch.length;
        result.errors.push(`Batch ${i / BATCH_SIZE + 1}: ${errorMessage}`);
        logger.error(`Error sending batch email:`, error);
      }
    }

    logger.info(
      `Bulk email campaign completed. Successful: ${result.successful}, Failed: ${result.failed}`
    );

    return result;
  }

  /**
   * Send transactional email (receipts, confirmations, etc.)
   */
  async sendTransactionalEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      subject,
      html: htmlContent,
      text: textContent,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<EmailResponse> {
    const subject = "Welcome to GTOA! 🎮";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to GTOA, ${userName}! 🎉</h1>
        <p>We're excited to have you join our gaming community!</p>
        <p>Get started by exploring our games and competing for amazing prizes.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Start Playing
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject,
      html,
    });
  }

  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ===========================
// EXPORT SINGLETON
// ===========================
const sendGridService = new SendGridService();
export default sendGridService;
