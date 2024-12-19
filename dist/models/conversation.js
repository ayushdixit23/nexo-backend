import mongoose, { Schema, model } from "mongoose";
const { ObjectId } = mongoose.Schema;
const conversationSchema = new Schema({
    members: [{ type: ObjectId, ref: "User" }],
    message: [{ type: ObjectId, ref: "Message" }],
}, { timestamps: true });
const Conversation = model("Conversation", conversationSchema);
export default Conversation;
//# sourceMappingURL=conversation.js.map