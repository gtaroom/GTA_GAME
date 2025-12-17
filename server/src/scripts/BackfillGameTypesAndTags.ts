import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import GameModel from "../models/games.model";

type Tag =
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

function decideTag(existingType: string, createdAt?: Date): Tag {
  const now = Date.now();
  const isRecent = createdAt ? now - createdAt.getTime() <= 21 * 24 * 60 * 60 * 1000 : false;

  // Prioritize explicit mapping first
  const lower = (existingType || "").toLowerCase();
  if (lower.includes("allow")) return isRecent ? "new" : "exclusive";
  if (lower.includes("bonus")) return isRecent ? "new" : "bonus";
  if (lower.includes("web")) return "web_only";
  if (lower.includes("download")) return "download_only";
  if (lower.includes("owned")) return isRecent ? "new" : "top_pick";

  // Fallbacks
  if (isRecent) return "new";
  return "popular";
}

function mapTypes(existingType: string): string[] {
  const lower = (existingType || "").toLowerCase();
  if (lower.includes("allow")) return ["exclusive"];
  if (lower.includes("bonus")) return ["bonus"];
  if (lower.includes("owned")) return ["signature"];
  if (lower.includes("web")) return ["web_only", "exclusive"];
  if (lower.includes("download")) return ["download_only", "exclusive"];
  return [];
}

async function run() {
  const uri = process.env.MONGODB_URI || "";
  const dbName = process.env.DB_NAME;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName });
  console.log("Connected to DB");

  const cursor = GameModel.find({}, { _id: 1, type: 1, createdAt: 1 }).cursor();
  const ops: any[] = [];
  let processed = 0;
  for await (const doc of cursor) {
    const types = mapTypes(doc.type);
    const tag = decideTag(doc.type, (doc as any).createdAt);
    ops.push({
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            types,
            tag,
          },
        },
      },
    });
    processed++;
    if (ops.length >= 500) {
      await GameModel.bulkWrite(ops, { ordered: false });
      console.log(`Bulk wrote 500; total processed: ${processed}`);
      ops.length = 0;
    }
  }

  if (ops.length > 0) {
    await GameModel.bulkWrite(ops, { ordered: false });
    console.log(`Final bulk write; total processed: ${processed}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch(async (err) => {
  console.error("Backfill failed:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});


