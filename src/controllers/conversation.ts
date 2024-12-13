import { Request, Response } from "express";
import Conversation from "../models/conversation";
import { addProfilePicURL, errorResponse } from "../utils/helper";
import Message from "../models/chats";
import User from "../models/user";

export const fetchAllConversationsOfUser = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  try {
    const { id } = req.params;

    // Fetch all conversations that the user is part of
    const conversations = await Conversation.find({
      members: { $in: [id] },
    })
      .populate("members", "fullname profilepic email")
      .populate({
        path: "message",
        options: { sort: { createdAt: -1 }, limit: 1 },
      });

    // Format conversations and include the last message
    const formattedConversations = conversations.map((conversation) => {
      const otherUser = conversation.members.find(
        (member) => member._id.toString() !== id
      );

      // Get the last message, if it exists
      // @ts-ignore
      const lastMessage =
        conversation.message.length > 0
          ? conversation.message[conversation.message.length - 1]
          : null;

      return {
        id: conversation._id,
        user: {
          id: otherUser?._id,
          // @ts-ignore
          fullname: otherUser?.fullname,
          // @ts-ignore
          profilepic: addProfilePicURL(otherUser?.profilepic || ""),
        },
        lastMessage: lastMessage
          ? {
              // @ts-ignore
              text: lastMessage?.text || "",
              // @ts-ignore
              createdAt: lastMessage?.createdAt,
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
  } catch (error) {
    errorResponse(res, (error as Error).message);
  }
};

export const fetchConversationsMesaages = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
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
    const conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    // Fetch receiver details
    const receiver = await User.findById(receiverId).select(
      "fullname profilepic email"
    );

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Prepare other user data
    const data = {
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
      await newConversation.save();

      return res.status(200).json({
        success: true,
        message: "Conversation created successfully",
        data: newConversation,
        otherUser: data,
      });
    }

    // Fetch all messages for the conversation in parallel
    const messages = await Promise.all(
      conversation.message.map(async (messageId) => {
        const message = await Message.findById(messageId)
          .populate("senderid", "fullname profilepic")
          .populate("receiverid", "fullname profilepic");

        if (!message) {
          return null; // If no message is found, return null
        }

        return {
          ...message.toObject(),
          senderid: {
            // @ts-ignore
            id: message.senderid?._id,
            // @ts-ignore
            fullname: message.senderid?.fullname || "",
            // @ts-ignore
            profilepic: addProfilePicURL(message.senderid?.profilepic || ""),
          },
          receiverid: {
            // @ts-ignore
            id: message.receiverid?._id,
            // @ts-ignore
            fullname: message.receiverid?.fullname || "",
            // @ts-ignore
            profilepic: addProfilePicURL(message.receiverid?.profilepic || ""),
          },
        };
      })
    );

    // Filter out any null messages (if some messages were not found)
    const filteredMessages = messages.filter((msg) => msg !== null);

    return res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      data: conversation,
      messages: filteredMessages,
      otherUser: data,
    });
  } catch (error) {
    return errorResponse(res, (error as Error).message);
  }
};
