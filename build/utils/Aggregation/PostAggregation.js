"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiFeatures_1 = __importDefault(require("./ApiFeatures"));
class PostAggregation extends ApiFeatures_1.default {
    constructor(reqQuery) {
        super(reqQuery);
    }
    matchAuthor(id) {
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
exports.default = PostAggregation;
//# sourceMappingURL=PostAggregation.js.map