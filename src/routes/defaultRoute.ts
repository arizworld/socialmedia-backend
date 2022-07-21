import RouterBundler from "../utils/Router/RouterBudler";
import { Request, Response } from "express";
import { HTTPMethods } from "../utils/Router/RouterBudler";
export default [
  new RouterBundler("/", HTTPMethods.get, (req: Request, res: Response) => {
    res.send(res.__("hello"));
  }),
];
