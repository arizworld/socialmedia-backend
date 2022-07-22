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
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config/config"));
const { domainEmail, domainEmailPassowrd, emailHostServiceProvider } = config_1.default;
const hostname = emailHostServiceProvider;
const username = domainEmail;
const password = domainEmailPassowrd;
const transporter = nodemailer_1.default.createTransport({
    host: hostname,
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: username,
        pass: password,
    },
    logger: true,
});
function sendEMail(mailOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield transporter.sendMail({
            from: username,
            to: mailOptions.email,
            subject: mailOptions.subject,
            text: mailOptions.message,
        });
        return info.response.includes("OK");
    });
}
exports.default = sendEMail;
//# sourceMappingURL=mailer.js.map