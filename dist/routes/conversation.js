var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { fetchAllConversationsOfUser, fetchConversationsMesaages, fetchTeamMessages } from "../controllers/conversation.js";
const chatRouter = express.Router();
chatRouter.get("/fetchAllConversationsOfUser/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetchAllConversationsOfUser(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
chatRouter.get("/fetchConversationsMesaages/:senderId/:receiverId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetchConversationsMesaages(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
chatRouter.get("/fetchTeamMessages/:teamId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fetchTeamMessages(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
export default chatRouter;
//# sourceMappingURL=conversation.js.map