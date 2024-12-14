import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the User schema
export interface Team extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  organisation: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  creator: mongoose.Schema.Types.ObjectId;
  tasks: mongoose.Schema.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema using the interface
const teamSchema: Schema<Team> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organisation",
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ]
},{
  timestamps: true});

// Create the model
const Team: Model<Team> = mongoose.model<Team>("Team", teamSchema);

export default Team;
