import mongoose from "mongoose";
import MongooseService from "../services/mongoose.service";
export declare enum LikeTypes {
    like = "like",
    love = "love",
    haha = "haha",
    care = "care",
    lol = "lol"
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
export interface CommentModel extends CommentStructure, mongoose.Document {
}
declare const CommentServices: MongooseService<CommentModel, CommentStructure>;
export default CommentServices;
