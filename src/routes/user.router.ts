import UserController from "../controller/user.controller";
import auth from "../middleware/auth.middleware";
import RouterBundler from "../utils/Router/RouterBudler";
import { upload } from "../middleware/upload.middleware";
import { HTTPMethods } from "../utils/Router/RouterBudler";
import bodyValidator from "../middleware/bodyValidator.middleware";
export const user = new UserController();

export default [
  new RouterBundler("/user/all", HTTPMethods.get, user.getAllUsers),
  new RouterBundler("/user/:id", HTTPMethods.get, user.getUser),
  new RouterBundler("/user", HTTPMethods.post, user.signup, [bodyValidator]),
  new RouterBundler("/user/login", HTTPMethods.post, user.login),
  new RouterBundler("/user/logout", HTTPMethods.post, user.logout, [auth]),
  new RouterBundler("/user", HTTPMethods.del, user.deleteAccount, [auth]),
  new RouterBundler("/user/avatar", HTTPMethods.put, user.setProfilePic, [
    upload.single("avatar"),
    auth,
  ]),
  new RouterBundler("/user/avatar", HTTPMethods.del, user.removeProfilePic, [
    auth,
  ]),
  new RouterBundler(
    "/user/forgetpassword",
    HTTPMethods.put,
    user.forgetPassword
  ),
  new RouterBundler(
    "/user/resetpassword/:token",
    HTTPMethods.put,
    user.resetPassword
  ),
];
