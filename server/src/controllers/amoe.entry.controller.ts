import { Request, Response } from "express";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { getUserFromRequest } from "../utils/get-user";
import AmoeModel from "../models/amoe-entry.model";

export const getEntries = async (req: Request, res: Response) => {
    const {  month = "current" } = req.query;

    const currentDate = new Date();
    const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Date filter logic
    const dateFilter =
        month === "current"
            ? { createdAt: { $gte: startOfCurrentMonth, $lt: new Date() } }
            : { createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } };

    const allEntries = await AmoeModel.find(dateFilter)
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, {
        users: allEntries
        }, "Entries fetched successfully"));
};

export const deletePrevMonthEntries = async (req: Request, res: Response) => {
    const currentDate = new Date();
    const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    try {
        const deletedEntries = await AmoeModel.deleteMany({
            createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth }
        });

        res.status(200).json(new ApiResponse(200, { deletedCount: deletedEntries.deletedCount }, "Previous month's entries deleted successfully."));
    } catch (error) {
        throw new ApiError(500, "Failed to delete previous month's entries.");
    }
};

export const selectWinner = async (req: Request, res: Response) => {
const {entryId} = req.params;
const selectWinner = await AmoeModel.findByIdAndUpdate(entryId,{isWinner:true},{new:true});
res.status(200).json(new ApiResponse(200, selectWinner, "Winner choosen successfully"));
}