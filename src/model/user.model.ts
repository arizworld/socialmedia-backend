import mongoose from "mongoose";

export interface UserModel extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  image?: { data: Buffer; url: string };
  resetToken?: string;
  resetTokenExpire?: number;
}

const UserSchema = new mongoose.Schema({
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

const User = mongoose.model<UserModel>("User", UserSchema);
export default User;
