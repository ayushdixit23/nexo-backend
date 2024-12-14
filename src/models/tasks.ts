import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the User schema
export interface ITasks extends Document {
  text: string;
  creator: mongoose.Schema.Types.ObjectId;
  status: string;
  type: string;
  orgId: mongoose.Schema.Types.ObjectId;
 
  assignedTeams: mongoose.Schema.Types.ObjectId[];
}

// Create the schema using the interface
const tasksSchema: Schema<ITasks> = new mongoose.Schema(
  {
    text: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "inprogress"],
      default: "pending",
    },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
    type: { type: String, enum: ["team", "self"], default: "self" },
  
    assignedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Task: Model<ITasks> = mongoose.model<ITasks>("Task", tasksSchema);

export default Task;
