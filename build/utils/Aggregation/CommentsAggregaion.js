"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiFeatures_1 = __importDefault(require("./ApiFeatures"));
class CommentAggregaion extends ApiFeatures_1.default {
    constructor(reqQuery) {
        super(reqQuery);
    }
    match(id) {
        this.pipeline.push({
            $match: {
                postId: id,
            },
        });
        return this;
    }
    structure() {
        this.pipeline.push({
            $match: {
                parentId: null,
            },
        }, {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "parentId",
                as: "replies",
            },
        });
        return this;
    }
}
exports.default = CommentAggregaion;
