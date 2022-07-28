/// <reference types="node" />
import express from "express";
import DB from "./config/db";
export default class App {
    database?: typeof DB | undefined;
    private app;
    constructor(database?: typeof DB | undefined);
    private initializePrivateRoutes;
    private initializePublicRoutes;
    private initialzeDatabase;
    private initializeMiddlewares;
    private initializeErrorHandler;
    getInstance(): express.Application;
    listen(port: number): import("http").Server;
}
