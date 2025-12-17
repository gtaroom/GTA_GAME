import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";

import UserBonusModel from "../models/bonus.model";
import UserModel from "../models/user.model";

const startServer = async () => {
  const DB_URL = process.env.MONGODB_URI as string;
  console.log(DB_URL);
  try {
    // Connect to the database
    const dbInstance = new connectDB(DB_URL);
    await dbInstance.connect();

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Gracefully shutting down...");
      await dbInstance.disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.log("Termination signal received. Closing app...");
      await dbInstance.disconnect();
      process.exit(0);
    });
  } catch (err) {
    console.error("Error starting the server:", err);
    process.exit(1);
  }
};

async function createUserBonusForExistingUsers() {
  try {
    // Find all users
    const users = await UserModel.find();

    // Create UserBonus for each user
    for (const user of users) {
      const existingUserBonus = await UserBonusModel.findOne({
        userId: user._id,
      });
      if (!existingUserBonus) {
        await UserBonusModel.create({ userId: user._id });
        console.log(`Created UserBonus for user: ${user.email}`);
      }
    }

    console.log("UserBonus creation completed for all existing users.");
  } catch (error) {
    console.error("Error creating UserBonus for existing users:", error);
  }
}

async function main() {
  await startServer();
  await createUserBonusForExistingUsers();
}

main();
