/// <reference types="qs" />
import { RequestHandler, Request, Response, NextFunction } from "express";
export declare enum HTTPMethods {
    get = "get",
    post = "post",
    put = "put",
    patch = "patch",
    del = "delete"
}
export declare type Controller = (req: Request, res: Response, next: NextFunction) => void;
export default class RouterBundler {
    path: string;
    method: HTTPMethods;
    controller: Controller;
    middlewares?: RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[] | undefined;
    constructor(path: string, method: HTTPMethods, controller: Controller, middlewares?: RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[] | undefined);
}
