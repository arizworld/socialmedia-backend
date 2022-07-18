"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RouterBudler_1 = __importDefault(require("../RouterBudler"));
const RouterBudler_2 = require("../RouterBudler");
exports.default = [
    new RouterBudler_1.default('/', RouterBudler_2.HTTPMethods.get, (req, res) => {
        res.send('hello Server');
    })
];
