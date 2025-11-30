import mongoose, { Document, Schema } from "mongoose";

export interface IAffiliate extends Document {
  userId?: mongoose.Types.ObjectId; // Optional - for logged-in users
  email: string;
  name: {
    first: string;
    last: string;
  };
  company?: string;
  website?: string;
  phone?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  audienceSize?: string;
  promotionMethods?: string[];
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  affiliateCode?: string; // Unique code for approved affiliates
  commissionRate?: number; // Commission percentage
  totalEarnings?: number;
  totalReferrals?: number;
  notes?: string; // Admin notes
  dashboardToken?: string; // Secure token for public dashboard access (hashed)
  dashboardTokenExpiry?: Date; // Token expiry date
  createdAt: Date;
  updatedAt: Date;
}

const affiliateSchema = new Schema<IAffiliate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true, // Allows null values but enforces uniqueness when present
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      first: { type: String, required: true },
      last: { type: String, required: true },
    },
    company: {
      type: String,
    },
    website: {
      type: String,
    },
    phone: {
      type: String,
    },
    socialMedia: {
      instagram: String,
      twitter: String,
      facebook: String,
      youtube: String,
      tiktok: String,
    },
    audienceSize: {
      type: String,
    },
    promotionMethods: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    affiliateCode: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but enforces uniqueness when present
      index: true,
    },
    commissionRate: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    dashboardToken: {
      type: String,
      index: true,
    },
    dashboardTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
affiliateSchema.index({ email: 1, status: 1 });
affiliateSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IAffiliate>("Affiliate", affiliateSchema);

