import ApiFeatures from "./ApiFeatures";
import mongoose from "mongoose";
export default class CommentAggregaion extends ApiFeatures {
    constructor(reqQuery: any);
    match(id: mongoose.Types.ObjectId): this;
    structure(): this;
}
