var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { createUser, fetchData, fetchSomeDetails, loginWithEmail, saveCode, updateProfile, } from "../controllers/auth.js";
import upload from "../middleware/multer.js";
import { verifyTokenMiddleware } from "../middleware/token.js";
const userRouter = express.Router();
userRouter.post("/register", upload.single("profilepic"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield createUser(req, res); // Make sure the controller doesn't return a response, just handles it
}));
userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield loginWithEmail(req, res); // Make sure the controller doesn't return a response, just handles it
}));
userRouter.get("/auth/verifytoken", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        verifyTokenMiddleware(req, res, next); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error); // Pass any error to the global error handler
    }
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetchData(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
userRouter.post("/updateProfile/:id", upload.single("profilepic"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield updateProfile(req, res); // Make sure the controller doesn't return a response, just handles it
}));
userRouter.get("/fetchSomeDetails/:id/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield fetchSomeDetails(req, res); // Make sure the controller doesn't return a response, just handles it
}));
userRouter.post("/saveCode/:id/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield saveCode(req, res); // Make sure the controller doesn't return a response, just handles it
}));
export default userRouter;
//# sourceMappingURL=auth.js.map