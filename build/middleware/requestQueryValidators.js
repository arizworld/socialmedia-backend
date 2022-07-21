"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorHandler_1 = __importDefault(require("../utils/error/ErrorHandler"));
function default_1(req, res, next) {
    const validQueries = req.method === "GET"
        ? ["apikey", "lt", "page", "srt", "tags", "keyword"]
        : ["apikey"];
    const { query } = req;
    const queryCopy = Object.assign({}, query);
    if (queryCopy.srt && !(queryCopy.srt === "ml" || queryCopy.srt === "mr")) {
        return next(new ErrorHandler_1.default(400, "", `Invalid value for srt: ${queryCopy.srt}`));
    }
    validQueries.forEach((q) => delete queryCopy[q]);
    const keys = Object.keys(queryCopy);
    if (keys.length) {
        return next(new ErrorHandler_1.default(400, "", `Invalid query parameters : ${keys.join(",")}`));
    }
    next();
}
exports.default = default_1;
