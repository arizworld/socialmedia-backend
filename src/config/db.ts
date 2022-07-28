import mongoose from "mongoose";
import { logger, LogType } from "../utils/logger";
import config from "./config";
export default class DB {
  static connect() {
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
    });
  }
}
