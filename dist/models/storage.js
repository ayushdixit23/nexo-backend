import mongoose from "mongoose";
// Create the schema using the interface
const storageSchema = new mongoose.Schema({
    orgid: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    filename: { type: String },
    date: { type: Date, default: Date.now },
    type: { type: String },
    size: { type: Number, default: 0 }, //kb
}, { timestamps: true });
const Storage = mongoose.model("Storage", storageSchema);
export default Storage;
//# sourceMappingURL=storage.js.map