var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/user.js";
import Task from "../models/tasks.js";
import Organisation from "../models/organistion.js";
import Team from "../models/team.js";
import { addProfilePicURL } from "../utils/helper.js";
export const createIndividualTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { task, orgId } = req.body;
        const user = yield User.exists({ _id: id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        const newTask = new Task({
            text: task,
            type: "self",
            creator: id,
            orgId: orgId ? orgId : undefined,
        });
        yield newTask.save();
        yield User.updateOne({ _id: id }, { $push: { tasks: newTask._id } });
        return res.status(200).json({
            success: true,
            message: "Task created successfully.",
            taskId: newTask._id,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});
export const createTeamTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, orgId } = req.params;
        const { task, selectedTeams } = req.body;
        // Verify user existence
        const userExists = yield User.exists({ _id: id });
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        // Verify organisation existence
        const organisation = yield Organisation.findById(orgId);
        if (!organisation) {
            return res.status(404).json({
                success: false,
                message: "Organisation not found.",
            });
        }
        // Create new task
        const newTask = new Task({
            text: task,
            type: "team",
            creator: id,
            orgId: organisation._id,
            assignedTeams: selectedTeams,
        });
        // Fetch all team members in a single query
        const teams = yield Team.find({ _id: { $in: selectedTeams } }).select("members");
        const memberIds = teams.reduce((acc, team) => {
            if (team.members)
                acc.push(...team.members);
            return acc;
        }, []);
        yield Promise.all([
            User.updateMany({ _id: { $in: memberIds }, tasks: { $ne: newTask._id } }, { $push: { tasks: newTask._id } }),
            Team.updateMany({ _id: { $in: selectedTeams }, tasks: { $ne: newTask._id } }, { $push: { tasks: newTask._id } }),
        ]);
        // Save the task
        yield newTask.save();
        return res.status(200).json({
            success: true,
            message: "Task created successfully.",
            taskId: newTask._id,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});
export const fetchTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, orgId } = req.params;
        const user = yield User.findById(id).populate("tasks").lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        // self tasks
        const tasks = yield Task.find({ _id: { $in: user.tasks }, orgId: orgId })
            .populate("creator", "fullname profilepic email")
            .lean();
        if (!tasks) {
            return res.status(204).json({
                success: false,
                message: "Tasks not found.",
                tasks: [],
            });
        }
        const formattedTasks = tasks.map((task) => {
            return Object.assign(Object.assign({}, task), { id: task._id, creator: {
                    // @ts-ignore
                    id: task.creator._id,
                    // @ts-ignore
                    fullname: task.creator.fullname,
                    // @ts-ignore
                    profilepic: addProfilePicURL(task.creator.profilepic || ""),
                    // @ts-ignore
                    email: task.creator.email,
                } });
        });
        // Fetch teams first
        const teams = yield Team.find({
            _id: { $in: user.teams },
            organisation: orgId,
        })
            .populate("members", "fullname profilepic email")
            .lean();
        const formattedTeams = yield Promise.all(teams.map((team) => __awaiter(void 0, void 0, void 0, function* () {
            // For each team, fetch the tasks related to this team
            const teamTasks = yield Task.find({
                assignedTeams: team._id,
                orgId: orgId,
                type: "team",
            })
                .populate("creator", "fullname profilepic email")
                .lean();
            const formattedTeamTasks = teamTasks.map((task) => {
                return Object.assign(Object.assign({}, task), { id: task._id, creator: {
                        // @ts-ignore
                        id: task.creator._id,
                        // @ts-ignore
                        fullname: task.creator.fullname,
                        // @ts-ignore
                        profilepic: addProfilePicURL(task.creator.profilepic || ""),
                        // @ts-ignore
                        email: task.creator.email,
                    } });
            });
            return Object.assign(Object.assign({}, team), { id: team._id, tasks: formattedTeamTasks, members: team.members.map((member) => ({
                    // @ts-ignore
                    id: member._id,
                    // @ts-ignore
                    fullname: member.fullname,
                    // @ts-ignore
                    profilepic: addProfilePicURL(member.profilepic || ""),
                    // @ts-ignore
                    email: member.email,
                })) });
        })));
        return res.status(200).json({
            success: true,
            message: "Tasks fetched successfully.",
            mytasks: formattedTasks,
            teams: formattedTeams,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});
export const updateTasksStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("first");
    try {
        const { taskId, userId } = req.params;
        const { status } = req.body;
        // Find the task by ID
        const user = yield User.exists({ _id: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        const task = yield Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found.",
            });
        }
        if (task.creator.toString() !== userId) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized to update this task.",
            });
        }
        // Update the task status
        task.status = status;
        // Save the updated task
        yield task.save();
        return res.status(200).json({
            success: true,
            message: "Task status updated successfully.",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});
export const fetchIndividualTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield User.findById(id).populate("tasks").lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        // self tasks
        const tasks = yield Task.find({ _id: { $in: user.tasks } })
            .populate("creator", "fullname profilepic email")
            .lean();
        if (!tasks) {
            return res.status(204).json({
                success: false,
                message: "Tasks not found.",
                tasks: [],
            });
        }
        const formattedTasks = tasks.map((task) => {
            return Object.assign(Object.assign({}, task), { id: task._id, creator: {
                    // @ts-ignore
                    id: task.creator._id,
                    // @ts-ignore
                    fullname: task.creator.fullname,
                    // @ts-ignore
                    profilepic: addProfilePicURL(task.creator.profilepic || ""),
                    // @ts-ignore
                    email: task.creator.email,
                } });
        });
        return res.status(200).json({
            success: true,
            tasks: formattedTasks,
            message: "Tasks fetched successfully.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
});
//# sourceMappingURL=tasks.js.map