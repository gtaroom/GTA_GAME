import { Document, model, models, Schema } from "mongoose";

export interface FreeEntrySchemaIn extends Document {
  userId: Schema.Types.ObjectId | null; // Reference to the User model - can be null for non-authenticated submissions
  name: string;
  phone: string;
  address: string;
  email: string;
  isWinner: boolean;
  acceptMarketing: boolean; // NEW: Store marketing preference
  status: "pending" | "credited" | "expired"; // NEW: Track entry status
  creditedAt?: Date; // NEW: When the bonus was credited
}

const AmoeSchema = new Schema<FreeEntrySchemaIn>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Changed from true to false - can be null for non-authenticated
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    isWinner: { type: Boolean, default: false },
    acceptMarketing: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "credited", "expired"],
      default: "pending",
      index: true,
    },
    creditedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for checking duplicate entries (email + recent date)
AmoeSchema.index({ email: 1, createdAt: -1 });

// Index for finding pending entries by email
AmoeSchema.index({ email: 1, status: 1 });

const AmoeModel =
  models.freeEntry || model<FreeEntrySchemaIn>("freeEntry", AmoeSchema);

export default AmoeModel;
