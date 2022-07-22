import { Types } from "mongoose";
import ApiFeatures from "./ApiFeatures";
export default class PostAggregation extends ApiFeatures {
    constructor(reqQuery: any);
    matchAuthor(id: Types.ObjectId): this;
    filterTags(): this;
    populateComments(): this;
}
