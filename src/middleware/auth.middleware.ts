import { UserModel } from "./../model/user.model";
import { Request, Response, NextFunction } from "express";
import User from "../model/user.model";
import jwt from "jsonwebtoken";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

export default catchAsyncErrors(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler(401, "Please provide valid credentials"));
  }
  const data = jwt.verify(token, "secretKey");
  if (typeof data === "object") {
    const user: UserModel | null = await User.findById(data.id);
    if (user) {
      req.body.userID = user._id;
      req.body.username = user.username;
      console.log(user.username);
      return next();
    }
    return next(new ErrorHandler(400, "Please provide valid credentials"));
  }
  next(new ErrorHandler(400, "Token not found"));
});
