import crypto from "crypto";
import { Request, Response } from "express";
import fs from "fs";
import jwt, { Secret } from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import * as XLSX from "xlsx";
import { authProvider, rolesEnum } from "../constants";
import { RefreshDecodedToken } from "../middlewares/auth-middleware";
import UserBonusModel from "../models/bonus.model";
import { default as User, default as UserModel } from "../models/user.model";
import WalletModel from "../models/wallet.model";
import { validateAddress } from "../utils/address-validator";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { getUserFromRequest } from "../utils/get-user";
import { minAge } from "../utils/helper";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
  sendEmailNotify,
} from "../utils/mail";
import walletModel from "../models/wallet.model";
import ezTextingService from "../services/eztexting.service";
import otpService from "../services/otp.service";
import { formatPhoneNumber } from "../utils/phone-formatter";
import twilioService from "../services/twilio.service";
import { logger } from "../utils/logger";
import UserGameAccountModel from "../models/user-game-account.model";
import GameAccountRequestModel from "../models/game-account-request.model";
import rechargeRequestModel from "../models/recharge-request.model";
import withdrawalRequestModel from "../models/withdrawal-request.model";
import NotificationModel from "../models/notification.model";
import AmoeModel from "../models/amoe-entry.model";
import ReferralModel from "../models/referral.model";
import { creditPendingAmoeEntries } from "../utils/credit-pending-entries.util";

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, name, password, role, phone, acceptSMSMarketing, isOpted } =
    req.body;



  // Collect all validation errors
  const validationErrors: string[] = [];

  // Check banned states
  const bannedStates = [
    "Washington",
    "Michigan",
    "Montana",
    "Connecticut",
    "Idaho",
    "California",
  ];

  if (req.body.state && bannedStates.includes(req.body.state)) {
    validationErrors.push(
      "Sorry, this platform isn't available for your address!"
    );
  }

  // Check for existing email
  const existedUser = await User.findOne({ email });

  // Check for existing phone
  let existingPhoneUser = null;
  if (phone) {
    const formattedPhone = formatPhoneNumber(phone);
    if (formattedPhone) {
      existingPhoneUser = await User.findOne({ phone: formattedPhone });
    }
  }

  // Add email error if exists and is verified
  if (existedUser && existedUser.isEmailVerified) {
    validationErrors.push(
      "This email is already registered. Please use a different email or login."
    );
  }

  // Add phone error if exists
  if (existingPhoneUser) {
    validationErrors.push(
      "This phone number is already registered with another account. Please use a different phone number."
    );
  }

  // If there are validation errors, return them all at once
  if (validationErrors.length > 0) {
    throw new ApiError(409, validationErrors.join(" | "), []);
  }

  // Handle unverified existing user
  if (existedUser && !existedUser.isEmailVerified) {
    const { password, ...other } = req.body;
    const updatingUser = await User.findByIdAndUpdate(
      { _id: existedUser._id },
      { ...other },
      { new: true }
    );

    const { unHashedToken, hashedToken, tokenExpiry } =
      updatingUser.generateTemporaryToken();
    updatingUser.password = password;
    updatingUser.emailVerificationToken = hashedToken;
    updatingUser.emailVerificationExpiry = tokenExpiry;
    await updatingUser.save();

    const user = await User.findById(updatingUser._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    await sendEmail({
      email: existedUser.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        `${user.name.first} ${user.name.middle} ${user.name.last}`,
        `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}?email=${user.email}`
      ),
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          201,
          { user: existedUser },
          "User verification email has been sent to your email."
        )
      );
  }

  let user;
  const { referralCode:codeY,...other } = req.body;
  try {
    user = await User.create({
      ...other,
      email,
      password,
      name,
      isEmailVerified: false,
      isSmsOpted: acceptSMSMarketing || false,
      isOpted,
      role: rolesEnum.USER,
    });
  } catch (error: any) {
    // Handle database constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === "phone") {
        throw new ApiError(
          409,
          "This phone number is already registered with another account. Please use a different phone number."
        );
      } else if (field === "email") {
        throw new ApiError(
          409,
          "This email is already registered. Please use a different email.",
          []
        );
      } else {
        throw new ApiError(
          409,
          `A user with this ${field} already exists. Please use a different ${field}.`
        );
      }
    }
    throw error;
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save();
  await UserBonusModel.create({ userId: user._id });
  
  // Initialize spin wheel eligibility for new user
  try {
    const spinWheelService = (await import("../services/spin-wheel.service")).default;
    await spinWheelService.getOrCreateEligibility(user._id);
    logger.info(`Spin wheel eligibility initialized for new user ${user._id}`);
  } catch (error) {
    logger.error(`Error initializing spin wheel eligibility for user ${user._id}:`, error);
    // Don't fail registration if spin wheel initialization fails
  }

  // Handle referral code (from query param or body)
  const referralCode = req.query.ref || req.body.referralCode || req.query.aff || req.body.affiliateCode;
  if (referralCode) {
    try {
      const code = String(referralCode).toUpperCase().trim();
      
      // Check if it's a user referral code
      const referrer = await User.findOne({ referralCode: code });
      if (referrer && referrer._id.toString() !== user._id.toString()) {
        // Create referral record
        await ReferralModel.create({
          referrerId: referrer._id,
          referredId: user._id,
          referralCode: code,
          status: "pending",
        });
        logger.info(`Referral created: ${referrer._id} referred ${user._id} with code ${code}`);
      } else {
        // Check if it's an affiliate code
        const AffiliateModel = (await import("../models/affiliate.model")).default;
        const affiliate = await AffiliateModel.findOne({
          affiliateCode: code,
          status: "approved",
        });
        
        if (affiliate) {
          // Create referral record with affiliate code
          await ReferralModel.create({
            referrerId: affiliate.userId || null,
            referredId: user._id,
            referralCode: code,
            status: "pending",
          });
          logger.info(`Affiliate referral created: affiliate ${affiliate._id} referred ${user._id} with code ${code}`);
        } else {
          logger.warn(`Invalid referral code used during registration: ${code}`);
        }
      }
    } catch (error) {
      // Don't fail registration if referral code handling fails
      logger.error("Error processing referral code during registration:", error);
    }
  }

  // Send email verification
  await sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      `${user.name.first} ${user.name.middle} ${user.name.last}`,
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}?email=${user.email}`
    ),
  });

  // Send SMS OTP if phone number is provided
  if (phone) {
    try {
      const formattedPhone = formatPhoneNumber(phone);
      if (formattedPhone) {
        const otpResult = await otpService.sendOTP({
          phoneNumber: formattedPhone,
        });

        if (otpResult.success) {
          logger.info(
            `Registration SMS OTP sent to ${formattedPhone} for user ${user._id}`
          );
        } else {
          logger.error(
            `Failed to send registration SMS OTP: ${otpResult.message}`
          );
        }
      }
    } catch (error) {
      logger.error("Error sending registration SMS OTP:", error);
    }
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    createdUser._id
  );
  const options: import("express").CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        phone
          ? "User registered successfully. Verification email and SMS OTP have been sent."
          : "User registered successfully and verification email has been sent to your email."
      )
    );
});

const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const existedUser = await User.findOne({ email });
    if (!existedUser) {
      throw new ApiError(404, "User not found");
    }
    if (!existedUser.isEmailVerified) {
      const { unHashedToken, hashedToken, tokenExpiry } =
        existedUser.generateTemporaryToken();
      existedUser.emailVerificationToken = hashedToken;
      existedUser.emailVerificationExpiry = tokenExpiry;
      await existedUser.save();

      const user = await User.findById(existedUser._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );

      await sendEmail({
        email: existedUser.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
          `${user.name.first} ${user.name.middle} ${user.name.last}`,
          `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}?email=${user.email}`
        ),
      });

      return res
        .status(200)
        .json(
          new ApiResponse(
            201,
            { user: existedUser },
            "User verification email has been sent to your email."
          )
        );
    }
    throw new ApiError(400, "User is already verified");
  }
);

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(409, "User not found", []);
  }

  const origin = req.get("origin") || req.get("referer");

  if (
    user.role !== rolesEnum.USER &&
    origin &&
    (origin.includes("https://staging.gtoarcade.com") ||
      origin.includes("https://gtoarcade.com") ||
      origin.includes("https://www.gtoarcade.com") ||
      origin.includes("http://localhost:5173"))
  ) {
    throw new ApiError(403, "Access denied: You are not authorized");
  }

  // if (!user.isEmailVerified && user.role === rolesEnum.USER) {
  if (
    !user.isEmailVerified &&
    !user.isPhoneVerified &&
    user.role === rolesEnum.USER
  ) {
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        `${user.name.first} ${user.name.middle} ${user.name.last}`,
        `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${unHashedToken}?email=${user.email}`
      ),
    });

    const userdata = await User.findById(user._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    console.log(userdata, "USERDATA");

    return res
      .status(401)
      .json(
        new ApiResponse(
          204,
          { user: userdata },
          "User verification email has been sent to your email."
        )
      );
  }

  if (user.loginType !== authProvider.EMAIL_PASSWORD) {
    throw new ApiError(
      400,
      "You have previously registered using " +
        user.loginType?.toLowerCase() +
        ". Please use the " +
        user.loginType?.toLowerCase() +
        " login option to access your account."
    );
  }

  // Compare the incoming password with hashed password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const options: import("express").CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // Remove domain property to prevent cookie sharing between main domain and subdomains
  };

  // console.log(options, "OPtions");
  // if (!user.isKYC) {
  //   res.status(401).json(
  //     new ApiResponse(
  //       401,
  //       {
  //         redirect: `/verify-kyc?userId=${user._id}&firstName=${user.name.first}&lastName=${user.name.last}`,
  //         data: user?.isEmailVerified,
  //       },
  //       "KYC Pending"
  //     )
  //   );
  //   return;
  // }
  // console.log(user);
  let response = {};
  if (user.role === rolesEnum.USER) {
    // get the user document ignoring the password and refreshToken field
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    // TODO: Add more options to make cookie more secure and reliable
    const bonusData = await UserBonusModel.findOne({
      userId: loggedInUser._id,
    });
    bonusData.updateLoginStreak();
    await bonusData.save();

    // Credit any pending AMOE entries for this email
    try {
      const creditResult = await creditPendingAmoeEntries(
        loggedInUser._id,
        loggedInUser.email
      );
      if (creditResult.credited > 0) {
        logger.info(
          `Credited ${creditResult.credited} sweep coins from ${creditResult.entries.length} pending entries for user ${loggedInUser._id}`
        );
        // Refresh bonusData to reflect the newly credited coins
        const updatedBonusData = await UserBonusModel.findOne({
          userId: loggedInUser._id,
        });
        if (updatedBonusData) {
          bonusData.sweepCoins = updatedBonusData.sweepCoins;
        }
      }
    } catch (error) {
      logger.error("Error crediting pending entries on login:", error);
      // Don't block login if this fails
    }

    response = {
      ...loggedInUser.toObject(),
      sweepCoins: bonusData.sweepCoins,
      claimedSweepBonus: bonusData.claimedDailySweepBonus,
      claimedDailyBonus: bonusData.claimedDailyBonus,
      canClaimSpinwheel: bonusData.canClaimSpinwheel,
      isNewUser: !bonusData.claimedNewUserBonus,
      loginStreak: bonusData.loginStreak,
      balance: bonusData.goldCoins,
    };
  } else {
    response = {
      ...user.toObject(),
    };
  }
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: response, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  // console.log("first", "dfgkjdfjfkdk");
  const { verificationToken } = req.params;
  const { email } = req.query;
  // console.log(verificationToken);

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing");
  }
  // console.log(verificationToken);
  // generate a hash from the token that we are receiving
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    res.redirect(
      `${process.env.CLIENT_SSO_REDIRECT_URL}/failed?token=invalid&email=${email}`
    );
    throw new ApiError(489, "Token is invalid or expired");
  }

  // If we found the user that means the token is valid
  // Now we can remove the associated email token and expiry date as we no longer need them
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  // Turn the email verified flag to `true`
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });
  res.redirect(`${process.env.CLIENT_SSO_REDIRECT_URL}/success?verified=true`);
  // return res
  //   .status(200)
  //   .json(new ApiResponse(200, { isEmailVerified: true }, "Email is verified"));
});

const verifyKYC = asyncHandler(async (req: Request, res: Response) => {
  const { userID } = req.query;
  // console.log(req.query);
  const user = await User.findById({ _id: userID });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  user.isKYC = true;
  await user.save();
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `/`,
        "Documents submitted successfully. Enjoy the games!"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  // console.log(incomingRefreshToken, "INCOMING TOKEN");
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as Secret
    ) as RefreshDecodedToken;
    const user = await User.findById(decodedToken?._id);
    // console.log(decodedToken, user);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // check if incoming refresh token is same as the refresh token attached in the user document
    // This shows that the refresh token is used or not
    // Once it is used, we are replacing it with new refresh token below
    if (incomingRefreshToken !== user?.refreshToken) {
      // If token is valid but is used already
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Update the user's refresh token in the database
    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Invalid refresh token";

    const options: import("express").CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    throw new ApiError(401, errorMessage);
  }
});

const forgotPasswordRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // Get email from the client and check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User does not exists", []);
    }

    // Generate a temporary token
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken(); // generate password reset creds

    // save the hashed version a of the token and expiry in the DB
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // Send mail with the password reset link. It should be the link of the frontend url with token
    await sendEmail({
      email: user?.email,
      subject: "Password reset request",
      mailgenContent: forgotPasswordMailgenContent(
        user.name.first,
        // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
        // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
        `${process.env.FORGOT_PASSWORD_REDIRECT_URL}?resetToken=${unHashedToken}`
      ),
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Password reset mail has been sent on your mail id"
        )
      );
  }
);

const resetForgottenPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    // Create a hash of the incoming reset token

    let hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // See if user with hash similar to resetToken exists
    // If yes then check if token expiry is greater than current date

    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    // If either of the one is false that means the token is invalid or expired
    if (!user) {
      throw new ApiError(489, "Token is invalid or expired");
    }

    // if everything is ok and token id valid
    // reset the forgot password token and expiry
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    // Set the provided password as the new password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset successfully"));
  }
);

const logoutUser = asyncHandler(async (req, res) => {
  const { _id } = getUserFromRequest(req);

  await User.findByIdAndUpdate(
    _id,
    {
      $set: {
        refreshToken: "",
      },
    },
    { new: true }
  );

  const options: import("express").CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Ensure lowercase values
    // domain:
    //   process.env.NODE_ENV === "production"
    //     ? process.env.DOMAIN_URL
    //     : undefined,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userdata = req.user as { _id: mongoose.Types.ObjectId };
  const id = userdata?._id;
  const user = await User.findById(id);

  // check the old password
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  // assign new password in plain text
  // We have a pre save method attached to user schema which automatically hashes the password whenever added/modified
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const userdata = req.user as { _id: mongoose.Types.ObjectId };
  const id = userdata?._id;
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const { password, ...updateData } = req.body;

  // Handle phone number update
  let phoneUpdated = false;
  if (updateData.phone) {
    const formattedPhone = formatPhoneNumber(updateData.phone);
    if (!formattedPhone) {
      throw new ApiError(400, "Invalid phone number format");
    }

    phoneUpdated = user.phone !== formattedPhone;

    // Check for phone number duplication if phone is being changed
    if (phoneUpdated) {
      const existingPhoneUser = await User.findOne({
        phone: formattedPhone,
        _id: { $ne: user._id }, // Exclude current user
      });
      if (existingPhoneUser) {
        throw new ApiError(
          409,
          "This phone number is already registered with another account. Please use a different phone number or contact support if you believe this is an error."
        );
      }
      updateData.isPhoneVerified = false;
    }

    updateData.phone = formattedPhone;
  }

  // Check if DOB is being updated and validate age (only if provided)
  if (updateData.dob) {
    const isAdult = minAge(updateData.dob);
    if (!isAdult) {
      throw new ApiError(403, "You must be at least 18 years old");
    }
  }

  // Check if state is being updated and validate banned states (only if provided)
  if (updateData.state) {
    const bannedStates = [
      "Washington",
      "Michigan",
      "Montana",
      "Connecticut",
      "Idaho",
    ];

    if (bannedStates.includes(updateData.state)) {
      throw new ApiError(
        403,
        "Sorry, this platform isn't available for your address!"
      );
    }
  }

  // Only validate address if all three fields are provided
  if (updateData.city && updateData.state && updateData.zipCode) {
    const addressValid = await validateAddress(
      updateData.state,
      updateData.city,
      updateData.zipCode
    );
    if (addressValid !== true) {
      const val = addressValid.toString();
      throw new ApiError(403, val, ["zipCode"]);
    }
  }

  // Fix name handling - use explicit undefined checks instead of falsy checks
  if (updateData.name) {
    updateData.name = {
      first:
        updateData.name.first !== undefined
          ? updateData.name.first
          : user.name?.first || "",
      middle:
        updateData.name.middle !== undefined
          ? updateData.name.middle
          : user.name?.middle || "",
      last:
        updateData.name.last !== undefined
          ? updateData.name.last
          : user.name?.last || "",
    };
  }

  let updatingUser;
  try {
    updatingUser = await User.findByIdAndUpdate(
      { _id: user._id },
      { ...updateData },
      { new: true }
    ).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
  } catch (error: any) {
    // Handle database constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === "phone") {
        throw new ApiError(
          409,
          "This phone number is already registered with another account. Please use a different phone number or contact support if you believe this is an error."
        );
      } else if (field === "email") {
        throw new ApiError(409, "User with email already exists", []);
      } else {
        throw new ApiError(
          409,
          `A user with this ${field} already exists. Please use a different ${field}.`
        );
      }
    }
    // Re-throw other errors
    throw error;
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatingUser, "Updated successfully"));
});
const handleSocialLogin = asyncHandler(async (req, res) => {
  // console.log(req.user);
  const userdata = req.user as { _id: mongoose.Types.ObjectId };
  const id = userdata?._id;
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const options: import("express").CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(301)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect(
      `${process.env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
});

