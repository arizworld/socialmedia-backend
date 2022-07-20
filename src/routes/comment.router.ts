import CommentController from "../controller/comment.controller";
import RouterBundler from "../utils/Router/RouterBudler";
import { HTTPMethods } from "../utils/Router/RouterBudler";
import auth from "../middleware/auth.middleware";
const comment = new CommentController();
export default [
  new RouterBundler(
    "/post/:id/comment/all",
    HTTPMethods.get,
    comment.getAllComments
  ),
  new RouterBundler(
    "/post/:id/comment/:cid",
    HTTPMethods.get,
    comment.getComment
  ),
  new RouterBundler(
    "/post/:id/comment/new",
    HTTPMethods.post,
    comment.addComment,
    [auth]
  ),
  new RouterBundler(
    "/post/:id/comment/:cid",
    HTTPMethods.put,
    comment.editComment,
    [auth]
  ),
  new RouterBundler(
    "/post/:id/comment/:cid",
    HTTPMethods.del,
    comment.removeComment,
    [auth]
  ),
  new RouterBundler(
    "/post/:id/comment/:cid/reaction",
    HTTPMethods.post,
    comment.addReaction,
    [auth]
  ),
  new RouterBundler(
    "/post/:id/comment/:cid/reaction",
    HTTPMethods.patch,
    comment.updateReaction,
    [auth]
  ),
  new RouterBundler(
    "/post/:id/comment/:cid/reaction",
    HTTPMethods.del,
    comment.removeReaction,
    [auth]
  ),
];
