import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";
import { Request } from "express";
import path from "path";
import ErrorHandler from "../utils/ErrorHandler";
const storage = new GridFsStorage({
  url: "mongodb+srv://ArizWorld:Ariz.1234@mycluster.90knz.mongodb.net/socialmedia?retryWrites=true&w=majority",
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