import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  images: {
    background: string;
    main: string;
    cover?: string;
  };
  order: number;
  isActive: boolean;
}

const bannerSchema = new Schema({
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
});

export default mongoose.model<IBanner>("Banner", bannerSchema);
