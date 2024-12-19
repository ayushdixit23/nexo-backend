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
import Team from "../models/team.js";
import { addProfilePicURL, errorResponse } from "../utils/helper.js";
import Message from "../models/message.js";
export const fetchTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, orgId } = req.params;
        const user = yield User.findById(id).lean();
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "User not found" });
        }
        const teams = yield Team.find({
            _id: { $in: user.teams },
            organisation: orgId,
        })
            .populate("members", "fullname profilepic email")
            .lean();
        const data = yield Promise.all(teams.map((team) => __awaiter(void 0, void 0, void 0, function* () {
            const lastMessage = yield Message.findOne({ convId: team._id })
                .sort({ date: -1 })
                .lean();
            return Object.assign(Object.assign({}, team), { id: team._id, lastMessage: lastMessage ? lastMessage : null, members: team.members.map((member) => ({
                    // @ts-ignore
                    id: member._id,
                    // @ts-ignore
                    fullname: member.fullname,
                    // @ts-ignore
                    profilepic: addProfilePicURL(member.profilepic || ""),
                    // @ts-ignore
                    email: member.email,
                })) });
        })));
        return res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.log(error);
        errorResponse(res, error.message);
    }
});
export const addMembersToTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const team = yield Team.findById(teamId);
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
        yield team.save();
        // Remove the members from the corresponding user teams
        for (const memberId of removeMembers) {
            const user = yield User.findById(memberId);
            if (user) {
                user.teams = user.teams.filter((teamId) => teamId.toString() !== team._id.toString());
                console.log(user.teams);
                yield user.save();
            }
        }
        // Add the new members to the corresponding user teams
        for (const memberId of addMembers) {
            const user = yield User.findById(memberId);
            if (user) {
                if (!user.teams.includes(team._id)) {
                    user.teams.push(team._id);
                }
                yield user.save();
            }
        }
        // Prepare the response message
        const message = `Added ${addMembers.length} members and removed ${removeMembers.length} members from the team.`;
        // Return the response message
        return res.status(200).json({
            success: true,
            message,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later.",
        });
    }
});
//# sourceMappingURL=team.js.map