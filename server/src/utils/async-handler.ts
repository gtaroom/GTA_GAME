import { NextFunction, Request, Response } from "express";

/**
 * A higher-order function to handle async route handlers and pass errors to the next middleware.
 *
 * @param requestHandler - The asynchronous request handler function.
 * @returns A function that handles the request and passes errors to the next middleware.
 */
const asyncHandler = (
  requestHandler: (req: Request, res: Response, next: NextFunction) => void,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export { asyncHandler };
