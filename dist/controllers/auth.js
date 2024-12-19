var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/user.js";
import { v4 as uuid } from "uuid";
import { BUCKET_NAME } from "../utils/config.js";
import { uploadToS3 } from "../utils/s3.config.js";
import { addProfilePicURL, errorResponse, generateToken, hashPassword, verifyPassword, } from "../utils/helper.js";
import Organisation from "../models/organistion.js";
export const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, email, password, } = req.body;
        const existingUser = yield User.exists({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ success: false, message: "Email is already in use" });
        }
        if (!fullname || !email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
        }
        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, message: "Profile picture is required" });
        }
        const file = req.file;
        const uuidString = uuid();
        const profilepic = Date.now() + "-" + uuidString + "-" + (file === null || file === void 0 ? void 0 : file.originalname);
        yield uploadToS3(BUCKET_NAME, profilepic, file.buffer, file.mimetype);
        const hashPass = yield hashPassword(password);
        const user = new User({
            fullname,
            email,
            password: hashPass,
            profilepic,
        });
        yield user.save();
        const data = {
            id: user._id,
            fullname: user.fullname,
            profilepic: addProfilePicURL(user.profilepic || ""),
            email: user.email,
        };
        const token = yield generateToken(data);
        res.status(201).json({
            success: true,
            data,
            token,
            message: "User created successfully",
        });
    }
    catch (error) {
        errorResponse(res, error.message);
    }
});
export const loginWithEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Email and password are required" });
        }
        const user = yield User.findOne({ email }).select("fullname profilepic password email _id");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const isMatch = yield verifyPassword(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }
        const organisation = yield Organisation.find({
            members: { $in: [user._id] },
        });
        let data = {};
        if (organisation.length === 0) {
            data = {
                fullname: user.fullname,
                email: user.email,
                profilepic: addProfilePicURL(user.profilepic || ""),
                id: user._id,
            };
        }
        if (organisation.length > 1) {
            data = {
                fullname: user.fullname,
                email: user.email,
                profilepic: addProfilePicURL(user.profilepic || ""),
                id: user._id,
                organisations: organisation.map((org) => ({
                    creator: org.creator,
                    name: org.name,
                    id: org._id,
                    dp: addProfilePicURL(org.dp || ""),
                })),
            };
        }
        if (organisation.length === 1) {
            data = {
                fullname: user.fullname,
                email: user.email,
                profilepic: addProfilePicURL(user.profilepic || ""),
                id: user._id,
                organisationId: organisation[0]._id,
            };
        }
        const token = yield generateToken(data);
        res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            data,
            organisationLength: organisation.length,
        });
    }
    catch (error) {
        errorResponse(res, error.message);
    }
});
export const fetchData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.user;
        if (!userData || !userData.id) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid user data" });
        }
        const user = yield User.findById(userData.id).lean();
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const updatedData = Object.assign(Object.assign({}, user), { id: user._id, profilepic: addProfilePicURL(user.profilepic || "") });
        res
            .status(200)
            .json({ success: true, message: "User found", data: updatedData });
    }
    catch (error) {
        errorResponse(res, error.message);
    }
});
export const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullname, email } = req.body;
        const { id } = req.params;
        const user = yield User.findById(id);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        if (req.file) {
            const file = req.file;
            const uuidString = uuid();
            const profilepic = Date.now() + "-" + uuidString + "-" + (file === null || file === void 0 ? void 0 : file.originalname);
            yield uploadToS3(BUCKET_NAME, profilepic, file.buffer, file.mimetype);
            user.profilepic = profilepic;
        }
        user.fullname = fullname;
        user.email = email;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    }
    catch (error) {
        errorResponse(res, error.message);
    }
});
export const fetchSomeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, orgId } = req.params;
        const user = yield User.findById(id).lean();
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        //  check if user is created any organisation
        const org = yield Organisation.findById(orgId).lean();
        if ((org === null || org === void 0 ? void 0 : org.creator.toString()) === user._id.toString()) {
            return res.status(200).json({
                success: true,
                message: "User found",
                isCreator: true,
                code: org.code,
                name: org.name,
            });
        }
        else {
            return res.status(200).json({
                success: true,
                message: "User found",
                isCreator: false,
                name: org ? org.name : "",
            });
        }
    }
    catch (error) {
        errorResponse(res, error.message);
    }
});
export const saveCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, orgId } = req.params;
        const { code } = req.body;
        const user = yield User.findById(id).lean();
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        //  check if user is created any organisation
        const org = yield Organisation.findById(orgId);
        if ((org === null || org === void 0 ? void 0 : org.creator.toString()) === user._id.toString()) {
            org.code = code;
            yield org.save();
            return res.status(200).json({
                success: true,
                message: "Code saved successfully",
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Not allowed to change organisation code",
            });
        }
    }
    catch (error) {
        errorResponse(res, error.message);
    }
});
//# sourceMappingURL=auth.js.map