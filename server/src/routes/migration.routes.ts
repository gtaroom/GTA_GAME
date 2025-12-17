import express from "express";
import { asyncHandler } from "../utils/async-handler";
import AmoeModel from "../models/amoe-entry.model";
import { ApiResponse } from "../utils/api-response";

const migrationRouter = express.Router();

// TEMPORARY ROUTE - DELETE AFTER MIGRATION
migrationRouter.get(
  "/migrate-amoe",
  asyncHandler(async (req, res) => {
    console.log("Starting AMOE migration...");

    const result = await AmoeModel.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { acceptMarketing: { $exists: false } },
        ],
      },
      {
        $set: {
          status: "credited",
          acceptMarketing: false,
          creditedAt: new Date(),
        },
      }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          matched: result.matchedCount,
          updated: result.modifiedCount,
        },
        "Migration completed successfully"
      )
    );
  })
);

export default migrationRouter;
