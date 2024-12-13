import mongoose, { Document, Schema, Model, model } from "mongoose";

const { ObjectId } = mongoose.Schema;

interface IConversation extends Document {
  members: mongoose.Types.ObjectId[];
  message: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    members: [{ type: ObjectId, ref: "User" }],
    message: [{ type: ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> = model<IConversation>(
  "Conversation",
  conversationSchema
);

export default Conversation;
