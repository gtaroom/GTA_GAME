import { Document, model, models, Schema } from "mongoose";

export interface UserSchemaIn extends Document {
  name: string;
  link: string;
  image: string;
  creds: {
    username: string;
    password: string;
  };
  // Existing single type (kept for backward compatibility)
  type: string;
  // New: multiple types support
  types?: string[];
  // New: single tag at a time
  tag?:
    | "new"
    | "free_to_play"
    | "popular"
    | "top_pick"
    | "trending"
    | "hot"
    | "jackpot"
    | "exclusive"
    | "bonus"
    | "download_only"
    | "web_only"
    | null;
}
const gameSchema = new Schema<UserSchemaIn>(
  {
    name: { type: String, index: true },
    link: String,
    image: String,
    creds: { username: String, password: String },
    // Keep existing key
    type: { type: String, index: true },
    // New fields
    types: { type: [String], default: [], index: true },
    tag: {
      type: String,
      enum: [
        "new",
        "free_to_play",
        "popular",
        "top_pick",
        "trending",
        "hot",
        "jackpot",
        "exclusive",
        "bonus",
        "download_only",
        "web_only",
        null,
      ],
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Additional compound indexes to speed up common filters
gameSchema.index({ tag: 1, name: 1 });
gameSchema.index({ types: 1, name: 1 });
gameSchema.index({ type: 1, name: 1 });

const GameModel = models.Game || model<UserSchemaIn>("Game", gameSchema);
export default GameModel;
