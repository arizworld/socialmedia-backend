import mongoose, { CallbackError } from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/config";
import MongooseService from "../services/mongoose.service";
export interface UserStructure {
  username: string;
  email: string;
  password: string;
  image?: { data: Buffer | undefined; url: string };
  resetToken?: string;
  resetTokenExpire?: number;
}
export interface UserModel extends UserStructure, mongoose.Document {
  getToken: () => string;
  comparePassword: (password: string) => Promise<boolean>;
  getResetToken: (resetDelay: number) => Promise<string>;
  destroyResetToken: (resetDelay: number) => void;
}

const userSchema: mongoose.Schema = new mongoose.Schema<UserModel>({
  username: {
    type: String,
    required: [true, "please provide name"],
  },
  email: {
    type: String,
    required: [true, "please provide email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "please provide password"],
  },
  image: {
    data: {
      type: Buffer,
    },
    url: {
      type: String,
    },
  },
  resetToken: String,
  resetTokenExpire: Number,
});

userSchema.pre<UserModel>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error: any) {
    return next(error);
  }
});
userSchema.methods.getToken = function () {
  return JWT.sign({ id: this._id }, config.secretKey);
};
userSchema.methods.getResetToken = async function (resetDelay: number) {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpire = Date.now() + resetDelay;
  await this.save();
  return resetToken;
};
userSchema.methods.destroyResetToken = async function (resetDelay: number) {
  const userRef = this;
  setTimeout(async function () {
    userRef.resetToken = undefined;
    userRef.resetTokenExpire = undefined;
    await userRef.save();
  }, resetDelay);
};
userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};
const User = mongoose.model<UserModel>("User", userSchema);
const UserServices = new MongooseService<UserModel, UserStructure>(User);
export default UserServices;
