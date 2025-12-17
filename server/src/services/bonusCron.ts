import { subDays } from "date-fns";
import cron from "node-cron";
import UserBonusModel from "../models/bonus.model";
const resetDailyBonuses = async () => {
  try {
    await UserBonusModel.updateMany(
      {},
      { $set: { claimedDailyBonus: false } }
    );
    console.log("✅ Daily bonuses reset successfully.");
  } catch (error) {
    console.error("❌ Error resetting daily bonuses:", error);
  }
};

const resetWeeklySweepBonuses = async () => {
  try {
    const now = new Date(); // Current datetime
    const sevenDaysAgo = subDays(now, 7);
    console.log("🕛 Running auto-reset sweep bonus job");
    console.log("Current Date:", now);
    console.log("Cut-off Date (7 days ago):", sevenDaysAgo);
    const resetResult = await UserBonusModel.updateMany(
      {
        lastSweeDate: { $lte: sevenDaysAgo },
        claimedDailySweepBonus: true,
      },
      {
        $set: {
          claimedDailySweepBonus: false,
          lastSweeDate: null,
        },
      }
    );

    console.log(`✅ Sweep bonuses reset for ${resetResult.modifiedCount} users.`);

  } catch (error) {
    console.error("❌ Error resetting weekly sweep bonuses:", error);
  }
};

// Detect streak breaks and revoke spinwheel eligibility if user missed a day
const handleStreakBreaks = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Users whose last login date is neither today nor yesterday have broken streaks
    const result = await UserBonusModel.updateMany(
      {
        $and: [
          { lastLoginDate: { $ne: null } },
          { lastLoginDate: { $lt: yesterday } },
        ],
      },
      {
        $set: { canClaimSpinwheel: false },
      }
    );
    console.log(`✅ Streak break processed. Users updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error("❌ Error handling streak breaks:", error);
  }
};

// Schedule the daily reset at midnight (server time)
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Running daily bonus reset job...");
  await resetDailyBonuses();
  console.log("🔄 Running weekly sweep bonus reset job...");
  await resetWeeklySweepBonuses();
  console.log("🔄 Processing streak breaks (revoke spinwheel if missed)...");
  await handleStreakBreaks();

});

export default { resetDailyBonuses, resetWeeklySweepBonuses, handleStreakBreaks };