"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config/config"));
const ErrorHandler_1 = __importDefault(require("../utils/error/ErrorHandler"));
function default_1(req, res, next) {
    const { apikey } = req.query;
    if (apikey !== config_1.default.apiKey) {
        return next(new ErrorHandler_1.default(403, "INAVLID_API_KEY"));
    }
    next();
}
exports.default = default_1;
//# sourceMappingURL=validateApiKey.middleware.js.map