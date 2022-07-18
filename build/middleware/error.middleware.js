"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showError = void 0;
const showError = () => {
    return (error, req, res, next) => {
        // console.log(error, error.stack);
        const statusCode = error.statusCode ? error.statusCode : 500;
        if (error.name === "CastError") {
            error.message = "Cast Error : Invalid Id format";
        }
        return res.status(statusCode).json({
            success: false,
            message: error.message || error,
        });
    };
};
exports.showError = showError;
