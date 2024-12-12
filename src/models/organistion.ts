import mongoose, { Document, Schema, Model, ObjectId } from "mongoose";

// Define an interface for the User schema
export interface IOrganisation extends Document {
  _id: ObjectId;
  name: string;
  dp?: string;
  creator: mongoose.Schema.Types.ObjectId;
  moderators: mongoose.Schema.Types.ObjectId[];
  members: mongoose.Schema.Types.ObjectId[];
  teams: mongoose.Schema.Types.ObjectId[];
  code: string;
  storage: mongoose.Schema.Types.ObjectId[];
  storageused: number;
}

// Create the schema using the interface
const organisationSchema: Schema<IOrganisation> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  dp: {
    type: String,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  moderators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
  code: {
    type: String,
  },
  storage: [{ type: mongoose.Schema.Types.ObjectId, ref: "Storage" }],
  storageused: { type: Number, default: 0 }, //in Gbs
});

const Organisation: Model<IOrganisation> = mongoose.model<IOrganisation>(
  "Organisation",
  organisationSchema
);

export default Organisation;
