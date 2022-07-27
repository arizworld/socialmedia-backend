import express from "express";
// import router utility
import AppRouter from "./utils/Router/AppRouter";
import RouterBundler from "./utils/Router/RouterBudler";
// import middlewares
import cookieParser from "cookie-parser";
import i18n from "./middleware/internationalization.middleware";
import requestQueryValidators from "./middleware/requestQueryValidators";
import validateApiKey from "./middleware/validateApiKey.middleware";
import { showError } from "./middleware/error.middleware";
import { logger, LogType } from "./utils/logger";
// import database
import DB from "./config/db";
// import routes
import defaultRoute from "./routes/defaultRoute";
import userRoute from "./routes/user.router";
import postRoute from "./routes/post.router";
import commentRoute from "./routes/comment.router";
import swaggerDocument from "./swagger.json";
import { serve, setup } from "swagger-ui-express";

export default class App {
  private app: express.Application;
  constructor(public database?: typeof DB) {
    this.app = express();
    this.initialzeDatabase();
    this.initializeMiddlewares();
    this.app.use("/api/v1/documentaion", serve, setup(swaggerDocument));
    this.initializeRoutes([defaultRoute, userRoute, postRoute, commentRoute]);
    this.initializeErrorHandler();
  }
  private initializeRoutes(routeHandlers: RouterBundler[][]) {
    routeHandlers.forEach((routes) => {
      const router = AppRouter.getInstance();
      routes.forEach((route) => {
        const { path, middlewares, controller, method } = route;
        router[method](path, middlewares || [], controller);
      });
      this.app.use("/api/v1", validateApiKey, requestQueryValidators, router);
    });
  }
  private initialzeDatabase() {
    if (this.database) {
      new this.database();
    }
  }
  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(i18n.init);
  }
  private initializeErrorHandler() {
    this.app.use(showError());
  }
  public getInstance() {
    return this.app;
  }
  public listen(port: number) {
    const server = this.app.listen(port, () => {
      logger(`server is listening at port ${port}`, LogType.success);
    });
    return server;
  }
}
