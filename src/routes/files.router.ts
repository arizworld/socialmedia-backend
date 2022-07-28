import RouterBundler from "../utils/Router/RouterBudler";
import { HTTPMethods } from "../utils/Router/RouterBudler";
import { user } from "./user.router";
import { post } from "./post.router";
export default [
  new RouterBundler("/user/:id/avatar", HTTPMethods.get, user.showProfilePic),
  new RouterBundler("/post/:id/media", HTTPMethods.get, post.streamFile),
];
