import User from "../models/user.js";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { BUCKET_NAME } from "../utils/config.js";
import { uploadToS3 } from "../utils/s3.config.js";
import {
  addProfilePicURL,
  errorResponse,
  generateToken,
  hashPassword,
  verifyPassword,
} from "../utils/helper";
import Organisation from "../models/organistion.js";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const {
      fullname,
      email,
      password,
    }: { fullname: string; email: string; password: string } = req.body;

    const existingUser = await User.exists({ email });
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
    const profilepic = Date.now() + "-" + uuidString + "-" + file?.originalname;

    await uploadToS3(BUCKET_NAME, profilepic, file.buffer, file.mimetype);

    const hashPass = await hashPassword(password);

    const user = new User({
      fullname,
      email,
      password: hashPass,
      profilepic,
    });

    await user.save();

    const data = {
      id: user._id,
      fullname: user.fullname,
      profilepic: addProfilePicURL(user.profilepic || ""),
      email: user.email,
    };

    const token = await generateToken(data);

    res.status(201).json({
      success: true,
      data,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const loginWithEmail = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select(
      "fullname profilepic password email _id"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const organisation = await Organisation.find({
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

    const token = await generateToken(data);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      data,
      organisationLength: organisation.length,
    });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const fetchData = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const userData = req.user;

    if (!userData || !userData.id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user data" });
    }

    const user = await User.findById(userData.id).lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const updatedData = {
      ...user,
      id: user._id,
      profilepic: addProfilePicURL(user.profilepic || ""),
    };

    res
      .status(200)
      .json({ success: true, message: "User found", data: updatedData });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const { fullname, email } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (req.file) {
      const file = req.file;
      const uuidString = uuid();
      const profilepic =
        Date.now() + "-" + uuidString + "-" + file?.originalname;

      await uploadToS3(BUCKET_NAME, profilepic, file.buffer, file.mimetype);
      user.profilepic = profilepic;
    }

    user.fullname = fullname;
    user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const fetchSomeDetails = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const { id, orgId } = req.params;
    const user = await User.findById(id).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    //  check if user is created any organisation
    const org = await Organisation.findById(orgId).lean();
    if (org?.creator.toString() === user._id.toString()) {
      return res.status(200).json({
        success: true,
        message: "User found",
        isCreator: true,
        code: org.code,
        name: org.name,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "User found",
        isCreator: false,
        name: org ? org.name : "",
      });
    }
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const saveCode = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const { id, orgId } = req.params;
    const { code } = req.body;
    const user = await User.findById(id).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    //  check if user is created any organisation
    const org = await Organisation.findById(orgId);
    if (org?.creator.toString() === user._id.toString()) {
      org.code = code;
      await org.save();

      return res.status(200).json({
        success: true,
        message: "Code saved successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Not allowed to change organisation code",
      });
    }
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};
