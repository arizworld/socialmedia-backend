import ApiFeatures from "./ApiFeatures";

export default class UserAggregation extends ApiFeatures {
  constructor(reqQuery: any) {
    super(reqQuery);
  }
  populatePosts() {
    this.pipeline.push({
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "author",
        as: "posts",
      },
    });
    return this;
  }
}
