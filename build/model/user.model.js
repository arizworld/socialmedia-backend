"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../config/config"));
const mongoose_service_1 = __importDefault(require("../services/mongoose.service"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: [true, "please provide name"],
    },
    email: {
        type: String,
        required: [true, "please provide email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "please provide password"],
    },
    image: {
        data: {
            type: Buffer,
        },
        url: {
            type: String,
        },
    },
    resetToken: String,
    resetTokenExpire: Number,
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            next();
        }
        try {
            console.log(this.password);
            this.password = yield bcrypt_1.default.hash(this.password, 10);
        }
        catch (error) {
            return next(error);
        }
    });
});
userSchema.methods.getToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, config_1.default.secretKey);
};
userSchema.methods.getResetToken = function (resetDelay) {
    return __awaiter(this, void 0, void 0, function* () {
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        this.resetToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        this.resetTokenExpire = Date.now() + resetDelay;
        yield this.save();
        return resetToken;
    });
};
userSchema.methods.destroyResetToken = function (resetDelay) {
    return __awaiter(this, void 0, void 0, function* () {
        const userRef = this;
        setTimeout(function () {
            return __awaiter(this, void 0, void 0, function* () {
                userRef.resetToken = undefined;
                userRef.resetTokenExpire = undefined;
                yield userRef.save();
            });
        }, resetDelay);
    });
};
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.compare(password, this.password);
    });
};
const User = mongoose_1.default.model("User", userSchema);
const UserServices = new mongoose_service_1.default(User);
exports.default = UserServices;
//# sourceMappingURL=user.model.js.map