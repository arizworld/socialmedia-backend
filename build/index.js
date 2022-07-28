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
exports.app = void 0;
const App_1 = __importDefault(require("./App"));
const config_1 = __importDefault(require("./config/config"));
const db_1 = __importDefault(require("./config/db"));
const logger_1 = require("./utils/logger");
const mailer_1 = __importDefault(require("./utils/mailer"));
// uncaught error
process.on("uncaughtException", (err) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    (0, logger_1.logger)(`${err.name +
        "  " +
        err.message +
        "  " +
        ((_a = err.stack) === null || _a === void 0 ? void 0 : _a.slice(err.stack.indexOf("at"), err.stack.indexOf(")")))}`, logger_1.LogType.failure);
    (0, logger_1.logger)("shutting down the server due to unhandled promise rejection", logger_1.LogType.failure);
    const isSent = yield (0, mailer_1.default)({
        email: config_1.default.ownerEmail,
        subject: "server shut down",
        message: `shutting down the server due to uncaught exception ${err.name +
            "  " +
            err.message +
            "  " +
            ((_b = err.stack) === null || _b === void 0 ? void 0 : _b.slice(err.stack.indexOf("at"), err.stack.indexOf(")")))}`,
    });
    process.exit(1);
}));
exports.app = new App_1.default(db_1.default);
const server = exports.app.listen(1020);
// unhandled promise rejection
process.on("unhandledRejection", (err) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    (0, logger_1.logger)(err.message, logger_1.LogType.failure);
    (0, logger_1.logger)("shutting down the server due to unhandled promise rejection", logger_1.LogType.failure);
    const isSent = yield (0, mailer_1.default)({
        email: config_1.default.ownerEmail,
        subject: "server shut down",
        message: `shutting down the server due to unhandled promise rejection ${err.name +
            "  " +
            err.message +
            "  " +
            ((_c = err.stack) === null || _c === void 0 ? void 0 : _c.slice(err.stack.indexOf("at"), err.stack.indexOf(")")))}`,
    });
    server.close(() => {
        process.exit(1);
    });
}));
//# sourceMappingURL=index.js.map