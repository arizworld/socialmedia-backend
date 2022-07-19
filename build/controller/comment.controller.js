"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const comments_model_1 = __importStar(require("../model/comments.model"));
const post_model_1 = __importDefault(require("../model/post.model"));
const catchAsyncErrors_1 = __importDefault(require("../utils/catchAsyncErrors"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const CommentsAggregaion_1 = __importDefault(require("../utils/Aggregation/CommentsAggregaion"));
class CommentController {
    constructor() {
        this.getAllComments = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params; //post id
                const post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                const pipeline = new CommentsAggregaion_1.default(req.query)
                    .match(post._id)
                    .structure()
                    .customSort()
                    .pagination().pipeline;
                const comments = yield comments_model_1.default.aggregate(pipeline);
                res.json({
                    success: true,
                    comments,
                });
            });
        });
        // getReplies = catchAsyncErrors(async function (
        //   req: Request,
        //   res: Response,
        //   next: NextFunction
        // ) {
        //   const { id, cid } = req.params; //post id
        //   const post = await PostServices.findById(id);
        //   if (!post) {
        //     return next(new ErrorHandler(404, "Invalid request : post not found"));
        //   }
        //   const comment = await CommentServices.findById(cid);
        //   if (!comment) {
        //     return next(new ErrorHandler(400, "No comment found"));
        //   }
        //   const comments = await CommentServices.find({ parentId: cid });
        //   res.json({
        //     success: true,
        //     comments,
        //   });
        // });
        // get comment
        this.getComment = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id, cid } = req.params; //post id
                const post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                const commentExists = yield comments_model_1.default.findById(cid);
                if (!commentExists) {
                    return next(new ErrorHandler_1.default(400, "No comment found"));
                }
                let pipeline = new CommentsAggregaion_1.default(null)
                    .matchId(commentExists._id)
                    .structure().pipeline;
                let comment = yield comments_model_1.default.aggregate(pipeline);
                res.json({
                    success: true,
                    comment,
                });
            });
        });
        //  add comment
        //  any authenticated user can add comment
        this.addComment = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                // post id,author id
                const { id } = req.params;
                let { text, parentId } = req.body;
                if (!text) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : comment cannot be empty"));
                }
                if (!parentId) {
                    parentId = null;
                }
                else {
                    let validParentComment = yield comments_model_1.default.findById(parentId);
                    if (!validParentComment) {
                        return next(new ErrorHandler_1.default(404, "invalid parentId"));
                    }
                }
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : post id required"));
                }
                const author = req.body.userID;
                const authorname = req.body.username;
                if (!author || !authorname) {
                    return next(new ErrorHandler_1.default(403, "Invalid resquest : cant do this task"));
                }
                let post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                const postId = post._id;
                const likes = [];
                let newComment = {
                    text,
                    author,
                    authorname,
                    postId,
                    likes,
                    likecount: 0,
                    parentId,
                };
                const comment = yield comments_model_1.default.create(newComment);
                res.status(200).json({
                    success: true,
                    comment,
                });
            });
        });
        //   edit comment
        //   only the author of the comment can edit comment
        this.editComment = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                // id = post id, cid = comment id
                const { id, cid } = req.params;
                let { text } = req.body;
                if (!text) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : comment cannot be empty"));
                }
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : post id required"));
                }
                if (!cid) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : comment id required"));
                }
                // getting from auth middle ware
                const author = req.body.userID;
                const authorname = req.body.username;
                if (!author) {
                    return next(new ErrorHandler_1.default(403, "Invalid resquest : cant do this task"));
                }
                let post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                let comment = yield comments_model_1.default.findById(cid);
                if (!comment) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : comment not found"));
                }
                if (post._id.toString() !== comment.postId.toString()) {
                    return next(new ErrorHandler_1.default(401, "Invalid comment request to update"));
                }
                const commentAuthor = comment.author.toString();
                const requester = author.toString(); //the person who made the request
                if (requester !== commentAuthor) {
                    return next(new ErrorHandler_1.default(403, "Cant edit others comments"));
                }
                comment = yield comments_model_1.default.update(cid, { text });
                res.status(200).json({
                    success: true,
                    comment,
                });
            });
        });
        // remove comment
        // either the author of the comment or the author of the post can delete it
        this.removeComment = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                // id = post id, cid = comment id
                const { id, cid } = req.params;
                if (!id) {
                    return next(new ErrorHandler_1.default(400, "Invalid request : post id required"));
                }
                // getting from auth middle ware
                const author = req.body.userID;
                if (!author) {
                    return next(new ErrorHandler_1.default(403, "Invalid resquest : cant do this task"));
                }
                let post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : post not found"));
                }
                let comment = yield comments_model_1.default.findById(cid);
                if (!comment) {
                    return next(new ErrorHandler_1.default(404, "Invalid request : comment not found"));
                }
                if (post._id.toString() !== comment.postId.toString()) {
                    return next(new ErrorHandler_1.default(401, "Invalid comment request to update"));
                }
                const postAuthor = post.author.toString();
                const commentAuthor = comment.author.toString();
                const requester = author.toString(); //the person who made the request
                if (!(requester === postAuthor || requester === commentAuthor)) {
                    return next(new ErrorHandler_1.default(403, "Cant delete others comments unless the post owners"));
                }
                comment = yield comments_model_1.default.delete(cid);
                res.status(200).json({
                    success: true,
                    comment,
                });
            });
        });
        // add reaction
        this.addReaction = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                // if id and cid is valid
                // if post and comment exists and comment is of that post
                // case 1: author has no likes => add reaction with provided reaction type or default type.
                // case 2: author has like and request has a reaction type => update the reaction type.
                // case 3: auhtor has like and request is made with no reaction type => remove reaction.
                const { id, cid } = req.params;
                let { reactionType } = req.body;
                const author = req.body.userID;
                const authorname = req.body.username;
                if (!id || !cid) {
                    return next(new ErrorHandler_1.default(400, "post id and comment id is required"));
                }
                let post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "post not found"));
                }
                let comment = yield comments_model_1.default.findById(cid);
                if (!comment) {
                    return next(new ErrorHandler_1.default(400, "no comments found"));
                }
                if (comment.postId.toString() !== post._id.toString()) {
                    return next(new ErrorHandler_1.default(400, "invalid request comment doesn't exist on following post"));
                }
                comment = yield comments_model_1.default.findOne({
                    _id: cid,
                    "likes.authorId": author,
                });
                if (comment) {
                    return next(new ErrorHandler_1.default(400, "author has already reacted"));
                }
                if (reactionType) {
                    let isValidType = Object.keys(comments_model_1.LikeTypes).includes(reactionType);
                    if (!isValidType) {
                        return next(new ErrorHandler_1.default(400, "Invalid reaction Type"));
                    }
                }
                else {
                    reactionType = comments_model_1.LikeTypes.love;
                }
                comment = yield comments_model_1.default.partialUpdate({ _id: cid }, {
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
                res.json({ sucess: true, comment, message: `${reactionType} added ` });
            });
        });
        this.updateReaction = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id, cid } = req.params;
                let { reactionType } = req.body;
                const author = req.body.userID;
                if (!id || !cid) {
                    return next(new ErrorHandler_1.default(400, "post id and comment id is required"));
                }
                let post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "post not found"));
                }
                let comment = yield comments_model_1.default.findById(cid);
                if (!comment) {
                    return next(new ErrorHandler_1.default(400, "no comments found"));
                }
                if (comment.postId.toString() !== post._id.toString()) {
                    return next(new ErrorHandler_1.default(400, "invalid request comment doesn't exist on following post"));
                }
                let isValidType = Object.keys(comments_model_1.LikeTypes).includes(reactionType);
                if (!isValidType) {
                    return next(new ErrorHandler_1.default(400, "Invalid reaction Type"));
                }
                comment = yield comments_model_1.default.findOne({
                    _id: cid,
                    "likes.authorId": author,
                });
                if (!comment) {
                    return next(new ErrorHandler_1.default(400, "No reaction found"));
                }
                comment = yield comments_model_1.default.partialUpdate({
                    _id: cid,
                    "likes.authorId": author,
                }, {
                    "likes.$.reactionType": reactionType,
                });
                res.json({ sucess: true, comment, message: `${reactionType} added ` });
            });
        });
        this.removeReaction = (0, catchAsyncErrors_1.default)(function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                const { id, cid } = req.params;
                let { reactionType } = req.body;
                const author = req.body.userID;
                if (!id || !cid) {
                    return next(new ErrorHandler_1.default(400, "post id and comment id is required"));
                }
                let post = yield post_model_1.default.findById(id);
                if (!post) {
                    return next(new ErrorHandler_1.default(400, "post not found"));
                }
                let comment = yield comments_model_1.default.findById(cid);
                if (!comment) {
                    return next(new ErrorHandler_1.default(400, "no comments found"));
                }
                if (comment.postId.toString() !== post._id.toString()) {
                    return next(new ErrorHandler_1.default(400, "invalid request comment doesn't exist on following post"));
                }
                comment = yield comments_model_1.default.findOne({
                    _id: cid,
                    "likes.authorId": author,
                });
                if (!comment) {
                    return next(new ErrorHandler_1.default(400, "No reaction found"));
                }
                comment = yield comments_model_1.default.partialUpdate({ _id: cid }, {
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
                    comment,
                    message: `${reactionType} removed`,
                });
            });
        });
    }
}
exports.default = CommentController;
