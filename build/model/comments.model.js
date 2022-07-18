"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeTypes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_service_1 = __importDefault(require("../services/mongoose.service"));
var LikeTypes;
(function (LikeTypes) {
    LikeTypes["like"] = "like";
    LikeTypes["love"] = "love";
    LikeTypes["haha"] = "haha";
    LikeTypes["care"] = "care";
    LikeTypes["lol"] = "lol";
})(LikeTypes = exports.LikeTypes || (exports.LikeTypes = {}));
const commentSchema = new mongoose_1.default.Schema({
    text: {
        type: String,
        required: [true, "Comments can not be empty"],
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: [true, "author must be there"],
        ref: "User",
    },
    authorname: {
        type: String,
        required: [true, "author must have a name"],
    },
    postId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: [true, "post reference must be there"],
        ref: "Post",
    },
    likes: [
        {
            reactionType: String,
            authorId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: [true, "author must be there"],
                ref: "User",
            },
            authorname: String,
        },
    ],
    likecount: {
        type: Number,
        default: 0,
    },
    parentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },
}, {
    timestamps: true,
});
const Comment = mongoose_1.default.model("Comment", commentSchema);
const CommentServices = new mongoose_service_1.default(Comment);
exports.default = CommentServices;
