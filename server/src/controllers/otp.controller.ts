import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import otpService from "../services/otp.service";
import { formatPhoneNumber } from "../utils/phone-formatter";
import UserModel from "../models/user.model";
import { getUserFromRequest } from "../utils/get-user";
import { logger } from "../utils/logger";
import twilioService from "../services/twilio.service";

/**
 * Send OTP for phone verification
 */
const sendPhoneVerificationOTP = asyncHandler(
  async (req: Request, res: Response) => {
    const { phone: phoneNumber } = req.body;
    if (!phoneNumber) {
      throw new ApiError(400, "Phone number is required");
    }

    // Validate phone number format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      throw new ApiError(400, "Invalid phone number format");
    }

    // Check if phone number is already verified by another user
    const existingUser = await UserModel.findOne({
      phone: formattedPhone,
      isPhoneVerified: true,
    });
    if (existingUser) {
      throw new ApiError(
        409,
        "This phone number is already verified by another user"
      );
    }

    const result = await otpService.sendOTP({
      phoneNumber: formattedPhone,
    });

    if (!result.success) {
      throw new ApiError(400, result.message);
    }
    console.log("OTP Service Result:", result);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          message: result.message,
          otpCode: result.otpCode, // Only returned in development
        },
        "OTP sent successfully"
      )
    );
  }
);

/**
 * Verify phone number with OTP
 */
const verifyPhoneOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  // const { _id } = getUserFromRequest(req);

  const phoneNumber = phone;
  const otpCode = otp;

  if (!phoneNumber || !otpCode) {
    throw new ApiError(400, "Phone number and OTP code are required");
  }

  // Validate phone number format
  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    throw new ApiError(400, "Invalid phone number format");
  }

  // Validate OTP format (6 digits)
  if (!/^\d{6}$/.test(otpCode)) {
    throw new ApiError(400, "OTP code must be 6 digits");
  }

  const result = await otpService.verifyOTP({
    phoneNumber: formattedPhone,
    otpCode,
  });

  if (!result.success) {
    throw new ApiError(500, result.message);
  }

  if (!result.isValid) {
    throw new ApiError(400, result.message);
  }
console.log("result", result);
console.log("formattedPhone", formattedPhone);
  // Update user's phone verification status
  // const user = await UserModel.findById(_id);
  const user = await UserModel.findOne({
    phone: formattedPhone,
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.phone = formattedPhone;
  user.isPhoneVerified = true;
  await user.save();

  // Send marketing opt-in SMS if user opted in during registration
  if (user.isSmsOpted) {
    try {
      const userName = user.name?.first || "Player";
      const smsResult = await twilioService.sendOptInConfirmationSMS(
        formattedPhone,
        userName
      );

      if (smsResult.success) {
        logger.info(
          `Marketing opt-in confirmation sent to ${formattedPhone} after phone verification`
        );
      } else {
        logger.error(`Failed to send marketing opt-in SMS: ${smsResult.error}`);
      }
    } catch (error) {
      logger.error(
        "Error sending marketing opt-in SMS after verification:",
        error
      );
    }
  }

  return res.status(200).json({
    success: true,
    message: "Phone number verified successfully",
    isVerified: true,
    user: {
      phone: formattedPhone,
      isPhoneVerified: true,
    },
  });
});

/**
 * Resend OTP for phone verification
 */
const resendPhoneVerificationOTP = asyncHandler(
  async (req: Request, res: Response) => {
    const { phone } = req.body;
    const phoneNumber = phone;

    if (!phoneNumber) {
      throw new ApiError(400, "Phone number is required");
    }

    // Validate phone number format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      throw new ApiError(400, "Invalid phone number format");
    }

    const result = await otpService.resendOTP({
      phoneNumber: formattedPhone,
    });

    if (!result.success) {
      throw new ApiError(400, result.message);
    }
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          message: result.message,
          otpCode: result.otpCode, // Only returned in development
        },
        "OTP resent successfully"
      )
    );
  }
);

export { sendPhoneVerificationOTP, verifyPhoneOTP, resendPhoneVerificationOTP };
