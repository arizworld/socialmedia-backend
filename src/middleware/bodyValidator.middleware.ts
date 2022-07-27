import { Request, Response, NextFunction } from "express";
interface Inputs {
  username: string;
  email: string;
  password: string;
}
export default function (req: Request, res: Response, next: NextFunction) {
  const { username, email, password } = req.body;
  let inputs: Inputs = { username, email, password };
  let key: keyof Inputs;
  for (key in inputs) {
    if (!inputs[key]) {
      return res.status(400).json({
        success: false,
        message: `${key} ${res.__("EMPTY_FIELD")}`,
      });
    }
  }
  if (username.trim().split("").length < 3) {
    return res.status(400).json({
      success: false,
      message: res.__("USERNAME_LENGTH"),
    });
  }
  if (password.trim().split("").length < 5) {
    return res.status(400).json({
      success: false,
      message: res.__("PASSWORD_LENGTH"),
    });
  }
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!regex.test(email)) {
    return res.status(400).json({
      success: false,
      message: res.__("WRONG_EMAIL_FORMAT"),
    });
  }
  next();
}
