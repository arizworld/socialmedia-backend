"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RouterBudler_1 = __importDefault(require("../utils/Router/RouterBudler"));
const RouterBudler_2 = require("../utils/Router/RouterBudler");
const swagger_json_1 = __importDefault(require("../swagger.json"));
const swagger_ui_express_1 = require("swagger-ui-express");
exports.default = [
    new RouterBudler_1.default("/", RouterBudler_2.HTTPMethods.get, (req, res) => {
        res.send(res.__("hello"));
    }),
    new RouterBudler_1.default("/documentation", RouterBudler_2.HTTPMethods.get, (0, swagger_ui_express_1.setup)(swagger_json_1.default), swagger_ui_express_1.serve),
];
//# sourceMappingURL=defaultRoute.js.map