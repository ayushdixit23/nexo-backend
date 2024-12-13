import { Request, Response } from "express";
import User from "../models/user";
import Team from "../models/team";
import { addProfilePicURL, errorResponse } from "../utils/helper";
import Message from "../models/message";
import mongoose from "mongoose";

export const fetchTeams = async (req: Request, res: Response) => {
  try {
    const { id, orgId } = req.params;
    const user = await User.findById(id).lean();
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const teams = await Team.find({
      _id: { $in: user.teams },
      organisation: orgId,
    })
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

export const addMembersToTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { addMembers, removeMembers } = req.body;

    if (!addMembers || !removeMembers) {
      return res.status(400).json({
        success: false,
        message: "Invalid request. Add and Remove members data are required.",
      });
    }

    // Fetch the selected team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found.",
      });
    }

    // Remove members from the team first
    team.members = team.members.filter((memberId) => {
      return !removeMembers.includes(memberId.toString());
    });

    // Then add the new members (ensure no duplicates)
    for (const memberId of addMembers) {
      if (!team.members.includes(memberId)) {
        team.members.push(memberId);
      }
    }

    await team.save();

    // Remove the members from the corresponding user teams
    for (const memberId of removeMembers) {
      const user = await User.findById(memberId);
      if (user) {
        user.teams = user.teams.filter(
          (teamId) => teamId.toString() !== team._id.toString()
        );
        console.log(user.teams);
        await user.save();
      }
    }

    // Add the new members to the corresponding user teams
    for (const memberId of addMembers) {
      const user = await User.findById(memberId);
      if (user) {
        if (!user.teams.includes(team._id)) {
          user.teams.push(team._id);
        }
        await user.save();
      }
    }

    // Prepare the response message
    const message = `Added ${addMembers.length} members and removed ${removeMembers.length} members from the team.`;

    // Return the response message
    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
