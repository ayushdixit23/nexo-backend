import mongoose, { Document, Schema } from 'mongoose';

interface IMessage extends Document {
  convId: string;
  senderid: mongoose.Schema.Types.ObjectId;
  receiverid: mongoose.Schema.Types.ObjectId;
  message: string;
  date: Date;
}

const messageSchema = new Schema<IMessage>({
  convId: { type: String, required: true },
  senderid: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverid: { type: Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
