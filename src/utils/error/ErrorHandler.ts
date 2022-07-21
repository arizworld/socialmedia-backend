export default class ErrorHandler extends Error {
  statusCode: number;
  messageCode: string;
  constructor(statusCode: number, messageCode: string, message?: string) {
    super(message);
    this.statusCode = statusCode;
    this.messageCode = messageCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
