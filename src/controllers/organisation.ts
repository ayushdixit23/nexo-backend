import User from "../models/user.js";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { BUCKET_NAME, RAZORPAY_KEY_SECRET } from "../utils/config.js";
import {
  generatePresignedDownloadUrl,
  s3,
  uploadToS3,
} from "../utils/s3.config.js";
import { addProfilePicURL, convertSize, errorResponse } from "../utils/helper.js";
import Organisation from "../models/organistion.js";
import Team from "../models/team.js";
import Storage from "../models/storage.js";
import { razorpay } from "../utils/razorpay.js";
import crypto from "crypto";

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

    const file = req.file;
    const uuidString = uuid();
    const profilepic = Date.now() + "-" + uuidString + "-" + file?.originalname;

    uploadToS3(BUCKET_NAME, profilepic, file.buffer, file.mimetype);

    const org = new Organisation({
      name,
      dp: profilepic,
      // dp: "1733947944445-d8b6eda4-d76f-4e2a-80ba-63283249cb04-Group 1171277335.png",
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
      profilepic: addProfilePicURL(user.profilepic || ""),
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
      dp: addProfilePicURL(org.dp || ""),
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
      dp: addProfilePicURL(org.dp || ""),
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

    const isUserAlreadyCreator = await Organisation.exists({
      creator: user._id,
    });
    if (isUserAlreadyCreator) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot join an organisation if you are already a creator of another organisation.",
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
      profilepic: addProfilePicURL(user.profilepic || ""),
      id: user._id,
      organisationId: org._id,
    };

    return res.status(200).json({
      success: true,
      message: "Joined organisation successfully.",
      data,
    });
  } catch (error) {
    return errorResponse(res, (error as Error).message);
  }
};

export const createTeam = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const { id, orgId } = req.params;
    const { name } = req.body;

    // Fetch user and organisation with only necessary fields
    const [user, org] = await Promise.all([
      User.findById(id).select("_id teams"),
      Organisation.findById(orgId).select("_id teams"),
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

    // Create a new team and add it to the organisation and user
    const team = new Team({
      name,
      organisation: orgId,
      creator: user._id,
      members: [user._id],
    });

    org.teams.push(team._id);
    user.teams.push(team._id);

    // Save the team, organisation, and user concurrently
    await Promise.all([team.save(), org.save(), user.save()]);

    return res.status(201).json({
      success: true,
      message: "Team created successfully.",
      teamId: team._id,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(res, (error as Error).message);
  }
};

export const fetchMembersAndTeams = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const { orgId } = req.params;

    // Fetch organisation with nested population and lean for better performance
    const org = await Organisation.findById(orgId)
      .populate({
        path: "teams",
        select: "name creator members",
        populate: [
          { path: "creator", select: "fullname profilepic email" },
          { path: "members", select: "fullname profilepic email" },
        ],
      })
      .populate("members", "fullname profilepic email")
      .lean(); // Retrieve plain JavaScript objects

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found.",
      });
    }

    // Map teams and format response
    const teams = org.teams?.map((team: any) => ({
      id: team._id,
      name: team.name,
      creator: {
        fullname: team.creator?.fullname || "N/A",
        profilepic: addProfilePicURL(team.creator?.profilepic || ""),
        id: team.creator?._id || "N/A",
        email: team.creator?.email || "N/A",
      },
      members: team.members?.map((member: any) => ({
        email: member.email || "N/A",
        isJoined: true,
        fullname: member.fullname || "N/A",
        profilepic: addProfilePicURL(member.profilepic || ""),
        id: member._id || "N/A",
      })),
    }));

    // Map organisation members
    const members = org.members?.map((member: any) => ({
      fullname: member.fullname || "N/A",
      profilepic: addProfilePicURL(member.profilepic || ""),
      id: member._id || "N/A",
      email: member.email || "N/A",
    }));

    const data = {
      teams,
      members,
    };

    return res.status(200).json({
      success: true,
      message: "Members and Teams fetched successfully.",
      data,
    });
  } catch (error) {
    return errorResponse(res, (error as Error).message);
  }
};

