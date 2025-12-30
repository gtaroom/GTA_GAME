// src/scripts/migrate-role-permissions.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import RoleModel from "../models/role.model";

// Load environment variables
dotenv.config();

async function migrateRolePermissions() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    // Connect to Database
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database");

    console.log("🚀 Starting Force Migration: Syncing 'canManageBanners'...");

    // 1. Clear it first (just to be sure)
    await RoleModel.updateMany(
      {},
      { $unset: { "permissions.canManageBanners": "" } }
    );

    // 2. Set it fresh
    const result = await RoleModel.updateMany(
      {},
      { $set: { "permissions.canManageBanners": false } }
    );

    console.log("Migration forced. Matched:", result.matchedCount);
    console.log(`--- Migration Result ---`);
    console.log(`Matched: ${result.matchedCount} roles`);
    console.log(`Updated: ${result.modifiedCount} roles`);

    // 2. VERIFICATION: Fetch from DB to prove it's there
    const allRoles = await RoleModel.find({});
    console.log("\n--- Current DB State (Verification) ---");
    allRoles.forEach((role) => {
      const hasField =
        role.permissions instanceof Map
          ? role.permissions.has("canManageBanners")
          : (role.permissions as any).canManageBanners !== undefined;

      console.log(`Role: ${role.name} | has canManageBanners: ${hasField}`);
    });

    // 3. Cleanup
    await mongoose.disconnect();
    console.log("\n✅ Migration complete! Database disconnected");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

migrateRolePermissions();

// npx ts-node src/scripts/migrate-role-permissions.ts
