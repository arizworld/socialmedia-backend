import CommentServices, {
  CommentStructure,
  Like,
  LikeTypes,
} from "../model/comments.model";
import { Request, Response, NextFunction } from "express";
// import error handlers
import catchAsyncErrors from "../utils/error/catchAsyncErrors";
import ErrorHandler from "../utils/error/ErrorHandler";
// import services
import PostServices from "../model/post.model";
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
      return next(new ErrorHandler(404, "POST_NOT_FOUND"));
    }
    const pipeline = new CommentAggregation(req.query)
      .match(post._id)
      .structure()
      .customSort()
      .pagination().pipeline;
    const data = await CommentServices.aggregate(pipeline);
    res.json({
      success: true,
      data,
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
      return next(new ErrorHandler(404, "POST_NOT_FOUND"));
    }
    const commentExists = await CommentServices.findById(cid);
    if (!commentExists) {
      return next(new ErrorHandler(400, "COMMENT_NOT_FOUND"));
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
      return next(new ErrorHandler(400, "COMMENT_EMPTY"));
    }
    if (!parentId) {
      parentId = null;
    } else {
      let validParentComment = await CommentServices.findById(parentId);
      if (!validParentComment) {
        return next(new ErrorHandler(404, "INVALID_PARENT_COMMENT"));
      }
    }

    if (!id) {
      return next(new ErrorHandler(400, "INVALID_POST_ID"));
    }
    const author = req.body.userID;
    const authorname = req.body.username;
    if (!author || !authorname) {
      return next(new ErrorHandler(403, "FORBIDDEN"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "POST_NOT_FOUND"));
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
      message: res.__("COMMENT_CREATED"),
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
      return next(new ErrorHandler(400, "COMMENT_EMPTY"));
    }
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_POST_ID"));
    }
    if (!cid) {
      return next(new ErrorHandler(400, "INVALID_COMMENT_ID"));
    }
    // getting from auth middle ware
    const author = req.body.userID;
    const authorname = req.body.username;
    if (!author) {
      return next(new ErrorHandler(403, "FORBIDDEN"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "POST_NOT_FOUND"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(404, "COMMENT_NOT_FOUND"));
    }
    if (post._id.toString() !== comment.postId.toString()) {
      return next(new ErrorHandler(403, "FORBIDDEN"));
    }
    const commentAuthor = comment.author.toString();
    const requester = author.toString(); //the person who made the request
    if (requester !== commentAuthor) {
      return next(new ErrorHandler(403, "FORBIDDEN"));
    }
    comment = await CommentServices.update(cid, { text });
    res.status(200).json({
      success: true,
      comment,
      message: res.__("COMMENT_UPDATE_SUCCESS"),
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
      return next(new ErrorHandler(400, "INVALID_POST_ID"));
    }
    // getting from auth middle ware
    const author = req.body.userID;
    if (!author) {
      return next(new ErrorHandler(403, "FORBIDDEN"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(404, "POST_NOT_FOUND"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(404, "COMMENT_NOT_FOUND"));
    }
    if (post._id.toString() !== comment.postId.toString()) {
      return next(new ErrorHandler(401, "FORBIDDEN"));
    }
    const postAuthor = post.author.toString();
    const commentAuthor = comment.author.toString();
    const requester = author.toString(); //the person who made the request
    if (!(requester === postAuthor || requester === commentAuthor)) {
      return next(new ErrorHandler(403, "FORBIDDEN"));
    }
    comment = await CommentServices.delete(cid);
    await CommentServices.deleteMany({ parentId: comment?._id });
    res.status(200).json({
      success: true,
      comment,
      message: res.__("COMMENT_DELETE_SUCCESS"),
    });
  });

  // add reaction
  addReaction = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id, cid } = req.params;
    let { reactionType } = req.body;
    const author = req.body.userID;
    const authorname = req.body.username;
    if (!id || !cid) {
      return next(new ErrorHandler(400, "INVALID_POST_ID"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "POST_NOT_FOUND"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(400, "COMMENT_NOT_FOUND"));
    }
    if (comment.postId.toString() !== post._id.toString()) {
      return next(new ErrorHandler(400, "COMMENT_NOT_FOUND"));
    }
    comment = await CommentServices.findOne({
      _id: cid,
      "likes.authorId": author,
    });
    if (comment) {
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
    res.json({
      sucess: true,
      comment,
      message: `${reactionType} ${res.__("REACTION_ADDED")} `,
    });
  });
  updateReaction = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id, cid } = req.params;
    let { reactionType } = req.body;
    const author = req.body.userID;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_POST_ID"));
    }
    if (!cid) {
      return next(new ErrorHandler(400, "INVALID_COMMENT_ID"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "POST_NOT_FOUND"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(400, "COMMENT_NOT_FOUND"));
    }
    if (comment.postId.toString() !== post._id.toString()) {
      return next(new ErrorHandler(400, "COMMENT_NOT_FOUND"));
    }
    let isValidType = Object.keys(LikeTypes).includes(reactionType);
    if (!isValidType) {
      return next(new ErrorHandler(400, "INVALID_REACTION_TYPE"));
    }
    comment = await CommentServices.findOne({
      _id: cid,
      "likes.authorId": author,
    });
    if (!comment) {
      return next(new ErrorHandler(400, "REACTION_NOT_FOUND"));
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
    res.json({
      sucess: true,
      comment,
      message: `${reactionType} ${res.__("REACTION_ADDED")} `,
    });
  });
  removeReaction = catchAsyncErrors(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id, cid } = req.params;
    let { reactionType } = req.body;
    const author = req.body.userID;
    if (!id) {
      return next(new ErrorHandler(400, "INVALID_POST_ID"));
    }
    if (!cid) {
      return next(new ErrorHandler(400, "INVALID_COMMENT_ID"));
    }
    let post = await PostServices.findById(id);
    if (!post) {
      return next(new ErrorHandler(400, "POST_NOT_FOUND"));
    }
    let comment = await CommentServices.findById(cid);
    if (!comment) {
      return next(new ErrorHandler(400, "COMMENT_NOT_FOUND"));
    }
    if (comment.postId.toString() !== post._id.toString()) {
      return next(new ErrorHandler(400, "COMMENT_NOT_FOUND"));
    }
    comment = await CommentServices.findOne({
      _id: cid,
      "likes.authorId": author,
    });
    if (!comment) {
      return next(new ErrorHandler(400, "REACTION_NOT_FOUND"));
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
      message: `${reactionType} ${res.__("REACTION_REMOVED")}`,
    });
  });
}
