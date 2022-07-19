"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comment_controller_1 = __importDefault(require("../controller/comment.controller"));
const RouterBudler_1 = __importDefault(require("../RouterBudler"));
const RouterBudler_2 = require("../RouterBudler");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const comment = new comment_controller_1.default();
exports.default = [
    new RouterBudler_1.default("/post/:id/comment/all", RouterBudler_2.HTTPMethods.get, comment.getAllComments),
    new RouterBudler_1.default("/post/:id/comment/:cid", RouterBudler_2.HTTPMethods.get, comment.getComment),
    new RouterBudler_1.default("/post/:id/comment/new", RouterBudler_2.HTTPMethods.post, comment.addComment, [auth_middleware_1.default]),
    new RouterBudler_1.default("/post/:id/comment/:cid", RouterBudler_2.HTTPMethods.put, comment.editComment, [auth_middleware_1.default]),
    new RouterBudler_1.default("/post/:id/comment/:cid", RouterBudler_2.HTTPMethods.del, comment.removeComment, [auth_middleware_1.default]),
    new RouterBudler_1.default("/post/:id/comment/:cid/reaction", RouterBudler_2.HTTPMethods.post, comment.addReaction, [auth_middleware_1.default]),
    new RouterBudler_1.default("/post/:id/comment/:cid/reaction", RouterBudler_2.HTTPMethods.patch, comment.updateReaction, [auth_middleware_1.default]),
    new RouterBudler_1.default("/post/:id/comment/:cid/reaction", RouterBudler_2.HTTPMethods.del, comment.removeReaction, [auth_middleware_1.default]),
];
