import ReferralModel from "../models/referral.model";
import UserModel from "../models/user.model";
import WalletModel from "../models/wallet.model";
import TransactionModel from "../models/transaction.model";
import AffiliateModel from "../models/affiliate.model";
import { logger } from "../utils/logger";

/**
 * Check and qualify referrals when a user makes a purchase
 * This should be called after a successful deposit transaction
 */
export const checkAndQualifyReferrals = async (userId: string, transactionAmount: number) => {
  try {
    // Find pending referrals for this user
    const referrals = await ReferralModel.find({
      referredId: userId,
      status: "pending",
    });

    if (referrals.length === 0) {
      return; // No referrals to process
    }

    for (const referral of referrals) {
      // Calculate total spent by this referred user
      const totalTransactions = await TransactionModel.aggregate([
        {
          $match: {
            userId: referral.referredId,
            type: "deposit",
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const totalSpent = totalTransactions[0]?.total || 0;
      referral.totalSpent = totalSpent;

      // Check if user has spent $20 or more AND hasn't been qualified yet
      const QUALIFICATION_THRESHOLD = 20; // $20 minimum
      if (totalSpent >= QUALIFICATION_THRESHOLD && referral.status === "pending") {
        // Double-check status hasn't changed (prevent race conditions)
        const currentReferral = await ReferralModel.findById(referral._id);
        if (!currentReferral || currentReferral.status !== "pending") {
          logger.info(`Referral ${referral._id} already processed, skipping`);
          continue;
        }

        referral.status = "qualified";
        referral.qualifiedAt = new Date();

        // Calculate rewards (you can customize these amounts)
        const REFERRER_REWARD = 10; // $10 for referrer
        const REFERRED_REWARD = 5; // $5 for referred user

        referral.referrerReward = REFERRER_REWARD;
        referral.referredReward = REFERRED_REWARD;

        // Give rewards to referrer
        // First, check if this is an affiliate referral by looking up the referral code
        const affiliate = await AffiliateModel.findOne({
          affiliateCode: referral.referralCode,
          status: "approved",
        });

        if (affiliate) {
          // This is an affiliate referral - calculate commission
          const commissionRate = affiliate.commissionRate || 0; // Percentage (e.g., 15 = 15%)
          const commissionAmount = (totalSpent * commissionRate) / 100;

          // Update affiliate earnings (only once when qualifying)
          affiliate.totalEarnings = (affiliate.totalEarnings || 0) + commissionAmount;
          affiliate.totalReferrals = (affiliate.totalReferrals || 0) + 1;
          await affiliate.save();

          // Store commission in referral record
          referral.referrerReward = commissionAmount;

          logger.info(
            `Affiliate commission given: ${affiliate._id} received $${commissionAmount.toFixed(2)} (${commissionRate}% of $${totalSpent.toFixed(2)}) for referral ${referral._id}`
          );
        } else if (referral.referrerId) {
          // This is a regular user referral - give fixed reward to wallet
          try {
            // Find or create wallet for referrer
            let referrerWallet = await WalletModel.findOne({
              userId: referral.referrerId,
            });

            if (!referrerWallet) {
              // Create wallet if it doesn't exist
              referrerWallet = await WalletModel.create({
                userId: referral.referrerId,
                balance: 0,
              });
            }

            // Regular user referral - give fixed reward
            const balanceToAdd = REFERRER_REWARD * 100; // $10 = 1,000 balance
            referrerWallet.balance += balanceToAdd;
            referrerWallet.balance = parseFloat(referrerWallet.balance.toFixed(2));
            await referrerWallet.save();

            logger.info(
              `Referrer reward given: ${referral.referrerId} received ${balanceToAdd} balance ($${REFERRER_REWARD}) for referral ${referral._id}`
            );
          } catch (error) {
            logger.error(
              `Error giving reward to referrer ${referral.referrerId}:`,
              error
            );
          }
        } else {
          logger.warn(
            `No referrer found for referral ${referral._id} with code ${referral.referralCode}`
          );
        }

        // Give reward to referred user
        // Find or create wallet for referred user
        let referredWallet = await WalletModel.findOne({
          userId: referral.referredId,
        });

        if (!referredWallet) {
          // Create wallet if it doesn't exist
          referredWallet = await WalletModel.create({
            userId: referral.referredId,
            balance: 0,
          });
        }

        const balanceToAdd = REFERRED_REWARD * 100; // $5 = 500 balance
        referredWallet.balance += balanceToAdd;
        referredWallet.balance = parseFloat(referredWallet.balance.toFixed(2));
        await referredWallet.save();

        logger.info(
          `Referred user reward given: ${referral.referredId} received ${balanceToAdd} balance ($${REFERRED_REWARD}) for qualifying`
        );

        await referral.save();

        logger.info(
          `Referral qualified: ${referral._id}, referrer: ${referral.referrerId}, referred: ${referral.referredId}`
        );
      } else {
        // Update total spent even if not qualified yet
        await referral.save();
      }
    }
  } catch (error) {
    logger.error("Error checking and qualifying referrals:", error);
    // Don't throw - we don't want to break the transaction flow
  }
};

/**
 * Get referral statistics for a user
 */
export const getReferralStatistics = async (userId: string) => {
  const referrals = await ReferralModel.find({ referrerId: userId });

  const totalInvited = referrals.length;
  const qualified = referrals.filter(
    (r) => r.status === "qualified" || r.status === "rewarded"
  ).length;
  const totalRewards = referrals.reduce(
    (sum, r) => sum + (r.referrerReward || 0),
    0
  );

  return {
    totalInvited,
    qualified,
    totalRewards,
  };
};

export default {
  checkAndQualifyReferrals,
  getReferralStatistics,
};



