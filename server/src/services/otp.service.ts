import crypto from "crypto";
import { logger } from "../utils/logger";
import OTPModel from "../models/otp.model";
import twilioService from "./twilio.service";
import { formatPhoneNumber } from "../utils/phone-formatter";

export interface OTPData {
  phoneNumber: string;
}

export interface OTPVerificationData {
  phoneNumber: string;
  otpCode: string;
}

class OTPService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_OTP_PER_HOUR = 5;
  private readonly MAX_OTP_PER_DAY = 10;

  /**
   * Generate a random 6-digit OTP
   */
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Check if user has exceeded OTP limits
   */
  private async checkOTPLimits(
    phoneNumber: string
  ): Promise<{ canSend: boolean; reason?: string }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check hourly limit
    const hourlyCount = await OTPModel.countDocuments({
      phoneNumber,
      createdAt: { $gte: oneHourAgo },
    });

    // if (hourlyCount >= this.MAX_OTP_PER_HOUR) {
    //   return {
    //     canSend: false,
    //     reason: `Too many OTP requests. Please wait before requesting another code.`,
    //   };
    // }

    // Check daily limit
    // const dailyCount = await OTPModel.countDocuments({
    //   phoneNumber,
    //   createdAt: { $gte: oneDayAgo },
    // });

    // if (dailyCount >= this.MAX_OTP_PER_DAY) {
    //   return {
    //     canSend: false,
    //     reason: `Daily OTP limit exceeded. Please try again tomorrow.`,
    //   };
    // }

    return { canSend: true };
  }

  /**
   * Invalidate existing OTPs for the same phone number and purpose
   */
  private async invalidateExistingOTPs(
    phoneNumber: string,
    purpose: string
  ): Promise<void> {
    await OTPModel.updateMany(
      {
        phoneNumber,
        purpose,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      },
      { isUsed: true }
    );
  }

  /**
   * Send OTP via SMS - EXACT SAME SIGNATURE AS ORIGINAL
   */
  async sendOTP(
    data: OTPData
  ): Promise<{ success: boolean; message: string; otpCode?: string }> {
    try {
      const { phoneNumber } = data;

      // Format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return {
          success: false,
          message: "Invalid phone number format",
        };
      }

      // Check OTP limits
      const limitCheck = await this.checkOTPLimits(formattedPhone);
      if (!limitCheck.canSend) {
        return {
          success: false,
          message: limitCheck.reason || "OTP limit exceeded",
        };
      }

      // Invalidate existing OTPs
      await this.invalidateExistingOTPs(formattedPhone, "PHONE_VERIFICATION");

      // Generate new OTP
      const otpCode = this.generateOTP();
      const expiresAt = new Date(
        Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000
      );

      // Create OTP record
      await OTPModel.create({
        phoneNumber: formattedPhone,
        otpCode,
        purpose: "PHONE_VERIFICATION",
        expiresAt,
      });

      // Prepare SMS message - EXACT SAME FORMAT AS ORIGINAL
      const smsBody = `GTOA: Thank you for registering!\n\nYour verification code is ${otpCode}. Enter this code within ${this.OTP_EXPIRY_MINUTES} minutes to complete your registration.\n\nReply STOP to cancel, HELP for help. Msg & data rates may apply.`;
      // Send SMS using Twilio (replacing ezTextingService call)
      const smsResult = await twilioService.sendOTPSMS(
        formattedPhone,
        {
          code: otpCode,
          expiryMinutes: this.OTP_EXPIRY_MINUTES,
          purpose: "verification",
        },
        smsBody
      ); // Use custom message to match original format

      const smsSent = smsResult.success;
      console.log(otpCode, "otpCode");
      // if (!smsSent) {
      //   // If SMS failed, delete the OTP record
      //   await OTPModel.deleteOne({ phoneNumber: formattedPhone, otpCode });
      //   return {
      //     success: false,
      //     message: "Failed to send SMS. Please try again.",
      //   };
      // }

      logger.info(
        `OTP sent successfully to ${formattedPhone} for phone verification`
      );

      // In development, return the OTP code for testing
      const isDevelopment = process.env.NODE_ENV === "development";

      return {
        success: true,
        message: `OTP sent successfully to ${formattedPhone}`,
        otpCode: isDevelopment ? otpCode : undefined,
      };
    } catch (error) {
      logger.error("Error sending OTP:", error);
      return {
        success: false,
        message: "Failed to send OTP. Please try again.",
      };
    }
  }

  /**
   * Verify OTP code - EXACT SAME SIGNATURE AS ORIGINAL
   */
  async verifyOTP(
    data: OTPVerificationData
  ): Promise<{ success: boolean; message: string; isValid: boolean }> {
    try {
      const { phoneNumber, otpCode } = data;

      // Format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);

      if (!formattedPhone) {
        return {
          success: false,
          message: "Invalid phone number format",
          isValid: false,
        };
      }

      // Find the OTP record
      const otpRecord = await OTPModel.findOne({
        phoneNumber: formattedPhone,
        otpCode,
        purpose: "PHONE_VERIFICATION",
        isUsed: false,
        expiresAt: { $gt: new Date() },
      });
      if (!otpRecord) {
        return {
          success: true,
          message: "Invalid or expired OTP code",
          isValid: false,
        };
      }

      // Check if max attempts exceeded
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        await OTPModel.updateOne({ _id: otpRecord._id }, { isUsed: true });
        return {
          success: true,
          message: "Too many failed attempts. OTP has been invalidated.",
          isValid: false,
        };
      }

      // Increment attempts
      await OTPModel.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      );

      // Mark OTP as used
      await OTPModel.updateOne({ _id: otpRecord._id }, { isUsed: true });

      // Send welcome SMS after successful verification
      // try {
      //   const welcomeMessage = `Welcome to GTOA! 🎉\n\nYour account is now verified. You’ll receive SMS notifications for important updates, including account activity, security alerts, and general platform information.`;

      //   await twilioService.sendTransactionalSMS(
      //     formattedPhone,
      //     {
      //       playerName: "Valued Player",
      //       transactionType: "welcome", // Using the new welcome type
      //     },
      //     welcomeMessage
      //   );

      //   logger.info(
      //     `Welcome SMS sent to ${formattedPhone} after successful verification`
      //   );
      // } catch (smsError) {
      //   // Log the error but don't fail the verification process
      //   logger.error(
      //     `Failed to send welcome SMS to ${formattedPhone}:`,
      //     smsError
      //   );
      // }

      logger.info(
        `OTP verified successfully for ${formattedPhone} for phone verification`
      );

      return {
        success: true,
        message: "OTP verified successfully",
        isValid: true,
      };
    } catch (error) {
      logger.error("Error verifying OTP:", error);
      return {
        success: false,
        message: "Failed to verify OTP. Please try again.",
        isValid: false,
      };
    }
  }

  /**
   * Resend OTP - EXACT SAME SIGNATURE AS ORIGINAL
   */
  async resendOTP(
    data: OTPData
  ): Promise<{ success: boolean; message: string; otpCode?: string }> {
    try {
      const { phoneNumber } = data;

      // Format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return {
          success: false,
          message: "Invalid phone number format",
        };
      }

      // Check if there's a recent OTP (within last 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const recentOTP = await OTPModel.findOne({
        phoneNumber: formattedPhone,
        purpose: "PHONE_VERIFICATION",
        createdAt: { $gte: twoMinutesAgo },
      });

      // if (recentOTP) {
      //   return {
      //     success: false,
      //     message: "Please wait 2 minutes before requesting a new OTP",
      //   };
      // }

      // Send new OTP
      return await this.sendOTP(data);
    } catch (error) {
      logger.error("Error resending OTP:", error);
      return {
        success: false,
        message: "Failed to resend OTP. Please try again.",
      };
    }
  }
}

const otpService = new OTPService();
export default otpService;
