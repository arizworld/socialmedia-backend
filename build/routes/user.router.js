"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = __importDefault(require("../controller/user.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const RouterBudler_1 = __importDefault(require("../RouterBudler"));
const upload_middleware_1 = require("../middleware/upload.middleware");
const RouterBudler_2 = require("../RouterBudler");
const bodyValidator_middleware_1 = __importDefault(require("../middleware/bodyValidator.middleware"));
const user = new user_controller_1.default();
exports.default = [
    new RouterBudler_1.default("/user", RouterBudler_2.HTTPMethods.post, user.signup, [bodyValidator_middleware_1.default]),
    new RouterBudler_1.default("/user/login", RouterBudler_2.HTTPMethods.post, user.login),
    new RouterBudler_1.default("/user/logout", RouterBudler_2.HTTPMethods.post, user.logout, [auth_middleware_1.default]),
    new RouterBudler_1.default("/user", RouterBudler_2.HTTPMethods.del, user.deleteAccount, [auth_middleware_1.default]),
    new RouterBudler_1.default("/user/avatar", RouterBudler_2.HTTPMethods.put, user.setProfilePic, [
        upload_middleware_1.upload.single("avatar"),
        auth_middleware_1.default,
    ]),
    new RouterBudler_1.default("/user/:id/avatar", RouterBudler_2.HTTPMethods.get, user.showProfilePic),
    new RouterBudler_1.default("/user/avatar", RouterBudler_2.HTTPMethods.del, user.removeProfilePic, [
        auth_middleware_1.default,
    ]),
    new RouterBudler_1.default("/user/forgetpassword", RouterBudler_2.HTTPMethods.put, user.forgetPassword),
    new RouterBudler_1.default("/user/resetpassword/:token", RouterBudler_2.HTTPMethods.put, user.resetPassword),
];
