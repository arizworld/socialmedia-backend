import CommentServices, {
  CommentStructure,
  Like,
  LikeTypes,
} from "../model/comments.model";
import mongoose, { ObjectId } from "mongoose";
import PostServices from "../model/post.model";
import catchAsyncErrors from "../utils/error/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/error/ErrorHandler";
import CommentAggregation from "../utils/Aggregation/CommentsAggregaion";
export default class CommentController {
  getAllComments = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params; //post id
    const post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "Invalid request : post not found"));
    }
    const pipeline = new CommentAggregation(req.query)
      .match(post._id)
      .structure()
      .customSort()
      .pagination().pipeline;
    const comments = await CommentServices.aggregate(pipeline);
    res.json({
      success: true,
      comments,
    });
  });

  // get comment
  getComment = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id, cid } = req.params; //post id
    const post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "Invalid request : post not found"));
    }
    const commentExists = await CommentServices.findById(cid);
    if (!commentExists) {
      return next(new ErrorHandler(400, "No comment found"));
    }
    let pipeline = new CommentAggregation(null)
      .matchId(commentExists._id)
      .structure().pipeline;
    let comment = await CommentServices.aggregate(pipeline);
    res.json({
      success: true,
      comment,
    });
  });

  //  add comment
  //  any authenticated user can add comment
  addComment = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // post id,author id
    const { id } = req.params;
    let { text, parentId } = req.body;
    if (!text) {
      return next(
        new ErrorHandler(400, "Invalid request : comment cannot be empty")
      );
    }
    if (!parentId) {
      parentId = null;
    } else {
      let validParentComment = await CommentServices.findById(parentId);
      if (!validParentComment) {
        return next(new ErrorHandler(404, "invalid parentId"));
      }
    }

    if (!id) {
      return next(new ErrorHandler(400, "Invalid request : post id required"));
    }
    const author = req.body.userID;
    const authorname = req.body.username;
    if (!author || !authorname) {
      return next(
        new ErrorHandler(403, "Invalid resquest : cant do this task")
      );
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "Invalid request : post not found"));
    }
    const postId = post._id;
    const likes = [] as Like[];
    let newComment: CommentStructure = {
      text,
      author,
      authorname,
      postId,
      likes,
      likecount: 0,
      parentId,
    };
    const comment = await CommentServices.create(newComment);
    res.status(200).json({
      success: true,
      comment,
    });
  });
  //   edit comment
  //   only the author of the comment can edit comment
  editComment = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // id = post id, cid = comment id
    const { id, cid } = req.params;
    let { text } = req.body;
    if (!text) {
      return next(
        new ErrorHandler(400, "Invalid request : comment cannot be empty")
      );
    }
    if (!id) {
      return next(new ErrorHandler(400, "Invalid request : post id required"));
    }
    if (!cid) {
      return next(
        new ErrorHandler(400, "Invalid request : comment id required")
      );
    }
    // getting from auth middle ware
    const author = req.body.userID;
    const authorname = req.body.username;
    if (!author) {
      return next(
        new ErrorHandler(403, "Invalid resquest : cant do this task")
      );
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "Invalid request : post not found"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(404, "Invalid request : comment not found"));
    }
    if (post._id.toString() !== comment.postId.toString()) {
      return next(new ErrorHandler(401, "Invalid comment request to update"));
    }
    const commentAuthor = comment.author.toString();
    const requester = author.toString(); //the person who made the request
    if (requester !== commentAuthor) {
      return next(new ErrorHandler(403, "Cant edit others comments"));
    }
    comment = await CommentServices.update(cid, { text });
    res.status(200).json({
      success: true,
      comment,
    });
  });
  // remove comment
  // either the author of the comment or the author of the post can delete it
  removeComment = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // id = post id, cid = comment id
    const { id, cid } = req.params;
    if (!id) {
      return next(new ErrorHandler(400, "Invalid request : post id required"));
    }
    // getting from auth middle ware
    const author = req.body.userID;
    if (!author) {
      return next(
        new ErrorHandler(403, "Invalid resquest : cant do this task")
      );
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "Invalid request : post not found"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(404, "Invalid request : comment not found"));
    }
    if (post._id.toString() !== comment.postId.toString()) {
      return next(new ErrorHandler(401, "Invalid comment request to update"));
    }
    const postAuthor = post.author.toString();
    const commentAuthor = comment.author.toString();
    const requester = author.toString(); //the person who made the request
    if (!(requester === postAuthor || requester === commentAuthor)) {
      return next(
        new ErrorHandler(
          403,
          "Cant delete others comments unless the post owners"
        )
      );
    }
    comment = await CommentServices.delete(cid);
    await CommentServices.deleteMany({ parentId: comment?._id });
    res.status(200).json({
      success: true,
      comment,
    });
  });

  // add reaction
  addReaction = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
      return next(new ErrorHandler(400, "post id and comment id is required"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "post not found"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(400, "no comments found"));
    }
    if (comment.postId.toString() !== post._id.toString()) {
      return next(
        new ErrorHandler(
          400,
          "invalid request comment doesn't exist on following post"
        )
      );
    }
    comment = await CommentServices.findOne({
      _id: cid,
      "likes.authorId": author,
    });
    if (comment) {
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
    comment = await CommentServices.partialUpdate(
      { _id: cid },
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
    res.json({ sucess: true, comment, message: `${reactionType} added ` });
  });
  updateReaction = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id, cid } = req.params;
    let { reactionType } = req.body;
    const author = req.body.userID;
    if (!id || !cid) {
      return next(new ErrorHandler(400, "post id and comment id is required"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "post not found"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(400, "no comments found"));
    }
    if (comment.postId.toString() !== post._id.toString()) {
      return next(
        new ErrorHandler(
          400,
          "invalid request comment doesn't exist on following post"
        )
      );
    }
    let isValidType = Object.keys(LikeTypes).includes(reactionType);
    if (!isValidType) {
      return next(new ErrorHandler(400, "Invalid reaction Type"));
    }
    comment = await CommentServices.findOne({
      _id: cid,
      "likes.authorId": author,
    });
    if (!comment) {
      return next(new ErrorHandler(400, "No reaction found"));
    }
    comment = await CommentServices.partialUpdate(
      {
        _id: cid,
        "likes.authorId": author,
      },
      {
        "likes.$.reactionType": reactionType,
      }
    );
    res.json({ sucess: true, comment, message: `${reactionType} added ` });
  });
  removeReaction = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id, cid } = req.params;
    let { reactionType } = req.body;
    const author = req.body.userID;
    if (!id || !cid) {
      return next(new ErrorHandler(400, "post id and comment id is required"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "post not found"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(400, "no comments found"));
    }
    if (comment.postId.toString() !== post._id.toString()) {
      return next(
        new ErrorHandler(
          400,
          "invalid request comment doesn't exist on following post"
        )
      );
    }
    comment = await CommentServices.findOne({
      _id: cid,
      "likes.authorId": author,
    });
    if (!comment) {
      return next(new ErrorHandler(400, "No reaction found"));
    }
    comment = await CommentServices.partialUpdate(
      { _id: cid },
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
      comment,
      message: `${reactionType} removed`,
    });
  });
}
