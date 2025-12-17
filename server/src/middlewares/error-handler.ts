import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/api-error";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If headers have already been sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  let error = err as ApiError;
  // console.log(` SILENT ${error.message}`);

  // Check if error is an instance of ApiError
  if (!(err instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);

    const message = error.message || "Something went wrong";
    // Construct a new ApiError if it's not already an ApiError
    error = new ApiError(
      statusCode,
      message,
      error?.errors || [],
      err.stack || "",
    );
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  // console.log(`ERROR HANDLER SILENT ${error.message}`,response);

  // Send the response with appropriate status code
  return res.status(error.statusCode).json(response);
};

export { errorHandler };
