import express from "express";
import {
  createIndividualTask,
  createTeamTask,
  fetchTasks,
} from "../controllers/tasks";
const tasksRouter = express.Router();

tasksRouter.post("/createIndividualTask/:id", async (req, res) => {
  try {
    await createIndividualTask(req, res); // Call the controller to handle the response
  } catch (error) {
    console.log(error);
  }
});

tasksRouter.post("/createTeamTask/:id/:orgId", async (req, res) => {
  try {
    await createTeamTask(req, res); // Call the controller to handle the response
  } catch (error) {
    console.log(error);
  }
});

tasksRouter.get("/fetchTasks/:id/:orgId", async (req, res) => {
  await fetchTasks(req, res);
});

export default tasksRouter;
