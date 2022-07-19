"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    host: process.env.HOST || "localhost",
    port: process.env.PORT || 8080,
    mongoURI: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mycluster.90knz.mongodb.net/ecart?retryWrites=true&w=majority`,
    secretKey: process.env.JWT_SECRET,
    resetDelay: 3 * 60 * 1000,
};