export const generatePresignedUrl = async (req: Request, res: Response) => {
  const { filename, filetype, orgId, isIndividual, userId } = req.body; // Get filename and filetype from request
  try {
    if (isIndividual) {
      const user = await User.findById(userId).select("storageused");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      if (user.storageused > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Storage limit exceeded.",
          openPop: true,
        });
      }
    } else {
      const organisation = await Organisation.findById(orgId).select(
        "storageused"
      );

      if (!organisation) {
        return res.status(404).json({
          success: false,
          message: "Organisation not found.",
        });
      }

      if (organisation.storageused > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Storage limit exceeded.",
          openPop: true,
        });
      }
    }

    const uuidString = uuid();
    const uploadedFileName = `${Date.now()}-${uuidString}-${filename}`; // Ensure proper string formatting

    const s3Params = {
      Bucket: BUCKET_NAME, // Your S3 bucket name
      Key: uploadedFileName, // The key for the file in S3
      ContentType: filetype, // Content-Type of the file to be uploaded

      Expires: 3600, // Presigned URL expiry time in seconds (2 minutes)
    };
    // Generate the presigned URL using getSignedUrl
    s3.getSignedUrl("putObject", s3Params, (err, url) => {
      if (err) {
        console.error("Error generating presigned URL:", err);
        return res.status(500).json({
          success: false,
          message: "Error generating presigned URL",
          error: err.message,
        });
      }

      // Return the presigned URL and uploaded file name in the response
      return res.status(200).json({
        success: true,
        message: "Presigned URL generated successfully.",
        presignedUrl: url,
        uploadedFileName,
      });
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    errorResponse(res, (error as Error).message);
  }
};

// export const addStorage = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { size, filename, filetype, orgId } = req.body;

//     // Validate input
//     if (!size || !filename || !filetype) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields: size, filename, or filetype.",
//       });
//     }

//     if (size <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid size. Size must be greater than 0.",
//       });
//     }

//     const user = await User.exists({ _id: id });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found.",
//       });
//     }

//     // Find organisation by ID
//     const org = await Organisation.exists({ _id: orgId }); // Using lean for better performance

//     if (!org) {
//       return res.status(404).json({
//         success: false,
//         message: "Organisation not found.",
//       });
//     }

//     // Convert size to KB
//     const sizes = convertSize(Number(size));

//     // Create and save storage document
//     const storage = await Storage.create({
//       size: sizes.kb,
//       date: new Date(),
//       orgid: orgId,
//       filename,
//       type: filetype,
//       userid: id,
//     });

//     // Update organisation with new storage details
//     await Organisation.findByIdAndUpdate(
//       orgId,
//       {
//         $inc: { storageused: sizes.kb },
//         $addToSet: { storage: storage._id },
//       },
//       { new: true }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Storage added successfully.",
//       storageId: storage._id,
//     });
//   } catch (error) {
//     console.error("Error adding storage:", error);
//     return errorResponse(res, (error as Error).message);
//   }
// };

export const addStorage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { size, filename, filetype, orgId } = req.body;

    // Validate input
    if (!size || !filename || !filetype) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: size, filename, or filetype.",
      });
    }

    if (size <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid size. Size must be greater than 0.",
      });
    }

    // Validate user existence
    const user = await User.exists({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Validate organisation existence if orgId is provided
    if (orgId) {
      const org = await Organisation.exists({ _id: orgId });
      if (!org) {
        return res.status(404).json({
          success: false,
          message: "Organisation not found.",
        });
      }
    }

    // Convert size to KB
    const sizes = convertSize(Number(size));

    // Create and save storage document
    const storageData: any = {
      size: sizes.kb,
      date: new Date(),
      filename,
      type: filetype,
      userid: id,
    };

    if (orgId) storageData.orgid = orgId; // Add orgId only when provided

    const storage = await Storage.create(storageData);

    // Update user or organisation with storage details
    if (orgId) {
      // Update organisation
      await Organisation.findByIdAndUpdate(
        orgId,
        {
          $inc: { storageused: sizes.kb },
          $addToSet: { storage: storage._id },
        },
        { new: true }
      );
    } else {
      // Update user
      await User.findByIdAndUpdate(
        id,
        {
          $inc: { storageused: sizes.kb },
          $addToSet: { storage: storage._id },
        },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Storage added successfully.",
      storageId: storage._id,
    });
  } catch (error) {
    console.error("Error adding storage:", error);
    return errorResponse(res, (error as Error).message);
  }
};