const getUser = asyncHandler(async (req, res) => {
  const { _id } = getUserFromRequest(req);
  const user = await User.findById(_id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  let response = {};
  if (user.role === rolesEnum.USER) {
    const bonusData = await UserBonusModel.findOne({ userId: _id });
    bonusData.updateLoginStreak();
    await bonusData.save();

    response = {
      ...user.toObject(),
      sweepCoins: bonusData.sweepCoins,
      claimedSweepBonus: bonusData.claimedDailySweepBonus,
      claimedDailyBonus: bonusData.claimedDailyBonus,
      canClaimSpinwheel: bonusData.canClaimSpinwheel,
      isNewUser: !bonusData.claimedNewUserBonus,
      loginStreak: bonusData.loginStreak,
      balance: bonusData.goldCoins,
    };
  } else {
    response = {
      ...user.toObject(),
    };
  }

  res.status(200).json(new ApiResponse(200, response, "Fetched user data"));
});

const getUserBalance = asyncHandler(async (req, res) => {
  const { _id } = getUserFromRequest(req);
  const user = await User.findById(_id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const bonusData = await UserBonusModel.findOne({ userId: _id });
  const wallet = await WalletModel.findOne({ userId: _id });

  const response = {
    userId: _id,
    sweepCoins: bonusData.sweepCoins,
    goldCoins: wallet?.balance || 0,
  };
  res.status(200).json(new ApiResponse(200, response, "Fetched user data"));
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id, "dsfdf");
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const { password, ...other } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    { _id: id },
    { ...other },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Updated user data successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete all related user documents (except transactions which are kept for audit)
  await Promise.all([
    // User-specific data
    UserBonusModel.findOneAndDelete({ userId: id }),
    WalletModel.findOneAndDelete({ userId: id }),

    // Game account related
    UserGameAccountModel.deleteMany({ userId: id }),
    GameAccountRequestModel.deleteMany({ userId: id }),

    // Financial requests (not transactions)
    rechargeRequestModel.deleteMany({ userId: id }),
    withdrawalRequestModel.deleteMany({ userId: id }),

    // User notifications
    NotificationModel.deleteMany({ userId: id }),

    // AMOE entries
    AmoeModel.deleteMany({ userId: id }),
  ]);

  // Finally delete the user
  await User.findByIdAndDelete(id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, {}, "User and all related data deleted successfully")
    );
});

