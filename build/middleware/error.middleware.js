"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showError = void 0;
const showError = () => {
    return (error, req, res, next) => {
        // console.log(error, error.stack);
        const statusCode = error.statusCode ? error.statusCode : 500;
        if (error.name === "CastError") {
            error.message = res.__("CAST_ERROR");
        }
        return res.status(statusCode).json({
            success: false,
            message: res.__(error.messageCode) || error.message,
        });
    };
};
exports.showError = showError;
//# sourceMappingURL=error.middleware.js.map