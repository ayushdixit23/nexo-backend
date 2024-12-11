import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the User schema
export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  fullname: string;
  email: string;
  password: string;
  profilepic?: string;
  organisations: mongoose.Schema.Types.ObjectId[];
  team: mongoose.Schema.Types.ObjectId[];
}

// Create the schema using the interface
const userSchema: Schema<IUser> = new mongoose.Schema({
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
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
});

// Create the model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
