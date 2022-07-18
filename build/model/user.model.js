"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: [true, "please provide name"],
    },
    email: {
        type: String,
        required: [true, "please provide email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "please provide password"],
    },
    image: {
        data: {
            type: Buffer,
        },
        url: {
            type: String,
        },
    },
    resetToken: String,
    resetTokenExpire: Number,
});
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
