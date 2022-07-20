import express,{Router} from 'express'

export default class AppRouter{
    private static instance: express.Router;
    static getInstance(){
        if(!this.instance){
            this.instance = Router();
        }
        return this.instance;
    }
}