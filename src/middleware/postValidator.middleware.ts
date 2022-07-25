// Todo
import { Request, Response, NextFunction } from "express";
interface PostBodyPartial {
  title: string;
  description: string;
}

export default function (req: Request, res: Response, next: NextFunction) {
  const { title, description } = req.body as any;
  let postBody: PostBodyPartial = { title, description };
  let key: keyof PostBodyPartial;
  for (key in postBody) {
    if (!postBody[key]) {
      return res.json({
        success: false,
        message: `${key} ${res.__("EMPTY_FIELD")}`,
      });
    }
  }
  if (title.trim().split("").length < 5) {
    return res.json({
      success: false,
      message: res.__("USERNAME_LENGTH"),
    });
  }
  if (title.trim().split("").length > 35) {
    return res.json({
      success: false,
      message: res.__("USERNAME_LENGTH"),
    });
  }
  if (description.trim().split("").length < 150) {
    return res.json({
      success: false,
      message: res.__("USERNAME_LENGTH"),
    });
  }
  if (description.trim().split("").length > 1000) {
    return res.json({
      success: false,
      message: res.__("USERNAME_LENGTH"),
    });
  }
  next();
}
