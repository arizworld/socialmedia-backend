"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RouterBudler_1 = require("../utils/Router/RouterBudler");
const post_controller_1 = __importDefault(require("../controller/post.controller"));
const RouterBudler_2 = __importDefault(require("../utils/Router/RouterBudler"));
const fileUpload_middleware_1 = __importDefault(require("../middleware/fileUpload.middleware"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const postValidator_middleware_1 = __importDefault(require("../middleware/postValidator.middleware"));
const post = new post_controller_1.default();
// auth is used twice because in upload case req.body gets empty=> req.body.userId will be empty
exports.default = [
    new RouterBudler_2.default("/post/new", RouterBudler_1.HTTPMethods.post, post.createPost, [
        auth_middleware_1.default,
        fileUpload_middleware_1.default.array("media"),
        postValidator_middleware_1.default,
        auth_middleware_1.default,
    ]),
    new RouterBudler_2.default("/post/:id", RouterBudler_1.HTTPMethods.get, post.getPost),
    new RouterBudler_2.default("/post", RouterBudler_1.HTTPMethods.get, post.getAllPosts),
    new RouterBudler_2.default("/user/:id/posts", RouterBudler_1.HTTPMethods.get, post.getUserSpecificPosts),
    new RouterBudler_2.default("/post/:id", RouterBudler_1.HTTPMethods.put, post.updatePost, [
        auth_middleware_1.default,
        fileUpload_middleware_1.default.array("media"),
        postValidator_middleware_1.default,
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
//# sourceMappingURL=post.router.js.map