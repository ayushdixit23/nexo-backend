import express from "express";
import { addMembersToTeam, fetchTeams } from "../controllers/team";
const teamRouter = express.Router();

teamRouter.get("/fetchTeams/:id/:orgId", async (req, res) => {
   await fetchTeams(req, res);
});

teamRouter.post("/addMembers/:id/:teamId", async (req, res) => {
    await addMembersToTeam(req, res);
})

export default teamRouter;
