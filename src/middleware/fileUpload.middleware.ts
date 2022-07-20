import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";
import { Request } from "express";
import path from "path";
import config from "../config/config";
import ErrorHandler from "../utils/error/ErrorHandler";
const storage = new GridFsStorage({
  url: `mongodb+srv://${config.mongoUsername}:${config.mongoPassword}@mycluster.90knz.mongodb.net/${config.testDb}?retryWrites=true&w=majority`,
  file: (req: Request, file) => {
    return new Promise((resolve, reject) => {
      console.log({ file: file });
      const fileTypes =
        /png|jpg|jpeg|JPEG|webp|gif|mp4|3gp|mkv|flv|mpg|avi|wav/;
      const mimetype = fileTypes.test(file.mimetype);
      const extname = fileTypes.test(path.extname(file.originalname));
      console.log(mimetype, extname);
      if (mimetype && extname) {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        return resolve(fileInfo);
      }
      reject(new ErrorHandler(400, "file type unsupported"));
    });
  },
});

export default multer({ storage });
