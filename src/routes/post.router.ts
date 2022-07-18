import { HTTPMethods } from "./../RouterBudler";
import PostController from "../controller/post.controller";
import RouterBundler from "../RouterBudler";
import fileUpload from "../middleware/fileUpload.middleware";
import auth from "../middleware/auth.middleware";
const post = new PostController();
export default [
  new RouterBundler("/post/upload", HTTPMethods.post, post.createPost, [
    fileUpload.array("media"),
    auth,
  ]),
  new RouterBundler("/post/:id", HTTPMethods.get, post.getPost),
  new RouterBundler("/post", HTTPMethods.get, post.getAllPosts),
  new RouterBundler("/post/:id", HTTPMethods.put, post.updatePost, [
    fileUpload.array("media"),
    auth,
  ]),
  new RouterBundler("/post/:id", HTTPMethods.del, post.deletePost),

  new RouterBundler("/post/:id/media", HTTPMethods.get, post.streamFile),
];
