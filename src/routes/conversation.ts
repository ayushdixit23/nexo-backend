import express from "express";
import { fetchAllConversationsOfUser, fetchConversationsMesaages } from "../controllers/conversation";
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


export default chatRouter;
