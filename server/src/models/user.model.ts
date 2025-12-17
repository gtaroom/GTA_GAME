import { model, Schema, Document, models } from "mongoose";
import {
  AuthType,
  AvailableAuthProviders,
  AvailableRoles,
  RoleType,
  USER_TEMPORARY_TOKEN_EXPIRY,
} from "../constants";
import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import UserBonusModel from "./bonus.model";

export interface UserSchemaIn extends Document {
  _id: string;
  name: {
    first: string;
    middle: string;
    last: string;
  };
  address: {
    line1: string;
    line2: string;
  };
  phone: string;
  zipCode: string;
  city: string;
  state: string;
  gender: string;
  dob: string;
  birthday?: string; // Birthday for VIP birthday bonus (format: YYYY-MM-DD)
  email: string;
  refreshToken: string;
  googleId: string;
  password: string;
  loginType: AuthType;
  role: string; // Changed from RoleType to string to support custom roles
  avatar: {
    url: string | null;
    localPath: string | undefined;
  };
  isEmailVerified: Boolean;
  isPhoneVerified: Boolean;
  isKYC: Boolean;
  isOpted: Boolean;
  acceptSMSTerms: Boolean;
  emailVerificationToken: string | undefined;
  emailVerificationExpiry: string | undefined;
  forgotPasswordToken: string | undefined;
  forgotPasswordExpiry: string | undefined;
  isSmsOpted: Boolean;
}

const UserSchema = new Schema<UserSchemaIn>(
  {
    name: {
      first: String,
      middle: String,
      last: String,
    },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    address: {
      line1: String,
      line2: String,
    },
    googleId: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    acceptSMSTerms: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isKYC: { type: Boolean, default: false },
    isOpted: { type: Boolean, default: false },
    refreshToken: { type: String },
    loginType: {
      type: String,
      enum: AvailableAuthProviders,
      required: true,
      default: "EMAIL_PASSWORD",
    },
    zipCode: String,
    city: String,
    state: String,
    gender: String,
    dob: String,
    birthday: String, // Birthday for VIP birthday bonus
    avatar: {
      url: { type: String, default: null },
      localPath: { type: String, default: "" },
    },
    role: { type: String, required: true, default: "USER" }, // Removed enum to support custom roles
    emailVerificationToken: { type: String },
    emailVerificationExpiry: { type: String },
    forgotPasswordExpiry: { type: String },
    forgotPasswordToken: { type: String },
    isSmsOpted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre<UserSchemaIn>("save", async function (next) {
  if (this.isModified("email") && this.email) {
    this.email = this.email.toLowerCase();
  }
  
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.post("save", async function (doc, next) {
  try {
    // Check if this is a new user
    if (doc.isNew) {
      // Create a new UserBonus document for the user
      await UserBonusModel.create({ userId: doc._id });
    }
    next();
  } catch (error) {
    console.log(error, "POST Save BOnus Error");
  }
});

UserSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  // console.log(this);
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET as Secret,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as Secret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * @description Method responsible for generating tokens for email verification, password reset etc.
 */
UserSchema.methods.generateTemporaryToken = function () {
  // This token should be client facing
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

const UserModel = models.User || model<UserSchemaIn>("User", UserSchema);
export default UserModel;
