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
const catchAsyncErrors_1 = __importDefault(require("../utils/error/catchAsyncErrors"));
const ErrorHandler_1 = __importDefault(require("../utils/error/ErrorHandler"));
const post_model_2 = __importDefault(require("../model/post.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const PostAggregation_1 = __importDefault(require("../utils/Aggregation/PostAggregation"));
const comments_model_1 = __importDefault(require("../model/comments.model"));
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
                const title = req.body.title;
                const description = req.body.description;
                const author = req.body.userID;
                const authorname = req.body.username;
                const tags = req.body.tags || [];
                const likes = [];
                if (!author || !authorname) {
                    return next(new ErrorHandler_1.default(403, "author is required"));
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
                    return next(new ErrorHandler_1.default(500, "post not created"));
                }
                res.status(200).json({ success: true, post });
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
                const title = req.body.title;
                const description = req.body.description;
                const author = req.body.userID;
                const tags = req.body.tags || [];
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : post id required"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                if (post.author.toString() !== author.toString()) {
                    return next(new ErrorHandler_1.default(403, "Cant update others post"));
                }
                const updatedPost = yield post_model_2.default.update(id, {
                    title,
                    description,
                    tags,
                    media,
                });
                if (!updatedPost) {
                    return next(new ErrorHandler_1.default(500, "post not updated"));
                }
                res.status(200).json({ success: true, updatedPost });
            });
        });
        this.getPost = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : post id required"));
                }
                const postExists = yield post_model_2.default.findById(id);
                if (!postExists) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                console.log(postExists._id);
                let pipeline = new PostAggregation_1.default(null).matchId(postExists._id).pipeline;
                const post = yield post_model_2.default.aggregate(pipeline);
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
                let posts = yield post_model_2.default.aggregate(pipeline);
                if (!posts) {
                    return next(new ErrorHandler_1.default(404, "not post found"));
                }
                res.status(200).json({ success: true, posts });
            });
        });
        this.getUserSpecificPosts = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "User id Required"));
                }
                let userExists = yield user_model_1.default.findById(id);
                if (!userExists) {
                    return next(new ErrorHandler_1.default(400, "Invalid user id"));
                }
                const pipeline = new PostAggregation_1.default(req.query)
                    .matchAuthor(userExists._id)
                    .search()
                    .filterTags()
                    .customSort()
                    .pagination().pipeline;
                const user = yield user_model_1.default.aggregate(pipeline);
                res.status(200).json({ success: true, user: user[0] });
            });
        });
        this.deletePost = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : post id required"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                post = yield post_model_2.default.delete(id);
                yield comments_model_1.default.deleteMany({ postId: post === null || post === void 0 ? void 0 : post._id });
                res.status(200).json({ success: true, post });
            });
        });
        this.streamFile = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "No Id found"));
                }
                const range = req.headers.range || "0";
                mongoose_1.default.connection.db
                    .collection("uploads.files")
                    .findOne({ _id: new mongoose_1.default.Types.ObjectId(id) }, (err, file) => {
                    if (!file) {
                        return next(new ErrorHandler_1.default(500, "No File found"));
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
                        return next(new ErrorHandler_1.default(500, err.message));
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
                    return next(new ErrorHandler_1.default(400, "post id required"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "post not found"));
                }
                post = yield post_model_2.default.findOne({
                    _id: id,
                    "likes.authorId": author,
                });
                if (post) {
                    return next(new ErrorHandler_1.default(400, "author has already reacted"));
                }
                if (reactionType) {
                    let isValidType = Object.keys(post_model_1.LikeTypes).includes(reactionType);
                    if (!isValidType) {
                        return next(new ErrorHandler_1.default(400, "Invalid reaction Type"));
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
                res.json({ sucess: true, post, message: `${reactionType} added ` });
            });
        });
        this.updateReaction = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                let { reactionType } = req.body;
                const author = req.body.userID;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "post id  required"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "post not found"));
                }
                let isValidType = Object.keys(post_model_1.LikeTypes).includes(reactionType);
                if (!isValidType) {
                    return next(new ErrorHandler_1.default(400, "Invalid reaction Type"));
                }
                post = yield post_model_2.default.findOne({
                    _id: id,
                    "likes.authorId": author,
                });
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "No reaction found"));
                }
                post = yield post_model_2.default.partialUpdate({
                    _id: id,
                    "likes.authorId": author,
                }, {
                    "likes.$.reactionType": reactionType,
                });
                res.json({ sucess: true, post, message: `${reactionType} added ` });
            });
        });
        this.removeReaction = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                let { reactionType } = req.body;
                const author = req.body.userID;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "post id required"));
                }
                let post = yield post_model_2.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "post not found"));
                }
                post = yield post_model_2.default.findOne({
                    _id: id,
                    "likes.authorId": author,
                });
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "No reaction found"));
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
                    message: `${reactionType} removed`,
                });
            });
        });
    }
}
exports.default = PostController;
