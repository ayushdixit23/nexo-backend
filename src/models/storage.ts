import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the User schema
export interface IStorage extends Document {
    orgid: mongoose.Schema.Types.ObjectId;
    userid: mongoose.Schema.Types.ObjectId;
    filename: string;
    date: Date;
    type: string;
    size: number;
}

// Create the schema using the interface
const storageSchema: Schema<IStorage> = new mongoose.Schema(
  {
    orgid: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    filename: { type: String },
    date: { type: Date, default: Date.now },
    type: { type: String },
    size: { type: Number, default: 0 }, //kb
   
  },
  { timestamps: true }
);

const Storage: Model<IStorage> = mongoose.model<IStorage>(
  "Storage",
  storageSchema
);

export default Storage;
