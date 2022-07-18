import RouterBundler from "../RouterBudler";
import { Request,Response } from "express";
import { HTTPMethods } from "../RouterBudler";
export default [
    new RouterBundler('/',HTTPMethods.get,(req:Request,res:Response)=>{
        res.send('hello Server');
    })
]