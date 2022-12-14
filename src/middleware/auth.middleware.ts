import { UserModel } from "./../model/user.model";
import { Request, Response, NextFunction } from "express";
import UserServices from "../model/user.model";
import jwt from "jsonwebtoken";
import catchAsyncErrors from "../utils/error/catchAsyncErrors";
import ErrorHandler from "../utils/error/ErrorHandler";
import config from "../config/config";

export default catchAsyncErrors(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(new ErrorHandler(400, "INVALID_TOKEN"));
  }
  const token = authorization.split(" ")[1];
  const data = jwt.verify(token, config.secretKey);
  if (typeof data === "object") {
    const user: UserModel | null = await UserServices.findByIdAndSelect(
      data.id
    );
    if (user) {
      let tokenExists = user.blockedAccessTokens.filter(
        (tokenObj) => tokenObj.token === token
      );
      if (tokenExists.length)
        return next(new ErrorHandler(401, "UNAUTHORISED"));
      req.body.userID = user._id;
      req.body.username = user.username;
      return next();
    }
    return next(new ErrorHandler(400, "INVALID_CREDENTIALS"));
  }
  next(new ErrorHandler(400, "INVALID_CREDENTIALS"));
});
