import mongoose from "mongoose";
// Create the schema using the interface
const tasksSchema = new mongoose.Schema({
    text: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled", "in progress"],
        default: "pending",
    },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
    type: { type: String, enum: ["team", "self"], default: "self" },
    assignedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });
const Task = mongoose.model("Task", tasksSchema);
export default Task;
//# sourceMappingURL=tasks.js.map