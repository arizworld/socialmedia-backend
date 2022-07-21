"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorHandler extends Error {
    constructor(statusCode, messageCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.messageCode = messageCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ErrorHandler;
