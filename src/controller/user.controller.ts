import User, { UserModel } from "../model/user.model";
import { Request, Response, NextFunction } from "express";
import sendEMail from "../utils/mailer";
import catchAsyncErrors from "../utils/error/catchAsyncErrors";
import ErrorHandler from "../utils/error/ErrorHandler";
import crypto from "crypto";
import sharp from "sharp";
import UserServices from "../model/user.model";
import config from "../config/config";
import UserAggregation from "../utils/Aggregation/UserAggregation";
import PostServices, { PostModel } from "../model/post.model";
import CommentServices from "../model/comments.model";
export default class UserController {
  signup = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let { username, email, password } = req.body;
    const user = await UserServices.findOne({ email });
    if (user) {
      return next(new ErrorHandler(400, "user already exists"));
    }
    const newUser: UserModel = await UserServices.create({
      username,
      email,
      password,
    });
    const token = newUser.getToken();
    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    // delete newUser.password
    res.status(200).json({ success: true, user: newUser });
  });

  login = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let { email, password } = req.body;
    const user = await UserServices.findOne({ email });
    if (!user) {
      return next(new ErrorHandler(400, "Invalid Credentials"));
    }
    const isvalidPassword = await user.comparePassword(password);
    if (!isvalidPassword) {
      return next(new ErrorHandler(400, "Invalid password Credentials"));
    }
    const token = user.getToken();
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
    const user = await UserServices.delete(userId);
    if (!user) {
      return next(new ErrorHandler(400, "User not found"));
    }
    const posts = await PostServices.find({ author: user._id });
    // delete all comments of that post
    if (posts) {
      posts.forEach(async (post: PostModel) => {
        await CommentServices.deleteMany({ postId: post._id });
      });
    }
    // delete all user post
    await PostServices.deleteMany({ author: user._id });
    // delete all comments of user
    await CommentServices.deleteMany({ author: user._id });
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
    const user = await UserServices.findOne({ email });
    if (!user) {
      return next(new ErrorHandler(400, "No user found"));
    }
    try {
      const resetToken = await user.getResetToken(config.resetDelay);
      user.destroyResetToken(config.resetDelay);
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
    const user = await UserServices.findOne({
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

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    res
      .status(200)
      .json({ success: true, user, message: "please login to continue" });
  });

  //   authentication required
  setProfilePic = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.body.userID;
      const user = await UserServices.findById(userId);
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
        url: `${req.protocol}://${req.get("host")}/user/${userId}/avatar`,
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
  getAllUsers = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const pipeline = new UserAggregation(req.query).pagination().pipeline;
    const user = await UserServices.aggregate(pipeline);
    res.status(200).json({ user });
  });
  getUser = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "user id is required"));
    }
    const user = await UserServices.findById(id);
    if (!user) {
      return next(new ErrorHandler(400, "No user found"));
    }
    res.status(200).json({ user });
  });
}
