"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_gridfs_storage_1 = require("multer-gridfs-storage");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const storage = new multer_gridfs_storage_1.GridFsStorage({
    url: "mongodb+srv://ArizWorld:Ariz.1234@mycluster.90knz.mongodb.net/socialmedia?retryWrites=true&w=majority",
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            console.log({ file: file });
            const fileTypes = /png|jpg|jpeg|JPEG|webp|gif|mp4|3gp|mkv|flv|mpg|avi|wav/;
            const mimetype = fileTypes.test(file.mimetype);
            const extname = fileTypes.test(path_1.default.extname(file.originalname));
            console.log(mimetype, extname);
            if (mimetype && extname) {
                const filename = file.originalname;
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads",
                };
                return resolve(fileInfo);
            }
            reject(new ErrorHandler_1.default(400, "file type unsupported"));
        });
    },
});
exports.default = (0, multer_1.default)({ storage });
