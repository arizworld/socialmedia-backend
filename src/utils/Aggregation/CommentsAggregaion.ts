import ApiFeatures from "./ApiFeatures";
import mongoose from "mongoose";
export default class CommentAggregaion extends ApiFeatures {
  constructor(reqQuery: any) {
    super(reqQuery);
  }
  match(id: mongoose.Types.ObjectId) {
    this.pipeline.push({
      $match: {
        postId: id,
      },
    });
    return this;
  }
  structure() {
    this.pipeline.push(
      {
        $match: {
          parentId: null,
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "parentId",
          as: "replies",
        },
      }
    );
    return this;
  }
}
