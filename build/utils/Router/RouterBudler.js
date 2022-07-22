"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPMethods = void 0;
var HTTPMethods;
(function (HTTPMethods) {
    HTTPMethods["get"] = "get";
    HTTPMethods["post"] = "post";
    HTTPMethods["put"] = "put";
    HTTPMethods["patch"] = "patch";
    HTTPMethods["del"] = "delete";
})(HTTPMethods = exports.HTTPMethods || (exports.HTTPMethods = {}));
class RouterBundler {
    constructor(path, method, controller, middlewares) {
        this.path = path;
        this.method = method;
        this.controller = controller;
        this.middlewares = middlewares;
    }
}
exports.default = RouterBundler;
//# sourceMappingURL=RouterBudler.js.map