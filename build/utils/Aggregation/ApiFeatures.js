"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiFeatures {
    constructor(reqQuery) {
        this.pipeline = [];
        this.reqQuery = reqQuery;
    }
    matchId(id) {
        this.pipeline.push({
            $match: {
                _id: id,
            },
        });
        return this;
    }
    search() {
        // special behaviour(s)
        if (this.reqQuery.keyword) {
            this.pipeline.push({
                $match: {
                    $or: [
                        {
                            title: {
                                $regex: this.reqQuery.keyword,
                                $options: "i",
                            },
                        },
                        {
                            description: {
                                $regex: this.reqQuery.keyword,
                                $options: "i",
                            },
                        },
                    ],
                },
            });
            return this;
        }
        // default behaviour
        this.pipeline.push({
            $match: {
                _id: {
                    $exists: true,
                },
            },
        });
        return this;
    }
    customSort() {
        // ml => most liked
        if (this.reqQuery.srt === "ml") {
            this.pipeline.push({
                $addFields: {
                    likecount: { $size: "$likes" },
                },
            }, {
                $sort: {
                    likecount: -1,
                },
            });
            return this;
        }
        // mr = most recent
        if (this.reqQuery.srt === "mr") {
            this.pipeline.push({
                $sort: {
                    updatedAt: -1,
                },
            });
            return this;
        }
        return this;
    }
    pagination() {
        const requestPerPage = Number(this.reqQuery.lt) || 5;
        const current = Number(this.reqQuery.page) || 1;
        const skip = (current - 1) * requestPerPage;
        this.pipeline.push({
            $facet: {
                Results: [
                    {
                        $skip: skip,
                    },
                    {
                        $limit: requestPerPage,
                    },
                ],
                totalResult: [{ $count: "count" }],
            },
        });
        return this;
    }
}
exports.default = ApiFeatures;
//# sourceMappingURL=ApiFeatures.js.map