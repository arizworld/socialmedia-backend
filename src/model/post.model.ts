import mongoose, { Document } from "mongoose";
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
export interface Media {
  mediaRef: mongoose.Schema.Types.ObjectId | null;
  mediaUrl: string | null;
}
export interface PostStructure {
  title: string;
  description: string;
  author: mongoose.Schema.Types.ObjectId;
  authorname: string;
  media: Media[];
  likes: Like[];
  likecount?: number;
  tags?: string[];
}
export interface PostModel extends PostStructure, Document {}

const postSchema: mongoose.Schema = new mongoose.Schema<PostStructure>(
  {
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
      type: mongoose.Schema.Types.ObjectId,
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
          type: mongoose.Schema.Types.ObjectId,
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
    tags: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
});
const Post = mongoose.model<PostModel>("Post", postSchema);
const PostServices = new MongooseService<PostModel, PostStructure>(Post);
export default PostServices;
