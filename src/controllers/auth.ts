import User from "../models/user";
import e, { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { BUCKET_NAME, URL } from "../utils/config";
import { uploadToS3 } from "../utils/s3.config";
import {
  errorResponse,
  generateToken,
  hashPassword,
  verifyPassword,
} from "../utils/helper";
import Organisation from "../models/organistion";

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

    // const user = new User({ fullname, email, password: hashPass, profilepic });
    const user = new User({
      fullname,
      email,
      password: hashPass,
      profilepic
      // profilepic:
      //   "1733682022686-842b4107-2a47-4bca-8cd8-b644ef91ed01-PNG_00094.jpg",
    });

    await user.save();

    const data = {
      fullname: user.fullname,
      email: user.email,
      profilepic: user.profilepic,
      id: user._id,
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

    const data = {
      id: user._id,
      fullname: user.fullname,
      profilepic: URL + user.profilepic,
      email: user.email,
    };

    const token = await generateToken(data);

    res
      .status(200)
      .json({ success: true, message: "Login successful!", token, data });
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
      profilepic: `${URL}${user.profilepic}`,
    };

    res
      .status(200)
      .json({ success: true, message: "User found", data: updatedData });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const createOrganisation = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  console.log("createOrganisation");
  try {
    const { id } = req.params;
    const { name, code }: { name: string; code: string } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Orgaination Picture is required" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Orgaination Name is required" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // const file = req.file;
    // const uuidString = uuid();
    // const profilepic = Date.now() + "-" + uuidString + "-" + file?.originalname;

    // uploadToS3(BUCKET_NAME, profilepic, file.buffer, file.mimetype);

    const org = new Organisation({
      name,
      // dp: profilepic,
      dp: "1733947944445-d8b6eda4-d76f-4e2a-80ba-63283249cb04-Group 1171277335.png",
      creator: id,
      members: [id],
      code: code,
    });

    await org.save();

    user.organisations.push(org._id);
    await user.save();

    const data = {
      fullname: user.fullname,
      email: user.email,
      profilepic: URL + user.profilepic,
      id: user._id,
      organisationId: org._id,
    };

    res.status(200).json({
      success: true,
      message: "Organisation created successfully",
      data,
    });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const getOrganisations = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const organisations = await Organisation.find()
      .select("name _id dp")
      .lean();

    const data = organisations.map((org) => ({
      ...org,
      id: org._id,
      dp: `${URL}${org.dp}`,
    }));
    res.status(200).json({
      success: true,
      message: "Organisation fetched successfully",
      data,
    });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const searchOrganisation = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const { name } = req.query;
    const organisations = await Organisation.find({
      name: { $regex: name, $options: "i" },
    })
      .select("name _id dp")
      .lean(); // Use $options: "i" for case-insensitive search
    const data = organisations.map((org) => ({
      ...org,
      id: org._id,
      dp: `${URL}${org.dp}`,
    }));
    res.status(200).json({
      success: true,
      message: "Organisation fetched successfully",
      data,
    });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const joinOrganisation = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id, orgId } = req.params;
    const { code }: { code: string } = req.body;

    // Validate request parameters
    if (!id || !orgId || !code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: id, orgId, or code.",
      });
    }

    // Fetch user and organization in parallel
    const [user, org] = await Promise.all([
      User.findById(id),
      Organisation.findById(orgId),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found.",
      });
    }

    // Verify the organization code
    if (org.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid code.",
      });
    }

    // Check if the user is already a member of the organization
    const isAlreadyMember = user.organisations.some(
      (userOrgId) => userOrgId.toString() === org._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(203).json({
        success: false,
        message: "You are already a member of this organisation.",
      });
    }

    // Add user to organization's members and organization to user's list
    org.members.push(user._id);
    user.organisations.push(org._id);

    await Promise.all([org.save(), user.save()]);

    const data = {
      fullname: user.fullname,
      email: user.email,
      profilepic: URL + user.profilepic,
      id: user._id,
      organisationId: org._id,
    };


    return res.status(200).json({
      success: true,
      message: "Joined organisation successfully.",
      data
    });
  } catch (error) {
    return errorResponse(res, (error as Error).message);
  }
};
