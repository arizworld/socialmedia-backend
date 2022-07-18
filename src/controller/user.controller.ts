import User from "../model/user.model";
import { Request, Response, NextFunction } from "express";
import sendEMail from "../utils/mailer";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sharp from "sharp";
export default class UserController {
  signup = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let { username, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return next(new ErrorHandler(400, "user already exists"));
    }
    password = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password });
    const token = jwt.sign({ id: newUser._id }, "secretKey");
    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({ success: true, user: newUser });
  });

  login = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler(400, "Invalid Credentials"));
    }
    const isvalidPassword = await bcrypt.compare(password, user.password);
    if (!isvalidPassword) {
      return next(new ErrorHandler(400, "Invalid Credentials"));
    }
    const token = jwt.sign({ id: user._id }, "secretKey");
    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({ success: true, user });
  });

  //   authentication required
  logout = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { token } = req.cookies;
    if (!token) {
      return next(new ErrorHandler(401, "Please login first"));
    }
    res.cookie("token", "", {
      maxAge: 1,
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: "See You soon" });
  });
  //   authentication required
  deleteAccount = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.body.userID;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return next(new ErrorHandler(400, "User not found"));
    }
    user.image = undefined;
    res.status(200).json({ success: true, user });
  });

  forgetPassword = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { email } = req.body;
    if (!email) {
      return next(
        new ErrorHandler(400, "To find your account you must provide email")
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler(400, "No user found"));
    }
    try {
      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.resetTokenExpire = Date.now() + 15 * 60 * 1000;
      await user.save();
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/user/resetpassword/${resetToken}`;
      const subject = "Password Reset";
      const message = `your password reset link for ${req.get(
        "host"
      )} \n\n is :- ${resetUrl} \n\n\ if you have not request this,please ignore`;
      const isSent = await sendEMail({ email, subject, message });
      if (isSent) {
        return res.status(200).json({
          success: true,
          resetToken,
          message: "if not found in primary checkout spam fodler",
        });
      }
      return next(new ErrorHandler(500, "Mail not sent try again later"));
    } catch (error) {
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      await user.save();
      if (error instanceof Error) {
        return next(new ErrorHandler(500, error.message));
      }
      next(new ErrorHandler(500, "Unknown Error occured"));
    }
  });

  resetPassword = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    if (!token) {
      return next(new ErrorHandler(400, "Invalid Request"));
    }
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorHandler(401, "Invalid Token"));
    }
    if (password !== confirmPassword) {
      return next(
        new ErrorHandler(400, "Password and confirm password must be same")
      );
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "please login to continue" });
  });

  //   authentication required
  setProfilePic = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.body.userID;
      const user = await User.findById(userId);
      if (!req.file) {
        return next(new ErrorHandler(400, "No file found"));
      }
      if (!user) {
        return next(new ErrorHandler(400, "No user found"));
      }
      const imageData = await sharp(req.file.buffer)
        .png()
        .resize({ width: 255, height: 255 })
        .toBuffer();
      user.image = {
        data: imageData,
        url: `${req.baseUrl}/${userId}/avatar`,
      };
      await user.save();
      res.status(200).json({ success: true, url: user.image.url });
    } catch (error) {
      if (error instanceof Error) {
        return next(new ErrorHandler(500, error.message));
      }
      next(new ErrorHandler(500, "Unknown Error occured"));
    }
  });

  //   authentication required
  removeProfilePic = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.body.userID;
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler(400, "No user found"));
    }
    user.image = undefined;
    await user.save();
    res.status(200).json({ success: true });
  });

  showProfilePic = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "Invalid request"));
    }
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler(400, "No user found"));
    }
    if (!user.image) {
      return next(new ErrorHandler(400, "please set profile pic first"));
    }
    res.setHeader("Content-Type", "image/png");
    res.status(200).send(user.image.data);
  });
}
