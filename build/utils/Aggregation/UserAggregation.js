"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiFeatures_1 = __importDefault(require("./ApiFeatures"));
class UserAggregation extends ApiFeatures_1.default {
    constructor(reqQuery) {
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
exports.default = UserAggregation;