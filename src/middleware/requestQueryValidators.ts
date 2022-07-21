import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/error/ErrorHandler";

export default function (req: Request, res: Response, next: NextFunction) {
  const validQueries =
    req.method === "GET"
      ? ["apikey", "lt", "page", "srt", "tags", "keyword"]
      : ["apikey"];
  const { query } = req;
  const queryCopy = { ...query };
  if (queryCopy.srt && !(queryCopy.srt === "ml" || queryCopy.srt === "mr")) {
    return res.status(400).json({
      success: false,
      message: res.__("INVALID_QUERY_SORT"),
    });
  }
  validQueries.forEach((q) => delete queryCopy[q]);
  const keys = Object.keys(queryCopy);
  if (keys.length) {
    return res.status(400).json({
      success: false,
      message: res.__("INVALID_QUERY_PARAMS"),
    });
  }
  next();
}
