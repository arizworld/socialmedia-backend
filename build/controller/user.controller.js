"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../model/user.model"));
const mailer_1 = __importDefault(require("../utils/mailer"));
const catchAsyncErrors_1 = __importDefault(require("../utils/error/catchAsyncErrors"));
const ErrorHandler_1 = __importDefault(require("../utils/error/ErrorHandler"));
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const user_model_2 = __importDefault(require("../model/user.model"));
const config_1 = __importDefault(require("../config/config"));
const UserAggregation_1 = __importDefault(require("../utils/Aggregation/UserAggregation"));
const post_model_1 = __importDefault(require("../model/post.model"));
const comments_model_1 = __importDefault(require("../model/comments.model"));
class UserController {
    constructor() {
        this.signup = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                let { username, email, password } = req.body;
                const user = yield user_model_2.default.findOne({ email });
                if (user) {
                    return next(new ErrorHandler_1.default(400, "user already exists"));
                }
                const newUser = yield user_model_2.default.create({
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
        });
        this.login = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                let { email, password } = req.body;
                const user = yield user_model_2.default.findOne({ email });
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "Invalid Credentials"));
                }
                const isvalidPassword = yield user.comparePassword(password);
                if (!isvalidPassword) {
                    return next(new ErrorHandler_1.default(400, "Invalid password Credentials"));
                }
                const token = user.getToken();
                res.cookie("token", token, {
                    maxAge: 1 * 24 * 60 * 60 * 1000,
                    httpOnly: true,
                });
                res.status(200).json({ success: true, user });
            });
        });
        //   authentication required
        this.logout = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { token } = req.cookies;
                if (!token) {
                    return next(new ErrorHandler_1.default(401, "Please login first"));
                }
                res.cookie("token", "", {
                    maxAge: 1,
                    httpOnly: true,
                });
                res.status(200).json({ success: true, message: "See You soon" });
            });
        });
        //   authentication required
        this.deleteAccount = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const userId = req.body.userID;
                const user = yield user_model_2.default.delete(userId);
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "User not found"));
                }
                const posts = yield post_model_1.default.find({ author: user._id });
                // delete all comments of that post
                if (posts) {
                    posts.forEach((post) => __awaiter(this, void 0, void 0, function* () {
                        yield comments_model_1.default.deleteMany({ postId: post._id });
                    }));
                }
                // delete all user post
                yield post_model_1.default.deleteMany({ author: user._id });
                // delete all comments of user
                yield comments_model_1.default.deleteMany({ author: user._id });
                user.image = undefined;
                res.status(200).json({ success: true, user });
            });
        });
        this.forgetPassword = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email } = req.body;
                if (!email) {
                    return next(new ErrorHandler_1.default(400, "To find your account you must provide email"));
                }
                const user = yield user_model_2.default.findOne({ email });
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "No user found"));
                }
                try {
                    const resetToken = yield user.getResetToken(config_1.default.resetDelay);
                    user.destroyResetToken(config_1.default.resetDelay);
                    const resetUrl = `${req.protocol}://${req.get("host")}/user/resetpassword/${resetToken}`;
                    const subject = "Password Reset";
                    const message = `your password reset link for ${req.get("host")} \n\n is :- ${resetUrl} \n\n\ if you have not request this,please ignore`;
                    const isSent = yield (0, mailer_1.default)({ email, subject, message });
                    if (isSent) {
                        return res.status(200).json({
                            success: true,
                            resetToken,
                            message: "if not found in primary checkout spam fodler",
                        });
                    }
                    return next(new ErrorHandler_1.default(500, "Mail not sent try again later"));
                }
                catch (error) {
                    user.resetToken = undefined;
                    user.resetTokenExpire = undefined;
                    yield user.save();
                    if (error instanceof Error) {
                        return next(new ErrorHandler_1.default(500, error.message));
                    }
                    next(new ErrorHandler_1.default(500, "Unknown Error occured"));
                }
            });
        });
        this.resetPassword = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { token } = req.params;
                const { password, confirmPassword } = req.body;
                if (!token) {
                    return next(new ErrorHandler_1.default(400, "Invalid Request"));
                }
                const resetToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
                const user = yield user_model_2.default.findOne({
                    resetToken,
                    resetTokenExpire: { $gt: Date.now() },
                });
                if (!user) {
                    return next(new ErrorHandler_1.default(401, "Invalid Token"));
                }
                if (password !== confirmPassword) {
                    return next(new ErrorHandler_1.default(400, "Password and confirm password must be same"));
                }
                user.password = password;
                user.resetToken = undefined;
                user.resetTokenExpire = undefined;
                yield user.save();
                res
                    .status(200)
                    .json({ success: true, user, message: "please login to continue" });
            });
        });
        //   authentication required
        this.setProfilePic = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const userId = req.body.userID;
                    const user = yield user_model_2.default.findById(userId);
                    if (!req.file) {
                        return next(new ErrorHandler_1.default(400, "No file found"));
                    }
                    if (!user) {
                        return next(new ErrorHandler_1.default(400, "No user found"));
                    }
                    const imageData = yield (0, sharp_1.default)(req.file.buffer)
                        .png()
                        .resize({ width: 255, height: 255 })
                        .toBuffer();
                    user.image = {
                        data: imageData,
                        url: `${req.protocol}://${req.get("host")}/user/${userId}/avatar`,
                    };
                    yield user.save();
                    res.status(200).json({ success: true, url: user.image.url });
                }
                catch (error) {
                    if (error instanceof Error) {
                        return next(new ErrorHandler_1.default(500, error.message));
                    }
                    next(new ErrorHandler_1.default(500, "Unknown Error occured"));
                }
            });
        });
        //   authentication required
        this.removeProfilePic = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const userId = req.body.userID;
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "No user found"));
                }
                user.image = undefined;
                yield user.save();
                res.status(200).json({ success: true });
            });
        });
        this.showProfilePic = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "Invalid request"));
                }
                const user = yield user_model_1.default.findById(id);
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "No user found"));
                }
                if (!user.image) {
                    return next(new ErrorHandler_1.default(400, "please set profile pic first"));
                }
                res.setHeader("Content-Type", "image/png");
                res.status(200).send(user.image.data);
            });
        });
        this.getAllUsers = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const pipeline = new UserAggregation_1.default(req.query).pagination().pipeline;
                const user = yield user_model_2.default.aggregate(pipeline);
                res.status(200).json({ user });
            });
        });
        this.getUser = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "user id is required"));
                }
                const user = yield user_model_2.default.findById(id);
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "No user found"));
                }
                res.status(200).json({ user });
            });
        });
    }
}
exports.default = UserController;
