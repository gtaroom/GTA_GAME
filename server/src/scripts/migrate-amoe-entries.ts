import mongoose from "mongoose";
import dotenv from "dotenv";
import AmoeModel from "../models/amoe-entry.model";

// Load environment variables from .env file
dotenv.config();

async function migrateAmoeEntries() {
  try {
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    // Set strictQuery to avoid deprecation warning
    mongoose.set("strictQuery", false);

    // Connect to your database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database");

    console.log("Starting AMOE entries migration...");

    // Update all existing entries that don't have the new fields
    const result = await AmoeModel.updateMany(
      {
        // Find entries that don't have the new fields
        $or: [
          { status: { $exists: false } },
          { acceptMarketing: { $exists: false } },
        ],
      },
      {
        $set: {
          // Set default values for existing entries
          status: "credited", // Assume existing entries were already credited
          acceptMarketing: false,
          creditedAt: new Date(), // Use current date as credited date
        },
      }
    );

    console.log(" Migration complete!");
    console.log(`   Matched: ${result.matchedCount} entries`);
    console.log(`   Updated: ${result.modifiedCount} entries`);

    await mongoose.disconnect();
    console.log(" Database disconnected");
    process.exit(0);
  } catch (error) {
    console.error(" Migration failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the migration
migrateAmoeEntries();
