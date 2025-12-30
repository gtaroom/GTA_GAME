import AmoeModel from "../models/amoe-entry.model";
import UserBonusModel from "../models/bonus.model";
import mongoose from "mongoose";

/**
 * Credit pending AMOE entries to user after login/signup
 * Call this function after successful login or signup
 */
export const creditPendingAmoeEntries = async (
  userId: mongoose.Types.ObjectId,
  userEmail: string
) => {
  try {
    // Find all pending entries for this email
    const pendingEntries = await AmoeModel.find({
      email: userEmail.toLowerCase().trim(),
      status: "pending",
    }).sort({ createdAt: -1 }); // Most recent first

    if (pendingEntries.length === 0) {
      return { credited: 0, entries: [] };
    }

    // Get user's bonus record
    const userBonus = await UserBonusModel.findOne({ userId });
    if (!userBonus) {
      console.error("User bonus record not found for user:", userId);
      return { credited: 0, entries: [] };
    }

    const creditedEntries = [];
    let totalCredited = 0;

    // Process each pending entry
    for (const entry of pendingEntries) {
      // Check if entry is within valid timeframe (e.g., last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (entry.createdAt < thirtyDaysAgo) {
        // Mark as expired if older than 30 days
        entry.status = "expired";
        await entry.save();
        continue;
      }

      // Check if user can still claim sweep bonus (respects the 7-day limit)
      const bonus = userBonus.claimDailySweepBonus();

      if (bonus) {
        // Credit the bonus
        userBonus.lastSweeDate = new Date();
        await userBonus.save();

        // Update entry
        entry.userId = userId;
        entry.status = "credited";
        entry.creditedAt = new Date();
        await entry.save();

        creditedEntries.push(entry);
        totalCredited += bonus.sweepCoins || 0;

        // Only credit one entry per login (respects limit)
        break;
      } else {
        // User already has an active sweep bonus claim
        // Still link the entry to the user but don't credit
        entry.userId = userId;
        entry.status = "credited"; // Mark as credited but no bonus given (already claimed)
        entry.creditedAt = new Date();
        await entry.save();
        break;
      }
    }

    return {
      credited: totalCredited,
      entries: creditedEntries,
      totalPending: pendingEntries.length,
    };
  } catch (error) {
    console.error("Error crediting pending AMOE entries:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { credited: 0, entries: [], error: errorMessage };
  }
};

/**
 * Clean up expired pending entries (run as a cron job)
 */
export const cleanupExpiredEntries = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await AmoeModel.updateMany(
      {
        status: "pending",
        createdAt: { $lt: thirtyDaysAgo },
      },
      {
        $set: { status: "expired" },
      }
    );

    return {
      success: true,
      expiredCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("Error cleaning up expired entries:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: errorMessage };
  }
};