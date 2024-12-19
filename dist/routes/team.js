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
import { addMembersToTeam, fetchTeams } from "../controllers/team.js";
const teamRouter = express.Router();
teamRouter.get("/fetchTeams/:id/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield fetchTeams(req, res);
}));
teamRouter.post("/addMembers/:id/:teamId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield addMembersToTeam(req, res);
}));
export default teamRouter;
//# sourceMappingURL=team.js.map