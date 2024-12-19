import mongoose, { Schema } from 'mongoose';
const messageSchema = new Schema({
    convId: { type: String, required: true },
    senderid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverid: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);
export default Message;
//# sourceMappingURL=message.js.map