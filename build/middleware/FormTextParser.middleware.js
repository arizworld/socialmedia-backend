"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.Formidable = void 0;
const express_formidable_1 = __importDefault(require("express-formidable"));
exports.Formidable = express_formidable_1.default;
const options = {
    encoding: "utf-8",
    multiples: true, // req.files to be arrays of files
};
exports.options = options;
