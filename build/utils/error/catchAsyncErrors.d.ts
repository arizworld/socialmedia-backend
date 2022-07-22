import { Request, Response, NextFunction } from "express";
export default function catchAsyncErrors(fn: (req: Request, res: Response, next: NextFunction) => void): (req: Request, res: Response, next: NextFunction) => void;
