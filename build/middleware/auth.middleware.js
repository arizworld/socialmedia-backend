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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsyncErrors_1 = __importDefault(require("../utils/catchAsyncErrors"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
exports.default = (0, catchAsyncErrors_1.default)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token } = req.cookies;
        if (!token) {
            return next(new ErrorHandler_1.default(401, "Please provide valid credentials"));
        }
        const data = jsonwebtoken_1.default.verify(token, "secretKey");
        if (typeof data === "object") {
            const user = yield user_model_1.default.findById(data.id);
            if (user) {
                req.body.userID = user._id;
                req.body.username = user.username;
                console.log(user.username);
                return next();
            }
            return next(new ErrorHandler_1.default(400, "Please provide valid credentials"));
        }
        next(new ErrorHandler_1.default(400, "Token not found"));
    });
});
