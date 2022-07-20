import mongoose, { ObjectId } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { Like, LikeTypes, PostModel, Media } from "../model/post.model";
import catchAsyncErrors from "../utils/error/catchAsyncErrors";
import ErrorHandler from "../utils/error/ErrorHandler";
import PostServices from "../model/post.model";
import UserServices from "../model/user.model";
import PostAggregation from "../utils/Aggregation/PostAggregation";
import CommentServices from "../model/comments.model";

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
      return next(new ErrorHandler(403, "author is required"));
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
      return next(new ErrorHandler(500, "post not created"));
    }
    res.status(200).json({ success: true, post });
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
      return next(new ErrorHandler(400, "Invalid request : post id required"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "Invalid request : post not found"));
    }
    if (post.author.toString() !== author.toString()) {
      return next(new ErrorHandler(403, "Cant update others post"));
    }
    const updatedPost = await PostServices.update(id, {
      title,
      description,
      tags,
      media,
    });
    if (!updatedPost) {
      return next(new ErrorHandler(500, "post not updated"));
    }
    res.status(200).json({ success: true, updatedPost });
  });

  getPost = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "Invalid request : post id required"));
    }
    const postExists = await PostServices.findById(id);
    if (!postExists) {
      return next(new ErrorHandler(404, "Invalid request : post not found"));
    }
    console.log(postExists._id);
    let pipeline = new PostAggregation(null).matchId(postExists._id).pipeline;
    const post = await PostServices.aggregate(pipeline);
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

    let posts: PostModel[] = await PostServices.aggregate(pipeline);
    if (!posts) {
      return next(new ErrorHandler(404, "not post found"));
    }
    res.status(200).json({ success: true, posts });
  });
  getUserSpecificPosts = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "User id Required"));
    }
    let userExists = await UserServices.findById(id);
    if (!userExists) {
      return next(new ErrorHandler(400, "Invalid user id"));
    }
    const pipeline = new PostAggregation(req.query)
      .matchAuthor(userExists._id)
      .search()
      .filterTags()
      .customSort()
      .pagination().pipeline;
    const user = await UserServices.aggregate(pipeline);
    res.status(200).json({ success: true, user: user[0] });
  });

  deletePost = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "Invalid request : post id required"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "Invalid request : post not found"));
    }
    post = await PostServices.delete(id);
    await CommentServices.deleteMany({ postId: post?._id });
    res.status(200).json({ success: true, post });
  });
  streamFile = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "No Id found"));
    }
    const range = req.headers.range || "0";
    mongoose.connection.db
      .collection("uploads.files")
      .findOne({ _id: new mongoose.Types.ObjectId(id) }, (err, file) => {
        if (!file) {
          return next(new ErrorHandler(500, "No File found"));
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
      return next(new ErrorHandler(400, "post id required"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "post not found"));
    }
    post = await PostServices.findOne({
      _id: id,
      "likes.authorId": author,
    });
    if (post) {
      return next(new ErrorHandler(400, "author has already reacted"));
    }
    if (reactionType) {
      let isValidType = Object.keys(LikeTypes).includes(reactionType);
      if (!isValidType) {
        return next(new ErrorHandler(400, "Invalid reaction Type"));
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
    res.json({ sucess: true, post, message: `${reactionType} added ` });
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
      return next(new ErrorHandler(400, "post id  required"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "post not found"));
    }

    let isValidType = Object.keys(LikeTypes).includes(reactionType);
    if (!isValidType) {
      return next(new ErrorHandler(400, "Invalid reaction Type"));
    }
    post = await PostServices.findOne({
      _id: id,
      "likes.authorId": author,
    });
    if (!post) {
      return next(new ErrorHandler(400, "No reaction found"));
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
    res.json({ sucess: true, post, message: `${reactionType} added ` });
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
      return next(new ErrorHandler(400, "post id required"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "post not found"));
    }
    post = await PostServices.findOne({
      _id: id,
      "likes.authorId": author,
    });
    if (!post) {
      return next(new ErrorHandler(400, "No reaction found"));
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
      message: `${reactionType} removed`,
    });
  });
}
