"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(req, res, next) {
    const { title, description } = req.body;
    let postBody = { title, description };
    let key;
    for (key in postBody) {
        if (!postBody[key]) {
            return res.json({
                success: false,
                message: `${key} ${res.__("EMPTY_FIELD")}`,
            });
        }
    }
    if (title.trim().split("").length < 5) {
        return res.json({
            success: false,
            message: res.__("USERNAME_LENGTH"),
        });
    }
    if (title.trim().split("").length > 35) {
        return res.json({
            success: false,
            message: res.__("USERNAME_LENGTH"),
        });
    }
    if (description.trim().split("").length < 150) {
        return res.json({
            success: false,
            message: res.__("USERNAME_LENGTH"),
        });
    }
    if (description.trim().split("").length > 1000) {
        return res.json({
            success: false,
            message: res.__("USERNAME_LENGTH"),
        });
    }
    next();
}
exports.default = default_1;
//# sourceMappingURL=postValidator.middleware.js.map