/// <reference types="node" />
import mongoose from "mongoose";
import MongooseService from "../services/mongoose.service";
export interface UserStructure {
    username: string;
    email: string;
    password: string;
    image?: {
        data: Buffer | undefined;
        url: string;
    };
    resetToken?: string;
    resetTokenExpire?: number;
}
export interface UserModel extends UserStructure, mongoose.Document {
    getToken: () => string;
    comparePassword: (password: string) => Promise<boolean>;
    getResetToken: (resetDelay: number) => Promise<string>;
    destroyResetToken: (resetDelay: number) => void;
}
export declare const User: mongoose.Model<UserModel, {}, {}, {}, any>;
declare const UserServices: MongooseService<UserModel, UserStructure>;
export default UserServices;
