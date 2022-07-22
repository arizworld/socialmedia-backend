/// <reference types="node" />
export default class App {
    private app;
    constructor();
    private initializeRoutes;
    private initialzeDatabase;
    private initializeMiddlewares;
    private initializeErrorHandler;
    listen(port: number): import("http").Server;
}