export const deleteStorage = async (req: Request, res: Response) => {
  try {
    const { userId, id, orgId } = req.params;
    // Find organisation by ID
    const org = await Organisation.findById(orgId).select("storageused _id"); // Using lean for better performance

    const user = await User.exists({ _id: userId });

    console.log(userId, id, orgId, "ids");

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

    // Find storage by ID
    const storage = await Storage.findById(id);

    if (!storage) {
      return res.status(404).json({
        success: false,
        message: "Storage not found.",
      });
    }

    if (storage.userid.toString() !== userId) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this storage.",
      });
    }

    // Update organisation with new storage details
    await Organisation.findByIdAndUpdate(
      orgId,
      {
        $inc: { storageused: -storage.size },
        $pull: { storage: storage._id },
      },
      { new: true }
    );

    // Delete storage document
    await Storage.findByIdAndDelete(id);

    // Delete file from S3

    try {
      await s3
        .deleteObject({
          Bucket: BUCKET_NAME,
          Key: storage.filename,
        })
        .promise();
    } catch (error) {
      console.log("Error deleting file from S3:", error);
    }

    return res.status(200).json({
      success: true,
      message: "Storage deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting storage:", error);
    return errorResponse(res, (error as Error).message);
  }
};

export const deleteStorageIndividual = async (req: Request, res: Response) => {
  try {
    const { userId, id } = req.params;

    const user = await User.findById(userId).select("storageused _id");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Find storage by ID
    const storage = await Storage.findById(id);

    if (!storage) {
      return res.status(404).json({
        success: false,
        message: "Storage not found.",
      });
    }

    if (storage.userid.toString() !== userId) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this storage.",
      });
    }

    // Update organisation with new storage details
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { storageused: -storage.size },
        $pull: { storage: storage._id },
      },
      { new: true }
    );

    // Delete storage document
    await Storage.findByIdAndDelete(id);

    // Delete file from S3

    try {
      await s3
        .deleteObject({
          Bucket: BUCKET_NAME,
          Key: storage.filename,
        })
        .promise();
    } catch (error) {
      console.log("Error deleting file from S3:", error);
    }

    return res.status(200).json({
      success: true,
      message: "Storage deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting storage:", error);
    return errorResponse(res, (error as Error).message);
  }
};

export const fetchStorage = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    // Find organisation by ID
    const org = await Organisation.findById(orgId).select("storageused _id"); // Using lean for better performance

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organisation not found.",
      });
    }

    const stor = await Storage.find({ orgid: orgId })
      .populate("userid", "fullname profilepic email")
      .lean(); // Retrieve plain JavaScript objects

    const storage = stor.map((item: any) => {
      return {
        ...item,
        userid: {
          fullname: item?.userid?.fullname,
          profilepic: addProfilePicURL(item?.userid?.profilepic || ""),
          email: item?.userid?.email,
        },
      };
    });

    return res.status(200).json({
      success: true,
      message: "Storage fetched successfully.",
      storage,
      storageused: org.storageused,
    });
  } catch (error) {
    console.error("Error fetching storage:", error);
    return errorResponse(res, (error as Error).message);
  }
};

export const fetchStorageIndividual = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Find organisation by ID
    const user = await User.findById(id).select("storageused _id"); // Using lean for better performance

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const stor = await Storage.find({ userid: user._id })
      .populate("userid", "fullname profilepic email")
      .lean();

    if (!stor) {
      return res.status(404).json({
        success: false,
        message: "Storage not found.",
        storage: [],
        storageused: user.storageused,
      });
    }

    const storage = stor.map((item: any) => {
      return {
        ...item,
        userid: {
          fullname: item?.userid?.fullname,
          profilepic: addProfilePicURL(item?.userid?.profilepic || ""),
          email: item?.userid?.email,
        },
      };
    });

    return res.status(200).json({
      success: true,
      message: "Storage fetched successfully.",
      storage,
      storageused: user.storageused,
    });
  } catch (error) {
    console.error("Error fetching storage:", error);
    return errorResponse(res, (error as Error).message);
  }
};

export const downLoadFileFromStorage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const storage = await Storage.findById(id);

    if (!storage) {
      return res.status(404).json({
        success: false,
        message: "Storage not found.",
      });
    }

    const downloadUrl = generatePresignedDownloadUrl(
      BUCKET_NAME,
      storage.filename
    );

    return res.status(200).json({
      success: true,
      message: "Storage fetched successfully.",
      downloadUrl,
    });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const createOrderRazoryPay = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt#${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res
        .status(200)
        .json({ success: true, message: "Payment verified successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};
