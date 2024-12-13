import { Request, Response } from "express";
import User from "../models/user";
import Team from "../models/team";
import { addProfilePicURL, errorResponse } from "../utils/helper";
import Message from "../models/message";

export const fetchTeams = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const teams = await Team.find({ _id: { $in: user.teams } })
      .populate("members", "fullname profilepic email")
      .lean();

    const data = await Promise.all(
      teams.map(async (team) => {
        const lastMessage = await Message.findOne({ convId: team._id })
          .sort({ date: -1 })
          .lean();

        return {
          ...team,
          id: team._id,
          lastMessage: lastMessage ? lastMessage : null, // Include the last message in the team data
          members: team.members.map((member) => ({
            // @ts-ignore
            id: member._id,
            // @ts-ignore
            fullname: member.fullname,
            // @ts-ignore
            profilepic: addProfilePicURL(member.profilepic || ""),
            // @ts-ignore
            email: member.email,
          })),
        };
      })
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.log(error);
    errorResponse(res, (error as Error).message);
  }
};
