import express, { Request, Response } from "express";
import AppRouter from "./AppRouter";
import RouterBundler from "./RouterBudler";
import { logger, LogType } from "./utils/logger";
import defaultRoute from "./routes/defaultRoute";
import userRoute from "./routes/user.router";
import DB from "./config/db";
import cookieParser from "cookie-parser";
import postRoute from "./routes/post.router";
import commentRoute from "./routes/comment.router";
import { showError } from "./middleware/error.middleware";
export default class App {
  private app: express.Application;
  constructor() {
    this.app = express();
    this.initialzeDatabase();
    this.initializeMiddlewares();
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
      this.app.use(router);
    });
  }
  private initialzeDatabase() {
    new DB();
  }
  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
  }
  private initializeErrorHandler() {
    this.app.use(showError());
  }
  public listen(port: number) {
    const server = this.app.listen(port, () => {
      logger(`server is listening at port ${port}`, LogType.success);
    });
    return server;
  }
}
