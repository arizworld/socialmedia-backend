import mongoose, { ObjectId } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { Like, LikeTypes, Media } from "../model/post.model";
// import error handlers
import catchAsyncErrors from "../utils/error/catchAsyncErrors";
import ErrorHandler from "../utils/error/ErrorHandler";

// import Services
import PostServices from "../model/post.model";
import UserServices from "../model/user.model";
import CommentServices from "../model/comments.model";
import PostAggregation from "../utils/Aggregation/PostAggregation";

interface CustomFileType extends Express.Multer.File {
  id: ObjectId;
}
export default class PostController {
  createPost = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const files = req.files as CustomFileType[] | undefined;
    const media: Media[] = [];
    if (files) {
      files.forEach((file) => {
        media.push({
          mediaRef: file.id,
          mediaUrl: `${req.protocol}://${req.get(
            "host"
          )}/post/${file.id.toString()}/media`,
        });
      });
    }
    const title = req.body.title;
    const description = req.body.description;
    const author = req.body.userID;
    const authorname = req.body.username;
    const tags = req.body.tags || [];
    const likes: Like[] = [];
    if (!author || !authorname) {
      return next(new ErrorHandler(403, "AUTHENTICATION_REQUIRED"));
    }
    const post = await PostServices.create({
      title,
      description,
      author,
      authorname,
      media,
      tags,
      likes,
    });
    if (!post) {
      return next(new ErrorHandler(500, "POST_NOT_CREATED"));
    }
    res
      .status(200)
      .json({ success: true, post, message: res.__("POST_CREATED") });
  });

  updatePost = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const files = req.files as CustomFileType[] | undefined;
    const media: Media[] = [];
    if (files) {
      files.forEach((file) => {
        media.push({
          mediaRef: file.id,
          mediaUrl: `${req.protocol}://${req.get(
            "host"
          )}/post/${file.id.toString()}/media`,
        });
      });
    }
    const title = req.body.title;
    const description = req.body.description;
    const author = req.body.userID;
    const tags = req.body.tags || [];
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_REQUEST"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "POST_NOT_FOUND"));
    }
    // cant update others post
    if (post.author.toString() !== author.toString()) {
      return next(new ErrorHandler(403, "FORBIDDEN"));
    }
    const updatedPost = await PostServices.update(id, {
      title,
      description,
      tags,
      media,
    });
    if (!updatedPost) {
      return next(new ErrorHandler(500, "POST_UPDATE_FAILURE"));
    }
    res.status(200).json({
      success: true,
      updatedPost,
      message: res.__("POST_UPDATE_SUCCESS"),
    });
  });

  getPost = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_REQUEST"));
    }
    const post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "POST_NOT_FOUND"));
    }
    res.status(200).json({ success: true, post });
  });
  getAllPosts = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const pipeline = new PostAggregation(req.query)
      .search()
      .filterTags()
      .customSort()
      .pagination().pipeline;

    const data = await PostServices.aggregate(pipeline);
    res.status(200).json({ success: true, data });
  });
  getUserSpecificPosts = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_REQUEST"));
    }
    let user = await UserServices.findById(id);
    if (!user) {
      return next(new ErrorHandler(400, "USER_NOT_FOUND"));
    }
    const pipeline = new PostAggregation(req.query)
      .matchAuthor(user._id)
      .search()
      .filterTags()
      .customSort()
      .pagination().pipeline;
    const data = await PostServices.aggregate(pipeline);
    res.status(200).json({ success: true, data: data });
  });

  deletePost = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_REQUEST"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "POST_NOT_FOUND"));
    }
    post = await PostServices.delete(id);
    await CommentServices.deleteMany({ postId: post?._id });
    res
      .status(200)
      .json({ success: true, post, message: res.__("POST_DELETE_SUCCESS") });
  });
  streamFile = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_REQUEST"));
    }
    const range = req.headers.range || "0";
    mongoose.connection.db
      .collection("uploads.files")
      .findOne({ _id: new mongoose.Types.ObjectId(id) }, (err, file) => {
        if (err) {
          return next(new ErrorHandler(500, "UNKNOWN_ERROR"));
        }
        if (!file) {
          return next(new ErrorHandler(500, "FILE_NOT_FOUND"));
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
        res.set({ ...headers });
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: "uploads",
        });
        const downloadStream = bucket.openDownloadStreamByName(file.filename, {
          start,
        });
        downloadStream.pipe(res);
        downloadStream.on("error", (err) => {
          return next(new ErrorHandler(500, err.message));
        });
      });
  });

  addReaction = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    let { reactionType } = req.body;
    const author = req.body.userID;
    const authorname = req.body.username;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_REQUEST"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "POST_NOT_FOUND"));
    }
    post = await PostServices.findOne({
      _id: id,
      "likes.authorId": author,
    });
    if (post) {
      return next(new ErrorHandler(400, "REACTION_EXISTS"));
    }
    if (reactionType) {
      let isValidType = Object.keys(LikeTypes).includes(reactionType);
      if (!isValidType) {
        return next(new ErrorHandler(400, "INVALID_REACTION_TYPE"));
      }
    } else {
      reactionType = LikeTypes.love;
    }
    post = await PostServices.partialUpdate(
      { _id: id },
      {
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
      }
    );
    res.json({
      sucess: true,
      post,
      message: `${reactionType} ${res.__("REACTION_ADDED")} `,
    });
  });
  updateReaction = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    let { reactionType } = req.body;
    const author = req.body.userID;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_REQUEST"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "POST_NOT_FOUND"));
    }

    let isValidType = Object.keys(LikeTypes).includes(reactionType);
    if (!isValidType) {
      return next(new ErrorHandler(400, "INVALID_REACTION_TYPE"));
    }
    post = await PostServices.findOne({
      _id: id,
      "likes.authorId": author,
    });
    if (!post) {
      return next(new ErrorHandler(400, "REACTION_NOT_FOUND"));
    }
    post = await PostServices.partialUpdate(
      {
        _id: id,
        "likes.authorId": author,
      },
      {
        "likes.$.reactionType": reactionType,
      }
    );
    res.json({
      sucess: true,
      post,
      message: `${reactionType} ${res.__("REACTION_ADDED")} `,
    });
  });
  removeReaction = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    let { reactionType } = req.body;
    const author = req.body.userID;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_REQUEST"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "POST_NOT_FOUND"));
    }
    post = await PostServices.findOne({
      _id: id,
      "likes.authorId": author,
    });
    if (!post) {
      return next(new ErrorHandler(400, "REACTION_NOT_FOUND"));
    }
    post = await PostServices.partialUpdate(
      { _id: id },
      {
        $pull: {
          likes: {
            authorId: author,
          },
        },
        $inc: {
          likecount: -1,
        },
      }
    );
    res.json({
      success: true,
      post,
      message: `${reactionType} ${res.__("REACTION_REMOVED")}`,
    });
  });
}
