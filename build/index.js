"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = __importDefault(require("./App"));
const logger_1 = require("./utils/logger");
const mailer_1 = __importDefault(require("./utils/mailer"));
// uncaught error
process.on("uncaughtException", (err) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.logger)(err.message, logger_1.LogType.failure);
    (0, logger_1.logger)("shutting down the server due to unhandled promise rejection", logger_1.LogType.failure);
    const isSent = yield (0, mailer_1.default)({
        email: "aritrasadhukhan430@gmail.com",
        subject: "server shut down",
        message: `shutting down the server due to uncaught exception ${err.message}`,
    });
    process.exit(1);
}));
const app = new App_1.default();
const server = app.listen(1020);
// unhandled promise rejection
process.on("unhandledRejection", (err) => __awaiter(void 0, void 0, void 0, function* () {
    (0, logger_1.logger)(err.message, logger_1.LogType.failure);
    (0, logger_1.logger)("shutting down the server due to unhandled promise rejection", logger_1.LogType.failure);
    const isSent = yield (0, mailer_1.default)({
        email: "aritrasadhukhan430@gmail.com",
        subject: "server shut down",
        message: `shutting down the server due to unhandled promise rejection ${err.message}`,
    });
    server.close(() => {
        process.exit(1);
    });
}));
