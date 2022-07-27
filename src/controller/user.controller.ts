import { Request, Response, NextFunction } from "express";
import { UserModel } from "../model/user.model";
// import error handlers
import catchAsyncErrors from "../utils/error/catchAsyncErrors";
import ErrorHandler from "../utils/error/ErrorHandler";
// import utils
import sendEMail from "../utils/mailer";
import crypto from "crypto";
import sharp from "sharp";
import config from "../config/config";
// import services
import UserServices from "../model/user.model";
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
      return next(new ErrorHandler(400, "USER_EXISTS"));
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
    if (newUser.image) {
      newUser.image.data = undefined;
    }
    res
      .status(201)
      .json({ success: true, user: newUser, message: res.__("USER_CREATED") });
  });

  login = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let { email, password } = req.body;
    const user = await UserServices.findOne({ email });
    if (!user) {
      return next(new ErrorHandler(400, "INVALID_CREDENTIALS"));
    }
    const isvalidPassword = await user.comparePassword(password);
    if (!isvalidPassword) {
      return next(new ErrorHandler(400, "INVALID_CREDENTIALS"));
    }
    const token = user.getToken();
    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    if (user.image) {
      user.image.data = undefined;
    }
    res.status(200).json({
      success: true,
      user,
      message: `${res.__("USER_LOGIN")} ${user.username}`,
    });
  });

  //   authentication required
  logout = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { token } = req.cookies;
    if (!token) {
      return next(new ErrorHandler(401, "UNAUTHORISED"));
    }
    res.cookie("token", "", {
      maxAge: 1,
      httpOnly: true,
    });
    res
      .status(200)
      .json({ success: true, message: `${res.__("USER_LOGOUT")}` });
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
      return next(new ErrorHandler(400, "USER_NOT_FOUND"));
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
    res.status(200).json({
      success: true,
      user,
      message: `${res.__("USER_DELETED")} ${user.username}`,
    });
  });

  forgetPassword = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorHandler(400, "EMPTY_EMAIL"));
    }
    const user = await UserServices.findOne({ email });
    if (!user) {
      return next(new ErrorHandler(400, "USER_NOT_FOUND"));
    }
    try {
      const resetToken = await user.getResetToken(config.resetDelay);
      user.destroyResetToken(config.resetDelay);
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/user/resetpassword/${resetToken}`;
      const subject = "Password Reset";
      const message = `your password reset link for ${req.get(
        "host"
      )} \n\n is :- ${resetUrl} \n\n\ if you have not request this,please ignore`;
      const isSent = await sendEMail({ email, subject, message });
      if (isSent) {
        return res.status(200).json({
          success: true,
          resetToken,
          message: res.__("EMAIL_SENT_SUCCESS"),
        });
      }
      return next(new ErrorHandler(500, "EMAIL_SENT_FAILURE"));
    } catch (error) {
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      await user.save();
      if (error instanceof Error) {
        return next(new ErrorHandler(500, "", error.message));
      }
      next(new ErrorHandler(500, "UNKNOWN_ERROR"));
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
      return next(new ErrorHandler(400, "INVALID_TOKEN"));
    }
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await UserServices.findOne({
      resetToken,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorHandler(401, "INVALID_RESET_TOKEN"));
    }
    if (password !== confirmPassword) {
      return next(new ErrorHandler(400, "PASSWORD_UNMATCHED"));
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    res
      .status(200)
      .json({ success: true, user, message: res.__("PASSWORD_RESET_SUCCESS") });
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
        return next(new ErrorHandler(400, "FILE_NOT_FOUND"));
      }
      if (!user) {
        return next(new ErrorHandler(400, "USER_NOT_FOUND"));
      }
      const imageData = await sharp(req.file.buffer)
        .png()
        .resize({ width: 255, height: 255 })
        .toBuffer();
      user.image = {
        data: imageData,
        url: `${req.protocol}://${req.get(
          "host"
        )}/api/v1/user/${userId}/avatar`,
      };
      await user.save();
      res.status(200).json({
        success: true,
        url: user.image.url,
        message: res.__("PROFILE_PIC_SET_SUCCESS"),
      });
    } catch (error) {
      if (error instanceof Error) {
        return next(new ErrorHandler(500, "", error.message));
      }
      next(new ErrorHandler(500, "UNKNOWN_ERROR"));
    }
  });

  //   authentication required
  removeProfilePic = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.body.userID;
    const user = await UserServices.findById(userId);
    if (!user) {
      return next(new ErrorHandler(400, "USER_NOT_FOUND"));
    }
    user.image = undefined;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: res.__("PROFILE_PIC_REMOVE_SUCCESS") });
  });

  showProfilePic = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_USER_ID"));
    }
    const user = await UserServices.findById(id);
    if (!user) {
      return next(new ErrorHandler(400, "USER_NOT_FOUND"));
    }
    if (!user.image) {
      return next(new ErrorHandler(400, "PROFILE_PIC_NOT_FOUND"));
    }
    res.setHeader("Content-Type", "image/png");
    res.status(200).send(user.image.data);
  });
  getAllUsers = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const pipeline = new UserAggregation(req.query)
      .hideImageData()
      .pagination().pipeline;
    const data = await UserServices.aggregate(pipeline);
    res.status(200).json({ success: true, data: data[0] });
  });
  getUser = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_USER_ID"));
    }
    const user = await UserServices.findById(id);
    if (!user) {
      return next(new ErrorHandler(400, "USER_NOT_FOUND"));
    }
    if (user.image) {
      user.image.data = undefined;
    }
    res.status(200).json({ success: true, user });
  });
}
