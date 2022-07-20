"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class AppRouter {
    static getInstance() {
        if (!this.instance) {
            this.instance = (0, express_1.Router)();
        }
        return this.instance;
    }
}
exports.default = AppRouter;
