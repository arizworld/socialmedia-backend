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
const postSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: [true, "Please Provide valid title"],
        minLength: [5, "Title can not be less than 5 characters"],
        maxLength: [35, "Title can not exceed 35 characters"],
    },
    description: {
        type: String,
        required: [true, "Please Provide valid description"],
        minLength: [150, "Description can not be less than 150 characters"],
        maxLength: [1000, "Description can not exceed 1000 characters"],
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    authorname: {
        type: String,
        required: [true, "Author name is required"],
    },
    media: [
        {
            mediaRef: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: true,
            },
            mediaUrl: {
                type: String,
                required: true,
            },
        },
    ],
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
    tags: {
        type: [
            {
                type: String,
            },
        ],
        default: [],
    },
}, {
    timestamps: true,
});
postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId",
});
const Post = mongoose_1.default.model("Post", postSchema);
const PostServices = new mongoose_service_1.default(Post);
exports.default = PostServices;
//# sourceMappingURL=post.model.js.map