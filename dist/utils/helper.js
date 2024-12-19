var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, URL } from "./config.js";
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt.genSalt(10); // Ensure saltRounds is 10 or appropriate
    return bcrypt.hash(password, salt);
});
const verifyPassword = (inputPassword, dbPass) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt.compare(inputPassword, dbPass);
});
const errorResponse = (res, message, statusCode = 400) => {
    res.status(statusCode).json({ success: false, message });
};
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "15d" });
};
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET || "");
        // Check if the decoded value is of type JwtPayload
        if (typeof decoded === "object" && decoded !== null) {
            return decoded;
        }
        return null; // If it's a string or invalid, return null
    }
    catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};
const addProfilePicURL = (profilepic) => `${URL}${profilepic}`;
function convertSize(sizeInBytes) {
    // (KB)
    const sizeInKB = sizeInBytes / 1000;
    // (MB)
    const sizeInMB = sizeInKB / 1000;
    // (GB)
    const sizeInGB = sizeInMB / 1000;
    return {
        kb: sizeInKB.toFixed(2),
        mb: sizeInMB.toFixed(2),
        gb: sizeInGB.toFixed(2),
    };
}
export { errorResponse, addProfilePicURL, hashPassword, verifyPassword, convertSize, generateToken, verifyToken, };
//# sourceMappingURL=helper.js.map