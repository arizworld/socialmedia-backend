import mongoose from "mongoose";
export default abstract class ApiFeatures {
    pipeline: any;
    reqQuery: any;
    constructor(reqQuery: any);
    matchId(id: mongoose.Types.ObjectId): this;
    search(): this;
    customSort(): this;
    pagination(): this;
}
