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
    mongoUsername: process.env.MONGO_USERNAME,
    mongoPassword: process.env.MONGO_PASSWORD,
    testDb: "blogposttest",
    productionDb: "blogpost",
    mongoOptions: {
        retryWrites: true,
        w: "majority",
    },
    secretKey: process.env.JWT_SECRET,
    resetDelay: 3 * 60 * 1000,
    ownerEmail: process.env.OWNER_EMAIL,
    domainEmail: process.env.DOMAIN_EMAIL,
    domainEmailPassowrd: process.env.DOMAIN_EMAIL_PASSWORD,
    emailHostServiceProvider: "smtp.gmail.com",
    apiKey: "4fcc807ead48669c976b",
};