export const csvUserData = asyncHandler(async (req, res) => {
  // Fetch users data
  const users = await User.find({ role: { $ne: "ADMIN" } }).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // Transform the data for Excel
  const excelData = users.map((user) => ({
    "First Name": user.name.first,
    "Middle Name": user.name.middle,
    "Last Name": user.name.last,
    Email: user.email,
    Phone: user.phone,
    "Address Line 1": user.address.line1,
    "Address Line 2": user.address.line2,
    City: user.city,
    State: user.state,
    "Zip Code": user.zipCode,
    Gender: user.gender,
    "Date of Birth": user.dob,
    Role: user.role,
    "Email Verified": user.isEmailVerified ? "Yes" : "No",
    "KYC Verified": user.isKYC ? "Yes" : "No",
    "Notifications Opted": user.isOpted ? "Yes" : "No",
    "Created At": new Date(user.createdAt).toLocaleDateString(),
    "Last Updated": new Date(user.updatedAt).toLocaleDateString(),
  }));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Create a worksheet from the data
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Users Data");

  // Generate Excel buffer
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  // Set response headers for file download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=users_data.xlsx");

  // Send the Excel file
  res.send(excelBuffer);
});

const subscribeNotifications = asyncHandler(async (req, res) => {
  const { _id } = getUserFromRequest(req);
  const { isOpted, isSmsOpted } = req.body;
  const user = await User.findById(_id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  await User.findByIdAndUpdate(
    { _id: _id },
    { isOpted: isOpted, isSmsOpted: isSmsOpted },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  // if (isSmsOpted) {
  //   await ezTextingService.addOrUpdateContact({
  //     phoneNumber: user.phone,
  //     firstName: user.name.first,
  //     lastName: user.name.last,
  //     email: user.email,
  //   });
  // }

  // Send opt-in confirmation SMS if user is newly opting in for SMS
  if (isSmsOpted && user.phone) {
    try {
      const userName = user.name?.first || "Player";
      const smsResult = await twilioService.sendOptInConfirmationSMS(
        user.phone,
        userName
      );

      if (smsResult.success) {
        logger.info(
          `Opt-in confirmation SMS sent successfully. SID: ${smsResult.sid}`
        );
      } else {
        logger.error(
          `Failed to send opt-in confirmation SMS: ${smsResult.error}`
        );
      }
    } catch (error) {
      logger.error("Error sending opt-in confirmation SMS:", error);
      // Don't throw error here - subscription still succeeded
    }
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Subscribed", "Subscribed successfully"));
});

const unsubscribeNotifications = asyncHandler(async (req, res) => {
  const { _id } = req.query;
  const user = await User.findById(_id);
  if (!user) {
    res.redirect(
      `${process.env.CLIENT_SSO_REDIRECT_URL}/failed?unsubscribe=failed`
    );
  }
  await User.findByIdAndUpdate(
    { _id: _id },
    { isOpted: false, isSmsOpted: false },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  res.redirect(
    `${process.env.CLIENT_SSO_REDIRECT_URL}/success?unsubscribe=success`
  );
});

const allUsers = asyncHandler(async (req, res) => {
  //     role,
  //   const { page = 1, limit = 20, search = "", filter = "all",role } = req.query;
  // console.log(req.query)
  //   // Convert to number and ensure they are valid
  //   const pageNumber = parseInt(page as string);
  //   const limitNumber = parseInt(limit as string);

  //   if (
  //     isNaN(pageNumber) ||
  //     isNaN(limitNumber) ||
  //     pageNumber < 1 ||
  //     limitNumber < 1
  //   ) {
  //     throw new ApiError(400, "Invalid pagination parameters");
  //   }

  //   // Search query: Matches email OR name fields
  //   let searchQuery: any = { role: { $ne: 'ADMIN' } };
  //   if (search) {
  //     searchQuery.$or = [{ email: { $regex: search, $options: "i" } }];
  //   }

  //   // Apply filters
  //   if (filter === "kyc") {
  //     searchQuery.isKYC = true;
  //   } else if (filter === "opted") {
  //     searchQuery.isOpted = true;
  //   }

  //   // Calculate skip value for pagination
  //   const skip = (pageNumber - 1) * limitNumber;

  //   // Fetch users with pagination and filters
  //   const users = await User.find(searchQuery)
  //     .skip(skip)
  //     .limit(limitNumber)
  //     .select("-creds -updatedAt");

  //   const totalUsers = await User.countDocuments(searchQuery);

  //   // Calculate total pages
  //   const totalPages = Math.ceil(totalUsers / limitNumber);

  //   const responseData = {
  //     users,
  //     pagination: {
  //       page: pageNumber,
  //       limit: limitNumber,
  //       totalPages,
  //       totalUsers,
  //     },
  //   };

  //   res
  //     .status(200)
  //     .json(
  //       new ApiResponse(200, responseData, "Users data retrieved successfully")
  //     );
  const {
    page = 1,
    limit = 10,
    role,
    search,
    isEmailVerified,
    isPhoneVerified,
    isKYC,
    isOpted,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const filter: any = {};

  // Apply filters
  if (role) filter.role = role;
  if (isEmailVerified !== undefined)
    filter.isEmailVerified = isEmailVerified === "true";
  if (isPhoneVerified !== undefined)
    filter.isPhoneVerified = isPhoneVerified === "true";
  if (isKYC !== undefined) filter.isKYC = isKYC === "true";
  if (isOpted !== undefined) filter.isOpted = isOpted === "true";

  // Search functionality
  if (search) {
    filter.$or = [
      { "name.first": { $regex: search, $options: "i" } },
      { "name.last": { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const users = await UserModel.find(filter)
    .select("-password -refreshToken")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await UserModel.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Users retrieved successfully"
    )
  );
});

const notificationMails = asyncHandler(async (req, res) => {
  const { subject, content } = req.body;

  // Fetch all users' emails
  const users = await UserModel.find({ isOpted: true }, "email name");

  if (!users.length) {
    return res.status(404).json({ message: "No users found" });
  }

  // Prepare email promises
  const emailPromises = users.map((user) => {
    console.log(user);
    const unsubscribeLink = `${req.protocol}://${req.get("host")}/api/v1/user/unsubscribe?_id=${encodeURIComponent(user._id)}`;

    // Inject the unsubscribe link into the template
    const emailContent = `<div style="background:black;padding:10px">${content}<p style="text-align:center; background:black;margin-bottom:20px">
      <a href="${unsubscribeLink}" style="red: white; text-decoration: none;font-size:20px;font-weight:600;padding:5px">Unsubscribe</a>
    </p></div>`;

    return sendEmailNotify({
      email: user.email,
      subject: subject || "Golden Ticket Online Arcade and Casino",
      mailgenContent: emailContent,
    });
  });
  // console.log(emailPromises,users)
  // Execute all email promises concurrently
  await Promise.all(emailPromises);

  res
    .status(200)
    .json(new ApiResponse(200, "done", "Emails sent successfully!"));
});

export const usersBalance = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    field = "",
    direction = "",
  } = req.query;

  // Convert to number
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

  // Construct the search query
  const searchQuery = search
    ? {
        userId: {
          $in: await User.find({
            $or: [{ email: { $regex: search, $options: "i" } }],
          }).distinct("_id"),
        },
      }
    : {};

  // Pagination
  const skip = (pageNumber - 1) * limitNumber;

  // Sorting (Default: No sorting if field or direction is empty/invalid)
  let sortQuery: any = {};
  if (field && (field === "goldCoins" || field === "sweepCoins")) {
    sortQuery[field] = direction === "desc" ? -1 : 1;
  }

  // Fetch user balances with pagination & sorting
  const userBonuses = await UserBonusModel.find(searchQuery)
    .populate("userId", "name email")
    .skip(skip)
    .limit(limitNumber)
    .sort(sortQuery) // Apply sorting dynamically
    .select("-creds -createdAt -updatedAt");

  // Get all unique user IDs
  const userIds = userBonuses.map((bonus) => bonus.userId._id);

  // Fetch wallet balances for these users in a single query
  const wallets = await WalletModel.find({ userId: { $in: userIds } })
    .select("userId balance")
    .lean();

  // Create a map of userId to wallet balance for quick lookup
  const walletMap = new Map();
  wallets.forEach((wallet) => {
    walletMap.set(wallet.userId.toString(), wallet.balance);
  });

  // Combine the data
  const users = userBonuses.map((bonus) => {
    const userId = bonus.userId._id.toString();
    return {
      ...bonus.toObject(),
      walletBalance: walletMap.get(userId) || 0, // Add wallet balance or 0 if not found
    };
  });

  const totalUsers = await UserBonusModel.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalUsers / limitNumber);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalPages,
          totalUsers,
        },
      },
      "Users data"
    )
  );
});

