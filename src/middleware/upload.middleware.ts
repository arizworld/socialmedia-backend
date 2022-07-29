import multer from "multer";
import { Request } from "express";

export const upload = multer({
  limits: {
    fileSize: 1000000, // 1000000 Bytes = 1 MB
  },
  fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|JPEG)$/)) {
      // upload only png and jpg format
      return cb(new Error("This format is not supported"));
    }
    cb(null, true);
  },
});
