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
      return res.json({ success: false, message: `${key} cannot be empty` });
    }
  }
  if (username.trim().split("").length < 3) {
    return res.json({
      success: false,
      message: `username must be 3 characters long `,
    });
  }
  if (password.trim().split("").length < 5) {
    return res.json({
      success: false,
      message: `password must be 5 characters long `,
    });
  }
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!regex.test(email)) {
    return res.json({
      success: false,
      message: `email must be a email `,
    });
  }
  next();
}
