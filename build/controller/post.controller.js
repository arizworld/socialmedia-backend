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
const catchAsyncErrors_1 = __importDefault(require("../utils/catchAsyncErrors"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const ApiFeatures_1 = __importDefault(require("../utils/ApiFeatures"));
const post_model_1 = __importDefault(require("../model/post.model"));
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
                const post = yield post_model_1.default.create({
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
                let post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                if (post.author.toString() !== author.toString()) {
                    return next(new ErrorHandler_1.default(403, "Cant update others post"));
                }
                const updatedPost = yield post_model_1.default.update(id, {
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
                let post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                res.status(200).json({ success: true, post });
            });
        });
        this.getAllPosts = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const requestPerPage = 5;
                const pipeline = new ApiFeatures_1.default(req.query)
                    .search()
                    .customSort()
                    .pagination()
                    .populateOwner().pipeline;
                let posts = yield post_model_1.default.aggregate(pipeline);
                if (!posts) {
                    return next(new ErrorHandler_1.default(404, "not post found"));
                }
                res.status(200).json({ success: true, posts });
            });
        });
        this.deletePost = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : post id required"));
                }
                let post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                post = yield post_model_1.default.delete(id);
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
    }
}
exports.default = PostController;
