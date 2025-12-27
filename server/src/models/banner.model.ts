import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  uid: string; // Added UID to interface
  title: string;
  description: string;
  
  button: {
    text: string;
    href: string;
  };
  images: {
    background: string;
    main: string;
    cover?: string;
  };
  order: number;
  isActive: boolean;
}

const bannerSchema = new Schema(
  {
    // FIX: Added UID to Schema so it actually saves
    uid: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    button: {
      text: { type: String, default: "Play Now" },
      href: { type: String, default: "/" },
    },
    images: {
      background: { type: String, required: true },
      main: { type: String, required: true },
      cover: { type: String },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBanner>("Banner", bannerSchema);
