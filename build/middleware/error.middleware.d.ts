import ErrorHandler from "../utils/error/ErrorHandler";
import { Request, Response, NextFunction } from "express";
export declare const showError: () => (error: ErrorHandler, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
