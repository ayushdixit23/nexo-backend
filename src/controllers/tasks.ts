import { Request, Response } from "express";
import User from "../models/user";
import Task from "../models/tasks";
import Organisation from "../models/organistion";
import Team from "../models/team";
import mongoose from "mongoose";
import { addProfilePicURL } from "../utils/helper";

export const createIndividualTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { task, orgId } = req.body;
    const user = await User.exists({ _id: id });
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

    await newTask.save();
    await User.updateOne({ _id: id }, { $push: { tasks: newTask._id } });

    return res.status(200).json({
      success: true,
      message: "Task created successfully.",
      taskId: newTask._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const createTeamTask = async (req: Request, res: Response) => {
  try {
    const { id, orgId } = req.params;
    const { task, selectedTeams } = req.body;

    // Verify user existence
    const userExists = await User.exists({ _id: id });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify organisation existence
    const organisation = await Organisation.findById(orgId);
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
    const teams = await Team.find({ _id: { $in: selectedTeams } }).select(
      "members"
    );

    const memberIds = teams.reduce(
      (acc: mongoose.Schema.Types.ObjectId[], team) => {
        if (team.members) acc.push(...team.members);
        return acc;
      },
      []
    );

    await Promise.all([
      User.updateMany(
        { _id: { $in: memberIds }, tasks: { $ne: newTask._id } },
        { $push: { tasks: newTask._id } }
      ),
      Team.updateMany(
        { _id: { $in: selectedTeams }, tasks: { $ne: newTask._id } },
        { $push: { tasks: newTask._id } }
      ),
    ]);

    // Save the task
    await newTask.save();

    return res.status(200).json({
      success: true,
      message: "Task created successfully.",
      taskId: newTask._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const fetchTasks = async (req: Request, res: Response) => {
  try {
    const { id, orgId } = req.params;
    const user = await User.findById(id).populate("tasks").lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // self tasks
    const tasks = await Task.find({ _id: { $in: user.tasks }, orgId: orgId })
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
      return {
        ...task,
        id: task._id,
        creator: {
          // @ts-ignore
          id: task.creator._id,
          // @ts-ignore
          fullname: task.creator.fullname,
          // @ts-ignore
          profilepic: addProfilePicURL(task.creator.profilepic || ""),
          // @ts-ignore
          email: task.creator.email,
        },
      };
    });

    // Fetch teams first
    const teams = await Team.find({
      _id: { $in: user.teams },
      organisation: orgId,
    })
      .populate("members", "fullname profilepic email")
      .lean();

    const formattedTeams = await Promise.all(
      teams.map(async (team) => {
        // For each team, fetch the tasks related to this team
        const teamTasks = await Task.find({
          assignedTeams: team._id,
          orgId: orgId,
          type: "team",
        })
          .populate("creator", "fullname profilepic email")
          .lean();

        const formattedTeamTasks = teamTasks.map((task) => {
          return {
            ...task,
            id: task._id,
            creator: {
              // @ts-ignore
              id: task.creator._id,
              // @ts-ignore
              fullname: task.creator.fullname,
              // @ts-ignore
              profilepic: addProfilePicURL(task.creator.profilepic || ""),
              // @ts-ignore
              email: task.creator.email,
            },
          };
        });

        return {
          ...team,
          id: team._id,
          tasks: formattedTeamTasks,
          members: team.members.map((member) => ({
            // @ts-ignore
            id: member._id,
            // @ts-ignore
            fullname: member.fullname,
            // @ts-ignore
            profilepic: addProfilePicURL(member.profilepic || ""),
            // @ts-ignore
            email: member.email,
          })),
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully.",
      mytasks: formattedTasks,
      teams: formattedTeams,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const updateTasksStatus = async (req: Request, res: Response) => {
  console.log("first");
  try {
    const { taskId, userId } = req.params;
    const { status } = req.body;

    // Find the task by ID

    const user = await User.exists({ _id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const task = await Task.findById(taskId);

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
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const fetchIndividualTasks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("tasks").lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // self tasks
    const tasks = await Task.find({ _id: { $in: user.tasks } })
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
      return {
        ...task,
        id: task._id,
        creator: {
          // @ts-ignore
          id: task.creator._id,
          // @ts-ignore
          fullname: task.creator.fullname,
          // @ts-ignore
          profilepic: addProfilePicURL(task.creator.profilepic || ""),
          // @ts-ignore
          email: task.creator.email,
        },
      };
    });

    return res.status(200).json({
      success: true,
      tasks: formattedTasks,
      message: "Tasks fetched successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
