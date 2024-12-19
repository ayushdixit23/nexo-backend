import express from "express";
import { fetchAllConversationsOfUser, fetchConversationsMesaages, fetchTeamMessages } from "../controllers/conversation.js";
const chatRouter = express.Router();

chatRouter.get("/fetchAllConversationsOfUser/:id", async (req, res) => {
    try {
        await fetchAllConversationsOfUser(req, res); // Call the controller to handle the response
    } catch (error) {
        console.log(error);
    }
});

chatRouter.get(
    "/fetchConversationsMesaages/:senderId/:receiverId",
    async (req, res) => {
        try {
            await fetchConversationsMesaages(req, res); // Call the controller to handle the response
        } catch (error) {
            console.log(error);
        }
    }
);

chatRouter.get(
    "/fetchTeamMessages/:teamId",
    async (req, res) => {
        try {
            await fetchTeamMessages(req, res); // Call the controller to handle the response
        } catch (error) {
            console.log(error);
        }
    }
);


export default chatRouter;