export const updateUserBalance = asyncHandler(async (req, res) => {
  const { _id } = getUserFromRequest(req);
  const { balance, type, sweepCoins } = req.body;
  if ((!balance && !type) || (!sweepCoins && !type)) {
    throw new ApiError(400, "Please provide balance");
  }
  const userBonus = await UserBonusModel.findOne({ userId: _id });
  if (!userBonus) {
    throw new ApiError(404, "User not found");
  }

  let bonus;
  if (sweepCoins) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userBonus.sweepCoins,
          "Sweep coins can't be updated!"
        )
      );
    // bonus = userBonus.updateSweepCoins(Number(sweepCoins), type);
  } else {
    bonus = userBonus.updateBonus(Number(balance), type);
  }

  await userBonus.save();

  res
    .status(200)
    .json(new ApiResponse(200, bonus, "Updated user balance successfully"));
});

export const updateUserExclusiveBalance = asyncHandler(async (req, res) => {
  const { _id } = getUserFromRequest(req);
  let { balance, type, sweepCoins } = req.body;
  balance = Number(balance);
  // balance = balance * 100;
  sweepCoins = Number(sweepCoins);
  if ((!balance && !type) || (!sweepCoins && !type)) {
    throw new ApiError(
      400,
      "Please provide balance or sweepCoins and type(credit,debit) payload data"
    );
  }
  const userBonus = await UserBonusModel.findOne({ userId: _id });
  if (!userBonus) {
    throw new ApiError(404, "User not found");
  }

  if (sweepCoins) {
    userBonus.updateSweepCoins(Number(sweepCoins), type);
    await userBonus.save();
  } else {
    const wallet = await walletModel.findOne({ userId: _id });
    if (!wallet) {
      throw new ApiError(404, "Wallet not found");
    }
    if (type === "credit") {
      wallet.balance += balance;
    } else {
      wallet.balance = Math.max(0, wallet.balance - balance);
    }
    wallet.balance = parseFloat(wallet.balance.toFixed(2));
    await wallet.save();
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { type, balance },
        "Updated user balance successfully"
      )
    );
});

