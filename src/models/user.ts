import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the User schema
export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  fullname: string;
  email: string;
  password: string;
  profilepic?: string;
  organisations: mongoose.Schema.Types.ObjectId[];
  teams: mongoose.Schema.Types.ObjectId[];
  tasks: mongoose.Schema.Types.ObjectId[];
  storage: mongoose.Schema.Types.ObjectId[];
  storageused: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the schema using the interface
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilepic: {
      type: String,
    },
    organisations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Organisation" },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    storage: [{ type: mongoose.Schema.Types.ObjectId, ref: "Storage" }],
    storageused: { type: Number, default: 0 }, //in Gbs
  },
  { timestamps: true }
);

// Create the model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
