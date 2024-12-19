var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { verifyToken } from "../utils/helper.js";
export const verifyTokenMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }
        const decodedToken = verifyToken(token);
        if (!decodedToken) {
            return res.status(401).json({ error: "Invalid token" });
        }
        req.user = decodedToken;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            console.log("Token expired");
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again.",
                error: "Token expired",
            });
        }
        else if (error.name === "JsonWebTokenError") {
            console.log("Invalid token");
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please provide a valid token.",
                error: "Invalid token",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Token verification failed. Please try again later.",
            error: error.message,
        });
    }
});
//# sourceMappingURL=token.js.map