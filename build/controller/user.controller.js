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
// import error handlers
const catchAsyncErrors_1 = __importDefault(require("../utils/error/catchAsyncErrors"));
const ErrorHandler_1 = __importDefault(require("../utils/error/ErrorHandler"));
// import utils
const mailer_1 = __importDefault(require("../utils/mailer"));
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const config_1 = __importDefault(require("../config/config"));
// import services
const user_model_1 = __importDefault(require("../model/user.model"));
const UserAggregation_1 = __importDefault(require("../utils/Aggregation/UserAggregation"));
const post_model_1 = __importDefault(require("../model/post.model"));
const comments_model_1 = __importDefault(require("../model/comments.model"));
class UserController {
    constructor() {
        this.signup = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                let { username, email, password } = req.body;
                const user = yield user_model_1.default.findOne({ email });
                if (user) {
                    return next(new ErrorHandler_1.default(400, "USER_EXISTS"));
                }
                const newUser = yield user_model_1.default.create({
                    username,
                    email,
                    password,
                });
                if (newUser.image) {
                    newUser.image.data = undefined;
                }
                res.status(201).json({
                    success: true,
                    user: newUser,
                    message: res.__("USER_CREATED"),
                });
            });
        });
        this.login = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                let { email, password } = req.body;
                const user = yield user_model_1.default.findOne({ email });
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "INVALID_CREDENTIALS"));
                }
                const isvalidPassword = yield user.comparePassword(password);
                if (!isvalidPassword) {
                    return next(new ErrorHandler_1.default(400, "INVALID_CREDENTIALS"));
                }
                const token = user.getToken();
                if (user.image) {
                    user.image.data = undefined;
                }
                res.status(200).json({
                    success: true,
                    user,
                    token,
                    message: `${res.__("USER_LOGIN")} ${user.username}`,
                });
            });
        });
        //   authentication required
        this.logout = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                res
                    .status(200)
                    .json({ success: true, message: `${res.__("USER_LOGOUT")}` });
            });
        });
        //   authentication required
        this.deleteAccount = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const userId = req.body.userID;
                const user = yield user_model_1.default.delete(userId);
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "USER_NOT_FOUND"));
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
                res.status(200).json({
                    success: true,
                    user,
                    message: `${res.__("USER_DELETED")} ${user.username}`,
                });
            });
        });
        this.forgetPassword = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email } = req.body;
                if (!email) {
                    return next(new ErrorHandler_1.default(400, "EMPTY_EMAIL"));
                }
                const user = yield user_model_1.default.findOne({ email });
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "USER_NOT_FOUND"));
                }
                try {
                    const resetToken = yield user.getResetToken(config_1.default.resetDelay);
                    user.destroyResetToken(config_1.default.resetDelay);
                    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/user/resetpassword/${resetToken}`;
                    const subject = "Password Reset";
                    const message = `your password reset link for ${req.get("host")} \n\n is :- ${resetUrl} \n\n\ if you have not request this,please ignore`;
                    const isSent = yield (0, mailer_1.default)({ email, subject, message });
                    if (isSent) {
                        return res.status(200).json({
                            success: true,
                            resetToken,
                            message: res.__("EMAIL_SENT_SUCCESS"),
                        });
                    }
                    return next(new ErrorHandler_1.default(500, "EMAIL_SENT_FAILURE"));
                }
                catch (error) {
                    user.resetToken = undefined;
                    user.resetTokenExpire = undefined;
                    yield user.save();
                    if (error instanceof Error) {
                        return next(new ErrorHandler_1.default(500, "", error.message));
                    }
                    next(new ErrorHandler_1.default(500, "UNKNOWN_ERROR"));
                }
            });
        });
        this.resetPassword = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { token } = req.params;
                const { password, confirmPassword } = req.body;
                if (!token) {
                    return next(new ErrorHandler_1.default(400, "INVALID_TOKEN"));
                }
                const resetToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
                const user = yield user_model_1.default.findOne({
                    resetToken,
                    resetTokenExpire: { $gt: Date.now() },
                });
                if (!user) {
                    return next(new ErrorHandler_1.default(401, "INVALID_RESET_TOKEN"));
                }
                if (password !== confirmPassword) {
                    return next(new ErrorHandler_1.default(400, "PASSWORD_UNMATCHED"));
                }
                user.password = password;
                user.resetToken = undefined;
                user.resetTokenExpire = undefined;
                yield user.save();
                res
                    .status(200)
                    .json({ success: true, user, message: res.__("PASSWORD_RESET_SUCCESS") });
            });
        });
        //   authentication required
        this.setProfilePic = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const userId = req.body.userID;
                    const user = yield user_model_1.default.findById(userId);
                    if (!req.file) {
                        return next(new ErrorHandler_1.default(400, "FILE_NOT_FOUND"));
                    }
                    if (!user) {
                        return next(new ErrorHandler_1.default(400, "USER_NOT_FOUND"));
                    }
                    const imageData = yield (0, sharp_1.default)(req.file.buffer)
                        .png()
                        .resize({ width: 255, height: 255 })
                        .toBuffer();
                    user.image = {
                        data: imageData,
                        url: `${req.protocol}://${req.get("host")}/api/v1/user/${userId}/avatar`,
                    };
                    yield user.save();
                    res.status(200).json({
                        success: true,
                        url: user.image.url,
                        message: res.__("PROFILE_PIC_SET_SUCCESS"),
                    });
                }
                catch (error) {
                    if (error instanceof Error) {
                        return next(new ErrorHandler_1.default(500, "", error.message));
                    }
                    next(new ErrorHandler_1.default(500, "UNKNOWN_ERROR"));
                }
            });
        });
        //   authentication required
        this.removeProfilePic = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const userId = req.body.userID;
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "USER_NOT_FOUND"));
                }
                user.image = undefined;
                yield user.save();
                res
                    .status(200)
                    .json({ success: true, message: res.__("PROFILE_PIC_REMOVE_SUCCESS") });
            });
        });
        this.showProfilePic = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_USER_ID"));
                }
                const user = yield user_model_1.default.findById(id);
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "USER_NOT_FOUND"));
                }
                if (!user.image) {
                    return next(new ErrorHandler_1.default(400, "PROFILE_PIC_NOT_FOUND"));
                }
                res.setHeader("Content-Type", "image/png");
                res.status(200).send(user.image.data);
            });
        });
        this.getAllUsers = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const pipeline = new UserAggregation_1.default(req.query)
                    .hideImageData()
                    .pagination().pipeline;
                const data = yield user_model_1.default.aggregate(pipeline);
                res.status(200).json({ success: true, data: data[0] });
            });
        });
        this.getUser = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_USER_ID"));
                }
                const user = yield user_model_1.default.findById(id);
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "USER_NOT_FOUND"));
                }
                if (user.image) {
                    user.image.data = undefined;
                }
                res.status(200).json({ success: true, user });
            });
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=user.controller.js.map