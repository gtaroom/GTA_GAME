import { Request, Response } from "express";
import AmoeModel from "../models/amoe-entry.model";
import UserBonusModel from "../models/bonus.model";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { getUserFromRequest } from "../utils/get-user";

const claimDailyBonus = async (req: Request, res: Response) => {
  const { _id } = getUserFromRequest(req);
  const userBonus = await UserBonusModel.findOne({ userId: _id });
  if (!userBonus) {
    throw new ApiError(404, "User bonus record not found");
  }

  const bonus = userBonus.claimDailyBonus();

  if (bonus) {
    await userBonus.save();
    return res
      .status(200)
      .json(new ApiResponse(200, bonus, "Daily bonus claimed"));
  } else {
    throw new ApiError(400, "Daily bonus already claimed");
  }
};

const claimDailySweepBonus = async (req: Request, res: Response) => {
  const { name, email, address, phone, acceptMarketing } = req.body;

  // Validate required fields
  if (!name || !email || !address || !phone) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  // Check if this email has already submitted in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const existingEntry = await AmoeModel.findOne({
    email: email.toLowerCase().trim(),
    createdAt: { $gte: sevenDaysAgo },
  });

  if (existingEntry) {
    throw new ApiError(
      400,
      "You have already submitted a free entry in the last 7 days. Please try again later."
    );
  }

  // Try to get user from request (will be undefined if not authenticated)
  let userId;
  try {
    const user = getUserFromRequest(req);
    userId = user?._id;
  } catch (error) {
    // User is not authenticated, that's fine
    userId = null;
  }

  // Create the AMOE entry (works for both authenticated and non-authenticated users)
  const amoeEntry = await AmoeModel.create({
    userId: userId || null, // null if not logged in
    name: name.trim(),
    email: email.toLowerCase().trim(),
    address: address.trim(),
    phone: phone.replace(/\D/g, ""), // Store only digits
    acceptMarketing: acceptMarketing || false,
    status: userId ? "credited" : "pending", // pending if not logged in, credited if logged in
    createdAt: new Date(),
  });

  if (!amoeEntry) {
    throw new ApiError(400, "Failed to submit your sweepstakes entry.");
  }

  // If user is authenticated, credit the bonus immediately
  if (userId) {
    const userBonus = await UserBonusModel.findOne({ userId });

    if (!userBonus) {
      throw new ApiError(404, "User bonus record not found");
    }

    const bonus = userBonus.claimDailySweepBonus();

    if (bonus) {
      userBonus.lastSweeDate = new Date();
      await userBonus.save();

      // Update the AMOE entry to mark as credited
      amoeEntry.status = "credited";
      amoeEntry.creditedAt = new Date();
      await amoeEntry.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { bonus, amoeEntry },
            "Daily sweep bonus claimed successfully"
          )
        );
    } else {
      // User already claimed bonus, but we still record the entry
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { amoeEntry },
            "Entry submitted successfully. You have already claimed your sweep bonus for this period."
          )
        );
    }
  } else {
    // User is not authenticated - entry is stored as pending
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { amoeEntry },
          "Entry submitted successfully. Please log in or create an account with this email to claim your Sweeps Coins."
        )
      );
  }
};

const claimNewUserBonus = async (req: Request, res: Response) => {
  const { _id } = getUserFromRequest(req);
  const userBonus = await UserBonusModel.findOne({ userId: _id });
  if (!userBonus) {
    throw new ApiError(404, "User bonus record not found");
  }

  const bonus = userBonus.claimNewUserBonus();

  if (bonus) {
    await userBonus.save();
    return res
      .status(200)
      .json(new ApiResponse(200, bonus, "New user bonus claimed"));
  } else {
    throw new ApiError(400, "New user bonus already claimed");
  }
};

export { claimDailyBonus, claimDailySweepBonus, claimNewUserBonus };
