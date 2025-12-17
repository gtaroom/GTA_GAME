export class ApiError extends Error {
  public statusCode: number;
  public data: any | null;
  public success: boolean;
  public message: string;
  public errors: any[];
  public stack: string | undefined;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack: string = "",
  ) {
    super(message); // Call parent constructor (Error) with message
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
