"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import router utility
const AppRouter_1 = __importDefault(require("./utils/Router/AppRouter"));
// import middlewares
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const internationalization_middleware_1 = __importDefault(require("./middleware/internationalization.middleware"));
const requestQueryValidators_1 = __importDefault(require("./middleware/requestQueryValidators"));
const validateApiKey_middleware_1 = __importDefault(require("./middleware/validateApiKey.middleware"));
const error_middleware_1 = require("./middleware/error.middleware");
const logger_1 = require("./utils/logger");
// import routes
const defaultRoute_1 = __importDefault(require("./routes/defaultRoute"));
const user_router_1 = __importDefault(require("./routes/user.router"));
const post_router_1 = __importDefault(require("./routes/post.router"));
const comment_router_1 = __importDefault(require("./routes/comment.router"));
class App {
    constructor(database) {
        this.database = database;
        this.app = (0, express_1.default)();
        this.initialzeDatabase();
        this.initializeMiddlewares();
        // this.app.use("/api/v1/documentaion", serve, setup(swaggerDocument));
        this.initializePublicRoutes([defaultRoute_1.default]);
        this.initializePrivateRoutes([user_router_1.default, post_router_1.default, comment_router_1.default]);
        this.initializeErrorHandler();
    }
    initializePrivateRoutes(routeHandlers) {
        routeHandlers.forEach((routes) => {
            const router = AppRouter_1.default.getInstance();
            routes.forEach((route) => {
                const { path, middlewares, controller, method } = route;
                router[method](path, middlewares || [], controller);
            });
            this.app.use("/api/v1", validateApiKey_middleware_1.default, requestQueryValidators_1.default, router);
        });
    }
    initializePublicRoutes(routeHandlers) {
        routeHandlers.forEach((routes) => {
            const router = AppRouter_1.default.getInstance();
            routes.forEach((route) => {
                const { path, middlewares, controller, method } = route;
                router[method](path, middlewares || [], controller);
            });
            this.app.use("/api/v1", router);
        });
    }
    initialzeDatabase() {
        if (this.database) {
            new this.database();
        }
    }
    initializeMiddlewares() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cookie_parser_1.default)());
        this.app.use(internationalization_middleware_1.default.init);
    }
    initializeErrorHandler() {
        this.app.use((0, error_middleware_1.showError)());
    }
    getInstance() {
        return this.app;
    }
    listen(port) {
        const server = this.app.listen(port, () => {
            (0, logger_1.logger)(`server is listening at port ${port}`, logger_1.LogType.success);
        });
        return server;
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map