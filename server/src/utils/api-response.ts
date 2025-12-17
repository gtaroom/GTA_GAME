export class ApiResponse {
  public data: any;
  public statusCode: number;
  public success: boolean;
  public message: string;
  constructor(statusCode: number, data: any, message: string = "Success") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.data = data;
    this.message = message;
  }
}
