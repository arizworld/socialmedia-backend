import { Request, Response, NextFunction } from "express";
import config from "../config/config";
import ErrorHandler from "../utils/error/ErrorHandler";
export default function (req: Request, res: Response, next: NextFunction) {
  const { apikey } = req.query;
  if (apikey !== config.apiKey) {
    return next(new ErrorHandler(403, "Invalid api key"));
  }
  next();
}
