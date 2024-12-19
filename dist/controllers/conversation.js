var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Conversation from "../models/conversation.js";
import { addProfilePicURL, errorResponse } from "../utils/helper.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import Team from "../models/team.js";
export const fetchAllConversationsOfUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Fetch all conversations that the user is part of
        const conversations = yield Conversation.find({
            members: { $in: [id] },
        })
            .populate("members", "fullname profilepic email")
            .populate({
            path: "message",
            options: {
                sort: { date: -1 },
                limit: 1,
            },
        });
        // Format conversations and include the last message
        const formattedConversations = conversations.map((conversation) => {
            const otherUser = conversation.members.find((member) => member._id.toString() !== id);
            // Get the last message, if it exists
            // @ts-ignore
            const lastMessage = conversation.message.length > 0 ? conversation.message[0] : null;
            return {
                id: conversation._id,
                user: {
                    id: otherUser === null || otherUser === void 0 ? void 0 : otherUser._id,
                    // @ts-ignore
                    fullname: otherUser === null || otherUser === void 0 ? void 0 : otherUser.fullname,
                    // @ts-ignore
                    profilepic: addProfilePicURL((otherUser === null || otherUser === void 0 ? void 0 : otherUser.profilepic) || ""),
                },
                lastMessage: lastMessage
                    ? {
                        // @ts-ignore
                        message: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.message) || "",
                        // @ts-ignore
                        createdAt: lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.createdAt,
                    }
                    : "Start a conversation",
                createdAt: conversation.createdAt,
            };
        });
        // Respond with the formatted conversations
        res.status(200).json({
            success: true,
            message: "Conversations fetched successfully",
            data: formattedConversations,
        });
    }
    catch (error) {
        errorResponse(res, error.message);
    }
});
export const fetchConversationsMesaages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, receiverId } = req.params;
        // Validate input
        if (!senderId || !receiverId) {
            return res.status(400).json({
                success: false,
                message: "Sender or receiver ID is missing",
            });
        }
        // Find existing conversation
        const conversation = yield Conversation.findOne({
            members: { $all: [senderId, receiverId] },
        });
        // Fetch receiver details
        const receiver = yield User.findById(receiverId).select("fullname profilepic email");
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found",
            });
        }
        // Prepare other user data
        const data = {
            conversationId: conversation === null || conversation === void 0 ? void 0 : conversation._id,
            id: receiver._id,
            fullname: receiver.fullname,
            profilepic: addProfilePicURL(receiver.profilepic || ""),
        };
        // If no conversation found, create a new one
        if (!conversation) {
            const newConversation = new Conversation({
                members: [senderId, receiverId],
                message: [],
            });
            yield newConversation.save();
            return res.status(200).json({
                success: true,
                message: "Conversation created successfully",
                data: newConversation,
                otherUser: data,
            });
        }
        // Fetch all messages for the conversation in parallel
        const messages = yield Promise.all(conversation.message.map((messageId) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const message = yield Message.findById(messageId)
                .populate("senderid", "fullname profilepic")
                .populate("receiverid", "fullname profilepic");
            if (!message) {
                return null; // If no message is found, return null
            }
            return Object.assign(Object.assign({}, message.toObject()), { senderid: {
                    // @ts-ignore
                    id: (_a = message.senderid) === null || _a === void 0 ? void 0 : _a._id,
                    // @ts-ignore
                    fullname: ((_b = message.senderid) === null || _b === void 0 ? void 0 : _b.fullname) || "",
                    // @ts-ignore
                    profilepic: addProfilePicURL(((_c = message.senderid) === null || _c === void 0 ? void 0 : _c.profilepic) || ""),
                }, receiverid: {
                    // @ts-ignore
                    id: (_d = message.receiverid) === null || _d === void 0 ? void 0 : _d._id,
                    // @ts-ignore
                    fullname: ((_e = message.receiverid) === null || _e === void 0 ? void 0 : _e.fullname) || "",
                    // @ts-ignore
                    profilepic: addProfilePicURL(((_f = message.receiverid) === null || _f === void 0 ? void 0 : _f.profilepic) || ""),
                } });
        })));
        // Filter out any null messages (if some messages were not found)
        const filteredMessages = messages.filter((msg) => msg !== null);
        return res.status(200).json({
            success: true,
            message: "Conversations fetched successfully",
            data: conversation,
            messages: filteredMessages,
            otherUser: data,
        });
    }
    catch (error) {
        return errorResponse(res, error.message);
    }
});
export const storeMessageToDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { convId, senderid, receiverid, message, date } = data;
    try {
        const conversation = yield Conversation.findById(convId);
        if (!conversation) {
            return {
                success: false,
                message: "Conversation not found",
            };
        }
        const newMessage = new Message({
            senderid: senderid.id,
            receiverid: receiverid.id,
            message,
            convId,
            date,
        });
        yield newMessage.save();
        // @ts-ignore
        conversation.message.push(newMessage._id);
        yield conversation.save();
        console.log("Message stored successfully");
        return { success: true, message: "Message received successfully" };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Failed to receive message",
        };
    }
});
export const fetchTeamMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { teamId } = req.params;
        const messages = yield Message.find({ convId: teamId })
            .populate("senderid", "fullname profilepic")
            .populate("receiverid", "fullname profilepic")
            .lean();
        const team = yield Team.findById(teamId)
            .populate("members", "fullname profilepic")
            .populate("creator", "fullname profilepic");
        const teamData = {
            id: team === null || team === void 0 ? void 0 : team._id,
            name: team === null || team === void 0 ? void 0 : team.name,
            creator: {
                // @ts-ignore
                id: (_a = team === null || team === void 0 ? void 0 : team.creator) === null || _a === void 0 ? void 0 : _a._id,
                // @ts-ignore
                fullname: ((_b = team === null || team === void 0 ? void 0 : team.creator) === null || _b === void 0 ? void 0 : _b.fullname) || "",
                // @ts-ignore
                profilepic: addProfilePicURL(((_c = team === null || team === void 0 ? void 0 : team.creator) === null || _c === void 0 ? void 0 : _c.profilepic) || ""),
            },
            members: team === null || team === void 0 ? void 0 : team.members.map((member) => ({
                // @ts-ignore
                id: member === null || member === void 0 ? void 0 : member._id,
                // @ts-ignore
                fullname: (member === null || member === void 0 ? void 0 : member.fullname) || "",
                // @ts-ignore
                profilepic: addProfilePicURL((member === null || member === void 0 ? void 0 : member.profilepic) || ""),
            })),
        };
        const formattedMessages = messages.map((message) => {
            var _a, _b, _c, _d, _e, _f;
            return (Object.assign(Object.assign({}, message), { senderid: {
                    // @ts-ignore
                    id: (_a = message.senderid) === null || _a === void 0 ? void 0 : _a._id,
                    // @ts-ignore
                    fullname: ((_b = message.senderid) === null || _b === void 0 ? void 0 : _b.fullname) || "",
                    // @ts-ignore
                    profilepic: addProfilePicURL(((_c = message.senderid) === null || _c === void 0 ? void 0 : _c.profilepic) || ""),
                }, receiverid: {
                    // @ts-ignore
                    id: (_d = message.receiverid) === null || _d === void 0 ? void 0 : _d._id,
                    // @ts-ignore
                    fullname: ((_e = message.receiverid) === null || _e === void 0 ? void 0 : _e.fullname) || "",
                    // @ts-ignore
                    profilepic: addProfilePicURL(((_f = message.receiverid) === null || _f === void 0 ? void 0 : _f.profilepic) || ""),
                } }));
        });
        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            data: formattedMessages,
            team: teamData,
        });
    }
    catch (error) {
        return errorResponse(res, error.message);
    }
});
export const storeMessageToDBForTeam = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { convId, senderid, message, date } = data;
    try {
        const newMessage = new Message({
            senderid: senderid.id,
            message,
            convId,
            date,
        });
        yield newMessage.save();
        console.log("Team Message stored successfully");
        return { success: true, message: "Message received successfully" };
    }
    catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Failed to receive message",
        };
    }
});
//# sourceMappingURL=conversation.js.map