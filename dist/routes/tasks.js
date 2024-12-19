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
import { createIndividualTask, createTeamTask, fetchIndividualTasks, fetchTasks, updateTasksStatus, } from "../controllers/tasks.js";
const tasksRouter = express.Router();
tasksRouter.post("/createIndividualTask/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createIndividualTask(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
tasksRouter.post("/createTeamTask/:id/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createTeamTask(req, res); // Call the controller to handle the response
    }
    catch (error) {
        console.log(error);
    }
}));
tasksRouter.get("/fetchTasks/:id/:orgId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield fetchTasks(req, res);
}));
tasksRouter.post("/updateTasksStatus/:taskId/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield updateTasksStatus(req, res);
}));
tasksRouter.get("/fetchIndividualTasks/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield fetchIndividualTasks(req, res);
}));
export default tasksRouter;
//# sourceMappingURL=tasks.js.map