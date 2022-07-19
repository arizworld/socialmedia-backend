import mongoose from "mongoose";
import { logger, LogType } from "../utils/logger";
import config from "./config";
export default class DB {
  private static bucket: any;
  constructor() {
    mongoose
      .connect(
        `mongodb+srv://${config.mongoUsername}:${config.mongoPassword}@mycluster.90knz.mongodb.net/${config.testDb}?retryWrites=true&w=majority`
      )
      .then(() => {
        logger("connected to mongodb", LogType.success);
      });
    let bucket;
    mongoose.connection.on("connected", () => {
      var db = mongoose.connections[0].db;
      bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: "uploads",
      });
      DB.bucket = bucket;
    });
  }
  static getBucket() {
    return DB.bucket;
  }
}
const bucket = DB.getBucket();
export { bucket };
