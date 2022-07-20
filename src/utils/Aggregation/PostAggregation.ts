import { Types } from "mongoose";
import ApiFeatures from "./ApiFeatures";

export default class PostAggregation extends ApiFeatures {
  constructor(reqQuery: any) {
    super(reqQuery);
  }
  matchAuthor(id: Types.ObjectId) {
    this.pipeline.push({
      $match: {
        author: id,
      },
    });
    return this;
  }
  filterTags() {
    if (this.reqQuery.tags) {
      const tags = this.reqQuery.tags;
      this.pipeline.push({
        $match: {
          $expr: {
            $in: [tags, "$tags"],
          },
        },
      });
    }
    return this;
  }
  populateComments() {
    this.pipeline.push({
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
      },
    });
    return this;
  }
}
