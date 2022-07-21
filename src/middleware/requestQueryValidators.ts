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
    return next(
      new ErrorHandler(400, "", `Invalid value for srt: ${queryCopy.srt}`)
    );
  }
  validQueries.forEach((q) => delete queryCopy[q]);
  const keys = Object.keys(queryCopy);
  if (keys.length) {
    return next(
      new ErrorHandler(400, "", `Invalid query parameters : ${keys.join(",")}`)
    );
  }
  next();
}
