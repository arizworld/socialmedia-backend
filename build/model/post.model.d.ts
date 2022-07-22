import mongoose, { Document } from "mongoose";
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
export interface PostModel extends PostStructure, Document {
}
declare const PostServices: MongooseService<PostModel, PostStructure>;
export default PostServices;