export const handleTwilioWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const { From, OptOutType } = req.body;

    if (
      OptOutType === "stop" ||
      OptOutType === "stopall" ||
      OptOutType === "unsubscribe" ||
      OptOutType === "cancel" ||
      OptOutType === "quit" ||
      OptOutType === "end" ||
      OptOutType === "optout" ||
      OptOutType === "revoke"
    ) {
      await UserModel.updateOne({ phone: From }, { isSmsOpted: false });
    } else if (OptOutType === "START") {
      await UserModel.updateOne({ phone: From }, { isSmsOpted: true });
    }

    res.status(200).send("OK");
  }
);

//ADMIN REQUEST
export const updateUsersBalances = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { goldCoins, sweepCoins, walletBalance } = req.body;

  if (walletBalance) {
    const wallet = await WalletModel.findOne({ userId: userId });
    if (wallet) {
      wallet.balance = walletBalance;
      await wallet.save();
    } else {
      throw new ApiError(404, "Wallet not found");
    }
  }

  if (goldCoins || sweepCoins) {
    const userBonus = await UserBonusModel.findOne({ userId: userId });
    if (!userBonus) {
      throw new ApiError(404, "User not found");
    }
    if (goldCoins) userBonus.goldCoins = goldCoins;
    if (sweepCoins) userBonus.sweepCoins = sweepCoins;
    await userBonus.save();
  }
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Updated user balance successfully"));
});

