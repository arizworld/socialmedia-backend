import { RequestHandler, Request, Response, NextFunction } from "express";
export enum HTTPMethods {
  get = "get",
  post = "post",
  put = "put",
  patch = "patch",
  del = "delete",
}

export type Controller = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export default class RouterBundler {
  constructor(
    public path: string,
    public method: HTTPMethods,
    public controller: Controller,
    public middlewares?: RequestHandler[]
  ) {}
}
