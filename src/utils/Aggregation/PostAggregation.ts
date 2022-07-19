import ApiFeatures from "./ApiFeatures";

export default class PostAggregation extends ApiFeatures {
  constructor(reqQuery: any) {
    super(reqQuery);
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
