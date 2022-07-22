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
const mongoose_1 = __importDefault(require("mongoose"));
const post_model_1 = require("../model/post.model");
// import error handlers
const catchAsyncErrors_1 = __importDefault(require("../utils/error/catchAsyncErrors"));
const ErrorHandler_1 = __importDefault(require("../utils/error/ErrorHandler"));
// import Services
const post_model_2 = __importDefault(require("../model/post.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const comments_model_1 = __importDefault(require("../model/comments.model"));
const PostAggregation_1 = __importDefault(require("../utils/Aggregation/PostAggregation"));
class PostController {
    constructor() {
        this.createPost = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const files = req.files;
                const media = [];
                if (files) {
                    files.forEach((file) => {
                        media.push({
                            mediaRef: file.id,
                            mediaUrl: `${req.protocol}://${req.get("host")}/post/${file.id.toString()}/media`,
                        });
                    });
                }
                const { title, description, tags } = req.fields; //if code reaches here this fields must be there
                const author = req.body.userID;
                const authorname = req.body.username;
                const likes = [];
                if (!author || !authorname) {
                    return next(new ErrorHandler_1.default(403, "AUTHENTICATION_REQUIRED"));
                }
                const post = yield post_model_2.default.create({
                    title,
                    description,
                    author,
                    authorname,
                    media,
                    tags,
                    likes,
                });
                if (!post) {
                    return next(new ErrorHandler_1.default(500, "POST_NOT_CREATED"));
                }
                res
                    .status(200)
                    .json({ success: true, post, message: res.__("POST_CREATED") });
            });
        });
        this.updatePost = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const files = req.files;
                const media = [];
                if (files) {
                    files.forEach((file) => {
                        media.push({
                            mediaRef: file.id,
                            mediaUrl: `${req.protocol}://${req.get("host")}/post/${file.id.toString()}/media`,
                        });
                    });
                }
                const { title, description, tags } = req.fields;
                const author = req.body.userID;
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_POST_ID"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "POST_NOT_FOUND"));
                }
                // cant update others post
                if (post.author.toString() !== author.toString()) {
                    return next(new ErrorHandler_1.default(403, "FORBIDDEN"));
                }
                const updatedPost = yield post_model_2.default.update(id, {
                    title,
                    description,
                    tags,
                    media,
                });
                if (!updatedPost) {
                    return next(new ErrorHandler_1.default(500, "POST_UPDATE_FAILURE"));
                }
                res.status(200).json({
                    success: true,
                    updatedPost,
                    message: res.__("POST_UPDATE_SUCCESS"),
                });
            });
        });
        this.getPost = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_POST_ID"));
                }
                const post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "POST_NOT_FOUND"));
                }
                res.status(200).json({ success: true, post });
            });
        });
        this.getAllPosts = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const pipeline = new PostAggregation_1.default(req.query)
                    .search()
                    .filterTags()
                    .customSort()
                    .pagination().pipeline;
                const data = yield post_model_2.default.aggregate(pipeline);
                res.status(200).json({ success: true, data });
            });
        });
        this.getUserSpecificPosts = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_USER_ID"));
                }
                let user = yield user_model_1.default.findById(id);
                if (!user) {
                    return next(new ErrorHandler_1.default(400, "USER_NOT_FOUND"));
                }
                const pipeline = new PostAggregation_1.default(req.query)
                    .matchAuthor(user._id)
                    .search()
                    .filterTags()
                    .customSort()
                    .pagination().pipeline;
                const data = yield post_model_2.default.aggregate(pipeline);
                res.status(200).json({ success: true, data: data });
            });
        });
        this.deletePost = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_POST_ID"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "POST_NOT_FOUND"));
                }
                post = yield post_model_2.default.delete(id);
                yield comments_model_1.default.deleteMany({ postId: post === null || post === void 0 ? void 0 : post._id });
                res
                    .status(200)
                    .json({ success: true, post, message: res.__("POST_DELETE_SUCCESS") });
            });
        });
        this.streamFile = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_FILE_ID"));
                }
                const range = req.headers.range || "0";
                mongoose_1.default.connection.db
                    .collection("uploads.files")
                    .findOne({ _id: new mongoose_1.default.Types.ObjectId(id) }, (err, file) => {
                    if (err) {
                        return next(new ErrorHandler_1.default(500, "UNKNOWN_ERROR"));
                    }
                    if (!file) {
                        return next(new ErrorHandler_1.default(500, "FILE_NOT_FOUND"));
                    }
                    const fileSize = file.length;
                    const start = Number(range.replace(/\D/g, ""));
                    const end = fileSize - 1;
                    const contentLength = end - start + 1;
                    const contentType = file.contentType;
                    const headers = {
                        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length": contentLength,
                        "Content-Type": contentType,
                    };
                    // HTTP Status 206 for Partial Content
                    res.set(Object.assign({}, headers));
                    const bucket = new mongoose_1.default.mongo.GridFSBucket(mongoose_1.default.connection.db, {
                        bucketName: "uploads",
                    });
                    const downloadStream = bucket.openDownloadStreamByName(file.filename, {
                        start,
                    });
                    downloadStream.pipe(res);
                    downloadStream.on("error", (err) => {
                        return next(new ErrorHandler_1.default(500, "", err.message));
                    });
                });
            });
        });
        this.addReaction = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                let { reactionType } = req.body;
                const author = req.body.userID;
                const authorname = req.body.username;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_POST_ID"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "POST_NOT_FOUND"));
                }
                post = yield post_model_2.default.findOne({
                    _id: id,
                    "likes.authorId": author,
                });
                if (post) {
                    return next(new ErrorHandler_1.default(400, "REACTION_EXISTS"));
                }
                if (reactionType) {
                    let isValidType = Object.keys(post_model_1.LikeTypes).includes(reactionType);
                    if (!isValidType) {
                        return next(new ErrorHandler_1.default(400, "INVALID_REACTION_TYPE"));
                    }
                }
                else {
                    reactionType = post_model_1.LikeTypes.love;
                }
                post = yield post_model_2.default.partialUpdate({ _id: id }, {
                    $push: {
                        likes: {
                            authorId: author,
                            authorname,
                            reactionType,
                        },
                    },
                    $inc: {
                        likecount: 1,
                    },
                });
                res.json({
                    sucess: true,
                    post,
                    message: `${reactionType} ${res.__("REACTION_ADDED")} `,
                });
            });
        });
        this.updateReaction = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                let { reactionType } = req.body;
                const author = req.body.userID;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_POST_ID"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "POST_NOT_FOUND"));
                }
                let isValidType = Object.keys(post_model_1.LikeTypes).includes(reactionType);
                if (!isValidType) {
                    return next(new ErrorHandler_1.default(400, "INVALID_REACTION_TYPE"));
                }
                post = yield post_model_2.default.findOne({
                    _id: id,
                    "likes.authorId": author,
                });
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "REACTION_NOT_FOUND"));
                }
                post = yield post_model_2.default.partialUpdate({
                    _id: id,
                    "likes.authorId": author,
                }, {
                    "likes.$.reactionType": reactionType,
                });
                res.json({
                    sucess: true,
                    post,
                    message: `${reactionType} ${res.__("REACTION_ADDED")} `,
                });
            });
        });
        this.removeReaction = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                let { reactionType } = req.body;
                const author = req.body.userID;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "INVALID_POST_ID"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "POST_NOT_FOUND"));
                }
                post = yield post_model_2.default.findOne({
                    _id: id,
                    "likes.authorId": author,
                });
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "REACTION_NOT_FOUND"));
                }
                post = yield post_model_2.default.partialUpdate({ _id: id }, {
                    $pull: {
                        likes: {
                            authorId: author,
                        },
                    },
                    $inc: {
                        likecount: -1,
                    },
                });
                res.json({
                    success: true,
                    post,
                    message: `${reactionType} ${res.__("REACTION_REMOVED")}`,
                });
            });
        });
    }
}
exports.default = PostController;
//# sourceMappingURL=post.controller.js.map