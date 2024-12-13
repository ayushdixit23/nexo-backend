import express from "express";
import { fetchTeams } from "../controllers/team";
const teamRouter = express.Router();

teamRouter.get("/fetchTeams/:id", async (req, res) => {
   await fetchTeams(req, res);
});

export default teamRouter;
