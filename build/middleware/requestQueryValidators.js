"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(req, res, next) {
    const validQueries = req.method === "GET"
        ? ["apikey", "lt", "page", "srt", "tags", "keyword"]
        : ["apikey"];
    const { query } = req;
    const queryCopy = Object.assign({}, query);
    if (queryCopy.srt && !(queryCopy.srt === "ml" || queryCopy.srt === "mr")) {
        return res.status(400).json({
            success: false,
            message: `${res.__("INVALID_QUERY_SORT")}: ${queryCopy.srt}`,
        });
    }
    validQueries.forEach((q) => delete queryCopy[q]);
    const keys = Object.keys(queryCopy);
    if (keys.length) {
        return res.status(400).json({
            success: false,
            message: `${res.__("INVALID_QUERY_PARAMS")} ${keys.join(",")}`,
        });
    }
    next();
}
exports.default = default_1;
//# sourceMappingURL=requestQueryValidators.js.map