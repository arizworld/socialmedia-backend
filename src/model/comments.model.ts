import mongoose from "mongoose";
import MongooseService from "../services/mongoose.service";

export enum LikeTypes {
  like = "like",
  love = "love",
  haha = "haha",
  care = "care",
  lol = "lol",
}
export interface Like {
  _id?: mongoose.Schema.Types.ObjectId;
  reactionType: LikeTypes;
  authorId: mongoose.Schema.Types.ObjectId;
  authorname: string;
}
export interface CommentStructure {
  text: string;
  author: mongoose.Schema.Types.ObjectId;
  authorname: string;
  postId: mongoose.Schema.Types.ObjectId;
  likes: Like[];
  likecount: Number;
  parentId: mongoose.Schema.Types.ObjectId | null;
}
export interface CommentModel extends CommentStructure, mongoose.Document {}

const commentSchema: mongoose.Schema = new mongoose.Schema<CommentStructure>(
  {
    text: {
      type: String,
      required: [true, "Comments can not be empty"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "author must be there"],
      ref: "User",
    },
    authorname: {
      type: String,
      required: [true, "author must have a name"],
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "post reference must be there"],
      ref: "Post",
    },
    likes: [
      {
        reactionType: String,
        authorId: {
          type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model<CommentModel>("Comment", commentSchema);

const CommentServices = new MongooseService<CommentModel, CommentStructure>(
  Comment
);

export default CommentServices;
