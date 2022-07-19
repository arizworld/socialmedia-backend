"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RouterBudler_1 = require("./../RouterBudler");
const post_controller_1 = __importDefault(require("../controller/post.controller"));
const RouterBudler_2 = __importDefault(require("../RouterBudler"));
const fileUpload_middleware_1 = __importDefault(require("../middleware/fileUpload.middleware"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const post = new post_controller_1.default();
exports.default = [
    new RouterBudler_2.default("/post/upload", RouterBudler_1.HTTPMethods.post, post.createPost, [
        fileUpload_middleware_1.default.array("media"),
        auth_middleware_1.default,
    ]),
    new RouterBudler_2.default("/post/:id", RouterBudler_1.HTTPMethods.get, post.getPost),
    new RouterBudler_2.default("/post", RouterBudler_1.HTTPMethods.get, post.getAllPosts),
    new RouterBudler_2.default("/post/:id", RouterBudler_1.HTTPMethods.put, post.updatePost, [
        fileUpload_middleware_1.default.array("media"),
        auth_middleware_1.default,
    ]),
    new RouterBudler_2.default("/post/:id", RouterBudler_1.HTTPMethods.del, post.deletePost),
    new RouterBudler_2.default("/post/:id/media", RouterBudler_1.HTTPMethods.get, post.streamFile),
    new RouterBudler_2.default("/post/:id/reaction", RouterBudler_1.HTTPMethods.post, post.addReaction, [
        auth_middleware_1.default,
    ]),
    new RouterBudler_2.default("/post/:id/reaction", RouterBudler_1.HTTPMethods.patch, post.updateReaction, [auth_middleware_1.default]),
    new RouterBudler_2.default("/post/:id/reaction", RouterBudler_1.HTTPMethods.del, post.removeReaction, [auth_middleware_1.default]),
];
