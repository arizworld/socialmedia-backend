import { HTTPMethods } from "../utils/Router/RouterBudler";
import PostController from "../controller/post.controller";
import RouterBundler from "../utils/Router/RouterBudler";
import fileUpload from "../middleware/fileUpload.middleware";
import auth from "../middleware/auth.middleware";
import postValidator from "../middleware/postValidator.middleware";
const post = new PostController();
// auth is used twice because in upload case req.body gets empty=> req.body.userId will be empty
export default [
  new RouterBundler("/post/new", HTTPMethods.post, post.createPost, [
    auth,
    fileUpload.array("media"),
    postValidator,
    auth,
  ]),
  new RouterBundler("/post/:id", HTTPMethods.get, post.getPost),
  new RouterBundler("/post", HTTPMethods.get, post.getAllPosts),
  new RouterBundler(
    "/user/:id/posts",
    HTTPMethods.get,
    post.getUserSpecificPosts
  ),
  new RouterBundler("/post/:id", HTTPMethods.put, post.updatePost, [
    auth,
    fileUpload.array("media"),
    postValidator,
    auth,
  ]),
  new RouterBundler("/post/:id", HTTPMethods.del, post.deletePost),

  new RouterBundler("/post/:id/media", HTTPMethods.get, post.streamFile),

  new RouterBundler("/post/:id/reaction", HTTPMethods.post, post.addReaction, [
    auth,
  ]),
  new RouterBundler(
    "/post/:id/reaction",
    HTTPMethods.patch,
    post.updateReaction,
    [auth]
  ),
  new RouterBundler(
    "/post/:id/reaction",
    HTTPMethods.del,
    post.removeReaction,
    [auth]
  ),
];
