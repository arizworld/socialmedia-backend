import express from "express";
// import router utility
import AppRouter from "./utils/Router/AppRouter";
import RouterBundler from "./utils/Router/RouterBudler";
import swaggerDocument from "./swagger.json";
import { serve, setup } from "swagger-ui-express";
// import middlewares
import cookieParser from "cookie-parser";
import i18n from "./middleware/internationalization.middleware";
import requestQueryValidators from "./middleware/requestQueryValidators";
import validateApiKey from "./middleware/validateApiKey.middleware";
import { showError } from "./middleware/error.middleware";
import { logger, LogType } from "./utils/logger";
import cors from "cors";
// import database
import DB from "./config/db";
// import routes
import defaultRoute from "./routes/defaultRoute";
import userRoute from "./routes/user.router";
import postRoute from "./routes/post.router";
import commentRoute from "./routes/comment.router";
import filesRoute from "./routes/files.router";

export default class App {
  private app: express.Application;
  constructor(public database?: typeof DB) {
    this.app = express();
    this.initialzeDatabase();
    this.initializeMiddlewares();
    this.app.use("/api/v1/documentation", serve, setup(swaggerDocument));
    this.initializePublicRoutes([defaultRoute, filesRoute]);
    this.initializePrivateRoutes([userRoute, postRoute, commentRoute]);
    this.initializeErrorHandler();
  }
  private initializePublicRoutes(routeHandlers: RouterBundler[][]) {
    routeHandlers.forEach((routes) => {
      const router = AppRouter.getInstance();
      routes.forEach((route) => {
        const { path, middlewares, controller, method } = route;
        router[method](path, middlewares || [], controller);
      });
      this.app.use("/api/v1", router);
    });
  }
  private initializePrivateRoutes(routeHandlers: RouterBundler[][]) {
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
      this.database.connect();
    }
  }
  private initializeMiddlewares() {
    this.app.use(cors());
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
