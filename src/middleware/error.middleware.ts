import ErrorHandler from "../utils/ErrorHandler";
import { Request, Response, NextFunction } from "express";
export const showError = () => {
  return (
    error: ErrorHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // console.log(error, error.stack);
    const statusCode = error.statusCode ? error.statusCode : 500;
    if (error.name === "CastError") {
      error.message = "Cast Error : Invalid Id format";
    }
    return res.status(statusCode).json({
      success: false,
      message: error.message || error,
    });
  };
};