export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        throw new ApiError(400, "No file uploaded");
      }

      const { _id: userId } = getUserFromRequest(req);
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      // Get current user to check for existing avatar
      const currentUser = await UserModel.findById(userId);
      if (!currentUser) {
        throw new ApiError(404, "User not found");
      }

      // Delete old avatar file if it exists
      if (currentUser.avatar?.localPath) {
        try {
          fs.unlinkSync(currentUser.avatar.localPath);
        } catch (error) {
          // Ignore error if file doesn't exist
          console.log("Old avatar file not found or already deleted");
        }
      }

      // Update user's avatar in database
      const user = await UserModel.findByIdAndUpdate(
        userId,
        {
          avatar: {
            url: `/uploads/avatars/${req.file.filename}`,
            localPath: req.file.path,
          },
        },
        { new: true }
      );

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      res.status(200).json({
        success: true,
        message: "Avatar uploaded successfully",
        data: {
          avatar: user.avatar,
        },
      });
    } catch (error) {
      if (error instanceof multer.MulterError) {
        throw new ApiError(400, `File upload error: ${error.message}`);
      }
      throw error;
    }
  }
);

export {
  allUsers,
  changeCurrentPassword,
  deleteUser,
  forgotPasswordRequest,
  getUser,
  getUserBalance,
  handleSocialLogin,
  loginUser,
  logoutUser,
  notificationMails,
  refreshAccessToken,
  registerUser,
  resetForgottenPassword,
  subscribeNotifications,
  unsubscribeNotifications,
  updateProfile,
  updateUser,
  verifyEmail,
  verifyKYC,
  resendVerificationEmail,
};
